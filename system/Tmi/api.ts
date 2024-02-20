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

import { ChatDispatch, ChatMessageCreate } from '@system/Chat';
import { ChatCommandCreate, CommandDispatch } from '@system/Command';
import { Endpoint } from '@system/Network';
import { UserCreate } from '@system/User';

/**
 * Locals
*/

let _client: Client;

/**
 * Private Functions
*/

/**
 * @param {string} channel The name of the channel the message was sent to.
 * @param {ChatUserstate} state The Tmi.js state.
 * @param {string} contents The chat message contents.
 * @param {boolean} self The flag denoting if this message was from this app/bot.
 *
 * @return {void}
 */
function _handleTmiChat(
    channel: string,
    state: ChatUserstate,
    contents: string,
    self: boolean): void
{
    ChatDispatch(
        ChatMessageCreate(
            UserCreate(state),
            state,
            contents,
            self,
            channel,
        )
    );
}

/**
 * @param {string} channel The name of the channel the message was sent to.
 * @param {ChatUserstate} state The Tmi.js state.
 * @param {string} contents The chat message contents.
 * @param {boolean} self The flag denoting if this message was from this app/bot.
 *
 * @return {void}
 */
function _handleTmiCommand(
    channel: string,
    state: ChatUserstate,
    contents: string,
    self: boolean): void
{
    const pivot = contents.indexOf(' '); // First space (if given) denotes the beginning of args.

    CommandDispatch(
        ChatCommandCreate(
            contents.slice(1), // Remove the ! that all commands start with.
            UserCreate(state),
            state,
            pivot === -1 ? null : contents.slice(pivot + 1), // Check if args were given.
            self,
            channel,
        )
    );
}

/**
 * @param {string} channel
 * @param {ChatUserstate} state
 * @param {string} contents
 * @param {boolean} self
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
        _handleTmiCommand(channel, state, contents, self);
    } else {
        _handleTmiChat(channel, state, contents, self);
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
 * @param {string} username
 * @param {string} password
 * @param {string | Array<string>} channel
 *
 * @return {Promise<Endpoint>}
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
            channels:   Array.isArray(channel) ? channel : [ channel ],
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
