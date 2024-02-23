/**
 * Relative Imports
*/

import { QueueItem, QueueMode, QueueState, QueueType, QueueOptions } from './types';

/**
 * Locals
*/

let _uid: number = 0;
let _queue: Array<QueueItem> = [];

/**
 * Private Functions
*/

/**
 * Determines if the two queue items have conflicting types.
 *
 * @param {QueueItem} first The first queue item.
 * @param {QueueItem} second The second queue item.
 *
 * @return {boolean}
 */
function _isConflict(
    first: QueueItem,
    second: QueueItem): boolean
{
    return !!(first && second) && !!(first.type & second.type);
}

/**
 * Executes the function for the queue item at the specified index position.
 *
 * @param {number} index The index position of the queue item to execute.
 *
 * @return {void}
 */
function _trigger(
    index: number): void
{
    _queue[index].state = QueueState.Active;
    _queue[index].handler(_queue[index].id);
}

/**
 * Public Functions
*/

/**
 * Creates a new queue item and inserts it into the queue.
 *
 * @param {QueueOptions} options The options to use for the new queue item.
 *
 * @return {void}
 */
export function QueuePush(
    options: QueueOptions): string
{
    // Count items (as "steps") in the queue until a conflict is found

    let index = _queue.length;
    let steps = 0;

    while (index--) {
        steps++;

        if (options.type & _queue[index].type) {
            break;
        }
    }

    // Check if the request should be rejected on a conflict being found

    if (options.mode === QueueMode.Reject && steps !== (_queue.length + 1)) {
        return null;
    }

    // Create new queue object

    const id = (++_uid).toString(16);
    const item: QueueItem = {
        id,
        type: options.type,
        handler: options.handler,
        state: QueueState.Idle,
    };

    // Insert queue object at the specified position

    switch (options.mode) {
    case QueueMode.Enqueue:
        if (steps === 1) {
            _queue.push(item);
        } else {
            _queue = [].concat(_queue.slice(0, index), item, _queue.slice(index));
        }
        break;
    case QueueMode.UpNext:
        _queue = [].concat(_queue[0], item, _queue.slice(1));
        break;
    }

    // Trigger the queue object immediately if there's no conflicts ahead of it

    switch (_queue.length) {
    case 1: // Length of 1 means this is the only item so it cannot have a conflict.
        _trigger(0);
        break;
    case 2: // Length of 2 means this may have been added while a single non-conflicting item is currently active.
        if (!_isConflict(_queue[0], _queue[1])) {
            _trigger(1);
        }
        break;
    }

    return id;
}

/**
 * Removes the specified queue item from the queue.
 *
 * @param {string} id The id of the queue item to remove.
 *
 * @return {boolean} Whether there are remaining items in the queue.
 */
export function QueuePop(
    id: string): boolean
{
    // Ensure id is valid.

    if (id === null || id === undefined) {
        throw new Error; // TODO: handle this error
    }

    // Find the index of the specified queue item.

    let index = _queue.length;

    while (index--) {
        if (_queue[index].id === id) {
            break;
        }
    }

    // Remove the queue item.

    if (index !== -1) {
        _queue.splice(index, 1);
    } else {
        throw new Error; // TODO: handle error id not found
    }

    if (_queue[0] === undefined) {
        return false;
    }

    // Queue is not empty so trigger all subsequent queue items that do not
    // conflict with this triggered item or with each other.

    const end = _queue.length;
    const precedents = [_queue[0]];

    for (let i = 1; i < end; i++) {
        for (const precedent of precedents) {
            if (precedent.type & _queue[i].type) {
                return true; // Conflict found so don't check anymore.
            }

            precedents.push(_queue[i]);

            if (_queue[i].state === QueueState.Idle) {
                _trigger(i);
            }
        }
    }

    return true;
}

/**
 * Returns the unique id that will be used for the next queue item.
 *
 * @return {string} The uid value.
 */
export function QueueGetNextId(): string
{
    return (_uid + 1).toString(16);
}
