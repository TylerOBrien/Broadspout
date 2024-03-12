/**
 * System Imports
*/

import { isStringEnum } from '@system/Utility';
import { DurationInfo } from '.';

/**
 * Relative Imports
*/

import { Duration, DurationType } from './types';

/**
 * Public Functions
*/

export function isDuration(object: unknown): object is Duration
{
    return typeof (object as Duration).value === 'number' && isDurationType((object as Duration).type);
}

export function isDurationType(object: unknown): object is DurationType
{
    return isStringEnum(DurationType)(object);
}

export function isDurationInfo(object: unknown): object is DurationInfo
{
    return typeof (object as DurationInfo).milliseconds === 'number';
}
