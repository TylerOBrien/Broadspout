/**
 * Root Imports
*/

import * as Pixi from 'pixi.js';

/**
 * System Imports
*/

import { AABB, Point } from '@system/Geometry';
import { Image } from '@system/Image';

/**
 * Types/Interfaces
*/

export enum AnimationRenderer
{
    DOM = 'dom',
    Pixi = 'pixi',
}

export enum AnimationType
{
    DVDLogoBounce = 'dvd-logo-bounce',
}

export interface AnimationProperties
{
    bounds: AABB;
    scale: Point;
    opacity: number;
    velocity: {
        scale: Point;
        translate: Point;
        opacity: number;
    };
}

export interface AnimationItem<ImageTy>
{
    id: number;
    image: ImageTy;
    scaling: boolean;
    bounds: AABB;
    scale: Point;
    velocity: {
        scale: Point;
        translate: Point;
    };
}

export interface AnimationContainer
{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    renderer: AnimationRenderer;
    items: Array<AnimationItem<Image | Pixi.Sprite>>;
}
