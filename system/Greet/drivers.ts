/**
 * Config
*/

import { GreetConfig } from '@config/Greet';
import { SoundExists } from '@system/Sound';
import { VideoExists } from '@system/Video/api';

/**
 * Relative Imports
*/

import { Greeting } from './types';

/**
 * Public Functions
*/

/**
 * @return {Promise<Record<string, Greeting>>}
 */
export async function GreetFetchGreetings(): Promise<Record<string, Greeting>>
{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(GreetConfig.greetings.uri);
        const data = await response.json();

        if (Array.isArray(data) || typeof data !== 'object') {
            return reject();
        }

        for (const username in data) {
            if (data[username].sound && !SoundExists(data[username].sound)) {
                return reject();
            } else  if (data[username].video && !VideoExists(data[username].video)) {
                return reject();
            }
        }

        resolve(data);
    });
}
