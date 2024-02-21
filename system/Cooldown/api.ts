/**
 * System Imports
*/

import { CooldownConfig } from '@config/Cooldown';
import { Duration } from '@system/Chrono';
import { ChronoDurationMilliseconds } from '@system/Chrono/api';
import { User } from '@system/User';
import { RandomFrom } from '@system/Utility';

/**
 * Relative Imports
*/

import { Cooldown, CooldownType, CooldownTypeScalar } from './types';

/**
 * Locals
*/

const _cooldowns: Record<string, { [P in CooldownType]?: Cooldown }> = {};
let _responses: Array<string> = [];
const _types: Array<CooldownType> = [
    CooldownType.Any,
    CooldownType.Command,
];

/**
 * Private Functions
*/

/**
 * @return {Promise<Array<string>>} The responses received.
 */
async function _fetchResponses(): Promise<Array<string>>
{
    return new Promise(async (resolve, reject) => {
        const response = await fetch(CooldownConfig.uri.responses);
        const data = await response.json();

        if (!Array.isArray(data)) {
            return reject();
        }

        for (const item of data) {
            if (typeof item !== 'string') {
                return reject();
            }
        }

        resolve(data);
    });
}

/**
 * Returns a potentially empty array of all cooldowns for the given user
 * matching the given cooldown type.
 *
 * @param {User} user The user to find cooldowns for.
 * @param {CooldownType} type The type of cooldowns to find.
 *
 * @return {Array<Cooldown>} The cooldowns that are considered matches.
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
 * @return {boolean} Whether the cooldown is active.
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

/**
 * Returns a string intended to be sent to Twitch chat on the condition that
 * an attempted action was throttled due to an active cooldown.
 *
 * @param {User} user The user who performed the cooldown-based action.
 * @param {CooldownTypeScalar} type The type of cooldown being used.
 * @param {string} suffix The message contents to append to the end of the generated response.
 *
 * @return {string} The response to send to Twitch chat.
 */
export function CooldownGetResponse(
    user: User,
    type: CooldownTypeScalar,
    suffix: string): string
{
    const seconds = CooldownGetSecondsRemaining(user, type);
    const phrase = RandomFrom(_responses);

    return `${ user.name }! ${ phrase } Wait ${ seconds } second${ seconds === 1 ? '' : 's' }${ suffix ? ' ' + suffix : '' }`;
}

/**
 * Returns the number of sconds remaining the cooldown for the user. If no
 * cooldown exists or the cooldown has passed then 0 will be returned.
 *
 * @param {User} user The user to check the cooldown for.
 * @param {CooldownTypeScalar} type The type of cooldown to check.
 *
 * @return {number} The seconds remaining on the cooldown.
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

/**
 * Fetches and stores data from external files over an HTTP request.
 *
 * @return {Promise<void>}
 */
export async function CooldownReload(): Promise<void>
{
    _responses = await _fetchResponses();
}

/**
 * Prepares the Cooldown API for usage. Should only be called once.
 *
 * @return {Promise<void>}
 */
export async function CooldownInit(): Promise<void>
{
    await CooldownReload();
}
