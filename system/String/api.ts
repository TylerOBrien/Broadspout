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
 * Public Functions
*/

/**
 * @param {string} source
 * @param {(string) => string} replacer
 *
 * @return {string}
 */
export function StringReplace(
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
