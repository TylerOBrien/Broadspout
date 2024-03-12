/**
 * Config
*/

import { SoundConfig } from '@config/Sound';

/**
 * System Imports
*/

import { ChronoDateDelta, ChronoMilliseconds, ChronoSeconds, Duration, DurationTuple, DurationType } from '@system/Chrono';
import { CooldownIsActive, CooldownType, CooldownGetResponse } from '@system/Cooldown';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { TmiSend } from '@system/Tmi';
import { User, UserFilter, UserFilterIsMatch } from '@system/User';

/**
 * Relative Imports
*/

import { SoundFetchSounds } from './drivers';
import { Sound, SoundTTSOptions, SoundControl, SoundListeners, SoundPlayback, SoundPlaybackOption } from './types';

/**
 * Locals
*/

let _nextUid = 0;
let _sounds: Record<string, Sound> = {};
let _playing: Array<SoundPlayback> = [];

/**
 * Private Functions
*/

/**
 * @return {void}
 */
function _play(
    id: number,
    uri: string,
    name?: string,
    user?: User,
    control?: SoundControl,
    listeners?: SoundListeners,
    queueid?: string): Promise<void>
{
    return new Promise((resolve): void => {
        function onLoadedData(): void
        {
            if (listeners?.onPlaybackStart) {
                listeners.onPlaybackStart(playback);
            }

            element.play();
        }

        function onDurationElapsed(): void
        {
            _playing.splice(_playing.indexOf(playback), 1);

            if (queueid) {
                QueuePop(queueid);
            }

            if (listeners?.onPlaybackEnd) {
                listeners.onPlaybackEnd(playback);
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
            control,
            user,
            element,
        };

        _playing.push(playback);

        element.addEventListener('loadeddata', onLoadedData);
        element.addEventListener('timeupdate', onTimeUpdate);

        element.playbackRate = control?.speed ?? 1;
        element.volume = control?.volume ?? 1;
        element.src = uri;
    });
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
        speed: typeof speed === 'number' ? speed : 1,
        volume: typeof volume === 'number' ? volume : 1,
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
        history: [],
    };
}

/**
 * @param {string} name The name of the sound.
 * @param {User} user The user who triggered the sound.
 * @param {SoundPlaybackOption} option
 * @param {QueueMode} mode The queue mode to use.
 *
 * @return {Promise<void>}
 */
export function SoundPlay(
    name: string,
    user?: User,
    control?: SoundControl,
    option: SoundPlaybackOption = SoundPlaybackOption.AllowMultiple,
    mode: QueueMode = QueueMode.Enqueue): Promise<void>
{
    return new Promise((resolve): void => {
        if (SoundConfig.cooldownEnabled && user && CooldownIsActive(user, CooldownType.SoundFile)) {
            if (SoundConfig.cooldownResponseEnabled) {
                TmiSend(CooldownGetResponse(user, CooldownType.SoundFile, 'to use another sound.'));
            }
            return resolve();
        }

        const id = _nextUid++;

        control = {
            speed: 1,
            volume: _sounds[name].volume,
            ...(control || {}),
        };

        if (mode === QueueMode.Bypass) {
            _play(id, _sounds[name].uri, user, control).then(resolve);
        } else {
            QueuePush({
                mode,
                type: QueueType.Sound,
                handler: (queueid) => {
                    _play(id, _sounds[name].uri, user, control, null, queueid).then(resolve);
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
export function SoundPlayedWithinLast(
    name: string,
    threshold: Duration | DurationTuple,
    filter?: UserFilter): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _sounds)) {
        return false;
    }

    let index = _sounds[name].history.length;

    if (index === 0) {
        return false;
    }

    if (filter) {
        let foundUserFilter = false;

        while (index--) {
            if (UserFilterIsMatch(filter, _sounds[name].history[index].user)) {
                foundUserFilter = true;
                break;
            }
        }

        if (!foundUserFilter) {
            return false;
        }
    } else {
        index--;
    }

    const millisecondsSinceLastPlay = ChronoDateDelta(new Date, _sounds[name].history[index].when, DurationType.Milliseconds);
    const millisecondsLimit = ChronoMilliseconds(threshold);

    return millisecondsSinceLastPlay < millisecondsLimit;
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
