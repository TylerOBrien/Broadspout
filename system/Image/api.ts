/**
 * Locals
*/

const _cache: Record<string, HTMLImageElement> = {};

/**
 * Private Functions
*/

/**
 * Returns a clone of the specified HTML image element. If the image has not
 * finished loading when this is called then it will wait until loading is
 * completed before returning the image element.
 *
 * @param {string} key The key to be used for cache storage.
 *
 * @return {Promise<HTMLImageElement>} The loaded HTML image element.
 */
function _waitAndCloneFromCache(
    key: string): Promise<HTMLImageElement>
{
    return new Promise((resolve): void => {
        const _check = (): void => {
            if (_cache[key].complete) {
                resolve(_cache[key].cloneNode() as HTMLImageElement);
            } else {
                setTimeout(_check, 32);
            }
        };

        _check();
    });
}

/**
 * Public Functions
*/

/**
 * Creates a new HTML image element and loads the image specified by the URL.
 *
 * @param {string} url The URL of the image.
 * @param {string} crossOrigin The cross origin policy.
 * @param {string} key The key to be used for cache storage.
 *
 * @return {Promise<HTMLImageElement>} The loaded HTML image element.
 */
export function ImageLoad(
    url: string,
    crossOrigin?: string,
    key?: string): Promise<HTMLImageElement>
{
    key = key || url;

    if (key in _cache) {
        return _waitAndCloneFromCache(key);
    }

    return new Promise((resolve): void => {
        _cache[key] = new Image;

        if (crossOrigin) {
            _cache[key].crossOrigin = crossOrigin;
        }

        _cache[key].src = url;
        _cache[key].onload = (): void => resolve(_cache[key]);
    });
}
