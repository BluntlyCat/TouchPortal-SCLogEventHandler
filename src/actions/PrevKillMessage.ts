import { KillHistory } from '../events/kill/KillHistory';
import { BaseAction } from './BaseAction';
import { KillEventView } from '../events/kill/KillEventView';

export class PrevKillMessage extends BaseAction {
    public constructor(key: string, private readonly _killHistory: KillHistory, private readonly _killEventView: KillEventView) {
        super(key)
    }

    exec() {
        this._killHistory.previousMessage();
        this._killEventView.update();
    }
}