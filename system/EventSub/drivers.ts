/**
 * Relative Imports
*/

import {
    EventSubMessage,
    EventSubCheer,
    EventSubFollow,
    EventSubRaid,
    EventSubSubscribe,
    EventSubRedeem,
} from './types';

/**
 * Types/Interfaces
*/

export interface EventSubPayload
{
    event: {
        user_id: string;
        user_login: string;
        user_name: string;

        // cheer
        bits?: number;
        is_anonymous?: boolean;

        // follow
        followed_at?: string;

        // raid
        viewers?: number;
        from_broadcaster_user_id?: string;
        from_broadcaster_user_login?: string;
        from_broadcaster_user_name?: string;

        // redemption
        redeemed_at?: string;
        status?: string;
        user_input?: string;
        reward?: {
            id: string;
            title: string;
            prompt: string;
        };

        // subscribe
        tier?: string;
        is_gift?: boolean;

        // resubscribe
        cumulative_months?: number;
        duration_months?: number;
        streak_months?: number;

        // cheer and resubscribe
        message?: string | EventSubMessage;
    };
    subscription: {
        id: string;
        status: string;
        cost: number;
        type: string;
        created_at: string;
        version: string;
    };
}

/**
 * Private Functions
*/

/**
 * @return {EventSubCheer}
 */
export function EventSubDriverCreateCheer(
    data: EventSubPayload): EventSubCheer
{
    return {
        bits: data.event.bits,
        is_anonymous: data.event.is_anonymous,
        user: {
            id: data.event.user_id,
            login: data.event.user_login,
            name: data.event.user_name,
        },
    };
}

/**
 * @return {EventSubFollow}
 */
export function EventSubDriverCreateFollow(
    data: EventSubPayload): EventSubFollow
{
    return {
        followed_at: data.event.followed_at,
        user: {
            id: data.event.user_id,
            login: data.event.user_login,
            name: data.event.user_name,
        },
    };
}

/**
 * @return {EventSubRaid}
 */
export function EventSubDriverCreateRaid(
    data: EventSubPayload): EventSubRaid
{
    return {
        viewers: data.event.viewers,
        user: {
            id: data.event.from_broadcaster_user_id,
            login: data.event.from_broadcaster_user_login,
            name: data.event.from_broadcaster_user_name,
        },
    };
}

/**
 * @return {EventSubSubscribe}
 */
export function EventSubDriverCreateSubscribe(
    data: EventSubPayload): EventSubSubscribe
{
    return {
        tier: data.event.tier,
        is_gift: data.event.is_gift,
        cumulative_months: data.event.cumulative_months,
        duration_months: data.event.duration_months,
        streak_months: data.event.streak_months,
        message: !data.event.message ? undefined : {
            text: (data.event.message as EventSubMessage).text,
            emotes: (data.event.message as EventSubMessage).emotes,
        },
        user: {
            id: data.event.user_id,
            login: data.event.user_login,
            name: data.event.user_name,
        },
    };
}

/**
 * @return {EventSubRedeem}
 */
export function EventSubDriverCreateRedeem(
    data: EventSubPayload): EventSubRedeem
{
    return {
        redeemed_at: data.event.redeemed_at,
        status: data.event.status,
        user_input: data.event.user_input,
        reward: {
            id: data.event.reward.id,
            title: data.event.reward.title,
            prompt: data.event.reward.prompt,
        },
        user: {
            id: data.event.user_id,
            login: data.event.user_login,
            name: data.event.user_name,
        },
    };
}
