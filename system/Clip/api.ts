/**
 * System Imports
*/

import { ClipConfig } from '@config/Clip';
import { TwitchConfig } from '@config/Twitch';

/**
 * Config Imports
*/

import { ChatCommand, CommandRegister } from '@system/Command';
import { TmiSend } from '@system/Tmi';

/**
 * Private Functions
*/

/**
 * @return {Promise<any>}
 */
async function _createClip(): Promise<any>
{
    const url = `${ TwitchConfig.api }/clips?broadcaster_id=${ TwitchConfig.id }`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ TwitchConfig.oauth }`,
            'Client-Id': TwitchConfig.client,
            'Content-Type': 'application/json',
        },
    };

    return await (await fetch(url, options)).json();
}

/**
 * Fetches the specified clip from the Twitch API.
 *
 * @param {string} clipid The id of the clip.
 *
 * @return {Promise<any>}
 */
async function _fetchClip(
    clipid: string): Promise<any>
{
    const url = `${ TwitchConfig.api }/clips?id=${ clipid }`;
    const options = {
        headers: {
            'Authorization': `Bearer ${ TwitchConfig.oauth }`,
            'Client-Id': TwitchConfig.client,
            'Content-Type': 'application/json',
        },
    };

    return await (await fetch(url, options)).json();
}

/**
 * Attempts to handle the creation of a clip. The Twitch API does not guarantee
 * that this will succeed on the first call, if ever, so repeated attempts are
 * required.
 *
 * @param {ChatCommand} command The command object.
 * @param {any} response The response from the Twitch API.
 * @param {number} attempts The number of attempts at fetching this clip.
 *
 * @return {Promise<void>}
 */
async function _handleCreateClip(
    command: ChatCommand,
    response: any,
    attempts: number = 0): Promise<void>
{
    if (attempts === ClipConfig.maxCreateAttempts) {
        return _handleFailCreate(command);
    }

    const clip = await _fetchClip(response.data[0].id);

    if (clip?.data?.length) {
        TmiSend(`Clip created for @${ command.user.name }.`);
        TmiSend(clip.data[0].url);
    } else {
        setTimeout(() => _handleCreateClip(command, response, attempts + 1), 250);
    }
}

/**
 * @return {void}
 */
function _handleFailCreate(
    command: ChatCommand): void
{
    //
}

/**
 * Creates a new clip when the !clip command is used in chat.
 *
 * @param {ChatCommand} command The command object.
 *
 * @return {void}
 */
async function _handleClipCommand(
    command: ChatCommand): Promise<void>
{
    TmiSend(`Creating your clip, @${ command.user.name }. Please wait...`);

    const response = await _createClip();

    if (response?.data?.length) {
        _handleCreateClip(command, response);
    } else {
        _handleFailCreate(command);
    }
}

/**
 * Public Functions
*/

/**
 * Prepares the Clip API for usage. Should only be called once.
 *
 * @return {Promise<void>}
 */
export async function ClipInit(): Promise<void>
{
    CommandRegister('clip', _handleClipCommand);
}
