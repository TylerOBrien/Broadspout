/**
 * System Imports
*/

import { CooldownConfig } from '@config/Cooldown';
import { Duration } from '@system/Chrono';
import { ChronoDurationMilliseconds } from '@system/Chrono/api';
import { User } from '@system/User';

/**
 * Relative Imports
*/

import { Cooldown, CooldownType, CooldownTypeScalar } from './types';

/**
 * Locals
*/

const _cooldowns: Record<string, { [P in CooldownType]?: Cooldown }> = {};
const _types: Array<CooldownType> = [
    CooldownType.Any,
    CooldownType.Command,
];

/**
 * Private Functions
*/

/**
 * Returns a potentially empty array of all cooldowns for the given user
 * matching the given cooldown type.
 *
 * @param {User} user The user to find cooldowns for.
 * @param {CooldownType} type The type of cooldowns to find.
 *
 * @return {Array<Cooldown>}
 */
function _findCooldownMatches(
    user: User,
    type: CooldownType): Array<Cooldown>
{
    const matches: Array<Cooldown> = [];

    for (const key in _cooldowns[user.login]) {
        const cooldown = _cooldowns[user.login][key as unknown as CooldownType];

        for (const type of _types) {
            if (type & cooldown.type) {
                matches.push(cooldown);
                break;
            }
        }
    }

    return matches;
}

/**
 * Public Functions
*/

/**
 * Adds a cooldown for the given user.
 *
 * @param {User} user The user to add the cooldown for.
 * @param {CooldownTypeScalar} type The type of cooldown to add.
 * @param {number} durationSeconds How long the cooldown will last for.
 *
 * @return {void}
 */
export function CooldownSet(
    user: User,
    type: CooldownTypeScalar,
    duration: Duration): void
{
    if (!(user.login in _cooldowns)) {
        _cooldowns[user.login] = {}; // Add new cooldown object if one doesn't already exist.
    }

    _cooldowns[user.login][type] = {
        type,
        until: new Date(Date.now() + ChronoDurationMilliseconds(duration)),
    };
}

/**
 * Returns true if the given user has an active cooldown of the given type.
 *
 * @param {User} user The user to check.
 * @param {CooldownType} type The cooldown type to check for.
 *
 * @return {boolean}
 */
export function CooldownIsActive(
    user: User,
    type: CooldownType): boolean
{
    if (!_cooldowns[user.login]) {
        return false;
    }

    const now = new Date;

    for (const cooldown of _findCooldownMatches(user, type)) {
        if (cooldown.until > now) {
            return true;
        }
    }

    return false;
}

export function CooldownGetResponse(
    user: User,
    type: CooldownTypeScalar,
    suffix: string): string
{
    const seconds = CooldownGetSecondsRemaining(user, type);
    const phrase = CooldownGetResponse();

    return `${ user.name }! ${ phrase } Wait ${ seconds } second${ seconds === 1 ? '' : 's' }${ suffix ? ' ' + suffix : '' }`;
}

/**
 * Returns the number of sconds remaining the cooldown for the user. If no
 * cooldown exists or the cooldown has passed then 0 will be returned.
 *
 * @param {User} user The user to check the cooldown for.
 * @param {CooldownTypeScalar} type The type of cooldown to check.
 *
 * @return {number}
 */
export function CooldownGetSecondsRemaining(
    user: User,
    type: CooldownTypeScalar): number
{
    if (!_cooldowns[user.login]?.[type]) {
        return 0;
    }

    const now = new Date;
    const until = _cooldowns[user.login][type].until;

    if (now > until) {
        return 0;
    }

    return Math.round((until.getTime() - now.getTime()) / 1000);
}
