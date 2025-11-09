import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';

export class NpcPetFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^[A-Za-z-_]+Pet_[A-Za-z-_]+[0-9]+$/;
        const dataRegex = /(?<pet>(?<species>[A-Za-z]+)_(?<class>[A-Za-z]+)_(?<faction>[A-Za-z]+)_(?<id>[0-9]+))/;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): string {
        this._tpClient.logIt('DEBUG', 'Execute NPC pet filter');

        const match = this._dataRegex.exec(actor);
        if (!match) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return '';
        }

        return match.groups.species;
    }
}