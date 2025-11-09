export enum ActorTypes {
    player = 'player',
    humanoid  = 'humanoid',
    pet = 'pet'
}

export interface FilterData {
    actor: string;
    type: ActorTypes
}