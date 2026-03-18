/**
 * Video Player Component (Vidstack, Shared Utility)
 * Lazy-loads Vidstack player + CSS; wires data-attribute controls to <video-source-player> nodes.
 * Not global: import only on pages that render these players.
 *
 * Quick start:
 * 1) Import: import { initVideoPlayer, cleanupVideoPlayer } from '../components/videoPlayer';
 *    - Optional: initVideoPlayer({ eager: true }) to load immediately (default waits for first user interaction).
 * 2) Markup example:
 *    <video-source-player id="hero-video"
 *      data-src="https://cdn.example.com/video.mp4"
 *      data-provider="file|youtube|vimeo (auto-detected)"
 *      data-title="Hero Reel"
 *      data-poster="/images/hero.jpg"
 *      data-load="play|visible|eager"
 *      data-poster-load="visible|play"
 *      data-subtitles="true"
 *      data-subtitle-src="/subs/hero.vtt"
 *      data-subtitle-label="English"
 *      data-subtitle-lang="en">
 *    </video-source-player>
 *    <button data-video-play="hero-video">Play</button>
 *    <button data-video-pause="hero-video">Pause</button>
 *    <button data-video-toggle="hero-video">Toggle</button>
 *    <!-- Optional inline control inside player -->
 *    <button data-play-icon>▶</button>
 *
 * Common attributes on <video-source-player>:
 * - data-src (required) video URL; provider auto-detected, override with data-provider.
 * - data-title / data-poster / data-video-poster (fallback fetch) / data-aspect-ratio.
 * - data-load: play (default), visible, or eager. data-poster-load: visible (default) or play.
 * - Subtitle helpers: data-subtitles (set to false to disable), data-subtitle-src|data-subtitle,
 *   data-subtitle-label, data-subtitle-lang, data-subtitle-kind, data-subtitle-default.
 * - Media session metadata: data-artist, data-album, data-artwork, data-media-session JSON.
 *
 * Notes:
 * - Listeners attach on first scroll/move/touch unless eager=true.
 * - IntersectionObserver preloads posters/players near viewport; Escape pauses all players.
 * - Call cleanupVideoPlayer() to remove listeners before page teardown.
 */

import { handleError } from '../utils/helpers';
import { logger } from '../utils/logger';

const VIDEO_EVENTS = ['scroll', 'mousemove', 'touchstart', 'pointerdown'];
const VIDSTACK_MODULE_URL = 'https://cdn.vidstack.io/player';
const VIDSTACK_STYLE_URLS = [
  'https://cdn.vidstack.io/player/theme.css',
  'https://cdn.vidstack.io/player/video.css',
];

let bootstrapAttached = false;
let videoScriptInitialized = false;
let escKeydownHandler = null;

syncWindowInitFlag(videoScriptInitialized);

/**
 * Initialize the shared video player script.
 * @param {Object} options
 * @param {boolean} [options.eager=false] - Immediately run the script instead of waiting for interaction.
 */
export function initVideoPlayer(options = {}) {
  if (!canUseDOM()) {
    return;
  }

  const { eager = false } = options;

  if (!bootstrapAttached) {
    addBootstrapListeners();
  }

  if (eager) {
    initVideoScript();
  }
}

/**
 * Cleanup bootstrap listeners so the script can be reinitialized if needed.
 */
export function cleanupVideoPlayer() {
  if (!canUseDOM()) {
    return;
  }

  cleanupVideoListeners();
  cleanupEscKeyListener();
  bootstrapAttached = false;
  setVideoScriptInitialized(false);
}

function initVideoScript() {
  if (!canUseDOM()) {
    return;
  }

  if (videoScriptInitialized) {
    logger.log('♻️ Video player script already initialized – refreshing listeners.');
    cleanupVideoListeners();
    return;
  }

  setVideoScriptInitialized(true);
  cleanupVideoListeners();
  logger.log('🎬 Video player script initializing...');

  const videoPlayers = document.querySelectorAll('video-source-player');
  if (!videoPlayers.length) {
    logger.warn('🎬 Video player script initialized but no <video-source-player> elements found.');
    return;
  }
  logger.log(`🎬 Found ${videoPlayers.length} <video-source-player> element(s).`);

  const playerMap = new Map();
  const ctrlMap = new WeakMap();
  const remoteMap = new WeakMap();
  let vidstackReady = null;
  let stylesLoaded = false;
  let readyIO = null;
  let posterIO = null;
  let posterFetchIO = null;
  let posterStartIO = null;
  const posterCache = new Map();
  const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  const subtitleTrackCache = new WeakMap();
  const DEFAULT_LOAD_STRATEGY = 'play';
  const DEFAULT_POSTER_LOAD_STRATEGY = 'visible';

  const getAttr = (el, n) => (el.getAttribute(n) || '').trim() || undefined;
  const isVideoUrl = (u = '') => /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(u);
  function detectProvider(url) {
    if (!url) return null;
    const u = url.toLowerCase();
    if (u.includes('youtu.be/') || u.includes('youtube.com/')) return 'youtube';
    if (u.includes('vimeo.com/')) return 'vimeo';
    if (/\.(mp4|webm|ogg)(?:[?#]|$)/i.test(u)) return 'file';
    return null;
  }

  const SUBTITLE_DEFAULTS = Object.freeze({
    label: 'English CC',
    lang: 'en',
    kind: 'subtitles',
    defaultEnabled: true,
  });
  const SUBTITLE_DISABLED_VALUES = new Set(['false', '0', 'off', 'no', 'none', 'disabled']);

  const parseBooleanAttr = (value, fallback = true) => {
    if (value === undefined) return fallback;
    return !SUBTITLE_DISABLED_VALUES.has(String(value).toLowerCase());
  };

  const getLoadStrategy = (el) => getAttr(el, 'data-load') || DEFAULT_LOAD_STRATEGY;

  const getPosterLoadStrategy = (el) =>
    getAttr(el, 'data-poster-load') || DEFAULT_POSTER_LOAD_STRATEGY;

  function normalizeAspectRatio(value) {
    if (!value) return null;
    if (value.includes('/')) return value;
    if (value.includes(':')) return value.replace(':', ' / ');
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? `${num} / 1` : null;
  }

  async function ensureRemote(el) {
    if (remoteMap.has(el)) return remoteMap.get(el);
    const { MediaRemoteControl } = await preloadVidstack();
    const remote = new MediaRemoteControl(el);
    remoteMap.set(el, remote);
    return remote;
  }

  function dispatchRemote(el, action, ...args) {
    ensureRemote(el)
      .then((remote) => {
        if (typeof remote[action] === 'function') {
          remote[action](...args);
        }
      })
      .catch(() => {
        // ignore remote dispatch errors to avoid disrupting playback requests.
      });
  }

  function parseNumberAttr(value) {
    if (value === undefined) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  function parseArtworkAttr(value, fallbackPoster) {
    if (!value && !fallbackPoster) return undefined;
    if (!value && fallbackPoster) {
      return [
        {
          src: fallbackPoster,
          sizes: '512x512',
          type: 'image/jpeg',
        },
      ];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((src) => ({
          src,
          sizes: '512x512',
        }));
    }
  }

  function buildMediaSessionMetadata(el, title, poster) {
    const json = getAttr(el, 'data-media-session');
    if (json) {
      try {
        const parsed = JSON.parse(json);
        return parsed;
      } catch {
        // ignore parse errors and fall back to discrete attributes.
      }
    }
    const artist = getAttr(el, 'data-artist');
    const album = getAttr(el, 'data-album');
    const artwork = parseArtworkAttr(getAttr(el, 'data-artwork'), poster);
    const metadata = {
      title,
      artist,
      album,
      artwork,
    };
    Object.keys(metadata).forEach((key) => {
      if (metadata[key] === undefined || metadata[key] === '') {
        delete metadata[key];
      }
    });
    return Object.keys(metadata).length ? metadata : undefined;
  }

  const preloadVidstack = () =>
  (vidstackReady ??= import(
    /* webpackIgnore: true */
    /* @vite-ignore */
    VIDSTACK_MODULE_URL
  ));
  function scheduleModuleWarm() {
    const rIC = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
    rIC(() => {
      preloadVidstack();
    });
  }

  const ensureVideoBrandCSS = (() => {
    let injected = false;
    const CSS_TEXT = `
:where(.vds-video-layout) {
    --media-brand: var(--video-brand, var(--secondary--lime)) !important;
}`;
    return () => {
      if (injected) return;
      injected = true;
      const style = document.createElement('style');
      style.setAttribute('data-video-brand-style', 'true');
      style.textContent = CSS_TEXT;
      document.head.appendChild(style);
    };
  })();

  function loadVidstackStylesOnce() {
    if (stylesLoaded) return;
    stylesLoaded = true;
    for (const href of VIDSTACK_STYLE_URLS) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    }
  }

  const primePlayerNode = (() => {
    const primedPlayers = new WeakSet();
    let hoverPreloaded = false;

    const handleFirstHover = () => {
      if (hoverPreloaded) return;
      hoverPreloaded = true;
      preloadVidstack();
    };

    return (playerEl) => {
      if (!playerEl || primedPlayers.has(playerEl)) return;
      primedPlayers.add(playerEl);
      playerEl.style.cursor = 'pointer';

      const onHover = () => {
        handleFirstHover();
        playerEl.removeEventListener('mouseenter', onHover);
      };

      playerEl.addEventListener('mouseenter', onHover, { passive: true });
    };
  })();

  function loadImageOK(url, minW = 1) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img.naturalWidth >= minW);
      img.onerror = () => resolve(false);
      img.referrerPolicy = 'no-referrer';
      img.src = url;
    });
  }
  async function resolveYouTubePoster(src) {
    const m = src.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|watch\?.*?v=))([A-Za-z0-9_-]{11})/
    );
    const id = m && m[1];
    if (!id) return;
    const candidates = [
      `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${id}/sddefault.jpg`,
    ];
    for (const u of candidates) if (await loadImageOK(u, 320)) return u;
  }

  async function resolveVimeoPoster(src) {
    try {
      const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(src)}`, {
        mode: 'cors',
        credentials: 'omit',
      });
      if (!res.ok) return;
      const j = await res.json();
      return j?.thumbnail_url;
    } catch {
      return;
    }
  }
  async function resolvePosterURL(el) {
    const exist = getAttr(el, 'data-poster');
    if (exist) return exist;
    const src = getAttr(el, 'data-src');
    if (!src) return;
    if (posterCache.has(src)) return posterCache.get(src);
    const provider = getAttr(el, 'data-provider') || detectProvider(src);
    const p = async () => {
      if (provider === 'youtube') return await resolveYouTubePoster(src);
      if (provider === 'vimeo') return await resolveVimeoPoster(src);
    };
    const pendingPoster = p();
    posterCache.set(src, pendingPoster);
    return pendingPoster;
  }

  function ensurePlayerWrapperStyles(el) {
    const styles = getComputedStyle(el);
    if (styles.position === 'static') {
      el.style.position = 'relative';
    }
    if (styles.overflow === 'visible') {
      el.style.overflow = 'hidden';
    }
    const ratio = normalizeAspectRatio(getAttr(el, 'data-aspect-ratio'));
    if (ratio && !el.style.aspectRatio) {
      el.style.aspectRatio = ratio;
    }
    if (!el.style.display || el.style.display === 'inline') {
      el.style.display = 'block';
    }
  }

  function mountPlayOverlay(el) {
    let o = el.querySelector(':scope > .vposter-overlay');
    if (!o) {
      o = document.createElement('div');
      o.className = 'vposter-overlay';
      el.appendChild(o);
    }

    Object.assign(o.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Allow clicks on any interactive elements placed in the overlay.
      pointerEvents: 'auto',
      zIndex: '2',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.15))',
    });

    // If a custom play icon element is provided as a direct child of the player,
    // move it into the overlay and use it instead of the default SVG icon.
    const customIconEl = el.querySelector(':scope > [data-play-icon]');
    if (customIconEl && !o.contains(customIconEl)) {
      while (o.firstChild) o.removeChild(o.firstChild);
      o.appendChild(customIconEl);
    }

    // Fallback to the built‑in SVG play icon when no custom play icon is present.
    if (!o.hasChildNodes()) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 64 64');
      svg.setAttribute('width', '64');
      svg.setAttribute('height', '64');
      const gbg = document.createElementNS(svgNS, 'circle');
      gbg.setAttribute('cx', '32');
      gbg.setAttribute('cy', '32');
      gbg.setAttribute('r', '30');
      gbg.setAttribute('fill', 'rgba(0,0,0,0.5)');
      const tri = document.createElementNS(svgNS, 'polygon');
      tri.setAttribute('points', '26,20 48,32 26,44');
      tri.setAttribute('fill', '#fff');
      svg.appendChild(gbg);
      svg.appendChild(tri);
      o.appendChild(svg);
    }
  }

  function ensurePosterStartIO() {
    if (posterStartIO) return posterStartIO;
    posterStartIO = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          posterStartIO.unobserve(el);
          const v = el.querySelector(':scope > video.vposter-video');
          if (v) {
            try {
              v.preload = 'auto';
              await v.play();
            } catch {
              // ignore
            }
          }
        }
      },
      { root: null, rootMargin: '150px 0px', threshold: 0.01 }
    );
    return posterStartIO;
  }

  async function mountPosterVideo(el, url, { force = false } = {}) {
    if (el.querySelector(':scope > video.vposter-video')) return;
    ensurePlayerWrapperStyles(el);
    const v = document.createElement('video');
    v.className = 'vposter-video';
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.autoplay = force;
    v.preload = force ? 'auto' : 'none';
    v.src = url;
    Object.assign(v.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      pointerEvents: 'none',
      display: 'block',
      zIndex: '1',
    });
    el.appendChild(v);
    mountPlayOverlay(el);
    if (force) {
      try {
        await v.play();
      } catch {
        // ignore
      }
    } else {
      ensurePosterStartIO().observe(el);
    }
  }

  async function mountPoster(el, { force = false } = {}) {
    const videoThumb = getAttr(el, 'data-video-poster');
    if (videoThumb && isVideoUrl(videoThumb)) {
      await mountPosterVideo(el, videoThumb, { force });
      return;
    }
    if (el.querySelector(':scope > img.vposter')) return;
    let url = getAttr(el, 'data-poster');
    if (!url) {
      if (!force) return queuePosterFetch(el);
      url = await resolvePosterURL(el);
      if (!url) return;
      el.setAttribute('data-poster', url);
    }
    ensurePlayerWrapperStyles(el);
    const img = document.createElement('img');
    img.className = 'vposter';
    img.src = url;
    img.alt = getAttr(el, 'data-title') || 'Video poster';
    img.decoding = 'async';
    img.loading = force ? 'eager' : 'lazy';
    img.setAttribute('fetchpriority', force ? 'high' : 'low');
    Object.assign(img.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      pointerEvents: 'none',
      display: 'block',
    });
    el.appendChild(img);

    if (!posterIO) {
      posterIO = new IntersectionObserver(
        (entries) => {
          for (const { isIntersecting, target } of entries) {
            if (!isIntersecting) continue;
            const p = target.querySelector(':scope > img.vposter');
            if (p) {
              p.loading = 'eager';
              p.setAttribute('fetchpriority', 'high');
            }
            posterIO.unobserve(target);
          }
        },
        { root: null, rootMargin: '300px 0px', threshold: 0.01 }
      );
    }
    posterIO.observe(el);
    mountPlayOverlay(el);
  }

  function queuePosterFetch(el) {
    if (!posterFetchIO) {
      posterFetchIO = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const node = entry.target;
          posterFetchIO.unobserve(node);
          await mountPoster(node, { force: true });
        }
      });
    }
    posterFetchIO.observe(el);
  }

  function hidePoster(el) {
    const poster = el.querySelector(':scope > img.vposter');
    if (poster) poster.style.display = 'none';
    const vp = el.querySelector(':scope > video.vposter-video');
    if (vp) {
      try {
        vp.pause();
      } catch {
        // ignore
      }
      vp.style.display = 'none';
    }
    const overlay = el.querySelector(':scope > .vposter-overlay');
    if (overlay) overlay.style.display = 'none';
    el.style.backgroundImage = '';
  }

  function hideOverlay(el) {
    const overlay = el.querySelector(':scope > .vposter-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function showPoster(el) {
    const poster = el.querySelector(':scope > img.vposter');
    if (poster) poster.style.display = 'block';
    const vp = el.querySelector(':scope > video.vposter-video');
    if (vp) vp.style.display = 'block';
    const overlay = el.querySelector(':scope > .vposter-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function ctrl(el) {
    let c = ctrlMap.get(el);
    if (!c) {
      c = { intent: 'paused', playSeq: 0 };
      ctrlMap.set(el, c);
    }
    return c;
  }

  async function ensureAttrs(el) {
    const src = getAttr(el, 'data-src');
    if (!src) throw new Error('[Video] data-src is required.');
    const providerAttr = getAttr(el, 'data-provider');
    if (!providerAttr) {
      const provider = detectProvider(src);
      if (!provider) throw new Error('[Video] Could not detect provider.');
      el.setAttribute('data-provider', provider);
    }
  }

  function getVideoMimeType(url) {
    const ext = url.toLowerCase().match(/\.([^.?#]+)(?:[?#]|$)/)?.[1];
    const mimeTypes = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      ogv: 'video/ogg',
      m3u8: 'application/x-mpegURL',
      mpd: 'application/dash+xml',
    };
    return mimeTypes[ext] || 'video/mp4';
  }

  function buildSubtitleTrack(el) {
    if (subtitleTrackCache.has(el)) {
      return subtitleTrackCache.get(el);
    }

    const toggleAttr = getAttr(el, 'data-subtitles');
    if (!parseBooleanAttr(toggleAttr, true)) {
      subtitleTrackCache.set(el, null);
      return null;
    }

    const rawSubtitleAttr = getAttr(el, 'data-subtitle-src') || getAttr(el, 'data-subtitle');
    if (!rawSubtitleAttr) {
      subtitleTrackCache.set(el, null);
      return null;
    }
    const normalizedSubtitle = rawSubtitleAttr.trim();
    if (!normalizedSubtitle) {
      subtitleTrackCache.set(el, null);
      return null;
    }
    if (SUBTITLE_DISABLED_VALUES.has(normalizedSubtitle.toLowerCase())) {
      subtitleTrackCache.set(el, null);
      return null;
    }

    const src = normalizedSubtitle;

    const label = getAttr(el, 'data-subtitle-label') || SUBTITLE_DEFAULTS.label;
    const lang = (getAttr(el, 'data-subtitle-lang') || SUBTITLE_DEFAULTS.lang).toLowerCase();
    const kind = getAttr(el, 'data-subtitle-kind') || SUBTITLE_DEFAULTS.kind;
    const defaultFlag = parseBooleanAttr(
      getAttr(el, 'data-subtitle-default'),
      SUBTITLE_DEFAULTS.defaultEnabled
    );
    const id = getAttr(el, 'data-subtitle-id') || `${el.id || 'video-player'}-cc-track`;

    const trackConfig = {
      id,
      src,
      kind,
      label,
      language: lang,
      lang,
      srclang: lang,
      default: defaultFlag,
    };

    subtitleTrackCache.set(el, trackConfig);
    return trackConfig;
  }

  function hasExistingTextTracks(tracks) {
    if (!tracks) return false;
    if (typeof tracks.length === 'number') return tracks.length > 0;
    if (typeof tracks.size === 'number') return tracks.size > 0;
    if (typeof tracks.toArray === 'function') {
      try {
        return tracks.toArray().length > 0;
      } catch {
        return false;
      }
    }
    return false;
  }

  function ensureSubtitleTrack(player, el, presetTrack) {
    const trackConfig = presetTrack || buildSubtitleTrack(el);
    if (!trackConfig) return;
    const tracksAPI = player?.textTracks;
    if (tracksAPI && typeof tracksAPI.add === 'function') {
      if (
        typeof tracksAPI.getById === 'function' &&
        trackConfig.id &&
        tracksAPI.getById(trackConfig.id)
      )
        return;
      try {
        tracksAPI.add(trackConfig);
      } catch (error) {
        handleError(error, 'Video Subtitle Track');
      }
    }
  }

  function pauseOtherPlayers(activeEl) {
    playerMap.forEach((player, el) => {
      if (el === activeEl) return;
      const state = ctrl(el);
      state.intent = 'paused';
      state.playSeq++;
      dispatchRemote(el, 'pause');
      try {
        player.pause?.();
      } catch {
        // ignore
      }
      el.classList.remove('playing');
    });
  }

  function pauseActivePlayers() {
    playerMap.forEach((player, el) => {
      const state = ctrl(el);
      const isPlaying = state.intent === 'playing' || el.classList.contains('playing');
      if (!isPlaying) return;
      requestPause(el);
    });
  }

  async function initPlayer(el, { autoplay = false } = {}) {
    if (playerMap.has(el)) return playerMap.get(el);
    loadVidstackStylesOnce();
    const { VidstackPlayer, VidstackPlayerLayout } = await preloadVidstack();
    if (!el.id) el.id = `video-player-${Math.random().toString(36).slice(2)}`;

    const srcUrl = getAttr(el, 'data-src');
    const provider = getAttr(el, 'data-provider') || detectProvider(srcUrl);
    const subtitleTrack = buildSubtitleTrack(el);

    let playerSrc = srcUrl;
    if (provider === 'file') {
      playerSrc = {
        src: srcUrl,
        type: getVideoMimeType(srcUrl),
      };
    }

    const title = getAttr(el, 'data-title') || '';
    const poster = getAttr(el, 'data-poster') || '';
    const loadStrategy = getLoadStrategy(el);
    const posterLoadStrategy = getPosterLoadStrategy(el);
    const viewType = getAttr(el, 'data-view-type');
    const streamType = getAttr(el, 'data-stream-type');
    const duration = parseNumberAttr(getAttr(el, 'data-duration'));
    const mediaSession = buildMediaSessionMetadata(el, title, poster);

    const playerOptions = {
      target: `#${el.id}`,
      src: playerSrc,
      title,
      poster,
      playsinline: true,
      autoplay,
      load: loadStrategy,
      posterLoad: posterLoadStrategy,
      layout: new VidstackPlayerLayout({
        captions: {
          visible: false,
        },
      }),
      crossOrigin: true,
    };
    if (viewType) {
      playerOptions.viewType = viewType;
    }
    if (streamType) {
      playerOptions.streamType = streamType;
    }
    if (typeof duration === 'number') {
      playerOptions.duration = duration;
    }
    if (mediaSession) {
      playerOptions.mediaSession = mediaSession;
    }
    if (subtitleTrack) {
      playerOptions.tracks = [subtitleTrack];
    }

    if (provider === 'youtube' || provider === 'vimeo') {
      playerOptions.iframeAttrs = {
        allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
        cc_load_policy: 1,
      };
    }

    const player = await VidstackPlayer.create(playerOptions);
    if (subtitleTrack && !hasExistingTextTracks(player?.textTracks)) {
      ensureSubtitleTrack(player, el, subtitleTrack);
    }
    player.addEventListener('play', () => {
      pauseOtherPlayers(el);
      el.classList.add('playing');
      hidePoster(el);
    });
    player.addEventListener('pause', () => {
      el.classList.remove('playing');
      showPoster(el);
    });
    playerMap.set(el, player);
    logger.log(`🎥 Video player ready: ${el.id} (${provider})`);
    return player;
  }

  function playAfterLoaded(player, el, seq, timeoutMs = 10000) {
    return new Promise((resolve) => {
      const s = ctrl(el);
      if (s.intent !== 'playing' || s.playSeq !== seq) return resolve();
      let done = false;
      const finish = async () => {
        if (done) return;
        done = true;
        cleanup();
        const s2 = ctrl(el);
        if (s2.intent !== 'playing' || s2.playSeq !== seq) return resolve();
        try {
          if (isMobileUA) player.muted = true;
          await player.play();
        } catch {
          try {
            player.muted = true;
            await player.play();
          } catch {
            // ignore
          }
        }
        resolve();
      };
      const cleanup = () => {
        events.forEach((evt) => player.removeEventListener(evt, finish));
        clearTimeout(tid);
      };
      const events = [
        'can-play',
        'can-play-through',
        'ready',
        'loaded-data',
        'loaded-metadata',
        'canplay',
        'canplaythrough',
        'loadeddata',
        'loadedmetadata',
      ];
      events.forEach((evt) => player.addEventListener(evt, finish, { once: true }));
      try {
        if (typeof player.startLoading === 'function') player.startLoading();
        else if (typeof player.load === 'function') player.load();
      } catch {
        // ignore
      }
      const tid = setTimeout(finish, timeoutMs);
    });
  }

  function requestPause(el) {
    const state = ctrl(el);
    state.intent = 'paused';
    state.playSeq++;
    logger.log(`⏸️ Requesting pause for ${el.id || '(unnamed video player)'}`);
    dispatchRemote(el, 'pause');
    try {
      playerMap.get(el)?.pause?.();
    } catch {
      // ignore
    }
  }

  function requestPlay(el, { autoplayOnInit = false, logInitError = false } = {}) {
    pauseOtherPlayers(el);
    hideOverlay(el);
    const state = ctrl(el);
    state.intent = 'playing';
    state.playSeq++;
    logger.log(`▶️ Requesting play for ${el.id || '(unnamed video player)'}`);
    dispatchRemote(el, 'play');
    const existingPlayer = playerMap.get(el);
    if (existingPlayer) {
      playExisting(existingPlayer, el, state.playSeq);
      return;
    }
    initNewPlayer(el, state.playSeq, autoplayOnInit, logInitError);
  }

  function playExisting(player, el, seq) {
    try {
      if (isMobileUA) player.muted = true;
      player.play().catch(() => { });
    } catch {
      // ignore
    }
    playAfterLoaded(player, el, seq);
  }

  function initNewPlayer(el, seq, autoplayOnInit, logInitError) {
    (async () => {
      try {
        await ensureAttrs(el);
        const player = await initPlayer(el, { autoplay: autoplayOnInit });
        if (isMobileUA) player.muted = true;
        if (!autoplayOnInit) {
          player.play().catch(() => { });
          playAfterLoaded(player, el, seq);
        }
      } catch (error) {
        if (logInitError) {
          handleError(error, 'Video Player Init');
        }
      }
    })();
  }

  function idTarget(node, attr) {
    const id = (node?.getAttribute?.(attr) || '').trim();
    return id ? document.getElementById(id[0] === '#' ? id.slice(1) : id) : null;
  }
  async function eagerInitPlayTargets(root = document) {
    const btns = Array.from(root.querySelectorAll('[data-video-play]'));
    if (!btns.length) return;
    const targets = new Set();
    for (const b of btns) {
      const el = idTarget(b, 'data-video-play');
      if (el) targets.add(el);
    }
    for (const el of targets) {
      try {
        await ensureAttrs(el);
        await mountPoster(el, { force: true });
        await initPlayer(el, { autoplay: false });
        el.setAttribute('data-video-state', 'loaded');
      } catch {
        // ignore
      }
    }
  }

  function setupViewportLoader() {
    const nodes = document.querySelectorAll('video-source-player[data-video-state="ready"]');
    if (!nodes.length) return;
    if (!readyIO) {
      readyIO = new IntersectionObserver(
        async (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target;
            readyIO.unobserve(el);
            if (playerMap.has(el)) continue;
            try {
              await ensureAttrs(el);
              await mountPoster(el, { force: true });
              await initPlayer(el, { autoplay: false });
              el.setAttribute('data-video-state', 'loaded');
            } catch {
              // ignore
            }
          }
        },
        { root: null, rootMargin: '300px 0px', threshold: 0.01 }
      );
    }
    for (let i = 0; i < nodes.length; i++) {
      mountPoster(nodes[i], { force: false });
      readyIO.observe(nodes[i]);
    }
  }

  loadVidstackStylesOnce();
  ensureVideoBrandCSS();

  videoPlayers.forEach((el) => {
    primePlayerNode(el);
    if (getAttr(el, 'data-poster') || getAttr(el, 'data-video-poster')) {
      mountPoster(el, { force: false });
    } else {
      queuePosterFetch(el);
    }
  });

  setupViewportLoader();
  scheduleModuleWarm();
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.target.closest('[data-video-play]')) preloadVidstack();
    },
    { capture: true }
  );

  if (!escKeydownHandler) {
    escKeydownHandler = (event) => {
      const key = event.key || event.code || '';
      if (key !== 'Escape' && key !== 'Esc') return;
      pauseActivePlayers();
    };
    document.addEventListener('keydown', escKeydownHandler);
  }

  document.addEventListener('click', (e) => {
    const target = e.target;

    const playBtn = target.closest('[data-video-play]');
    if (playBtn) {
      e.preventDefault();
      const el = idTarget(playBtn, 'data-video-play');
      if (el) requestPlay(el);
      return;
    }

    const playIconBtn = target.closest('[data-play-icon]');
    if (playIconBtn) {
      e.preventDefault();
      const el = playIconBtn.closest('video-source-player');
      if (el) requestPlay(el);
      return;
    }

    const pauseBtn = target.closest('[data-video-pause]');
    if (pauseBtn) {
      e.preventDefault();
      const el = idTarget(pauseBtn, 'data-video-pause');
      if (el) requestPause(el);
      return;
    }

    const toggleBtn = target.closest('[data-video-toggle]');
    if (toggleBtn) {
      e.preventDefault();
      const el = idTarget(toggleBtn, 'data-video-toggle');
      if (!el) return;
      if (ctrl(el).intent === 'playing') requestPause(el);
      else requestPlay(el);
      return;
    }

    const videoPlayer = target.closest('video-source-player');
    if (!videoPlayer) return;
    if (target.closest('media-player, .vds-player, [data-media-player]')) return;
    // Use the same explicit play behavior as play/toggle buttons so that a single
    // click on the poster starts playback (no second click required inside iframe).
    requestPlay(videoPlayer, { logInitError: true });
  });

  window.__applyVideoPostersAndObserve = async function (root = document) {
    root.querySelectorAll('video-source-player').forEach((el) => {
      primePlayerNode(el);
      if (getAttr(el, 'data-poster') || getAttr(el, 'data-video-poster')) {
        mountPoster(el, { force: false });
      } else {
        queuePosterFetch(el);
      }
    });
    await eagerInitPlayTargets(root);
    const added = root.querySelectorAll('video-source-player[data-video-state="ready"]');
    if (added.length) setupViewportLoader();
  };
}

function addBootstrapListeners() {
  if (!canUseDOM() || bootstrapAttached) {
    return;
  }

  bootstrapAttached = true;

  VIDEO_EVENTS.forEach((event) => {
    window.addEventListener(event, initVideoScript, { once: true, passive: true });
    document.addEventListener(event, initVideoScript, { once: true, passive: true });
  });
}

function cleanupVideoListeners() {
  if (!canUseDOM()) {
    return;
  }

  VIDEO_EVENTS.forEach((event) => {
    window.removeEventListener(event, initVideoScript, { passive: true });
    document.removeEventListener(event, initVideoScript, { passive: true });
  });
}

function cleanupEscKeyListener() {
  if (!canUseDOM()) {
    return;
  }

  if (escKeydownHandler) {
    document.removeEventListener('keydown', escKeydownHandler);
    escKeydownHandler = null;
  }
}

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function syncWindowInitFlag(value) {
  if (typeof window !== 'undefined') {
    window.videoScriptInitialized = value;
  }
}

function setVideoScriptInitialized(value) {
  videoScriptInitialized = value;
  syncWindowInitFlag(value);
}
