export interface IActorFilter {
    isValid(actor: string): boolean;
    exec(actor: string): string;
}