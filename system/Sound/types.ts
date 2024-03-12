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
}

export interface SoundPlayback
{
    id: number;
    name: string;
    element: HTMLAudioElement;
    control: SoundControl;
    user?: User;
}

export enum SoundPlaybackError
{
    NoError = 'NoError',
    NotFound = 'NotFound',
    Cooldown = 'Cooldown',
    QueueReject = 'QueueReject',
}

export interface SoundPlaybackResult
{
    error: SoundPlaybackError;
}

export interface SoundListeners
{
    onCreate?: (playback: SoundPlayback) => void;
    onSuccess?: (result: SoundPlaybackResult) => void;
    onReject?: (result: SoundPlaybackResult) => void;
    onPlaybackStart?: (playback: SoundPlayback) => void;
    onPlaybackEnd?: (playback: SoundPlayback) => void;
}
