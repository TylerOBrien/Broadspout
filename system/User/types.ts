/**
 * Local Imports
*/

import { Badge } from '@system/Badge';
import { Profile } from '@system/Profile';

/**
 * Types/Interfaces
*/

export enum UserStatus
{
    Follower    = 0b00001,
    Subscriber  = 0b00010,
    VIP         = 0b00100,
    Moderator   = 0b01000,
    Broadcaster = 0b10000,
}

export enum UserProvider
{
    Twitch  = 'Twitch',
    Discord = 'Discord',
    YouTube = 'YouTube',
}

export interface UserIdentity
{
    id: string;
}

export interface User
{
    id: string;
    provider: UserProvider;
    name: string;
    login: string;
    status: UserStatus;
    badges: Array<Badge>;
    color?: string;
    profile?: Profile;
}

export type UserFilterSubject = string | User | Array<string | User>;

export enum UserFilterCriteria
{
    All  = 'All',
    Any  = 'Any',
    None = 'None',
}

export interface UserFilter
{
    subject: UserFilterSubject;
    criteria: UserFilterCriteria;
}
