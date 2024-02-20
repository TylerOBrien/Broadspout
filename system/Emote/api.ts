/**
 * Config
*/

import { TwitchConfig } from '@config/Twitch';

/**
 * Sibling Imports
*/

import { EmoteDriverBttvLoad } from './drivers';
import { Emotes, EmoteProvider, EmoteSize } from './types';

/**
 * Locals
*/

let _emotes: Emotes;

/**
 * Private Functions
*/

/**
 * @return {Promise<void>}
 */
async function _loadNonTwitchEmotes(): Promise<void>
{
    const bttv = await EmoteDriverBttvLoad(TwitchConfig.id);

    for (const word in bttv) {
        _emotes[EmoteProvider.Bttv][word] = bttv[word];
    }
}

/**
 * Public Functions
*/

/**
 * Returns the id of the emote for the given provider.
 *
 * @param {string} word
 * @param {EmoteProvider} provider
 *
 * @return {string}
 */
export function EmoteId(
    word: string,
    provider: EmoteProvider = EmoteProvider.Twitch): string
{
    return _emotes[provider][word];
}

/**
 * Generates the URL for the image of the specified emote. This does not
 * guarantee that the given emote id is valid. The only guarantee is that the
 * URL is correctly formatted.
 *
 * @param {string} id Unique id of the emote.
 * @param {EmoteSize} size Resolution size of the emote.
 * @param {EmoteProvider} provider Which provider to use.
 *
 * @return {string}
 */
export function EmoteUrl(
    id: string,
    size: EmoteSize = '3',
    provider: EmoteProvider = EmoteProvider.Twitch): string
{
    switch (provider) {
    case EmoteProvider.Bttv:
        return `https://cdn.betterttv.net/emote/${ id }/${ size }x`;
    case EmoteProvider.Twitch:
        return `https://static-cdn.jtvnw.net/emoticons/v2/${ id }/default/dark/${ size }.0`;
    }
}

/**
 * @return {Promise<void>}
 */
export async function EmoteInit(): Promise<void>
{
    _emotes = {
        [EmoteProvider.Bttv]: {},
        [EmoteProvider.Twitch]: {},
    };

    if (TwitchConfig.id) {
        await _loadNonTwitchEmotes();
    }
}
