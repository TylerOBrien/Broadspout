/**
 * System
*/

import { UserIdentity } from '@system/User';

/**
 * Types/Interfaces
*/

export interface HistoryItem
{
    user: UserIdentity;
    when: Date;
}

export type HistoryRecord = Record<string, Array<HistoryItem>>;
export type History       = Record<string, HistoryRecord>;
