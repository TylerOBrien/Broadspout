/**
 * System Imports
*/

import { Duration, DurationType } from './types';

/**
 * Public Functions
*/

/**
 * Returns the difference between the two given dates in seconds.
 *
 * @param {Date} first The first date.
 * @param {Date} second The second date.
 *
 * @return {number} The delta of the two given dates in seconds.
 */
export function ChronoDateDiffSeconds(
    first: Date,
    second: Date): number
{
    return Math.abs((first ? first.getTime() : 0) - (second ? second.getTime() : 0));
}

/**
 * Returns the given duration represented as milliseconds.
 *
 * @param {Duration} duration The duration to convert.
 *
 * @return {number} The given duration in milliseconds.
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
 * @return {number} The given duration in seconds.
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

/**
 * Formats the given duration into a readable timestamp.
 *
 * @param {number} seconds The number of seconds to format.
 * @param {boolean} showms
 *
 * @return {string} The formatted string.
 */
export function ChronoSecondsToTimeString(
    seconds: number,
    showms: boolean = true): string
{
    const str = seconds.toString();
    const hr  = Math.floor(seconds / 60 / 60);
    const min = Math.floor(seconds / 60 % 60);
    const sec = Math.floor(seconds % 60);
    const ms  = str.indexOf('.') === -1 ? 0 : parseInt(str.slice(str.indexOf('.') + 1));

    return `${ hr  === 0 ? '' : `${hr}h ` }` +
           `${ min === 0 ? '' : `${min}m ` }` +
           `${ sec === 0 ? '' : `${sec}s ` }` +
           showms
               ? `${ ms }${ ms < 10 ? '0' : '' }${ ms < 100 ? '0' : '' }`
               : '';
}
