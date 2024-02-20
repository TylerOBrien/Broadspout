/**
 * Relative Imports
*/

import { User } from './types';

/**
 * Public Functions
*/

export function isUser(object: unknown): object is User
{
    return typeof (object as User).name === 'string' && Array.isArray((object as User).badges);
}
