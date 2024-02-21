/**
 * Global Imports
*/

import * as Pixi from 'pixi.js';

/**
 * Root Imports
*/

import { Image } from '@system/Image';


/*
 * Relative Imports
*/

import { BouncingImageItem } from './types';

/**
 * Locals
*/

let _pixiReady = false;

/**
 * Public Functions
*/

/**
 * @return {void}
 */
export function BouncingImageDriverRenderDOM(
    item: BouncingImageItem<Image>): void
{
    item.image.element.style.transform = `translate(${item.bounds.x}px, ${item.bounds.y}px), scale(${item.scale.x}px, ${item.scale.y}px)`;
}

/**
 * @return {void}
 */
export function BouncingImageDriverRenderPixi(
    item: BouncingImageItem<Pixi.Sprite>): void
{
    if (!_pixiReady) {
        //
    }
}

