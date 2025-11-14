import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { ActionTypes, JsonWalletData, Wallets } from './types';
import { JsonWallet } from './JsonWallet';


export class TransferMoney extends BaseAction {
    private readonly _fmt: Intl.NumberFormat;
    private readonly _jsonWallet: JsonWallet;

    public constructor(tpClient: Client, key: string, locale: string, encoding: BufferEncoding) {
        super(tpClient, key);
        this._jsonWallet = new JsonWallet(encoding);
        this._fmt = new Intl.NumberFormat(locale);

        const walletData = this._jsonWallet.walletData;
        this.updateValues(walletData, false);
        let walletKeyIndex = 0;
        const walletKeys = Object.keys(Wallets);
        setInterval(() => {
            const wallet = walletKeys[walletKeyIndex] as Wallets;
            walletKeyIndex = (walletKeyIndex + 1) % walletKeys.length;

            if (wallet === Wallets.total) {
                return;
            }

            const walletData = this._jsonWallet.readJson();
            const formattedTotal = this._fmt.format(walletData.total);
            const formattedSquad = this._fmt.format(walletData[wallet]);
            const squadTotal = Object.entries(walletData).reduce((p, [ key, value ]) => {
                if (key === Wallets.total) {
                    return p;
                }

                return p + value;
            }, 0);
            const formattedPersonal = this._fmt.format(walletData.total - squadTotal);
            const squadAcronym = wallet.substring(0, 2).toUpperCase();
            this._tpClient.stateUpdate('sc_wallet_text', `T:\t${formattedTotal} aUEC\n${squadAcronym}:\t${formattedSquad} aUEC\nO:\t${formattedPersonal} aUEC`);
        }, 5000);
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
        let walletData = this._jsonWallet.readJson();
        if (actionType === ActionTypes.set) {
            walletData = this.setValue(wallet, walletData, add_value);
        } else {
            walletData = this.transferValue(wallet, actionType, walletData, add_value);
        }

        this.updateValues(walletData);
    }

    private setValue(wallet: Wallets, walletData: JsonWalletData, add_value: number) {
        return {
            ...walletData,
            [wallet]: add_value,
        } as JsonWalletData;
    }

    private transferValue(wallet: Wallets, actionType: ActionTypes, walletData: JsonWalletData, add_value: number) {
        if (actionType === ActionTypes.deposit) {
            walletData.total += add_value;
        } else {
            walletData.total -= add_value;
        }

        if (wallet !== Wallets.total) {
            if (actionType === ActionTypes.deposit) {
                walletData[wallet] += add_value;
            } else {
                walletData[wallet] -= add_value;
            }
        }

        return walletData;
    }

    private updateValues(walletData: JsonWalletData, writeJson = true) {
        Object.entries(walletData).forEach(([ key, value ]) => {
            this._tpClient.stateUpdate(`sc_wallet_${key}`, value);
        });

        this._tpClient.stateUpdate('sc_add_input_value', 0);
        this._tpClient.stateUpdate('sc_add_input_value_formatted', '0 aUEC');

        if (writeJson) {
            this._jsonWallet.writeJson(walletData);
        }
    }
}