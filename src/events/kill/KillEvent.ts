import { BaseEventHandler } from '../BaseEvent';
import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';
import { Line } from '../types';
import { KillEventView } from './KillEventView';

export class KillEvent extends BaseEventHandler {
    private static killRegex = /^<(?<timestamp>\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)>.+?Actor Death.+?Kill: '(?:(PU_\w+_(?<npc>NPC(?:_\w+)+))_\d+|(?<player>[A-Za-z0-9_-]+))'.+?in zone '(?<zone>[\w_-]+)'.+?killed by '(?<killer>\w+)'.+?with damage type '(?<dmgType>\w+)'/;

    constructor(tpClient: Client, private readonly _killHistory: KillHistory, private readonly _killEventView: KillEventView) {
        super(tpClient, 'kill');
    }

    public handle(line: Line) {
        this._tpClient.logIt('DEBUG', 'Handle kill event');
        const killMatch = KillEvent.killRegex.exec(line.str);

        if (!killMatch || !killMatch.groups) {
            return;
        }

        const groups = killMatch.groups;
        const timeStr = groups['timestamp'] || '';
        const time = new Date(timeStr).toLocaleString();
        const victim = groups['npc'] ? this.formatNpcName(groups['npc']) : groups['player'];
        const killer = groups['killer'];
        const cause = groups['dmgType'];

        const killData = {
            rawLine: line.str,
            victim,
            killer,
            time,
            cause,
        };

        this._killHistory.add(killData);
        this._killEventView.update();
    }

    private formatNpcName = (rawName: string) => {
        return rawName
            .split('_')
            .map(s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`)
            .join(' ')
            .trim();
    };
}