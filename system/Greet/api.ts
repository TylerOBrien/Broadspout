/**
 * System Imports
*/

import { ChatAddEventListener, ChatMessage } from '@system/Chat';
import { GreetConfig } from '@config/Greet';
import { ProfileGet, ProfileProvider } from '@system/Profile';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { StorageGet, StorageGetData, StorageSet } from '@system/Storage';
import { User } from '@system/User';

/**
 * Relative Imports
*/

import { GreetFetchGreetings } from './drivers';
import { Greeting, GreetHandler, GreetState } from './types';

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
    user: User,
    message: ChatMessage): void
{
    if (_enabled && !GreetIsGreeted(user) && !GreetIsQueued(user)) {
        _enqueue(user);
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

    _greetNextUserIfQueued();
}

/**
 * @return {void}
 */
function _greetNextUserIfQueued(): void
{
    const user = _queue[0];

    if (!user) {
        return;
    }

    _state = GreetState.Busy;

    QueuePush({
        type: QueueType.Sound,
        mode: QueueMode.UpNext,
        handler: async (queueid: string): Promise<void> => {
            const profile = await ProfileGet(user.login, ProfileProvider.Twitch);

            if (_handler) {
                await _handler(user, profile);
            }

            QueuePop(queueid);
            await _handleGreetFinish();
        },
    });
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
        _greetNextUserIfQueued();
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
 * @return {boolean}
 */
export function GreetIsGreeting(
    user: User): boolean
{
    return _state === GreetState.Busy &&
           _queue[0].id === user.id;
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
        _greeted = await StorageGetData<Array<string>>(GreetConfig.storage.history.name, []);
    }

    await GreetReload();

    ChatAddEventListener(_handleChatMessage);
}
