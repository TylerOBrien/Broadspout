export enum DurationType
{
    Milliseconds = 1,
    Seconds = 2,
}

export interface Duration
{
    type: DurationType;
    value: number;
}
