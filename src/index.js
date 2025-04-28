/*
 * This file includes code from Jameson Allen
 */
const TouchPortalApi = require("touchportal-api");
const {open} = require("out-url");
const Constants = require('./consts');

const FileWatcher = require('./FileWatcher');

// Create an instance of the Touch Portal Client
const TPClient = new TouchPortalApi.Client();

// Define a pluginId, matches your entry.tp file
const pluginId = Constants.pluginId;

let fileWatcher = null;

const pluginSettings = {
    [Constants.scRootPath]: '',
    [Constants.scEnvironment]: 'LIVE',
    [Constants.scGameLogFile]: 'Game.log',
    [Constants.scReadLogInterval]: 1000,
}

const initFileWatcher = () => {
    if (fileWatcher) {
        fileWatcher.stopWatchingFile();
    }

    fileWatcher = new FileWatcher(
        TPClient,
        `${pluginSettings[Constants.scRootPath]}\\${pluginSettings[Constants.scEnvironment]}\\${pluginSettings[Constants.scGameLogFile]}`,
        pluginId,
        +pluginSettings[Constants.scReadLogInterval]
    );

    fileWatcher.watchLogFile();
}

TPClient.on("Settings", (data) => {
    TPClient.logIt("DEBUG", "Settings: New Settings from Touch-Portal");
    data.forEach((setting) => {
        let key = Object.keys(setting)[0]
        pluginSettings[key] = setting[key]
        TPClient.logIt("DEBUG", `Settings: Setting received for | ${key} |`)
    });

    initFileWatcher();
})

TPClient.on("Info", data => {
    TPClient.logIt("DEBUG", "Info: received initial connect from Touch-Portal")
})

TPClient.on("Update", (curVersion, newVersion) => {
    TPClient.logIt("DEBUG", "Update: there is an update curVersion:", curVersion, "newVersion:", newVersion)
    TPClient.sendNotification(
        `${pluginId}_update_notification_${newVersion}`,
        `SC Event Handler Plugin Update Available`,
        `\nNew Version: ${newVersion}\n\nPlease updated to get the latest bug fixes and new features\n\nCurrent Installed Version: ${curVersion}`,
        [{id: `${pluginId}_update_notification_go_to_download`, title: "Go To Download Location"}]
    );
});

TPClient.on("NotificationClicked", (data) => {
    if (data.optionId === `${pluginId}_update_notification_go_to_download`) {
        void open(Constants.releaseUrl);
    }
});

TPClient.connect({pluginId, updateUrl: Constants.updateUrl});
