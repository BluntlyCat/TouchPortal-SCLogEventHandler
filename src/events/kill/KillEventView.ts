import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';

export class KillEventView {
    public constructor(private readonly _tpClient: Client, private readonly _killHistory: KillHistory) {
    }

    public update() {
        const currentIndex = this._killHistory.currentIndex;
        const entryCount = this._killHistory.entryCount;
        const currentEntry = this._killHistory.currentEntry;

        let message = 'No kill detected';
        let rawLine = '';
        let blacklisted = false;

        if (currentEntry) {
            message = currentEntry.getMessage(currentIndex + 1, entryCount);
            rawLine = currentEntry.rawLine;
            blacklisted = currentEntry.blacklisted;
        }

        this._tpClient.stateUpdate('sc_leh_kill_state', message);
        this._tpClient.stateUpdate('sc_leh_kill_state_full', rawLine);
        this._tpClient.stateUpdate('sc_killer_is_blacklisted', blacklisted ? '⚠️' : '');
    }
}