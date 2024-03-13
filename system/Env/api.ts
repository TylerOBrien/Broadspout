/**
 * Config
*/

import { EnvConfig } from '@config/Env';

/**
 * Locals
*/

let _base: HTMLDivElement;
let _cache: Record<string, string>;

/**
 * Private Functions
*/

/**
 * Returns the environment HTML element associated with the given key.
 *
 * @param {string} key The key/name of the environment value.
 *
 * @return {HTMLDivElement} The environment HTML element.
 */
function _getElement(
    key: string): HTMLDivElement
{
    let element = document.getElementById(key) as HTMLDivElement;

    if (!element) {
        element = document.createElement('div');
        element.id = key;
        element.style.display = 'none';

        _base.appendChild(element);
    }

    return element;
}

/**
 * Public Functions
*/

/**
 * Returns the specified environment value.
 *
 * @param {string} key The key/name of the environment value.
 * @param {string} defaultValue The value to return if the environment value cannot be found.
 *
 * @return {string} The environment value.
 */
export function Env(
    key: string,
    defaultValue: string = null): string
{
    if (!_base) {
        throw new Error; // TODO: handle this error
    }

    if (key in _cache) {
        return _cache[key];
    }

    const params = new URLSearchParams(location.search);

    if (params.get(key)) {
        return params.get(key);
    }

    const element = _getElement(key);
    const style = window.getComputedStyle(element, '::before');
    const content = style.content;

    switch (content) {
    case 'none':
        return defaultValue;
    default:
        _cache[key] = content.slice(1, -1); // Remove quotation marks added by CSS.
    }

    return _cache[key];
}

/**
 * Prepares the Env API for usage. Should only be called once.
 *
 * Waits for the required environment keys to be injected into CSS by OBS. If
 * the keys are not found then the promise will be rejected.
 *
 * @return {Promise<void>}
 */
export function EnvInit(): Promise<void>
{
    return new Promise((resolve, reject): void => {
        let attemps = 0;

        const wait = (): void => {
            if (++attemps > 100) {
                return reject(); // Consider 100 attempts to be a failure as this should never take this long.
            }

            for (const key of EnvConfig.required) {
                if (!Env(key)) {
                    setTimeout(wait, 50);
                    return;
                }
            }

            _cache = {};
            _base = document.createElement('div');

            _base.id = EnvConfig.baseElementId;
            _base.style.display = 'none';

            document.body.appendChild(_base);

            resolve();
        };

        wait();
    });
}
