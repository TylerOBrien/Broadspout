/**
 * Types/Interfaces
*/

export enum ProfileProvider
{
    Twitch = 'Twitch',
    SRC = 'SRC',
}

export interface ProfileColorGradient
{
    from: string;
    to: string;
}

export interface Profile
{
    id: string;
    provider: ProfileProvider;
    name: string;
    login: string;
    avatar_url: string;
    color: {
        light: ProfileColorGradient;
        dark: ProfileColorGradient;
    };
}
