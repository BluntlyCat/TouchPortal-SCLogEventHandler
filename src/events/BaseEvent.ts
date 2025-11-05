import { Client } from 'touchportal-api';
import { Handler, Line } from './types';

export abstract class BaseEventHandler implements Handler {
    public abstract handle(line: Line): void;

    protected constructor(protected _tpClient: Client, public readonly _key: string) {
    }

    public get key(): string {
        return this._key;
    }
}