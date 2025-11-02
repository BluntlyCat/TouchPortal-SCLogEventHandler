import fs from 'fs';
import {Client} from "touchportal-api";
import {ScLogEventHandler} from "./events/ScLogEventHandler";

export class FileWatcher {
    tpClient: Client;
    timeout: any;

    readInterval = 500;
    logFilePath = '';
    lastFileSize = 0;
    fileBirthTime: Date;

    pluginId = '';
    scLogEventHandler: ScLogEventHandler;

    constructor(tpClient: Client, logFilePath: string, pluginId: string, readInterval: number, eventHandler: ScLogEventHandler) {
        this.tpClient = tpClient;
        this.logFilePath = logFilePath;
        this.pluginId = pluginId;
        this.readInterval = readInterval;

        this.scLogEventHandler = eventHandler;
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
        this.stopWatchingFile()

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
            try {
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
            } catch (err) {
                this.tpClient.logIt('ERROR', 'An error occurred reading the log file');
                this.watchLogFile();
            }
        }, this.readInterval);
    }
}