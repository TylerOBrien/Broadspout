/**
 * Local Imports
*/

import { Config } from '@system/Config';

/**
 * Config
*/

export const SoundConfig = {
    sounds: {
        get uri() { return Config('sound-uri', '/json/sounds.json'); },
    },
    get maxFetchAttempts() { return 5; },
    get defaultDelayAfterPlayback() { return 33; },
};
