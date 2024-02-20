/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Relative Imports
*/

import { User, UserStatus } from './types';
import { isUser } from './guards';

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
export function UserCreate(
    state: ChatUserstate): User
{
    return {
        id: state['user-id'],
        name: state['display-name'],
        login: state.username,
        color: state.color,
        badges: [],
        status: UserStatusCreate(state),
    };
}

/**
 * @param {ChatUserstate} state
 *
 * @return {UserStatus}
 */
export function UserStatusCreate(
    state: ChatUserstate): UserStatus
{
    return (
        (state.subscriber ? UserStatus.Subscriber: 0) |
        (state.mod ? UserStatus.Moderator : 0) |
        (state.badges && ('broadcaster' in state.badges) ? UserStatus.Broadcaster : 0)
    );
}

/**
 * Returns true if the given user is the broadcaster. Otherwise returns false.
 *
 * @param {User | ChatUserstate} user
 *
 * @return {boolean}
 */
export function UserIsBroadcaster(
    user: User | ChatUserstate): boolean
{
    return !!(
        isUser(user)
            ? user.status & UserStatus.Broadcaster
            : user.badges && 'broadcaster' in user.badges
    );
}

/**
 * @param {User | ChatUserstate} user
 *
 * @return {boolean}
 */
export function UserIsModerator(
    user: User | ChatUserstate): boolean
{
    return !!(
        isUser(user)
            ? user.status & UserStatus.Moderator
            : user.mod
    );
}

/**
 * @param {User | ChatUserstate} user
 *
 * @return {boolean}
 */
export function UserIsSubscriber(
    user: User | ChatUserstate): boolean
{
    return !!(
        isUser(user)
            ? user.status & UserStatus.Subscriber
            : user.subscriber
    );
}
