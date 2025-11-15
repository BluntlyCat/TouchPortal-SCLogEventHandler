import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class Backspace extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;

    public constructor(tpClient: Client, key: string, locale: string) {
        super(tpClient, key);
        this._fmt = new Intl.NumberFormat(locale);
    }

    exec(actionData: any): void {
        const currentValue = actionData.data.find((d) => d.id === 'current_value');
        if (typeof currentValue.value === 'string') {
            let value = '0';
            if (currentValue.value.length > 1) {
                value = currentValue.value.substring(0, currentValue.value.length - 1);
            }
            this._tpClient.stateUpdate('sc_wallet_digits', value);
            this._tpClient.stateUpdate('sc_wallet_digits_formatted', `${this._fmt.format(+value)} aUEC`);
        }
    }
}