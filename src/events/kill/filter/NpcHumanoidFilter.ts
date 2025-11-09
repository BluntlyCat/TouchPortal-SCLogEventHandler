import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';
import { ActorTypes, FilterData } from './FilterData';

export class NpcHumanoidFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^NPC_Archetypes-[A-Za-z]+-[A-Za-z]+-[A-Za-z]+(?:_[A-Za-z]+)?_[0-9]+$/i;
        const dataRegex = /^(?<humanoid>NPC_Archetypes-(?<gender>[A-Za-z]+)-(?<species>[A-Za-z]+)-(?<faction>[A-Za-z]+)(?:_(?<class>[A-Za-z]+))?_(?<id>[0-9]+))$/i;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): FilterData|null {
        this._tpClient.logIt('DEBUG', 'Execute NPC humanoid filter');
        const match = this._dataRegex.exec(actor);
        if (!match?.groups) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return null;
        }

        const { species, faction } = match.groups as Record<string, string>;
        const clsRaw = (match.groups as Record<string, string>).class;
        const cls = clsRaw ? ` ${clsRaw[0].toUpperCase()}${clsRaw.slice(1)}` : '';
        return {
            actor: `${species} ${faction}${cls}`,
            type: ActorTypes.humanoid,
        };
    }
}