import { HistoryEntry } from './HistoryEntry';
import { KillData } from './KillData';
import { Client } from 'touchportal-api';
import { Languages } from '../../translations';

export class KillHistory {
    private _entries: HistoryEntry[];
    private _currentIndex = 0;

    constructor(private readonly _tpClient: Client, private readonly _locale: Languages) {
    }

    public add(killData: KillData) {
        this._entries.push(new HistoryEntry(killData, this._locale));
        this._currentIndex = this._entries.length - 1;
        this._tpClient.logIt('INFO', `Added new kill entry, having ${this.entryCount} entries now`);
    }

    public get currentEntry(): HistoryEntry {
        if (this.hasKillEvents) {
            return this._entries[this._currentIndex];
        }

        return null;
    }

    public clear(): void {
        this._entries = [];
        this._currentIndex = 0;
    }

    public get hasKillEvents(): boolean {
        return this._entries.length > 0;
    }

    public get currentIndex(): number {
        return this._currentIndex;
    }

    public get entryCount(): number {
        return this._entries.length;
    }

    public nextMessage(): void {
        this._currentIndex = (this.currentIndex + 1) % this.entryCount;
    }

    public previousMessage(): void {
        this._currentIndex = (this.currentIndex - 1 + this.entryCount) % this.entryCount;
    }
}