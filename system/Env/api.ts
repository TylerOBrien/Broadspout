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
 * @return {HTMLDivElement}
 */
function _getElement(
    key: string): HTMLDivElement
{
    let element = document.getElementById(key);

    if (!element) {
        element = document.createElement('div');
        element.id = key;
        element.style.display = 'none';

        _base.appendChild(element);
    }

    return element as HTMLDivElement;
}

/**
 * Public Functions
*/

/**
 * Returns the specified config value.
 *
 * @param {string} key The key/name of the config value.
 * @param {string} defaultValue The value to return if the config value cannot be found.
 *
 * @return {string} The config value.
 */
export function Env(
    key: string,
    defaultValue: string = null): string
{
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
 * Prepares the Config API for usage. Should only be called once.
 *
 * Waits for the required config keys to be injected into CSS by OBS. If the
 * keys are not found within 10 seconds then the promise will be rejected.
 *
 * @return {Promise<void>}
 */
export function EnvInit(): Promise<void>
{
    _base = document.createElement('div');

    _base.id = 'Config';
    _base.style.display = 'none';

    document.body.appendChild(_base);

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

            resolve();
        };

        wait();
    });
}
