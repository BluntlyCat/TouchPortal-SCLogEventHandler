import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { Wallets } from './types';

export class TransferMoney extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;
    public constructor(tpClient: Client, key: string, locale: string) {
        super(tpClient, key);
        this._fmt = new Intl.NumberFormat(locale);
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

        const formattedTotal = this._fmt.format(total_value);
        const formattedSquad = this._fmt.format(squad_value);
        const formattedPersonal = this._fmt.format(total_value - squad_value);
        this._tpClient.stateUpdate('sc_wallet_text', `Total: ${formattedTotal} aUEC\nSquad: ${formattedSquad} aUEC\nOwn: ${formattedPersonal} aUEC`);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');
    }
}