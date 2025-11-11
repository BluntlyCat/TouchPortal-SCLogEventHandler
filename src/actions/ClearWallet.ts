import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { Wallets } from './types';

export class ClearWallet extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_wallet_add_value', 0);
        this._tpClient.stateUpdate('sc_wallet_total_value', 0);
        this._tpClient.stateUpdate('sc_wallet_squad_value', 0);
        this._tpClient.stateUpdate('sc_wallet_total', 0);
        this._tpClient.stateUpdate('sc_wallet_squad', 0);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', 0);
        this._tpClient.stateUpdate('sc_wallet_target', Wallets.total);
        this._tpClient.stateUpdate('sc_wallet_text', `Total: 0 aUEC\nSquad: 0 aUEC\nPersonal: 0 aUEC`);
    }
}