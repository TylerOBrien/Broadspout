/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Local Imports
*/

import { User } from '@system/User';

/**
 * Relative Imports
*/

import {
    ChatMessage,
    ChatEventHandler,
    ChatEventHandlerCallback,
    ChatEventHandlerFilter,
} from './types';

/**
 * Locals
*/

let _uid: number = 0;
const _events: Array<ChatEventHandler> = [];

/**
 * Public Functions
*/

/**
 * Returns a new message object.
 *
 * @param {User} user The Broadspout User object.
 * @param {ChatUserstate} state The tmi user object.
 * @param {string} contents The contents of the message.
 * @param {boolean} isBot Whether the message was sent by this bot.
 * @param {string} channel The name of the channel the message was sent to.
 *
 * @return {ChatMessage} The new message object.
 */
export function ChatMessageCreate(
    user: User,
    state: ChatUserstate,
    contents: string,
    isBot: boolean,
    channel?: string): ChatMessage
{
    return {
        user,
        contents,
        channel,
        isBot,
        emotes: state.emotes || {},
        when: new Date(parseInt(state['tmi-sent-ts'])),
        isFirst: !!state['first-msg'],
    };
}

/**
 * Adds a new chat event handler.
 *
 * @param {ChatEventHandlerCallback} callback The function to call when a chat message is received.
 * @param {ChatEventHandlerFilter} include The inclusion filter that, if given, must pass for the message to be dispatched.
 * @param {ChatEventHandlerFilter} exclude The exclusion filter that, if given, must fail for the message to be dispatched.
 *
 * @return {number} The uid for the newly added event handler.
 */
export function ChatAddEventHandler(
    callback: ChatEventHandlerCallback,
    include?: ChatEventHandlerFilter,
    exclude?: ChatEventHandlerFilter): number
{
    _events.push({
        uid: _uid,
        callback,
        include,
        exclude,
    });

    return _uid++;
}

/**
 * Removes the specified event handler.
 *
 * @param {number} uid The unique id of the event handler to remove.
 *
 * @return {void}
 */
export function ChatRemoveEventListener(
    uid: number): void
{
    let index = _events.length;

    while (index--) {
        if (_events[index].uid === uid) {
            _events.splice(index, 1);
            break;
        }
    }
}

/**
 * Passes the given message instance to all appropriate events.
 *
 * @param {ChatMessage} message The message to dispatch.
 *
 * @return {void}
 */
export function ChatDispatch(
    message: ChatMessage): void
{
    for (const event of _events) {
        if (event.include) {
            if (typeof event.include === 'string') {
                if (event.include !== message.user.login) {
                    continue;
                }
            } else if (Array.isArray(event.include)) {
                if (event.include.indexOf(message.user.login) === -1) {
                    continue;
                }
            } else if (!event.include(message)) {
                continue;
            }
        }

        if (event.exclude) {
            if (typeof event.exclude === 'string') {
                if (event.exclude === message.user.login) {
                    continue;
                }
            } else if (Array.isArray(event.exclude)) {
                if (event.exclude.indexOf(message.user.login) !== -1) {
                    continue;
                }
            } else if (event.exclude(message)) {
                continue;
            }
        }

        event.callback(message);
    }
}
