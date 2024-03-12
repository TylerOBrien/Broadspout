
import { User } from '@system/User';

/**
 * Types/Interfaces
*/

export type EventCallback = (user: User, payload?: unknown) => void | Promise<void>;

export enum EventFilterPermission
{
    Allow = 'Allow',
    Disallow = 'Disallow',
}

export interface EventFilter
{
    predicate: string | Array<string> | ((user: User, payload?: unknown) => boolean);
    permission: EventFilterPermission;
}

export interface EventListener
{
    id: number;
    callback: EventCallback;
    filter?: EventFilter;
}

export type EventRegistration = Record<string, Array<EventListener>>;
