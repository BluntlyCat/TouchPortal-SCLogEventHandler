import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { JsonWallet } from './JsonWallet';

export class ClearWallet extends BaseAction {
    public constructor(tpClient: Client, private readonly _jsonWallet: JsonWallet, key: string) {
        super(tpClient, key);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_wallet_digits', 0);
        this._tpClient.stateUpdate('sc_wallet_digits_formatted', '0 aUEC');
        this._tpClient.stateUpdate('sc_wallet_target_wallet', this._jsonWallet.totalWallet);
        this._tpClient.stateUpdate('sc_wallet_formatted_text', `Total: 0 aUEC\nSquad: 0 aUEC\nOwn: 0 aUEC`);

        this._jsonWallet.writeJson(this._jsonWallet.emptyWallet());
    }
}