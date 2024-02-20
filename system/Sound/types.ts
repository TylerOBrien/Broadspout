export enum SoundState
{
    Idle,
    Playing,
}

export enum SoundPlayType
{
    File,
    TTS,
}

export interface SoundTTSOptions
{
    voice: string;
}

export interface Sound
{
    uri: string;
    cooldown: number;
    volume: number;
}
