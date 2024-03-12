/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * System
*/

import { EventAddListener, EventCallback, EventFilter } from '@system/EventDispatcher';
import { User } from '@system/User';

/**
 * Relative Imports
*/

import { ChatMessage } from './types';
import { ChatEvent } from './events';

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
 * @param {ChatEventHandlerCallback} callback The function to call when a chat message is dispatched.
 * @param {ChatEventHandlerFilter} include The inclusion filter that, if given, must pass for the message to be dispatched.
 * @param {ChatEventHandlerFilter} exclude The exclusion filter that, if given, must fail for the message to be dispatched.
 *
 * @return {number} The uid for the newly added event handler.
 */
export function ChatAddEventListener(
    callback: EventCallback,
    filter?: EventFilter): number
{
    return EventAddListener(ChatEvent.Event, ChatEvent.Listener.Message, callback, filter);
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
    //
}
