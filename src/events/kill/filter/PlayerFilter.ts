import { IActorFilter } from './IActorFilter';
import { Client } from 'touchportal-api';

export class PlayerFilter implements IActorFilter {
    private readonly _validationRegex = /^(?<player>[A-Za-z0-9_-]+)$/;
    private readonly _dataRegex = /^(?<player>[A-Za-z0-9_-]+)$/;

    public constructor(private readonly _tpClient: Client) {
    }

    public isValid(actor: string): boolean {
        return this._validationRegex.test(actor);
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