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

export class KillEvent extends BaseEventHandler {
    private readonly _victimRegex = /^.+CActor::Kill:\s'(?<victim>[A-Za-z-_0-9]+)'.+$/;
    private readonly _murdererRegex = /^.+killed by\s'(?<murderer>[A-Za-z-_0-9]+)'.+$/;
    private readonly _killDataRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+in zone '(?<zone>[\w_-]+)'.+?with damage type '(?<dmgType>\w+)'.+$/;
    private readonly _actorFilter: IActorFilter[] = [];

    constructor(
        tpClient: Client,
        private readonly _killHistory: KillHistory,
        private readonly _killEventView: KillEventView,
        private readonly _blacklist: Blacklist
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

        if (!this.isValidEvent(victimMatch, murdererMatch, killDataMatch)) {
            this._tpClient.logIt('ERROR', 'Invalid kill event, skipping');
            return;
        }

        const victim = this.getActor(victimMatch.groups.victim);
        if (!victim) {
            this._tpClient.logIt('ERROR', 'Invalid victim, skipping');
            return;
        }

        const murderer = this.getActor(murdererMatch.groups.murderer);
        if (!murderer) {
            this._tpClient.logIt('ERROR', 'Invalid murderer, skipping');
            return;
        }

        this._killHistory.add({
            murderer: murderer,
            victim: victim,
            rawLine: line.str,
            time: new Date(killDataMatch.groups.timestamp).toLocaleString(),
            cause: killDataMatch.groups.dmgType,
            zone: killDataMatch.groups.zone,
            murdererOnBlacklist: this._blacklist.isBlacklisted(murderer),
        });

        this._killEventView.update();
    }

    private isValidEvent(victimMatch: RegExpExecArray, murdererMatch: RegExpExecArray, killDataMatch: RegExpExecArray): boolean {
        if (!victimMatch || !('victim' in victimMatch.groups) || !victimMatch.groups.victim) {
            return false;
        }

        if (!murdererMatch || !('murderer' in murdererMatch.groups) || !murdererMatch.groups.murderer) {
            return false;
        }

        if (!killDataMatch) {
            return false;
        }

        if (!('timestamp' in killDataMatch.groups) || !killDataMatch.groups.timestamp) {
            return false;
        }

        if (!('zone' in killDataMatch.groups) || !killDataMatch.groups.zone) {
            return false;
        }

        return ('dmgType' in killDataMatch.groups) && !!killDataMatch.groups.dmgType;
    }

    private getActor(actor: string): string {
        for (const filter of this._actorFilter) {
            if (filter.isValid(actor)) {
                return filter.exec(actor);
            }
        }
    }
}