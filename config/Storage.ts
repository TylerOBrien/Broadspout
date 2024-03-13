/**
 * System
*/

import { Env } from '@system/Env';
import { StorageMode } from '@system/Storage';

/**
 * Config
*/

export const StorageConfig = {
    remote: {
        get protocol() { return Env('storage-protocol', 'http'); },
        get host()     { return Env('storage-host', 'localhost'); },
        get port()     { return Env('storage-port', '80'); },
    },
};
