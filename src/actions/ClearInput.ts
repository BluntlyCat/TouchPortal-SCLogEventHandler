import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';

export class ClearInput extends BaseAction {
    public constructor(tpClient: Client, key: string) {
        super(tpClient, key);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', 0);
    }
}