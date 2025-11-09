import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';
import { ActorTypes } from './filter/FilterData';
import { CITIZEN_DOSSIER_BASE_URL } from '../../constants';

export class KillEventView {
    public constructor(private readonly _tpClient: Client, private readonly _killHistory: KillHistory, private readonly _locale: string) {
    }

    public update() {
        const currentIndex = this._killHistory.currentIndex;
        const entryCount = this._killHistory.entryCount;
        const currentEntry = this._killHistory.currentEntry;

        let message = 'No kill detected';
        let rawLine = '';
        let blacklisted = false;
        let murdererType = '';
        let playerDossierUrl = '';

        if (currentEntry) {
            const time = new Date(currentEntry.time).toLocaleString(this._locale);
            message = currentEntry.getMessage(currentIndex + 1, entryCount, time);
            rawLine = currentEntry.rawLine;
            blacklisted = currentEntry.blacklisted;
            murdererType = currentEntry.murdererType.toString();
            playerDossierUrl = currentEntry.murdererType === ActorTypes.player ? `${CITIZEN_DOSSIER_BASE_URL}/${currentEntry.murderer}` : '';
        }

        this._tpClient.stateUpdate('sc_leh_kill_state', message);
        this._tpClient.stateUpdate('sc_leh_kill_state_full', rawLine);
        this._tpClient.stateUpdate('sc_murderer_is_blacklisted', blacklisted ? 'yes' : 'no');
        this._tpClient.stateUpdate('sc_murderer_type', murdererType);
        this._tpClient.stateUpdate('sc_player_dossier_url', playerDossierUrl);
    }
}