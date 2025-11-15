/*
 * This file includes code from Jameson Allen
 */
import TouchPortalAPI from 'touchportal-api';
import { open } from 'out-url';
import { FileWatcher } from './fileWatcher/FileWatcher';
import {
    PLUGIN_ID,
    RELEASE_URL,
    SC_ENVIRONMENT,
    SC_GAME_LOG_FILE,
    SC_READ_LOG_INTERVAL,
    SC_BLACKLIST,
    SC_ROOT_PATH,
    UPDATE_URL,
    SC_DATE_LOCALE,
    SC_TIMEZONE,
    SC_LANGUAGE,
    SC_WALLETS,
    SC_WALLET_UPDATE_INTERVAL,
} from './constants';
import { KillEvent } from './events/kill/KillEvent';
import { EventRouter } from './events/EventRouter';
import { HelmetEvent } from './events/HelmetEvent';
import { ActionRouter } from './actions/ActionRouter';
import { NextKillMessage } from './actions/NextKillMessage';
import { PrevKillMessage } from './actions/PrevKillMessage';
import { KillHistory } from './events/kill/KillHistory';
import { KillEventView } from './events/kill/KillEventView';
import { Blacklist } from './events/kill/Blacklist';
import { Languages } from './translations';
import { Backspace } from './actions/Backspace';
import { ReceiveDigit } from './actions/ReceiveDigit';
import { SetTargetWallet } from './actions/SetTargetWallet';
import { Submit } from './actions/Submit';
import { ClearWallet } from './actions/ClearWallet';
import { ResetInput } from './actions/ResetInput';
import { JsonWallet } from './actions/JsonWallet';
import { json } from 'node:stream/consumers';
import { WalletView } from './actions/WalletView';

// Create an instance of the Touch Portal Client
const tpClient = new TouchPortalAPI.Client();

// Define a pluginId, matches your entry.tp file
let fileWatcher: FileWatcher;
let eventRouter: EventRouter;
let actionRouter: ActionRouter;
let killEvent: KillEvent;
let killEventView: KillEventView;
let walletView: WalletView;

let killHistory: KillHistory;

const pluginSettings: Record<string, any> = {};

const initPlugin = () => {
    killHistory = new KillHistory(tpClient, pluginSettings[SC_LANGUAGE] as Languages);
    killEventView = new KillEventView(tpClient, killHistory, pluginSettings[SC_DATE_LOCALE], pluginSettings[SC_TIMEZONE]);
    killEvent = new KillEvent(tpClient, killHistory, killEventView, new Blacklist(pluginSettings[SC_BLACKLIST]));

    eventRouter = new EventRouter();
    eventRouter.register(killEvent);
    eventRouter.register(new HelmetEvent(tpClient));

    const jsonWallet = new JsonWallet(pluginSettings[SC_WALLETS], 'utf8');
    if (!!walletView) {
        walletView.stopUpdate();
    }

    walletView = new WalletView(jsonWallet, pluginSettings[SC_DATE_LOCALE], pluginSettings[SC_WALLET_UPDATE_INTERVAL], tpClient);
    walletView.startUpdate();

    actionRouter = new ActionRouter();
    actionRouter.register(new PrevKillMessage(tpClient, 'sc_prev_kill_msg', killHistory, killEventView));
    actionRouter.register(new NextKillMessage(tpClient, 'sc_next_kill_msg', killHistory, killEventView));
    actionRouter.register(new Backspace(tpClient, 'sc_wallet_backspace', pluginSettings[SC_DATE_LOCALE]));
    actionRouter.register(new ReceiveDigit(tpClient, 'sc_wallet_digit', pluginSettings[SC_DATE_LOCALE]));
    actionRouter.register(new SetTargetWallet(tpClient, jsonWallet.wallets, 'sc_set_target_wallet'));
    actionRouter.register(new Submit(tpClient, 'sc_wallet_submit', jsonWallet, walletView));
    actionRouter.register(new ClearWallet(tpClient, jsonWallet, 'sc_wallet_clear_wallet'));
    actionRouter.register(new ResetInput(tpClient, 'sc_wallet_reset_input'));

    if (fileWatcher) {
        fileWatcher.stop();
    }

    fileWatcher = new FileWatcher(
        tpClient,
        `${pluginSettings[SC_ROOT_PATH]}\\${pluginSettings[SC_ENVIRONMENT]}\\${pluginSettings[SC_GAME_LOG_FILE]}`,
        'utf8',
        +pluginSettings[SC_READ_LOG_INTERVAL],
    );

    try {
        fileWatcher.on('line', (e) => eventRouter.route(e));
        fileWatcher.on('rotate', (_e) => {
            killHistory.clear();
            killEventView.update();
        });
        fileWatcher.on('error', (e) => console.error(e));

        killHistory.clear();
        fileWatcher.start();
    } catch (err) {
        tpClient.logIt('ERROR', 'An error occurred reading the log file');
        killHistory.clear();
        fileWatcher.start();
    }
};

tpClient.on('Settings', (data) => {
    tpClient.logIt('DEBUG', 'Settings: New Settings from Touch-Portal');
    data.forEach((setting: any) => {
        let key = Object.keys(setting)[0] || '';
        pluginSettings[key] = setting[key];
        tpClient.logIt('DEBUG', `Settings: Setting received for | ${key}:${setting[key]} |`);
    });

    initPlugin();
});

tpClient.on('Info', _data => {
    tpClient.logIt('DEBUG', 'Info: received initial connect from Touch-Portal');
});

tpClient.on('Update', (curVersion: string, remoteVersion: string) => {
    tpClient.logIt('DEBUG', 'Update: there is an update curVersion:', curVersion, 'remoteVersion:', remoteVersion);
    let optionsArray = [
        {
            'id': `${PLUGIN_ID}Update`,
            'title': 'Take Me to Download',
        },
        {
            'id': `${PLUGIN_ID}Ignore`,
            'title': 'Ignore Update',
        },
    ];

    tpClient.sendNotification(`${PLUGIN_ID}UpdateNotification`, 'My Plugin has been updated', `A new version of my plugin ${remoteVersion} is available to download`, optionsArray);
});

tpClient.on('NotificationClicked', (data) => {
    if (data.optionId === `${PLUGIN_ID}_update_notification_go_to_download`) {
        void open(pluginSettings[RELEASE_URL]);
    }
});

tpClient.on('Action', (actionData) => {
    tpClient.logIt('DEBUG', 'Action Received', actionData);
    actionRouter.route(actionData);
});

tpClient.connect({pluginId: PLUGIN_ID, 'updateUrl': UPDATE_URL});
