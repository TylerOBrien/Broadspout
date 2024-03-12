/**
 * System
*/

import { Duration } from '@system/Chrono';
import { AABB, Extent, Point } from '@system/Geometry';
import { UserIdentity } from '@system/User';

/**
 * Types/Interfaces
*/

export type VideoExtension = 'mp4' | 'mkv' | 'm4v' | 'webm';

export interface Video
{
    uri: string;
    extension: VideoExtension;
    extent?: Extent;
    duration?: Duration;
}

export interface VideoControl
{
    position?: Point;
    speed?: number;
    volume?: number;
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
    control: VideoControl;
    when: Date;
    state: VideoPlaybackState;
    events?: VideoEventHandler;
    queueid?: string;
    position?: Point;
}

export enum VideoPlaybackError
{
    NoError = 'NoError',
    NotFound = 'NotFound',
    Cooldown = 'Cooldown',
    QueueReject = 'QueueReject',
}

export interface VideoPlaybackResult
{
    error: VideoPlaybackError;
}

export interface VideoContainer
{
    element: HTMLDivElement;
    bounds: AABB;
    videos: Record<string, Video>;
}

export interface VideoEventHandler
{
    onCreate?: (playback: VideoPlayback) => void;
    onReject?: () => void;
    onPlaybackStart?: (playback: VideoPlayback) => void;
    onPlaybackEnd?: (playback: VideoPlayback) => void;
}
