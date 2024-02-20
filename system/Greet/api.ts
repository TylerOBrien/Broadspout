/**
 * Root Imports
*/

import { GreetConfig } from '@config/Greet';
import { ChatMessage } from '@system/Chat';
import { ProfileGet } from '@system/Profile';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { SoundExists, SoundPlayFile } from '@system/Sound';
import { StorageGet, StorageSet } from '@system/Storage';
import { User } from '@system/User';

/**
 * Sibling Imports
*/

import { GreetHandler, GreetState } from './types';

/**
 * Locals
*/

let _state: GreetState = GreetState.Idle;
let _queue: Array<User> = [];
let _enabled: boolean = false;
let _greeted: Array<string> = [];
let _greetings: Record<string, GreetHandler> = {};

/**
 * Private Functions
*/

/**
 * @return {void}
 */
function _handleGreetFinish(): void
{
    _greeted.push(_queue.shift().login);

    if (GreetConfig.storage.enabled) {
        StorageSet(GreetConfig.storage.history.name, _greeted);
    }

    if (_queue.length) {
        _greet();
    }
}

/**
 * @return {void}
 */
function _greet(): void
{


    return;

    /* let remaining = 2;

    const _handleSoundPlayStart = async () => {
        await GreetUser(_queue[0]);
        if (--remaining === 0) {
            _handleGreetFinish();
        }
    };

    const _handleSoundPlayFinish = async () => {
        if (--remaining === 0) {
            _handleGreetFinish();
        }
    };

    if (SoundExists(_greetings[_queue[0].login])) {
        SoundPlayFile(
            null,
            _greetings[_queue[0].login],
            QueueMode.UpNext,
            _handleSoundPlayStart,
            _handleSoundPlayFinish,
        );
    } else {
        remaining = 1;
        _handleSoundPlayStart();
    } */
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
        _greet();
    }
}

/**
 * Public Functions
*/

/**
 * @param {User} user The user to show the greeting for.
 *
 * @return {void}
 */
export function GreetUser(
    user: User): Promise<void>
{
    if (_state === GreetState.Busy) {
        _queue.push(user);
        return new Promise(resolve => resolve());
    }

    _state = GreetState.Busy;

    const container = document.createElement('div');
    const inner = document.createElement('div');
    const img = document.createElement('img');
    const message = document.createElement('div');

    container.style.left = `${ GreetConfig.ui.x }px`;
    container.style.top = `${ GreetConfig.ui.y }px`;
    container.style.width = `${ GreetConfig.ui.width }px`;
    container.style.height = `${ GreetConfig.ui.height }px`;

    img.style.width = `${ GreetConfig.ui.height }px`;
    img.style.height = `${ GreetConfig.ui.height }px`;
    img.style.transform = `translateX(-${ GreetConfig.ui.height }px)`;

    ProfileGet(user.name).then(profile => {
        if (profile.avatar_url) {
            img.src = profile.avatar_url;
            img.onload = () => {
                img.style.transform = `translateX(${ GreetConfig.ui.width }px)`;

                setTimeout(() => { img.style.transform = `translateX(-${ GreetConfig.ui.height }px)`; }, 7500);
                setTimeout(() => { inner.style.opacity = '0'; }, 7500 * 2);
            };
        }
    });

    return new Promise(resolve => {
        message.innerHTML = `<span style="color:${ user.color || 'white' }">${ user.name }</span> has arrived`;

        inner.appendChild(img);
        inner.appendChild(message);
        container.appendChild(inner);
        document.body.appendChild(container);

        requestAnimationFrame(() => {
            inner.style.opacity = '1.0';

            setTimeout(() => { inner.style.opacity = '0'; }, 14000);
            setTimeout(() => {
                document.body.removeChild(container);
                resolve();

                _state = GreetState.Idle;

                if (_queue.length) {
                    GreetUser(_queue.shift());
                }
            }, 17500);
        });
    });
}

/**
 * Checks if the user who sent the given message should be greeted and if so
 * adds that user to the greet queue.
 *
 * @param {ChatMessage} message The message to handle.
 *
 * @return {void}
 */
export function GreetHandleMessage(
    message: ChatMessage): void
{
    if (_enabled && !GreetIsGreeted(message.user) && !GreetIsQueued(message.user)) {
        _enqueue(message.user);
    }
}

/**
 * Returns true if the given user has a greeting configured.
 *
 * @param {User} user The user to check.
 *
 * @return {boolean}
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
 * @return {boolean}
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
 * @return {boolean}
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
 * @return {void}
 */
export function GreetEnable(): void
{
    _enabled = true;
}

/**
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
    const response = await fetch(GreetConfig.greetings.uri);
    _greetings = await response.json();
}

/**
 * @return {Promise<void>}
 */
export async function GreetInit(): Promise<void>
{
    _state = GreetState.Idle;
    _enabled = true;

    if (GreetConfig.storage.enabled) {
        _greeted = StorageGet(GreetConfig.storage.history.name, []);
    }

    await GreetReload();
}
