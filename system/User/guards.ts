/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Relative Imports
*/

import { User, UserIdentity } from './types';

/**
 * Public Functions
*/

export function isUserIdentity(object: unknown): object is UserIdentity
{
    return typeof (object as User).id === 'number';
}

export function isUser(object: unknown): object is User
{
    return typeof (object as User).id === 'number' &&
           typeof (object as User).name === 'string' &&
           typeof (object as User).login === 'string' &&
           Array.isArray(typeof (object as User).badges);
}

export function isTmiUserState(object: unknown): object is ChatUserstate
{
    return typeof (object as ChatUserstate)['display-name'] === 'string' &&
           typeof (object as ChatUserstate)['tmi-sent-ts'] === 'string';
}
