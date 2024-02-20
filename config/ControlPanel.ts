/**
 * Local Imports
*/

import { Config } from '@system/Config';

/**
 * Config
*/

export const ControlPanelConfig = {
    get host() { return Config('controlpanel-host', '127.0.0.1'); },
    get port() { return Config('controlpanel-port', '37513'); },
};
