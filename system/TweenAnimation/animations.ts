/**
 * System Imports
*/

import { AABB } from '@system/Geometry';

/**
 * Relative Imports
*/

import { BouncingImageItem } from './types';

/**
 * Public Functions
*/

/**
 * @param {BouncingImageItem<ImageTy>} item
 * @param {AABB} within
 * @param {number} delta
 *
 * @return {void}
 */
export function TweenAnimationBounce<ImageTy>(
    item: BouncingImageItem<ImageTy>,
    within: AABB,
    delta: number = 1): void
{
    item.bounds.x += item.velocity.translate.x * delta;
    item.bounds.y += item.velocity.translate.y * delta;

    if (item.velocity.translate.x > 0 && (item.bounds.x + item.bounds.hw) > within.w) {
        item.bounds.x = item.bounds.hw;
        item.velocity.translate.x = -item.velocity.translate.x;
    } else if (item.velocity.translate.x < 0 && item.bounds.x < 0) {
        item.bounds.x = 0;
        item.velocity.translate.x = -item.velocity.translate.x;
    }

    if (item.velocity.translate.y > 0 && (item.bounds.y + item.bounds.hh) > within.h) {
        item.bounds.y = item.bounds.hh;
        item.velocity.translate.y = -item.velocity.translate.y;
    } else if (item.velocity.translate.y < 0 && item.bounds.y < 0) {
        item.bounds.y = 0;
        item.velocity.translate.y = -item.velocity.translate.y;
    }
}
