/**
 * System
*/

import { AABB, Extent } from '@system/Geometry';

/**
 * Types/Interfaces
*/

export type VideoExtension = 'mp4' | 'mkv' | 'm4v' | 'webm';

export interface VideoEventHandler
{
    onCreate: (video: HTMLVideoElement) => void;
    onPlaybackStart: (video: HTMLVideoElement) => void;
    onPlaybackEnd: (video: HTMLVideoElement) => void;
}

export interface Video
{
    uri: string;
    extension: VideoExtension;
    history: Array<Date>;
    extent?: Extent;
}

export enum VideoPlaybackState
{
    Loading = 1,
    Playing = 2,
    Played  = 3,
    Error   = 4,
}

export interface VideoPlayback
{
    container: string;
    video: Video;
    element: HTMLVideoElement;
    when: Date;
    state: VideoPlaybackState;
    events?: VideoEventHandler;
    queueid?: string;
}

export interface VideoContainer
{
    element: HTMLDivElement;
    bounds: AABB;
    videos: Record<string, Video>;
}
