/**
 * Config Imports
*/

import { ShoutOutConfig } from '@config/ShoutOut';
import { TwitchConfig } from '@config/Twitch';

/**
 * System Imports
*/

import { ChatCommand, ChatCommandRegister } from '@system/Command';
import { ProfileGet, ProfileIsValidUsername, ProfileProvider } from '@system/Profile';
import { User } from '@system/User';

/**
 * Relative Imports
*/

import { ShoutoutHandler } from './types';

/**
 * Locals
*/

let _handler: ShoutoutHandler;

/**
 * Private Functions
*/

/**
 * @param {User} shouter The user whom called the shoutout command.
 * @param {string} username The username being shouted.
 *
 * @return {boolean} Whether the shouter is allowed to shout.
 */
function _isAllowedToShoutOut(
    shouter: User,
    username: string): boolean
{
    return true;
}

/**
 * @param {User} shouter The user whom called the shoutout command.
 * @param {string} username The username being shouted.
 *
 * @return {Promise<void>}
 */
async function _fetchProfileAndShout(
    shouter: User,
    username: string): Promise<void>
{
    _handler(shouter, await ProfileGet(username, ProfileProvider.Twitch));
}

/**
 * Handles the given command data as a shout out.
 *
 * @param {User} user The user whom called the shoutout command.
 * @param {ChatCommand} command The command data object.
 *
 * @return {void}
 */
function _handleShoutOut(
    user: User,
    command: ChatCommand): void
{
    // Do nothing if a handler callback has not been set.

    if (!_handler) {
        return;
    }

    // Ensure username is properly formatted.

    let username = (command.contents || '').trim();

    if (username[0] === '@') {
        username = username.slice(1);
    }

    // Do nothing if given an invalid username.

    if (!ProfileIsValidUsername(username, ProfileProvider.Twitch)) {
        return;
    }

    // Do nothing if user is not allowed to shout out.

    if (!_isAllowedToShoutOut(user, username)) {
        return;
    }

    // Username is valid so handle the shoutout.

    switch (username.toLowerCase()) {
    case TwitchConfig.channel:
        if (ShoutOutConfig.allowBroadcaster) {
            _fetchProfileAndShout(command.user, username);
        }
        break;
    case TwitchConfig.username:
        if (ShoutOutConfig.allowBot) {
            _fetchProfileAndShout(command.user, username);
        }
        break;
    default:
        _fetchProfileAndShout(command.user, username);
        break;
    }
}

/**
 * Public Functions
*/

/**
 * Sets the function that will be called whenever a user is shouted out.
 *
 * @param {ShoutoutHandler} handler The handler to use.
 *
 * @return {void}
 */
export function ShoutOutSetHandler(
    handler: ShoutoutHandler): void
{
    _handler = handler;
}

/**
 * @return {Promise<void>}
 */
export async function ShoutOutInit(): Promise<void>
{
    ChatCommandRegister('so', _handleShoutOut);
}
