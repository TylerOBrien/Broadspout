/**
 * System
*/

import { isAlphaNumericChar } from '@system/Utility';

/**
 * Relative Imports
*/


import { ProfileGetFromSRC, ProfileGetFromTwitch, ProfileUsernameValidLengths } from './drivers';
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
    provider: ProfileProvider): Promise<Profile>
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
    provider: ProfileProvider): boolean
{
    const length = username?.length ?? 0;
    const [ min, max ] = ProfileUsernameValidLengths[provider];

    if (length < min || length > max) {
        return false;
    }

    let index = length;

    while (index--) {
        if (username[index] !== '_' && !isAlphaNumericChar(username.charCodeAt(index))) {
            return false;
        }
    }

    return true;
}
