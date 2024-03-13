/**
 * Relative Imports
*/

import { ProfileGetFromSRC, ProfileGetFromTwitch } from './drivers';
import { Profile, ProfileProvider } from './types';

/**
 * Public Functions
*/

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
        return await ProfileGetFromSRC(username);
    case ProfileProvider.Twitch:
        return await ProfileGetFromTwitch(username);
    }
}

/**
 * Returns true if the given username is valid for the given profile service
 * provider. False otherwise.
 *
 * @param {string} username The name of the user.
 * @param {ProfileProvider} provider The service to check username validity for.
 *
 * @return {boolean} Whether the username is valid for the provider.
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
