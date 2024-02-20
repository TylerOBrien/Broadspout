/**
 * Global Imports
*/

import * as Pixi from 'pixi.js';

/**
 * Root Imports
*/

import { Image } from '@system/Image';

/**
 * Sibling Imports
*/

import { BouncingImageDriverRenderDOM, BouncingImageDriverRenderPixi } from './drivers';
import { BouncingImageContainer, BouncingImageItem, BouncingImageRenderer } from './types';

/**
 * Locals
*/

let _uid: number;
let _enabled: boolean;
let _containers: Record<string, BouncingImageContainer>;
let _renderer = BouncingImageRenderer.DOM;

let _scalevel: number = 2;
let _factor: number = 100;
let _minscale: number = 2;
let _maxscale: number = 32;

let _xmin: number = parseInt(process.env.LIVESPLIT_X);
let _xmax: number = parseInt(process.env.LIVESPLIT_X) + parseInt(process.env.LIVESPLIT_WIDTH);
let _ymin: number = parseInt(process.env.LIVESPLIT_Y);
let _ymax: number = parseInt(process.env.LIVESPLIT_Y) + parseInt(process.env.LIVESPLIT_HEIGHT);

/**
 * Private Functions
*/

/**
 * Renders a bouncing animation for the given image.
 *
 * @param {BouncingImageItem<ImageTy>} item The image to animate.
 *
 * @return {void}
 */
function _render<ImageTy>(
    item: BouncingImageItem<ImageTy>): void
{
    switch (_renderer) {
    case BouncingImageRenderer.DOM:
        return BouncingImageDriverRenderDOM(item as unknown as BouncingImageItem<Image>);
    case BouncingImageRenderer.Pixi:
        return BouncingImageDriverRenderPixi(item as unknown as BouncingImageItem<Pixi.Sprite>);
    }
}

/**
 * @return {void}
 */
function _update(
    delta: number = 1): void
{
    for (const key in _containers) {
        for (const item of _containers[key].items) {
            if (item.scaling) {
                if ((item.scale.x - ((item.velocity.scale.x/_factor) * delta)) <= _minscale) {
                    item.scale.x = _minscale;
                    item.scale.y = _minscale;
                    item.scaling = false;
                } else {
                    item.scale.x -= (item.velocity.scale.x/_factor) * delta;
                    item.scale.y -= (item.velocity.scale.y/_factor) * delta;
                    item.velocity.scale.x += 0.25;
                    item.velocity.scale.y += 0.25;
                }
            }

            let newx = item.bounds.x + (item.velocity.translate.x * delta);
            let newy = item.bounds.y + (item.velocity.translate.y * delta);

            if (item.velocity.translate.x > 0) {
                if (newx + (item.bounds.hw * _minscale) >= _xmax) {
                    newx = _xmax - (item.bounds.hw * _minscale);
                    item.velocity.translate.x = -item.velocity.translate.x;
                }
            } else {
                if (newx - (item.bounds.hw * _minscale) <= _xmin) {
                    newx = _xmin + (item.bounds.hw * _minscale);
                    item.velocity.translate.x = -item.velocity.translate.x;
                }
            }

            if (item.velocity.translate.y > 0) {
                if (newy + (item.bounds.hh * _minscale) >= _ymax) {
                    newy = _ymax - (item.bounds.hh * _minscale);
                    item.velocity.translate.y = -item.velocity.translate.y;
                }
            } else {
                if (newy - (item.bounds.hh * _minscale) <= _ymin) {
                    newy = _ymin + (item.bounds.hh * _minscale);
                    item.velocity.translate.y = -item.velocity.translate.y;
                }
            }

            item.bounds.x = newx;
            item.bounds.y = newy;

            _render(item);
        }
    }

    if (_enabled) {
        requestAnimationFrame(_update);
    }
}

/**
 * Public Functions
*/

/**
 * Adds the given image to the specified container to begin its animation.
 *
 * @param {string} container The name of the container to add this image to.
 * @param {Image} image The image to add.
 *
 * @return {number} The uid for the newly added image.
 */
export function BouncingImageAdd(
    container: string,
    image: Image): number
{
    _containers[container].items.push({
        image,
        id: _uid,
        scaling: false,
        scale: null,
        bounds: null,
        velocity: {
            scale: null,
            translate: null,
        },
    });

    return _uid++;
}

/**
 * @return {void}
 */
export function BouncingImageRemove(
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
 * @return {void}
 */
export function BouncingImageRemoveAll(
    container?: string): void
{
    //
}

/**
 * Creates a new container for bouncing images identified by the given name.
 *
 * @param {string} name The name of the container.
 * @param {number} x The x position of the container.
 * @param {number} y The y position of the container.
 * @param {number} width The width of the container.
 * @param {number} height The height of the container.
 *
 * @return {void}
 */
 export function BouncingImageRegisterContainer(
    name: string,
    x: number,
    y: number,
    width: number,
    height: number): void
{
    _containers[name] = {
        name,
        x,
        y,
        width,
        height,
        items: [],
    };
}

/**
 * @param {BouncingImageRenderer} renderer The renderer to use.
 *
 * @return {void}
 */
 export function BouncingImageSetRenderer(
     renderer: BouncingImageRenderer): void
{
    if (_renderer !== renderer) {
        _renderer = renderer;
    }
}

/**
 * @return {void}
 */
export async function BouncingImageInit(): Promise<void>
{
    _uid = 0;
    _enabled = true;
    _containers = {};
    _renderer = BouncingImageRenderer.DOM;
}
