/**
 * Systems
*/

import { ProfileConfig } from '@config/Profile';
import { TwitchConfig } from '@config/Twitch';
import { ChronoDateDelta, DurationType } from '@system/Chrono';
import { StorageGet, StorageSet } from '@system/Storage';

/**
 * Relative Imports
*/

import { Profile, ProfileProvider } from './types';

/**
 * Private Functions
*/

/**
 * @return {Promise<Profile>}
 */
async function _getFromStorage(
    key: string): Promise<Profile>
{
    const storage = await StorageGet<Profile>(key);

    if (!storage || ChronoDateDelta(new Date, storage.writtenAt, DurationType.Days).value > 2) {
        return null;
    }

    return storage.data;
}

/**
 * Public Objects
*/

export const ProfileUsernameValidLengths: Record<ProfileProvider, [number,number]> = {
    [ProfileProvider.SRC]:    [4, 25],
    [ProfileProvider.Twitch]: [4, 25],
};

/**
 * Public Functions
*/

/**
 * @param {string} username
 *
 * @return {Promise<Profile>}
 */
export function ProfileGetFromSRC(
    username: string): Promise<Profile>
{
    return new Promise(async (resolve, reject) => {
        username = username.toLowerCase();

        if (ProfileConfig.storage.enabled) {
            const stored = await _getFromStorage(ProfileConfig.storage.keyPrefix.src + username);

            if (stored) {
                return resolve(stored);
            }
        }

        const response = await fetch(`https://www.speedrun.com/api/v1/users/${ username }`, {
            headers: {
                'Authorization': TwitchConfig.bearer,
                'Client-Id': TwitchConfig.client,
                'Content-Type': 'application/json',
            },
        });

        if (response.status !== 200) {
            reject();
        }

        const json = await response.json();
        const profile: Profile = {
            id: json.id,
            provider: ProfileProvider.SRC,
            name: json.names.international,
            login: json.names.international,
            avatar_url: null,
            color: {
                light: {
                    from: json['name-style']?.['color-from']?.light || 'white',
                    to: json['name-style']?.['color-to']?.light || 'white',
                },
                dark: {
                    from: json['name-style']?.['color-from']?.dark || 'white',
                    to: json['name-style']?.['color-to']?.dark || 'white',
                },
            },
        };

        if (ProfileConfig.storage.enabled) {
            await StorageSet(ProfileConfig.storage.keyPrefix.src + username, profile);
        }

        resolve(profile);
    });
}

/**
 * @param {string} username
 *
 * @return {Promise<Profile>}
 */
export function ProfileGetFromTwitch(
    username: string): Promise<Profile>
{
    return new Promise(async (resolve, reject) => {
        username = username.toLowerCase();

        if (ProfileConfig.storage.enabled) {
            const stored = await _getFromStorage(ProfileConfig.storage.keyPrefix.twitch + username);

            if (stored) {
                return resolve(stored);
            }
        }

        const response = await fetch(`https://api.twitch.tv/helix/users?login=${ username }`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.status !== 200) {
            reject();
        }

        const json = await response.json();
        const profile: Profile = {
            id: json.id,
            provider: ProfileProvider.Twitch,
            name: json.names.international,
            login: json.names.international,
            avatar_url: json.data[0].profile_image_url,
            color: {
                light: {
                    from: 'white',
                    to: 'white',
                },
                dark: {
                    from: 'white',
                    to: 'white',
                },
            },
        };

        if (ProfileConfig.storage.enabled) {
            await StorageSet(ProfileConfig.storage.keyPrefix.twitch + username, profile);
        }

        resolve(profile);
    });
}
