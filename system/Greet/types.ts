import { User } from '@system/User';

export enum GreetState
{
    Idle = 0x00,
    Busy = 0x10,
}

export type GreetHandler = (user: User) => Promise<void>;
