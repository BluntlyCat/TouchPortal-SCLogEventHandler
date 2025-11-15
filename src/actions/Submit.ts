import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { ActionTypes, JsonWalletData } from './types';
import { JsonWallet } from './JsonWallet';
import { WalletView } from './WalletView';


export class Submit extends BaseAction {
    public constructor(tpClient: Client, key: string, private readonly _jsonWallet: JsonWallet, private readonly _walletView: WalletView) {
        super(tpClient, key);

        const walletData = this._jsonWallet.readJson();
        _walletView.updateView(walletData, _jsonWallet.wallets.length > 1 ? _jsonWallet.wallets[1] : '');
    }

    exec(actionData: any): void {
        const targetWallet = actionData.data.find((d) => d.id === 'sc_target_wallet')?.value;
        if (!this._jsonWallet.wallets.includes(targetWallet)) {
            return;
        }

        const sc_wallet_action_type = actionData.data.find((d) => d.id === 'sc_wallet_action_type')?.value;
        if (!Object.values(ActionTypes).includes(sc_wallet_action_type as ActionTypes)) {
            return;
        }

        const actionType = sc_wallet_action_type as ActionTypes;

        const add_value = +actionData.data.find((d) => d.id === 'sc_wallet_add_value')?.value;
        const proportion = +actionData.data.find((d) => d.id === 'sc_wallet_add_proportion')?.value;

        let walletData = this._jsonWallet.readJson();
        if (actionType === ActionTypes.set) {
            walletData = this.setValue(targetWallet, walletData, add_value);
        } else {
            walletData = this.transferValue(targetWallet, actionType, walletData, add_value, proportion);
        }

        this._jsonWallet.writeJson(walletData);
        this._walletView.updateView(walletData, targetWallet);
        this.resetValues();
    }

    private setValue(wallet: string, walletData: JsonWalletData, add_value: number) {
        return {
            ...walletData,
            [wallet]: add_value,
        } as JsonWalletData;
    }

    private transferValue(wallet: string, actionType: ActionTypes, walletData: JsonWalletData, add_value: number, proportion: number) {
        if (actionType === ActionTypes.deposit) {
            walletData.total += add_value;
        } else {
            walletData.total -= add_value;
        }

        if (wallet !== this._jsonWallet.totalWallet) {
            if (actionType === ActionTypes.deposit) {
                walletData[wallet] += add_value * proportion;
            } else {
                walletData[wallet] -= add_value * proportion;
            }
        }

        return walletData;
    }

    private resetValues() {
        this._tpClient.stateUpdate('sc_wallet_digits', 0);
        this._tpClient.stateUpdate('sc_wallet_digits_formatted', '0 aUEC');
    }
}