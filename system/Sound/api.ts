/**
 * Config
*/

import { SoundConfig } from '@config/Sound';

/**
 * System Imports
*/

import { CooldownIsActive, CooldownType, CooldownGetResponse } from '@system/Cooldown';
import { TmiSend } from '@system/Tmi';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { User } from '@system/User';
import { Duration } from '@system/Chrono';
import { DateDiffSeconds } from '@system/Utility';
import { ChronoDurationSeconds } from '@system/Chrono/api';

/**
 * Relative Imports
*/

import { Sound, SoundTTSOptions } from './types';
import { SoundFetchSounds } from './drivers';

/**
 * Locals
*/

let _sounds: Record<string, Sound> = {};

/**
 * Private Functions
*/

/**
 * @param {string} queueid
 * @param {string} uri
 * @param {number} volume
 * @param {number} delay
 * @param {number} attempts
 *
 * @return {void}
 */
function _play(
    uri: string,
    volume: number,
    onPlaybackStart: () => void,
    onPlaybackEnd: () => void,
    queueid?: string,
    delay?: number): void
{
    const audio = document.createElement('audio');

    audio.addEventListener('loadeddata', audio.play);
    audio.addEventListener('play', onPlaybackStart);

    audio.addEventListener('ended', (): void => {
        if (queueid) {
            QueuePop(queueid, typeof delay === 'number' ? delay : SoundConfig.defaultDelayAfterPlayback);
        }

        setTimeout(onPlaybackEnd, typeof delay === 'number' ? delay : SoundConfig.defaultDelayAfterPlayback);
    });

    audio.volume = volume;
    audio.src = uri;
}

/**
 * Public Functions
*/

/**
 * @param {string} name
 * @param {string} uri
 * @param {number} cooldown
 * @param {number} volume
 *
 * @return {void}
 */
export function SoundRegister(
    name: string,
    uri: string,
    cooldown: number = 30,
    volume: number = 1.0): void
{
    name = (name || '').toLowerCase();

    if (!name || name in _sounds) {
        return; // TODO: handle this error
    }

    _sounds[name] = {
        uri,
        cooldown,
        volume,
        history: [],
    };
}

/**
 * @param {User} user The user who triggered the sound.
 * @param {string} name The name of the sound.
 * @param {QueueMode} mode The queue mode to use.
 *
 * @return {Promise<void>}
 */
export function SoundPlayFile(
    user: User,
    name: string,
    mode: QueueMode = QueueMode.Enqueue): Promise<void>
{
    return new Promise((resolve) => {
        if (user && CooldownIsActive(user, CooldownType.SoundFile)) {
            if (SoundConfig.cooldownResponseEnabled) {
                TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another sound.'));
            }
            return resolve();
        }

        if (mode === QueueMode.Bypass) {
            _play(_sounds[name].uri, _sounds[name].volume, null, resolve);
        } else {
            QueuePush({
                mode,
                type: QueueType.Sound,
                handler: (queueid) => {
                    _play(_sounds[name].uri, _sounds[name].volume, null, resolve, queueid);
                },
            });
        }
    });
}

/**
 * @param {User} user
 * @param {string} contents The contents to read aloud using TTS.
 * @param {SoundTTSOptions} options
 *
 * @return {Promise<void>}
 */
export function SoundPlayTTS(
    user: User,
    contents: string,
    options?: SoundTTSOptions,
    mode: QueueMode = QueueMode.Enqueue): Promise<void>
{
    return new Promise((resolve) => {
        if (user && CooldownIsActive(user, CooldownType.SoundFile)) {
            if (SoundConfig.cooldownResponseEnabled) {
                TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another TTS.'));
            }
            return resolve();
        }

        QueuePush({
            mode,
            type: QueueType.Sound,
            handler: (queueid) => {
                _fetchAndPlayTTS(contents, resolve);
            },
        });
    });
}

/**
 * @return {void}
 */
export function SoundSuspend(): void
{
    //
}

/**
 * @return {void}
 */
export function SoundResume(): void
{
    //
}

/**
 * Returns true if the given name is a valid name for an existing sound.
 *
 * @param {string} name The name of the sound.
 *
 * @return {boolean}
 */
export function SoundExists(
    name: string): boolean
{
    return (name || '').toLowerCase() in _sounds;
}

/**
 * Returns true if the specified sound both exists and has been played within
 * the specified duration of time. False otherwise.
 *
 * @param {string} name The name of the sound.
 * @param {Duration} threshold The length of time required to have passed for a sound to no longer be considered recently played.
 *
 * @return {boolean} Whether the sound is recently played.
 */
export function SoundIsRecentlyPlayed(
    name: string,
    threshold: Duration): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _sounds) || _sounds[name].history.length === 0) {
        return false;
    }

    const secondsPassed = DateDiffSeconds(new Date, _sounds[name].history.at(-1));
    const secondsRequired = ChronoDurationSeconds(threshold);

    return secondsPassed < secondsRequired;
}

/**
 * @return {Promise<void>}
 */
export async function SoundReload(): Promise<void>
{
    _sounds = { ..._sounds, ...await SoundFetchSounds() };
}

/**
 * @return {Promise<void>}
 */
export async function SoundInit(): Promise<void>
{
    await SoundReload();
}
