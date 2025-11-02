/*
 * This file includes code from Jameson Allen
 */

import TouchPortalAPI from "touchportal-api";
import {open} from 'out-url';
import {FileWatcher} from './fileWatcher';
import {ScLogEventHandler} from './events/ScLogEventHandler';
import {
    PLUGIN_ID,
    RELEASE_URL,
    SC_ENVIRONMENT,
    SC_GAME_LOG_FILE,
    SC_READ_LOG_INTERVAL,
    SC_ROOT_PATH, UPDATE_URL
} from "./constants";
import {KillEvent} from "./events/KillEvent";

// Create an instance of the Touch Portal Client
const tpClient = new TouchPortalAPI.Client();

// Define a pluginId, matches your entry.tp file
let fileWatcher: FileWatcher;
let scLogEventHandler: ScLogEventHandler;
const pluginSettings: Record<string, any> = {};

const initFileWatcher = () => {
    if (fileWatcher) {
        fileWatcher.stopWatchingFile();
    }

    scLogEventHandler = new ScLogEventHandler(tpClient);

    fileWatcher = new FileWatcher(
        tpClient,
        `${pluginSettings[SC_ROOT_PATH]}\\${pluginSettings[SC_ENVIRONMENT]}\\${pluginSettings[SC_GAME_LOG_FILE]}`,
        PLUGIN_ID,
        +pluginSettings[SC_READ_LOG_INTERVAL],
        scLogEventHandler
    );

    try {
        fileWatcher.watchLogFile();
    } catch(err) {
        tpClient.logIt('ERROR', 'An error occurred reading the log file');
        fileWatcher.watchLogFile();
    }
}

tpClient.on("Settings", (data) => {
    tpClient.logIt("DEBUG", "Settings: New Settings from Touch-Portal");
    data.forEach((setting: any) => {
        let key = Object.keys(setting)[0] || '';
        pluginSettings[key] = setting[key]
        tpClient.logIt("DEBUG", `Settings: Setting received for | ${key} |`)
    });

    initFileWatcher();
})

tpClient.on("Info", _data => {
    tpClient.logIt("DEBUG", "Info: received initial connect from Touch-Portal")
})

tpClient.on("Update", (curVersion: string, newVersion: string) => {
    tpClient.logIt("DEBUG", "Update: there is an update curVersion:", curVersion, "newVersion:", newVersion)
    tpClient.sendNotification(
        `${PLUGIN_ID}_update_notification_${newVersion}`,
        `SC Event Handler Plugin Update Available`,
        `\nNew Version: ${newVersion}\n\nPlease update to get the latest bug fixes and new features\n\nCurrent Installed Version: ${curVersion}`,
        [{id: `${PLUGIN_ID}_update_notification_go_to_download`, title: "Go To Download Location"}]
    );
});

tpClient.on("NotificationClicked", (data) => {
    if (data.optionId === `${PLUGIN_ID}_update_notification_go_to_download`) {
        void open(pluginSettings[RELEASE_URL]);
    }
});

tpClient.on("Action", (actionData) => {
    tpClient.logIt("DEBUG", "Action Received", actionData);

    if (actionData.actionId === "sc_next_kill_msg") {
        const killHandler = scLogEventHandler.eventHandlers.kill as KillEvent;
        if (killHandler.hasKillEvents) {
            killHandler.nextMessage();
        }
    } else if (actionData.actionId === "sc_prev_kill_msg") {
        const killHandler = scLogEventHandler.eventHandlers.kill as KillEvent;
        if (killHandler.hasKillEvents) {
            killHandler.previousMessage();
        }
    }
});

tpClient.connect({pluginId: PLUGIN_ID, updateUrl: pluginSettings[UPDATE_URL]});
