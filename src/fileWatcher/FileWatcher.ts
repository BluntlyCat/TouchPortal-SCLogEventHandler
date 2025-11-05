import { Client } from 'touchportal-api';
import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import EventEmitter from 'node:events';
import { Line } from '../events/types';

export class FileWatcher extends EventEmitter {
    private birthtimeMs: number;
    private lastSize = 0;
    private tailBuffer = '';
    private timer?: NodeJS.Timeout;
    private watcher?: ReturnType<typeof watch>;

    constructor(
        private readonly tpClient: Client,
        private readonly logFilePath: string,
        private readonly encoding: BufferEncoding,
        private readonly readInterval: number,
    ) {
        super();
        tpClient.logIt('DEBUG', `Created instance to watch file at ${this.logFilePath}`);
    }

    public start(): void {
        if (!this.logFileExists()) {
            return;
        }

        const stat = statSync(this.logFilePath);
        this.birthtimeMs = stat.birthtimeMs;
        this.lastSize = 0;
        this.tailBuffer = '';

        this.watcher = watch(this.logFilePath, {persistent: true}, () => {
            this.tick().catch(err => this.emit('error', err));
        });

        //this.timer = setInterval(() => this.tick().catch(err => this.emit('error', err)), this.readInterval);
        this.tick().catch(err => this.emit('error', err));
    }

    public stop() {
        if (this.watcher) this.watcher.close();
        if (this.timer) clearInterval(this.timer);
        this.watcher = undefined;
        this.timer = undefined;
    }

    private async tick() {
        const stat = statSync(this.logFilePath);
        if (stat.birthtimeMs > this.birthtimeMs || stat.size < this.lastSize) {
            this.birthtimeMs = stat.birthtimeMs;
            this.lastSize = 0;
            this.tailBuffer = '';
            this.emit('rotate');
        }

        if (stat.size <= this.lastSize) {
            return;
        }

        const start = this.lastSize;
        const end = stat.size;

        await new Promise<void>((resolve, reject) => {
            const stream = createReadStream(this.logFilePath, {start, end, encoding: this.encoding});
            let chunk = '';

            stream.on('data', d => (chunk += d));
            stream.on('error', reject);
            stream.on('end', () => {
                let buf = (this.tailBuffer + chunk).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                this.tailBuffer = '';

                const parts = buf.split('\n');
                const fullLines = buf.endsWith('\n') ? parts : parts.slice(0, -1);

                if (!buf.endsWith('\n')) {
                    this.tailBuffer = parts[parts.length - 1] ?? '';
                }

                let rollingOffset = end - Buffer.byteLength(chunk, this.encoding) + 1;
                for (const line of fullLines) {
                    if (!line) {
                        rollingOffset += 1;
                        continue;
                    }
                    const bytes = Buffer.byteLength(line + '\n', this.encoding);
                    const byteEndOffset = rollingOffset + bytes - 1;
                    this.emit('line', {str: line, byteEndOffset} as Line);
                    rollingOffset += bytes;
                }

                this.lastSize = stat.size;
                resolve();
            });
        });
    }

    private logFileExists(): boolean {
        if (!existsSync(this.logFilePath)) {
            this.tpClient.logIt('ERROR', `Log file does not exist at ${this.logFilePath}`);
            return false;
        }

        return true;
    }
}