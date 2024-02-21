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

import { ChatCommand, ChatCommandEvent, CommandEventType, CommandExecuteHandler, CommandEventHandlerFilter } from './types';

/**
 * Locals
*/

const _events: { [P in CommandEventType]?: Array<(command: ChatCommand) => void> } = {};
const _commands: Record<string, ChatCommandEvent> = {};

/**
 * Private Functions
*/

/**
 * @param {CommandEventType} type
 * @param {ChatCommand} command
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
 * @param {User} user
 * @param {string} contents
 * @param {string} channel
 *
 * @return {ChatMessage}
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
        channel: channel.slice(1),
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
    _commands[name] = {
        handler,
        include,
        exclude,
        channel: TwitchConfig.channel,
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
        if (_commands[lower].channel === command.channel) {
            _commands[lower].handler(command);
        }
    } else {
        _dispatchEvent(CommandEventType.NotFound, command);
    }
}
