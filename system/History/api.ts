/**
 * System
*/

import { User, UserFilter, UserFilterIsMatch } from '@system/User';

/**
 * Relative Imports
*/

import { History, HistoryItem, HistoryType } from './types';

/**
 * Locals
*/

const _history: History = {};

/**
 * Public Functions
*/

/**
 * @param {HistoryType} type The type/category of history.
 * @param {string} record The name of the record within the specified type/category.
 * @param {UserFilter} filter The user filter to compare against.
 *
 * @return {HistoryItem} The history item.
 */
export function HistoryFind(
    type: HistoryType,
    record: string,
    filter: UserFilter): HistoryItem
{
    let index = _history[type]?.[record]?.length ?? 0;

    while (index--) {
        if (UserFilterIsMatch(filter, _history[type][record][index].user)) {
            break;
        }
    }

    if (index === -1) {
        return null;
    }

    return _history[type][record][index];
}

/**
 * @param {HistoryType} type The type/category of history.
 * @param {string} record The name of the record within the specified type/category.
 * @param {User} user The user whom performed an action to record.
 * @param {Date} when When the action was performed.
 *
 * @return {void}
 */
export function HistoryPush(
    type: HistoryType,
    record: string,
    user?: User,
    when?: Date): void
{
    if (!(type in _history)) {
        _history[type] = { [record]: [] };
    } else if (!(record in _history[type])) {
        _history[type][record] = [];
    }

    _history[type][record].push({
        user: user ? { id: user.id } : null,
        when: when ?? new Date,
    });
}
