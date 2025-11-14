export interface Action {
    get key(): string;

    exec(actionData?: any): void;
}

export enum Wallets {
    total = 'total',
    exploration = 'exploration',
    trading = 'trading',
}

export enum ActionTypes {
    deposit = 'deposit',
    withdraw = 'withdraw',
    set = 'set'
}

export type JsonWalletData = {[k in Wallets]: number};