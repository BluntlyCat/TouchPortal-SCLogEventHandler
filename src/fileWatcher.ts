import fs from 'fs';
import {Client} from "touchportal-api";
import {ScLogEventHandler} from "./events/ScLogEventHandler";
import {KillEvent} from "./events/KillEvent";

export class FileWatcher {
    private tpClient: Client;
    private timeout: any;

    private readonly readInterval: number;
    private readonly logFilePath: string;
    private lastFileSize = 0;
    private fileBirthTime: Date;

    private readonly pluginId: string;
    private scLogEventHandler: ScLogEventHandler;
    private killEvent;

    constructor(tpClient: Client, logFilePath: string, pluginId: string, readInterval: number, eventHandler: ScLogEventHandler) {
        this.tpClient = tpClient;
        this.logFilePath = logFilePath;
        this.pluginId = pluginId;
        this.readInterval = readInterval;

        this.scLogEventHandler = eventHandler;
        this.killEvent = eventHandler.eventHandlers.kill as KillEvent;
        this.fileBirthTime = new Date("1970-01-01 00:00:00");

        tpClient.logIt("DEBUG", `Created instance to watch file at ${this.logFilePath}`);
    }

    stopWatchingFile = () => {
        if (this.timeout) {
            this.tpClient.logIt("DEBUG", `Clear interval with ID ${this.timeout}`);
            clearInterval(this.timeout);
        }
    }

    watchLogFile = () => {
        this.stopWatchingFile();
        this.killEvent.clearHistory();

        if (!fs.existsSync(this.logFilePath)) {
            this.tpClient.logIt('ERROR', `Log file at ${this.logFilePath} does not exist`);
            this.tpClient.sendNotification(
                `${this.pluginId}_logfile_not_found`,
                'SC Game log file not found',
                `Log file at ${this.logFilePath} does not exist`,
                [{
                    id: `${this.pluginId}_logfile_not_found`,
                    title: "Go to plugin settings and check if root path and environment are correct"
                }]
            );
        }

        this.timeout = setInterval(() => {
            fs.stat(this.logFilePath, (err, stats) => {
                if (err) {
                    this.tpClient.logIt("ERROR", err.message);
                    return;
                }

                if (
                    this.fileBirthTime === null
                    || this.fileBirthTime.getTime() < stats.birthtime.getTime()
                    || stats.size < this.lastFileSize
                ) {
                    this.tpClient.logIt("DEBUG", "New logfile was (re-)created, resetting read offset");
                    this.fileBirthTime = stats.birthtime;
                    this.lastFileSize = 0;
                    this.killEvent.clearHistory();
                }

                if (stats.size > this.lastFileSize) {
                    const readStream = fs.createReadStream(this.logFilePath, {
                        start: this.lastFileSize,
                        end: stats.size
                    });

                    let buffer = '';

                    readStream.on('data', (chunk) => {
                        buffer += chunk.toString();
                    });

                    readStream.on('end', () => {
                        const lines = buffer.split(/\r?\n/);
                        lines.forEach((line) => {
                            if (!line) {
                                return;
                            }

                            Object.entries(this.scLogEventHandler.eventHandlers).forEach(([eventKey, handler]) => {
                                if (line.includes(eventKey)) {
                                    handler.handleEvent(line);
                                }
                            });
                        });

                        this.lastFileSize = stats.size;
                    });
                }
            });
        }, this.readInterval);
    }
}