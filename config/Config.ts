/**
 * Local Imports
*/

import { ConfigKey } from '@system/Config/types';

/**
 * Config
*/

export interface ConfigConfigType
{
    required: Array<ConfigKey>;
}

export const ConfigConfig: ConfigConfigType = {
    required: [
        'channel',
        'oauth',
        'username',
    ],
};
