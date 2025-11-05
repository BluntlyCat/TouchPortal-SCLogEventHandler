export interface Line {
    str: string;
    byteEndOffset: number;
}

export interface Handler {
    get key(): string;
    handle(line: Line): void;
}