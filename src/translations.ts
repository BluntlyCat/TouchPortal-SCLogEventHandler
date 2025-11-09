export enum Languages {
    de = 'de',
    en = 'en',
}

export type TranslationsType = Record<Languages, Record<string, string>>

export const TRANSLATIONS: TranslationsType = {
    [Languages.en]: {
        event: 'Event',
        when: 'When',
        cause: 'Cause',
        killedBy: 'was killed by',
    },
    [Languages.de]: {
        event: 'Ereignis',
        when: 'Wann',
        cause: 'Grund',
        killedBy: 'wurde getötet von',
        suicide: 'Selbstmord',
        bullet: 'Kugel',
        crash: 'Unfall',
    }
}