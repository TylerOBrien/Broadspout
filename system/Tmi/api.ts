/**
 * Global Imports
*/

import { Client, ChatUserstate, Options } from 'tmi.js';

/**
 * Config
*/

import { AppConfig } from '@config/App';
import { TwitchConfig } from '@config/Twitch';

/**
 * System
*/

import { ChatEvent, ChatMessageCreate } from '@system/Chat';
import { ChatCommandCreate } from '@system/Command';
import { EventDispatch } from '@system/EventDispatcher';
import { Endpoint } from '@system/Network';
import { UserCreate } from '@system/User';

/**
 * Relative Imports
*/

import { TmiEvent } from './events';

/**
 * Locals
*/

let _client: Client;

/**
 * Private Functions
*/

/**
 * Handles chat messages received through the tmi.js library.
 *
 * @param {string} channel The name of the channel the message was sent to.
 * @param {ChatUserstate} state The Tmi.js state.
 * @param {string} contents The chat message contents.
 * @param {boolean} self The flag denoting if this message was from this app/bot.
 *
 * @return {void}
 */
function _handleTmiChatMessage(
    channel: string,
    state: ChatUserstate,
    contents: string,
    self: boolean): void
{
    const user = UserCreate(state);
    const message = ChatMessageCreate(user, state, contents, self, channel);

    EventDispatch(ChatEvent.Event, ChatEvent.Listener.Message, user, message);
}

/**
 * Handles command messages received through the tmi.js library.
 *
 * @param {string} channel The name of the channel the message was sent to.
 * @param {ChatUserstate} state The Tmi.js state.
 * @param {string} contents The chat message contents.
 * @param {boolean} self The flag denoting if this message was from this app/bot.
 *
 * @return {void}
 */
function _handleTmiChatCommand(
    channel: string,
    state: ChatUserstate,
    contents: string,
    self: boolean): void
{
    const pivot = contents.indexOf(' '); // First space (if given) denotes the beginning of args.
    const name = contents.slice(1); // Remove the ! that all commands start with.
    const args = pivot === -1 ? null : contents.slice(pivot+1); // Existence of space means args were given.
    const user = UserCreate(state);
    const command = ChatCommandCreate(name, user, state, args, self, channel);

    EventDispatch(TmiEvent.Event, TmiEvent.Listener.Command, user, command);
}

/**
 * Handles chat and command messages received through the tmi.js library.
 *
 * @param {string} channel The name of the channel the message was sent to.
 * @param {ChatUserstate} state The Tmi.js state.
 * @param {string} contents The chat message contents.
 * @param {boolean} self The flag denoting if this message was from this app/bot.
 *
 * @return {void}
 */
function _handleTmiMessage(
    channel: string,
    state: ChatUserstate,
    contents: string,
    self: boolean): void
{
    if (contents[0] === '!' && contents.length > 1) {
        _handleTmiChatCommand(channel, state, contents, self);
    } else {
        _handleTmiChatMessage(channel, state, contents, self);
    }
}

/**
 * Public Functions
*/

/**
 * Writes a message to Twitch chat.
 *
 * @param {string} contents The message contents to write.
 * @param {string?} channel The channel to send the message to.
 *
 * @return {void}
 */
export function TmiSend(
    contents: string,
    channel?: string): void
{
    _client.say(channel || TwitchConfig.channel, contents);
}

/**
 * Preapres the Tmi API for usage. Should only be called once.
 *
 * @param {string} username The Twitch username to login with.
 * @param {string} password The Twitch password belonging to the specified username.
 * @param {string | Array<string>} channel The Twitch channel to connect to.
 *
 * @return {Promise<Endpoint>} The IP address and port that was connected to.
 */
export function TmiInit(
    username: string,
    password: string,
    channel: string | Array<string>): Promise<Endpoint>
{
    return new Promise((resolve, reject): void => {
        const options: Options = {
            options:    { debug: AppConfig.debug },
            connection: { secure: true },
            identity:   { username, password },
            channels:   Array.isArray(channel) ? channel : [channel],
        };

        try {
            _client = new Client(options);
        } catch (error) {
            return reject(error);
        }

        _client.on('message', _handleTmiMessage);
        _client.on('connected', (address: string, port: number): void => {
            resolve({ address, port });
        });

        _client.connect();
    });
}
