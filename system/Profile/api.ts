/**
 * Config
*/

import { TwitchConfig } from '@config/Twitch';

/**
 * Relative Imports
*/

import { ProfileDriverSRC, ProfileDriverTwitch } from './drivers';
import { Profile, ProfileHttpOptions, ProfileProvider } from './types';

/**
 * Locals
*/

let _options: Record<ProfileProvider, ProfileHttpOptions>;

/**
 * Public Functions
*/

/**
 * Returns true if the given username is valid for the given profile service
 * provider. False otherwise.
 *
 * @param {string} username The name of the user.
 * @param {ProfileProvider} provider The service to check username validity for.
 *
 * @return {boolean}
 */
export function ProfileIsValidUsername(
    username: string,
    provider: ProfileProvider = ProfileProvider.Twitch): boolean
{
    if (username.length < 4 || username.length > 25) {
        return false;
    }

    return true;
}

/**
 * Returns a new profile object for the given user.
 *
 * @param {string} username The name of the user.
 * @param {ProfileProvider} provider The service to fetch the profile from.
 *
 * @return {Promise<Profile>} The profile object.
 */
export async function ProfileGet(
    username: string,
    provider: ProfileProvider = ProfileProvider.Twitch): Promise<Profile>
{
    if (!ProfileIsValidUsername(username, provider)) {
        throw new Error; // TODO: handle error
    }

    switch (provider) {
    case ProfileProvider.SRC:
        return await ProfileDriverSRC(username, _options[provider]);
    case ProfileProvider.Twitch:
        return await ProfileDriverTwitch(username, _options[provider]);
    }
}

/**
 * @return {Promise<void>}
 */
export async function ProfileInit(): Promise<void>
{
    _options = {
        [ProfileProvider.SRC]: {
            headers: {
                'Content-Type': 'application/json',
            },
        },
        [ProfileProvider.Twitch]: {
            headers: {
                'Authorization': TwitchConfig.bearer,
                'Client-Id': TwitchConfig.client,
                'Content-Type': 'application/json',
            },
        },
    };
}
