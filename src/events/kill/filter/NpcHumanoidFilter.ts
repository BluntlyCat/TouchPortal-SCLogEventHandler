import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';
import { ActorTypes, FilterData } from './FilterData';

export class NpcHumanoidFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^NPC_[A-Za-z-_]+_[0-9]+$/;
        const dataRegex = /^(?<humanoid>NPC_Archetypes-(?<gender>[A-Za-z]+)-(?<species>[A-Za-z]+)-(?<faction>[A-Za-z]+)_((?<class>[A-Za-z]+)_)?(?<id>[0-9]+))$/;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): FilterData|null {
        this._tpClient.logIt('DEBUG', 'Execute NPC humanoid filter');
        const match = this._dataRegex.exec(actor);
        if (!match) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return null;
        }

        const cls = match.groups.class ? ` ${match.groups.class[0].toUpperCase()}${match.groups.class.slice(1)}` : '';
        return {
            actor: `${match.groups.species} ${match.groups.faction}${cls}`,
            type: ActorTypes.humanoid,
        };
    }
}