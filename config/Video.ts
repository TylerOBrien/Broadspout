/**
 * Local Imports
*/

import { Env } from '@system/Env';

/**
 * Config
*/

export const VideoConfig = {
    history: {
        get category() { return 'Video'; },
    },
    get baseElementId() { return 'videos'; },
    get host() { return 'http://127.0.0.1'; },
    get x() { return Env('video-uri', '/json/videos.json'); },
    get y() { return Env('video-uri', '/json/videos.json'); },
    get width() { return Env('video-uri', '/json/videos.json'); },
    get height() { return Env('video-uri', '/json/videos.json'); },
    get uri() { return Env('video-uri', '/json/videos.json'); },
    get cooldownEnabled() { return true; },
    get cooldownResponseEnabled() { return true; },
};
