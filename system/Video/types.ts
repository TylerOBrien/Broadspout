/**
 * System
*/

import { Extent } from '@system/Geometry';

/**
 * Types/Interfaces
*/

export type VideoExtension = 'mp4' | 'mkv' | 'm4v' | 'webm';

export interface VideoEventHandler
{
    onPlaybackStart: () => void;
    onPlaybackEnd: () => void;
}

export interface VideoPlaybackHistory
{
    from: Date;
    to?: Date;
}

export interface Video
{
    uri: string;
    extension: VideoExtension;
    history: Array<VideoPlaybackHistory>;
    extent?: Extent;
}
