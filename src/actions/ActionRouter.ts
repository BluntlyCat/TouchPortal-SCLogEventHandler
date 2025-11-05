import { Action } from './types';

export class ActionRouter {
    private _actions: Action[] = [];

    public register(action: Action): void {
        this._actions.push(action);
    }

    public route(key: string) {
        for (const a of this._actions) {
            if (a.key === key) {
                a.exec();
            }
        }
    }
}