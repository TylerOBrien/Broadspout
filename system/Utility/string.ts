/**
 * Private Types/Interfaces
*/

enum StringPosition
{
    NotFound = -1,
}

enum StringToken
{
    CaptureKey = '$',
    CaptureStart = '(',
    CaptureEnd = ')',
}

/**
 * Functions
*/

/**
 * Returns the number of occurrences of the given needle value.
 *
 * @param {string} haystack
 * @param {string | Array<string>} needle
 *
 * @return {number}
 */
function count(
    haystack: string,
    needle: string | Array<string>): number
{
    if (!needle.length) {
        return 0;
    } else if (typeof needle === 'string') {
        needle = [needle];
    }

    let count = 0;

    for (const item of needle) {
        let index = haystack.indexOf(item);

        while (index !== -1) {
            count++;
            index = haystack.indexOf(item, index + 1);
        }
    }

    return count;
}

/**
 * Adds the source string as a prefix to the beginning string if it is not
 * already the prefix.
 *
 * @param {string} source
 * @param {string} beginning
 *
 * @return {string}
 */
function start(
    source: string,
    beginning: string): string
{
    if (!source || source.indexOf(beginning) === 0) {
        return source;
    }

    return beginning + source;
}

/**
 * Adds the source string as a suffix to the beginning string if it is not
 * already the suffix.
 *
 * @param {string} source
 * @param {string} ending
 *
 * @return {string}
 */
function finish(
    source: string,
    ending: string): string
{
    if (!source || source.lastIndexOf(ending) === (source.length - ending.length)) {
        return source;
    }

    return source + ending;
}

/**
 * @return {string}
 */
function format(
    source: string,
    replacer: (token: string) => string): string
{
    const end = source.length;

    let previousI = 0;
    let keyI = StringPosition.NotFound;
    let startI = StringPosition.NotFound;
    let formatted = '';

    for (let i = 0; i < end; i++) {
        if (keyI === StringPosition.NotFound) {
            if (source[i] === StringToken.CaptureKey) {
                keyI = i;
            } else {
                previousI++;
            }
        } else if (startI === StringPosition.NotFound) {
            if (source[i] === StringToken.CaptureStart) {
                startI = i;
            } else {
                keyI = StringPosition.NotFound;
                previousI += 2;
            }
        } else if (source[i] === StringToken.CaptureEnd) {
            formatted += source.slice(previousI, keyI) + replacer(source.slice(startI+1, i).trim());
            previousI = i+1;
            keyI = StringPosition.NotFound;
            startI = StringPosition.NotFound;
        }
    }

    return formatted;
}

/**
 * Assumes the passed word param is a single word and converts it to a singular
 * form if it is not already singular.
 *
 * @param {string} word
 *
 * @return {string}
 */
function singular(
    word: string): string
{
    const end = (word.length - 1);

    if (end > 1 && word[end] === 's') {
        if (end > 2 && word.slice(-3) === 'ies') {
            word = word.slice(0, end-2) + 'y';
        } else {
            word = word.slice(0, end);
        }
    }

    return word;
}

/**
 * Assumes the passed word param is a single word and converts it to a plural
 * form if it is not already plural.
 *
 * @param {string} word
 *
 * @return {string}
 */
function plural(
    word: string): string
{
    const end = (word.length - 1);

    if (end > 0 && word[end] !== 's') {
        if (word[end] === 'y') {
            word = (word.slice(0, end) + 'ies');
        } else {
            word = (word + 's');
        }
    }

    return word;
}

/**
 * Returns the word param with the first letter in lowercase.
 *
 * @param {string} word
 *
 * @return {string}
 */
function lcfirst(
    word: string): string
{
    return word && (word[0].toLowerCase() + word.slice(1));
}

/**
 * Returns the word param with the first letter in uppercase.
 *
 * @param {string} word
 *
 * @return {string}
 */
function ucfirst(
    word: string): string
{
    return word && (word[0].toUpperCase() + word.slice(1));
}

/**
 * Check if the string matches the given pattern via a regex test operation. An
 * asterisk can be used as a wildcard.
 *
 * @param {string} source
 * @param {string | Array<string>} pattern
 *
 * @return {boolean}
 */
function matches(
    source: string,
    pattern: string | Array<string>): boolean
{
    if (!pattern.length) {
        return !source.length;
    } else if (typeof pattern === 'string') {
        pattern = [pattern];
    }

    for (const item of pattern) {
        if (item === source) {
            continue;
        }

        const expr = new RegExp('^' + item.replace(/\*/g, '.*') + '$');

        if (!expr.test(source)) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if the given needle exists within the string.
 *
 * @param {string} string
 * @param {string | Array<string>} needle
 *
 * @return {boolean}
 */
function contains(
    haystack: string,
    needle: string | Array<string>): boolean
{
    if (typeof needle === 'string') {
        return haystack.indexOf(needle) !== -1;
    }

    for (const item of needle) {
        if (haystack.indexOf(item) === -1) {
            return false;
        }
    }

    return true;
}

/**
 *
 *
 * @param {string} source
 * @param {number} maxLength
 * @param {string} ending
 *
 * @return {source}
 */
function limit(
    source: string,
    maxLength: number = 100,
    ending: string = '…'): string
{
    if (source.length > maxLength) {
        return source.substr(0, maxLength) + ending;
    }

    return source;
}

/**
 * Utility
*/

export const Str = {
    count,
    start,
    finish,
    format,
    singular,
    plural,
    lcfirst,
    ucfirst,
    matches,
    contains,
    limit,
};
