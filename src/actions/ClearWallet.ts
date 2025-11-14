import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { Wallets } from './types';
import { JsonWallet } from './JsonWallet';

export class ClearWallet extends BaseAction {
    private readonly _jsonWallet: JsonWallet;

    public constructor(tpClient: Client, key: string, encoding: BufferEncoding) {
        super(tpClient, key);
        this._jsonWallet = new JsonWallet(encoding);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_wallet_add_value', 0);
        this._tpClient.stateUpdate('sc_wallet_total_value', 0);
        this._tpClient.stateUpdate('sc_wallet_squad_value', 0);
        this._tpClient.stateUpdate('sc_wallet_total', 0);
        this._tpClient.stateUpdate('sc_wallet_squad', 0);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');
        this._tpClient.stateUpdate('sc_wallet_target', Wallets.total);
        this._tpClient.stateUpdate('sc_wallet_text', `Total: 0 aUEC\nSquad: 0 aUEC\nOwn: 0 aUEC`);

        this._jsonWallet.writeJson(JsonWallet.emptyWallet());
    }
}