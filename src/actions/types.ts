export interface Action {
    get key(): string;

    exec(actionData?: any): void;
}

export enum Wallets {
    total = 'total',
    squad = 'squad',
}

export enum ActionTypes {
    deposit = 'deposit',
    withdraw = 'withdraw',
}