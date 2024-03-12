import { User } from "@system/User";

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

export enum SoundPlaybackOption
{
    AllowMultiple,
    DisallowMultiple,
}

export interface SoundTTSOptions
{
    voice: string;
}

export interface SoundControl
{
    speed: number;
    volume: number;
}

export interface Sound
{
    uri: string;
    volume: number;
    history: Array<Date>;
}

export interface SoundPlayback
{
    id: number;
    name: string;
    element: HTMLAudioElement;
    control: SoundControl;
    user?: User;
}

export interface SoundListeners
{
    onPlaybackStart?: (playback: SoundPlayback) => void | Promise<void>;
    onPlaybackEnd?: (playback: SoundPlayback) => void | Promise<void>;
}
