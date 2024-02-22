/**
 * Local Imports
*/

import { Config } from '@system/Config';

/**
 * Config
*/

export const VideoConfig = {
    get elementId() { return 'videos'; },
    get x() { return Config('video-uri', '/json/videos.json'); },
    get y() { return Config('video-uri', '/json/videos.json'); },
    get width() { return Config('video-uri', '/json/videos.json'); },
    get height() { return Config('video-uri', '/json/videos.json'); },
    get uri() { return Config('video-uri', '/json/videos.json'); },
    get cooldownEnabled() { return true; },
    get cooldownResponseEnabled() { return true; },
};
