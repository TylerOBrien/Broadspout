/**
 * Relative Imports
*/

import { StorageItem } from './types';

/**
 * Public Functions
*/

/**
 * @return {Ty}
 */
export function StorageGetLocal<Ty>(
    key: string,
    defaultValue: Ty = null): StorageItem<Ty>
{
    const item = localStorage.getItem(key);

    if (!item) {
        return {
            data: defaultValue,
            writtenAt: null,
        };
    }

    return JSON.parse(item);
}

/**
 * @return {Promise<Ty>}
 */
export async function StorageGetRemote<Ty>(
    host: string,
    key: string,
    defaultValue: Ty = null): Promise<StorageItem<Ty>>
{
    const response = await fetch(host);

    if (response.status < 200 || response.status > 299) {
        // TODO: handle error
    }

    return await response.json();
}

/**
 * @return {Promise<void>}
 */
export async function StorageSetLocal<Ty>(
    key: string,
    data: Ty): Promise<void>
{
    localStorage.setItem(key, JSON.stringify({ data, writtenAt: new Date }));
}

/**
 * @return {Promise<void>}
 */
export async function StorageSetRemote<Ty>(
    host: string,
    key: string,
    data: Ty): Promise<void>
{
    //
}
