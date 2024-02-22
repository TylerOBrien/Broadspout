/**
 * Public Functions
*/

/**
 * Generates a psuedo-random integer between and including the given min and
 * max values.
 *
 * @param {number} min The minimum value in the range.
 * @param {number} max The maximum value in the range.
 *
 * @return {number}
 */
export function RandomInt(
    min: number,
    max: number): number
{
    if (min === max) {
        return min;
    }

    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const cutoff = Math.floor((256 ** bytesNeeded) / range) * range;
    const bytes = new Uint8Array(bytesNeeded);

    let value: number;

    do {
        crypto.getRandomValues(bytes);
        value = bytes.reduce((acc, x, n) => acc + x * 256 ** n, 0);
    } while (value >= cutoff);

    return min + value % range;
}

/**
 * Returns a random element from the given array. Will return undefined if the
 * array is empty.
 *
 * @param {Array<Ty>} elements
 *
 * @return {Ty}
 */
export function RandomFrom<Ty>(
    elements: Array<Ty>): Ty
{
    const max = elements?.length;

    if (!max) {
        return undefined;
    } else if (max === 1) {
        return elements[0];
    }

    return elements[RandomInt(0, max - 1)];
}

/**
 * Formats the given duration into a readable timestamp.
 *
 * @param {number} seconds
 *
 * @return {number}
 */
export function SecondsToTimeString(
    seconds: number,
    showms: boolean = true): string
{
    const str = seconds.toString();
    const hr  = Math.floor(seconds / 60 / 60);
    const min = Math.floor(seconds / 60 % 60);
    const sec = Math.floor(seconds % 60);
    const ms  = str.indexOf('.') === -1 ? 0 : parseInt(str.slice(str.indexOf('.') + 1));

    return `${ hr === 0 ? '' : `${ hr }h ` }${ min === 0 ? '' : `${ min }m ` }${ sec < 10 ? '0' : '' }${ sec }s ${ showms ? ms : '' }${ showms && ms < 10 ? '0' : '' }${ showms ? `${ ms < 100 ? '0' : '' }ms` : '' }`;
}

/**
 * Returns true if the given ASCII key code is for an alphanumeric character.
 *
 * @param {number} charCode The code for the ASCII character.
 *
 * @return {boolean}
 */
export function isAlphaNumericChar(
    charCode: number): boolean
{
    return (charCode > 47 && charCode < 58) || // (0-9)
           (charCode > 64 && charCode < 91) || // (A-Z)
           (charCode > 96 && charCode < 123);  // (a-z)
};
