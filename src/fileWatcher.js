const fs = require('fs');
const ScLogEventHandler = require('./ScLogEventHandler');

module.exports = class FileWatcher {
    tpClient = null;
    timeout = null;

    readInterval = 500;
    logFilePath = '';
    lastFileSize = 0;
    fileBirthTime = null;

    pluginId = '';
    scLogEventHandler = null;

    constructor(tpClient, logFilePath, pluginId, readInterval) {
        this.tpClient = tpClient;
        this.logFilePath = logFilePath;
        this.pluginId = pluginId;
        this.readInterval = readInterval;

        this.scLogEventHandler = new ScLogEventHandler(tpClient);

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

                                Object.keys(this.scLogEventHandler.eventHandlers).forEach(keyword => {
                                    if (line.includes(keyword)) {
                                        this.scLogEventHandler.eventHandlers[keyword](line);
                                    }
                                });
                            });

                            this.lastFileSize = stats.size;
                        });
                    }
                });
            } catch (err) {
                this.tpClient.logIt('ERROR', err.message || 'An error occurred reading the log file');
                this.watchLogFile();
            }
        }, this.readInterval);
    }
}