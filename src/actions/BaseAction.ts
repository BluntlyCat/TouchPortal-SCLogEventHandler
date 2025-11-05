import { Action } from './types';

export abstract class BaseAction implements Action {
    protected constructor(private readonly _key: string) {
    }

    public abstract exec(): void;

    public get key(): string {
        return this._key;
    }
}