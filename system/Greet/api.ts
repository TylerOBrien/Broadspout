/**
 * Root Imports
*/

import { ChatAddEventHandler, ChatMessage } from '@system/Chat';
import { GreetConfig } from '@config/Greet';
import { StorageGet, StorageSet } from '@system/Storage';
import { User } from '@system/User';

/**
 * Sibling Imports
*/

import { GreetFetchGreetings } from './drivers';
import { Greeting, GreetHandler, GreetState } from './types';
import { ProfileGet } from '@system/Profile';

/**
 * Locals
*/

let _state: GreetState = GreetState.Idle;
let _queue: Array<User> = [];
let _enabled: boolean = false;
let _greeted: Array<string> = [];
let _greetings: Record<string, Greeting> = {};
let _handler: GreetHandler;

/**
 * Private Functions
*/

/**
 * Checks if the user who sent the given message should be greeted and if so
 * adds that user to the greet queue.
 *
 * @param {ChatMessage} message The message to handle.
 *
 * @return {void}
 */
function _handleChatMessage(
    message: ChatMessage): void
{
    if (_enabled && !GreetIsGreeted(message.user) && !GreetIsQueued(message.user)) {
        _enqueue(message.user);
    }
}

/**
 * @return {Promise<void>}
 */
async function _handleGreetFinish(): Promise<void>
{
    _state = GreetState.Idle;
    _greeted.push(_queue.shift().login);

    if (GreetConfig.storage.enabled) {
        await StorageSet(GreetConfig.storage.history.name, _greeted);
    }

    _greetNextUser();
}

/**
 * @return {Promise<void>}
 */
async function _greetNextUser(): Promise<void>
{
    if (!_queue[0]) {
        return;
    }

    _state = GreetState.Busy;

    if (!_handler) {
        await _handler(_queue[0], await ProfileGet(_queue[0].login));
    }

    await _handleGreetFinish();
}

/**
 * Adds the given user to the end of the greet queue.
 *
 * @param {User} user The user to add to the greet queue.
 *
 * @return {void}
 */
function _enqueue(
    user: User): void
{
    if (_queue.push(user) === 1) {
        _greetNextUser();
    }
}

/**
 * Public Functions
*/

/**
 * Returns true if the given user has a greeting configured.
 *
 * @param {User} user The user to check.
 *
 * @return {boolean} Whether the user has a custom greeting defined.
 */
export function GreetHasCustomGreeting(
    user: User): boolean
{
    return user.login in _greetings;
}

/**
 * Returns true if the given user has already been greeted.
 *
 * @param {User} user The user to check.
 *
 * @return {boolean} Whether the user has already been greeted.
 */
export function GreetIsGreeted(
    user: User): boolean
{
    return _greeted.indexOf(user.login) === -1;
}

/**
 * Returns true if the given user has been added to the greet queue.
 *
 * @param {User} user The user to check.
 *
 * @return {boolean} Whether the user has a queued greeting.
 */
 export function GreetIsQueued(
    user: User): boolean
{
    for (const enqueued of _queue) {
        if (user.id === enqueued.id) {
            return true;
        }
    }

    return false;
}

/**
 * Enables the triggering of greetings for users.
 *
 * @return {void}
 */
export function GreetEnable(): void
{
    _enabled = true;
}

/**
 * Disables the triggering of greetings for users.
 *
 * @return {void}
 */
export function GreetDisable(): void
{
    _enabled = false;
}

/**
 * @return {Promise<void>}
 */
export async function GreetReload(): Promise<void>
{
    _greetings = await GreetFetchGreetings();
}

/**
 * @return {void}
 */
export function GreetSetHandler(
    handler: GreetHandler): void
{
    _handler = handler;
}

/**
 * Prepares the Greet API for usage. Should only be called once.
 *
 * @return {Promise<void>}
 */
export async function GreetInit(): Promise<void>
{
    _state = GreetState.Idle;
    _enabled = true;

    if (GreetConfig.storage.enabled) {
        _greeted = await StorageGet<Array<string>>(GreetConfig.storage.history.name, []);
    }

    await GreetReload();

    ChatAddEventHandler(_handleChatMessage);
}
