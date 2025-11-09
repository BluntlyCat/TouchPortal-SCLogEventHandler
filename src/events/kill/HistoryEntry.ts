import { KillData } from './KillData';
import { ActorTypes } from './filter/FilterData';

export class HistoryEntry {
    public constructor(private readonly _killData: KillData) {
    }

    get rawLine(): string {
        return this._killData.rawLine;
    }

    get blacklisted(): boolean {
        return this._killData.murdererOnBlacklist;
    }

    get murderer(): string {
        return `${this._killData.murderer}`;
    }

    get murdererFormatted(): string {
        if (this.blacklisted) {
            return `**${this.murderer}**`;
        }
        return this.murderer;
    }

    get murdererType() : ActorTypes {
        return this._killData.murdererType;
    }

    getMessage(index: number, entryCount: number) {
        return `Event ${index}/${entryCount}: ${this._killData.victim} was killed by ${this.murdererFormatted}\nWhen: ${this._killData.time}\nCause: ${this._killData.cause}`;
    }
}