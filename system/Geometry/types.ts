export interface Point
{
    x: number;
    y: number;
};

export interface PointUnits
{
    x: 'px' | 'vw' | '%';
    y: 'px' | 'vh' | '%';
};

export interface Extent
{
    w: number;
    h: number;
};

export interface ExtentUnits
{
    w: 'px' | 'vw' | '%';
    h: 'px' | 'vh' | '%';
};

export interface AABB extends Point, Extent
{
    hw: number;
    hh: number;
};

export interface AABBUnits extends PointUnits, ExtentUnits
{};
