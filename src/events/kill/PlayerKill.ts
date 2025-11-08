import { Handler, Line } from '../types';
import { Client } from 'touchportal-api';
import { KillData } from './KillData';
import { Blacklist } from './Blacklist';

export class PlayerKill implements Handler {
    private readonly _playerKillRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+'(?<victim>[A-Za-z0-9_-]+)'.+?in zone '(?<zone>[\w_-]+)'.+?killed by '(?<killer>\w+)'.+?with damage type '(?<dmgType>\w+)'.+$/;

    public constructor(private readonly _tpClient: Client, private readonly _key: string, private readonly _blacklist: Blacklist) {
    }

    get key(): string {
        return this._key;
    }

    handle(line: Line): KillData {
        this._tpClient.logIt('DEBUG', 'Handle player kill event');
        const killMatch = this._playerKillRegex.exec(line.str);
        if (!killMatch || !killMatch.groups) {
            this._tpClient.logIt('DEBUG', 'Ignore kill because it is invalid or an NPC');
            return;
        }

        const groups = killMatch.groups;
        const timeStr = groups['timestamp'] || '';
        const time = new Date(timeStr).toLocaleString();
        const victim = groups['victim'];
        const killer = groups['killer'];
        const cause = groups['dmgType'];

        return {
            rawLine: line.str,
            victim,
            killer,
            time,
            cause,
            killerOnBlacklist: this._blacklist.isBlacklisted(killer),
        };
    }
}