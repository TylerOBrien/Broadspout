/**
 * System Imports
*/

import { ConfigInit } from '@system/Config';
import { ShoutOutInit } from '@system/ShoutOut';
import { SoundInit } from '@system/Sound';

/**
 * Relative Imports
*/

import { ShoutOutEnable } from './ShoutOut';

/**
 * Private Functions
*/

/**
 * @return {Promise<void>}
 */
async function ApplicationInit(): Promise<void>
{
    await ConfigInit();
    await ShoutOutInit();
    await SoundInit();
}

/**
 * @return {Promise<void>}
 */
async function ApplicationRegister(): Promise<void>
{
    ShoutOutEnable();
}

/**
 * Main
*/

ApplicationInit();
ApplicationRegister();
