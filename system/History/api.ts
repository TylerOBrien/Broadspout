/**
 * System
*/

import { User, UserFilter, UserFilterIsMatch } from '@system/User';

/**
 * Relative Imports
*/

import { History, HistoryItem } from './types';

/**
 * Locals
*/

const _history: History = {};

/**
 * Public Functions
*/

/**
 * @param {string} category The category of history.
 * @param {string} record The name of the record within the specified category.
 * @param {UserFilter} filter The user filter to compare against.
 *
 * @return {HistoryItem} The history item.
 */
export function HistoryFind(
    category: string,
    record: string,
    filter: UserFilter): HistoryItem
{
    let index = _history[category]?.[record]?.length ?? 0;

    while (index--) {
        if (UserFilterIsMatch(filter, _history[category][record][index].user)) {
            break;
        }
    }

    if (index === -1) {
        return null;
    }

    return _history[category][record][index];
}

/**
 * @param {string} category The category of history.
 * @param {string} record The name of the record within the specified category.
 * @param {User} user The user whom performed an action to record.
 * @param {Date} when When the action was performed.
 *
 * @return {void}
 */
export function HistoryPush(
    category: string,
    record: string,
    user?: User,
    when?: Date): void
{
    if (!(category in _history)) {
        _history[category] = { [record]: [] };
    } else if (!(record in _history[category])) {
        _history[category][record] = [];
    }

    _history[category][record].push({
        user: user ? { id: user.id } : null,
        when: when ?? new Date,
    });
}
