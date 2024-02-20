/**
 * Public Functions
*/

/**
 * @param {string} twitchid
 *
 * @return {Promise<void>}
 */
export async function EmoteDriverBttvLoad(
    twitchid: string): Promise<Record<string, string>>
{
    const emotes: Record<string, string> = {};
    const response = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${ twitchid }`);
    const json = await response.json();

    for (const emote of json.channelEmotes) {
        emotes[emote.code.toLowerCase()] = emote.id;
    }

    for (const emote of json.sharedEmotes) {
        emotes[emote.code.toLowerCase()] = emote.id;
    }

    return emotes;
}
