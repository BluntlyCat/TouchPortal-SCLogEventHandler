import { KillData } from './KillData';

export class HistoryEntry {
    public constructor(private readonly _killData: KillData) {
    }

    get rawLine(): string {
        return this._killData.rawLine;
    }

    getMessage(index: number, entryCount: number) {
        return `Event ${index}/${entryCount}: ${this._killData.victim} was killed by ${this._killData.killer}\nWhen: ${this._killData.time}\nCause: ${this._killData.cause}`;
    }
}