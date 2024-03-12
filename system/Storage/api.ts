/**
 * Config
*/

import { StorageConfig } from '@config/Storage';

/**
 * Config
*/

import { StorageItem, StorageMode } from './types';
import { StorageGetLocal, StorageGetRemote, StorageSetLocal, StorageSetRemote } from './drivers';

/**
 * Public Functions
*/

/**
 * @param {string} key
 * @param {Ty} child
 *
 * @return {void}
 */
export function StorageArrayAdd<Ty>(
    key: string,
    child: Ty): void
{
    StorageSet(key, [].concat(StorageGet(key) || [], child));
}

/**
 * @param {string} key
 * @param {(item: Ty) => boolean} predicate
 *
 * @return {void}
 */
export function StorageArrayRemoveIf<Ty>(
    key: string,
    predicate: (item: Ty) => boolean): void
{
    const current = StorageGet<Array<Ty>>(key);

    if (!current) {
        return;
    }

    let i = current.length;

    while (i--) {
        if (predicate(current[i])) {
            current.splice(i, 1);
            StorageSet(key, current);
            return;
        }
    }
}

/**
 * @param {string} key
 * @param {number} index
 *
 * @return {void}
 */
export function StorageArrayRemoveAt(
    key: string,
    index: number): void
{
    const current = StorageGet<Array<unknown>>(key);

    switch (current?.length) {
    case null:
    case undefined:
    case 0:
        return;
    default:
        current.splice(index, 1);
    }

    StorageSet(key, current);
}

/**
 * @param {string} key
 * @param {string} prop
 *
 * @return {Ty}
 */
export function StorageRecordFind<Ty>(
    key: string,
    prop: string,
    childIfNotExist: Ty = null): Ty
{
    const serialized = localStorage.getItem(key);

    if (!serialized) {
        return null;
    }

    const data = JSON.parse(serialized);
    const item = data[prop];

    if (!item && childIfNotExist) {
        data[prop] = childIfNotExist;
        localStorage.setItem(key, JSON.stringify(data));
        return childIfNotExist;
    }

    return item;
}

/**
 * @param {string} key
 * @param {Ty} child
 *
 * @return {void}
 */
export function StorageRecordAdd<Ty>(
    key: string,
    prop: string,
    child: Ty): void
{
    StorageSet(
        key,
        Object.assign(StorageGet(key) || {}, { [prop]: child }),
    );
}

/**
 * @return {Promise<Ty>}
 */
export async function StorageGet<Ty>(
    key: string,
    defaultValue: Ty = null,
    mode?: StorageMode): Promise<StorageItem<Ty>>
{
    switch (mode || StorageConfig.defaultMode) {
    case StorageMode.Local:
        return StorageGetLocal(key, defaultValue);
    case StorageMode.Remote:
        return await StorageGetRemote(StorageRemoteURL(), key, defaultValue);
    }
}

/**
 * @return {Promise<Ty>}
 */
export async function StorageGetData<Ty>(
    key: string,
    defaultValue: Ty = null,
    mode?: StorageMode): Promise<Ty>
{
    return (await StorageGet(key, defaultValue, mode)).data;
}

/**
 * @return {Promise<void>}
 */
export async function StorageSet<Ty>(
    key: string,
    data: Ty,
    mode?: StorageMode): Promise<void>
{
    switch (mode || StorageConfig.defaultMode) {
    case StorageMode.Local:
        return StorageSetLocal(key, data);
    case StorageMode.Remote:
        return await StorageSetRemote(StorageRemoteURL(), key, data);
    }
}

/**
 * @return {@string}
 */
export function StorageRemoteURL(): string
{
    return `${ StorageConfig.remote.protocol }://${ StorageConfig.remote.host }:${ StorageConfig.remote.port }`;
}

/**
 * Returns true if the seralized data stored with the given key does not exist,
 * or is an empty array/object.
 *
 * @param {string} key
 *
 * @return {boolean}
 */
export function StorageIsEmpty(
    key: string): boolean
{
    const serialized = localStorage.getItem(key);

    return !serialized || serialized === '[]' || serialized === '{}';
}
