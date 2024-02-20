import { User } from '@system/User';

export type ShoutoutHandler = (shouter: User, name: string) => void;
