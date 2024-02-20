export enum ConfigType
{
    Debug = 'debug',
    Channel = 'channel',
}

export type ConfigKey =
      'debug'
    | 'channel'
    | 'username'
    | 'oauth'
    | 'twitchid'
    | 'client'
    | 'bearer'
    | 'controlpanel-host'
    | 'controlpanel-port'
    | 'eventsubhost'
    | 'eventsubsecret'
    | 'eventsubprotocol'
    | 'eventsub-success-message'
    | 'sound-uri'
    | 'video-uri';
