import { Client } from 'touchportal-api';
import { createReadStream, existsSync, statSync } from 'node:fs';
import EventEmitter from 'node:events';
import { Line } from '../events/types';

export class FileWatcher extends EventEmitter {
    private _birthtimeMs: number;
    private _lastSize = 0;
    private _tailBuffer = '';
    private _timer?: NodeJS.Timeout;
    private _canRead = true;

    constructor(
        private readonly _tpClient: Client,
        private readonly _logFilePath: string,
        private readonly _encoding: BufferEncoding,
        private readonly _readInterval: number,
    ) {
        super();
        _tpClient.logIt('DEBUG', `Created instance to watch file at ${this._logFilePath}`);
    }

    public start(): void {
        if (!this.logFileExists()) {
            return;
        }

        const stat = statSync(this._logFilePath);
        this._birthtimeMs = stat.birthtimeMs;
        this._lastSize = 0;
        this._tailBuffer = '';

        this._timer = setInterval(() => this.tick().then(() => this._canRead = true).catch(err => this.emit('error', err)), this._readInterval);
        this.tick().then(() => this._canRead = true).catch(err => this.emit('error', err));
    }

    public stop() {
        if (this._timer) clearInterval(this._timer);
        this._timer = undefined;
    }

    private async tick() {
        if (!this._canRead) {
            this._tpClient.logIt('DEBUG', `Skip reading log file`);
            return;
        }

        this._canRead = false;
        const stat = statSync(this._logFilePath);
        if (stat.birthtimeMs > this._birthtimeMs || stat.size < this._lastSize) {
            this._birthtimeMs = stat.birthtimeMs;
            this._lastSize = 0;
            this._tailBuffer = '';
            this.emit('rotate');
        }

        if (stat.size <= this._lastSize) {
            return;
        }

        const start = this._lastSize;
        const end = stat.size - 1;

        await new Promise<void>((resolve, reject) => {
            const stream = createReadStream(this._logFilePath, {start, end, encoding: this._encoding});
            let chunk = '';

            stream.on('data', d => (chunk += d));
            stream.on('error', reject);
            stream.on('end', () => {
                let buf = (this._tailBuffer + chunk).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                this._tailBuffer = '';

                const parts = buf.split('\n');
                const fullLines = buf.endsWith('\n') ? parts : parts.slice(0, -1);

                if (!buf.endsWith('\n')) {
                    this._tailBuffer = parts[parts.length - 1] ?? '';
                }

                let rollingOffset = end - Buffer.byteLength(chunk, this._encoding) + 1;
                for (const line of fullLines) {
                    if (!line) {
                        rollingOffset += 1;
                        continue;
                    }
                    const bytes = Buffer.byteLength(line + '\n', this._encoding);
                    const byteEndOffset = rollingOffset + bytes - 1;
                    this.emit('line', {str: line, byteEndOffset} as Line);
                    rollingOffset += bytes;
                }

                this._lastSize = stat.size;
                this.emit('readEnd');
                resolve();
            });
        });
    }

    private logFileExists(): boolean {
        if (!existsSync(this._logFilePath)) {
            this._tpClient.logIt('ERROR', `Log file does not exist at ${this._logFilePath}`);
            return false;
        }

        return true;
    }
}