import { ActorTypes } from './filter/FilterData';

export interface KillData {
    rawLine: string;
    victim: string;
    murderer: string;
    time: string;
    cause: string;
    zone: string;
    murdererOnBlacklist: boolean;
    murdererType: ActorTypes;
}