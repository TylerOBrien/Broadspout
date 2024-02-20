/**
 * Config Imports
*/

import { EventSubConfig } from '@config/EventSub';

/**
 * Relative Imports
*/

import { EventSubType, EventSubProtocol, EventSubState, EventSubHandler } from './types';
import {
    EventSubPayload,
    EventSubDriverCreateCheer,
    EventSubDriverCreateFollow,
    EventSubDriverCreateRaid,
    EventSubDriverCreateRedeem,
    EventSubDriverCreateSubscribe,
} from './drivers';

/**
 * Locals
*/

let _ws: WebSocket;
let _events: Record<string, EventSubHandler>;
let _state: EventSubState;

/**
 * Private Functions
*/

/**
 * Calls the registered callback for the EventSub type. If no callback has been
 * registered then this will do nothing.
 *
 * @param {EventSubPayload} data The data received from the server.
 *
 * @return {void}
 */
function _handleEvent(
    data: EventSubPayload): void
{
    switch (data.subscription.type) {
    case 'channel.cheer':
        if (EventSubType.Cheer in _events) {
            _events[EventSubType.Cheer](EventSubDriverCreateCheer(data));
        }
        break;
    case 'channel.follow':
        if (EventSubType.Follow in _events) {
            _events[EventSubType.Follow](EventSubDriverCreateFollow(data));
        }
        break;
    case 'channel.raid':
        if (EventSubType.Raid in _events) {
            _events[EventSubType.Raid](EventSubDriverCreateRaid(data));
        }
        break;
    case 'channel.subscribe':
    case 'channel.subscription.message':
        if (EventSubType.Subscribe in _events) {
            _events[EventSubType.Subscribe](EventSubDriverCreateRedeem(data));
        }
        break;
    case 'channel.channel_points_custom_reward_redemption.add':
        if (EventSubType.Redeem in _events) {
            _events[EventSubType.Redeem](EventSubDriverCreateSubscribe(data));
        }
        break;
    }
}

/**
 * Iterates over the array of EventSub events and processes them.
 *
 * @param {MessageEvent<string>} message The data received from the server.
 *
 * @return {void}
 */
function _handleWebSocketMessage(
    message: MessageEvent<string>): void
{
    for (const event of JSON.parse(message.data)) {
        _handleEvent(event);
    }
}

/**
 * Public Functions
*/

/**
 * @param {EventSubType} type
 * @param {EventSubHandler} handler
 *
 * @return {void}
 */
export function EventSubRegister(
    type: EventSubType,
    handler: EventSubHandler): void
{
    _events[type] = handler;
}

/**
 * @return {EventSubState}
 */
export function EventSubGetState(): EventSubState
{
    return _state;
}

/**
 * Attempts to connect to the EventSub provider using WebSocket.
 *
 * @param {string} host
 * @param {string} secret
 * @param {EventSubProtocol} protocol
 *
 * @return {Promise<void>}
 */
export async function EventSubInit(
    host: string,
    secret: string,
    protocol: EventSubProtocol = 'ws'): Promise<void>
{
    return new Promise((resolve, reject): void => {
        try {
            _ws = new WebSocket(`${ protocol }://${ host }`);
        } catch (error) {
            return reject(error);
        }

        _events = {};
        _state = EventSubState.Connecting;

        _ws.onmessage = (message: MessageEvent<string>): void => {
            if (message.data === EventSubConfig.successMessage) {
                _state = EventSubState.Connected;
                _ws.onmessage = _handleWebSocketMessage;
                resolve();
            } else {
                _state = EventSubState.Error;
                _ws.onmessage = null;
                reject(); // TODO: handle auth error
            }
        };

        _ws.onopen = (): void => {
            _ws.send(secret);
        };
    });
}
