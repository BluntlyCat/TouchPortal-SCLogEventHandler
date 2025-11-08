import { Handler, Line } from '../types';
import { Client } from 'touchportal-api';
import { KillData } from './KillData';
import { NpcHumanoidKill } from './NpcHumanoidKill';
import { NpcPetKill } from './NpcPetKill';

export class NpcKill implements Handler {
    private readonly _npcKillRegex = /'(?<human>NPC_[A-Za-z0-9_-]+)'/;

    private readonly _humanoidKill: NpcHumanoidKill;
    private readonly _petKill: NpcPetKill;

    public constructor(private readonly _tpClient: Client, private readonly _key: string) {
        this._humanoidKill = new NpcHumanoidKill(_tpClient, 'human');
        this._petKill = new NpcPetKill(_tpClient, 'pet');
    }

    get key(): string {
        return this._key;
    }

    handle(line: Line): KillData {
        this._tpClient.logIt('DEBUG', 'Handle npc kill event');

        const killMatch = this._npcKillRegex.exec(line.str);
        if (!!killMatch?.groups['human']) {
            return this._humanoidKill.handle(line);
        } else {
            return this._petKill.handle(line);
        }
    }
}