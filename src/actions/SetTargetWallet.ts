import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { Wallets } from './types';

export class SetTargetWallet extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(actionData: any): void {
        const sc_target_wallet = actionData.data.find((d) => d.id === 'sc_target_wallet')?.value;
        if (Object.values(Wallets).includes(sc_target_wallet as Wallets)) {
            this._tpClient.stateUpdate('sc_wallet_target', sc_target_wallet as Wallets);
        }
    }
}