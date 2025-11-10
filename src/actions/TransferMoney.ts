import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { Wallets } from './types';

export class TransferMoney extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(actionData: any): void {
        const sc_target_wallet = actionData.data.find((d) => d.id === 'sc_target_wallet')?.value;
        if (!Object.values(Wallets).includes(sc_target_wallet as Wallets)) {
            return;
        }

        const add_value = +actionData.data.find((d) => d.id === 'sc_wallet_add_value')?.value;
        let total_value = +actionData.data.find((d) => d.id === 'sc_wallet_total_value')?.value;
        let squad_value = +actionData.data.find((d) => d.id === 'sc_wallet_squad_value')?.value;
        const wallet = sc_target_wallet as Wallets;
        if (wallet === Wallets.total) {
            total_value = +actionData.data.find((d) => d.id === 'sc_wallet_total_value')?.value;
            total_value += add_value;
            this._tpClient.stateUpdate('sc_wallet_total', total_value);
        } else if (wallet === Wallets.squad) {
            squad_value = +actionData.data.find((d) => d.id === 'sc_wallet_squad_value')?.value;
            squad_value += add_value;
            this._tpClient.stateUpdate('sc_wallet_squad', squad_value);
        }

        this._tpClient.stateUpdate('sc_wallet_text', `Total: ${total_value}\nSquad: ${squad_value}\nPersonal: ${total_value - squad_value}`);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
    }
}