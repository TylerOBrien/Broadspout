/**
 * Public Functions
*/

export function isStringEnum<EnumTy extends {[k: string]: string}>(enumType: EnumTy)
{
    return function (token: unknown): token is EnumTy[keyof EnumTy]
    {
        return Object.values(enumType).includes(token as EnumTy[keyof EnumTy]);
    }
}

/**
 * Returns true if the number has decimal places.
 *
 * @param {number} value
 *
 * @return {boolean}
 */
export function isFloat(
    value: number): boolean
{
    return !Number.isInteger(value);
}

/**
 * Returns true if the number is whole.
 *
 * @param {number} value
 *
 * @return {boolean}
 */
export function isInteger(
    value: number): boolean
{
    return Number.isInteger(value);
}

/**
 * Returns true if the number is greater than and not equal to zero.
 *
 * @param {number} value
 *
 * @return {boolean}
 */
export function isPositive(
    value: number): boolean
{
    return value > 0;
}

/**
 * Returns true if the number is less than and not equal to zero.
 *
 * @param {number} value
 *
 * @return {boolean}
 */
export function isNegative(
    value: number): boolean
{
    return value < 0;
}

/**
 * Returns true if the value is truthy. Empty arrays are considered falsey.
 *
 * @param {T} value
 *
 * @return {boolean}
 */
export function isTruthy<T>(
    value: T): boolean
{
    return !!(value && (!Array.isArray(value) || value.length));
}

/**
 * Returns true if the value is truthy. Empty arrays are considered falsey.
 *
 * @param {T} value
 *
 * @return {boolean}
 */
export function isFalsey<T>(
    value: T): boolean
{
    return !value || (Array.isArray(value) && !value.length);
}

/**
 * Returns true if the value is not undefined or null.
 *
 * @param {T} value
 *
 * @return {boolean}
 */
export function isSet<T>(
    value: T): boolean
{
    return value !== undefined && value !== null;
}

/**
 * Returns true if the number is a Date instance.
 *
 * @param {T | Date} value
 *
 * @return {value is Date}
 */
export function isDate<T=unknown>(
    value: T | Date): value is Date
{
    return Object.prototype.toString.call(value) === '[object Date]';
}

/**
 * Returns true if the number is an Object instance.
 *
 * @param {T | object} value
 *
 * @return {value is object}
 */
export function isObject<T=unknown>(
    value: T | object): value is object
{
    return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns true if the string contains only letters of the alphabet.
 *
 * @param {string} value
 *
 * @return {boolean}
 */
export function isAlpha(
    value: string): boolean
{
    let index = value.length;

    while (index--) {
        const code = value.charCodeAt(index);
        if (!(code > 64 && code < 91) && !(code > 96 && code < 123)) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true if the string contains only numbers.
 *
 * @param {string} value
 *
 * @return {boolean}
 */
export function isNumeric(
    value: string): boolean
{
    let index = value.length;

    while (index--) {
        const code = value.charCodeAt(index);
        if (code < 48 || code > 57) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true if the string is a letter of the alphabet.
 *
 * @param {T} value
 *
 * @return {value is Date}
 */
export function isAlphaNumeric(
    value: string): boolean
{
    let index = value.length;

    while (index--) {
        const code = value.charCodeAt(index);
        if ((code < 48 || code > 57) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) {
            return false;
        }
    }

    return true;
}
