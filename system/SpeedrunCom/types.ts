export enum SpeedrunComQueryType
{
    Id = 'id',
    Name = 'name',
}

export interface SpeedrunComApiGameAssets
{
    logo: { uri: string; };
    'cover-tiny': { uri: string; };
    'cover-small': { uri: string; };
    'cover-medium': { uri: string; };
    'cover-large': { uri: string; };
    'cover-icon': { uri: string; };
    'trophy-1st': { uri: string; };
    'trophy-2nd': { uri: string; };
    'trophy-3rd': { uri: string; };
    'trophy-4th': { uri: string; };
    background: { uri: string; };
    foreground: { uri: string; };
}

export interface SpeedrunComApiGameRuleset
{
    'show-milliseconds': boolean;
    'require-verification': boolean;
    'require-video': boolean;
    'default-time': 'realtime' | 'gametime';
    'run-times': Array<'realtime' | 'gametime'>;
    'emulators-allowed': boolean;
}

export interface SpeedrunComApiGameNames
{
    international: string;
    japanese?: string;
    twitch: string;
}

export interface SpeedrunComApiGame
{
    id: string;
    weblink: string;
    abbreviation: string;
    names: SpeedrunComApiGameNames;
    released: number;
    'release-date': string;
    ruleset: SpeedrunComApiGameRuleset;
    romhack: boolean;
    platforms: Array<string>;
    regions: Array<string>;
    moderators: Record<string, 'super-moderator' | 'moderator'>;
    created: string;
    assets: SpeedrunComApiGameAssets;
}

export interface SpeedrunComApiCategory
{
    id: string;
    name: string;
    weblink: string;
    rules: string;
}

export interface SpeedrunComApiVariableValue
{
    label: string;
}

export interface SpeedrunComApiVariable
{
    id: string;
    name: string;
    values: Record<string, SpeedrunComApiVariableValue>;
}

export interface SpeedrunComApiRunVideoLink
{
    uri: string;
}

export interface SpeedrunComApiRunVideos
{
    links: Array<SpeedrunComApiRunVideoLink>;
}

export interface SpeedrunComApiRunPlayer
{
    id: string;
    rel: string;
    uri: string;
}

export interface SpeedrunComApiRunStatus
{
    status: string;
    examiner: string;
    'verify-date': string;
}

export interface SpeedrunComApiRunTimes
{
    primary: string;
    primary_t: number;
    realtime?: string;
    realtime_t?: number;
    realtime_noloads?: string;
    realtime_noloads_t?: number;
    ingame?: string;
    ingame_t?: number;
}

export interface SpeedrunComApiRunSystem
{
    platform: string;
    region?: string;
    emulated: boolean;
}

export interface SpeedrunComApiRun
{
    id: string;
    weblink: string;
    game: string;
    level?: string;
    category: string;
    players: Array<SpeedrunComApiRunPlayer>;
    videos: SpeedrunComApiRunVideos;
    comment?: string;
    submitted: string;
    times: SpeedrunComApiRunTimes;
    system: SpeedrunComApiRunSystem;
}

export interface SpeedrunComIdentity
{
    id: string;
}

export interface SpeedrunComResource
{
    uri: string;
    rel?: string;
}

export interface SpeedrunComGame
{
    id: string;
    name: string;
    assets: {
        cover: SpeedrunComResource;
        trophy1st: SpeedrunComResource;
        trophy2nd: SpeedrunComResource;
        trophy3rd: SpeedrunComResource;
    };
    ruleset: {
        showMilliseconds: boolean;
        emulatorsAllowed: boolean;
        defaultTime: 'realtime' | 'in-game';
    };
}

export interface SpeedrunComCategory
{
    id: string;
    name: string;
}

export interface SpeedrunComPlatform
{
    id: string;
    name: string;
}

export interface SpeedrunComRun
{
    id: string;
}

export interface SpeedrunComUser
{
    id: string;
    name: string;
    color: {
        from: string;
        to: string;
    };
}

export interface SpeedrunComValue
{
    id: string;
    name: string;
}

export interface SpeedrunComVariable
{
    id: string;
    name: string;
    values: Array<SpeedrunComValue>;
}
