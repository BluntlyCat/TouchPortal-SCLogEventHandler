import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class SetTargetWallet extends BaseAction {
    public constructor(tpClient: Client, private readonly _wallets: string[], key: string) {
        super(tpClient, key);
    }

    exec(actionData: any): void {
        const sc_target_wallet = actionData.data.find((d) => d.id === 'sc_target_wallet')?.value;
        if (this._wallets.includes(sc_target_wallet)) {
            this._tpClient.stateUpdate('sc_wallet_target_wallet', sc_target_wallet);
        }
    }
}