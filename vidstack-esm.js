/**
 * Bundled by jsDelivr using Rollup v2.79.2 and Terser v5.39.0.
 * Original file: /npm/@vidstack/player@1.6.5/dist/prod/index.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
import {
  createContext as e,
  isArray as t,
  isUndefined as i,
  keysOf as s,
  writable as a,
  storeRecordSubscription as r,
  isNumber as n,
  DisposalBin as o,
  RequestQueue as h,
  unwrapStoreRecord as d,
  hostRequestQueue as l,
  ScreenOrientationController as u,
  FullscreenController as c,
  discoverable as p,
  createIntersectionController as _,
  vdsEvent as g,
  requestIdleCallback as m,
  raf as v,
  clampNumber as y,
  copyStoreRecords as E,
  discover as b,
  listen as f,
  debounce as C,
  IntersectionController as w,
  PageController as S,
  eventListener as M,
  throttle as k,
  isNil as P,
  appendTriggerEvent as T,
  setAttribute as R,
  IS_IOS as q,
  isString as L,
  camelToKebabCase as A,
  derived as D,
  rafThrottle as x,
  focusVisiblePolyfill as V,
  get as H,
  setCSSProperty as F,
  setAttributeIfEmpty as I,
  round as N,
  getNumberOfDecimalPlaces as O,
  isKeyboardEvent as U,
  formatSpokenTime as W,
  formatTime as B,
  isKeyboardClick as $,
  preconnect as Q,
  ifNonEmpty as j,
  redispatchEvent as K,
  getSlottedChildren as z,
  isScalarArrayEqual as G,
  storeSubscription as X,
  deferredPromise as J,
  isPointerEvent as Y,
  isMouseEvent as Z,
  isTouchEvent as ee,
  noop as te,
  isFunction as ie,
  isHlsjsSupported as se,
  VdsEvent as ae,
  ScriptLoader as re,
  kebabToCamelCase as ne,
} from '/npm/@vidstack/foundation@1.6.5/+esm';
export {
  appendTriggerEvent,
  findTriggerEvent,
  hasTriggerEvent,
  isHlsjsSupported,
  walkTriggerEventChain,
} from '/npm/@vidstack/foundation@1.6.5/+esm';
import { LitElement as oe, html as he, css as de } from '/npm/lit@2.4.1/+esm';
import { property as le, state as ue } from '/npm/lit@2.4.1/decorators.js/+esm';
import { ifDefined as ce } from '/npm/lit@2.4.1/directives/if-defined.js/+esm';
import { createRef as pe, ref as _e } from '/npm/lit@2.4.1/directives/ref.js/+esm';
import { styleMap as ge } from '/npm/lit@2.4.1/directives/style-map.js/+esm';
var me = ((e) => (
    (e.Unknown = 'unknown'),
    (e.Audio = 'audio'),
    (e.Video = 'video'),
    (e.LiveVideo = 'live-video'),
    e
  ))(me || {}),
  ve = ((e) => ((e.Unknown = 'unknown'), (e.Audio = 'audio'), (e.Video = 'video'), e))(ve || {});
function ye(e, t, i, s) {
  return (
    (function (e, t, i) {
      if (!n(t) || t < 0 || t > i)
        throw new Error(
          `Failed to execute '${e}' on 'TimeRanges': The index provided (${t}) is non-numeric or out of bounds (0-${i}).`
        );
    })(e, s, i.length - 1),
    i[s][t]
  );
}
function Ee(e) {
  if (i(e) || 0 === e.length) {
    const e = () => {
      throw new Error('This TimeRanges object is empty');
    };
    return { length: 0, start: e, end: e };
  }
  return { length: e.length, start: ye.bind(null, 'start', 0, e), end: ye.bind(null, 'end', 1, e) };
}
function be(e, s) {
  return t(e) ? Ee(e) : i(e) || i(s) ? Ee() : Ee([[e, s]]);
}
var fe = {
  autoplay: !1,
  autoplayError: void 0,
  buffered: be(),
  duration: 0,
  bufferedAmount: 0,
  canLoad: !1,
  canPlay: !1,
  canFullscreen: !1,
  controls: !1,
  poster: '',
  currentSrc: '',
  currentTime: 0,
  ended: !1,
  error: void 0,
  fullscreen: !1,
  userIdle: !1,
  loop: !1,
  mediaType: 'unknown',
  muted: !1,
  paused: !0,
  played: be(),
  playing: !1,
  playsinline: !1,
  seekable: be(),
  seekableAmount: 0,
  seeking: !1,
  src: [],
  started: !1,
  viewType: 'unknown',
  volume: 1,
  waiting: !1,
};
function Ce() {
  const e = {};
  for (const t of s(fe)) e[t] = a(fe[t]);
  return e;
}
var we = new Set([
  'autoplay',
  'canFullscreen',
  'canLoad',
  'controls',
  'currentSrc',
  'loop',
  'muted',
  'playsinline',
  'poster',
  'src',
  'viewType',
  'volume',
]);
function Se(e) {
  s(e).forEach((t) => {
    we.has(t) || e[t].set(e[t].initialValue);
  });
}
function Me(e) {
  for (const t of s(fe)) e[t].set(fe[t]);
}
var ke = e(Ce);
function Pe(e, t, i) {
  return r(e, ke, t, i);
}
var Te = Object.defineProperty,
  Re = Object.getOwnPropertyDescriptor,
  qe = (e, t, i, s) => {
    for (var a, r = s > 1 ? void 0 : s ? Re(t, i) : t, n = e.length - 1; n >= 0; n--)
      (a = e[n]) && (r = (s ? a(t, i, r) : a(r)) || r);
    return (s && r && Te(t, i, r), r);
  },
  Le = Symbol('@vidstack/media-provider-discovery'),
  Ae = class extends oe {
    constructor() {
      (super(),
        (this._disconnectDisposal = new o()),
        (this._logger = void 0),
        (this.loading = 'visible'),
        (this._attemptingAutoplay = !1),
        (this.controllerQueue = new h()),
        (this._store = Ce()),
        (this._state = d(this._store)),
        (this.connectedQueue = l(this)),
        (this.mediaQueue = new h()),
        (this.screenOrientationController = new u(this)),
        (this.fullscreenController = new c(this, this.screenOrientationController)),
        p(this, 'vds-media-provider-connect', { register: Le }));
      const e = _(this, { target: this, threshold: 0 }, (t) => {
        /(visible|lazy)/.test(this.loading)
          ? t[0]?.isIntersecting && (this.startLoadingMedia(), e.hostDisconnected())
          : e.hostDisconnected();
      });
    }
    connectedCallback() {
      (super.connectedCallback(),
        this._logMediaEvents(),
        window.requestAnimationFrame(() => {
          i(this.canLoadPoster) && (this.canLoadPoster = !0);
        }));
    }
    firstUpdated(e) {
      (super.firstUpdated(e),
        this.dispatchEvent(g('vds-fullscreen-support-change', { detail: this.canFullscreen })),
        this.canLoad || 'eager' === this.loading
          ? window?.requestAnimationFrame(() => {
              this.startLoadingMedia();
            })
          : 'idle' === this.loading &&
            m(() => {
              this.startLoadingMedia();
            }));
    }
    render() {
      return he`<slot @slotchange="${this.handleDefaultSlotChange}"></slot>`;
    }
    disconnectedCallback() {
      (this._updateMediaStoreOnDisconnect(this._store),
        this.mediaQueue.destroy(),
        this._disconnectDisposal.empty(),
        super.disconnectedCallback(),
        v(() => {
          v(() => {
            this.isConnected || this.destroy();
          });
        }));
    }
    _updateMediaStoreOnDisconnect(e) {
      (e.paused.set(!0),
        e.playing.set(!1),
        e.seeking.set(!1),
        e.waiting.set(!1),
        e.fullscreen.set(!1));
    }
    destroy() {
      (this.isConnected && this.disconnectedCallback(), this.dispatchEvent(g('vds-destroy')));
    }
    _logMediaEvents() {}
    get volume() {
      return this._getVolume();
    }
    set volume(e) {
      this.mediaQueue.queue('volume', () => {
        const t = this.volume,
          i = y(0, e, 1);
        t !== i && (this._setVolume(i), this.requestUpdate('volume', t));
      });
    }
    get paused() {
      return this._getPaused();
    }
    set paused(e) {
      this.mediaQueue.queue('paused', () => {
        if (this.paused !== e)
          try {
            (e ? this.pause() : this.play(), this.requestUpdate('paused', !e));
          } catch (e) {
            this._logger?.error('paused-change-fail', e);
          }
      });
    }
    get currentTime() {
      return this._getCurrentTime();
    }
    set currentTime(e) {
      this.mediaQueue.queue('current-time', () => {
        const t = this.currentTime;
        t !== e && (this._setCurrentTime(e), this.requestUpdate('currentTime', t));
      });
    }
    get muted() {
      return this._getMuted();
    }
    set muted(e) {
      this.mediaQueue.queue('muted', () => {
        const t = this.muted;
        t !== e && (this._setMuted(e), this.requestUpdate('muted', t));
      });
    }
    get poster() {
      return this.state.poster;
    }
    set poster(e) {
      const t = this.poster;
      t !== e &&
        (this.dispatchEvent(g('vds-poster-change', { detail: e })),
        this.requestUpdate('poster', t));
    }
    get loop() {
      return this.state.loop;
    }
    set loop(e) {
      const t = this.loop;
      t !== e &&
        (this.dispatchEvent(g('vds-loop-change', { detail: e })), this.requestUpdate('loop', t));
    }
    get controls() {
      return this.state.controls;
    }
    set controls(e) {
      const t = this.controls;
      t !== e &&
        (this.dispatchEvent(g('vds-controls-change', { detail: e })),
        this.requestUpdate('controls', t));
    }
    get canLoad() {
      return this.state.canLoad;
    }
    startLoadingMedia() {
      this.state.canPlay || this.dispatchEvent(g('vds-can-load'));
    }
    _throwIfNotReadyForPlayback() {
      if (!this.state.canPlay) throw Error('Media is not ready - wait for `vds-can-play` event.');
    }
    async _resetPlaybackIfEnded() {
      if (this.state.ended && 0 !== this.state.currentTime) return this._setCurrentTime(0);
    }
    _throwIfNotVideoView() {
      if ('video' !== this.state.viewType) throw Error('Player is currently not in a video view.');
    }
    async _handleMediaReady({ event: e, duration: t }) {
      this.state.canPlay ||
        (this.dispatchEvent(g('vds-can-play', { triggerEvent: e, detail: { duration: t } })),
        this.mediaQueue.start(),
        await this._attemptAutoplay());
    }
    _handleCurrentSrcChange(e, t) {
      this.state.currentSrc !== e &&
        (this.mediaQueue.stop(),
        this.dispatchEvent(g('vds-current-src-change', { detail: e, triggerEvent: t })));
    }
    get autoplay() {
      return this.state.autoplay;
    }
    set autoplay(e) {
      (this.autoplay !== e &&
        (this.dispatchEvent(g('vds-autoplay-change', { detail: e })),
        this.requestUpdate('autoplay', !e)),
        this._attemptAutoplay());
    }
    get _canAttemptAutoplay() {
      return this.state.canPlay && this.state.autoplay && !this.state.started;
    }
    async _attemptAutoplay() {
      if (this._canAttemptAutoplay) {
        this._attemptingAutoplay = !0;
        try {
          (await this.play(),
            this.dispatchEvent(g('vds-autoplay', { detail: { muted: this.muted } })));
        } catch (e) {
          (this.dispatchEvent(g('vds-autoplay-fail', { detail: { muted: this.muted, error: e } })),
            this.requestUpdate());
        }
        this._attemptingAutoplay = !1;
      }
    }
    get controller() {
      return this._controller;
    }
    get logLevel() {
      return this._controller?.logLevel ?? 'silent';
    }
    set logLevel(e) {}
    get idleDelay() {
      return this._controller?.idleDelay ?? 0;
    }
    set idleDelay(e) {
      this.controllerQueue.queue('idle-delay', () => {
        this._controller.idleDelay = e;
      });
    }
    attachMediaController(e, t) {
      ((this._controller = e),
        (this._store = e._store),
        (this._state = e.state),
        this.controllerQueue.start(),
        t(() => {
          (this.controllerQueue.destroy(),
            (this._store = Ce()),
            (this._state = d(this._store)),
            this._controller &&
              (E(this._controller._store, this._store),
              this._updateMediaStoreOnDisconnect(this._controller._store)),
            (this._controller = void 0));
        }));
    }
    dispatchEvent(e) {
      return !this._controller && e.type.startsWith('vds-') && 'vds-destroy' !== e.type
        ? (this.controllerQueue.queue(e.type, () => {
            super.dispatchEvent(e);
          }),
          !1)
        : super.dispatchEvent(e);
    }
    store() {
      return this._store;
    }
    get state() {
      return this._state;
    }
    get canFullscreen() {
      return this.fullscreenController.isSupported;
    }
    get fullscreen() {
      return this.fullscreenController.isFullscreen;
    }
    get fullscreenOrientation() {
      return this.fullscreenController.screenOrientationLock;
    }
    set fullscreenOrientation(e) {
      const t = this.fullscreenController.screenOrientationLock;
      t !== e &&
        ((this.fullscreenController.screenOrientationLock = e),
        this.requestUpdate('fullscreen-orientation', t));
    }
    enterFullscreen() {
      return this.fullscreenController.enterFullscreen();
    }
    exitFullscreen() {
      return this.fullscreenController.exitFullscreen();
    }
  };
(qe([le({ type: Number })], Ae.prototype, 'volume', 1),
  qe([le({ type: Boolean })], Ae.prototype, 'paused', 1),
  qe([le({ type: Number })], Ae.prototype, 'currentTime', 1),
  qe([le({ type: Boolean })], Ae.prototype, 'muted', 1),
  qe([le()], Ae.prototype, 'poster', 1),
  qe([le({ type: Boolean })], Ae.prototype, 'loop', 1),
  qe([le({ type: Boolean })], Ae.prototype, 'controls', 1),
  qe([ue()], Ae.prototype, 'canLoadPoster', 2),
  qe([le({ attribute: 'loading' })], Ae.prototype, 'loading', 2),
  qe([le({ type: Boolean })], Ae.prototype, 'autoplay', 1),
  qe([le({ attribute: 'log-level' })], Ae.prototype, 'logLevel', 1),
  qe([le({ attribute: 'idle-delay', type: Number })], Ae.prototype, 'idleDelay', 1),
  qe([le({ attribute: 'fullscreen-orientation' })], Ae.prototype, 'fullscreenOrientation', 1));
var De = new Set(),
  xe = !1,
  Ve = !1,
  He = class extends oe {
    constructor() {
      (super(),
        (this.singlePlayback = !1),
        (this.syncVolume = !1),
        (this._providerDisposal = new o()),
        b(this, Le, (e, t) => {
          this._handleMediaProviderConnect(e, t);
        }));
    }
    static get styles() {
      return de`:host{display:contents}`;
    }
    disconnectedCallback() {
      (super.disconnectedCallback(), this._providerDisposal.empty());
    }
    render() {
      return he`<slot></slot>`;
    }
    get provider() {
      return this._provider;
    }
    _handleMediaProviderConnect(e, t) {
      ((this._provider = e), De.add(e));
      const i = this._getSavedMediaVolume();
      if (
        (i && ((this._provider.volume = i.volume), (this._provider.muted = i.muted)),
        this.singlePlayback)
      ) {
        const t = f(e, 'vds-play', this._handleMediaPlay.bind(this));
        this._providerDisposal.add(t);
      }
      if (this.syncVolume) {
        const t = f(e, 'vds-volume-change', C(this._handleMediaVolumeChange.bind(this), 10, !0));
        this._providerDisposal.add(t);
      }
      if (this.volumeStorageKey) {
        const t = f(e, 'vds-volume-change', this._saveMediaVolume.bind(this));
        this._providerDisposal.add(t);
      }
      t(() => {
        (De.delete(e), (this._provider = void 0), this._providerDisposal.empty());
      });
    }
    _handleMediaPlay() {
      xe ||
        ((xe = !0),
        De.forEach((e) => {
          e !== this._provider && (e.paused = !0);
        }),
        (xe = !1));
    }
    _handleMediaVolumeChange(e) {
      if (Ve) return;
      Ve = !0;
      const { volume: t, muted: i } = e.detail;
      (De.forEach((e) => {
        e !== this._provider && ((e.volume = t), (e.muted = i));
      }),
        this.dispatchEvent(
          g('vds-media-volume-sync', { bubbles: !0, composed: !0, detail: e.detail })
        ),
        (Ve = !1));
    }
    _getSavedMediaVolume() {
      if (this.volumeStorageKey)
        try {
          return JSON.parse(localStorage.getItem(this.volumeStorageKey));
        } catch (e) {
          return;
        }
    }
    _saveMediaVolume(e) {
      this.volumeStorageKey &&
        localStorage.setItem(this.volumeStorageKey, JSON.stringify(e.detail));
    }
  };
(qe([le({ type: Boolean, attribute: 'single-playback' })], He.prototype, 'singlePlayback', 2),
  qe([le({ type: Boolean, attribute: 'sync-volume' })], He.prototype, 'syncVolume', 2),
  qe([le({ attribute: 'volume-storage-key' })], He.prototype, 'volumeStorageKey', 2));
var Fe = class extends oe {
  constructor() {
    (super(),
      (this.viewportEnterDelay = 0),
      (this.pageChangeType = 'state'),
      (this.pageEnterDelay = 0),
      (this.intersectionThreshold = 1),
      (this._isIntersecting = !1),
      (this._providerDisposal = new o()),
      (this._hasIntersected = !1),
      (this.intersectionController = new w(
        this,
        {
          root: this.intersectionRoot ? document.querySelector(this.intersectionRoot) : null,
          threshold: this.intersectionThreshold,
        },
        (e) => {
          window.clearTimeout(this._intersectionTimeout);
          const t = e[0];
          ((this._isIntersecting = t.isIntersecting),
            this._hasIntersected &&
              (t.isIntersecting
                ? (this._intersectionTimeout = window.setTimeout(() => {
                    (this._triggerOnEnter(this.enterViewport),
                      (this._intersectionTimeout = void 0));
                  }, this.viewportEnterDelay))
                : this.exitViewport &&
                  ((this._isIntersecting = !1), this._triggerOnExit(this.exitViewport))),
            (this._hasIntersected = !0),
            this._dispatchVisibilityChange());
        }
      )),
      (this.pageController = new S(this, ({ state: e, visibility: t }) => {
        if ((window.clearTimeout(this._pageTimeout), !this.isIntersecting)) return;
        ('hidden' === ('state' === this.pageChangeType ? e : t)
          ? this._triggerOnExit(this.exitPage)
          : this.enterPage &&
            (this._pageTimeout = window.setTimeout(() => {
              (this._triggerOnEnter(this.enterPage), (this._pageTimeout = void 0));
            }, this.pageEnterDelay)),
          this._dispatchVisibilityChange());
      })),
      b(this, Le, (e, t) => {
        this._handleMediaProviderConnect(e, t);
      }));
  }
  static get styles() {
    return de`:host{display:contents}`;
  }
  get isIntersecting() {
    return this._isIntersecting;
  }
  disconnectedCallback() {
    (super.disconnectedCallback(), (this._hasIntersected = !1), this._providerDisposal.empty());
  }
  render() {
    return he`<slot></slot>`;
  }
  get provider() {
    return this._provider;
  }
  _handleMediaProviderConnect(e, t) {
    this._provider = e;
    const i = this.intersectionController.observe(e);
    t(() => {
      (i(), (this._provider = void 0), this._providerDisposal.empty());
    });
  }
  _triggerOnEnter(e) {
    this._provider &&
      ('play' === e ? (this._provider.paused = !1) : 'unmute' === e && (this._provider.muted = !1));
  }
  _triggerOnExit(e) {
    this._provider &&
      ('pause' === e ? (this._provider.paused = !0) : 'mute' === e && (this._provider.muted = !0));
  }
  _dispatchVisibilityChange() {
    this._provider &&
      this.dispatchEvent(
        g('vds-media-visibility-change', {
          bubbles: !0,
          composed: !0,
          detail: {
            provider: this._provider,
            viewport: { isIntersecting: this.isIntersecting },
            page: { state: this.pageController.state, visibility: this.pageController.visibility },
          },
        })
      );
  }
};
(qe([le({ attribute: 'enter-viewport' })], Fe.prototype, 'enterViewport', 2),
  qe([le({ attribute: 'exit-viewport' })], Fe.prototype, 'exitViewport', 2),
  qe(
    [le({ type: Number, attribute: 'viewport-enter-delay' })],
    Fe.prototype,
    'viewportEnterDelay',
    2
  ),
  qe([le({ attribute: 'enter-page' })], Fe.prototype, 'enterPage', 2),
  qe([le({ attribute: 'exit-page' })], Fe.prototype, 'exitPage', 2),
  qe([le({ attribute: 'page-change-type' })], Fe.prototype, 'pageChangeType', 2),
  qe([le({ type: Number, attribute: 'page-enter-delay' })], Fe.prototype, 'pageEnterDelay', 2),
  qe([le({ attribute: 'intersection-root' })], Fe.prototype, 'intersectionRoot', 2),
  qe(
    [le({ type: Number, attribute: 'intersection-threshold' })],
    Fe.prototype,
    'intersectionThreshold',
    2
  ));
var Ie = e(() => a(void 0)),
  Ne = class {
    constructor(e, t) {
      ((this._host = e),
        (this._mediaStore = t),
        (this._idle = !1),
        (this._mediaPaused = !1),
        (this._idlingPaused = !1),
        (this._disposal = new o()),
        (this.delay = 2e3),
        e.addController(this));
    }
    get paused() {
      return this._idlingPaused || this._mediaPaused;
    }
    set paused(e) {
      ((this._idlingPaused = e), this._handleIdleChange());
    }
    hostConnected() {
      this._disposal.add(
        this._mediaStore.paused.subscribe((e) => {
          ((this._mediaPaused = e), this._handleIdleChange());
        })
      );
      ['pointerdown', 'pointermove', 'focus', 'keydown'].forEach((e) => {
        const t = f(this._host, e, this._handleIdleChange.bind(this));
        this._disposal.add(t);
      });
    }
    hostDisconnected() {
      (this._disposal.empty(), this._stopIdleTimer());
    }
    _handleIdleChange() {
      this.paused ? this._stopIdleTimer() : this._startIdleTimer();
    }
    _startIdleTimer() {
      (this._stopIdleTimer(),
        (this._idleTimeout = window.setTimeout(() => {
          this._dispatchIdleChange(!this.paused);
        }, this.delay)));
    }
    _stopIdleTimer() {
      (window.clearTimeout(this._idleTimeout), this._dispatchIdleChange(!1));
    }
    _dispatchIdleChange(e) {
      this._idle !== e &&
        (this._host.dispatchEvent(g('vds-user-idle-change', { detail: e })), (this._idle = e));
    }
  },
  Oe = class {
    constructor(e) {
      ((this._host = e),
        (this._disconnectDisposal = new o()),
        (this.providerQueue = new h()),
        (this.providerDisposal = new o()),
        (this._logController = void 0),
        (this._logger = void 0),
        (this._providerContext = Ie.provide(this._host)),
        (this._mediaStoreProvider = ke.provide(this._host)),
        (this.state = d(this._store)),
        (this._userIdleController = new Ne(this._host, this._store)),
        (this._handleIdleChange = M(this._host, 'vds-user-idle-change', (e) => {
          (this._store.userIdle.set(e.detail), this._satisfyMediaRequest('userIdle', e));
        })),
        (this._pendingMediaRequests = {
          loading: [],
          play: [],
          pause: [],
          volume: [],
          fullscreen: [],
          seeked: [],
          seeking: [],
          userIdle: [],
        }),
        (this._handleStartLoadingRequest = M(
          this._host,
          'vds-start-loading',
          this._createMediaRequestHandler('loading', (e) => {
            this.state.canLoad ||
              (this._pendingMediaRequests.loading.push(e), this._provider.startLoadingMedia());
          })
        )),
        (this._handleMuteRequest = M(
          this._host,
          'vds-mute-request',
          this._createMediaRequestHandler('muted', (e) => {
            this.state.muted ||
              (this._pendingMediaRequests.volume.push(e), (this.provider.muted = !0));
          })
        )),
        (this._handleUnmuteRequest = M(
          this._host,
          'vds-unmute-request',
          this._createMediaRequestHandler('muted', (e) => {
            this.state.muted &&
              (this._pendingMediaRequests.volume.push(e),
              (this.provider.muted = !1),
              0 === this.state.volume &&
                (this._pendingMediaRequests.volume.push(e), (this.provider.volume = 0.25)));
          })
        )),
        (this._handlePlayRequest = M(
          this._host,
          'vds-play-request',
          this._createMediaRequestHandler('paused', (e) => {
            this.state.paused &&
              (this._pendingMediaRequests.play.push(e), (this.provider.paused = !1));
          })
        )),
        (this._handlePauseRequest = M(
          this._host,
          'vds-pause-request',
          this._createMediaRequestHandler('paused', (e) => {
            this.state.paused ||
              (this._pendingMediaRequests.pause.push(e), (this.provider.paused = !0));
          })
        )),
        (this._isSeekingRequestPending = !1),
        (this._handleSeekingRequest = M(
          this._host,
          'vds-seeking-request',
          this._createMediaRequestHandler('seeking', (e) => {
            (this._stopWaiting(),
              this._pendingMediaRequests.seeking.push(e),
              (this._isSeekingRequestPending = !0),
              this._store.seeking.set(!0));
          })
        )),
        (this._handleSeekRequest = M(
          this._host,
          'vds-seek-request',
          this._createMediaRequestHandler('seeking', (e) => {
            (this.store.ended && (this._isReplay = !0),
              this._pendingMediaRequests.seeked.push(e),
              (this._isSeekingRequestPending = !1));
            let t = e.detail;
            (this.state.duration - e.detail < 0.25 && (t = this.state.duration),
              (this.provider.currentTime = t));
          })
        )),
        (this._handleVolumeChangeRequest = M(
          this._host,
          'vds-volume-change-request',
          this._createMediaRequestHandler('volume', (e) => {
            const t = e.detail;
            this.state.volume !== t &&
              (this._pendingMediaRequests.volume.push(e),
              (this.provider.volume = t),
              t > 0 &&
                this.state.muted &&
                (this._pendingMediaRequests.volume.push(e), (this.provider.muted = !1)));
          })
        )),
        (this._handleEnterFullscreenRequest = M(
          this._host,
          'vds-enter-fullscreen-request',
          this._createMediaRequestHandler('fullscreen', async (e) => {
            if (this.state.fullscreen) return;
            'media' === (e.detail ?? 'media') && this._host.canFullscreen
              ? (this._pendingMediaRequests.fullscreen.push(e),
                await this._host.enterFullscreen?.())
              : this.provider &&
                (this._pendingMediaRequests.fullscreen.push(e),
                await this.provider.enterFullscreen());
          })
        )),
        (this._handleExitFullscreenRequest = M(
          this._host,
          'vds-exit-fullscreen-request',
          this._createMediaRequestHandler('fullscreen', async (e) => {
            if (!this.state.fullscreen) return;
            'media' === (e.detail ?? 'media') && this._host.canFullscreen
              ? (this._pendingMediaRequests.fullscreen.push(e), await this._host.exitFullscreen?.())
              : this.provider &&
                (this._pendingMediaRequests.fullscreen.push(e),
                await this.provider.exitFullscreen());
          })
        )),
        (this._handleResumeIdlingRequest = M(this._host, 'vds-resume-user-idle-request', (e) => {
          this._mediaRequestEventGateway(e) &&
            (this._pendingMediaRequests.userIdle.push(e), (this._userIdleController.paused = !1));
        })),
        (this._handlePauseIdlingRequest = M(this._host, 'vds-pause-user-idle-request', (e) => {
          this._mediaRequestEventGateway(e) &&
            (this._pendingMediaRequests.userIdle.push(e), (this._userIdleController.paused = !0));
        })),
        (this._handleShowPosterRequest = M(
          this._host,
          'vds-show-poster-request',
          this._createMediaRequestHandler('poster', () => {
            this._provider.canLoadPoster = !0;
          })
        )),
        (this._handleHidePosterRequest = M(
          this._host,
          'vds-hide-poster-request',
          this._createMediaRequestHandler('poster', () => {
            this._provider.canLoadPoster = !1;
          })
        )),
        (this._handleLoopRequest = this._createMediaRequestHandler('loop', () => {
          window.requestAnimationFrame(async () => {
            try {
              ((this._isLooping = !0), (this._isReplay = !0), await this._provider.play());
            } catch (e) {
              ((this._isReplay = !1), (this._isLooping = !1));
            }
          });
        })),
        (this._handleFullscreenChange = M(this._host, 'vds-fullscreen-change', (e) => {
          (this._store.fullscreen.set(e.detail),
            e.target === this._host &&
              (this._satisfyMediaRequest('fullscreen', e),
              this._provider?.dispatchEvent(
                g('vds-fullscreen-change', { detail: e.detail, triggerEvent: e })
              )));
        })),
        (this._handleFullscreenError = M(this._host, 'vds-fullscreen-error', (e) => {
          e.target === this._host &&
            (this._satisfyMediaRequest('fullscreen', e),
            this._provider?.dispatchEvent(
              g('vds-fullscreen-error', { detail: e.detail, triggerEvent: e })
            ));
        })),
        (this._isReplay = !1),
        (this._isLooping = !1),
        (this._firingWaiting = !1),
        (this._mediaEvents = []),
        (this._handleSeeking = k(
          (e) => {
            (this._mediaEvents.push(e),
              this._store.seeking.set(!0),
              this._store.currentTime.set(e.detail),
              this._satisfyMediaRequest('seeking', e));
          },
          150,
          { leading: !0 }
        )),
        (this._fireWaiting = C(() => {
          if (!this._originalWaitingEvent) return;
          this._firingWaiting = !0;
          const e = g('vds-waiting', this._originalWaitingEvent);
          (this._mediaEvents.push(e),
            this._store.waiting.set(!0),
            this._store.playing.set(!1),
            this._provider?.dispatchEvent(e),
            (this._originalWaitingEvent = void 0),
            (this._firingWaiting = !1));
        }, 300)),
        (this._skipInitialSrcChange = !0),
        b(e, Le, (e, t) => {
          this.attachMediaProvider(e, t);
        }),
        e.addController({
          hostConnected: () => {
            this.state.canPlay || this._host.setAttribute('aria-busy', 'true');
          },
          hostDisconnected: () => {
            (this._clearMediaStateTracking(),
              this._clearPendingMediaRequests(),
              this.providerQueue.destroy(),
              this.providerDisposal.empty(),
              (this._skipInitialSrcChange = !0),
              this._disconnectDisposal.empty());
          },
        }));
    }
    get logLevel() {
      return this._logController?.logLevel ?? 'silent';
    }
    set logLevel(e) {}
    get provider() {
      return this._provider;
    }
    attachMediaProvider(e, t) {
      P(this.provider) &&
        this.provider !== e &&
        (this._handleMediaProviderDisconnect(),
        (this._provider = e),
        this._providerContext.value.set(e),
        E(this._provider._store, this._store),
        this._attachMediaEventListeners(),
        e.attachMediaController(this, (e) => this._disconnectDisposal.add(e)),
        this._flushMediaProviderConnectedQueue(),
        t(this._handleMediaProviderDisconnect.bind(this)));
    }
    _handleMediaProviderDisconnect() {
      P(this.provider) ||
        (this._stopWaiting(),
        this.providerQueue.destroy(),
        this.providerDisposal.empty(),
        (this._provider = void 0),
        this._providerContext.value.set(void 0),
        Me(this._store),
        this._store.viewType.set('unknown'));
    }
    _flushMediaProviderConnectedQueue() {
      (this.providerQueue.start(),
        this.providerDisposal.add(() => {
          this.providerQueue.stop();
        }));
    }
    get store() {
      return this._mediaStoreProvider.value;
    }
    get _store() {
      return this._mediaStoreProvider.value;
    }
    get idleDelay() {
      return this._userIdleController.delay;
    }
    set idleDelay(e) {
      this._userIdleController.delay = e;
    }
    _clearPendingMediaRequests() {
      s(this._pendingMediaRequests).forEach((e) => {
        this._pendingMediaRequests[e] = [];
      });
    }
    _satisfyMediaRequest(e, t) {
      const i = this._pendingMediaRequests[e].shift();
      i && ((t.requestEvent = i), T(t, i));
    }
    _mediaRequestEventGateway(e) {
      return (e.stopPropagation(), !0);
    }
    _createMediaRequestHandler(e, t) {
      return (i) => {
        this._mediaRequestEventGateway(i) &&
          (this._provider
            ? t(i)
            : this.providerQueue.queue(e, () => {
                t(i);
              }));
      };
    }
    _attachMediaEventListeners() {
      if (!this._provider) return;
      const e = {
        'vds-can-load': this._handleCanLoad,
        'vds-load-start': this._handleLoadStart,
        'vds-loaded-data': this._handleLoadedData,
        'vds-loaded-metadata': this._handleLoadedMetadata,
        'vds-can-play': this._handleCanPlay,
        'vds-can-play-through': this._handleCanPlayThrough,
        'vds-current-src-change': this._handleCurrentSrcChange,
        'vds-autoplay': this._handleAutoplay,
        'vds-autoplay-fail': this._handleAutoplayFail,
        'vds-loop-request': this._handleLoopRequest,
        'vds-play': this._handlePlay,
        'vds-play-fail': this._handlePlayFail,
        'vds-playing': this._handlePlaying,
        'vds-pause': this._handlePause,
        'vds-time-update': this._handleTimeUpdate,
        'vds-volume-change': this._handleVolumeChange,
        'vds-seeking': this._handleSeeking,
        'vds-seeked': this._handleSeeked,
        'vds-waiting': this._handleWaiting,
        'vds-ended': this._handleEnded,
        'vds-autoplay-change': this._handleAutoplayChange,
        'vds-error': this._handleError,
        'vds-fullscreen-support-change': this._handleFullscreenSupportChange,
        'vds-poster-change': this._handlePosterChange,
        'vds-loop-change': this._handleLoopChange,
        'vds-playsinline-change': this._handlePlaysinlineChange,
        'vds-controls-change': this._handleControlsChange,
        'vds-media-type-change': this._handleMediaTypeChange,
        'vds-view-type-change': this._handleViewTypeChange,
        'vds-duration-change': this._handleDurationChange,
        'vds-progress': this._handleProgress,
        'vds-src-change': this._handleSrcChange,
      };
      for (const t of s(e)) {
        const i = e[t].bind(this);
        this.providerDisposal.add(f(this._provider, t, i));
      }
    }
    _clearMediaStateTracking() {
      ((this._isReplay = !1),
        (this._isLooping = !1),
        (this._firingWaiting = !1),
        (this._originalWaitingEvent = void 0),
        (this._mediaEvents = []));
    }
    _findLastMediaEvent(e) {
      return this._mediaEvents[this._mediaEvents.map((e) => e.type).lastIndexOf(e)];
    }
    _handleCanLoad(e) {
      (this._store.canLoad.set(!0),
        this._mediaEvents.push(e),
        this._satisfyMediaRequest('loading', e));
    }
    _updateMetadata(e) {
      (this._store.currentSrc.set(e.currentSrc),
        this._store.mediaType.set(e.mediaType),
        this._store.viewType.set(e.viewType));
    }
    _handleLoadStart(e) {
      (this._updateMetadata(e.detail),
        this._mediaEvents.push(e),
        T(e, this._findLastMediaEvent('vds-src-change')),
        T(e, this._findLastMediaEvent('vds-can-load')));
    }
    _handleLoadedData(e) {
      (this._mediaEvents.push(e), T(e, this._findLastMediaEvent('vds-load-start')));
    }
    _handleLoadedMetadata(e) {
      (this._updateMetadata(e.detail),
        this._mediaEvents.push(e),
        T(e, this._findLastMediaEvent('vds-load-start')));
    }
    _handleCanPlay(e) {
      (this._mediaEvents.push(e),
        'loadedmetadata' !== e.triggerEvent?.type &&
          T(e, this._findLastMediaEvent('vds-loaded-metadata')),
        this._store.canPlay.set(!0),
        this._store.duration.set(e.detail.duration),
        this._host.setAttribute('aria-busy', 'false'));
    }
    _handleCanPlayThrough(e) {
      (this._store.canPlay.set(!0),
        this._store.duration.set(e.detail.duration),
        T(e, this._findLastMediaEvent('vds-can-play')));
    }
    _handleAutoplay(e) {
      (this._mediaEvents.push(e),
        T(e, this._findLastMediaEvent('vds-play')),
        T(e, this._findLastMediaEvent('vds-can-play')),
        this._store.autoplayError.set(void 0));
    }
    _handleAutoplayFail(e) {
      (T(e, this._findLastMediaEvent('vds-play-fail')),
        T(e, this._findLastMediaEvent('vds-can-play')),
        this._store.autoplayError.set(e.detail),
        this._clearMediaStateTracking());
    }
    _handlePlay(e) {
      if (!this._isLooping && this.state.paused) {
        if (
          (this._mediaEvents.push(e),
          T(e, this._findLastMediaEvent('vds-waiting')),
          this._satisfyMediaRequest('play', e),
          this._store.paused.set(!1),
          this._store.autoplayError.set(void 0),
          this.state.ended || this._isReplay)
        ) {
          ((this._isReplay = !1), this._store.ended.set(!1));
          const t = g('vds-replay', { triggerEvent: e });
          this._provider?.dispatchEvent(t);
        }
      } else e.stopImmediatePropagation();
    }
    _handlePlayFail(e) {
      (this._mediaEvents.push(e),
        this._stopWaiting(),
        T(e, this._findLastMediaEvent('vds-play')),
        this._store.paused.set(!0),
        this._store.playing.set(!1),
        this._satisfyMediaRequest('play', e),
        this._clearMediaStateTracking());
    }
    _handlePlaying(e) {
      this._mediaEvents.push(e);
      const t = this._findLastMediaEvent('vds-play');
      if (
        (t
          ? (T(e, this._findLastMediaEvent('vds-waiting')), T(e, t))
          : T(e, this._findLastMediaEvent('vds-seeked')),
        this._stopWaiting(),
        this._clearMediaStateTracking(),
        this._store.paused.set(!1),
        this._store.playing.set(!0),
        this._store.seeking.set(!1),
        this._store.ended.set(!1),
        this._isLooping)
      )
        return (e.stopImmediatePropagation(), void (this._isLooping = !1));
      this.state.started ||
        (this._store.started.set(!0),
        this._provider?.dispatchEvent(g('vds-started', { triggerEvent: e })));
    }
    _handlePause(e) {
      this._isLooping
        ? e.stopImmediatePropagation()
        : (T(e, this._findLastMediaEvent('vds-seeked')),
          this._satisfyMediaRequest('pause', e),
          this._store.paused.set(!0),
          this._store.playing.set(!1),
          this._store.seeking.set(!1),
          this._stopWaiting(),
          this._clearMediaStateTracking());
    }
    _handleTimeUpdate(e) {
      const { currentTime: t, played: i } = e.detail;
      (this._store.currentTime.set(t), this._store.played.set(i), this._store.waiting.set(!1));
    }
    _handleVolumeChange(e) {
      (this._store.volume.set(e.detail.volume),
        this._store.muted.set(e.detail.muted || 0 === e.detail.volume),
        this._satisfyMediaRequest('volume', e));
    }
    _handleSeeked(e) {
      this._isSeekingRequestPending
        ? (this._store.seeking.set(!0), e.stopImmediatePropagation())
        : this.state.seeking &&
          (this._mediaEvents.push(e),
          T(e, this._findLastMediaEvent('vds-waiting')),
          T(e, this._findLastMediaEvent('vds-seeking')),
          this.state.paused && this._stopWaiting(),
          this._store.seeking.set(!1),
          e.detail !== this.state.duration && this._store.ended.set(!1),
          this._store.currentTime.set(e.detail),
          this._satisfyMediaRequest('seeked', e));
    }
    _stopWaiting() {
      (this._fireWaiting.cancel(), this._store.waiting.set(!1));
    }
    _handleWaiting(e) {
      this._firingWaiting ||
        (e.stopImmediatePropagation(), (this._originalWaitingEvent = e), this._fireWaiting());
    }
    _handleEnded(e) {
      this._isLooping
        ? e.stopImmediatePropagation()
        : (this._stopWaiting(),
          this._store.paused.set(!0),
          this._store.playing.set(!1),
          this._store.seeking.set(!1),
          this._store.ended.set(!0),
          this._clearMediaStateTracking());
    }
    _handleAutoplayChange(e) {
      this._store.autoplay.set(e.detail);
    }
    _handleCurrentSrcChange(e) {
      (this._store.currentSrc.set(e.detail),
        this._skipInitialSrcChange
          ? (this._skipInitialSrcChange = !1)
          : (this._clearMediaStateTracking(),
            Se(this._store),
            this._host.setAttribute('aria-busy', 'true')));
    }
    _handleError(e) {
      this._store.error.set(e.detail);
    }
    _handleFullscreenSupportChange(e) {
      this._store.canFullscreen.set(e.detail);
    }
    _handlePosterChange(e) {
      this._store.poster.set(e.detail);
    }
    _handleLoopChange(e) {
      this._store.loop.set(e.detail);
    }
    _handlePlaysinlineChange(e) {
      this._store.playsinline.set(e.detail);
    }
    _handleControlsChange(e) {
      this._store.controls.set(e.detail);
    }
    _handleMediaTypeChange(e) {
      this._store.mediaType.set(e.detail);
    }
    _handleDurationChange(e) {
      const t = e.detail;
      this._store.duration.set(isNaN(t) ? 0 : t);
    }
    _handleProgress(e) {
      const { buffered: t, seekable: i } = e.detail,
        s = 0 === t.length ? 0 : t.end(t.length - 1),
        a = 0 === i.length ? 0 : i.end(i.length - 1);
      (this._store.buffered.set(t),
        this._store.bufferedAmount.set(s),
        this._store.seekable.set(i),
        this._store.seekableAmount.set(a));
    }
    _handleSrcChange(e) {
      this._store.src.set(e.detail);
    }
    _handleViewTypeChange(e) {
      this._store.viewType.set(e.detail);
    }
  },
  Ue = class {
    constructor(e, t, i) {
      ((this._host = e),
        (this._store = t),
        (this._mediaProps = i),
        (this._disposal = new o()),
        this._host.addController({
          hostConnected: this._hostConnected.bind(this),
          hostDisconnected: this._hostDisconnected.bind(this),
        }));
    }
    _hostConnected() {
      m(() => {
        for (const e of this._mediaProps) {
          const t = this._store[e];
          if (t) {
            const i = this._getMediaAttrName(e),
              s = t.subscribe((t) => {
                window?.requestAnimationFrame(() => {
                  this._handleValueChange(e, i, t);
                });
              });
            this._disposal.add(s);
          }
        }
      });
    }
    _hostDisconnected() {
      for (const e of this._mediaProps) this._handleDisconnect(e, this._getMediaAttrName(e));
      this._disposal.empty();
    }
    _getMediaAttrName(e) {
      return A(e);
    }
  },
  We = class extends Ue {
    _handleValueChange(e, t, i) {
      window.requestAnimationFrame(() => {
        R(this._host, t, L(i) || n(i) ? String(i) : !!i);
      });
    }
    _handleDisconnect(e, t) {
      this._host.removeAttribute(t);
    }
  };
var Be = class extends Ue {
  _handleValueChange(e, t, i) {
    window.requestAnimationFrame(() => {
      this._host.style.setProperty(this._getCssPropName(t), L(i) || n(i) ? String(i) : null);
    });
  }
  _getCssPropName(e) {
    return `--vds-${e}`;
  }
  _handleDisconnect(e, t) {
    this._host.style.setProperty(this._getCssPropName(t), null);
  }
};
var $e = Symbol('@vidstack/media-discovery'),
  Qe = class extends oe {
    constructor() {
      (super(),
        (this.controller = new Oe(this)),
        (this.__mediaFullscreen = !1),
        (this.__mediaIsVideoView = !1),
        (this.__mediaPlaysinline = !1),
        (this.screenOrientationController = new u(this)),
        (this.fullscreenController = new c(this, this.screenOrientationController)),
        p(this, 'vds-media-connect', { register: $e }),
        Pe(this, 'fullscreen', (e) => {
          this.__mediaFullscreen = e;
        }),
        Pe(this, 'viewType', (e) => {
          this.__mediaIsVideoView = 'video' === e;
        }),
        Pe(this, 'playsinline', (e) => {
          this.__mediaPlaysinline = e;
        }),
        this._bindMediaAttributes(),
        this._bindMediaCSSProperties());
    }
    static get styles() {
      return [
        de`:host{display:inline-block;position:relative;contain:content}:host([hidden]){display:none}`,
      ];
    }
    get provider() {
      return this.controller.provider;
    }
    update(e) {
      (R(this, 'hide-ui', this._shouldHideMediaUI()), super.update(e));
    }
    render() {
      return he`<slot></slot>`;
    }
    get canFullscreen() {
      return this.fullscreenController.isSupported;
    }
    get fullscreen() {
      return this.fullscreenController.isFullscreen;
    }
    get fullscreenOrientation() {
      return this.fullscreenController.screenOrientationLock;
    }
    set fullscreenOrientation(e) {
      const t = this.fullscreenController.screenOrientationLock;
      t !== e &&
        ((this.fullscreenController.screenOrientationLock = e),
        this.requestUpdate('fullscreen-orientation', t));
    }
    enterFullscreen() {
      return this.fullscreenController.enterFullscreen();
    }
    exitFullscreen() {
      return this.fullscreenController.exitFullscreen();
    }
    _bindMediaAttributes() {
      !(function (...e) {
        new We(...e);
      })(this, this.controller.store, [
        'autoplay',
        'autoplayError',
        'canLoad',
        'canPlay',
        'canFullscreen',
        'ended',
        'error',
        'fullscreen',
        'userIdle',
        'loop',
        'mediaType',
        'muted',
        'paused',
        'playing',
        'playsinline',
        'seeking',
        'started',
        'viewType',
        'waiting',
      ]);
    }
    _bindMediaCSSProperties() {
      !(function (...e) {
        new Be(...e);
      })(this, this.controller.store, [
        'bufferedAmount',
        'currentTime',
        'duration',
        'seekableAmount',
      ]);
    }
    _shouldHideMediaUI() {
      return q && this.__mediaIsVideoView && (!this.__mediaPlaysinline || this.__mediaFullscreen);
    }
  };
function je() {
  const e = a(!1),
    t = a(!1);
  return {
    value: a(50),
    pointerValue: a(0),
    min: a(0),
    max: a(100),
    dragging: e,
    pointing: t,
    interactive: D([e, t], ([e, t]) => e || t),
  };
}
(qe([ue()], Qe.prototype, '__mediaFullscreen', 2),
  qe([ue()], Qe.prototype, '__mediaIsVideoView', 2),
  qe([ue()], Qe.prototype, '__mediaPlaysinline', 2),
  qe([le({ attribute: 'fullscreen-orientation' })], Qe.prototype, 'fullscreenOrientation', 1));
var Ke = e(je),
  ze = class {
    constructor(e) {
      e
        ? ((this._target = e), this._createLogger(e), (this._requests = l(e)))
        : (this._requests = new h());
    }
    startLoading(e) {
      this._dispatchRequest('vds-start-loading', { triggerEvent: e });
    }
    play(e) {
      this._dispatchRequest('vds-play-request', { triggerEvent: e });
    }
    pause(e) {
      this._dispatchRequest('vds-pause-request', { triggerEvent: e });
    }
    mute(e) {
      this._dispatchRequest('vds-mute-request', { triggerEvent: e });
    }
    unmute(e) {
      this._dispatchRequest('vds-unmute-request', { triggerEvent: e });
    }
    enterFullscreen(e, t) {
      this._dispatchRequest('vds-enter-fullscreen-request', { triggerEvent: t, detail: e });
    }
    exitFullscreen(e, t) {
      this._dispatchRequest('vds-exit-fullscreen-request', { triggerEvent: t, detail: e });
    }
    seeking(e, t) {
      this._dispatchRequest('vds-seeking-request', { detail: e, triggerEvent: t });
    }
    seek(e, t) {
      this._dispatchRequest('vds-seek-request', { detail: e, triggerEvent: t });
    }
    changeVolume(e, t) {
      this._dispatchRequest('vds-volume-change-request', { detail: e, triggerEvent: t });
    }
    resumeUserIdle(e) {
      this._dispatchRequest('vds-resume-user-idle-request', { triggerEvent: e });
    }
    pauseUserIdle(e) {
      this._dispatchRequest('vds-pause-user-idle-request', { triggerEvent: e });
    }
    showPoster(e) {
      this._dispatchRequest('vds-show-poster-request', { triggerEvent: e });
    }
    hidePoster(e) {
      this._dispatchRequest('vds-hide-poster-request', { triggerEvent: e });
    }
    setTarget(e) {
      this._target !== e &&
        ((this._target = e),
        e ? (this._createLogger(e), this._requests.start()) : this._requests.stop());
    }
    _dispatchRequest(e, t) {
      this._requests.queue(e, () => {
        const i = g(e, { ...t, bubbles: !0, composed: !0 });
        this._target?.dispatchEvent(i);
      });
    }
    _createLogger(e) {}
  },
  Ge = de`*{box-sizing:border-box;touch-action:none}:host{display:block;contain:layout;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}:host([hidden]){display:none}:host(:focus){outline:0}:host(:focus-visible){outline:1px auto Highlight;outline:1px auto -webkit-focus-ring-color}:host(.focus-visible){outline:1px auto Highlight;outline:1px auto -webkit-focus-ring-color}`,
  Xe = ((e) => (
    (e[(e.Left = -1)] = 'Left'),
    (e[(e.ArrowLeft = -1)] = 'ArrowLeft'),
    (e[(e.Up = -1)] = 'Up'),
    (e[(e.ArrowUp = -1)] = 'ArrowUp'),
    (e[(e.Right = 1)] = 'Right'),
    (e[(e.ArrowRight = 1)] = 'ArrowRight'),
    (e[(e.Down = 1)] = 'Down'),
    (e[(e.ArrowDown = 1)] = 'ArrowDown'),
    e
  ))(Xe || {}),
  Je = class extends oe {
    constructor() {
      (super(),
        (this._sliderStoreProvider = Ke.provide(this)),
        (this.disabled = !1),
        (this.value = 50),
        (this._step = 1),
        (this._keyboardStep = 1),
        (this.shiftKeyMultiplier = 5),
        (this.customValueText = !1),
        (this._mediaRemote = new ze(this)),
        (this._disconnectDisposal = new o()),
        (this._handlePointerEnter = M(this, 'pointerenter', () => {
          this.disabled || (this.setAttribute('pointing', ''), this.store.pointing.set(!0));
        })),
        (this._handlePointerMove = M(this, 'pointermove', (e) => {
          if (this.disabled || this.isDragging) return;
          const t = this._getValueBasedOnThumbPosition(e);
          (this.store.pointerValue.set(t), this._dispatchPointerValueChange(e));
        })),
        (this._handlePointerLeave = M(this, 'pointerleave', () => {
          this.disabled || (this.removeAttribute('pointing'), this.store.pointing.set(!1));
        })),
        (this._handlePointerDown = M(this, 'pointerdown', (e) => {
          this.disabled || (this._startDragging(e), this._onDrag(e));
        })),
        (this._handleKeydown = M(this, 'keydown', (e) => {
          if (this.disabled) return;
          const { key: t, shiftKey: i } = e;
          if (!Object.keys(Xe).includes(t)) return;
          const s =
              (i ? this.keyboardStep * this.shiftKeyMultiplier : this.keyboardStep) * Number(Xe[t]),
            a = (this.value + s) / this.step,
            r = this.step * a;
          ((this.value = this._getClampedValue(r)), this._dispatchValueChange(e));
        })),
        (this._handleFillValueChange = M(
          this,
          'vds-slider-value-change',
          this._updateFillCSSProps.bind(this)
        )),
        (this._handlePointerValueChange = M(
          this,
          'vds-slider-pointer-value-change',
          this._updatePointerCSSProps.bind(this)
        )),
        (this._onDrag = x((e) => {
          if (this.disabled || !this.isDragging) return;
          const t = this._getValueBasedOnThumbPosition(e);
          (this.store.pointerValue.set(t), this._dispatchPointerValueChange(e));
        })),
        (this._handleDocumentPointerUp = M(
          this,
          'pointerup',
          (e) => {
            !this.disabled && this.isDragging && this._stopDragging(e);
          },
          { target: document }
        )),
        (this._handleDocumentTouchMove = M(
          this,
          'touchmove',
          (e) => {
            !this.disabled && this.isDragging && e.preventDefault();
          },
          { target: document, passive: !1 }
        )),
        (this._handleDocumentPointerMove = M(
          this,
          'pointermove',
          (e) => {
            !this.disabled && this.isDragging && this._onDrag(e);
          },
          { target: document }
        )),
        (this._lastDispatchedValue = this.value),
        (this._dispatchValueChange = x((e) => {
          this.value !== this._lastDispatchedValue &&
            (this.dispatchEvent(
              g('vds-slider-value-change', { detail: this.value, triggerEvent: e })
            ),
            (this._lastDispatchedValue = this.value));
        })),
        (this._lastDispatchedPointerValue = this.pointerValue),
        (this._dispatchPointerValueChange = x((e) => {
          if (this.pointerValue === this._lastDispatchedPointerValue) return;
          ([
            'vds-slider-pointer-value-change',
            this.isDragging && 'vds-slider-drag-value-change',
          ].forEach((t) => {
            t && this.dispatchEvent(g(t, { detail: this.pointerValue, triggerEvent: e }));
          }),
            (this._lastDispatchedPointerValue = this.pointerValue));
        })),
        V(this));
    }
    static get styles() {
      return [Ge];
    }
    static get parts() {
      return [];
    }
    get store() {
      return this._sliderStoreProvider.value;
    }
    get min() {
      return H(this.store.min);
    }
    set min(e) {
      this.store.min.set(e);
    }
    get max() {
      return H(this.store.max);
    }
    set max(e) {
      this.store.max.set(e);
    }
    get step() {
      return this._step;
    }
    set step(e) {
      this._step = e;
    }
    get keyboardStep() {
      return this._keyboardStep;
    }
    set keyboardStep(e) {
      this._keyboardStep = e;
    }
    get isDragging() {
      return H(this.store.dragging);
    }
    get fillRate() {
      const e = this.max - this.min,
        t = this.value - this.min;
      return e > 0 ? t / e : 0;
    }
    get fillPercent() {
      return 100 * this.fillRate;
    }
    get pointerValue() {
      return H(this.store.pointerValue);
    }
    get pointerRate() {
      const e = this.max - this.min,
        t = this.pointerValue - this.min;
      return e > 0 ? t / e : 0;
    }
    get pointerPercent() {
      return 100 * this.pointerRate;
    }
    connectedCallback() {
      (super.connectedCallback(),
        this._setupAriaAttrs(),
        this._updateFillCSSProps(),
        this._updatePointerCSSProps(),
        this._disconnectDisposal.add(
          this.store.interactive.subscribe((e) => {
            R(this, 'interactive', e);
          })
        ));
    }
    willUpdate(e) {
      ((e.has('value') || e.has('min') || e.has('max')) &&
        ((this.value = this._getClampedValue(this.value)),
        this.store.value.set(this.value),
        this._updateFillCSSProps(),
        this._dispatchValueChange()),
        e.has('disabled') &&
          this.disabled &&
          (this.store.dragging.set(!1),
          this.store.pointing.set(!1),
          this.removeAttribute('dragging'),
          this.removeAttribute('pointing'),
          this.removeAttribute('interactive'),
          R(this, 'aria-disabled', this.disabled)),
        this.customValueText || this._updateAriaValueAttrs(),
        super.willUpdate(e));
    }
    disconnectedCallback() {
      (this._onDrag.cancel(), this._disconnectDisposal.empty(), super.disconnectedCallback());
    }
    _updateFillCSSProps() {
      (F(this, 'fill-value', `${this.value}`),
        F(this, 'fill-rate', `${this.fillRate}`),
        F(this, 'fill-percent', `${this.fillPercent}%`));
    }
    _updatePointerCSSProps() {
      (F(this, 'pointer-value', `${this.pointerValue}`),
        F(this, 'pointer-rate', `${this.pointerRate}`),
        F(this, 'pointer-percent', `${this.pointerPercent}%`));
    }
    render() {
      return this._renderSlider();
    }
    _renderSlider() {
      return he`${this._renderDefaultSlot()}`;
    }
    _renderDefaultSlot() {
      return he`<slot></slot>`;
    }
    _setupAriaAttrs() {
      (I(this, 'role', 'slider'),
        I(this, 'tabindex', '0'),
        I(this, 'aria-orientation', 'horizontal'),
        I(this, 'autocomplete', 'off'));
    }
    _updateAriaValueAttrs() {
      (this.setAttribute('aria-valuemin', this._getValueMin()),
        this.setAttribute('aria-valuenow', this._getValueNow()),
        this.setAttribute('aria-valuemax', this._getValueMax()),
        this.setAttribute('aria-valuetext', this._getValueText()));
    }
    _getValueMin() {
      return String(this.min);
    }
    _getValueNow() {
      return String(this.value);
    }
    _getValueMax() {
      return String(this.max);
    }
    _getValueText() {
      return `${N((this.value / this.max) * 100, 2)}%`;
    }
    _startDragging(e) {
      if (this.isDragging) return;
      (this.store.dragging.set(!0), this.setAttribute('dragging', ''));
      const t = this._getValueBasedOnThumbPosition(e);
      (this.store.pointerValue.set(t),
        this._dispatchPointerValueChange(e),
        this.dispatchEvent(g('vds-slider-drag-start', { triggerEvent: e, detail: this.value })),
        this._mediaRemote.pauseUserIdle(e));
    }
    _stopDragging(e) {
      if (!this.isDragging) return;
      (this.store.dragging.set(!1),
        this._dispatchValueChange.cancel(),
        this.removeAttribute('dragging'));
      const t = this._getValueBasedOnThumbPosition(e);
      ((this.value = t),
        this.store.pointerValue.set(t),
        this._dispatchValueChange(e),
        this._dispatchPointerValueChange(e),
        this.dispatchEvent(g('vds-slider-drag-end', { triggerEvent: e, detail: this.value })),
        this._mediaRemote.resumeUserIdle(e));
    }
    _getClampedValue(e) {
      return y(this.min, N(e, O(this.step)), this.max);
    }
    _getValueFromRate(e) {
      const t = y(0, e, 1),
        i = (this.max - this.min) * t,
        s = Math.round(i / this.step),
        a = this.step * s;
      return this.min + a;
    }
    _getValueBasedOnThumbPosition(e) {
      const t = e.clientX,
        { left: i, width: s } = this.getBoundingClientRect(),
        a = (t - i) / s;
      return this._getValueFromRate(a);
    }
  };
(qe([le({ type: Number })], Je.prototype, 'min', 1),
  qe([le({ type: Number })], Je.prototype, 'max', 1),
  qe([le({ reflect: !0, type: Boolean })], Je.prototype, 'disabled', 2),
  qe([le({ type: Number })], Je.prototype, 'value', 2),
  qe([le({ type: Number })], Je.prototype, 'step', 1),
  qe([le({ attribute: 'keyboard-step', type: Number })], Je.prototype, 'keyboardStep', 1),
  qe(
    [le({ attribute: 'shift-key-multiplier', type: Number })],
    Je.prototype,
    'shiftKeyMultiplier',
    2
  ),
  qe([le({ type: Boolean, attribute: 'custom-value-text' })], Je.prototype, 'customValueText', 2));
var Ye = de``,
  Ze = class extends Je {
    constructor() {
      (super(),
        (this._step = 0.1),
        (this.value = 0),
        (this.valueText = '{currentTime} out of {duration}'),
        (this.pauseWhileDragging = !1),
        (this.seekingRequestThrottle = 100),
        (this.__mediaDuration = 0),
        (this.__mediaPaused = !0),
        (this._handleSliderDragStart = M(this, 'vds-slider-drag-start', (e) => {
          this._togglePlaybackWhileDragging(e);
        })),
        (this._handleSliderValueChange = M(this, 'vds-slider-value-change', (e) => {
          U(e.originEvent) &&
            (this._dispatchSeekingRequest.cancel(), this._mediaRemote.seek(this.value, e));
        })),
        (this._handleSliderDragValueChange = M(this, 'vds-slider-drag-value-change', (e) => {
          this._dispatchSeekingRequest(e);
        })),
        (this._handleSliderDragEnd = M(this, 'vds-slider-drag-end', (e) => {
          (this._dispatchSeekingRequest.cancel(),
            this._mediaRemote.seek(this.value, e),
            this._togglePlaybackWhileDragging(e));
        })),
        (this._dispatchSeekingRequest = k((e) => {
          this._mediaRemote.seeking(this.value, e);
        }, this.seekingRequestThrottle)),
        (this._wasPlayingBeforeDragStart = !1),
        Pe(this, 'currentTime', (e) => {
          this.value = e;
        }),
        Pe(this, 'duration', (e) => {
          ((this.__mediaDuration = e), this.requestUpdate('max'));
        }),
        Pe(this, 'paused', (e) => {
          this.__mediaPaused = e;
        }));
    }
    static get styles() {
      return [super.styles, Ye];
    }
    connectedCallback() {
      (super.connectedCallback(), I(this, 'aria-label', 'Media time'));
    }
    get min() {
      return 0;
    }
    set min(e) {}
    get max() {
      return this.__mediaDuration;
    }
    set max(e) {}
    update(e) {
      (e.has('disabled') && this.disabled && this._dispatchSeekingRequest.cancel(),
        super.update(e));
    }
    disconnectedCallback() {
      (this._dispatchSeekingRequest.cancel(), super.disconnectedCallback());
    }
    _getValueMin() {
      return '0%';
    }
    _getValueNow() {
      return `${Math.round(this.fillPercent)}%`;
    }
    _getValueText() {
      return this.valueText
        .replace('{currentTime}', W(this.value))
        .replace('{duration}', W(this.__mediaDuration));
    }
    _getValueMax() {
      return '100%';
    }
    _togglePlaybackWhileDragging(e) {
      this.pauseWhileDragging &&
        (this.isDragging && !this.__mediaPaused
          ? ((this._wasPlayingBeforeDragStart = !0), this._mediaRemote.pause(e))
          : this._wasPlayingBeforeDragStart &&
            !this.isDragging &&
            this.__mediaPaused &&
            ((this._wasPlayingBeforeDragStart = !1), this._mediaRemote.play(e)));
    }
  };
(qe([le({ attribute: !1, state: !0 })], Ze.prototype, 'value', 2),
  qe([le({ attribute: !1 })], Ze.prototype, 'min', 1),
  qe([le({ attribute: !1 })], Ze.prototype, 'max', 1),
  qe([le({ attribute: 'value-text' })], Ze.prototype, 'valueText', 2),
  qe(
    [le({ attribute: 'pause-while-dragging', type: Boolean })],
    Ze.prototype,
    'pauseWhileDragging',
    2
  ),
  qe(
    [le({ attribute: 'seeking-request-throttle', type: Number })],
    Ze.prototype,
    'seekingRequestThrottle',
    2
  ),
  qe([ue()], Ze.prototype, '__mediaDuration', 2),
  qe([ue()], Ze.prototype, '__mediaPaused', 2));
var et = class extends oe {
  constructor() {
    (super(...arguments),
      (this._disposal = new o()),
      (this._mediaStoreConsumer = ke.consume(this)),
      (this.__seconds = 0),
      (this.type = 'current'),
      (this.showHours = !1),
      (this.padHours = !1),
      (this.remainder = !1));
  }
  static get styles() {
    return [de`:host{display:inline-block;contain:content}:host([hidden]){display:none}`];
  }
  get _mediaStore() {
    return this._mediaStoreConsumer.value;
  }
  connectedCallback() {
    (super.connectedCallback(), this._handleTypeChange());
  }
  update(e) {
    ((e.has('type') || e.has('remainder')) && this._handleTypeChange(), super.update(e));
  }
  disconnectedCallback() {
    (this._disposal.empty(), super.disconnectedCallback());
  }
  render() {
    return he`${this._getFormattedTime()}`;
  }
  _handleTypeChange() {
    this._disposal.empty();
    const e = this._getTypeStore(),
      t = (this.remainder ? this._createRemainderStore(e) : e).subscribe((e) => {
        this.__seconds = e;
      });
    this._disposal.add(t);
  }
  _getTypeStore() {
    switch (this.type) {
      case 'buffered':
        return this._mediaStore.bufferedAmount;
      case 'seekable':
        return this._mediaStore.seekableAmount;
      case 'duration':
        return this._mediaStore.duration;
      default:
        return this._mediaStore.currentTime;
    }
  }
  _createRemainderStore(e) {
    return D([e, this._mediaStore.duration], ([e, t]) => Math.max(0, t - e));
  }
  _getFormattedTime() {
    return B(this.__seconds, this.padHours, this.showHours);
  }
};
(qe([ue()], et.prototype, '__seconds', 2),
  qe([le()], et.prototype, 'type', 2),
  qe([le({ attribute: 'show-hours', type: Boolean })], et.prototype, 'showHours', 2),
  qe([le({ attribute: 'pad-hours', type: Boolean })], et.prototype, 'padHours', 2),
  qe([le({ type: Boolean })], et.prototype, 'remainder', 2));
var tt = class extends Je {
  constructor() {
    (super(),
      (this.value = 100),
      (this._handleSliderValueChange = M(
        this,
        'vds-slider-value-change',
        this._changeVolume.bind(this)
      )),
      (this._handleSliderDragValueChange = M(
        this,
        'vds-slider-drag-value-change',
        this._changeVolume.bind(this)
      )),
      Pe(this, 'volume', (e) => {
        this.value = 100 * e;
      }));
  }
  connectedCallback() {
    (super.connectedCallback(), I(this, 'aria-label', 'Media volume'));
  }
  get min() {
    return 0;
  }
  set min(e) {}
  get max() {
    return 100;
  }
  set max(e) {}
  _changeVolume(e) {
    const t = e.detail,
      i = N(t / 100, 3);
    this._mediaRemote.changeVolume(i, e);
  }
};
(qe([le({ attribute: !1 })], tt.prototype, 'min', 1),
  qe([le({ attribute: !1 })], tt.prototype, 'max', 1),
  qe([le({ attribute: !1, state: !0 })], tt.prototype, 'value', 2));
var it = de`:host{display:table;contain:content;user-select:none;cursor:pointer;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}:host([hidden]){display:none}:host(:focus){outline:0}:host(:focus-visible){outline:1px auto Highlight;outline:1px auto -webkit-focus-ring-color}:host(.focus-visible){outline:1px auto Highlight;outline:1px auto -webkit-focus-ring-color}`,
  st = class extends oe {
    constructor() {
      (super(),
        (this.pressed = !1),
        (this.disabled = !1),
        (this._handleButtonClickCapture = M(
          this,
          'click',
          (e) => {
            this.disabled && (e.preventDefault(), e.stopImmediatePropagation());
          },
          { capture: !0 }
        )),
        V(this),
        ['pointerup', 'keydown'].forEach((e) => {
          M(this, e, (e) => {
            this.disabled || (U(e) && !$(e)) || this._handleButtonClick(e);
          });
        }));
    }
    static get styles() {
      return [it];
    }
    static get parts() {
      return [];
    }
    connectedCallback() {
      (super.connectedCallback(),
        I(this, 'tabindex', '0'),
        I(this, 'role', 'button'),
        this._updateAriaPressedAttr());
    }
    updated(e) {
      e.has('pressed') && this._updateAriaPressedAttr();
    }
    _updateAriaPressedAttr() {
      R(this, 'aria-pressed', this.pressed ? 'true' : 'false');
    }
    render() {
      return this._renderDefaultSlot();
    }
    _renderDefaultSlot() {
      return he`<slot></slot>`;
    }
    _handleButtonClick(e) {
      this.pressed = !this.pressed;
    }
  };
(qe([le({ type: Boolean })], st.prototype, 'pressed', 2),
  qe([le({ type: Boolean, reflect: !0 })], st.prototype, 'disabled', 2));
var at = class extends st {
    constructor() {
      (super(),
        (this._mediaRemote = new ze(this)),
        (this._volume = 1),
        (this._muted = !1),
        Pe(this, 'volume', (e) => {
          ((this._volume = e), this._handleMutedChange());
        }),
        Pe(this, 'muted', (e) => {
          ((this._muted = e), this._handleMutedChange());
        }));
    }
    connectedCallback() {
      (super.connectedCallback(), I(this, 'aria-label', 'Mute'));
    }
    _handleMutedChange() {
      const e = this._muted || 0 === this._volume;
      ((this.pressed = e), R(this, 'muted', e));
    }
    _handleButtonClick(e) {
      this.disabled || (this.pressed ? this._mediaRemote.unmute(e) : this._mediaRemote.mute(e));
    }
  },
  rt = class extends st {
    constructor() {
      (super(),
        (this._mediaRemote = new ze(this)),
        Pe(this, 'paused', (e) => {
          ((this.pressed = !e), R(this, 'paused', e));
        }));
    }
    connectedCallback() {
      (super.connectedCallback(), I(this, 'aria-label', 'Play'));
    }
    _handleButtonClick(e) {
      this.disabled || (this.pressed ? this._mediaRemote.pause(e) : this._mediaRemote.play(e));
    }
  },
  nt = new Set(),
  ot = class extends oe {
    constructor() {
      (super(),
        (this.__canLoad = !1),
        (this._mediaRemoteControl = new ze(this)),
        Pe(this, 'poster', (e) => {
          (window.requestAnimationFrame(() => {
            this.__canLoad || nt.has(e) || (Q(e, 'prefetch'), nt.add(e));
          }),
            (this.__src = e));
        }),
        Pe(this, 'canLoad', (e) => {
          (this._handleCanLoadChange(e), (this.__canLoad = e));
        }));
    }
    static get styles() {
      return [
        de`:host{display:block;contain:content;pointer-events:none;object-fit:cover;box-sizing:border-box}:host([hidden]){display:none}img{display:block;width:100%;height:100%;pointer-events:none;object-fit:inherit;object-position:inherit;user-select:none;-webkit-user-select:none;box-sizing:border-box}`,
      ];
    }
    get src() {
      return this.__src;
    }
    connectedCallback() {
      (super.connectedCallback(), this._mediaRemoteControl.hidePoster());
    }
    disconnectedCallback() {
      (this._mediaRemoteControl.showPoster(),
        super.disconnectedCallback(),
        this._handleCanLoadChange(!1));
    }
    render() {
      return he`<img part="img" src="${ce(this.__canLoad ? this.src : null)}" alt="${ce(this.alt)}" @load="${this._handleImgLoad}" @error="${this._handleImgError}">`;
    }
    _setImgLoadingAttr() {
      (this.removeAttribute('img-error'),
        this.removeAttribute('img-loaded'),
        this.src && this.src.length > 0 && this.setAttribute('img-loading', ''));
    }
    _handleImgLoad() {
      (this.removeAttribute('img-loading'), this.setAttribute('img-loaded', ''));
    }
    _handleImgError() {
      (this.removeAttribute('img-loading'), this.setAttribute('img-error', ''));
    }
    _handleCanLoadChange(e) {
      e
        ? this._setImgLoadingAttr()
        : (this.removeAttribute('img-error'),
          this.removeAttribute('img-loaded'),
          this.removeAttribute('img-loading'));
    }
  };
(qe([ue()], ot.prototype, '__src', 2),
  qe([ue()], ot.prototype, '__canLoad', 2),
  qe([le()], ot.prototype, 'alt', 2));
var ht = class extends oe {
  constructor() {
    (super(...arguments),
      (this._disposal = new o()),
      (this._sliderStoreConsumer = Ke.consume(this)),
      (this.__value = 0),
      (this.type = 'current'),
      (this.showHours = !1),
      (this.padHours = !1),
      (this.decimalPlaces = 2));
  }
  static get styles() {
    return [de`:host{display:inline-block;contain:content}:host([hidden]){display:none}`];
  }
  get _sliderStore() {
    return this._sliderStoreConsumer.value;
  }
  connectedCallback() {
    (super.connectedCallback(), this._handleTypeChange());
  }
  update(e) {
    ((e.has('type') || e.has('format')) && this._handleTypeChange(), super.update(e));
  }
  disconnectedCallback() {
    (this._disposal.empty(), super.disconnectedCallback());
  }
  render() {
    return he`${this._getValueText()}`;
  }
  _handleTypeChange() {
    this._disposal.empty();
    const e = this._sliderStore['current' === this.type ? 'value' : 'pointerValue'],
      t = ('percent' === this.format ? this._createPercentStore(e) : e).subscribe((e) => {
        this.__value = e;
      });
    this._disposal.add(t);
  }
  _createPercentStore(e) {
    return D([e, this._sliderStore.min, this._sliderStore.max], ([e, t, i]) => (e / (i - t)) * 100);
  }
  _getValueText() {
    switch (this.format) {
      case 'percent':
        return this._getPercentFormat();
      case 'time':
        return this._getTimeFormat();
      default:
        return `${this.__value}`;
    }
  }
  _getPercentFormat() {
    return `${N(this.__value, this.decimalPlaces)}%`;
  }
  _getTimeFormat() {
    return B(this.__value, this.padHours, this.showHours);
  }
};
(qe([ue()], ht.prototype, '__value', 2),
  qe([le()], ht.prototype, 'type', 2),
  qe([le()], ht.prototype, 'format', 2),
  qe([le({ attribute: 'show-hours', type: Boolean })], ht.prototype, 'showHours', 2),
  qe([le({ attribute: 'pad-hours', type: Boolean })], ht.prototype, 'padHours', 2),
  qe([le({ attribute: 'decimal-places', type: Number })], ht.prototype, 'decimalPlaces', 2));
var dt = class extends oe {
  constructor() {
    (super(),
      (this._videoRef = pe()),
      (this.__canPlay = !1),
      (this.__hasError = !1),
      r(this, Ke, 'pointerValue', (e) => {
        this._updateCurrentTime(e);
      }));
  }
  static get styles() {
    return [
      de`:host{display:inline-block;contain:content}:host([hidden]){display:none}video{display:block;width:100%;height:auto}`,
    ];
  }
  get videoElement() {
    return this._videoRef.value;
  }
  _updateCurrentTime(e) {
    !this.__hasError &&
      this.__canPlay &&
      this.videoElement.currentTime !== e &&
      (this.videoElement.currentTime = e);
  }
  willUpdate(e) {
    (e.has('src') &&
      ((this.__canPlay = !1),
      (this.__hasError = !1),
      this.removeAttribute('video-can-play'),
      this.removeAttribute('video-error')),
      super.willUpdate(e));
  }
  render() {
    return this._renderVideo();
  }
  _renderVideo() {
    return he`<video part="video" muted playsinline preload="auto" src="${j(this.src)}" @canplay="${this._handleCanPlay}" @error="${this._handleError}" ${_e(this._videoRef)}></video>`;
  }
  async _handleCanPlay(e) {
    ((this.__canPlay = !0), this.setAttribute('video-can-play', ''), K(this, e));
  }
  _handleError(e) {
    ((this.__hasError = !0), this.setAttribute('video-error', ''), K(this, e));
  }
};
(qe([le()], dt.prototype, 'src', 2),
  qe([ue()], dt.prototype, '__canPlay', 2),
  qe([ue()], dt.prototype, '__hasError', 2));
var lt = de`:host{display:block}:host([hidden]){display:none}.container{position:relative;width:100%;height:0;padding-bottom:min(max(var(--vds-aspect-ratio-min-height),var(--vds-aspect-ratio-percent)),var(--vds-aspect-ratio-max-height))}slot{display:block;position:absolute;top:0;left:0;width:100%;height:100%}::slotted(*){--vds-video-width:100%;--vds-video-height:100%;width:100%;height:100%}`,
  ut = class extends oe {
    constructor() {
      (super(...arguments),
        (this.minHeight = '150px'),
        (this.maxHeight = '100vh'),
        (this.ratio = '2/1'));
    }
    static get styles() {
      return [lt];
    }
    get isValidRatio() {
      return !!L(this.ratio) && /\d{1,2}\s*?(?:\/|:)\s*?\d{1,2}/.test(this.ratio);
    }
    render() {
      return he`<div class="container" style="${ge({ '--vds-aspect-ratio-percent': this._getAspectRatioPercent(), '--vds-aspect-ratio-min-height': this.minHeight ?? '150px', '--vds-aspect-ratio-max-height': this.maxHeight ?? '100vh' })}"><slot></slot></div>`;
    }
    _getAspectRatioPercent() {
      if (this.isValidRatio) {
        const [e, t] = this._parseAspectRatio();
        return (t / e) * 100 + '%';
      }
      return '50%';
    }
    _parseAspectRatio() {
      return this.ratio.split(/\s*?(?:\/|:)\s*?/).map(Number);
    }
  };
(qe([le({ attribute: 'min-height' })], ut.prototype, 'minHeight', 2),
  qe([le({ attribute: 'max-height' })], ut.prototype, 'maxHeight', 2),
  qe([le()], ut.prototype, 'ratio', 2));
var ct = /\.(m4a|mp4a|mpga|mp2|mp2a|mp3|m2a|m3a|wav|weba|aac|oga|spx)($|\?)/i,
  pt = /\.(mp4|og[gv]|webm|mov|m4v|avi)($|\?)/i;
var _t = class extends Ae {
  constructor() {
    (super(...arguments),
      (this.preload = 'metadata'),
      (this._timeRAF = void 0),
      (this._hasMediaElementConnected = !1),
      (this._mediaElementDisposal = new o()),
      (this._isMediaWaiting = !1),
      (this._ignoreNextAbortEvent = !1),
      (this._ignoreNextEmptiedEvent = !1));
  }
  get mediaElement() {
    return this._mediaElement;
  }
  disconnectedCallback() {
    ((this._isMediaWaiting = !1), super.disconnectedCallback(), this._cancelTimeUpdates());
  }
  destroy() {
    (this.mediaElement &&
      (this.mediaElement.pause(),
      (this.mediaElement.src = ''),
      (this.mediaElement.innerHTML = ''),
      this.mediaElement.load()),
      super.destroy());
  }
  _cancelTimeUpdates() {
    (n(this._timeRAF) && window.cancelAnimationFrame(this._timeRAF), (this._timeRAF = void 0));
  }
  _requestTimeUpdates() {
    i(this._timeRAF) && this._requestTimeUpdate();
  }
  _requestTimeUpdate() {
    const e = this.mediaElement?.currentTime ?? 0;
    (this.state.currentTime !== e && this._updateCurrentTime(e),
      (this._timeRAF = window.requestAnimationFrame(() => {
        i(this._timeRAF) || this._requestTimeUpdate();
      })));
  }
  _updateCurrentTime(e, t) {
    this.dispatchEvent(
      g('vds-time-update', {
        detail: {
          currentTime: Math.min(e, this.mediaElement?.duration ?? 0),
          played: this.mediaElement.played,
        },
        triggerEvent: t,
      })
    );
  }
  handleDefaultSlotChange() {
    (this._handleMediaElementDisconnect(), this._handleMediaElementConnect());
  }
  get _canMediaElementConnect() {
    return this.canLoad && !P(this.mediaElement) && !this._hasMediaElementConnected;
  }
  _findSlottedMediaElement() {
    const e = z(this)[0];
    (/^(audio|video)$/i.test(e?.tagName ?? ''), (this._mediaElement = e ?? void 0));
  }
  _handleMediaElementConnect() {
    window.requestAnimationFrame(() => {
      if ((this._findSlottedMediaElement(), !this._canMediaElementConnect)) return;
      const e = this.mediaElement;
      (e.hasAttribute('loop') && (this.loop = !0),
        e.removeAttribute('loop'),
        e.removeAttribute('poster'),
        R(e, 'controls', this.controls),
        !this.state.canFullscreen &&
          this.fullscreenController.isSupported &&
          this.dispatchEvent(g('vds-fullscreen-support-change', { detail: this.canFullscreen })),
        this._attachMediaEventListeners(),
        this._observePlaysinline(),
        this._observeMediaSources(),
        this.canLoadPoster &&
          this.poster.length > 0 &&
          e.getAttribute('poster') !== this.poster &&
          e.setAttribute('poster', this.poster),
        this._startPreloadingMedia(),
        (this._hasMediaElementConnected = !0),
        this._disconnectDisposal.add(this._handleMediaElementDisconnect.bind(this)));
    });
  }
  _handleMediaElementDisconnect() {
    (this._cancelTimeUpdates(),
      window.requestAnimationFrame(() => {
        (this._mediaElementDisposal.empty(), (this._mediaElement = void 0));
      }),
      this._hasMediaElementConnected,
      (this._hasMediaElementConnected = !1));
  }
  startLoadingMedia() {
    (super.startLoadingMedia(), this._handleMediaElementConnect());
  }
  _startPreloadingMedia() {
    if (this.state.canPlay) return;
    this.mediaElement.setAttribute('preload', this.preload);
    const e = this.mediaElement.networkState >= 1;
    ((this._ignoreNextAbortEvent = e),
      (this._ignoreNextEmptiedEvent = e),
      this.mediaElement.load(),
      setTimeout(() => {
        ((this._ignoreNextAbortEvent = !1), (this._ignoreNextEmptiedEvent = !1));
      }, 0));
  }
  _observePlaysinline() {
    const e = () => this.mediaElement.hasAttribute('playsinline');
    this._handlePlaysinlineChange(e());
    const t = new MutationObserver(() => this._handlePlaysinlineChange(e()));
    (t.observe(this.mediaElement, { attributeFilter: ['playsinline'] }),
      this._mediaElementDisposal.add(() => t.disconnect()));
  }
  _handlePlaysinlineChange(e) {
    this.dispatchEvent(g('vds-playsinline-change', { detail: e }));
  }
  _observeMediaSources() {
    this._handleSrcChange(this._getMediaSources());
    const e = new MutationObserver(() => this._handleSrcChange(this._getMediaSources()));
    (e.observe(this.mediaElement, { attributeFilter: ['src'], subtree: !0 }),
      this._mediaElementDisposal.add(() => e.disconnect()));
  }
  _handleSrcChange(e) {
    const t = this.state.src;
    G(t, e) || this.dispatchEvent(g('vds-src-change', { detail: e }));
  }
  _getMediaSources() {
    const e = [
      this.mediaElement?.src,
      ...Array.from(this.mediaElement?.querySelectorAll('source') ?? []).map((e) => e.src),
    ].filter(Boolean);
    return Array.from(new Set(e));
  }
  _getMediaMetadata() {
    return {
      src: this.state.src,
      currentSrc: this.mediaElement.currentSrc,
      duration: this.mediaElement.duration || 0,
      poster: this.mediaElement.poster,
      mediaType: this._getMediaType(),
      viewType: this.state.viewType,
    };
  }
  _attachMediaEventListeners() {
    if (P(this.mediaElement)) return;
    const e = {
      abort: this._handleAbort,
      canplay: this._handleCanPlay,
      canplaythrough: this._handleCanPlayThrough,
      durationchange: this._handleDurationChange,
      emptied: this._handleEmptied,
      ended: this._handleEnded,
      error: this._handleError,
      loadeddata: this._handleLoadedData,
      loadedmetadata: this._handleLoadedMetadata,
      loadstart: this._handleLoadStart,
      pause: this._handlePause,
      play: this._handlePlay,
      playing: this._handlePlaying,
      progress: this._handleProgress,
      ratechange: this._handleRateChange,
      seeked: this._handleSeeked,
      seeking: this._handleSeeking,
      stalled: this._handleStalled,
      suspend: this._handleSuspend,
      volumechange: this._handleVolumeChange,
      waiting: this._handleWaiting,
    };
    s(e).forEach((t) => {
      const i = e[t].bind(this),
        s = f(this.mediaElement, t, async (e) => {
          await i(e);
        });
      this._mediaElementDisposal.add(s);
    });
  }
  _handleAbort(e) {
    this._ignoreNextAbortEvent ||
      (this.dispatchEvent(g('vds-abort', { triggerEvent: e })),
      this._handleCurrentSrcChange('', e));
  }
  _handleCanPlay(e) {
    this._handleMediaReady({ event: e, duration: this.mediaElement.duration });
  }
  _handleCanPlayThrough(e) {
    this.state.started ||
      this.dispatchEvent(
        g('vds-can-play-through', {
          triggerEvent: e,
          detail: { duration: this.mediaElement.duration },
        })
      );
  }
  _handleLoadStart(e) {
    (this._handleCurrentSrcChange(this.mediaElement.currentSrc, e),
      '' !== this.mediaElement.currentSrc
        ? this.dispatchEvent(
            g('vds-load-start', { triggerEvent: e, detail: this._getMediaMetadata() })
          )
        : this._handleAbort());
  }
  _handleEmptied(e) {
    this._ignoreNextEmptiedEvent || this.dispatchEvent(g('vds-emptied', { triggerEvent: e }));
  }
  _handleLoadedData(e) {
    this.dispatchEvent(g('vds-loaded-data', { triggerEvent: e }));
  }
  _handleLoadedMetadata(e) {
    (this.dispatchEvent(
      g('vds-volume-change', {
        detail: { volume: this.mediaElement.volume, muted: this.mediaElement.muted },
      })
    ),
      this.dispatchEvent(
        g('vds-loaded-metadata', { triggerEvent: e, detail: this._getMediaMetadata() })
      ));
  }
  _determineMediaType(e) {
    this.dispatchEvent(
      g('vds-media-type-change', { detail: this._getMediaType(), triggerEvent: e })
    );
  }
  _handlePlay(e) {
    const t = g('vds-play', { triggerEvent: e });
    ((t.autoplay = this._attemptingAutoplay), this.dispatchEvent(t));
  }
  _handlePause(e) {
    (1 !== this.mediaElement.readyState || this._isMediaWaiting) &&
      ((this._isMediaWaiting = !1),
      this._cancelTimeUpdates(),
      this.dispatchEvent(g('vds-pause', { triggerEvent: e })));
  }
  _handlePlaying(e) {
    this._isMediaWaiting = !1;
    const t = g('vds-playing', { triggerEvent: e });
    (this.dispatchEvent(t), this._requestTimeUpdates());
  }
  _handleDurationChange(e) {
    (this.mediaElement.ended && this._updateCurrentTime(this.mediaElement.duration, e),
      this.dispatchEvent(
        g('vds-duration-change', { detail: this.mediaElement.duration, triggerEvent: e })
      ));
  }
  _handleProgress(e) {
    this.dispatchEvent(
      g('vds-progress', {
        triggerEvent: e,
        detail: { buffered: this.mediaElement.buffered, seekable: this.mediaElement.seekable },
      })
    );
  }
  _handleRateChange(e) {
    throw Error('Not implemented');
  }
  _handleSeeking(e) {
    this.dispatchEvent(
      g('vds-seeking', { detail: this.mediaElement.currentTime, triggerEvent: e })
    );
  }
  _handleSeeked(e) {
    const t = g('vds-seeked', { detail: this.mediaElement.currentTime, triggerEvent: e });
    this.dispatchEvent(t);
    const i = this.mediaElement.currentTime;
    if (
      Math.trunc(i) === Math.trunc(this.mediaElement.duration) &&
      O(this.mediaElement.duration) > O(i) &&
      (this._updateCurrentTime(this.mediaElement.duration, e), !this.mediaElement.ended)
    )
      try {
        this.play();
      } catch (e) {}
  }
  _handleStalled(e) {
    (this.dispatchEvent(g('vds-stalled', { triggerEvent: e })),
      this.mediaElement.readyState < 3 &&
        ((this._isMediaWaiting = !0), this.dispatchEvent(g('vds-waiting', { triggerEvent: e }))));
  }
  _handleVolumeChange(e) {
    this.dispatchEvent(
      g('vds-volume-change', {
        detail: { volume: this.mediaElement.volume, muted: this.mediaElement.muted },
        triggerEvent: e,
      })
    );
  }
  _handleWaiting(e) {
    this.mediaElement.readyState < 3 &&
      ((this._isMediaWaiting = !0), this.dispatchEvent(g('vds-waiting', { triggerEvent: e })));
  }
  _handleSuspend(e) {
    const t = g('vds-suspend', { triggerEvent: e });
    this.dispatchEvent(t);
  }
  _handleEnded(e) {
    (this._cancelTimeUpdates(), this._updateCurrentTime(this.mediaElement.duration, e));
    const t = g('vds-end', { triggerEvent: e });
    (this.dispatchEvent(t),
      this.state.loop
        ? this._handleLoop()
        : this.dispatchEvent(g('vds-ended', { triggerEvent: e })));
  }
  _handleLoop() {
    (P(this.controls) && (this.mediaElement.controls = !1),
      this.dispatchEvent(g('vds-loop-request')));
  }
  _handleError(e) {
    const t = this.mediaElement.error;
    t &&
      this.dispatchEvent(
        g('vds-error', {
          detail: { message: t.message, code: t.code, mediaError: t },
          triggerEvent: e,
        })
      );
  }
  _getPaused() {
    return this.mediaElement?.paused ?? !0;
  }
  _getVolume() {
    return this.mediaElement?.volume ?? 1;
  }
  _setVolume(e) {
    this.mediaElement.volume = e;
  }
  _getCurrentTime() {
    return this.mediaElement?.currentTime ?? 0;
  }
  _setCurrentTime(e) {
    this.mediaElement.currentTime !== e && (this.mediaElement.currentTime = e);
  }
  _getMuted() {
    return this.mediaElement?.muted ?? !1;
  }
  _setMuted(e) {
    this.mediaElement.muted = e;
  }
  async play() {
    try {
      return (
        this._throwIfNotReadyForPlayback(),
        await this._resetPlaybackIfEnded(),
        this.mediaElement?.play()
      );
    } catch (e) {
      const t = g('vds-play-fail');
      throw ((t.autoplay = this._attemptingAutoplay), (t.error = e), e);
    }
  }
  async pause() {
    return this.mediaElement?.pause();
  }
  _getMediaType() {
    return ((e = this.state.currentSrc), ct.test(e) ? 'audio' : pt.test(e) ? 'video' : 'unknown');
    var e;
  }
};
qe([le()], _t.prototype, 'preload', 2);
var gt = class extends _t {
    static get styles() {
      return [de`:host{display:inline-block}:host([hidden]){display:none}`];
    }
    connectedCallback() {
      (super.connectedCallback(),
        this.dispatchEvent(g('vds-view-type-change', { detail: 'audio' })));
    }
  },
  mt = class extends st {
    constructor() {
      (super(),
        (this._mediaRemote = new ze(this)),
        Pe(this, 'fullscreen', (e) => {
          ((this.pressed = e), R(this, 'fullscreen', e));
        }),
        Pe(this, 'canFullscreen', (e) => {
          R(this, 'hidden', !e);
        }));
    }
    connectedCallback() {
      (super.connectedCallback(), I(this, 'aria-label', 'Fullscreen'));
    }
    _handleButtonClick(e) {
      this.disabled ||
        (this.pressed
          ? this._mediaRemote.exitFullscreen(this.target, e)
          : this._mediaRemote.enterFullscreen(this.target, e));
    }
  };
qe([le({ attribute: 'target' })], mt.prototype, 'target', 2);
var vt = new Map(),
  yt = class extends oe {
    constructor() {
      (super(),
        (this._isUserIdle = !1),
        (this._disposal = new o()),
        (this.repeat = 0),
        (this.priority = 10),
        (this.whileIdle = !1),
        (this._mediaCurrentTime = 0),
        (this._currentToggleState = !1),
        (this._mediaStoreConsumer = ke.consume(this)),
        X(this, Ie, (e) => {
          this._mediaProviderElement = e;
        }),
        Pe(
          this,
          'userIdle',
          C((e) => {
            this._isUserIdle = e;
          }, 300)
        ));
    }
    static get styles() {
      return [
        de`:host{display:block;contain:content;z-index:0;opacity:0;visibility:hidden;pointer-events:none!important}:host([hidden]){display:none}`,
      ];
    }
    get _pendingActions() {
      return this._mediaProviderElement ? vt.get(this._mediaProviderElement) : void 0;
    }
    get _pendingAction() {
      return this._pendingActions?.get(this);
    }
    connectedCallback() {
      (super.connectedCallback(),
        window.requestAnimationFrame(() => {
          this._mediaProviderElement && vt.set(this._mediaProviderElement, new Map());
        }));
    }
    willUpdate(e) {
      (this._attachListener(),
        this._subscribeToToggleStore(),
        this._subscribeToSeekStore(),
        super.willUpdate(e));
    }
    disconnectedCallback() {
      (this._disposal.empty(),
        this._pendingAction?.[1].resolve(),
        this._pendingActions?.delete(this),
        super.disconnectedCallback());
    }
    performAction(e) {
      if (!this.action) return;
      let t,
        i = this.action;
      (this.action.startsWith('toggle:') && (i = this._getToggleEventType()),
        this.action.startsWith('seek:') &&
          ((i = 'seek'), (t = this._mediaCurrentTime + Number(this.action.split(':')[1]))),
        this.dispatchEvent(
          g(`vds-${i}-request`, { bubbles: !0, composed: !0, detail: t, triggerEvent: e })
        ));
    }
    _attachListener() {
      if ((this._disposal.empty(), !this._mediaProviderElement || !this.type || !this.action))
        return;
      let e,
        t = 0;
      const i = (i = !1) => {
          ((t += 1),
            window.clearTimeout(e),
            (e = window.setTimeout(() => {
              const e = this._pendingAction?.[1];
              (i && this._pendingActions?.delete(this),
                (async function (e) {
                  if (Et.has(e)) return;
                  const t = vt.get(e);
                  if (!t) return;
                  Et.add(e);
                  const i = Array.from(t.values()).map((e) => e[1].promise);
                  await Promise.all(i);
                  const s = Array.from(t.keys()),
                    a = Math.min(...s.map((e) => e.priority));
                  (s
                    .filter((e) => e.priority <= a)
                    .map((e) => {
                      const i = t.get(e)[0];
                      e.performAction(i);
                    }),
                    t.clear(),
                    Et.delete(e));
                })(this._mediaProviderElement),
                (t = 0),
                e?.resolve());
            }, 200)));
        },
        s = f(this._mediaProviderElement, this.type, (e) => {
          this._validateEvent(e) &&
            (e.preventDefault(),
            0 == t && this._pendingActions?.set(this, [e, J()]),
            i(t < this.repeat));
        });
      this._disposal.add(s);
    }
    _validateEvent(e) {
      if (!this.whileIdle && this._isUserIdle) return !1;
      if (Y(e) || Z(e) || ee(e)) {
        const t = ee(e) ? e.touches[0] : void 0,
          i = t?.clientX ?? e.clientX,
          s = t?.clientY ?? e.clientY,
          a = this.getBoundingClientRect(),
          r = s >= a.top && s <= a.bottom && i >= a.left && i <= a.right;
        return e.type.includes('leave') ? !r : r;
      }
      return !0;
    }
    _subscribeToSeekStore() {
      if (!this.action?.startsWith('seek')) return;
      const e = this._mediaStore.currentTime.subscribe((e) => {
        this._mediaCurrentTime = e;
      });
      this._disposal.add(e);
    }
    get _mediaStore() {
      return this._mediaStoreConsumer.value;
    }
    _getToggleEventType() {
      const e = this.action?.split(':')[1];
      switch (e) {
        case 'paused':
          return this._currentToggleState ? 'play' : 'pause';
        case 'muted':
          return this._currentToggleState ? 'unmute' : 'mute';
        case 'fullscreen':
          return (this._currentToggleState ? 'exit' : 'enter') + '-fullscreen';
        default:
          return '';
      }
    }
    _subscribeToToggleStore() {
      if (!this.action?.startsWith('toggle:')) return;
      const e = this.action.split(':')[1],
        t = this._mediaStore[e]?.subscribe((e) => {
          this._currentToggleState = e;
        });
      t && this._disposal.add(t);
    }
  };
(qe([le()], yt.prototype, 'type', 2),
  qe([le({ type: Number })], yt.prototype, 'repeat', 2),
  qe([le({ type: Number })], yt.prototype, 'priority', 2),
  qe([le()], yt.prototype, 'action', 2),
  qe([le({ type: Boolean, attribute: 'while-idle' })], yt.prototype, 'whileIdle', 2));
var Et = new WeakSet();
var bt = class extends c {
    constructor(e, t, i) {
      (super(e, t), (this._presentationController = i));
    }
    get isFullscreen() {
      return this.isSupportedNatively
        ? this.isNativeFullscreen
        : this._presentationController.isFullscreenMode;
    }
    get isSupported() {
      return this.isSupportedNatively || this.isSupportedOnSafari;
    }
    get isSupportedOnSafari() {
      return this._presentationController.isSupported;
    }
    async _makeEnterFullscreenRequest() {
      return this.isSupportedNatively
        ? super._makeEnterFullscreenRequest()
        : this._makeFullscreenRequestOnSafari();
    }
    async _makeFullscreenRequestOnSafari() {
      return this._presentationController.setPresentationMode('fullscreen');
    }
    async _makeExitFullscreenRequest() {
      return this.isSupportedNatively
        ? super._makeExitFullscreenRequest()
        : this._makeExitFullscreenRequestOnSafari();
    }
    async _makeExitFullscreenRequestOnSafari() {
      return this._presentationController.setPresentationMode('inline');
    }
    _addFullscreenChangeEventListener(e) {
      return this.isSupportedNatively
        ? super._addFullscreenChangeEventListener(e)
        : this.isSupportedOnSafari
          ? f(
              this._host,
              'vds-video-presentation-change',
              this._handlePresentationModeChange.bind(this)
            )
          : te;
    }
    _handlePresentationModeChange(e) {
      this._handleFullscreenChange(e);
    }
    _addFullscreenErrorEventListener(e) {
      return this.isSupportedNatively ? super._addFullscreenErrorEventListener(e) : te;
    }
  },
  ft = class {
    constructor(e) {
      ((this._host = e), (this._logger = void 0), (this._listenerDisposal = new o()));
      const t = e.firstUpdated;
      ((e.firstUpdated = (i) => {
        (t?.call(e, i), this._listenerDisposal.add(this._addPresentationModeChangeEventListener()));
      }),
        e.addController({ hostDisconnected: this._handleHostDisconnected.bind(this) }));
    }
    _handleHostDisconnected() {
      (this.setPresentationMode('inline'), this._listenerDisposal.empty());
    }
    get presentationMode() {
      return this._host.videoElement?.webkitPresentationMode;
    }
    get isInlineMode() {
      return 'inline' === this.presentationMode;
    }
    get isPictureInPictureMode() {
      return 'inline' === this.presentationMode;
    }
    get isFullscreenMode() {
      return 'fullscreen' === this.presentationMode;
    }
    get isSupported() {
      return ie(this._host.videoElement?.webkitSetPresentationMode);
    }
    setPresentationMode(e) {
      this._host.videoElement?.webkitSetPresentationMode?.(e);
    }
    _addPresentationModeChangeEventListener() {
      return !this.isSupported || P(this._host.videoElement)
        ? te
        : f(
            this._host.videoElement,
            'webkitpresentationmodechanged',
            this._handlePresentationModeChange.bind(this)
          );
    }
    _handlePresentationModeChange(e) {
      (K(this._host, e),
        this._host.dispatchEvent(
          g('vds-video-presentation-change', { detail: this.presentationMode, triggerEvent: e })
        ));
    }
  },
  Ct = class extends _t {
    constructor() {
      (super(...arguments),
        (this.presentationController = new ft(this)),
        (this.fullscreenController = new bt(
          this,
          this.screenOrientationController,
          this.presentationController
        )));
    }
    static get styles() {
      return [
        de`:host{display:inline-block;background-color:var(--vds-video-bg-color,#000)}:host([hidden]){display:none}::slotted(video:not([width])){width:var(--vds-video-width,100%)}::slotted(video:not([height])){height:var(--vds-video-height,auto)}`,
      ];
    }
    connectedCallback() {
      (super.connectedCallback(),
        this.dispatchEvent(g('vds-view-type-change', { detail: 'video' })));
    }
    get videoElement() {
      return this.mediaElement;
    }
  },
  wt = new Map();
function St(e) {
  return ne(e.replace('vds-', ''));
}
var Mt = 'vds-hls-',
  kt = ['lib-load', 'instance', 'unsupported'];
function Pt(e) {
  return e.startsWith(Mt) && !kt.some((t) => e.startsWith(`${Mt}${t}`));
}
var Tt = /\.(m3u8)($|\?)/i,
  Rt = new Set([
    'application/vnd.apple.mpegurl',
    'audio/mpegurl',
    'audio/x-mpegurl',
    'application/x-mpegurl',
    'video/x-mpegurl',
    'video/mpegurl',
    'application/mpegurl',
  ]),
  qt = class extends Ct {
    constructor() {
      (super(),
        (this._isHlsEngineAttached = !1),
        (this.hlsConfig = {}),
        (this.hlsLibrary = 'https://cdn.jsdelivr.net/npm/hls.js@^1.0.0/dist/hls.light.min.js'),
        (this._currentHlsSrc = ''),
        (this._hlsEventListeners = []),
        Object.defineProperty(this, 'hls-config', {
          set: (e) => {
            this.hlsConfig = e;
          },
        }),
        Object.defineProperty(this, 'hls-library', {
          set: (e) => {
            this.hlsLibrary = e;
          },
        }));
    }
    get Hls() {
      return this._Hls;
    }
    get hlsEngine() {
      return this._hlsEngine;
    }
    get isHlsEngineAttached() {
      return this._isHlsEngineAttached;
    }
    get currentHlsSrc() {
      return this._currentHlsSrc;
    }
    async update(e) {
      (super.update(e), e.has('hlsLibrary') && se() && this._preconnectToHlsLibDownload());
    }
    destroy() {
      (this._destroyHlsEngine(), super.destroy());
    }
    get isHlsSupported() {
      return this.Hls?.isSupported() ?? se();
    }
    get isHlsStream() {
      return this.state.src.some((e) => Tt.test(e));
    }
    _preconnectToHlsLibDownload() {
      var e;
      this.canLoad ||
        !L(this.hlsLibrary) ||
        ((e = this.hlsLibrary), wt.has(e)) ||
        Q(this.hlsLibrary);
    }
    async _buildHlsEngine(e = !1) {
      if (P(this.videoElement) && !e && !i(this.hlsEngine))
        return void this._logger
          ?.infoGroup('🏗️ Could not build HLS engine')
          .labelledLog('Video Element', this.videoElement)
          .labelledLog('HLS Engine', this.hlsEngine)
          .labelledLog('Force Rebuild Flag', e)
          .dispatch();
      i(this.hlsEngine) || this._destroyHlsEngine();
      const t = {
        onLoadStart: () => {
          this.dispatchEvent(g('vds-hls-lib-load-start'));
        },
        onLoaded: (e) => {
          this.dispatchEvent(g('vds-hls-lib-loaded', { detail: e }));
        },
        onLoadError: (e) => {
          (this.dispatchEvent(g('vds-hls-lib-load-error', { detail: e })),
            this.dispatchEvent(g('vds-error', { detail: { message: e.message, code: 4 } })));
        },
      };
      if (
        ((this._Hls = await (async function (e, t = {}) {
          if (L(e)) {
            if (wt.has(e)) return wt.get(e);
            t.onLoadStart?.();
            try {
              if ((await re.load(e), !ie(window.Hls))) throw Error('');
              const i = window.Hls;
              return (t.onLoaded?.(i), wt.set(e, i), i);
            } catch (e) {
              t.onLoadError?.(e);
            }
          }
        })(this.hlsLibrary, t)),
        i(this._Hls) &&
          !L(this.hlsLibrary) &&
          (this._Hls = await (async function (e, t = {}) {
            if (i(e)) return;
            if ((t.onLoadStart?.(), !ie(e))) return (t.onLoaded?.(e), e);
            const s = String(e);
            if (wt.has(s)) {
              const e = wt.get(s);
              return (t.onLoaded?.(e), e);
            }
            try {
              const i = (await e())?.default;
              if (!i || !i.isSupported) throw Error('');
              return (t.onLoaded?.(i), wt.set(s, i), i);
            } catch (e) {
              t.onLoadError?.(e);
            }
          })(this.hlsLibrary, t)),
        this.Hls)
      ) {
        if (!this.Hls?.isSupported?.()) {
          const e = '[vds]: `hls.js` is not supported in this environment';
          return (
            this.dispatchEvent(g('vds-hls-unsupported')),
            void this.dispatchEvent(g('vds-error', { detail: { message: e, code: 4 } }))
          );
        }
        ((this._hlsEngine = new this.Hls(this.hlsConfig)),
          this.dispatchEvent(g('vds-hls-instance', { detail: this.hlsEngine })),
          this._listenToHlsEngine());
      }
    }
    _attachHlsEngine() {
      this.isHlsEngineAttached ||
        i(this.hlsEngine) ||
        P(this.videoElement) ||
        (this.hlsEngine.attachMedia(this.videoElement), (this._isHlsEngineAttached = !0));
    }
    _detachHlsEngine() {
      this.isHlsEngineAttached &&
        (this.hlsEngine?.detachMedia(),
        (this._isHlsEngineAttached = !1),
        (this._currentHlsSrc = ''));
    }
    _loadSrcOnHlsEngine(e) {
      !P(this.hlsEngine) &&
        this.isHlsStream &&
        e !== this._currentHlsSrc &&
        (this.hlsEngine.loadSource(e), (this._currentHlsSrc = e));
    }
    _getMediaType() {
      return 'live-video' === this.state.mediaType
        ? 'live-video'
        : this.isHlsStream
          ? 'video'
          : super._getMediaType();
    }
    _destroyHlsEngine() {
      (this._hlsEngine?.destroy(),
        (this._currentHlsSrc = ''),
        (this._hlsEngine = void 0),
        (this._isHlsEngineAttached = !1));
    }
    _handleSrcChange(e) {
      (this._currentHlsSrc.length > 0 &&
        !e.includes(this._currentHlsSrc) &&
        e.push(this._currentHlsSrc),
        super._handleSrcChange(e));
    }
    _handleAbort(e) {
      if (this.isHlsSupported)
        for (const e of this.state.src) if (Tt.test(e)) return void this._handleHlsSrcChange(e);
      super._handleAbort(e);
    }
    async _handleHlsSrcChange(e) {
      this._currentHlsSrc !== e &&
        this.hasUpdated &&
        this.canLoad &&
        (this.isHlsStream
          ? P(this.hlsLibrary) ||
            (i(this.hlsEngine) && (await this._buildHlsEngine()),
            this._attachHlsEngine(),
            this._loadSrcOnHlsEngine(e))
          : this._detachHlsEngine());
    }
    _handleLoadedMetadata(e) {
      (super._handleLoadedMetadata(e),
        this._handleMediaReady({ event: e, duration: this.mediaElement.duration }));
    }
    _listenToHlsEngine() {
      i(this.hlsEngine) ||
        i(this.Hls) ||
        (this.hlsEngine.on(this.Hls.Events.LEVEL_LOADED, this._handleHlsLevelLoaded.bind(this)),
        this._hlsEventListeners.forEach(({ type: e, listener: t, options: i }) => {
          this.hlsEngine?.[i?.once ? 'once' : 'on'](e, t, i?.context);
        }),
        this.hlsEngine.on(this.Hls.Events.ERROR, this._handleHlsError.bind(this)));
    }
    _handleHlsError(e, t) {
      if (!i(this.Hls) && t.fatal)
        switch (t.type) {
          case 'networkError':
            this._handleHlsNetworkError();
            break;
          case 'mediaError':
            this._handleHlsMediaError();
            break;
          default:
            this._handleHlsIrrecoverableError();
        }
    }
    _handleHlsNetworkError() {
      this.hlsEngine?.startLoad();
    }
    _handleHlsMediaError() {
      this.hlsEngine?.recoverMediaError();
    }
    _handleHlsIrrecoverableError() {
      this._destroyHlsEngine();
    }
    _handleHlsLevelLoaded(e, t) {
      this.state.canPlay || this._handleHlsMediaReady(e, t);
    }
    _handleHlsMediaReady(e, t) {
      const { live: i, totalduration: s } = t.details,
        a = new ae(e, { detail: t }),
        r = i ? 'live-video' : 'video';
      (this.state.mediaType !== r &&
        this.dispatchEvent(g('vds-media-type-change', { detail: r, triggerEvent: a })),
        this.state.duration !== s &&
          this.dispatchEvent(g('vds-duration-change', { detail: s, triggerEvent: a })));
    }
    addEventListener(e, t, i) {
      if (!Pt(e)) return super.addEventListener(e, t, i);
      {
        const s = St(e);
        this._hlsEventListeners.some((e) => e.type === s && e.listener === t) ||
          (this._hlsEventListeners.push({ type: s, listener: t, options: i }),
          this.hlsEngine?.[i?.once ? 'once' : 'on'](s, t, i?.context));
      }
    }
    removeEventListener(e, t, i) {
      if (Pt(e)) {
        const s = St(e);
        return (
          (this._hlsEventListeners = this._hlsEventListeners.filter(
            (e) => e.type === s && e.listener === t
          )),
          void this.hlsEngine?.off(s, t, i?.context, i?.once)
        );
      }
      return super.removeEventListener(e, t, i);
    }
  };
function Lt(e, t, i) {
  b(e, Le, (e, s) => {
    const a = f(e, t, i);
    s(() => {
      a?.();
    });
  });
}
(qe([le({ type: Object, attribute: 'hls-config' })], qt.prototype, 'hlsConfig', 2),
  qe([le({ attribute: 'hls-library' })], qt.prototype, 'hlsLibrary', 2));
var At = ((e) => (
  (e[(e.Aborted = 1)] = 'Aborted'),
  (e[(e.Network = 2)] = 'Network'),
  (e[(e.Decode = 3)] = 'Decode'),
  (e[(e.SrcNotSupported = 4)] = 'SrcNotSupported'),
  e
))(At || {});
export {
  ct as AUDIO_EXTENSIONS,
  ut as AspectRatioElement,
  gt as AudioElement,
  mt as FullscreenButtonElement,
  yt as GestureElement,
  Tt as HLS_EXTENSIONS,
  Rt as HLS_TYPES,
  qt as HlsElement,
  _t as Html5MediaElement,
  fe as MEDIA_STORE_DEFAULTS,
  Oe as MediaController,
  Qe as MediaElement,
  At as MediaErrorCode,
  Ae as MediaProviderElement,
  ze as MediaRemoteControl,
  He as MediaSyncElement,
  me as MediaType,
  Fe as MediaVisibilityElement,
  at as MuteButtonElement,
  rt as PlayButtonElement,
  ot as PosterElement,
  Je as SliderElement,
  Xe as SliderKeyDirection,
  ht as SliderValueTextElement,
  dt as SliderVideoElement,
  et as TimeElement,
  Ze as TimeSliderElement,
  st as ToggleButtonElement,
  Ne as UserIdleController,
  pt as VIDEO_EXTENSIONS,
  Ct as VideoElement,
  bt as VideoFullscreenController,
  ft as VideoPresentationController,
  ve as ViewType,
  tt as VolumeSliderElement,
  Ce as createMediaStore,
  je as createSliderStore,
  $e as mediaDiscoveryId,
  Lt as mediaEventListener,
  Le as mediaProviderDiscoveryId,
  Ie as mediaProviderElementContext,
  ke as mediaStoreContext,
  Pe as mediaStoreSubscription,
  Me as resetMediaStore,
  Ke as sliderStoreContext,
  Se as softResetMediaStore,
};
export default null;
//# sourceMappingURL=/sm/6709b23cbc9c90efba558a37cbbbcb93cb1dd8d5ddf76b3bf65885e5d5ad356f.map
