export enum DurationFormat
{
    Raw = 'Raw',
    Ceil = 'Ceil',
    Floor = 'Floor',
    Round = 'Round',
}

export enum DurationType
{
    Milliseconds = 'Milliseconds',
    Seconds = 'Seconds',
    Minutes = 'Minutes',
    Hours = 'Hours',
    Days = 'Days',
    Weeks = 'Weeks',
}

export interface Duration
{
    type: DurationType;
    value: number;
}

export type DurationTuple = [number, DurationType];

export interface DurationInfo
{
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
}

export enum DurationStringRestriction
{
    Show = 'Show',
    Hide = 'Hide',
}

export enum TimeStringFormat
{
    ShowMilliseconds = 1,
    ShowMillisecondsIfGiven = 2,
    HideMilliseconds = 3,
}
