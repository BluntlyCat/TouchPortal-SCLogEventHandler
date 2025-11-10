import { Action } from './types';
import { Client } from 'touchportal-api';

export abstract class BaseAction implements Action {
    protected constructor(protected readonly _tpClient: Client, private readonly _key: string) {
    }

    public abstract exec(actionData?: any): void;

    public get key(): string {
        return this._key;
    }
}