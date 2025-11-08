import { Handler, Line } from '../types';
import { Client } from 'touchportal-api';
import { KillData } from './KillData';

export class NpcHumanoidKill implements Handler {
    private readonly _npcHumanKillRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+'(?<humanoid>NPC_Archetypes-(?<gender>[A-z]+)-(?<species>[A-z]+)-(?<faction>[A-z]+)_(?<class>[A-z]+)_(?<id>[0-9]+))'.+in zone '(?<zone>[\w_-]+)'.+?killed by '(?<killer>\w+)'.+?with damage type '(?<dmgType>\w+)'.+$/;

    public constructor(private readonly _tpClient: Client, private readonly _key: string) {
    }

    get key(): string {
        return this._key;
    }

    handle(line: Line): KillData {
        this._tpClient.logIt('DEBUG', 'Handle npc humanoid kill event');

        const killMatch = this._npcHumanKillRegex.exec(line.str);
        if (!killMatch || !killMatch.groups) {
            this._tpClient.logIt('DEBUG', 'Ignore kill because it is invalid');
            return;
        }

        const groups = killMatch.groups;
        const timeStr = groups['timestamp'] || '';
        const time = new Date(timeStr).toLocaleString();
        const victim = `${groups['species']} ${groups['faction']} ${groups['class']}`;
        const killer = groups['killer'];
        const cause = groups['dmgType'];

        return {
            rawLine: line.str,
            victim,
            killer,
            time,
            cause,
            killerOnBlacklist: false,
        };
    }
}