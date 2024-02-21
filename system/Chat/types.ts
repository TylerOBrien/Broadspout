/**
 * Relative Imports
*/

import { User } from '@system/User';

/**
 * Types/Interfaces
*/

export type ChatEventHandlerCallback = (message: ChatMessage) => void | Promise<void>;
export type ChatEventHandlerFilter = string | Array<string> | ((message: ChatMessage) => boolean);

export interface ChatEventHandler
{
    uid: number;
    callback: ChatEventHandlerCallback;
    include?: ChatEventHandlerFilter;
    exclude?: ChatEventHandlerFilter;
}

export interface ChatParticipants
{
    broadcaster: Array<string>;
    vips: Array<string>;
    moderators: Array<string>;
    staff: Array<string>;
    admins: Array<string>;
    global_mods: Array<string>;
    viewers: Array<string>;
}


export interface ChatMessage
{
    user: User;
    channel: string;
    contents: string;
    when: Date;
    emotes: { [emoteid: string]: string[] };
    isBot: boolean;
    isFirst: boolean;
}
