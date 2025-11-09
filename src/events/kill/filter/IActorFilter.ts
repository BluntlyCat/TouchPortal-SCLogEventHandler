import { FilterData } from './FilterData';

export interface IActorFilter {
    isValid(actor: string): boolean;
    exec(actor: string): FilterData|null;
}