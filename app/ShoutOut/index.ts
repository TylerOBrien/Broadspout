/**
 * System Imports
*/

import { ShoutOutRegister } from '@system/ShoutOut';
import { TmiSend } from '@system/Tmi';
import { User } from '@system/User';

/**
 * Private Functions
*/

/**
 * @param {User} shouter The user who did the shout out.
 * @param {string} name The name of the user who is being shoutted out.
 *
 * @return {void}
 */
function _handle(
    shouter: User,
    name: string): void
{
    TmiSend(`Everybody! Shush. Be quiet. I mean it. Shut the fuck up! Point your peepers toward ${ name }! https://twitch.tv/${ name.toLowerCase() }`);
}

/**
 * Public Functions
*/

/**
 * @return {void}
 */
export function ShoutOutEnable(): void
{
    ShoutOutRegister(_handle);
}
