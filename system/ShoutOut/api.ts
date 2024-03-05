/**
 * Config Imports
*/

import { ShoutOutConfig } from '@config/ShoutOut';
import { TwitchConfig } from '@config/Twitch';

/**
 * System Imports
*/

import { ChatCommand, CommandRegister } from '@system/Command';
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
 * Returns true if the given name is a valid Twitch username. False otherwise.
 *
 * @param {string} name The name of a user to check.
 *
 * @return {boolean}
 */
function _isValidForShoutOut(
    name: string): boolean
{
    // Check username length requirements enforced by Twitch.

    if (name.length < 4 || name.length > 25) {
        return false;
    }

    // Ensure only valid characters are used.

    let index = name.length;

    while (index--) {
        if (name[index] !== '_' && !isAlphaNumericChar(name.charCodeAt(index))) {
            return false;
        }
    }

    // No issues found so username is considered valid.

    return true;
}

/**
 * Handles the given command data as a shout out.
 *
 * @param {ChatCommand} command The command data object.
 *
 * @return {void}
 */
function _handleShoutOut(
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

    // Username is valid so handle the shoutout.

    switch (username.toLowerCase()) {
    case TwitchConfig.channel:
        if (ShoutOutConfig.allowBroadcaster) {
            _handler(command.user, username);
        }
        break;
    case TwitchConfig.username:
        if (ShoutOutConfig.allowBot) {
            _handler(command.user, username);
        }
        break;
    default:
        _handler(command.user, username);
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
    CommandRegister('so', _handleShoutOut);
}
