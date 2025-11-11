import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class AddInput extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;

    public constructor(tpClient: Client, key: string, locale: string) {
        super(tpClient, key);
        this._fmt = new Intl.NumberFormat(locale);
    }

    exec(actionData: any): void {
        const sc_wallet_current_value = actionData.data.find((d) => d.id === 'sc_wallet_current_value');
        const sc_wallet_add_value = actionData.data.find((d) => d.id === 'sc_wallet_add_value');

        if (typeof sc_wallet_current_value.value === 'string' && typeof sc_wallet_add_value.value === 'string') {
            let value = sc_wallet_current_value.value + sc_wallet_add_value.value;
            if (sc_wallet_current_value.value === '0') {
                value = sc_wallet_add_value.value;
            }
            this._tpClient.stateUpdate('sc_add_input_value', value);
            this._tpClient.stateUpdate('sc_add_input_value_formatted', this._fmt.format(value));
        }
    }
}