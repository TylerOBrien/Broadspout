/**
 * Config Imports
*/

import { ShoutOutConfig } from '@config/ShoutOut';
import { TwitchConfig } from '@config/Twitch';

/**
 * System Imports
*/

import { ChatCommand, ChatCommandRegister } from '@system/Command';
import { ProfileGet, ProfileProvider } from '@system/Profile';
import { User } from '@system/User';
import { isAlphaNumericChar } from '@system/Utility';

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
 * Returns true if the given name is a valid Twitch username. False otherwise.
 *
 * @param {string} name The name of a user to check.
 *
 * @return {boolean} Whether the username is valid for shoutout.
 */
function _isValidForShoutOut(
    name: string): boolean
{
    const length = name.length;

    // Check username length requirements enforced by Twitch.

    if (length < 4 || length > 25) {
        return false;
    }

    // Ensure only valid characters are used.

    let index = length;

    while (index--) {
        if (name[index] !== '_' && !isAlphaNumericChar(name.charCodeAt(index))) {
            return false;
        }
    }

    // No issues found so username is considered valid.

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

    if (!_isValidForShoutOut(username)) {
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
