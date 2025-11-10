import { Action } from './types';

export class ActionRouter {
    private _actions: Action[] = [];

    public register(action: Action): void {
        this._actions.push(action);
    }

    public route(actionData: any) {
        for (const a of this._actions) {
            if (a.key === actionData.actionId) {
                a.exec(actionData);
            }
        }
    }
}