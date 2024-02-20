export interface Point
{
    x: number;
    y: number;
};

export interface Extent
{
    w: number;
    h: number;
};

export interface AABB extends Point, Extent
{
    hw: number;
    hh: number;
};
