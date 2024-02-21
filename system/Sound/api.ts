/**
 * System Imports
*/

import { CooldownIsActive, CooldownGetSecondsRemaining, CooldownType, CooldownGetResponse, CooldownTypeScalar } from '@system/Cooldown';
import { TmiSend } from '@system/Tmi';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { User } from '@system/User';
import { Duration } from '@system/Chrono';
import { DateDiffSeconds } from '@system/Utility';
import { ChronoDurationSeconds } from '@system/Chrono/api';

/**
 * Relative Imports
*/

import { Sound, SoundState } from './types';
import { SoundConfig } from '@config/Sound';
import { ControlPanelConfig } from '@config/ControlPanel';
import { SoundTTSOptions } from '.';

/**
 * Locals
*/

let _sounds: Record<string, Sound> = {};

/**
 * Private Functions
*/

/**
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
    onPlaybackFinish: () => void,
    attempts: number = 0,
    delay: number = 1000): void
{
    const fn = (): void => {
        _audio = document.createElement('audio');
        _audio.volume = volume;

        _audio.addEventListener('play', _handlePlaybackStart);
        _audio.addEventListener('loadeddata', _audio.play);

        _audio.addEventListener('ended', (): void => {
            _handlePlaybackEnd();
            onPlaybackFinish();
        });

        _audio.addEventListener('error', (): void => {
            if (++attempts < SoundConfig.maxFetchAttempts) {
                _play(uri, volume, onPlaybackFinish, attempts, delay);
            } else {
                _handlePlaybackEnd();
            }
        });
    };

    if (attempts && delay) {
        setTimeout(fn, delay);
    } else {
        fn();
    }
}

/**
 * @param {string} contents
 * @param {() => void} resolve
 * @param {string} lang
 *
 * @return {void}
 */
async function _fetchAndPlayTTS(
    contents: string,
    resolve: () => void,
    lang: string = 'en'): Promise<void>
{
    const options = {
        method: 'POST',
        body: 'contents=' + contents,
    };

    const response = await fetch(`http://${ ControlPanelConfig.host }/tts?${ lang }=1`, options);
    const body = await response.text();

    _play(`/tts/${ body }.ogg`, 1.0, resolve);
}

/**
 * @return {void}
 */
function _handlePlaybackStart(): void
{
    _state = SoundState.Playing;
}

/**
 * @return {void}
 */
function _handlePlaybackEnd(): void
{
    if (!QueuePop(_queueid, SoundConfig.defaultDelayBetweenSounds)) {
        _state = SoundState.Idle;
    }
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
 * @param {string} name The name of the sound.
 *
 * @return {boolean}
 */
export function SoundPlayFile(
    user: User,
    name: string,
    mode: QueueMode = QueueMode.Enqueue,
    onPlayStart?: () => void | Promise<void>,
    onPlayFinish?: () => void | Promise<void>): Promise<void>
{
    return new Promise((resolve) => {
        if (CooldownIsActive(user, CooldownType.SoundFile)) {
            TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another sound.'));
            return resolve();
        }

        QueuePush({
            mode,
            type: QueueType.Sound,
            handler: (queueid) => {
                _queueid = queueid;
                _onPlayStart = onPlayStart;
                _onPlayFinish = onPlayFinish;
                _play(_sounds[name].uri, _sounds[name].volume, resolve);
            },
        });
    });
}

/**
 * @param {User} user
 * @param {string} contents The contents to read aloud using TTS.
 * @param {SoundTTSOptions} options
 * @param {} onPlay
 *
 * @return {boolean}
 */
export function SoundPlayTTS(
    user: User,
    contents: string,
    options?: SoundTTSOptions,
    mode: QueueMode = QueueMode.Enqueue,
    onPlayStart?: () => void | Promise<void>,
    onPlayFinish?: () => void | Promise<void>): Promise<void>
{
    return new Promise((resolve) => {
        if (CooldownIsActive(user, CooldownType.SoundFile)) {
            TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another TTS.'));
            return resolve();
        }

        QueuePush({
            mode,
            type: QueueType.Sound,
            handler: (queueid) => {
                _queueid = queueid;
                _onPlayStart = onPlayStart;
                _onPlayFinish = onPlayFinish;
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
    _suspended = true;

    if (_playing) {
        //
    }
}

/**
 * @return {void}
 */
export function SoundResume(): void
{
    _suspended = false;

    if (_playing) {
        //
    }
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
 * @return {SoundState}
 */
export function SoundGetState(): SoundState
{
    return _state;
}

/**
 * @return {Promise<void>}
 */
export async function SoundInit(): Promise<void>
{
    const response = await fetch('/sounds.json');
    const data = await response.json();
}
