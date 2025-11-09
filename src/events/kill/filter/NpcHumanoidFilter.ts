import { Client } from 'touchportal-api';
import { BaseFilter } from './BaseFilter';

export class NpcHumanoidFilter extends BaseFilter {
    public constructor(tpClient: Client) {
        const validationRegex = /^NPC_[A-Za-z-_]+_[0-9]+$/;
        const dataRegex = /^(?<humanoid>NPC_Archetypes-(?<gender>[A-Za-z]+)-(?<species>[A-Za-z]+)-(?<faction>[A-Za-z]+)_((?<class>[A-Za-z]+)_)?(?<id>[0-9]+))$/;

        super(tpClient, validationRegex, dataRegex);
    }

    public exec(actor: string): string {
        this._tpClient.logIt('DEBUG', 'Execute NPC humanoid filter');
        const match = this._dataRegex.exec(actor);
        if (!match) {
            this._tpClient.logIt('ERROR', 'Invalid match, skipping');
            return '';
        }

        const cls = match.groups.class ? ` ${match.groups.class[0].toUpperCase()}${match.groups.class.slice(1)}` : '';
        return `${match.groups.species} ${match.groups.faction}${cls}`;
    }
}