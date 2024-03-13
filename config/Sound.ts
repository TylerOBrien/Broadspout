/**
 * Local Imports
*/

import { Env } from '@system/Env';

/**
 * Config
*/

export const SoundConfig = {
    history: {
        get category() { return 'Sound'; },
    },
    sounds: {
        get uri() { return Env('sound-uri', '/json/sounds.json'); },
    },
    get cooldownEnabled() { return true; },
    get cooldownResponseEnabled() { return true; },
    get maxFetchAttempts() { return 5; },
    get defaultDelayAfterPlayback() { return 33; },
};
