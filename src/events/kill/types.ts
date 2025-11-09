export type VictimMatch   = RegExpExecArray & { groups: { victim: string } };
export type MurdererMatch = RegExpExecArray & { groups: { murderer: string } };
export type KillDataMatch = RegExpExecArray & { groups: { timestamp: string; zone: string; dmgType: string } };