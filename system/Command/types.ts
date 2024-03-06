/**
 * Global Imports
*/

import { ChatUserstate } from 'tmi.js';

/**
 * Global Imports
*/

import { User } from '@system/User';

/**
 * Types/Interfaces
*/

export enum CommandEventType
{
    NotFound,
    Execute,
}

export interface ChatCommand
{
    name: string;
    user: User;
    contents: string;
    isBot: boolean;
    when: Date;
}

export type CommandEventHandlerCallback = (command: ChatCommand) => void | Promise<void>;
export type CommandEventHandlerFilter = string | Array<string> | ((command: ChatCommand) => boolean);

export type CommandHandler = (
    channel: string,
    user: User | ChatUserstate,
    contents?: string,
) => void;

export type CommandExecuteHandler = (command: ChatCommand) => void | Promise<void>;

export interface ChatCommandEvent
{
    handler: CommandExecuteHandler;
    include?: CommandEventHandlerFilter;
    exclude?: CommandEventHandlerFilter;
}
