import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class ReceiveDigit extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;

    public constructor(tpClient: Client, key: string, locale: string) {
        super(tpClient, key);
        this._fmt = new Intl.NumberFormat(locale);
    }

    exec(actionData: any): void {
        const currentValue = actionData.data.find((d) => d.id === 'current_value');
        const digit = actionData.data.find((d) => d.id === 'digit');

        if (typeof currentValue.value === 'string' && typeof digit.value === 'string') {
            let value = currentValue.value + digit.value;
            if (currentValue.value === '0') {
                value = digit.value;
            }
            this._tpClient.stateUpdate('sc_wallet_digits', value);
            this._tpClient.stateUpdate('sc_wallet_digits_formatted', `${this._fmt.format(value)} aUEC`);
        }
    }
}