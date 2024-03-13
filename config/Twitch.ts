/**
 * Local Imports
*/

import { Env } from '@system/Env';

/**
 * Config
*/

export const TwitchConfig = {
    get api()      { return 'https://api.twitch.tv/helix'; },
    get id()       { return Env('twitchid'); },
    get channel()  { return Env('channel'); },
    get username() { return Env('username'); },
    get oauth()    { return Env('oauth'); },
    get bearer()   { return Env('bearer'); },
    get client()   { return Env('client'); },
};
