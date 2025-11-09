import { BaseEventHandler } from '../BaseEvent';
import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';
import { Line } from '../types';
import { KillEventView } from './KillEventView';
import { Blacklist } from './Blacklist';
import { IActorFilter } from './filter/IActorFilter';
import { PlayerFilter } from './filter/PlayerFilter';
import { NpcHumanoidFilter } from './filter/NpcHumanoidFilter';
import { NpcPetFilter } from './filter/NpcPetFilter';
import { FilterData } from './filter/FilterData';
import { KillDataMatch, MurdererMatch, VictimMatch } from './types';

export class KillEvent extends BaseEventHandler {
    private readonly _victimRegex = /^.+CActor::Kill:\s'(?<victim>[A-Za-z0-9_-]+)'.+$/;
    private readonly _murdererRegex = /^.+killed by\s'(?<murderer>[A-Za-z0-9_-]+)'.+$/;
    private readonly _killDataRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+in zone '(?<zone>[\w_-]+)'.+?with damage type '(?<dmgType>\w+)'.+$/;
    private readonly _actorFilter: IActorFilter[] = [];

    constructor(
        tpClient: Client,
        private readonly _killHistory: KillHistory,
        private readonly _killEventView: KillEventView,
        private readonly _blacklist: Blacklist,
    ) {
        super(tpClient, 'CActor::Kill');

        this._actorFilter.push(new NpcHumanoidFilter(tpClient));
        this._actorFilter.push(new NpcPetFilter(tpClient));
        this._actorFilter.push(new PlayerFilter(tpClient));
    }

    public handle(line: Line) {
        this._tpClient.logIt('DEBUG', `Handle kill event: ${line.str}`);

        const victimMatch = this._victimRegex.exec(line.str);
        const murdererMatch = this._murdererRegex.exec(line.str);
        const killDataMatch = this._killDataRegex.exec(line.str);

        if (!this.isVictimMatch(victimMatch) || !this.isMurdererMatch(murdererMatch) || !this.isKillDataMatch(killDataMatch)) {
            this._tpClient.logIt('ERROR', 'Invalid kill event, skipping');
            return;
        }

        const victimData = this.getActor(victimMatch.groups.victim);
        if (!victimData) {
            this._tpClient.logIt('ERROR', 'Invalid victim, skipping');
            return;
        }

        const murdererData = this.getActor(murdererMatch.groups.murderer);
        if (!murdererData) {
            this._tpClient.logIt('ERROR', 'Invalid murderer, skipping');
            return;
        }

        this._killHistory.add({
            murderer: murdererData.actor,
            victim: victimData.actor,
            rawLine: line.str,
            time: killDataMatch.groups.timestamp,
            cause: killDataMatch.groups.dmgType,
            zone: killDataMatch.groups.zone,
            murdererOnBlacklist: this._blacklist.isBlacklisted(murdererData.actor),
            murdererType: murdererData.type,
        });

        this._killEventView.update();
    }

    private getActor(actor: string): FilterData | null {
        for (const filter of this._actorFilter) {
            if (filter.isValid(actor)) return filter.exec(actor);
        }
        return null;
    }

    private isVictimMatch(x: RegExpExecArray | null): x is VictimMatch {
        return !!x?.groups?.victim;
    }

    private isMurdererMatch(x: RegExpExecArray | null): x is MurdererMatch {
        return !!x?.groups?.murderer;
    }

    private isKillDataMatch(x: RegExpExecArray | null): x is KillDataMatch {
        const g = x?.groups;
        return !!(g?.timestamp && g?.zone && g?.dmgType);
    }
}