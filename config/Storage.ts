/**
 * System
*/

import { StorageMode } from '@system/Storage';

/**
 * Config
*/

export const StorageConfig = {
    remote: {
        get protocol() { return 'http'; },
        get host()     { return 'localhost'; },
        get port()     { return 80; },
    },
    get defaultMode() { return StorageMode.Local; }
};
