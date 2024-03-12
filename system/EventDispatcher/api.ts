/**
 * System
*/

import { User } from '@system/User';

/**
 * Relative Imports
*/

import { EventCallback, EventFilter, EventFilterPermission, EventListener, EventRegistration } from './types';

/**
 * Locals
*/

let _events: Record<string, EventRegistration> = {};
let _nextListenerId = 0;

/**
 * Public Functions
*/

/**
 * @param {string} name The name of the event.
 * @param {User} user The user whom triggered the event.
 * @param {unknown} payload
 *
 * @return {void}
 */
export function EventDispatch(
    eventName: string,
    listenerName: string,
    user: User,
    payload?: unknown): void
{
    if (!(listenerName in _events[eventName])) {
        return;
    }

    for (const listener of _events[eventName][listenerName]) {
        if (listener.filter) {
            if (typeof listener.filter.predicate === 'string') {
                if (listener.filter.permission === EventFilterPermission.Allow) {
                    if (listener.filter.predicate !== user.id) {
                        continue;
                    }
                } else if (listener.filter.permission === EventFilterPermission.Disallow) {
                    if (listener.filter.predicate === user.id) {
                        continue;
                    }
                }
            } else if (Array.isArray(listener.filter.predicate)) {
                if (listener.filter.permission === EventFilterPermission.Allow) {
                    if (listener.filter.predicate.indexOf(user.id) === -1) {
                        continue;
                    }
                } else if (listener.filter.permission === EventFilterPermission.Disallow) {
                    if (listener.filter.predicate.indexOf(user.id) !== -1) {
                        continue;
                    }
                }
            } else if (!listener.filter.predicate(user, payload)) {
                continue;
            }
        }

        listener.callback(user, payload);
    }
}

/**
 * @return {void}
 */
export function EventRegister(
    name: string): void
{
    _events[name] = {};
}

/**
 * @param {string} listener The name of the listener.
 * @param {EventCallback} callback The function to call for the event.
 * @param {EventFilter} filter
 *
 * @return {number}
 */
export function EventAddListener(
    eventName: string,
    listenerName: string,
    callback: EventCallback,
    filter?: EventFilter): number
{
    if (!(eventName in _events)) {
        return;
    }

    if (!(listenerName in _events[eventName])) {
        _events[eventName][listenerName] = [];
    }

    const id = _nextListenerId++;

    _events[eventName][listenerName].push({
        id,
        callback,
        filter,
    });

    return id;
}

/**
 * @return {void}
 */
export function EventRemove(
    eventName: string): void
{
    delete _events[eventName];
}

/**
 * @return {void}
 */
export function EventRemoveListener(
    eventName: string,
    listenerName: string,
    id: number): void
{
    let index = _events[eventName][listenerName].length;

    while (index--) {
        if (_events[eventName][listenerName][index].id === id) {
            _events[eventName][listenerName].splice(index, 1);
            break;
        }
    }
}

/**
 * @return {void}
 */
export function EventRemoveAllListeners(
    eventName: string,
    listenerName: string): void
{
    _events[eventName][listenerName] = [];
}
