/**
 * Relative Imports
*/

import {
    AnimationContainer,
    AnimationProperties,
    AnimationRenderer,
    AnimationType,
} from './types';

/**
 * Locals
*/

let _uid: number;
let _enabled: boolean;
let _containers: Record<string, AnimationContainer>;

/**
 * Public Functions
*/

/**
 * @param {string} container The name of the container.
 * @param {ImageTy} image
 * @param {AnimationType} type
 * @param {AnimationProperties} properties
 *
 * @return {void}
 */
export function AnimationAdd<ImageTy>(
    container: string,
    image: ImageTy,
    type: AnimationType,
    properties: AnimationProperties): void
{
    //
}

/**
 * @return {void}
 */
export function AnimationRemove(
    uid: number): void
{
    for (const name in _containers) {
        let index = _containers[name].items.length;

        while (index--) {
            if (_containers[name].items[index].id === uid) {
                _containers[name].items.splice(index, 1);
                return;
            }
        }
    }
}

/**
 * Creates a new container for bouncing images identified by the given name.
 *
 * @param {string} name The name of the container.
 * @param {number} x The x position of the container.
 * @param {number} y The y position of the container.
 * @param {number} width The width of the container.
 * @param {number} height The height of the container.
 * @param {AnimationRenderer} renderer
 *
 * @return {void}
 */
export function AnimationRegisterContainer(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number,
    renderer: AnimationRenderer = AnimationRenderer.DOM): void
{
    _containers[name] = {
        name,
        x,
        y,
        width,
        height,
        renderer,
        items: [],
    };
}

/**
 * Prepares the Animation API for usage. Should only be called once.
 *
 * @return {void}
 */
export async function AnimationInit(): Promise<void>
{
    _uid = 0;
    _enabled = true;
    _containers = {};
}
