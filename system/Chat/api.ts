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
    ChatEventHandlerRestriction,
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
 * @return {ChatMessage}
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
 * @param {ChatEventHandlerRestriction} restriction
 *
 * @return {number}
 */
export function ChatAddEventHandler(
    callback: ChatEventHandlerCallback,
    restriction?: ChatEventHandlerRestriction): number
{
    _events.push({
        uid: _uid,
        callback,
        restriction,
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
        if (event.restriction) {
            if (typeof event.restriction === 'string') {
                if (event.restriction === message.user.login) {
                    continue;
                }
            } else if (Array.isArray(event.restriction)) {
                if (event.restriction.indexOf(message.user.login) !== -1) {
                    continue;
                }
            } else if (event.restriction(message)) {
                continue;
            }
        }

        event.callback(message);
    }
}
