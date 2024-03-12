/**
 * Relative Imports
*/

import { isDurationInfo } from './guards';
import { Duration, DurationFormat, DurationType, DurationInfo, DurationStringRestriction, DurationTuple } from './types';

/**
 * Locals
*/

const _types = [
    DurationType.Milliseconds,
    DurationType.Seconds,
    DurationType.Minutes,
    DurationType.Hours,
    DurationType.Days,
    DurationType.Weeks,
];

/**
 * Private Functions
*/

/**
 * @param {number} quotient
 * @param {DurationFormat} format
 *
 * @return {number}
 */
function _applyFormat(
    quotient: number,
    format: DurationFormat): number
{
    switch (format) {
    case DurationFormat.Raw:
        return quotient;
    case DurationFormat.Ceil:
        return Math.ceil(quotient);
    case DurationFormat.Floor:
        return Math.floor(quotient);
    case DurationFormat.Round:
        return Math.round(quotient);
    }
}

/**
 * @return {DurationType}
 */
function _type(
    duration: Duration | DurationTuple): DurationType
{
    return Array.isArray(duration) ? duration[1] : duration.type;
}

/**
 * @return {number}
 */
function _value(
    duration: Duration | DurationTuple): number
{
    return Array.isArray(duration) ? duration[0] : duration.value;
}

/**
 * Public Functions
*/

/**
 * Returns the delta/difference between the two given dates.
 *
 * @param {Date} first The first date.
 * @param {Date} second The second date.
 * @param {DurationType} unit The unit to use for the delta.
 * @param {DurationFormat} format
 *
 * @return {Duration} The delta of the two given dates.
 */
export function ChronoDateDelta(
    first: Date,
    second: Date,
    unit: DurationType = DurationType.Seconds,
    format: DurationFormat = DurationFormat.Floor): Duration
{
    const firstTime = first ? first.getTime() : 0;
    const secondTime = second ? second.getTime() : 0;
    const abs = Math.abs(firstTime - secondTime);

    switch (unit) {
    case DurationType.Milliseconds:
        return ChronoDurationCreate(abs, DurationType.Milliseconds);
    case DurationType.Seconds:
        return ChronoDurationCreate(_applyFormat(abs / 1000, format), DurationType.Seconds);
    case DurationType.Minutes:
        return ChronoDurationCreate(_applyFormat(abs / 60000, format), DurationType.Minutes);
    case DurationType.Hours:
        return ChronoDurationCreate(_applyFormat(abs / 3600000, format), DurationType.Hours);
    case DurationType.Days:
        return ChronoDurationCreate(_applyFormat(abs / 86400000, format), DurationType.Days);
    case DurationType.Weeks:
        return ChronoDurationCreate(_applyFormat(abs / 604800000, format), DurationType.Weeks);
    }
}

/**
 * Returns the given duration represented as milliseconds.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in milliseconds.
 */
export function ChronoMilliseconds(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration), format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration) * 1000, format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration) * 60000, format);
    case DurationType.Hours:
        return _applyFormat(_value(duration) * 3600000, format);
    case DurationType.Days:
        return _applyFormat(_value(duration) * 86400000, format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration) * 604800000, format);
    }
}

/**
 * Returns the given duration represented as seconds.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in seconds.
 */
export function ChronoSeconds(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration) * 1000, format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration), format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration) / 60, format);
    case DurationType.Hours:
        return _applyFormat(_value(duration) / 3600, format);
    case DurationType.Days:
        return _applyFormat(_value(duration) / 86400, format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration) / 604800, format);
    }
}

/**
 * Returns the given duration represented as minutes.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in minutes.
 */
export function ChronoMinutes(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration) * 60000, format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration) * 60, format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration), format);
    case DurationType.Hours:
        return _applyFormat(_value(duration) / 60, format);
    case DurationType.Days:
        return _applyFormat(_value(duration) / 1440, format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration) / 10080, format);
    }
}

/**
 * Returns the given duration represented as hours.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in hours.
 */
export function ChronoHours(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration) * 3600000, format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration) * 3600, format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration) * 60, format);
    case DurationType.Hours:
        return _applyFormat(_value(duration), format);
    case DurationType.Days:
        return _applyFormat(_value(duration) / 24, format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration) / 168, format);
    }
}

/**
 * Returns the given duration represented as days.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in days.
 */
export function ChronoDays(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration) * 86400000, format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration) * 86400, format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration) * 1440, format);
    case DurationType.Hours:
        return _applyFormat(_value(duration) * 24, format);
    case DurationType.Days:
        return _applyFormat(_value(duration), format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration) / 7, format);
    }
}

/**
 * Returns the given duration represented as weeks.
 *
 * @param {Duration | DurationTuple} duration The duration to convert.
 * @param {DurationFormat} format
 *
 * @return {number} The given duration in weeks.
 */
export function ChronoWeeks(
    duration: Duration | DurationTuple,
    format: DurationFormat = DurationFormat.Round): number
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        return _applyFormat(_value(duration) * 604800000, format);
    case DurationType.Seconds:
        return _applyFormat(_value(duration) * 604800, format);
    case DurationType.Minutes:
        return _applyFormat(_value(duration) * 10080, format);
    case DurationType.Hours:
        return _applyFormat(_value(duration) * 168, format);
    case DurationType.Days:
        return _applyFormat(_value(duration) * 7, format);
    case DurationType.Weeks:
        return _applyFormat(_value(duration), format);
    }
}

/**
 *
 */
export function ChronoDurationConvert(
    duration: Duration | DurationTuple,
    toType: DurationType,
    valueFormat: DurationFormat = DurationFormat.Round): Duration
{
    switch (_type(duration)) {
    case DurationType.Milliseconds:
        switch (toType) {
        case DurationType.Milliseconds:
            return ChronoDurationCreate(_value(duration), DurationType.Milliseconds);
        case DurationType.Seconds:
            return ChronoDurationCreate(_applyFormat(_value(duration) / 1000, valueFormat), DurationType.Seconds);
        }
    case DurationType.Seconds:
        switch (toType) {
        case DurationType.Milliseconds:
            return ChronoDurationCreate(_applyFormat(_value(duration) * 1000, valueFormat), DurationType.Milliseconds);
        case DurationType.Seconds:
            return ChronoDurationCreate(_value(duration), DurationType.Seconds);
        case DurationType.Minutes:
            return ChronoDurationCreate(_applyFormat(_value(duration) / 60, valueFormat), DurationType.Minutes);
        case DurationType.Hours:
            return ChronoDurationCreate(_applyFormat(_value(duration) / 3600, valueFormat), DurationType.Hours);
        case DurationType.Days:
            return ChronoDurationCreate(_applyFormat(_value(duration) / 86400, valueFormat), DurationType.Days);
        case DurationType.Weeks:
            return ChronoDurationCreate(_applyFormat(_value(duration) / 604800, valueFormat), DurationType.Weeks);
        }
    case DurationType.Minutes:
        switch (toType) {
        case DurationType.Milliseconds:
            return ChronoDurationCreate(_applyFormat(_value(duration) * 60000, valueFormat), DurationType.Seconds);
        case DurationType.Seconds:
            return ChronoDurationCreate(_applyFormat(_value(duration) * 60, valueFormat), DurationType.Seconds);
        case DurationType.Minutes:
            return ChronoDurationCreate(_value(duration), DurationType.Minutes);
        }
    case DurationType.Hours:
        switch (toType) {
        case DurationType.Milliseconds:
        }
    case DurationType.Days:
        switch (toType) {
        case DurationType.Milliseconds:
        }
    case DurationType.Weeks:
        switch (toType) {
        case DurationType.Milliseconds:
        }
    }
}

/**
 * Formats the given duration into a readable timestamp.
 *
 * @param {Duration | DurationTuple} duration The duration to format.
 * @param {TimeStringFormat} format
 *
 * @return {string} The formatted string.
 */
export function ChronoDurationString(
    duration: Duration | DurationTuple | DurationInfo,
    target?: DurationType | Array<DurationType>,
    restriction: DurationStringRestriction = DurationStringRestriction.Show): string
{
    // Ensure targets is an array.

    const targets = Array.isArray(target) ? target : target ? [target] : _types;

    // If the Hide mode is given then add all types that are not in the
    // target array then remove the types that were given to invert the array.

    if (restriction === DurationStringRestriction.Hide) {
        const previousLength = targets.length;

        for (const type of _types) {
            if (targets.indexOf(type) === -1) { // Add only types that don't exist.
                targets.push(type);
            }
        }

        targets.splice(0, previousLength); // Remove only the originally given types.
    }

    // Build the string.

    const info = isDurationInfo(duration) ? duration : ChronoDurationInfoCreate(duration);
    const parts: Array<string> = [];

    for (const target of targets) {
        switch (target) {
        case DurationType.Milliseconds:
            parts.push(`${info.milliseconds}ms`);
            break;
        case DurationType.Seconds:
            parts.push(`${info.seconds}s`);
            break;
        case DurationType.Minutes:
            parts.push(`${info.minutes}m`);
            break;
        case DurationType.Hours:
            parts.push(`${info.hours}h`);
            break;
        case DurationType.Days:
            parts.push(`${info.days}d`);
            break;
        case DurationType.Weeks:
            parts.push(`${info.weeks}w`);
            break;
        }
    }

    return parts.join(' ');
}

/**
 * @return {DurationInfo}
 */
export function ChronoDurationInfoFromString(
    str: string): DurationInfo
{
    const parts = str.split(' ');
    const info: DurationInfo = {
        milliseconds: 0,
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
        weeks: 0,
    };

    for (const part of parts) {
        switch (ChronoDurationTypeFromString(part)) {
        case DurationType.Milliseconds:
            info.milliseconds = parseInt(part);
            break;
        case DurationType.Seconds:
            info.seconds = parseInt(part);
            break;
        case DurationType.Minutes:
            info.minutes = parseInt(part);
            break;
        case DurationType.Hours:
            info.hours = parseInt(part);
            break;
        case DurationType.Days:
            info.days = parseInt(part);
            break;
        case DurationType.Weeks:
            info.weeks = parseInt(part);
            break;
        }
    }

    return info;
}

/**
 * @return {DurationType}
 */
export function ChronoDurationTypeFromString(
    str: string): DurationType
{
    switch (str.toLowerCase()) {
    case 'ms':
    case 'msec':
    case 'millisecond':
    case 'milliseconds':
        return DurationType.Milliseconds;
    case 's':
    case 'sec':
    case 'second':
    case 'seconds':
        return DurationType.Seconds;
    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
        return DurationType.Minutes;
    case 'h':
    case 'hr':
    case 'hour':
    case 'hours':
        return DurationType.Hours;
    case 'd':
    case 'day':
    case 'days':
        return DurationType.Days;
    case 'w':
    case 'week':
    case 'weeks':
        return DurationType.Weeks;
    }

    return null;
}

/**
 * @return {Duration}
 */
export function ChronoDurationFromInfo(
    info: DurationInfo,
    type: DurationType = DurationType.Milliseconds): Duration
{
    return {
        type,
        value: ChronoDurationConvert([info.milliseconds, DurationType.Milliseconds], type).value +
               ChronoDurationConvert([info.seconds, DurationType.Seconds], type).value +
               ChronoDurationConvert([info.minutes, DurationType.Minutes], type).value +
               ChronoDurationConvert([info.hours, DurationType.Hours], type).value +
               ChronoDurationConvert([info.days, DurationType.Days], type).value +
               ChronoDurationConvert([info.weeks, DurationType.Weeks], type).value,
    };
}

/**
 * @return {Duration}
 */
export function ChronoDurationFromString(
    str: string,
    type: DurationType = DurationType.Milliseconds): Duration
{
    return ChronoDurationFromInfo(ChronoDurationInfoFromString(str), type);
}

/**
 * @return {DurationInfo}
 */
export function ChronoDurationInfoCreate(
    duration: Duration | DurationTuple): DurationInfo
{
    const raw = ChronoSeconds(duration, DurationFormat.Raw);
    const str = raw.toString();
    const pivot = str.indexOf('.');

    return {
        milliseconds: pivot === -1 ? 0 : parseInt(str.slice(pivot+1, pivot+4)),
        seconds: Math.floor(raw % 60),
        minutes: Math.floor(raw / 60 % 60),
        hours: Math.floor(raw / 3600 % 24),
        days: Math.floor(raw / 86400 % 7),
        weeks: Math.floor(raw / 604800),
    };
}

/**
 * Returns a new Duration object.
 *
 * @param {number} value
 * @param {DurationType} type
 *
 * @return {Duration} The Duration object.
 */
export function ChronoDurationCreate(
    value: number,
    type: DurationType): Duration
{
    return {
        value,
        type,
    };
}

/**
 * @return {Duration}
 */
export function ChronoDurationCreateMilliseconds(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Milliseconds,
    };
}

/**
 * @param {number} value The value to use for the duration.
 *
 * @return {Duration}
 */
export function ChronoDurationCreateSeconds(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Seconds,
    };
}

/**
 * @param {number} value The value to use for the duration.
 *
 * @return {Duration}
 */
export function ChronoDurationCreateMinutes(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Minutes,
    };
}

/**
 * @param {number} value The value to use for the duration.
 *
 * @return {Duration}
 */
export function ChronoDurationCreateHours(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Hours,
    };
}

/**
 * @param {number} value The value to use for the duration.
 *
 * @return {Duration}
 */
export function ChronoDurationCreateDays(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Days,
    };
}

/**
 * @param {number} value The value to use for the duration.
 *
 * @return {Duration}
 */
export function ChronoDurationCreateWeeks(
    value: number): Duration
{
    return {
        value,
        type: DurationType.Weeks,
    };
}
