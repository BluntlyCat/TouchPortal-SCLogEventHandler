export class History {
    private readonly _message: string;
    private readonly _fullLine: string;

    constructor(message: string, fullLine: string) {
        this._message = message;
        this._fullLine = fullLine;
    }

    get message(): string {
        return this._message;
    }

    get fullLine(): string {
        return this._fullLine;
    }
}