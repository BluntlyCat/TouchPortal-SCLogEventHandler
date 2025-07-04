/*
 * This file includes code from Jameson Allen
 */
const TouchPortalApi = require("touchportal-api");
const {open} = require("out-url");
const Constants = require('./consts');

const FileWatcher = require('./FileWatcher');
const SCWallet = require("./SCWallet");

// Create an instance of the Touch Portal Client
const TPClient = new TouchPortalApi.Client();

// Define a pluginId, matches your entry.tp file
const pluginId = Constants.pluginId;

let fileWatcher = null;
let scWallet = null;

const pluginSettings = {
    [Constants.scRootPath]: '',
    [Constants.scEnvironment]: 'LIVE',
    [Constants.scGameLogFile]: 'Game.log',
    [Constants.scReadLogInterval]: 500,
    [Constants.scTotalMoney]: 0,
    [Constants.scSquadMoney]: 0,
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

const initScWallet =  () => {
    scWallet = new SCWallet(
        TPClient,
        pluginId,
        pluginSettings[Constants.scTotalMoney],
        pluginSettings[Constants.scSquadMoney],
    );
}

TPClient.on("Settings", (data) => {
    TPClient.logIt("DEBUG", "Settings: New Settings from Touch-Portal");
    data.forEach((setting) => {
        let key = Object.keys(setting)[0]
        pluginSettings[key] = setting[key]
        TPClient.logIt("DEBUG", `Settings: Setting received for | ${key} |`)
    });

    initFileWatcher();
    initScWallet();
})

TPClient.on("Info", _data => {
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

TPClient.on("Action", (actionData) => {
    TPClient.logIt("DEBUG", "Action: Received", actionData);

    if (actionData.actionId === "sc_leh_action_add_money") {
        const newValue = parseInt(actionData.data.find(d => d.id === "new_sc_money_value")?.value);
        const target = actionData.data.find(d => d.id === "sc_target_wallet")?.value;

        if (isNaN(newValue)) {
            TPClient.logIt("ERROR", "Add Money: Invalid number value received");
            return;
        }

        // Alte Werte aus pluginSettings holen
        const prevTotal = parseInt(pluginSettings[Constants.scTotalMoney]) || 0;
        const prevSquad = parseInt(pluginSettings[Constants.scSquadMoney]) || 0;

        const earning = newValue - prevTotal;

        // Werte aktualisieren
        pluginSettings[Constants.scTotalMoney] = newValue;
        if (target === "Squad") {
            pluginSettings[Constants.scSquadMoney] = prevSquad + earning;
        }

        // Persönliches Vermögen = Total - Squad
        const personal = newValue - pluginSettings[Constants.scSquadMoney];
        pluginSettings[Constants.scPersonalMoney] = personal;

        // States an Touch Portal zurücksenden
        TPClient.stateUpdate("sc_leh_total_money", newValue);
        TPClient.stateUpdate("sc_leh_squad_money", pluginSettings[Constants.scSquadMoney]);

        TPClient.logIt("INFO", `Add Money: New Total: ${newValue}, Squad: ${pluginSettings[Constants.scSquadMoney]}, Personal: ${personal}`);
    }
});

TPClient.connect({pluginId, updateUrl: Constants.updateUrl});
