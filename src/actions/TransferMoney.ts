import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { ActionTypes, Wallets } from './types';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export class TransferMoney extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;
    private readonly _moneyJson: string;

    public constructor(tpClient: Client, key: string, locale: string, private readonly _encoding: BufferEncoding) {
        super(tpClient, key);
        this._fmt = new Intl.NumberFormat(locale);
        this._moneyJson = path.join(os.homedir(), '.touch_portal_star_citizen_tools_wallet.json');

        if (!existsSync(this._moneyJson)) {
            this.writeJson({
                total: 0,
                squad: 0,
            });
        }

        this.readJson();
    }

    exec(actionData: any): void {
        const sc_target_wallet = actionData.data.find((d) => d.id === 'sc_target_wallet')?.value;
        if (!Object.values(Wallets).includes(sc_target_wallet as Wallets)) {
            return;
        }

        const wallet = sc_target_wallet as Wallets;

        const sc_wallet_action_type = actionData.data.find((d) => d.id === 'sc_wallet_action_type')?.value;
        if (!Object.values(ActionTypes).includes(sc_wallet_action_type as ActionTypes)) {
            return;
        }

        const actionType = sc_wallet_action_type as ActionTypes;

        const add_value = +actionData.data.find((d) => d.id === 'sc_wallet_add_value')?.value;

        let total_value = +actionData.data.find((d) => d.id === 'sc_wallet_total_value')?.value;
        let squad_value = +actionData.data.find((d) => d.id === 'sc_wallet_squad_value')?.value;

        if (actionType === ActionTypes.deposit) {
            total_value += add_value;
        } else {
            total_value -= add_value;
        }

        this._tpClient.stateUpdate('sc_wallet_total', total_value);

        if (wallet === Wallets.squad) {
            squad_value = +actionData.data.find((d) => d.id === 'sc_wallet_squad_value')?.value;

            if (actionType === ActionTypes.deposit) {
                squad_value += add_value;
            } else {
                squad_value -= add_value;
            }

            this._tpClient.stateUpdate('sc_wallet_squad', squad_value);
        }

        const formattedTotal = this._fmt.format(total_value);
        const formattedSquad = this._fmt.format(squad_value);
        const formattedPersonal = this._fmt.format(total_value - squad_value);
        this._tpClient.stateUpdate('sc_wallet_text', `Total: ${formattedTotal} aUEC\nSquad: ${formattedSquad} aUEC\nOwn: ${formattedPersonal} aUEC`);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');

        this.writeJson({
            total: total_value,
            squad: squad_value,
        });
    }

    private writeJson(json: object): void {
        writeFileSync(this._moneyJson, JSON.stringify(json), { encoding: this._encoding });
    }

    private readJson(): void {
        if(!existsSync(this._moneyJson)) {
            return;
        }

        const json = JSON.parse(readFileSync(this._moneyJson, { encoding: this._encoding }));

        const total = +json.total;
        const squad = +json.squad;

        const formattedTotal = this._fmt.format(total);
        const formattedSquad = this._fmt.format(squad);
        const formattedPersonal = this._fmt.format(total - squad);

        this._tpClient.stateUpdate('sc_wallet_total', total);
        this._tpClient.stateUpdate('sc_wallet_squad', squad);
        this._tpClient.stateUpdate('sc_wallet_text', `Total: ${formattedTotal} aUEC\nSquad: ${formattedSquad} aUEC\nOwn: ${formattedPersonal} aUEC`);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');
    }
}