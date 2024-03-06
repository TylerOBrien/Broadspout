/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Config
*/

import { TwitchConfig } from '@config/Twitch';

/**
 * System Imports
*/

import { User } from '@system/User';

/**
 * Relative Imports
*/

import {
    ChatCommand,
    ChatCommandEvent,
    CommandEventType,
    CommandExecuteHandler,
    CommandEventHandlerFilter,
} from './types';

/**
 * Locals
*/

const _events: { [P in CommandEventType]?: Array<(command: ChatCommand) => void> } = {};
const _commands: Record<string, ChatCommandEvent> = {};
const _history: Record<string, Record<string, Array<Date>>> = {};

/**
 * Private Functions
*/

/**
 * @return {void}
 */
function _appendHistory(
    name: string,
    command: ChatCommand): void
{
    if (!(name in _history)) {
        _history[name] = {[command.user.id]: [new Date]};
    } else if (!(command.user.id in _history[name])) {
        _history[name][command.user.id] = [new Date];
    } else {
        _history[name][command.user.id].push(new Date);
    }
}

/**
 * @param {CommandEventType} type The type of event to dispatch.
 * @param {ChatCommand} command The command object to pass to the callback(s).
 *
 * @return {void}
 */
function _dispatchEvent(
    type: CommandEventType,
    command: ChatCommand): void
{
    if (type in _events) {
        for (const handler of _events[type]) {
            handler(command);
        }
    }
}

/**
 * Public Functions
*/

/**
 * Returns a new command object.
 *
 * @param {string} name The name of the command.
 * @param {User} user The user who used the command.
 * @param {ChatUserstate} state The tmi.js user state of who used the command.
 * @param {string} contents The contents of the message that triggered the command.
 * @param {boolean} isBot Whether the command was used by this bot.
 * @param {string} channel The channel the message was sent to.
 *
 * @return {ChatMessage} The new command object.
 */
export function ChatCommandCreate(
    name: string,
    user: User,
    state: ChatUserstate,
    contents: string,
    isBot: boolean,
    channel?: string): ChatCommand
{
    return {
        name,
        user,
        contents,
        isBot,
        when: new Date(parseInt(state['tmi-sent-ts'])),
    };
}

/**
 * Add a new command to be used in Twitch chat.
 *
 * @param {string} name The name of the command.
 * @param {CommandEventHandler} handler The function to call when the command is used.
 * @param {CommandEventHandlerFilter} include
 * @param {CommandEventHandlerFilter} exclude
 *
 * @return {void}
 */
export function CommandRegister(
    name: string,
    handler: CommandExecuteHandler,
    include?: CommandEventHandlerFilter,
    exclude?: CommandEventHandlerFilter): void
{
    name = (name || '').trim().toLowerCase();

    if (!name) {
        return; // TODO: properly handle this error
    }

    if (name in _commands) {
        return; // TODO: properly handle this error
    }

    _commands[name] = {
        handler,
        include,
        exclude,
    };
}

/**
 * Adds a new command event handler.
 *
 * @param {type} CommandEventType The type of event to listen for.
 * @param {CommandEventHandler} handler The function to call when the event happens.
 *
 * @return {void}
 */
export function CommandAddEventHandler(
    type: CommandEventType,
    handler: CommandExecuteHandler,
    include?: CommandEventHandlerFilter,
    exclude?: CommandEventHandlerFilter): void
{
    if (!(type in _events)) {
        _events[type] = [handler];
    } else {
        _events[type].push(handler);
    }
}

/**
 * Passes the given command object to all appropriate event handlers.
 *
 * @param {ChatCommand} command The command to dispatch.
 *
 * @return {void}
 */
export function CommandDispatch(
    command: ChatCommand): void
{
    const lower = command.name.toLowerCase();

    if (lower in _commands) {
        _appendHistory(lower, command);
        _dispatchEvent(CommandEventType.Execute, command);
    } else {
        _dispatchEvent(CommandEventType.NotFound, command);
    }
}

/**
 * @return {number}
 */
export function CommandGetExecuteCount(
    name: string): number
{
    name = (name || '').toLowerCase();

    if (!(name in _history)) {
        return 0;
    }

    let sum = 0;

    for (const key in _history[name]) {
        sum += (_history[name][key] || []).length;
    }

    return sum;
}
