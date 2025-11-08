import { BaseEventHandler } from '../BaseEvent';
import { Client } from 'touchportal-api';
import { KillHistory } from './KillHistory';
import { Line } from '../types';
import { KillEventView } from './KillEventView';
import { Blacklist } from './Blacklist';
import { PlayerKill } from './PlayerKill';
import { NpcKill } from './NpcKill';
import { KillData } from './KillData';

export class KillEvent extends BaseEventHandler {
    private readonly _playerKill: PlayerKill;
    private readonly _npcKill: NpcKill;
    private readonly _killTypeRegex = /^.+CActor::Kill:\s'[A-Za-z_-]+_(?<npcId>\d+)'\s.+$/;

    constructor(tpClient: Client, private readonly _killHistory: KillHistory, private readonly _killEventView: KillEventView, blacklist: Blacklist) {
        super(tpClient, 'kill');
        this._playerKill = new PlayerKill(tpClient, 'player', blacklist);
        this._npcKill = new NpcKill(tpClient, 'npc');
    }

    public handle(line: Line) {
        this._tpClient.logIt('DEBUG', `Handle kill event: ${line.str}`);

        const killMatch = this._killTypeRegex.exec(line.str);
        let killData: KillData;
        if (!!killMatch?.groups['npcId']) {
            killData = this._npcKill.handle(line);
        } else {
            killData = this._playerKill.handle(line);
        }

        this._killHistory.add(killData);
        this._killEventView.update();
    }
}