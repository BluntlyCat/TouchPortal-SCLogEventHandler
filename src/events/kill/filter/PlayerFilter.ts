import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';

export class PlayerFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^(?<player>[A-Za-z0-9_-]+)$/;
        const dataRegex = /^(?<player>[A-Za-z0-9_-]+)$/;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): string {
        this._tpClient.logIt('DEBUG', 'Execute player filter');
        const match = this._dataRegex.exec(actor);
        if (!match) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return '';
        }

        return match.groups.player;
    }
}