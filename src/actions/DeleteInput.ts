import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class DeleteInput extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(actionData: any): void {
        const sc_wallet_current_value = actionData.data.find((d) => d.id === 'sc_wallet_current_value');
        if (typeof sc_wallet_current_value.value === 'string') {
            let value = '0';
            if (sc_wallet_current_value.value.length > 1) {
                value = sc_wallet_current_value.value.substring(0, sc_wallet_current_value.value.length - 1);
            }
            this._tpClient.stateUpdate('sc_wallet_transfer', value);
        }
    }
}