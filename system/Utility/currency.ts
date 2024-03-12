/**
 * Relative Imports
*/

import { isNumeric } from './guards';

/**
 * Functions
*/

/**
 * Parses the human-readable currency string and returns the number of cents.
 *
 * @param {string} localeString The currency string to convert to cents.
 * @param {string} decimalPoint The separator used between dollars and cents.
 *
 * @return {number} The number of cents.
 */
export function cents(
    localeString: string,
    decimalPoint: string = '.'): number
{
    const pivot = localeString.lastIndexOf(decimalPoint);
    const major = localeString.slice(0, pivot === -1 ? undefined : pivot);

    let cents = pivot === -1 ? 0 : parseInt(localeString.substr(pivot+1, 2));

    if (isNaN(cents)) {
        return NaN;
    }

    let base = 1;
    let index = major.length;

    while (index--) {
        if (isNumeric(major[index])) {
            cents += parseInt(major[index]) * base;
            base *= 10;
        }
    }

    return cents;
}

/**
 * Returns the given number of cents as a formatted currency string that
 * is human-readable.
 *
 * @param {number} cents The number of cents to convert to a currency string.
 * @param {string} currencySign The denomination to place at the start of the string.
 * @param {string} thousandsSeparator The separator used between thousands.
 * @param {string} decimalPoint The separator used between dollars and cents.
 *
 * @return {string} The currency string.
 */
export function localeString(
    cents: number,
    currencySign: string = '$',
    thousandsSeparator: string = ',',
    decimalPoint: string = '.'): string
{
    let currency = (cents / 100).toFixed(2);

    if (decimalPoint !== '.') {
        const pivot = currency.indexOf('.');
        currency = currency.substring(0, pivot) + decimalPoint + currency.substring(pivot + 1);
    }

    // If less than $1000.00 then there are no thousands separators to be added.

    if (cents < 100000) {
        return currencySign + currency;
    }

    // Add thousands separators.

    let formatted = currency.slice(-3);
    const end = currency.length;

    // Iterate backward, skipping the last three characters (i.e. the decimal
    // point and two digits representing the cents), adding a separator every
    // three characters.

    for (let i = (end-3); i > 2; i -= 3) {
        formatted = ((i === 3 ? '' : thousandsSeparator) + currency.slice(i-3, i)) + formatted;
    }

    return currencySign + currency.slice(0, end % 3) + formatted;
}

/**
 * Utility
*/

export const Currency = {
    cents,
    localeString,
};
