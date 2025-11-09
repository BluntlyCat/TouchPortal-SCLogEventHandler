import { KillData } from './KillData';
import { ActorTypes } from './filter/FilterData';
import { Languages, TRANSLATIONS } from '../../translations';

export class HistoryEntry {
    private readonly _translations: Record<string, string>;

    public constructor(private readonly _killData: KillData, locale: Languages) {
        this._translations = TRANSLATIONS[locale];
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

    get murdererType(): ActorTypes {
        return this._killData.murdererType;
    }

    get time(): string {
        return this._killData.time;
    }

    getMessage(index: number, entryCount: number, time: string) {
        return `${index}/${entryCount}: ${this._killData.victim} ${this._translations['killedBy']} ${this.murdererFormatted}\n${this._translations['when']}: ${time}\n${this._translations['cause']}: ${this.getCause(this._killData.cause)}`;
    }

    private getCause(cause: string): string {
        return this._translations[cause.toLowerCase()] || cause;
    }
}