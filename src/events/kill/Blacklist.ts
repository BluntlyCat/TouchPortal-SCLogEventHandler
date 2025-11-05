export class Blacklist {
    private readonly _blacklistedPeople: string[];

    public constructor(private readonly _blacklist: string) {
        this._blacklistedPeople = this._blacklist.split('\n').map((p) => p.toLowerCase());
    }

    public isBlacklisted(handle: string): boolean {
        return this._blacklistedPeople.includes(handle.toLowerCase());
    }
}