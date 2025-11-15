import path from 'node:path';
import os from 'node:os';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { JsonWalletData } from './types';

export class JsonWallet {
    private readonly _moneyJson: string;
    private readonly _wallets: string[];
    private readonly _walletData: JsonWalletData;
    private readonly _totalWallet = 'total';

    public constructor(wallets: string, private readonly _encoding: BufferEncoding) {
        this._moneyJson = path.join(os.homedir(), '.touch_portal_star_citizen_tools_wallet.json');

        const customWallets = this.getCustomWallets(wallets);
        if (!!customWallets.length) {

        }

        this._wallets = [ this._totalWallet, ...customWallets ];
        this._walletData = this.readJson();
    }

    public emptyWallet(): JsonWalletData {
        return Object.fromEntries(this._wallets.map(key => [ key, 0 ])) as JsonWalletData;
    }

    public get totalWallet(): string {
        return this._totalWallet;
    }

    public get wallets(): string[] {
        return this._wallets;
    }

    public get walletData(): JsonWalletData {
        return this._walletData;
    }

    public writeJson(walletData: JsonWalletData): void {
        writeFileSync(this._moneyJson, JSON.stringify(walletData), {encoding: this._encoding});
    }

    public readJson(): JsonWalletData {
        let walletData = this.emptyWallet();
        if (!existsSync(this._moneyJson)) {
            this.writeJson(walletData);
        }

        walletData = JSON.parse(readFileSync(this._moneyJson, {encoding: this._encoding})) as JsonWalletData;
        const currentWalletAmount = Object.keys(walletData).length;
        if (currentWalletAmount !== this._wallets.length) {
            const activeWallets = [...this._wallets];
            walletData = Object.fromEntries(activeWallets.map(key => [ key, walletData[key] || 0 ])) as JsonWalletData;
            this.writeJson(walletData);
        }

        return walletData;
    }

    private getCustomWallets(wallets: string): string[] {
        if (!!wallets === false || /[a-z,]+/.test(wallets) === false) {
            return [];
        }

        if (wallets.endsWith(',')) {
            wallets = wallets[wallets.length - 1];
        }

        if (wallets.startsWith(',')) {
            wallets = wallets.substring(1, wallets.length - 1);
        }

        return wallets.split(',');
    }
}