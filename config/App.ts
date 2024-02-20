/**
 * Local Imports
*/

import { Config } from '@system/Config';

/**
 * Config
*/

export const AppConfig = {
  get debug() { return Config('debug').toLowerCase() === 'true'; },
};
