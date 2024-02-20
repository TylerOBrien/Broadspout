/**
 * Root Imports
*/

import { ConfigConfig } from '@config/Config';

/**
 * Relative Imports
*/

import { ConfigKey } from './types';

/**
 * Locals
*/

const _config: { [P in ConfigKey]?: string } = {};

/**
 * Public Functions
*/

/**
 * Returns the specified config value.
 *
 * @param {ConfigKey} key The key/name of the config value.
 * @param {string} defaultValue The value to return if the config value cannot be found.
 *
 * @return {string}
 */
export function Config(
    key: ConfigKey,
    defaultValue: string = null): string
{
    if (key in _config) {
        return _config[key];
    }

    const params = new URLSearchParams(location.search);

    if (params.get(key)) {
        return params.get(key);
    }

    let element = document.getElementById(key);

    if (!element) {
        element = document.createElement('div');
        element.id = key;
        element.style.display = 'none';

        document.body.appendChild(element);
    }

    const style = window.getComputedStyle(element, '::before');
    const content = style.content;

    switch (content) {
    case 'none':
        return defaultValue;
    default:
        _config[key] = content.slice(1, -1); // Remove quotation marks added by CSS.
    }

    return _config[key];
}

/**
 * Waits for the required config keys to be injected into CSS by OBS. If the
 * keys are not found within 10 seconds then the promise will be rejected.
 *
 * @return {Promise<void>}
 */
export function ConfigInit(): Promise<void>
{
    return new Promise((resolve, reject) => {
        let attemps = 0;

        const wait = (): void => {
            if (++attemps > 100) {
                return reject(); // Consider 100 attempts to be a failure as this should never take this long.
            }

            for (const key of ConfigConfig.required) {
                if (!Config(key)) {
                    setTimeout(wait, 100);
                    return;
                }
            }

            resolve();
        };

        wait();
    });
}
