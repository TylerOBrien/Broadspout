export type EventSubProtocol = 'ws' | 'wss';

export enum EventSubType
{
    Cheer     = 'cheer',
    Follow    = 'follow',
    Raid      = 'raid',
    Redeem    = 'redeem',
    Subscribe = 'subscribe',
}

interface EventSubBase
{
    user: {
        id: string;
        login: string;
        name: string;
    };
}

export enum EventSubState
{
    Idle       = 0x0000,
    Connecting = 0x0001,
    Connected  = 0x0010,
    Error      = 0x0100,
}

export interface EventSubMessage
{
    text: string;
    emotes: Array<{ begin: number; end: number; id: string; }>;
}

export interface EventSubCheer extends EventSubBase
{
    bits: number;
    is_anonymous: boolean;
}

export interface EventSubFollow extends EventSubBase
{
    followed_at: string;
}

export interface EventSubRaid
{
    viewers: number;
    user: {
        id: string;
        login: string;
        name: string;
        color?: string;
    };
}

export interface EventSubRedeem extends EventSubBase
{
    redeemed_at: string;
    status: string;
    user_input: string;
    reward: {
        id: string;
        title: string;
        prompt: string;
    };
}

export interface EventSubSubscribe extends EventSubBase
{
    tier: string;
    is_gift: boolean;
    message?: EventSubMessage;
    cumulative_months?: number;
    duration_months?: number;
    streak_months?: number;
}

export type EventSubHandler = (event: EventSubCheer | EventSubFollow | EventSubRaid | EventSubRedeem | EventSubSubscribe) => void | Promise<void>;
