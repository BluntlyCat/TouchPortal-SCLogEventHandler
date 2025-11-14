import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { ActionTypes, Wallets } from './types';
import { JsonWallet } from './JsonWallet';


export class TransferMoney extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;
    private readonly _jsonWallet: JsonWallet;

    public constructor(tpClient: Client, key: string, locale: string, encoding: BufferEncoding) {
        super(tpClient, key);
        this._jsonWallet = new JsonWallet(encoding);
        this._fmt = new Intl.NumberFormat(locale);

        const {total, squad} = this._jsonWallet.walletData;
        this.updateValues(total, squad, false);
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

        if (actionType === ActionTypes.set) {
            ({
                total_value,
                squad_value,
            } = this.setValue(wallet, total_value, squad_value, add_value));
        } else {
            ({
                total_value,
                squad_value,
            } = this.transferValue(actionData, wallet, actionType, total_value, squad_value, add_value));
        }

        this.updateValues(total_value, squad_value);
    }

    private setValue(wallet: Wallets, total_value: number, squad_value: number, add_value: number) {
        if (wallet === Wallets.total) {
            return {
                total_value: add_value,
                squad_value,
            };
        } else {
            return {
                total_value,
                squad_value: add_value,
            };
        }
    }

    private transferValue(actionData: any, wallet: Wallets, actionType: ActionTypes, total_value: number, squad_value: number, add_value: number) {
        if (actionType === ActionTypes.deposit) {
            total_value += add_value;
        } else {
            total_value -= add_value;
        }

        if (wallet === Wallets.squad) {
            squad_value = +actionData.data.find((d) => d.id === 'sc_wallet_squad_value')?.value;

            if (actionType === ActionTypes.deposit) {
                squad_value += add_value;
            } else {
                squad_value -= add_value;
            }
        }

        return {total_value, squad_value};
    }

    private updateValues(total_value: number, squad_value: number, writeJson = true) {
        this._tpClient.stateUpdate('sc_wallet_total', total_value);
        this._tpClient.stateUpdate('sc_wallet_squad', squad_value);

        const formattedTotal = this._fmt.format(total_value);
        const formattedSquad = this._fmt.format(squad_value);
        const formattedPersonal = this._fmt.format(total_value - squad_value);
        this._tpClient.stateUpdate('sc_wallet_text', `T:\t${formattedTotal} aUEC\nS:\t${formattedSquad} aUEC\nO:\t${formattedPersonal} aUEC`);
        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');

        if (writeJson) {
            this._jsonWallet.writeJson({total: total_value, squad: squad_value});
        }
    }
}