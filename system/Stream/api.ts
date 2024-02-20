/**
 * Config
*/

import { TwitchConfig } from '@config/Twitch';

/**
 * Relative Imports
*/

import { StreamHttpOptions } from './types';

/**
 * Locals
*/

let _options: StreamHttpOptions;

/**
 * Public Functions
*/

/**
 * @param {string} game
 *
 * @return {Promise<void>}
 */
export function StreamSetGame(
    game_id: string): Promise<void>
{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`${ TwitchConfig.api }/channels?broadcaster_id=${ TwitchConfig.id }`, {
            ..._options,
            method: 'PATCH',
            body: JSON.stringify({ game_id }),
        });

        if (response.status === 200) {
            resolve();
        } else {
            reject();
        }
    });
}

/**
 * @param {string} title
 *
 * @return {Promise<void>}
 */
export function StreamSetTitle(
    title: string): Promise<void>
{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(`${ TwitchConfig.api }/channels?broadcaster_id=${ TwitchConfig.id }`, {
            ..._options,
            method: 'PATCH',
            body: JSON.stringify({ title }),
        });

        if (response.status === 200) {
            resolve();
        } else {
            reject();
        }
    });
}

/**
 * @return {Promise<void>}
 */
export function StreamInit(): Promise<void>
{
    return new Promise(resolve => {
        _options = {
            headers: {
                'Authorization': TwitchConfig.bearer,
                'Client-Id': TwitchConfig.client,
                'Content-Type': 'application/json',
            },
        };

        resolve();
    });
}
