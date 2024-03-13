/**
 * Config
*/

import { SoundConfig } from '@config/Sound';

/**
 * System Imports
*/

import { ChronoDateDelta, ChronoDurationConvert, ChronoMilliseconds, ChronoSeconds, Duration, DurationTuple, DurationType } from '@system/Chrono';
import { CooldownIsActive, CooldownType, CooldownGetResponse } from '@system/Cooldown';
import { HistoryFind } from '@system/History/api';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { TmiSend } from '@system/Tmi';
import { User, UserFilter, UserFilterIsMatch } from '@system/User';
import { SoundPlaybackError, SoundPlaybackResult } from '.';

/**
 * Relative Imports
*/

import { SoundFetchSounds } from './drivers';
import { Sound, SoundBuffer, SoundTTSOptions, SoundControl, SoundListeners, SoundPlayback, SoundPlaybackOption } from './types';

/**
 * Locals
*/

let _nextPlaybackId = 0;
let _sounds: Record<string, Sound> = {};
let _playing: Array<SoundPlayback> = [];

/**
 * Private Functions
*/

/**
 * @param {string} uri
 *
 * @return {SoundBuffer}
 */
async function _createSoundBuffer(
    uri: string): Promise<SoundBuffer>
{
    const response = await fetch(uri);
    const context = new AudioContext;
    const source = context.createBufferSource();

    source.buffer = await context.decodeAudioData(await response.arrayBuffer());
    source.connect(context.destination);

    return {
        context,
        source,
    };
}

/**
 * @return {void}
 */
function _play(
    id: number,
    uri: string,
    name?: string,
    user?: User,
    options?: SoundControl & SoundListeners,
    queueid?: string): Promise<void>
{
    return new Promise((resolve): void => {
        function onLoadedData(): void
        {
            if (options?.onPlaybackStart) {
                options.onPlaybackStart(playback);
            }

            element.play();
        }

        function onDurationElapsed(): void
        {
            _playing.splice(_playing.indexOf(playback), 1);

            if (queueid) {
                QueuePop(queueid);
            }

            if (options?.onPlaybackEnd) {
                options.onPlaybackEnd(playback);
            }

            resolve();
        }

        function onTimeUpdate(): void
        {
            if (element.currentTime === element.duration) {
                onDurationElapsed();
            }
        }

        const element = document.createElement('audio');
        const playback: SoundPlayback = {
            id,
            name,
            user,
            element,
            control: SoundCreateControl(options?.speed, options?.volume),
        };

        _playing.push(playback);

        element.addEventListener('loadeddata', onLoadedData);
        element.addEventListener('timeupdate', onTimeUpdate);

        element.playbackRate = options?.speed ?? 1;
        element.volume = options?.volume ?? 1;
        element.src = uri;
    });
}

/**
 * @param {string} name
 * @param {User} user
 *
 * @return {boolean}
 */
function _isCooldownActive(
    name: string,
    user: User): boolean
{
    if (SoundConfig.cooldownEnabled && user && CooldownIsActive(user, CooldownType.SoundFile)) {
        if (SoundConfig.cooldownResponseEnabled) {
            TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another sound.'));
        }

        return true;
    }

    return false;
}

/**
 * @param {string} name The name of the sound.
 * @param {User} user The user who triggered the sound.
 *
 * @return {SoundPlaybackResult}
 */
function _validate(
    name: string,
    user: User): SoundPlaybackResult
{
    const result: SoundPlaybackResult = {
        error: SoundPlaybackError.NoError,
    };

    if (!(name in _sounds)) {
        result.error = SoundPlaybackError.NotFound;
    } else if (_isCooldownActive(name, user)) {
        result.error = SoundPlaybackError.Cooldown;
    }

    return result;
}

/**
 * Public Functions
*/

/**
 * @return {SoundControl}
 */
export function SoundCreateControl(
    speed: number,
    volume: number): SoundControl
{
    return {
        speed: speed ?? 1,
        volume: volume ?? 1,
    };
}

/**
 * @param {string} name
 * @param {string} uri
 * @param {number} volume
 *
 * @return {void}
 */
export function SoundRegister(
    name: string,
    uri: string,
    volume: number = 1.0): void
{
    name = (name || '').toLowerCase();

    if (!name || name in _sounds) {
        return; // TODO: handle this error
    }

    _sounds[name] = {
        uri,
        volume,
    };
}

/**
 * @param {string} name The name of the sound.
 * @param {User} user The user who triggered the sound.
 * @param {QueueMode} mode The queue mode to use.
 * @param {SoundControl & SoundListeners} options The sound options.
 *
 * @return {Promise<SoundPlaybackResult>} The result of the playback.
 */
export function SoundPlay(
    name: string,
    user?: User,
    mode: QueueMode = QueueMode.Enqueue,
    options?: SoundControl & SoundListeners): Promise<SoundPlaybackResult>
{
    return new Promise((resolve): void => {
        name = (name || '').toLowerCase();

        const result = _validate(name, user);

        if (result.error !== SoundPlaybackError.NoError) {
            if (options?.onReject) {
                options?.onReject(result);
            }

            return resolve(result);
        }

        async function onStart(queueid?: string): Promise<void>
        {
            await _play(_nextPlaybackId++, _sounds[name].uri, name, user, options);

            if (queueid) {
                QueuePop(queueid);
            }

            if (options?.onSuccess) {
                options?.onSuccess(result);
            }

            resolve(result);
        }

        switch (mode) {
        case QueueMode.Bypass:
            onStart();
            break;
        default:
            QueuePush({
                mode,
                type: QueueType.Sound,
                handler: onStart,
            });
            break;
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
        if (SoundConfig.cooldownEnabled && user && CooldownIsActive(user, CooldownType.SoundFile)) {
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
export function SoundPause(
    id: number): void
{
    for (const sound of _playing) {
        if (sound.id === id) {
            sound.element.pause();
            break;
        }
    }
}

/**
 * @return {void}
 */
export function SoundCancelAll(
    filter?: UserFilter): void
{
    for (const sound of _playing) {
        sound.element.currentTime = sound.element.duration;
    }
}

/**
 * @return {void}
 */
export function SoundPauseAll(
    filter?: UserFilter): void
{
    for (const sound of _playing) {
        sound.element.pause();
    }
}

/**
 * @return {void}
 */
export function SoundResumeAll(
    filter?: UserFilter): void
{
    for (const sound of _playing) {
        sound.element.play();
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
 * Returns true if the given name is a valid name for an existing sound.
 *
 * @param {string} name The name of the sound.
 * @param {UserFilter} filter
 *
 * @return {boolean}
 */
export function SoundIsPlaying(
    name: string,
    filter?: UserFilter): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _sounds)) {
        return false;
    }

    for (const playback of _playing) {
        if (playback.name === name) {
            return true;
        }
    }

    return false;
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
export function SoundWasPlayedWithin(
    name: string,
    threshold: Duration | DurationTuple,
    filter?: UserFilter): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _sounds)) {
        return false;
    }

    const history = HistoryFind(SoundConfig.history.category, name, filter);

    if (!history) {
        return false;
    }

    const millisecondsSincePlay = ChronoDateDelta(new Date, history.when, DurationType.Milliseconds);
    const millisecondsLimit = ChronoDurationConvert(threshold, DurationType.Milliseconds);

    return millisecondsSincePlay.value < millisecondsLimit.value;
}

/**
 * @return {Promise<void>}
 */
export async function SoundReload(): Promise<void>
{
    _sounds = { ..._sounds, ...await SoundFetchSounds() };
}

/**
 * @return {Array<string>}
 */
export function SoundGetAllNames(): Array<string>
{
    return Object.keys(_sounds);
}

/**
 * @return {Promise<void>}
 */
export async function SoundInit(): Promise<void>
{
    await SoundReload();
}
