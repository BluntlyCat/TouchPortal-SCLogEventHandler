import { KillData } from './KillData';

export class HistoryEntry {
    public constructor(private readonly _killData: KillData) {
    }

    get rawLine(): string {
        return this._killData.rawLine;
    }

    get blacklisted(): boolean {
        return this._killData.killerOnBlacklist;
    }

    get killer(): string {
        if (this.blacklisted) {
            return `**${this._killData.killer}**`;
        }
        return `*${this._killData.killer}*`;
    }

    getMessage(index: number, entryCount: number) {
        return `Event ${index}/${entryCount}: ${this._killData.victim} was killed by ${this.killer}\nWhen: ${this._killData.time}\nCause: ${this._killData.cause}`;
    }
}