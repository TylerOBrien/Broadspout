/**
 * System Imports
*/

import { Duration, DurationType } from './types';

/**
 * Public Functions
*/

/**
 * Returns the given duration represented as milliseconds.
 *
 * @param {Duration} duration The duration to convert.
 *
 * @return {number}
 */
export function ChronoDurationMilliseconds(
    duration: Duration): number
{
    switch (duration.type) {
    case DurationType.Milliseconds:
        return duration.value;
    case DurationType.Seconds:
        return Math.round(duration.value * 1000);
    }
}

/**
 * Returns the given duration represented as seconds.
 *
 * @param {Duration} duration The duration to convert.
 *
 * @return {number}
 */
 export function ChronoDurationSeconds(
    duration: Duration): number
{
    switch (duration.type) {
    case DurationType.Milliseconds:
        return Math.round(duration.value / 1000);
    case DurationType.Seconds:
        return duration.value;
    }
}
