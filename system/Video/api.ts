/**
 * System Imports
*/

import { CooldownIsActive, CooldownType, CooldownGetResponse } from '@system/Cooldown';
import { TmiSend } from '@system/Tmi';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { User } from '@system/User';
import { VideoConfig } from '@config/Video';
import { ChronoDateDiffSeconds, ChronoDurationSeconds, Duration } from '@system/Chrono';

/**
 * Relative Imports
*/

import { Video, VideoContainer, VideoEventHandler, VideoExtension, VideoPlayback, VideoPlaybackState } from './types';
import { AABB } from '@system/Geometry';

/**
 * Locals
*/

let _base: HTMLDivElement;
let _containers: Record<string, VideoContainer> = {};
let _videos: Record<string, Video> = {};
let _playing: Array<VideoPlayback> = [];
let _validExtensions: Array<VideoExtension> = ['mp4', 'm4v', 'mkv', 'webm'];

/**
 * Private Functions
*/

/**
 * @param {Video} from
 *
 * @return {HTMLVideoElement}
 */
function _createVideoElement(
    container: string,
    from: Video,
    resolve: () => void,
    events?: VideoEventHandler,
    queueid?: string): HTMLVideoElement
{
    const video = document.createElement('video');
    const source = document.createElement('source');

    switch (from.extension) {
        case 'mp4':
        case 'mkv':
        case 'm4v':
            source.setAttribute('type', 'video/mp4');
        break;
        case 'webm':
            source.setAttribute('type', 'video/webm');
        break;
    }

    video.addEventListener('loadeddata', (): void => {
        if (events?.onPlaybackStart) {
            events.onPlaybackStart(video);
        }

        video.play();
    });

    video.addEventListener('ended', (): void => {
        if (events?.onPlaybackEnd) {
            events.onPlaybackEnd(video);
        }

        _containers[container].element.removeChild(video);

        let index = _playing.length;

        while (index--) {
            if (_playing[index].element === video) {
                _playing.splice(index, 1);
                break;
            }
        }

        if (queueid) {
            QueuePop(queueid);
        }

        resolve();
    });

    video.setAttribute('width', (from.extent?.w || _containers[container].bounds.w).toString());
    video.setAttribute('height', (from.extent?.h || _containers[container].bounds.h).toString());

    video.appendChild(source);

    return video;
}

/**
 * Plays the video identified by the given name.
 *
 * @param {string} container The name of the container to add the video to.
 * @param {string} name The name of the video to play.
 * @param {() => void} onPlaybackEnd
 * @param {string} queueid The unique id for this video in the queue.
 *
 * @return {Promise<void>}
 */
function _playFile(
    container: string,
    name: string,
    events?: VideoEventHandler,
    queueid?: string): Promise<void>
{
    return new Promise((resolve) => {
        const video = _createVideoElement(container, _videos[name], resolve, events, queueid);
        const source = video.firstChild as HTMLSourceElement;
        const now = new Date;

        _playing.push({ video: _videos[name], element: video, when: now, state: VideoPlaybackState.Loading });
        _videos[name].history.push(new Date);
        _containers[container].element.appendChild(video);

        if (events?.onCreate) {
            events.onCreate(video);
        }

        source.setAttribute('src', _videos[name].uri);
    });
}

/**
 * Public Functions
*/

/**
 * @param {string} container The name of the container to add the video to.
 * @param {User} user The user who requested the video to be played.
 * @param {string} name The name of the video.
 * @param {QueueMode} mode The queue mode to use for playback.
 * @param {VideoEventHandler} events The playback event callbacks.
 *
 * @return {Promise<void>}
 */
export function VideoPlay(
    container: string,
    user: User,
    name: string,
    mode: QueueMode = QueueMode.Enqueue,
    events?: VideoEventHandler): Promise<void>
{
    return new Promise((resolve) => {
        name = (name || '').toLowerCase();

        if (!(name in _videos)) {
            return resolve();
        }

        if (VideoConfig.cooldownEnabled && user && CooldownIsActive(user, CooldownType.Video)) {
            if (VideoConfig.cooldownResponseEnabled) {
                TmiSend(CooldownGetResponse(user, CooldownType.Video, 'to play another video.'));
            }
            return resolve();
        }

        if (mode === QueueMode.Bypass) {
            _playFile(container, name, events).then(resolve);
        } else {
            QueuePush({
                mode,
                type: QueueType.SoundVideo,
                handler: (queueid: string): void => {
                    _playFile(container, name, events, queueid).then(resolve);
                },
            });
        }
    });
}

/**
 * @param {string} name The name to use for identifying the video.
 * @param {string} uri The URI to use for locating the video.
 *
 * @return {void}
 */
export function VideoRegister(
    name: string,
    uri: string): void
{
    name = (name || '').toLowerCase();

    if (!name || name in _videos) {
        return; // TODO: handle this error
    }

    const givenExtension = uri.slice(uri.lastIndexOf('.') + 1).toLowerCase();
    const validExtensionIndex = _validExtensions.indexOf(givenExtension as VideoExtension);

    if (validExtensionIndex === -1) {
        return; // TODO: handle this error
    }

    _videos[name] = {
        uri,
        history: [],
        extension: _validExtensions[validExtensionIndex],
    };
}

/**
 * @param {string} name The name to use for identifying the video.
 * @param {AABB} bounds The width/height/x/y bounds of the container.
 *
 * @return {void}
 */
export function VideoRegisterContainer(
    name: string,
    bounds: AABB): void
{
    const element = document.createElement('div');

    element.style.position = 'absolute';
    element.style.width = `${ bounds.w }px`;
    element.style.height = `${ bounds.h }px`;
    element.style.transform = `translate(${ bounds.x }px, ${ bounds.y }px)`;

    _base.appendChild(element);
    _containers[name] = {
        element,
        bounds,
        videos: {},
    };
}

/**
 * @return {void}
 */
export function VideoSuspend(
    name: string): void
{
    //
}

/**
 * @return {void}
 */
export function VideoResume(
    name: string): void
{
    //
}

/**
 * Returns true if the given name is a valid video.
 *
 * @param {string} name The name of the video.
 *
 * @return {boolean} Whether the video exists.
 */
 export function VideoExists(
    name: string): boolean
{
    return (name || '').toLowerCase() in _videos;
}

/**
 * Returns true if the specified video both exists and has been played within
 * the specified duration of time. False otherwise.
 *
 * @param {string} name The name of the video.
 * @param {Duration} threshold The length of time required to have passed for a video to no longer be considered recently played.
 *
 * @return {boolean} Whether the video is recently played.
 */
export function VideoIsRecentlyPlayed(
    name: string,
    threshold: Duration): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _videos) || _videos[name].history.length === 0) {
        return false;
    }

    const secondsPassed = ChronoDateDiffSeconds(new Date, _videos[name].history.at(-1));
    const secondsRequired = ChronoDurationSeconds(threshold);

    return secondsPassed < secondsRequired;
}

/**
 * @return {Promise<void>}
 */
export async function VideoInit(): Promise<void>
{
    _base = document.createElement('div');
    _base.id = VideoConfig.baseElementId;
    _base.style.position = 'absolute';
    _base.style.width = '100vw';
    _base.style.height = '100vh';

    document.body.appendChild(_base);
}
