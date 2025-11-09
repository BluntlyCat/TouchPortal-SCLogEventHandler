import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';
import { ActorTypes, FilterData } from './FilterData';

export class NpcPetFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^[A-Za-z]+_[A-Za-z]+_[A-Za-z]+_[0-9]+$/i;
        const dataRegex = /^(?<pet>(?<species>[A-Za-z]+)_(?<class>[A-Za-z]+)_(?<faction>[A-Za-z]+)_(?<id>[0-9]+))$/i;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): FilterData|null {
        this._tpClient.logIt('DEBUG', 'Execute NPC pet filter');

        const match = this._dataRegex.exec(actor);
        if (!match?.groups?.species) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return null;
        }

        return {
            actor: match.groups.species,
            type: ActorTypes.pet,
        };
    }
}