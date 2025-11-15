import { JsonWalletData } from './types';
import { JsonWallet } from './JsonWallet';
import { Client } from 'touchportal-api';
import { clearInterval, setInterval } from 'node:timers';

export class WalletView {
    private readonly _fmt: Intl.NumberFormat;
    private readonly _updateInterval: number;
    private _timeout: NodeJS.Timeout;

    public constructor(private readonly _jsonWallet: JsonWallet, locale: string, updateInterval: string, private readonly _tpClient: Client) {
        this._fmt = new Intl.NumberFormat(locale);
        this._updateInterval = +updateInterval;
    }

    public startUpdate() {
        let walletKeyIndex = 0;
        this._timeout = setInterval(() => {
            const walletData = this._jsonWallet.readJson();
            const wallet = this._jsonWallet.wallets[walletKeyIndex];
            walletKeyIndex = (walletKeyIndex + 1) % this._jsonWallet.wallets.length;

            if (wallet === this._jsonWallet.totalWallet) {
                return;
            }

            this.updateView(walletData, wallet);
        }, this._updateInterval);
    }

    public stopUpdate() {
        clearInterval(this._timeout);
    }

    public updateView(walletData: JsonWalletData, wallet: string) {
        const formattedTotal = this._fmt.format(walletData.total);
        const squadTotal = Object.entries(walletData).reduce((p, [ key, value ]) => {
            if (key === this._jsonWallet.totalWallet) {
                return p;
            }

            return p + value;
        }, 0);
        const formattedPersonal = this._fmt.format(walletData.total - squadTotal);
        if (!!wallet) {
            const formattedSquad = this._fmt.format(walletData[wallet]);
            const ucWallet = wallet.substring(0, 1).toUpperCase() + wallet.substring(1, wallet.length);
            this._tpClient.stateUpdate('sc_wallet_formatted_text', `Total:\t${formattedTotal} aUEC\n${ucWallet}:\t${formattedSquad} aUEC\nOwn:\t${formattedPersonal} aUEC`);
        } else {
            this._tpClient.stateUpdate('sc_wallet_formatted_text', `Total:\t${formattedTotal} aUEC\nOwn:\t${formattedPersonal} aUEC`);
        }
    }
}