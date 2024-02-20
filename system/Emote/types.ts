export type EmoteSize = '1' | '2' | '3';
export type EmoteProviderType = 'bttv' | 'twitch';

export enum EmoteProvider
{
    Bttv,
    Twitch,
}

export type Emotes = Record<EmoteProvider, Record<string, string>>;
