/**
 * Local Imports
*/

import { Config } from '@system/Config';

/**
 * Config
*/

export const EventSubConfig = {
    get successMessage() { return Config('eventsub-success-message', 'HELLO'); },
};
