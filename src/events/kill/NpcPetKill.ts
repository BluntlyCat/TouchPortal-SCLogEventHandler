import { Handler, Line } from '../types';
import { Client } from 'touchportal-api';
import { KillData } from './KillData';

export class NpcPetKill implements Handler {
    private readonly _npcPetKillRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+CActor::Kill:.+'(?<pet>(?<species>[A-z]+)_(?<class>[A-z]+)_(?<faction>[A-z]+)_(?<id>[0-9]+))'.+in zone '(?<zone>[\w_-]+)'.+?killed by '(?<killer>\w+)'.+?with damage type '(?<dmgType>\w+)'.+$/;

    public constructor(private readonly _tpClient: Client, private readonly _key: string) {
    }

    get key(): string {
        return this._key;
    }

    handle(line: Line): KillData {
        this._tpClient.logIt('DEBUG', 'Handle npc pet kill event');

        const killMatch = this._npcPetKillRegex.exec(line.str);
        if (!killMatch || !killMatch.groups) {
            this._tpClient.logIt('DEBUG', 'Ignore kill because it is invalid');
            return;
        }

        const groups = killMatch.groups;
        const timeStr = groups['timestamp'] || '';
        const time = new Date(timeStr).toLocaleString();
        const victim = `${groups['species']}`;
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