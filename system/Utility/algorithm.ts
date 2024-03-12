/**
 * Exports
*/

/**
 * Returns a clone of the given array containing only the truthy values.
 *
 * If an element in items is itself an array then it will be recursively
 * evaluated such that this function guarantees to return a 1-dimensional array
 * regardless of the depth of the array passed.
 *
 * @param {Array<In>} items
 *
 * @return {Array<Out>}
 */
function truthy<In=unknown, Out=In>(
    items: Array<In>): Array<Out>
{
    let end = items.length;
    let result: Array<Out> = [];

    for (let i = 0; i < end; i++) {
        if (Array.isArray(items[i])) {
            const children: Array<Out> = truthy(items[i] as unknown as Array<In>);
            if (children.length) {
                result = result.concat(children);
            }
        } else if (items[i]) {
            result.push(items[i] as unknown as Out);
        }
    }

    return result;
}

/**
* Returns the named value from source. The given key may contain periods to
* denote child objects/values. For example:
*
* const source = {
*     foo: 42,
*     bar: {
*         message: 'hello',
*         baz: {
*             data: 'testing 123'
*         }
*     }
* };
*
* within(source, 'foo'); // 42
* within(source, 'bar.message'); // 'hello'
* within(source, 'bar.baz.data'); // 'testing 123'
*
* @param {InTy} source
* @param {string} key
*
* @return {OutTy}
*/
function within<In extends Record<string, unknown>, Out = unknown>(
    source: In,
    key: string): Out
{
    const parts = key.split('.');
    const end = parts.length;

    let index = 0;
    let node = source;

    while (node && index < end) {
        node = node[parts[index++]] as In;
    }

    return node as Out;
}

/**
* @param {T} condensed
*
* @return {T}
*/
function expand(
    condensed: Record<string, unknown>): Record<string, unknown>
{
    const expanded: Record<string, unknown> = {};

    for (const key in condensed) {
        const parts = key.split('.');
        const end = parts.length;
        const value = (typeof condensed[key] === 'object') ? Object.assign({}, condensed[key]) : condensed[key];

        if (end === 1) {
            expanded[key] = value;
        } else {
            let node: any = expanded;

            for (let i = 0; i < (end-1); i++) {
                if (!node[parts[i]]) {
                    node[parts[i]] = {};
                }

                node = node[parts[i]];
            }

            node[parts[end-1]] = value;
        }
    }

    return expanded;
}

/**
* @param {InTy} source
* @param {Array<string>} parent
* @param {OutTy} existing
*
* @return {OutTy}
*/
function flatten<InTy extends Record<string, unknown>, OutTy extends Record<string, unknown>>(
    source: InTy,
    parent?: Array<string>,
    existing?: OutTy): OutTy
{
    if (!source) {
        return null;
    }

    const tree = (parent || []) as Array<string>;
    const result = (existing || {}) as unknown as OutTy;

    for (const key in source) {
        if (typeof source[key] === 'object') {
            flatten(source[key] as Record<string, unknown>, tree.concat(key), result);
        } else {
            (result as Record<string, unknown>)[tree.join('.') + (tree.length ? '.' : '') + key] = source[key];
        }
    }

    return result;
}

/**
* Clones the passed object and removes the specified keys.
*
* @param {InTy} source
* @param {object|Array<string>} except
*
* @return {OutTy}
*/
function except<InTy extends Record<string, unknown>, OutTy extends Record<string, unknown>>(
    source: InTy,
    except: Record<string, unknown> | Array<string>): OutTy
{
    const clone = Object.assign({}, source as OutTy);

    if (Array.isArray(except)) {
        let i = except.length;
        while (i--) {
            delete clone[except[i]];
        }
    } else {
        for (const key in except) {
            if (except[key]) {
                delete clone[key];
            }
        }
    }

    return clone;
}

/**
* Utility
*/

export const Algorithm = {
    truthy,
    within,
    expand,
    flatten,
    except,
};
