/**
 * Relative Imports
*/

import { QueueItem, QueueMode, QueueState, QueueType, QueueOptions } from './types';

/**
 * Locals
*/

let _uid: number = 0;
let _queue: Array<QueueItem> = [];
let _conflicts: Record<QueueType, Array<QueueType>> = {
    [QueueType.Sound]:      [QueueType.Sound, QueueType.SoundVideo],
    [QueueType.Video]:      [QueueType.Video, QueueType.SoundVideo],
    [QueueType.SoundVideo]: [QueueType.Sound, QueueType.Sound, QueueType.SoundVideo],
};

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
 * Returns true if the given queue item is currently idle (meaning that the
 * function for the item is not being executed). False otherwise.
 *
 * @param {QueueItem} item The queue item.
 *
 * @return {boolean}
 */
function _isIdle(
    item: QueueItem): boolean
{
    return item.state === QueueState.Idle;
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
    // Execute the queue item.

    _queue[index].state = QueueState.Active;
    _queue[index].handler(_queue[index].id);

    // Check if the queue item that immediately follows the specified item has
    // a conflict. If it does not then also execute that one.

    // TODO: make this check all entries that are ahead of this one for conflicts
    // If no items ahead of this conflict then it should trigger.

    if (_queue.length > 1 && _isIdle(_queue[index + 1]) && !_isConflict(_queue[index], _queue[index + 1])) {
        _trigger(index + 1);
    }
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
    // Determine how many conflicting items (as "steps") will exist before this
    // new queue object after it is inserted

    let index = _queue.length;
    let steps = 0;

    while (index--) {
        steps++;
        if (_conflicts[options.type].indexOf(_queue[index].type) !== -1) {
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
    case 2: // Length of 2 means this may have been added while a non-conflicting item is currently active.
        if (!_isConflict(_queue[0], _queue[1])) {
            _trigger(1);
        }
        break;
    }

    return id;
}

/**
 * Removes the specified queue item from the queue. If no item is specified then
 * the last item in the queue will be removed.
 *
 * @param {string} id The id of the queue item to remove.
 * @param {number} delayMs The optional delay between removing the item and triggering the next one.
 *
 * @return {void}
 */
export function QueuePop(
    id: string = null,
    delayMs: number = 0): boolean
{
    if (id === null || id === undefined) {
        _queue.shift();
    } else {
        let index = _queue.length;

        while (index--) {
            if (_queue[index].id === id) {
                break;
            }
        }

        if (index >= 0) {
            _queue.splice(index, 1);
        } else {
            // TODO: handle error id not found
        }
    }

    if (_queue.length) {
        if (_isIdle(_queue[0])) {
            if (delayMs) {
                setTimeout(() => _trigger(0), delayMs);
            } else {
                _trigger(0);
            }
        } else if (!delayMs && _queue[1]?.state === QueueState.Idle && !_isConflict(_queue[0], _queue[1])) {
            _trigger(1);
        }
    }

    return !_queue.length;
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
