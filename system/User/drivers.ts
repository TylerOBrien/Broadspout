/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Relative Imports
*/

import { User, UserProvider, UserStatus } from './types';

/**
 * Public Functions
*/

/**
 * Returns a new Broadspout User object based off the given tmi user.
 *
 * @param {ChatUserstate} state The tmi user object.
 *
 * @return {User}
 */
export function UserCreateFromTmi(
    state: ChatUserstate): User
{
    return {
        id: state['user-id'],
        provider: UserProvider.Twitch,
        name: state['display-name'],
        login: state.username,
        color: state.color,
        badges: [],
        status: UserCreateStatusFromTmi(state),
    };
}

/**
 * @param {ChatUserstate} state
 *
 * @return {UserStatus}
 */
export function UserCreateStatusFromTmi(
    state: ChatUserstate): UserStatus
{
    return (
        (state.subscriber ? UserStatus.Subscriber: 0) |
        (state.mod ? UserStatus.Moderator : 0) |
        (state.badges && ('broadcaster' in state.badges) ? UserStatus.Broadcaster : 0)
    );
}
