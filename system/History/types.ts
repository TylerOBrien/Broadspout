/**
 * System
*/

import { UserIdentity } from '@system/User';

/**
 * Types/Interfaces
*/

export enum HistoryType
{
    Sound = 'Sound',
    Video = 'Video',
}

export interface HistoryItem
{
    user: UserIdentity;
    when: Date;
}

export type HistoryRecord = Record<string, Array<HistoryItem>>;
export type History       = { [Ty in HistoryType]?: HistoryRecord };
