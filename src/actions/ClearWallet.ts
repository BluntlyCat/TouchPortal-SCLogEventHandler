import { BaseAction } from './BaseAction';
import { Client } from 'touchportal-api';
import { JsonWallet } from './JsonWallet';
import { WalletView } from './WalletView';

export class ClearWallet extends BaseAction {
    public constructor(tpClient: Client, private readonly _jsonWallet: JsonWallet, private readonly _walletView: WalletView, key: string) {
        super(tpClient, key);
    }

    exec(): void {
        this._tpClient.stateUpdate('sc_wallet_digits', 0);
        this._tpClient.stateUpdate('sc_wallet_digits_formatted', '0 aUEC');
        this._tpClient.stateUpdate('sc_wallet_target_wallet', this._jsonWallet.totalWallet);

        const walletData = this._jsonWallet.emptyWallet();
        this._jsonWallet.writeJson(walletData);
        this._walletView.updateView(walletData,  this._jsonWallet.wallets.length > 1 ? this._jsonWallet.wallets[1] : '');
    }
}