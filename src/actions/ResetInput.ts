import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class ResetInput extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_wallet_digits', 0);
        this._tpClient.stateUpdate('sc_wallet_digits_formatted', '0 aUEC');
    }
}