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
}

export interface ChatCommand
{
    name: string;
    user: User;
    contents: string;
    channel: string;
    isBot: boolean;
    when: Date;
}

export type CommandHandler = (
    channel: string,
    user: User | ChatUserstate,
    contents?: string,
) => void;

export type CommandEventHandler = (command: ChatCommand) => void | Promise<void>;
