/**
 * Config Imports
*/

import { SpeedrunComConfig } from '@config/SpeedrunCom';

/**
 * Local Imports
*/

import {
    SpeedrunComGame,
    SpeedrunComCategory,
    SpeedrunComVariable,
    SpeedrunComUser,
    SpeedrunComQueryType } from './types';

/**
 * Public Functions
*/

/**
 * @return {Promise<SpeedrunComUser>}
 */
export function SpeedrunComGetUser(
    query: string,
    type: SpeedrunComQueryType = SpeedrunComQueryType.Name): Promise<SpeedrunComUser>
{
    return new Promise(async resolve => {
        const isOne = type === SpeedrunComQueryType.Id;
        const uri = isOne ? '/users/' : `/users?${ type }=`;
        const response = await fetch(`${ SpeedrunComConfig.api }${ uri }${ query }`);
        const json = await response.json();
        const isValid = isOne ? !!json?.data?.id : !!json?.data?.length;

        if (!isValid) {
            resolve(null);
        }

        const item = isOne ? json.data : json.data[0];

        resolve({
            id: item.id,
            name: item.names.international,
            color: {
                from: item['name-style']['color-from'].dark,
                to: item['name-style']['color-to'].dark,
            },
        });
    });
}

/**
 * @return {Promise<SpeedrunComGame>}
 */
export function SpeedrunComGetGame(
    query: string,
    platform: string = null,
    type: SpeedrunComQueryType = SpeedrunComQueryType.Name): Promise<SpeedrunComGame>
{
    return new Promise(async resolve => {
        query = query.trim().toLowerCase();

        const isOne = type === SpeedrunComQueryType.Id;
        const uri = isOne ? '/games/' : `/games?${ type }=`;
        const response = await fetch(`${ SpeedrunComConfig.api }${ uri }${ query }`);
        const json = await response.json();
        const isValid = isOne ? !!json?.data?.id : !!json?.data?.length;

        if (!isValid) {
            resolve(null);
        }

        let item = isOne ? json.data : json.data[0];
        let isMatch = isOne || (item.names.international.toLowerCase() === query);
        const end = isMatch ? 0 : json.data.length;

        for (let i = 0; i < end; i++) {
            if (json.data[i].abbreviation.toLowerCase() === query) {
                item = json.data[i];
                break;
            }
        }

        resolve({
            id: item.id,
            name: item.names.international,
            assets: {
                cover: item.assets['cover-large'],
                trophy1st: item.assets['trophy-1st'],
                trophy2nd: item.assets['trophy-2nd'],
                trophy3rd: item.assets['trophy-3rd'],
            },
            ruleset: {
                showMilliseconds: item.ruleset['show-milliseconds'],
                emulatorsAllowed: item.ruleset['emulators-allowed'],
                defaultTime: item.ruleset['default-time'],
            },
        });
    });
}

/**
 * @return {Promise<SpeedrunComCategory>}
 */
export function SpeedrunComGetCategory(
    query: string,
    game_id?: string): Promise<SpeedrunComCategory>
{
    return new Promise(async resolve => {
        query = query.trim().toLowerCase();

        const uri = game_id ? `/games/${ game_id }/categories` : `/categories/${ query }`;
        const response = await fetch(`${ SpeedrunComConfig.api }${ uri }`);
        const json = await response.json();

        if (!game_id) {
            return resolve({
                id: json.data.id,
                name: json.data.name,
            });
        }

        const space = /[ ]/g;

        for (const item of json.data) {
            const name = item.name.toLowerCase();

            if (name === query || name.replace(space, '') === query) {
                return resolve({
                    id: item.id,
                    name: item.name,
                });
            }
        }

        resolve(null);
    });
}

/**
 * @return {Promise<Array<SpeedrunComVariable>>}
 */
export function SpeedrunComGetVariables(
    categoryid: string): Promise<Array<SpeedrunComVariable>>
{
    return new Promise(async resolve => {
        const response = await fetch(`${ SpeedrunComConfig.api }/categories/${ categoryid }/variables`);
        const json = await response.json();

        resolve(json.data);
    });
}
