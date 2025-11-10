import { KillHistory } from '../events/kill/KillHistory';
import { BaseAction } from './BaseAction';
import { KillEventView } from '../events/kill/KillEventView';
import { Client } from 'touchportal-api';

export class NextKillMessage extends BaseAction {
    public constructor(tpClient: Client, key: string, private readonly _killHistory: KillHistory, private readonly _killEventView: KillEventView) {
        super(tpClient, key);
    }

    exec() {
        this._killHistory.nextMessage();
        this._killEventView.update();
    }
}