/**
 * Relative Imports
*/

import { Image } from './types';

/**
 * Locals
*/

const _cache: Record<string, Image> = {};

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
            if (_cache[key].element.complete) {
                resolve(_cache[key].element.cloneNode() as HTMLImageElement);
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
 * @param {string} cacheKey The key to be used for cache storage.
 *
 * @return {Promise<HTMLImageElement>} The loaded HTML image element.
 */
export function ImageLoad(
    url: string,
    crossOrigin?: string,
    cacheKey?: string): Promise<HTMLImageElement>
{
    cacheKey = cacheKey || url;

    if (cacheKey in _cache) {
        return _waitAndCloneFromCache(cacheKey);
    }

    return new Promise((resolve): void => {
        function onLoaded(): void
        {
            _cache[cacheKey].loadedAt = new Date;

            resolve(_cache[cacheKey].element);
        }

        _cache[cacheKey] = {
            element: new Image,
        };

        if (crossOrigin) {
            _cache[cacheKey].element.crossOrigin = crossOrigin;
        }

        _cache[cacheKey].element.src = url;
        _cache[cacheKey].element.onload = onLoaded;
    });
}
