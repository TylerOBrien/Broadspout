/**
 * Local Imports
*/

import { Env } from '@system/Env';

/**
 * Config
*/

export const EventSubConfig = {
    get successMessage() { return Env('eventsub-success-message', 'HELLO'); },
};
