/**
 * Types/Interfaces
*/

export enum ProfileProvider
{
    Twitch,
    SRC,
}

export interface ProfileHttpOptions
{
    headers: {
        'Authorization'?: string;
        'Client-Id'?: string;
        'Content-Type': string;
    };
}

export interface ProfileColorGradient
{
    from: string;
    to: string;
}

export interface Profile
{
    id: string;
    name: string;
    login: string;
    avatar_url: string;
    color: {
        light: ProfileColorGradient;
        dark: ProfileColorGradient;
    };
}
