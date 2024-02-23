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
    onVisible: () => void;
    onPlaybackStart: () => void;
    onPlaybackEnd: () => void;
}

export interface Video
{
    uri: string;
    extension: VideoExtension;
    history: Array<Date>;
    extent?: Extent;
}

export interface VideoContainer
{
    element: HTMLDivElement;
    bounds: AABB;
    videos: Record<string, Video>;
}
