/**
 * System Imports
*/

import { ChronoDateDelta, ChronoDurationConvert, Duration, DurationTuple, DurationType } from '@system/Chrono';
import { CooldownIsActive, CooldownType, CooldownGetResponse } from '@system/Cooldown';
import { AABB, AABBUnits, Extent } from '@system/Geometry';
import { QueueMode, QueuePop, QueuePush, QueueType } from '@system/Queue';
import { TmiSend } from '@system/Tmi';
import { User, UserFilter } from '@system/User';
import { VideoConfig } from '@config/Video';

/**
 * Relative Imports
*/

import { Video, VideoContainer, VideoControl, VideoEventHandler, VideoExtension, VideoPlayback, VideoPlaybackError, VideoPlaybackResult, VideoPlaybackState } from './types';
import { HistoryAddItem, HistoryFindItem } from '@system/History/api';
import { HistoryType } from '@system/History/types';

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
 * @param {string} container
 * @param {Video} from
 * @param {Point} position
 *
 * @return {HTMLVideoElement}
 */
function _createVideoElement(
    container: string,
    from: Video,
    control?: VideoControl): HTMLVideoElement
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

    video.volume = control?.volume ?? 1;
    video.playbackRate = control?.speed ?? 1;

    if (control?.position) {
        video.style.transform = `translate(${ control.position.x ?? 0 }px, ${ control.position.y ?? 0 }px)`;
    }

    video.setAttribute('width', (from.extent?.w ?? _containers[container].bounds.w).toString());
    video.setAttribute('height', (from.extent?.h ?? _containers[container].bounds.h).toString());

    video.appendChild(source);

    return video;
}

/**
 * @return {void}
 */
function _addEventHandlers(
    playback: VideoPlayback,
    resolve: () => void): void
{
    function onLoadedData(): void
    {
        if (playback.events?.onPlaybackStart) {
            playback.events.onPlaybackStart(playback);
        }

        playback.element.play();
    }

    function onPlaybackEnd(): void
    {
        if (playback.events?.onPlaybackEnd) {
            playback.events.onPlaybackEnd(playback);
        }

        _containers[playback.container].element.removeChild(playback.element);

        let index = _playing.length;

        while (index--) {
            if (_playing[index].element === playback.element) {
                _playing.splice(index, 1);
                break;
            }
        }

        if (playback.queueid) {
            QueuePop(playback.queueid);
        }

        resolve();
    }

    playback.element.addEventListener('loadeddata', onLoadedData);
    playback.element.addEventListener('ended', onPlaybackEnd);
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
    user?: User,
    events?: VideoEventHandler,
    control?: VideoControl,
    queueid?: string): Promise<void>
{
    return new Promise((resolve): void => {
        const when = new Date;
        const video = _createVideoElement(container, _videos[name], control);
        const source = video.firstChild as HTMLSourceElement;
        const playback: VideoPlayback = {
            container,
            queueid,
            control,
            when,
            video: _videos[name],
            element: video,
            state: VideoPlaybackState.Loading,
        };

        HistoryAddItem(HistoryType.Video, name, user, when);

        _playing.push(playback);
        _containers[container].element.appendChild(video);

        _addEventHandlers(playback, resolve);

        if (events?.onCreate) {
            events.onCreate(playback);
        }

        source.setAttribute('src', _videos[name].uri);
    });
}

/**
 * @return {boolean}
 */
function _isCooldownActive(
    name: string,
    user: User): boolean
{
    if (VideoConfig.cooldownEnabled && user && CooldownIsActive(user, CooldownType.Video)) {
        if (VideoConfig.cooldownResponseEnabled) {
            TmiSend(CooldownGetResponse(user, CooldownType.Video, 'to play another video.'));
        }

        return true;
    }

    return false;
}

/**
 * Public Functions
*/

/**
 * @param {string} container The name of the container to add the video to.
 * @param {string} name The name of the video.
 * @param {User} user The user who requested the video to be played.
 * @param {control} VideoControl
 * @param {QueueMode} mode The queue mode to use for playback.
 * @param {VideoEventHandler} events The playback event callbacks.
 *
 * @return {Promise<VideoPlaybackResult>}
 */
export function VideoPlay(
    container: string,
    name: string,
    user?: User,
    control?: VideoControl,
    events?: VideoEventHandler,
    mode: QueueMode = QueueMode.Enqueue,
    type: QueueType = QueueType.Sound | QueueType.Video): Promise<VideoPlaybackResult>
{
    return new Promise((resolve, reject): void => {
        name = (name || '').toLowerCase();

        if (!(name in _videos)) {
            return reject({ error: VideoPlaybackError.NotFound });
        }

        if (_isCooldownActive(name, user)) {
            return reject({ error: VideoPlaybackError.Cooldown });
        }

        if (control) {
            control = { ...control };
        }

        function onComplete(): void
        {
            resolve({ error: VideoPlaybackError.NoError });
        }

        switch (mode) {
        case QueueMode.Bypass:
            _playFile(container, name, user, events, control).then(onComplete);
            break;
        default:
            QueuePush({
                mode,
                type,
                handler: (queueid: string): void => {
                    _playFile(container, name, user, events, control, queueid).then(onComplete);
                },
            });
            break;
        }
    });
}

/**
 * @param {string} name The name to use for identifying the video.
 * @param {string} uri The URI to use for locating the video.
 * @param {Extent} extent The width and height of the video.
 * @param {Duration} duration The duration of the video.
 *
 * @return {void}
 */
export function VideoRegister(
    name: string,
    uri: string,
    extent?: Extent,
    duration?: Duration): void
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
        extent,
        duration,
        extension: _validExtensions[validExtensionIndex],
    };
}

/**
 * @param {string} name The name to use for identifying the video.
 * @param {AABB} bounds The width/height/x/y bounds of the container.
 * @param {Partial<AABBUnits>} units
 *
 * @return {void}
 */
export function VideoRegisterContainer(
    name: string,
    bounds: AABB,
    units?: Partial<AABBUnits>): void
{
    const element = document.createElement('div');

    element.style.overflow = 'hidden';
    element.style.width = `${ bounds.w }${ units?.w ?? 'px' }`;
    element.style.height = `${ bounds.h }${ units?.h ?? 'px' }`;
    element.style.transform = `translate(${ bounds.x ?? 0 }${ units?.x ?? 'px' }, ${ bounds.y ?? 0 }${ units?.y ?? 'px' })`;

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
 * @param {Duration | DurationTuple} threshold The length of time required to have passed for a video to no longer be considered recently played.
 *
 * @return {boolean}
 */
export function VideoPlayedWithin(
    name: string,
    threshold: Duration | DurationTuple,
    filter?: UserFilter): boolean
{
    name = (name || '').toLowerCase();

    if (!(name in _videos)) {
        return false;
    }

    const history = HistoryFindItem(HistoryType.Video, name, filter);

    if (!history) {
        return false;
    }

    const millisecondsSincePlay = ChronoDateDelta(new Date, history.when, DurationType.Milliseconds);
    const millisecondsLimit = ChronoDurationConvert(threshold, DurationType.Milliseconds);

    return millisecondsSincePlay.value < millisecondsLimit.value;
}

/**
 * Prepares the Video API for usage. Should only be called once.
 *
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
