import path from 'node:path';
import os from 'node:os';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { JsonWalletData, Wallets } from './types';

export class JsonWallet {
    private readonly _moneyJson: string;
    private readonly _walletData: JsonWalletData;

    public constructor(private readonly _encoding: BufferEncoding) {
        this._moneyJson = path.join(os.homedir(), '.touch_portal_star_citizen_tools_wallet.json');
        this._walletData = this.readJson();
    }

    public static emptyWallet(): JsonWalletData {
        return Object.fromEntries(Object.values(Wallets).map(key => [ key, 0 ])) as JsonWalletData
    }

    public get walletData(): JsonWalletData {
        return this._walletData;
    }

    public writeJson(walletData: JsonWalletData): void {
        writeFileSync(this._moneyJson, JSON.stringify(walletData), {encoding: this._encoding});
    }

    public readJson(): JsonWalletData {
        if (!existsSync(this._moneyJson)) {
            this.writeJson(JsonWallet.emptyWallet());
        }

        return JSON.parse(readFileSync(this._moneyJson, {encoding: this._encoding})) as JsonWalletData;
    }
}