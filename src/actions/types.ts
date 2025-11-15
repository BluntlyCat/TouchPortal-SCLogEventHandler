export interface Action {
    get key(): string;

    exec(actionData?: any): void;
}

export enum ActionTypes {
    deposit = 'deposit',
    withdraw = 'withdraw',
    set = 'set'
}

export type JsonWalletData = {[k: string]: number};