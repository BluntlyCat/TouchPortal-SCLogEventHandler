import { IActorFilter } from './IActorFilter';
import { Client } from 'touchportal-api';

export class NpcPetFilter implements IActorFilter {
    private readonly _validationRegex = /^[A-Za-z-_]+Pet_[A-Za-z-_]+[0-9]+$/;
    private readonly _dataRegex = /(?<pet>(?<species>[A-Za-z]+)_(?<class>[A-Za-z]+)_(?<faction>[A-Za-z]+)_(?<id>[0-9]+))/;

    public constructor(private readonly _tpClient: Client) {
    }

    public isValid(actor: string): boolean {
        return this._validationRegex.test(actor);
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