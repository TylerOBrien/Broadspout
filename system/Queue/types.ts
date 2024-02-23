export enum QueueMode
{
    Enqueue,
    UpNext,
    Bypass,
    Reject,
}

export enum QueueState
{
    Idle = 0b01,
    Active = 0b10,
}

export enum QueueType
{
    Sound = 0b01,
    Video = 0b10,
    SoundVideo = 0b11,
}

export type QueueHandler = (id: string) => void | Promise<void>;

export interface QueueOptions
{
    type: QueueType;
    mode?: QueueMode;
    handler: QueueHandler;
}

export interface QueueItem
{
    id: string;
    type: QueueType;
    state: QueueState;
    handler: (id: string) => void | Promise<void>;
}
