/**
 * Root Imports
*/

import joi from 'joi';

/**
 * Config
*/

import { SoundConfig } from '@config/Sound';

/**
 * Relative Imports
*/

import { Sound } from './types';

/**
 * Locals
*/

const _schema = joi.object({
    uri: joi.string(),
    cooldown: joi.number(),
    volume: joi.number(),
});

/**
 * Public Functions
*/

/**
 * @return {Promise<Record<string, Sound>>}
 */
export function SoundFetchSounds(): Promise<Record<string, Sound>>
{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(SoundConfig.sounds.uri);

        if (response.status !== 200) {
            return reject();
        }

        const data = await response.json();

        if (Array.isArray(data) || typeof data !== 'object') {
            return reject();
        }

        try {
            for (const name in data) {
                _schema.validate(data[name]);
            }
        } catch (error) {
            return reject();
        }

        resolve(data);
    })
}
