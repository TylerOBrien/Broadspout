import { AABB, Extent, Point } from '@system/Geometry';
import { Image } from '@system/Image';

export enum BouncingImageRenderer
{
    DOM = 'dom',
    Pixi = 'pixi',
}

export enum TweenAnimationType
{
    DVDLogoBounce = 'dvd-logo-bounce',
}

export interface TweenAnimationProperties
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

export interface BouncingImageItem<ImageTy>
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

export interface BouncingImageContainer<ImageTy = Image>
{
    name: string
    x: number;
    y: number;
    width: number;
    height: number;
    items: Array<BouncingImageItem<ImageTy>>;
}
