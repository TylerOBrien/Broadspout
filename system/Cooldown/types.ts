export enum CooldownType
{
    Any       = 0b11111,
    Media     = 0b00111,
    NonMedia  = 0b11000,
    Sound     = 0b00011,
    SoundFile = 0b00001,
    SoundTTS  = 0b00010,
    Video     = 0b00100,
    Command   = 0b01000,
    Other     = 0b10000,
}

export type CooldownTypeScalar = CooldownType.SoundFile | CooldownType.SoundTTS | CooldownType.Video | CooldownType.Command | CooldownType.Other;

export interface Cooldown
{
    type: CooldownType;
    until: Date;
}
