/**
 * System Imports
*/

import { CooldownIsActive, CooldownGetSecondsRemaining, CooldownType } from '@system/Cooldown';
import { TmiSend } from '@system/Tmi';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { User } from '@system/User';
import { VideoConfig } from '@config/Video';
import { ChronoDateDiffSeconds, ChronoDurationSeconds, Duration } from '@system/Chrono';

/**
 * Relative Imports
*/

import { Video, VideoEventHandler, VideoExtension } from './types';

/**
 * Locals
*/

let _container: HTMLDivElement;
let _videos: Record<string, Video> = {};
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
    from: Video): HTMLVideoElement
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

    video.addEventListener('ended', _handleEndPlay);
    video.addEventListener('error', _handleEndPlay);
    video.addEventListener('loadeddata', _handleLoaded);

    video.setAttribute('width', (from.extent?.w || VideoConfig.width).toString());
    video.setAttribute('height', (from.extent?.h || VideoConfig.height).toString());

    source.setAttribute('src', from.uri);

    video.appendChild(source);

    return video;
}

/**
 * Plays the video identified by the given name.
 *
 * @param {string} name The name of the video to play.
 * @param {string} queueid The unique id for this video in the queue.
 *
 * @return {void}
 */
 function _playFile(
    name: string,
    queueid?: string): void
{
    _videos[name].history.push({ from: new Date });
    _container.appendChild(_createVideoElement(_videos[name]));
}

/**
 * Public Functions
*/

/**
 * @param {User} user The user who requested the video to be played.
 * @param {string} name The name of the video.
 * @param {QueueMode} mode The queue mode to use for playback.
 * @param {VideoEventHandler} events The playback event callbacks.
 *
 * @return {void}
 */
export function VideoPlay(
    user: User,
    name: string,
    mode: QueueMode = QueueMode.Enqueue,
    events?: VideoEventHandler): void
{
    name = (name || '').toLowerCase();

    if (!(name in _videos)) {
        return;
    }

    if (mode === QueueMode.Bypass) {
        _playFile(name);
    } else {
        QueuePush({
            mode,
            type: QueueType.SoundVideo,
            handler: (queueid: string): void => {
                _playFile(name, queueid);
            },
        });
    }
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

    const secondsPassed = DateDiffSeconds(new Date, _videos[name].history.at(-1).from);
    const secondsRequired = ChronoDurationSeconds(threshold);

    return secondsPassed < secondsRequired;
}

/**
 * @return {Promise<void>}
 */
export async function VideoInit(): Promise<void>
{
    _container = document.createElement('div');
    _container.id = VideoConfig.elementId;
    _container.style.position = 'absolute';
    _container.style.width = `${ VideoConfig.width }px`;
    _container.style.height = `${ VideoConfig.height }px`;
    _container.style.transform = `translate(${ VideoConfig.y }px, ${ VideoConfig.y }px)`;

    document.body.appendChild(_container);
}
