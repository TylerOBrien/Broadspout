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

import { Profile } from './types';

/**
 * Public Functions
*/

/**
 * @param {string} username
 *
 * @return {Promise<Profile>}
 */
export function ProfileDriverSRC(
    username: string): Promise<Profile>
{
    return new Promise(async (resolve, reject) => {
        username = username.toLowerCase();

        if (ProfileConfig.storage.enabled) {
            const storage = await StorageGet<Profile>(ProfileConfig.storage.keyPrefix.src + username);

            if (storage && ChronoDateDelta(new Date, storage.writtenAt, DurationType.Days).value > 2) {
                return resolve(storage.data);
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
export function ProfileDriverTwitch(
    username: string): Promise<Profile>
{
    return new Promise(async (resolve, reject) => {
        username = username.toLowerCase();

        if (ProfileConfig.storage.enabled) {
            const storage = await StorageGet<Profile>(ProfileConfig.storage.keyPrefix.twitch + username);

            if (storage) {
                return resolve(storage.data);
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
