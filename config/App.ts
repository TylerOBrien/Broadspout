/**
 * Local Imports
*/

import { Env } from '@system/Env';

/**
 * Config
*/

export const AppConfig = {
  get debug() { return Env('debug').toLowerCase() === 'true'; },
};
