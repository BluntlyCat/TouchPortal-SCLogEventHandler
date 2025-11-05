export interface Action {
    get key(): string;
    exec(): void;
}