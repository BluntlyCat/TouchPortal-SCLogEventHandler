import { IActorFilter } from './IActorFilter';
import { Client } from 'touchportal-api';

export class NpcHumanoidFilter implements IActorFilter {
    private readonly _validationRegex = /^NPC_[A-Za-z-_]+_[0-9]+$/;
    private readonly _dataRegex = /^(?<humanoid>NPC_Archetypes-(?<gender>[A-Za-z]+)-(?<species>[A-Za-z]+)-(?<faction>[A-Za-z]+)_((?<class>[A-Za-z]+)_)?(?<id>[0-9]+))$/;

    public constructor(private readonly _tpClient: Client) {
    }

    public isValid(actor: string): boolean {
        return this._validationRegex.test(actor);
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