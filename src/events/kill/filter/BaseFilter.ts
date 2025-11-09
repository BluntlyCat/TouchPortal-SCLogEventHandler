import { IActorFilter } from './IActorFilter';
import { Client } from 'touchportal-api';

export abstract class BaseFilter implements IActorFilter {
    protected constructor(
        protected readonly _tpClient: Client,
        private readonly _validationRegex: RegExp,
        protected readonly _dataRegex: RegExp
    ) {
    }

    public isValid(actor: string): boolean {
        return this._validationRegex.test(actor);
    }

    public abstract exec(actor: string): string;
}