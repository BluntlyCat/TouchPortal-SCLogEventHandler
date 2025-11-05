import { KillData } from './KillData';

export class HistoryEntry {
    public constructor(private readonly _killData: KillData) {
    }

    get rawLine(): string {
        return this._killData.rawLine;
    }

    getMessage(index: number, entryCount: number) {
        return `Event ${index}/${entryCount}:\t${this._killData.victim} was killed by ${this._killData.killer}\nWhen:\t${this._killData.time}\nCause:\t${this._killData.cause}`;
    }
}