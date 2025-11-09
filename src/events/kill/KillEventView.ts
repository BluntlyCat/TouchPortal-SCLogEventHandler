import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';
import { ActorTypes } from './filter/FilterData';
import { CITIZEN_DOSSIER_BASE_URL } from '../../constants';

export class KillEventView {
    public constructor(
        private readonly _tpClient: Client,
        private readonly _killHistory: KillHistory,
        private readonly _dateLocale: string,
        private readonly _timezone: string,
    ) {
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
            const time = new Date(currentEntry.time).toLocaleString(this._dateLocale, {timeZone: this._timezone});
            message = currentEntry.getMessage(currentIndex + 1, entryCount, time);
            rawLine = currentEntry.rawLine;
            blacklisted = currentEntry.blacklisted;
            murdererType = currentEntry.murdererType.toString();
            playerDossierUrl = currentEntry.murdererType === ActorTypes.player ? `${CITIZEN_DOSSIER_BASE_URL}/${currentEntry.murderer}` : '';
        }

        const states = [
            {id: 'sc_kill_state', value: message},
            {id: 'sc_kill_state_full', value: rawLine},
            {id: 'sc_murderer_is_blacklisted', value: blacklisted ? 'yes' : 'no'},
            {id: 'sc_murderer_type', value: murdererType},
            {id: 'sc_kill_count', value: entryCount},
            {id: 'sc_player_dossier_url', value: playerDossierUrl},
        ];
        this._tpClient.stateUpdateMany(states);

        this._tpClient.logIt('DEBUG', `STATES UPDATED`, blacklisted, murdererType, entryCount, playerDossierUrl);
    }
}