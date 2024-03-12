/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Relative Imports
*/

import { isUser, isUserIdentity, isTmiUserState } from './guards';
import { UserCreateFromTmi, UserCreateStatusFromTmi } from './drivers';
import { User, UserFilter, UserFilterCriteria, UserFilterSubject, UserIdentity, UserStatus } from './types';

/**
 * Public Functions
*/

/**
 * Returns a new Broadspout User object based off the given provider data.
 *
 * @param {ChatUserstate} from The source to use when creating the User object.
 *
 * @return {User}
 */
export function UserCreate(
    from: ChatUserstate): User
{
    if (isTmiUserState(from)) {
        return UserCreateFromTmi(from);
    }
}

/**
 * @param {ChatUserstate} from
 *
 * @return {UserStatus}
 */
export function UserStatusCreate(
    from: ChatUserstate): UserStatus
{
    if (isTmiUserState(from)) {
        return UserCreateStatusFromTmi(from);
    }
}

/**
 * @param {UserFilterSubject} subject
 * @param {UserFilterCriteria} criteria
 *
 * @return {UserFilter}
 */
export function UserFilterCreate(
    subject: UserFilterSubject,
    criteria?: UserFilterCriteria): UserFilter
{
    return {
        criteria,
        subject: Array.isArray(subject) ? [...subject] : subject, // Clone array if given to eliminate side-effects from holding a reference.
    };
}

/**
 * @return {boolean}
 */
export function UserFilterIsMatch(
    filter: UserFilter,
    against: string | User | UserIdentity | { userid: string }): boolean
{
    if (isUser(filter.subject)) {
        if (isUserIdentity(against)) {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject.id !== against.id;
            } else {
                return filter.subject.id === against.id;
            }
        } else if (typeof against === 'string') {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject.id !== against;
            } else {
                return filter.subject.id === against;
            }
        } else {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject.id !== against.userid;
            } else {
                return filter.subject.id === against.userid;
            }
        }
    } else if (typeof filter.subject === 'string') {
        if (isUserIdentity(against)) {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject !== against.id;
            } else {
                return filter.subject === against.id;
            }
        } else if (typeof against === 'string') {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject !== against;
            } else {
                return filter.subject === against;
            }
        } else {
            if (filter.criteria === UserFilterCriteria.None) {
                return filter.subject !== against.userid;
            } else {
                return filter.subject === against.userid;
            }
        }
    } else {
        for (const subject of filter.subject) {
            if (UserFilterIsMatch({ subject, criteria: filter.criteria }, against)) {
                return true;
            }
        }
    }

    return false;
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
