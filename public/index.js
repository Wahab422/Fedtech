
(function() {
  const source = new EventSource('http://localhost:3000/esbuild');
  source.addEventListener('change', () => {
    location.reload();
  });
  source.addEventListener('error', (e) => {
    if (e.target.readyState === EventSource.CLOSED) {
      console.log('[Live Reload] Connection closed');
    }
  });
  console.log('[Live Reload] Listening for changes...');
})();

(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/utils/logger.js
  var windowOverride, isDev, logger;
  var init_logger = __esm({
    "src/utils/logger.js"() {
      windowOverride = typeof window !== "undefined" && typeof window.__APP_DEBUG_LOGS__ !== "undefined" ? Boolean(window.__APP_DEBUG_LOGS__) : void 0;
      isDev = windowOverride ?? (typeof process === "undefined" || true);
      logger = {
        /**
         * Log message (only in development)
         * @param {...any} args - Arguments to log
         */
        log: (...args) => {
          if (isDev) {
            console.log(...args);
          }
        },
        /**
         * Log warning (only in development)
         * @param {...any} args - Arguments to log
         */
        warn: (...args) => {
          if (isDev) {
            console.warn(...args);
          }
        },
        /**
         * Log error (always logged, even in production)
         * @param {...any} args - Arguments to log
         */
        error: (...args) => {
          console.error(...args);
        },
        /**
         * Log info (only in development)
         * @param {...any} args - Arguments to log
         */
        info: (...args) => {
          if (isDev) {
            console.info(...args);
          }
        }
      };
    }
  });

  // node_modules/.pnpm/@studio-freight+lenis@1.0.42/node_modules/@studio-freight/lenis/dist/lenis.mjs
  var lenis_exports = {};
  __export(lenis_exports, {
    default: () => Lenis
  });
  function t(t2, e2, i) {
    return Math.max(t2, Math.min(e2, i));
  }
  var Animate, Dimensions, Emitter, e, VirtualScroll, Lenis;
  var init_lenis = __esm({
    "node_modules/.pnpm/@studio-freight+lenis@1.0.42/node_modules/@studio-freight/lenis/dist/lenis.mjs"() {
      Animate = class {
        advance(e2) {
          if (!this.isRunning)
            return;
          let i = false;
          if (this.lerp)
            this.value = (s = this.value, o = this.to, n = 60 * this.lerp, r = e2, function(t2, e3, i2) {
              return (1 - i2) * t2 + i2 * e3;
            }(s, o, 1 - Math.exp(-n * r))), Math.round(this.value) === this.to && (this.value = this.to, i = true);
          else {
            this.currentTime += e2;
            const s2 = t(0, this.currentTime / this.duration, 1);
            i = s2 >= 1;
            const o2 = i ? 1 : this.easing(s2);
            this.value = this.from + (this.to - this.from) * o2;
          }
          var s, o, n, r;
          this.onUpdate?.(this.value, i), i && this.stop();
        }
        stop() {
          this.isRunning = false;
        }
        fromTo(t2, e2, { lerp: i = 0.1, duration: s = 1, easing: o = (t3) => t3, onStart: n, onUpdate: r }) {
          this.from = this.value = t2, this.to = e2, this.lerp = i, this.duration = s, this.easing = o, this.currentTime = 0, this.isRunning = true, n?.(), this.onUpdate = r;
        }
      };
      Dimensions = class {
        constructor({ wrapper: t2, content: e2, autoResize: i = true, debounce: s = 250 } = {}) {
          __publicField(this, "resize", () => {
            this.onWrapperResize(), this.onContentResize();
          });
          __publicField(this, "onWrapperResize", () => {
            this.wrapper === window ? (this.width = window.innerWidth, this.height = window.innerHeight) : (this.width = this.wrapper.clientWidth, this.height = this.wrapper.clientHeight);
          });
          __publicField(this, "onContentResize", () => {
            this.wrapper === window ? (this.scrollHeight = this.content.scrollHeight, this.scrollWidth = this.content.scrollWidth) : (this.scrollHeight = this.wrapper.scrollHeight, this.scrollWidth = this.wrapper.scrollWidth);
          });
          this.wrapper = t2, this.content = e2, i && (this.debouncedResize = /* @__PURE__ */ function(t3, e3) {
            let i2;
            return function() {
              let s2 = arguments, o = this;
              clearTimeout(i2), i2 = setTimeout(function() {
                t3.apply(o, s2);
              }, e3);
            };
          }(this.resize, s), this.wrapper === window ? window.addEventListener("resize", this.debouncedResize, false) : (this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize), this.wrapperResizeObserver.observe(this.wrapper)), this.contentResizeObserver = new ResizeObserver(this.debouncedResize), this.contentResizeObserver.observe(this.content)), this.resize();
        }
        destroy() {
          this.wrapperResizeObserver?.disconnect(), this.contentResizeObserver?.disconnect(), window.removeEventListener("resize", this.debouncedResize, false);
        }
        get limit() {
          return { x: this.scrollWidth - this.width, y: this.scrollHeight - this.height };
        }
      };
      Emitter = class {
        constructor() {
          this.events = {};
        }
        emit(t2, ...e2) {
          let i = this.events[t2] || [];
          for (let t3 = 0, s = i.length; t3 < s; t3++)
            i[t3](...e2);
        }
        on(t2, e2) {
          return this.events[t2]?.push(e2) || (this.events[t2] = [e2]), () => {
            this.events[t2] = this.events[t2]?.filter((t3) => e2 !== t3);
          };
        }
        off(t2, e2) {
          this.events[t2] = this.events[t2]?.filter((t3) => e2 !== t3);
        }
        destroy() {
          this.events = {};
        }
      };
      e = 100 / 6;
      VirtualScroll = class {
        constructor(t2, { wheelMultiplier: e2 = 1, touchMultiplier: i = 1 }) {
          __publicField(this, "onTouchStart", (t2) => {
            const { clientX: e2, clientY: i } = t2.targetTouches ? t2.targetTouches[0] : t2;
            this.touchStart.x = e2, this.touchStart.y = i, this.lastDelta = { x: 0, y: 0 }, this.emitter.emit("scroll", { deltaX: 0, deltaY: 0, event: t2 });
          });
          __publicField(this, "onTouchMove", (t2) => {
            const { clientX: e2, clientY: i } = t2.targetTouches ? t2.targetTouches[0] : t2, s = -(e2 - this.touchStart.x) * this.touchMultiplier, o = -(i - this.touchStart.y) * this.touchMultiplier;
            this.touchStart.x = e2, this.touchStart.y = i, this.lastDelta = { x: s, y: o }, this.emitter.emit("scroll", { deltaX: s, deltaY: o, event: t2 });
          });
          __publicField(this, "onTouchEnd", (t2) => {
            this.emitter.emit("scroll", { deltaX: this.lastDelta.x, deltaY: this.lastDelta.y, event: t2 });
          });
          __publicField(this, "onWheel", (t2) => {
            let { deltaX: i, deltaY: s, deltaMode: o } = t2;
            i *= 1 === o ? e : 2 === o ? this.windowWidth : 1, s *= 1 === o ? e : 2 === o ? this.windowHeight : 1, i *= this.wheelMultiplier, s *= this.wheelMultiplier, this.emitter.emit("scroll", { deltaX: i, deltaY: s, event: t2 });
          });
          __publicField(this, "onWindowResize", () => {
            this.windowWidth = window.innerWidth, this.windowHeight = window.innerHeight;
          });
          this.element = t2, this.wheelMultiplier = e2, this.touchMultiplier = i, this.touchStart = { x: null, y: null }, this.emitter = new Emitter(), window.addEventListener("resize", this.onWindowResize, false), this.onWindowResize(), this.element.addEventListener("wheel", this.onWheel, { passive: false }), this.element.addEventListener("touchstart", this.onTouchStart, { passive: false }), this.element.addEventListener("touchmove", this.onTouchMove, { passive: false }), this.element.addEventListener("touchend", this.onTouchEnd, { passive: false });
        }
        on(t2, e2) {
          return this.emitter.on(t2, e2);
        }
        destroy() {
          this.emitter.destroy(), window.removeEventListener("resize", this.onWindowResize, false), this.element.removeEventListener("wheel", this.onWheel, { passive: false }), this.element.removeEventListener("touchstart", this.onTouchStart, { passive: false }), this.element.removeEventListener("touchmove", this.onTouchMove, { passive: false }), this.element.removeEventListener("touchend", this.onTouchEnd, { passive: false });
        }
      };
      Lenis = class {
        constructor({ wrapper: t2 = window, content: e2 = document.documentElement, wheelEventsTarget: i = t2, eventsTarget: s = i, smoothWheel: o = true, syncTouch: n = false, syncTouchLerp: r = 0.075, touchInertiaMultiplier: l = 35, duration: h, easing: a = (t3) => Math.min(1, 1.001 - Math.pow(2, -10 * t3)), lerp: c = !h && 0.1, infinite: d = false, orientation: p = "vertical", gestureOrientation: u = "vertical", touchMultiplier: m = 1, wheelMultiplier: v = 1, autoResize: g = true, __experimental__naiveDimensions: S = false } = {}) {
          this.__isSmooth = false, this.__isScrolling = false, this.__isStopped = false, this.__isLocked = false, this.onVirtualScroll = ({ deltaX: t3, deltaY: e3, event: i2 }) => {
            if (i2.ctrlKey)
              return;
            const s2 = i2.type.includes("touch"), o2 = i2.type.includes("wheel");
            if (this.options.syncTouch && s2 && "touchstart" === i2.type && !this.isStopped && !this.isLocked)
              return void this.reset();
            const n2 = 0 === t3 && 0 === e3, r2 = "vertical" === this.options.gestureOrientation && 0 === e3 || "horizontal" === this.options.gestureOrientation && 0 === t3;
            if (n2 || r2)
              return;
            let l2 = i2.composedPath();
            if (l2 = l2.slice(0, l2.indexOf(this.rootElement)), l2.find((t4) => {
              var e4, i3, n3, r3, l3;
              return (null === (e4 = t4.hasAttribute) || void 0 === e4 ? void 0 : e4.call(t4, "data-lenis-prevent")) || s2 && (null === (i3 = t4.hasAttribute) || void 0 === i3 ? void 0 : i3.call(t4, "data-lenis-prevent-touch")) || o2 && (null === (n3 = t4.hasAttribute) || void 0 === n3 ? void 0 : n3.call(t4, "data-lenis-prevent-wheel")) || (null === (r3 = t4.classList) || void 0 === r3 ? void 0 : r3.contains("lenis")) && !(null === (l3 = t4.classList) || void 0 === l3 ? void 0 : l3.contains("lenis-stopped"));
            }))
              return;
            if (this.isStopped || this.isLocked)
              return void i2.preventDefault();
            if (this.isSmooth = this.options.syncTouch && s2 || this.options.smoothWheel && o2, !this.isSmooth)
              return this.isScrolling = false, void this.animate.stop();
            i2.preventDefault();
            let h2 = e3;
            "both" === this.options.gestureOrientation ? h2 = Math.abs(e3) > Math.abs(t3) ? e3 : t3 : "horizontal" === this.options.gestureOrientation && (h2 = t3);
            const a2 = s2 && this.options.syncTouch, c2 = s2 && "touchend" === i2.type && Math.abs(h2) > 5;
            c2 && (h2 = this.velocity * this.options.touchInertiaMultiplier), this.scrollTo(this.targetScroll + h2, Object.assign({ programmatic: false }, a2 ? { lerp: c2 ? this.options.syncTouchLerp : 1 } : { lerp: this.options.lerp, duration: this.options.duration, easing: this.options.easing }));
          }, this.onNativeScroll = () => {
            if (!this.__preventNextScrollEvent && !this.isScrolling) {
              const t3 = this.animatedScroll;
              this.animatedScroll = this.targetScroll = this.actualScroll, this.velocity = 0, this.direction = Math.sign(this.animatedScroll - t3), this.emit();
            }
          }, window.lenisVersion = "1.0.42", t2 !== document.documentElement && t2 !== document.body || (t2 = window), this.options = { wrapper: t2, content: e2, wheelEventsTarget: i, eventsTarget: s, smoothWheel: o, syncTouch: n, syncTouchLerp: r, touchInertiaMultiplier: l, duration: h, easing: a, lerp: c, infinite: d, gestureOrientation: u, orientation: p, touchMultiplier: m, wheelMultiplier: v, autoResize: g, __experimental__naiveDimensions: S }, this.animate = new Animate(), this.emitter = new Emitter(), this.dimensions = new Dimensions({ wrapper: t2, content: e2, autoResize: g }), this.toggleClassName("lenis", true), this.velocity = 0, this.isLocked = false, this.isStopped = false, this.isSmooth = n || o, this.isScrolling = false, this.targetScroll = this.animatedScroll = this.actualScroll, this.options.wrapper.addEventListener("scroll", this.onNativeScroll, false), this.virtualScroll = new VirtualScroll(s, { touchMultiplier: m, wheelMultiplier: v }), this.virtualScroll.on("scroll", this.onVirtualScroll);
        }
        destroy() {
          this.emitter.destroy(), this.options.wrapper.removeEventListener("scroll", this.onNativeScroll, false), this.virtualScroll.destroy(), this.dimensions.destroy(), this.toggleClassName("lenis", false), this.toggleClassName("lenis-smooth", false), this.toggleClassName("lenis-scrolling", false), this.toggleClassName("lenis-stopped", false), this.toggleClassName("lenis-locked", false);
        }
        on(t2, e2) {
          return this.emitter.on(t2, e2);
        }
        off(t2, e2) {
          return this.emitter.off(t2, e2);
        }
        setScroll(t2) {
          this.isHorizontal ? this.rootElement.scrollLeft = t2 : this.rootElement.scrollTop = t2;
        }
        resize() {
          this.dimensions.resize();
        }
        emit() {
          this.emitter.emit("scroll", this);
        }
        reset() {
          this.isLocked = false, this.isScrolling = false, this.animatedScroll = this.targetScroll = this.actualScroll, this.velocity = 0, this.animate.stop();
        }
        start() {
          this.isStopped && (this.isStopped = false, this.reset());
        }
        stop() {
          this.isStopped || (this.isStopped = true, this.animate.stop(), this.reset());
        }
        raf(t2) {
          const e2 = t2 - (this.time || t2);
          this.time = t2, this.animate.advance(1e-3 * e2);
        }
        scrollTo(e2, { offset: i = 0, immediate: s = false, lock: o = false, duration: n = this.options.duration, easing: r = this.options.easing, lerp: l = !n && this.options.lerp, onComplete: h, force: a = false, programmatic: c = true } = {}) {
          if (!this.isStopped && !this.isLocked || a) {
            if (["top", "left", "start"].includes(e2))
              e2 = 0;
            else if (["bottom", "right", "end"].includes(e2))
              e2 = this.limit;
            else {
              let t2;
              if ("string" == typeof e2 ? t2 = document.querySelector(e2) : (null == e2 ? void 0 : e2.nodeType) && (t2 = e2), t2) {
                if (this.options.wrapper !== window) {
                  const t3 = this.options.wrapper.getBoundingClientRect();
                  i -= this.isHorizontal ? t3.left : t3.top;
                }
                const s2 = t2.getBoundingClientRect();
                e2 = (this.isHorizontal ? s2.left : s2.top) + this.animatedScroll;
              }
            }
            if ("number" == typeof e2) {
              if (e2 += i, e2 = Math.round(e2), this.options.infinite ? c && (this.targetScroll = this.animatedScroll = this.scroll) : e2 = t(0, e2, this.limit), s)
                return this.animatedScroll = this.targetScroll = e2, this.setScroll(this.scroll), this.reset(), void (null == h || h(this));
              if (!c) {
                if (e2 === this.targetScroll)
                  return;
                this.targetScroll = e2;
              }
              this.animate.fromTo(this.animatedScroll, e2, { duration: n, easing: r, lerp: l, onStart: () => {
                o && (this.isLocked = true), this.isScrolling = true;
              }, onUpdate: (t2, e3) => {
                this.isScrolling = true, this.velocity = t2 - this.animatedScroll, this.direction = Math.sign(this.velocity), this.animatedScroll = t2, this.setScroll(this.scroll), c && (this.targetScroll = t2), e3 || this.emit(), e3 && (this.reset(), this.emit(), null == h || h(this), this.__preventNextScrollEvent = true, requestAnimationFrame(() => {
                  delete this.__preventNextScrollEvent;
                }));
              } });
            }
          }
        }
        get rootElement() {
          return this.options.wrapper === window ? document.documentElement : this.options.wrapper;
        }
        get limit() {
          return this.options.__experimental__naiveDimensions ? this.isHorizontal ? this.rootElement.scrollWidth - this.rootElement.clientWidth : this.rootElement.scrollHeight - this.rootElement.clientHeight : this.dimensions.limit[this.isHorizontal ? "x" : "y"];
        }
        get isHorizontal() {
          return "horizontal" === this.options.orientation;
        }
        get actualScroll() {
          return this.isHorizontal ? this.rootElement.scrollLeft : this.rootElement.scrollTop;
        }
        get scroll() {
          return this.options.infinite ? (t2 = this.animatedScroll, e2 = this.limit, (t2 % e2 + e2) % e2) : this.animatedScroll;
          var t2, e2;
        }
        get progress() {
          return 0 === this.limit ? 1 : this.scroll / this.limit;
        }
        get isSmooth() {
          return this.__isSmooth;
        }
        set isSmooth(t2) {
          this.__isSmooth !== t2 && (this.__isSmooth = t2, this.toggleClassName("lenis-smooth", t2));
        }
        get isScrolling() {
          return this.__isScrolling;
        }
        set isScrolling(t2) {
          this.__isScrolling !== t2 && (this.__isScrolling = t2, this.toggleClassName("lenis-scrolling", t2));
        }
        get isStopped() {
          return this.__isStopped;
        }
        set isStopped(t2) {
          this.__isStopped !== t2 && (this.__isStopped = t2, this.toggleClassName("lenis-stopped", t2));
        }
        get isLocked() {
          return this.__isLocked;
        }
        set isLocked(t2) {
          this.__isLocked !== t2 && (this.__isLocked = t2, this.toggleClassName("lenis-locked", t2));
        }
        get className() {
          let t2 = "lenis";
          return this.isStopped && (t2 += " lenis-stopped"), this.isLocked && (t2 += " lenis-locked"), this.isScrolling && (t2 += " lenis-scrolling"), this.isSmooth && (t2 += " lenis-smooth"), t2;
        }
        toggleClassName(t2, e2) {
          this.rootElement.classList.toggle(t2, e2), this.emitter.emit("className change", this);
        }
      };
    }
  });

  // src/global/lenis.js
  function isScrollDevice() {
    if (typeof window === "undefined" || !window.matchMedia)
      return true;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
  function nativeScrollTo(target, offset = 0, behavior = "smooth") {
    if (typeof window === "undefined" || !target)
      return;
    const navbar = document.querySelector(".nav") || document.querySelector("[data-navbar]");
    const offsetPx = (navbar ? navbar.offsetHeight : 0) + offset;
    const top = target.getBoundingClientRect().top + window.scrollY - offsetPx;
    window.scrollTo({ top, behavior });
  }
  function initNativeScrollHandlers() {
    document.addEventListener(
      "click",
      (e2) => {
        const anchor = e2.target.closest('a[href^="#"]');
        if (!anchor)
          return;
        const href = anchor.getAttribute("href");
        if (href === "#" || href === "#!")
          return;
        const target = document.querySelector(href);
        if (target) {
          e2.preventDefault();
          nativeScrollTo(target, 0);
        }
      },
      { passive: false }
    );
    document.addEventListener(
      "click",
      (e2) => {
        const button = e2.target.closest("[data-scroll-to]");
        if (!button)
          return;
        e2.preventDefault();
        const target = button.getAttribute("data-scroll-to");
        if (target === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (target === "bottom") {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        } else if (target.startsWith("#")) {
          const element = document.querySelector(target);
          if (element)
            nativeScrollTo(element, 0);
        }
      },
      { passive: false }
    );
    document.addEventListener("click", (e2) => {
      const target = e2.target;
      if (!target)
        return;
      const shouldRefresh = target.closest(".w-pagination-next") || target.closest(".w-radio");
      if (!shouldRefresh)
        return;
      if (paginationRefreshScheduled)
        return;
      paginationRefreshScheduled = true;
      requestAnimationFrame(() => {
        paginationRefreshScheduled = false;
        if (window.ScrollTrigger?.refresh)
          window.ScrollTrigger.refresh();
      });
      setTimeout(() => {
        if (window.ScrollTrigger?.refresh)
          window.ScrollTrigger.refresh();
      }, 150);
    });
  }
  async function actuallyInitLenis() {
    if (lenisLoaded)
      return;
    lenisLoaded = true;
    try {
      let raf = function(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      const { default: Lenis2 } = await Promise.resolve().then(() => (init_lenis(), lenis_exports));
      logger.log("\u{1F3AF} Lenis smooth scroll loading...");
      lenis = new Lenis2({
        duration: 1.2,
        // Animation duration in seconds
        easing: (t2) => Math.min(1, 1.001 - Math.pow(2, -10 * t2)),
        // Easing function
        orientation: "vertical",
        // 'vertical' or 'horizontal'
        gestureOrientation: "vertical",
        // 'vertical', 'horizontal', or 'both'
        smoothWheel: true,
        // Enable smooth scrolling for mouse wheel
        wheelMultiplier: 1,
        // Mouse wheel sensitivity
        smoothTouch: false,
        // Disabled for better mobile performance
        touchMultiplier: 2,
        // Touch sensitivity
        infinite: false,
        // Infinite scrolling
        autoResize: true,
        // Auto resize on window resize
        lerp: 0.1
        // Lower = smoother but slower, higher = faster but less smooth
      });
      requestAnimationFrame(raf);
      logger.log("\u2705 Lenis smooth scroll ready");
      const scheduleScrollRefresh = () => {
        if (paginationRefreshScheduled)
          return;
        paginationRefreshScheduled = true;
        const refresh = () => {
          if (lenis?.resize)
            lenis.resize();
          if (window.ScrollTrigger?.refresh)
            window.ScrollTrigger.refresh();
        };
        requestAnimationFrame(() => {
          paginationRefreshScheduled = false;
          refresh();
        });
        setTimeout(refresh, 150);
      };
      document.addEventListener(
        "click",
        (e2) => {
          if (!lenis)
            return;
          const anchor = e2.target.closest('a[href^="#"]');
          if (!anchor)
            return;
          const href = anchor.getAttribute("href");
          if (href === "#" || href === "#!")
            return;
          const target = document.querySelector(href);
          if (target) {
            e2.preventDefault();
            const navbar = document.querySelector(".nav");
            const offset = navbar ? navbar.offsetHeight : 0;
            lenis.scrollTo(target, {
              offset: -offset,
              duration: 1.2
            });
          }
        },
        { passive: false }
        // Can't be passive because we preventDefault
      );
      document.addEventListener("click", (e2) => {
        const target = e2.target;
        if (!target)
          return;
        const shouldRefresh = target.closest(".w-pagination-next") || target.closest(".w-radio");
        if (!shouldRefresh)
          return;
        scheduleScrollRefresh();
      });
      document.addEventListener(
        "click",
        (e2) => {
          if (!lenis)
            return;
          const button = e2.target.closest("[data-scroll-to]");
          if (!button)
            return;
          e2.preventDefault();
          const target = button.getAttribute("data-scroll-to");
          if (target === "top") {
            lenis.scrollTo(0, { duration: 1.2 });
          } else if (target === "bottom") {
            lenis.scrollTo(document.body.scrollHeight, { duration: 1.5 });
          } else if (target.startsWith("#")) {
            const element = document.querySelector(target);
            if (element) {
              const navbar = document.querySelector("[data-navbar]");
              const offset = navbar ? navbar.offsetHeight : 0;
              lenis.scrollTo(element, {
                offset: -offset,
                duration: 1.2
              });
            }
          }
        },
        { passive: false }
        // Can't be passive because we preventDefault
      );
    } catch (error) {
      logger.error("Error loading Lenis:", error);
    }
  }
  function initLenis() {
    if (lenisImport)
      return;
    if (!isScrollDevice()) {
      useNativeScrollOnly = true;
      logger.log("\u{1F4F1} Touch device detected \u2014 using native scroll (Lenis disabled)");
      initNativeScrollHandlers();
      lenisImport = true;
      return;
    }
    logger.log("\u23F3 Lenis will load on first interaction...");
    const interactionEvents = ["scroll", "wheel", "touchstart", "click", "mousemove"];
    let hasInteracted = false;
    const loadOnInteraction = () => {
      if (hasInteracted)
        return;
      hasInteracted = true;
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, loadOnInteraction, { passive: true });
      });
      actuallyInitLenis();
    };
    interactionEvents.forEach((event) => {
      window.addEventListener(event, loadOnInteraction, { passive: true, once: true });
    });
    lenisImport = true;
  }
  function getLenis() {
    return lenis;
  }
  var lenis, lenisLoaded, lenisImport, paginationRefreshScheduled, useNativeScrollOnly;
  var init_lenis2 = __esm({
    "src/global/lenis.js"() {
      init_logger();
      lenis = null;
      lenisLoaded = false;
      lenisImport = null;
      paginationRefreshScheduled = false;
      useNativeScrollOnly = false;
    }
  });

  // src/utils/helpers.js
  function rafThrottle(func) {
    let ticking = false;
    return function executedFunction(...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          func(...args);
          ticking = false;
        });
        ticking = true;
      }
    };
  }
  function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 - offset && rect.left >= 0 - offset && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset && rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset;
  }
  function observeInView(elements, callback, options = {}) {
    if (typeof document === "undefined") {
      return () => {
      };
    }
    const targets = resolveElementList(elements);
    if (!targets.length) {
      logger.warn("[observeInView] No elements found:", elements);
      return () => {
      };
    }
    const {
      root = null,
      rootMargin = "0px",
      threshold = 0,
      once = true,
      offset = 0
    } = options;
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting)
              return;
            callback(entry.target, entry);
            if (once) {
              observer.unobserve(entry.target);
            }
          });
        },
        { root, rootMargin, threshold }
      );
      targets.forEach((target) => observer.observe(target));
      return () => {
        observer.disconnect();
      };
    }
    const remaining = new Set(targets);
    const checkInView = rafThrottle(() => {
      Array.from(remaining).forEach((target) => {
        if (!target)
          return;
        if (isInViewport(target, offset)) {
          callback(target, null);
          if (once) {
            remaining.delete(target);
          }
        }
      });
    });
    window.addEventListener("scroll", checkInView, { passive: true });
    window.addEventListener("resize", checkInView);
    checkInView();
    return () => {
      window.removeEventListener("scroll", checkInView);
      window.removeEventListener("resize", checkInView);
    };
  }
  function resolveElementList(ref) {
    if (!ref || typeof document === "undefined")
      return [];
    if (typeof ref === "string") {
      return Array.from(document.querySelectorAll(ref));
    }
    if (isDomElement(ref)) {
      return [ref];
    }
    if (typeof NodeList !== "undefined" && ref instanceof NodeList) {
      return Array.from(ref).filter(isDomElement);
    }
    if (Array.isArray(ref)) {
      return ref.filter(isDomElement);
    }
    return [];
  }
  function isDomElement(node) {
    return typeof Element !== "undefined" && node instanceof Element;
  }
  function backToTop(options = {}) {
    if (typeof window === "undefined") {
      return;
    }
    const { behavior: nativeBehavior = "smooth", ...lenisOptions } = options;
    const lenis2 = typeof getLenis === "function" ? getLenis() : null;
    if (lenis2) {
      lenis2.scrollTo(0, {
        duration: 1.2,
        ...lenisOptions
      });
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: nativeBehavior
    });
  }
  function handleError(error, context = "Application", silent = true) {
    const errorMessage = `[${context}] ${error.message || "Unknown error"}`;
    logger.error(errorMessage, error);
    if (!silent && typeof window !== "undefined") {
      logger.warn("Error occurred:", errorMessage);
    }
    return error;
  }
  function loadScript(src, options = {}) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = options.async !== false;
      script.defer = options.defer || false;
      if (options.id) {
        script.id = options.id;
      }
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }
  var init_helpers = __esm({
    "src/utils/helpers.js"() {
      init_logger();
      init_lenis2();
    }
  });

  // src/utils/jsdelivr.js
  function loadCSS(cssUrl, id = null) {
    return new Promise((resolve, reject) => {
      const existingLink = id ? document.querySelector(`link#${id}`) : document.querySelector(`link[href="${cssUrl}"]`);
      if (existingLink) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssUrl;
      if (id) {
        link.id = id;
      }
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${cssUrl}`));
      document.head.appendChild(link);
    });
  }
  async function loadLibrary(libraryName, options = {}) {
    const { loadCSS: shouldLoadCSS = true, forceReload = false } = options;
    const library = jsDelivrLibraries[libraryName];
    if (!library) {
      throw new Error(`Library "${libraryName}" not found in jsDelivrLibraries configuration`);
    }
    if (!forceReload && loadedLibraries.has(libraryName)) {
      return;
    }
    try {
      if (library.dependsOn && Array.isArray(library.dependsOn)) {
        for (const dep of library.dependsOn) {
          await loadLibrary(dep, { loadCSS: shouldLoadCSS, forceReload });
        }
      }
      if (shouldLoadCSS && library.css) {
        await loadCSS(library.css, `jsdelivr-${libraryName}-css`);
      }
      if (library.js) {
        await loadScript(library.js, { id: `jsdelivr-${libraryName}-js` });
      }
      loadedLibraries.add(libraryName);
      logger.log(`\u2705 ${libraryName}@${library.version} loaded from jsDelivr`);
    } catch (error) {
      handleError(error, `jsDelivr Loader (${libraryName})`);
      throw error;
    }
  }
  function isLibraryLoaded(libraryName) {
    return loadedLibraries.has(libraryName);
  }
  var jsDelivrLibraries, loadedLibraries;
  var init_jsdelivr = __esm({
    "src/utils/jsdelivr.js"() {
      init_helpers();
      init_logger();
      jsDelivrLibraries = {
        // Animation Libraries
        gsap: {
          version: "3.12.5",
          js: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
          css: null
        },
        scrollTrigger: {
          version: "3.12.5",
          js: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js",
          css: null,
          dependsOn: ["gsap"]
        },
        splitText: {
          version: "3.12.5",
          js: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js",
          css: null,
          dependsOn: ["gsap"]
        },
        customEase: {
          version: "3.12.5",
          js: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/CustomEase.min.js",
          css: null,
          dependsOn: ["gsap"]
        },
        // Carousel/Slider Libraries
        swiper: {
          version: "11",
          js: "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"
          // css: 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
        },
        embla: {
          version: "latest",
          js: "https://cdn.jsdelivr.net/npm/embla-carousel/embla-carousel.umd.js",
          css: null
        }
        // Add more libraries as needed
        // Example:
        // lodash: {
        //   version: '4.17.21',
        //   js: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
        //   css: null,
        // },
      };
      loadedLibraries = /* @__PURE__ */ new Set();
    }
  });

  // src/components/carousel.js
  async function loadCarouselLibrary() {
    if (carouselLibraryLoaded || isLibraryLoaded("embla")) {
      return Promise.resolve();
    }
    if (loadPromise) {
      return loadPromise;
    }
    loadPromise = (async () => {
      try {
        await loadLibrary("embla", { loadCSS: false });
        if (typeof window.EmblaCarousel === "undefined") {
          throw new Error("Carousel library failed to load");
        }
        carouselLibraryLoaded = true;
        if (pendingSliders.length > 0) {
          logger.log(`Initializing ${pendingSliders.length} pending carousel(s)...`);
          initializeCarousels(pendingSliders);
          pendingSliders = [];
        }
        return true;
      } catch (error) {
        handleError(error, "Carousel Library Loader");
        loadPromise = null;
        throw error;
      }
    })();
    return loadPromise;
  }
  async function loadAndInitSlider(slider) {
    if (!carouselLibraryLoaded && !pendingSliders.includes(slider)) {
      pendingSliders.push(slider);
    }
    if (!carouselLibraryLoaded) {
      await loadCarouselLibrary();
    }
    if (carouselLibraryLoaded && !slider._carouselInitialized) {
      initializeCarousels([slider]);
    }
  }
  function initCarousel() {
    const sliders = document.querySelectorAll("[data-carousel]");
    if (!sliders.length)
      return;
    logger.log(`\u23F3 Found ${sliders.length} carousel(s) - will load when visible...`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slider = entry.target;
            observer.unobserve(slider);
            slider.setAttribute("data-carousel-observed", "true");
            loadAndInitSlider(slider);
          }
        });
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0
      }
    );
    sliders.forEach((slider) => {
      observer.observe(slider);
    });
  }
  function initializeCarousels(sliderList) {
    if (!sliderList || !sliderList.length)
      return;
    sliderList.forEach((slider) => {
      if (slider._carouselInitialized)
        return;
      slider._carouselInitialized = true;
      const carouselRoot = slider.querySelector(VIEWPORT_SELECTOR) || slider;
      const carouselViewport = slider.querySelector(VIEWPORT_SELECTOR) || carouselRoot;
      const carouselContainer = slider.querySelector(CONTAINER_SELECTOR);
      if (!carouselViewport) {
        logger.warn("Carousel viewport not found in slider:", slider);
        return;
      }
      const navButtonsWrapper = slider.querySelector("[carousel-btns]") || slider.querySelector(".carousel-btns") || slider.querySelector(".arrow-btns");
      const fallbackNavButtons = navButtonsWrapper ? Array.from(navButtonsWrapper.querySelectorAll("[carousel-btn], .arrow-btn, button")) : [];
      const explicitNextBtn = slider.querySelector("[slider-next-btn]") || slider.querySelector("[carousel-next-btn]") || slider.querySelector('.carousel-btns .btn[aria-label="Next slide"]');
      const explicitPrevBtn = slider.querySelector("[slider-prev-btn]") || slider.querySelector("[carousel-prev-btn]") || slider.querySelector('.carousel-btns .btn[aria-label="Previous slide"]');
      const prevBtn = explicitPrevBtn || fallbackNavButtons[0] || null;
      let nextBtn = explicitNextBtn || (fallbackNavButtons.length > 1 ? fallbackNavButtons[1] : fallbackNavButtons[0]) || null;
      if (prevBtn && nextBtn && prevBtn === nextBtn) {
        nextBtn = null;
      }
      let slideButtons = [];
      const customProgressBar = slider.querySelector(".carousel-progress-bar");
      const syncId = slider.getAttribute("data-sync");
      const centerMode = slider.hasAttribute("data-center");
      const centerBounds = slider.hasAttribute("data-center-bounds");
      const clickToCenter = slider.hasAttribute("data-click-center");
      const loopMode = slider.hasAttribute("data-loop");
      const disableDrag = slider.hasAttribute("data-no-drag");
      const dragFree = slider.hasAttribute("data-drag-free");
      const autoplayEnabled = slider.hasAttribute("data-autoplay");
      const autoplayStopOnInteraction = slider.hasAttribute("data-autoplay-stop-on-interaction");
      const fadeMode = slider.hasAttribute("data-fade") || slider.getAttribute("data-effect") === "fade" || slider.getAttribute("data-carousel") === "fade";
      const slideClassesEnabled = slider.hasAttribute("data-slide-classes");
      const alignAttr = slider.getAttribute("data-align");
      const autoplayDelayAttr = slider.getAttribute("data-autoplay-delay");
      const autoplayDelay = Number.isFinite(Number.parseInt(autoplayDelayAttr, 10)) ? Number.parseInt(autoplayDelayAttr, 10) : 8e3;
      const fadeDurationAttr = slider.getAttribute("data-fade-duration");
      const fadeDuration = Number.isFinite(Number.parseInt(fadeDurationAttr, 10)) ? Math.max(150, Number.parseInt(fadeDurationAttr, 10)) : 650;
      const fadeEase = slider.getAttribute("data-fade-ease") || "cubic-bezier(0.22, 1, 0.36, 1)";
      const carouselOptions = {
        align: alignAttr || (centerMode ? "center" : "start"),
        containScroll: centerBounds ? "trimSnaps" : false,
        loop: loopMode,
        draggable: fadeMode ? false : !disableDrag,
        dragFree: fadeMode ? false : dragFree
      };
      let carouselApi = null;
      let autoplayTimer = null;
      const cleanupTasks = [];
      let scrollToIndex = () => {
      };
      let restartAutoplay = null;
      function getSlides() {
        if (carouselContainer) {
          return Array.from(carouselContainer.children);
        }
        return Array.from(slider.querySelectorAll(".carousel-item"));
      }
      function applyFadeLayout() {
        if (!fadeMode || !carouselContainer)
          return;
        const slides = getSlides();
        if (!slides.length)
          return;
        const maxHeight = slides.reduce((max, slide) => Math.max(max, slide.offsetHeight), 0);
        carouselViewport.style.overflow = "hidden";
        carouselContainer.style.position = "relative";
        carouselContainer.style.display = "block";
        carouselContainer.style.transform = "none";
        carouselContainer.style.transition = "none";
        if (maxHeight > 0) {
          carouselContainer.style.height = `${maxHeight}px`;
        }
        slides.forEach((slide) => {
          slide.style.position = "absolute";
          slide.style.inset = "0";
          slide.style.width = "100%";
          slide.style.willChange = "opacity, transform";
          slide.style.backfaceVisibility = "hidden";
          slide.style.transformOrigin = "center center";
          slide.style.transition = `opacity ${fadeDuration}ms ${fadeEase}, transform ${Math.round(
            fadeDuration * 1.2
          )}ms ${fadeEase}`;
        });
      }
      function ensureDots() {
        const dotsContainer = slider.querySelector("[carousel-dots]") || slider.querySelector(".carousel-dots");
        const slides = getSlides();
        if (!slides.length)
          return;
        if (dotsContainer) {
          const existingDots = dotsContainer.querySelectorAll("[data-slide-btn]");
          if (existingDots.length > 0) {
            if (existingDots.length !== slides.length) {
              logger.warn(
                `Carousel has ${slides.length} slides but ${existingDots.length} dot buttons. Button count should match slide count.`
              );
            }
          } else {
            dotsContainer.innerHTML = "";
            const fragment = document.createDocumentFragment();
            slides.forEach((_, index) => {
              const dot = document.createElement("button");
              dot.type = "button";
              dot.className = "carousel-dot";
              dot.setAttribute("data-slide-btn", "");
              dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
              fragment.appendChild(dot);
            });
            dotsContainer.appendChild(fragment);
          }
        }
        slideButtons = Array.from(slider.querySelectorAll("[data-slide-btn]"));
        slideButtons.sort((a, b) => {
          const aIndex = a.hasAttribute("data-slide-index") ? Number.parseInt(a.getAttribute("data-slide-index"), 10) : null;
          const bIndex = b.hasAttribute("data-slide-index") ? Number.parseInt(b.getAttribute("data-slide-index"), 10) : null;
          if (aIndex !== null && bIndex !== null) {
            return aIndex - bIndex;
          }
          if (aIndex !== null)
            return -1;
          if (bIndex !== null)
            return 1;
          const position = a.compareDocumentPosition(b);
          return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
        slideButtons = slideButtons.slice(0, slides.length);
      }
      function updateActiveSlides() {
        if (!carouselApi)
          return;
        const slides = getSlides();
        if (!slides.length)
          return;
        if (fadeMode) {
          if (!carouselContainer) {
            logger.warn("Fade mode requires a carousel container inside the slider.");
            return;
          }
          applyFadeLayout();
        }
        const activeIndex = carouselApi.selectedScrollSnap();
        slides.forEach((slide, index) => {
          Array.from(slide.classList).forEach((className) => {
            if (/^(upcoming|upcomming|passed)-\d+$/.test(className)) {
              slide.classList.remove(className);
            }
          });
          slide.classList.toggle("is-active", index === activeIndex);
          if (fadeMode) {
            slide.style.opacity = index === activeIndex ? "1" : "0";
            slide.style.zIndex = index === activeIndex ? "2" : "1";
            slide.style.pointerEvents = index === activeIndex ? "auto" : "none";
          }
          if (!slideClassesEnabled)
            return;
          slide.classList.toggle("is-passed", index < activeIndex);
          slide.classList.toggle("is-upcoming", index > activeIndex);
          slide.classList.toggle("is-prev", index === activeIndex - 1);
          slide.classList.toggle("is-next", index === activeIndex + 1);
          if (index > activeIndex) {
            const distance = index - activeIndex;
            slide.classList.add(`upcoming-${distance}`);
          } else if (index < activeIndex) {
            const distance = activeIndex - index;
            slide.classList.add(`passed-${distance}`);
          }
        });
        updateSlideButtons(activeIndex);
      }
      function updateSlideButtons(activeIndex) {
        if (!slideButtons.length)
          return;
        slideButtons.forEach((button, arrayIndex) => {
          const buttonIndex = button.hasAttribute("data-slide-index") ? Number.parseInt(button.getAttribute("data-slide-index"), 10) : arrayIndex;
          const isActive = buttonIndex === activeIndex;
          button.classList.toggle("is-active", isActive);
          if (isActive) {
            button.setAttribute("aria-current", "true");
          } else {
            button.removeAttribute("aria-current");
          }
        });
      }
      function updateButtonStates() {
        if (!carouselApi)
          return;
        const canPrev = carouselApi.canScrollPrev();
        const canNext = carouselApi.canScrollNext();
        const bothDisabled = !canPrev && !canNext;
        if (prevBtn) {
          prevBtn.style.pointerEvents = canPrev ? "auto" : "none";
          prevBtn.style.opacity = canPrev ? "1" : "0.5";
          prevBtn.style.display = bothDisabled ? "none" : "";
          prevBtn.setAttribute("aria-disabled", String(!canPrev));
        }
        if (nextBtn) {
          nextBtn.style.pointerEvents = canNext ? "auto" : "none";
          nextBtn.style.opacity = canNext ? "1" : "0.5";
          nextBtn.style.display = bothDisabled ? "none" : "";
          nextBtn.setAttribute("aria-disabled", String(!canNext));
        }
      }
      function updateCustomProgressBar() {
        if (!customProgressBar || !carouselApi)
          return;
        const totalSlides = carouselApi.scrollSnapList().length;
        const currentIndex = carouselApi.selectedScrollSnap();
        const progress = Math.max(0, Math.min(1, carouselApi.scrollProgress())) * 100;
        const progressFill = customProgressBar.querySelector(".carousel-progress-fill");
        if (progressFill) {
          progressFill.style.width = `${progress}%`;
          customProgressBar.setAttribute("data-progress", progress.toFixed(1));
          customProgressBar.setAttribute("data-current-slide", currentIndex + 1);
          customProgressBar.setAttribute("data-total-slides", totalSlides);
        }
      }
      try {
        carouselApi = window.EmblaCarousel(carouselViewport, carouselOptions);
        carouselViewport._carousel = carouselApi;
        slider._carouselInstance = carouselApi;
        scrollToIndex = (index, jump = false) => {
          if (!carouselApi)
            return;
          carouselApi.scrollTo(index, jump);
        };
        ensureDots();
        const slides = getSlides();
        if (slideButtons.length !== slides.length && slideButtons.length > 0) {
          logger.warn(
            `Carousel has ${slides.length} slides but ${slideButtons.length} slide buttons. Button indices may not match slide indices.`
          );
        }
        updateButtonStates();
        updateCustomProgressBar();
        updateActiveSlides();
        if (autoplayEnabled) {
          const startAutoplay = () => {
            if (autoplayTimer)
              return;
            autoplayTimer = window.setInterval(() => {
              if (!carouselApi)
                return;
              if (fadeMode) {
                const currentIndex = carouselApi.selectedScrollSnap();
                const totalSlides = carouselApi.scrollSnapList().length;
                const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
                scrollToIndex(nextIndex, true);
                return;
              }
              if (carouselApi.canScrollNext()) {
                carouselApi.scrollNext();
              } else {
                carouselApi.scrollTo(0);
              }
            }, autoplayDelay);
          };
          const stopAutoplay = () => {
            if (autoplayTimer) {
              window.clearInterval(autoplayTimer);
              autoplayTimer = null;
            }
          };
          restartAutoplay = () => {
            if (autoplayStopOnInteraction)
              return;
            stopAutoplay();
            startAutoplay();
          };
          startAutoplay();
          if (autoplayStopOnInteraction) {
            const stopHandler = () => stopAutoplay();
            slider.addEventListener("pointerdown", stopHandler);
            slider.addEventListener("keydown", stopHandler);
            cleanupTasks.push(() => {
              slider.removeEventListener("pointerdown", stopHandler);
              slider.removeEventListener("keydown", stopHandler);
            });
          }
          cleanupTasks.push(() => stopAutoplay());
        }
        const onSelect = () => {
          updateButtonStates();
          updateCustomProgressBar();
          updateActiveSlides();
        };
        const onScroll = () => {
          if (fadeMode) {
            applyFadeLayout();
          }
          updateCustomProgressBar();
        };
        const onReInit = () => {
          ensureDots();
          updateButtonStates();
          updateCustomProgressBar();
          updateActiveSlides();
        };
        carouselApi.on("select", onSelect);
        carouselApi.on("scroll", onScroll);
        carouselApi.on("reInit", onReInit);
        cleanupTasks.push(() => {
          carouselApi.off("select", onSelect);
          carouselApi.off("scroll", onScroll);
          carouselApi.off("reInit", onReInit);
        });
        const resizeHandler = () => {
          if (fadeMode) {
            applyFadeLayout();
          }
          updateCustomProgressBar();
        };
        window.addEventListener("resize", resizeHandler);
        cleanupTasks.push(() => window.removeEventListener("resize", resizeHandler));
        if (nextBtn) {
          const nextHandler = () => {
            if (fadeMode) {
              const currentIndex = carouselApi.selectedScrollSnap();
              const totalSlides = carouselApi.scrollSnapList().length;
              const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
              scrollToIndex(nextIndex, true);
              return;
            }
            carouselApi.scrollNext();
          };
          nextBtn.addEventListener("click", nextHandler);
          nextBtn.setAttribute("aria-label", "Next slide");
          nextBtn.setAttribute("role", "button");
          cleanupTasks.push(() => nextBtn.removeEventListener("click", nextHandler));
        }
        if (prevBtn) {
          const prevHandler = () => {
            if (fadeMode) {
              const currentIndex = carouselApi.selectedScrollSnap();
              const totalSlides = carouselApi.scrollSnapList().length;
              const prevIndex = currentIndex - 1 < 0 ? totalSlides - 1 : currentIndex - 1;
              scrollToIndex(prevIndex, true);
              return;
            }
            carouselApi.scrollPrev();
          };
          prevBtn.addEventListener("click", prevHandler);
          prevBtn.setAttribute("aria-label", "Previous slide");
          prevBtn.setAttribute("role", "button");
          cleanupTasks.push(() => prevBtn.removeEventListener("click", prevHandler));
        }
        if (slideButtons.length) {
          slideButtons.forEach((button, index) => {
            const explicitIndex = button.hasAttribute("data-slide-index") ? Number.parseInt(button.getAttribute("data-slide-index"), 10) : index;
            const targetIndex = Math.max(0, Math.min(explicitIndex, slides.length - 1));
            const clickHandler = () => {
              scrollToIndex(targetIndex, fadeMode);
              if (restartAutoplay) {
                restartAutoplay();
              }
            };
            button.addEventListener("click", clickHandler);
            button.setAttribute("type", "button");
            button.setAttribute("role", "button");
            if (!button.hasAttribute("aria-label")) {
              button.setAttribute("aria-label", `Go to slide ${targetIndex + 1}`);
            }
            cleanupTasks.push(() => button.removeEventListener("click", clickHandler));
          });
        }
        if (clickToCenter) {
          const slides2 = getSlides();
          slides2.forEach((slide, index) => {
            const slideHandler = () => scrollToIndex(index, fadeMode);
            slide.addEventListener("click", slideHandler);
            cleanupTasks.push(() => slide.removeEventListener("click", slideHandler));
          });
        }
        if (!slider._keyboardSetup) {
          const keyboardHandler = (event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              if (fadeMode) {
                const currentIndex = carouselApi.selectedScrollSnap();
                const totalSlides = carouselApi.scrollSnapList().length;
                const nextIndex = currentIndex + 1 >= totalSlides ? 0 : currentIndex + 1;
                scrollToIndex(nextIndex, true);
              } else {
                carouselApi.scrollNext();
              }
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              if (fadeMode) {
                const currentIndex = carouselApi.selectedScrollSnap();
                const totalSlides = carouselApi.scrollSnapList().length;
                const prevIndex = currentIndex - 1 < 0 ? totalSlides - 1 : currentIndex - 1;
                scrollToIndex(prevIndex, true);
              } else {
                carouselApi.scrollPrev();
              }
            }
          };
          slider.addEventListener("keydown", keyboardHandler);
          slider.tabIndex = 0;
          slider.setAttribute("role", "region");
          slider.setAttribute("aria-label", "Carousel");
          slider._keyboardSetup = true;
          cleanupTasks.push(() => slider.removeEventListener("keydown", keyboardHandler));
        }
        registerSyncedSlider(syncId, carouselApi);
        slider._carouselCleanup = cleanupTasks;
      } catch (error) {
        handleError(error, "Carousel Initialization");
      }
    });
    logger.log(`\u2705 ${sliderList.length} carousel(s) initialized`);
  }
  function destroyCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((slider) => {
      if (Array.isArray(slider._carouselCleanup)) {
        slider._carouselCleanup.forEach((cleanup) => {
          try {
            cleanup();
          } catch (error) {
            handleError(error, "Carousel Cleanup");
          }
        });
        slider._carouselCleanup = null;
      }
      const carouselApi = slider._carouselInstance || slider.querySelector?.(VIEWPORT_SELECTOR)?._carousel || null;
      if (carouselApi) {
        carouselApi.destroy();
      }
    });
    syncedSliderGroups.clear();
  }
  function registerSyncedSlider(syncId, carouselApi) {
    if (!syncId || !carouselApi)
      return;
    if (!syncedSliderGroups.has(syncId)) {
      syncedSliderGroups.set(syncId, /* @__PURE__ */ new Set());
    }
    const group = syncedSliderGroups.get(syncId);
    group.add(carouselApi);
    const syncHandler = () => {
      const targetIndex = carouselApi.selectedScrollSnap();
      group.forEach((otherCarousel) => {
        if (otherCarousel === carouselApi)
          return;
        otherCarousel.scrollTo(targetIndex);
      });
    };
    carouselApi.on("select", syncHandler);
    carouselApi.on("reInit", syncHandler);
    carouselApi.on("destroy", () => {
      carouselApi.off("select", syncHandler);
      carouselApi.off("reInit", syncHandler);
      group.delete(carouselApi);
      if (group.size === 0) {
        syncedSliderGroups.delete(syncId);
      }
    });
  }
  var carouselLibraryLoaded, loadPromise, pendingSliders, syncedSliderGroups, VIEWPORT_SELECTOR, CONTAINER_SELECTOR;
  var init_carousel = __esm({
    "src/components/carousel.js"() {
      init_helpers();
      init_jsdelivr();
      init_logger();
      carouselLibraryLoaded = false;
      loadPromise = null;
      pendingSliders = [];
      syncedSliderGroups = /* @__PURE__ */ new Map();
      VIEWPORT_SELECTOR = ".carousel-wrapper, [carousel-wrapper]";
      CONTAINER_SELECTOR = ".carousel, [carousel]";
    }
  });

  // src/components/tabs.js
  function initTabs(options = {}) {
    if (typeof document === "undefined") {
      logger.warn("[Tabs] document is undefined (SSR) - skipping init.");
      return () => {
      };
    }
    const roots = options.rootElements || Array.from(document.querySelectorAll(options.rootSelector || SELECTORS.root));
    if (!roots.length) {
      logger.info("[Tabs] No tabs found on the page - nothing to initialize.");
      return () => {
      };
    }
    let initializedCount = 0;
    roots.forEach((root) => {
      if (instances.has(root))
        return;
      const cleanup = createTabsInstance(root);
      if (cleanup) {
        instances.set(root, cleanup);
        initializedCount += 1;
      }
    });
    if (initializedCount > 0) {
      logger.log(`\u{1F9ED} Tabs ready (${initializedCount} instance${initializedCount > 1 ? "s" : ""})`);
    }
    return () => cleanupTabs();
  }
  function cleanupTabs() {
    instances.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Tabs Cleanup");
      }
    });
    instances.clear();
  }
  function createTabsInstance(root) {
    const buttons = Array.from(root.querySelectorAll(SELECTORS.button));
    const panels = Array.from(root.querySelectorAll(SELECTORS.panel));
    if (!buttons.length || buttons.length !== panels.length)
      return null;
    instanceCounter += 1;
    const instanceId = instanceCounter;
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoplayEnabled = getBooleanAttr(root, "data-tabs-autoplay", false);
    const autoplayMs = getNumberAttr(root, "data-tabs-autoplay-delay", DEFAULT_AUTOPLAY_MS);
    const pauseOnHover = getBooleanAttr(root, "data-tabs-autoplay-pause-on-hover", false);
    const pauseOnFocus = getBooleanAttr(root, "data-tabs-autoplay-pause-on-focus", false);
    const pauseOnHidden = getBooleanAttr(root, "data-tabs-autoplay-pause-on-hidden", true);
    const scrollActive = getBooleanAttr(root, "data-tabs-scroll-active", true);
    const animateContent = getBooleanAttr(root, "data-tabs-animate", true);
    const loopTabs = getBooleanAttr(root, "data-tabs-loop", true);
    const activateOn = root.getAttribute("data-tabs-activate-on") || "click";
    const activeClass = root.getAttribute("data-tabs-active-class") || "active";
    const stopAutoplayOnFirstInteraction = getBooleanAttr(
      root,
      "data-stop-autoplay-on-first-interaction",
      false
    );
    const advanceOnVideoEnd = root.hasAttribute("data-tabs-advance-on-video-end");
    const presetIndex = findPresetIndex(buttons, activeClass);
    let activeIndex = presetIndex > -1 ? presetIndex : 0;
    let hasInitialized = false;
    const observerSupported = typeof IntersectionObserver !== "undefined";
    let isInView = false;
    let isPaused = false;
    let isAutoplayStopped = false;
    let hasUserInteracted = false;
    let timerId = null;
    let remainingMs = autoplayMs;
    let cycleStartTs = 0;
    let videoEndedCleanup = null;
    let setActiveTransitionId = 0;
    const cleanupHandlers = [];
    const now = () => window.performance ? performance.now() : Date.now();
    const setPanelVisibility = (panel, isVisible) => {
      if (!panel)
        return;
      panel.hidden = !isVisible;
      panel.style.display = isVisible ? "" : "none";
    };
    const getVideosInPanel = (panel) => {
      if (!panel)
        return [];
      if (panel.tagName && panel.tagName.toLowerCase() === "video")
        return [panel];
      return Array.from(panel.querySelectorAll(SELECTORS.video));
    };
    const pausePanelVideos = (panel) => {
      getVideosInPanel(panel).forEach((v) => {
        try {
          v.pause();
        } catch (e2) {
        }
      });
    };
    const playPanelVideos = (panel) => {
      const videos = getVideosInPanel(panel);
      const first = videos[0];
      if (!first)
        return;
      first.muted = true;
      const playPromise = first.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
        });
      }
    };
    const setupVideoAdvance = (panel, currentIdx) => {
      if (videoEndedCleanup) {
        videoEndedCleanup();
        videoEndedCleanup = null;
      }
      const videos = getVideosInPanel(panel);
      const firstVideo = videos[0];
      if (!firstVideo || !advanceOnVideoEnd)
        return;
      const onEnded = () => {
        const nextIdx = getNextIndex(currentIdx, buttons.length, loopTabs);
        if (nextIdx !== currentIdx) {
          setActive(nextIdx, false);
        }
      };
      firstVideo.addEventListener("ended", onEnded);
      videoEndedCleanup = () => {
        firstVideo.removeEventListener("ended", onEnded);
        videoEndedCleanup = null;
      };
      firstVideo.muted = true;
      const playPromise = firstVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
        });
      }
    };
    panels.forEach((panel, idx) => {
      setPanelVisibility(panel, false);
      panel.classList.remove(activeClass);
      if (animateContent) {
        const items = panel.querySelectorAll(SELECTORS.panelElement);
        items.forEach((el) => {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        });
      }
      if (idx === activeIndex) {
        setPanelVisibility(panel, true);
        panel.classList.add(activeClass);
      }
    });
    const getProgressEl = (idx) => buttons[idx]?.querySelector(SELECTORS.progress) || null;
    const setProgressInstant = (idx, percent) => {
      const progress = getProgressEl(idx);
      if (!progress)
        return;
      progress.style.transition = "none";
      progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      void progress.offsetWidth;
    };
    const animateProgressToEnd = (idx, ms) => {
      const progress = getProgressEl(idx);
      if (!progress)
        return;
      progress.style.transition = "none";
      void progress.offsetWidth;
      progress.style.transition = `width ${ms}ms linear`;
      progress.style.width = "100%";
    };
    const getTabsScroller = () => {
      const explicit = root.querySelector(SELECTORS.scrollWrap);
      if (explicit)
        return explicit;
      const btn0 = buttons[0];
      if (!btn0)
        return null;
      let el = btn0.parentElement;
      while (el && el !== root) {
        const cs = window.getComputedStyle(el);
        const ox = cs.overflowX;
        const canScroll = (ox === "auto" || ox === "scroll") && el.scrollWidth > el.clientWidth + 2;
        if (canScroll)
          return el;
        el = el.parentElement;
      }
      return null;
    };
    const scrollActiveTabIntoView = (idx) => {
      if (!scrollActive)
        return;
      const scroller = getTabsScroller();
      const btn = buttons[idx];
      if (!scroller || !btn)
        return;
      const behavior = prefersReducedMotion ? "auto" : "smooth";
      const scrollerRect = scroller.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const btnCenter = btnRect.left - scrollerRect.left + btnRect.width / 2;
      const desiredLeft = btnCenter - scroller.clientWidth / 2;
      const nextScrollLeft = Math.max(
        0,
        Math.min(scroller.scrollWidth - scroller.clientWidth, scroller.scrollLeft + desiredLeft)
      );
      scroller.scrollTo({ left: nextScrollLeft, behavior });
    };
    const pauseAutoplayAndProgress = () => {
      if (!autoplayEnabled)
        return;
      if (advanceOnVideoEnd && videoEndedCleanup) {
        videoEndedCleanup();
        videoEndedCleanup = null;
      }
      if (isAutoplayStopped) {
        setProgressInstant(activeIndex, 100);
        return;
      }
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (cycleStartTs) {
        const elapsed = now() - cycleStartTs;
        remainingMs = Math.max(0, remainingMs - elapsed);
      }
      cycleStartTs = 0;
      const percent = 100 * (1 - remainingMs / autoplayMs);
      setProgressInstant(activeIndex, percent);
    };
    const startAutoplayAndProgress = () => {
      if (!autoplayEnabled || !isInView || isPaused || isAutoplayStopped)
        return;
      if (advanceOnVideoEnd) {
        const nextPanel = panels[activeIndex];
        setupVideoAdvance(nextPanel, activeIndex);
        return;
      }
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (remainingMs <= 0) {
        remainingMs = autoplayMs;
        setActive(getNextIndex(activeIndex, buttons.length, loopTabs), false);
        return;
      }
      const percent = 100 * (1 - remainingMs / autoplayMs);
      setProgressInstant(activeIndex, percent);
      animateProgressToEnd(activeIndex, remainingMs);
      cycleStartTs = now();
      timerId = window.setTimeout(() => {
        remainingMs = autoplayMs;
        setActive(getNextIndex(activeIndex, buttons.length, loopTabs), false);
      }, remainingMs);
    };
    const resetCycle = () => {
      remainingMs = autoplayMs;
      cycleStartTs = 0;
    };
    const animateInContentElements = (panel) => {
      if (!panel || !animateContent)
        return;
      const items = Array.from(panel.querySelectorAll(SELECTORS.panelElement));
      if (!items.length)
        return;
      const gsap2 = typeof window !== "undefined" && window.gsap;
      if (!gsap2)
        return;
      const duration = prefersReducedMotion ? 0.25 : 0.5;
      const stagger = prefersReducedMotion ? 0.02 : 0.05;
      const fromY = prefersReducedMotion ? 0 : 20;
      const fromBlur = prefersReducedMotion ? 0 : 8;
      const fromScale = prefersReducedMotion ? 1 : 0.98;
      gsap2.timeline().set(items, {
        opacity: 0,
        y: fromY,
        pointerEvents: "auto",
        filter: `blur(${fromBlur}px)`,
        scale: fromScale
      }).to(items, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        duration,
        stagger,
        ease: "power2.out"
      });
    };
    const animateOutContentElements = (panel) => new Promise((resolve) => {
      if (!panel || !animateContent)
        return resolve();
      const items = Array.from(panel.querySelectorAll(SELECTORS.panelElement));
      if (!items.length)
        return resolve();
      const gsap2 = typeof window !== "undefined" && window.gsap;
      if (!gsap2)
        return resolve();
      const duration = prefersReducedMotion ? 0.2 : 0.3;
      const stagger = prefersReducedMotion ? 0.02 : 0.04;
      const toY = prefersReducedMotion ? 0 : -10;
      const toBlur = prefersReducedMotion ? 0 : 6;
      const toScale = prefersReducedMotion ? 1 : 0.98;
      gsap2.killTweensOf(items);
      gsap2.to(items, {
        opacity: 0,
        y: toY,
        filter: `blur(${toBlur}px)`,
        scale: toScale,
        duration,
        stagger,
        ease: "power2.in",
        onComplete: () => {
          items.forEach((el) => el.style.pointerEvents = "none");
          resolve();
        }
      });
    });
    const setActive = (index, userTriggered) => {
      if (index < 0 || index >= buttons.length)
        return Promise.resolve();
      if (index === activeIndex && hasInitialized)
        return Promise.resolve();
      const thisTransitionId = ++setActiveTransitionId;
      if (userTriggered && stopAutoplayOnFirstInteraction && !hasUserInteracted) {
        hasUserInteracted = true;
        isAutoplayStopped = true;
        isPaused = true;
        if (timerId) {
          clearTimeout(timerId);
          timerId = null;
        }
        remainingMs = autoplayMs;
        cycleStartTs = 0;
      }
      pauseAutoplayAndProgress();
      resetCycle();
      const prevIndex = activeIndex;
      const prevPanel = hasInitialized ? panels[prevIndex] : null;
      const nextPanel = panels[index];
      if (!nextPanel)
        return Promise.resolve();
      activeIndex = index;
      buttons.forEach((btn, i) => {
        const isActive = i === index;
        btn.classList.toggle(activeClass, isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
        const progress = btn.querySelector(SELECTORS.progress);
        if (progress) {
          progress.style.transition = "none";
          progress.style.width = "0%";
          void progress.offsetWidth;
        }
      });
      scrollActiveTabIntoView(index);
      setPanelVisibility(nextPanel, true);
      nextPanel.classList.add(activeClass);
      nextPanel.setAttribute("aria-hidden", "false");
      panels.forEach((panel) => {
        if (panel !== nextPanel && panel !== prevPanel) {
          panel.classList.remove(activeClass);
          setPanelVisibility(panel, false);
          panel.setAttribute("aria-hidden", "true");
        }
      });
      const outPromise = prevPanel && prevPanel !== nextPanel ? animateOutContentElements(prevPanel) : Promise.resolve();
      return outPromise.then(() => {
        if (thisTransitionId !== setActiveTransitionId)
          return;
        panels.forEach((panel) => {
          if (panel !== nextPanel) {
            panel.classList.remove(activeClass);
            setPanelVisibility(panel, false);
            panel.setAttribute("aria-hidden", "true");
          }
        });
        animateInContentElements(nextPanel);
        hasInitialized = true;
        pausePanelVideos(prevPanel);
        playPanelVideos(nextPanel);
        if (autoplayEnabled && isInView && !isPaused && !isAutoplayStopped) {
          startAutoplayAndProgress();
        } else if (isAutoplayStopped) {
          setProgressInstant(activeIndex, 100);
        }
        root.dispatchEvent(
          new CustomEvent("tabs:change", {
            detail: {
              index,
              button: buttons[index],
              panel: nextPanel,
              reason: userTriggered ? "user" : "auto"
            },
            bubbles: true
          })
        );
      });
    };
    const focusButton = (idx) => {
      const btn = buttons[idx];
      if (!btn)
        return;
      try {
        btn.focus({ preventScroll: true });
      } catch (error) {
        btn.focus();
      }
    };
    const onButtonKeydown = (event, idx) => {
      const key = event.key;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        setActive(idx, true);
        return;
      }
      if (key === "ArrowRight" || key === "ArrowLeft" || key === "Home" || key === "End") {
        event.preventDefault();
        let nextIndex = idx;
        if (key === "ArrowRight")
          nextIndex = getNextIndex(idx, buttons.length, loopTabs);
        if (key === "ArrowLeft")
          nextIndex = getPrevIndex(idx, buttons.length, loopTabs);
        if (key === "Home")
          nextIndex = 0;
        if (key === "End")
          nextIndex = buttons.length - 1;
        setActive(nextIndex, true).then(() => focusButton(nextIndex));
      }
    };
    const listElement = root.querySelector(SELECTORS.list) || buttons[0].parentElement;
    if (listElement && !listElement.hasAttribute("role")) {
      listElement.setAttribute("role", "tablist");
    }
    buttons.forEach((btn, i) => {
      const btnId = `tabs-btn-${instanceId}-${i}`;
      const panelId = `tabs-panel-${instanceId}-${i}`;
      const isActive = i === activeIndex;
      btn.id = btn.id || btnId;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", panelId);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.setAttribute("tabindex", isActive ? "0" : "-1");
      btn.classList.toggle(activeClass, isActive);
      panels[i].id = panels[i].id || panelId;
      panels[i].setAttribute("role", "tabpanel");
      panels[i].setAttribute("aria-labelledby", btn.id);
      panels[i].setAttribute("aria-hidden", isActive ? "false" : "true");
      const onClick = (evt) => {
        evt.preventDefault();
        setActive(i, true);
      };
      const onHover = () => {
        if (activateOn === "hover")
          setActive(i, true);
      };
      const onKeydown = (evt) => onButtonKeydown(evt, i);
      btn.addEventListener("click", onClick);
      btn.addEventListener("keydown", onKeydown);
      cleanupHandlers.push(() => btn.removeEventListener("click", onClick));
      cleanupHandlers.push(() => btn.removeEventListener("keydown", onKeydown));
      if (activateOn === "hover") {
        btn.addEventListener("mouseenter", onHover);
        cleanupHandlers.push(() => btn.removeEventListener("mouseenter", onHover));
      }
    });
    if (pauseOnHover) {
      const onEnter = () => {
        isPaused = true;
        pauseAutoplayAndProgress();
      };
      const onLeave = () => {
        isPaused = false;
        startAutoplayAndProgress();
      };
      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);
      cleanupHandlers.push(() => root.removeEventListener("mouseenter", onEnter));
      cleanupHandlers.push(() => root.removeEventListener("mouseleave", onLeave));
    }
    if (pauseOnFocus) {
      const onFocusIn = () => {
        isPaused = true;
        pauseAutoplayAndProgress();
      };
      const onFocusOut = () => {
        isPaused = false;
        startAutoplayAndProgress();
      };
      root.addEventListener("focusin", onFocusIn);
      root.addEventListener("focusout", onFocusOut);
      cleanupHandlers.push(() => root.removeEventListener("focusin", onFocusIn));
      cleanupHandlers.push(() => root.removeEventListener("focusout", onFocusOut));
    }
    if (pauseOnHidden) {
      const onVisibility = () => {
        if (document.hidden) {
          pauseAutoplayAndProgress();
        } else {
          startAutoplayAndProgress();
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanupHandlers.push(() => document.removeEventListener("visibilitychange", onVisibility));
    }
    const observer = observerSupported ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== root)
            return;
          if (entry.isIntersecting) {
            isInView = true;
            if (hasInitialized) {
              scrollActiveTabIntoView(activeIndex);
              startAutoplayAndProgress();
            } else {
              setActive(activeIndex, false).then(() => {
                startAutoplayAndProgress();
              });
            }
          } else {
            isInView = false;
            pauseAutoplayAndProgress();
          }
        });
      },
      { threshold: 0.2 }
    ) : null;
    if (observer) {
      observer.observe(root);
    } else {
      isInView = true;
      setActive(activeIndex, false).then(() => {
        startAutoplayAndProgress();
      });
    }
    return () => {
      if (videoEndedCleanup) {
        videoEndedCleanup();
        videoEndedCleanup = null;
      }
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      if (observer)
        observer.disconnect();
      cleanupHandlers.forEach((cleanup) => cleanup());
      cleanupHandlers.length = 0;
    };
  }
  function getBooleanAttr(element, attr, fallback) {
    if (!element || !element.hasAttribute(attr))
      return fallback;
    const value = element.getAttribute(attr);
    if (value === "" || value === "true")
      return true;
    if (value === "false")
      return false;
    return Boolean(value);
  }
  function getNumberAttr(element, attr, fallback) {
    if (!element || !element.hasAttribute(attr))
      return fallback;
    const value = Number(element.getAttribute(attr));
    return Number.isFinite(value) ? value : fallback;
  }
  function findPresetIndex(buttons, activeClass) {
    const byActive = buttons.findIndex((btn) => btn.classList.contains(activeClass));
    if (byActive > -1)
      return byActive;
    const byIsActive = buttons.findIndex((btn) => btn.classList.contains("is-active"));
    if (byIsActive > -1)
      return byIsActive;
    return -1;
  }
  function getNextIndex(current, total, loop) {
    if (current + 1 < total)
      return current + 1;
    return loop ? 0 : total - 1;
  }
  function getPrevIndex(current, total, loop) {
    if (current - 1 >= 0)
      return current - 1;
    return loop ? total - 1 : 0;
  }
  var DEFAULT_AUTOPLAY_MS, instances, instanceCounter, SELECTORS;
  var init_tabs = __esm({
    "src/components/tabs.js"() {
      init_helpers();
      init_logger();
      DEFAULT_AUTOPLAY_MS = 5e3;
      instances = /* @__PURE__ */ new Map();
      instanceCounter = 0;
      SELECTORS = {
        root: "[tabs-comp]",
        list: "[tabs-list]",
        button: "[tabs-btn]",
        panel: "[tabs-content]",
        panelElement: "[tabs-content-element]",
        scrollWrap: "[tabs-scroll-wrap]",
        progress: ".tab-btn-progress, [tab-btn-progress]",
        video: "video"
      };
    }
  });

  // src/pages/home.js
  var home_exports = {};
  __export(home_exports, {
    cleanupHomePage: () => cleanupHomePage,
    initHomePage: () => initHomePage
  });
  async function initHomePage() {
    logger.log("\u{1F3E0} Home page initialized");
    try {
      initCarousel();
      initTabs();
      cleanupFunctions3.push(() => {
        try {
          cleanupCarousels();
        } catch (error) {
          handleError(error, "Home Page Carousel Cleanup");
        }
      });
      cleanupFunctions3.push(() => {
        try {
          destroyCarousels();
        } catch (error) {
          handleError(error, "Home Page Carousel Cleanup");
        }
      });
      cleanupFunctions3.push(() => {
        try {
          cleanupTabs();
        } catch (error) {
          handleError(error, "Home Page Tabs Cleanup");
        }
      });
    } catch (error) {
      handleError(error, "Home Page Initialization");
    }
  }
  function cleanupHomePage() {
    cleanupFunctions3.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Home Page Cleanup");
      }
    });
    cleanupFunctions3.length = 0;
  }
  var cleanupFunctions3;
  var init_home = __esm({
    "src/pages/home.js"() {
      init_helpers();
      init_logger();
      init_carousel();
      init_tabs();
      cleanupFunctions3 = [];
    }
  });

  // src/global/finsweet.js
  function ensureFinsweetGlobal() {
    if (typeof window === "undefined") {
      throw new Error("FinsweetService can only run in a browser environment.");
    }
    window.FinsweetAttributes || (window.FinsweetAttributes = []);
    return window.FinsweetAttributes;
  }
  var FinsweetService, finsweetService;
  var init_finsweet = __esm({
    "src/global/finsweet.js"() {
      init_logger();
      FinsweetService = class {
        constructor() {
          this.attributePromises = /* @__PURE__ */ new Map();
          this.listInstances = void 0;
          this.disposers = [];
          this.listReadyPromise = this.waitForAttribute("list").then((api) => {
            this.listInstances = api;
            return api;
          });
        }
        waitForAttribute(key) {
          if (this.attributePromises.has(key)) {
            return this.attributePromises.get(key);
          }
          const maybeLoaded = this.resolveImmediatelyIfLoaded(key);
          if (maybeLoaded) {
            const p = maybeLoaded;
            this.attributePromises.set(key, p);
            return p;
          }
          const promise = new Promise((resolve) => {
            const global = ensureFinsweetGlobal();
            global.push([
              key,
              (api) => {
                resolve(api);
              }
            ]);
          });
          this.attributePromises.set(key, promise);
          return promise;
        }
        async restartAttribute(key) {
          const global = ensureFinsweetGlobal();
          if (global && typeof global === "object" && "modules" in global) {
            const controls = global.modules?.[key];
            if (controls) {
              if (typeof controls.restart === "function") {
                controls.restart();
              }
              const maybePromise = controls.loading;
              return maybePromise && typeof maybePromise.then === "function" ? maybePromise : Promise.resolve(maybePromise);
            }
          }
          return this.waitForAttribute(key);
        }
        whenListReady() {
          return this.listReadyPromise;
        }
        getListInstances() {
          return this.listInstances;
        }
        getListArray() {
          const listsApi = this.listInstances;
          if (Array.isArray(listsApi))
            return listsApi;
          if (listsApi && typeof listsApi === "object")
            return Object.values(listsApi);
          return [];
        }
        registerHook(phase, callback) {
          this.registerHookInternal(phase, (list, items) => {
            callback(list, items);
            return items;
          });
        }
        /**
         * Register a hook that can return modified items (for filter, sort, beforeRender phases).
         * Callback return value is passed to the next lifecycle phase.
         */
        registerHookMutable(phase, callback) {
          this.registerHookInternal(phase, (list, items) => {
            const result = callback(list, items);
            return result !== void 0 ? result : items;
          });
        }
        registerHookInternal(phase, callback) {
          this.whenListReady().then((listsApi) => {
            const instances2 = Array.isArray(listsApi) ? listsApi : listsApi && typeof listsApi === "object" ? Object.values(listsApi) : [];
            instances2.forEach((list) => {
              if (list && typeof list.addHook === "function") {
                list.addHook(phase, (items) => callback(list, items));
              }
            });
          });
        }
        onStart(cb) {
          this.registerHook("start", cb);
        }
        onFilter(cb) {
          this.registerHook("filter", cb);
        }
        onSort(cb) {
          this.registerHookMutable("sort", cb);
        }
        onPagination(cb) {
          this.registerHook("pagination", cb);
        }
        onBeforeRender(cb) {
          this.registerHookMutable("beforeRender", cb);
        }
        onRender(cb) {
          this.registerHook("render", cb);
        }
        onAfterRender(cb) {
          this.registerHook("afterRender", cb);
        }
        onListChange(source, callback, options) {
          const disposeTasks = [];
          this.getListArray().forEach((list) => {
            if (list && typeof list.watch === "function") {
              const stop = list.watch(source(list), callback(list), options);
              if (typeof stop === "function") {
                disposeTasks.push(stop);
              }
            }
          });
          const cleanup = () => {
            disposeTasks.forEach((dispose) => {
              try {
                dispose();
              } catch (error) {
                logger.warn("[FinsweetService] Failed to dispose watcher", error);
              }
            });
          };
          this.disposers.push(cleanup);
          return cleanup;
        }
        addEffect(effectCallback, options) {
          const disposeTasks = [];
          this.getListArray().forEach((list) => {
            if (list && typeof list.effect === "function") {
              const stop = list.effect(effectCallback(list), options);
              if (typeof stop === "function") {
                disposeTasks.push(stop);
              }
            }
          });
          const cleanup = () => {
            disposeTasks.forEach((dispose) => {
              try {
                dispose();
              } catch (error) {
                logger.warn("[FinsweetService] Failed to dispose effect", error);
              }
            });
          };
          this.disposers.push(cleanup);
          return cleanup;
        }
        /**
         * Get the list instance by attribute
         * @param attribute - The attribute to get the list instance for (e.g. 'data-products-list')
         * @returns The finsweet list instance
         */
        async getListByAttribute(attribute) {
          const listsApi = await this.whenListReady();
          const listArray = Array.isArray(listsApi) ? listsApi : listsApi && typeof listsApi === "object" ? Object.values(listsApi) : [];
          const targetList = listArray.find(
            (list) => list?.listElement?.attributes.getNamedItem(attribute)
          );
          if (!targetList)
            return void 0;
          const loaders = [];
          if (targetList.loadingSearchParamsData)
            loaders.push(targetList.loadingSearchParamsData);
          if (targetList.loadingPaginationElements)
            loaders.push(targetList.loadingPaginationElements);
          if (targetList.loadingPaginatedItems)
            loaders.push(targetList.loadingPaginatedItems);
          if (loaders.length) {
            try {
              await Promise.all(loaders);
            } catch (err) {
              logger.warn("[FinsweetService] Target list loaders rejected", err);
            }
          }
          return targetList;
        }
        async getListByInstance(instanceKey) {
          if (!instanceKey)
            return void 0;
          const listsApi = await this.whenListReady();
          const listArray = Array.isArray(listsApi) ? listsApi : listsApi && typeof listsApi === "object" ? Object.values(listsApi) : [];
          return listArray.find((list) => list?.instance === instanceKey);
        }
        /**
         * Clears all filter conditions except the specified condition for the provided
         * list instance. If the specified condition is missing, all conditions are
         * removed. This keeps the source-of-truth inside Finsweet in sync when the
         * dataset (mode) changes.
         */
        clearFiltersExceptFor(listInstance, exceptFor = []) {
          if (!listInstance)
            return;
          const filtersGroup = listInstance?.filters?.value?.groups?.[0];
          if (!filtersGroup)
            return;
          const typeCondition = filtersGroup.conditions.find((c) => exceptFor?.includes(c.fieldKey));
          if (typeCondition) {
            const plainTypeCondition = JSON.parse(JSON.stringify(typeCondition));
            filtersGroup.conditions.splice(0, filtersGroup.conditions.length, plainTypeCondition);
          } else {
            logger.warn("[FinsweetService] No condition found. Clearing all filters.");
            filtersGroup.conditions.splice(0, filtersGroup.conditions.length);
          }
        }
        /**
         * Clears filters by removing specific conditions or all conditions if none specified
         * @param listInstance – the list instance to clear filters for
         * @param specificConditionKeys – the condition keys to remove (if empty, removes all)
         */
        clearFilters(listInstance, specificConditionKeys = []) {
          if (!listInstance)
            return;
          const filtersGroup = listInstance?.filters?.value?.groups?.[0];
          if (!filtersGroup)
            return;
          if (specificConditionKeys.length === 0) {
            filtersGroup.conditions.splice(0, filtersGroup.conditions.length);
          } else {
            for (const condition of [...filtersGroup.conditions]) {
              if (specificConditionKeys.includes(condition.fieldKey)) {
                filtersGroup.conditions.splice(filtersGroup.conditions.indexOf(condition), 1);
              }
            }
          }
        }
        dispose() {
          this.disposers.forEach((dispose) => {
            try {
              dispose();
            } catch (error) {
              logger.warn("[FinsweetService] Failed to run disposer", error);
            }
          });
          this.disposers.length = 0;
        }
        resolveImmediatelyIfLoaded(key) {
          const global = ensureFinsweetGlobal();
          if (global && typeof global === "object" && "modules" in global) {
            const controls = global.modules?.[key];
            if (controls) {
              const maybePromise = controls.loading;
              return maybePromise && typeof maybePromise.then === "function" ? maybePromise : Promise.resolve(maybePromise);
            }
          }
          return void 0;
        }
      };
      finsweetService = new FinsweetService();
    }
  });

  // src/pages/program.js
  var program_exports = {};
  __export(program_exports, {
    cleanupProgramPage: () => cleanupProgramPage,
    initProgramPage: () => initProgramPage
  });
  async function initProgramPage() {
    logger.log("\u{1F4D8} Program page initialized");
    try {
      initDurationRangeLabels();
      initNestedSectorsVisibility();
      await finsweetService.waitForAttribute("list");
    } catch (error) {
      handleError(error, "Program Page Initialization");
    }
  }
  function cleanupProgramPage() {
    cleanupFunctions4.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Program Page Cleanup");
      }
    });
    cleanupFunctions4.length = 0;
    logger.log("\u{1F9F9} Program page cleanup");
  }
  function initDurationRangeLabels() {
    const wrappers = document.querySelectorAll(
      '[fs-rangeslider-element="wrapper"].program-form__range'
    );
    if (!wrappers.length)
      return;
    wrappers.forEach((wrapper) => {
      const displayValueEl = wrapper.querySelector('[fs-rangeslider-element="display-value"]');
      if (!displayValueEl)
        return;
      const valueContainer = wrapper.querySelector("[data-filter-value]") || displayValueEl.parentElement;
      if (!valueContainer)
        return;
      const renderUnit = () => {
        const rawValue = Number.parseInt(displayValueEl.textContent || "", 10);
        const unit = rawValue === 1 ? "month" : "months";
        let unitEl = valueContainer.querySelector("[data-duration-unit]");
        if (!unitEl) {
          Array.from(valueContainer.childNodes).forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE)
              return;
            if (/month/i.test(node.textContent || "")) {
              valueContainer.removeChild(node);
            }
          });
          unitEl = document.createElement("span");
          unitEl.setAttribute("data-duration-unit", "");
          valueContainer.append(" ");
          valueContainer.appendChild(unitEl);
        }
        unitEl.textContent = unit;
      };
      const observer = new MutationObserver(renderUnit);
      observer.observe(displayValueEl, {
        childList: true,
        characterData: true,
        subtree: true
      });
      renderUnit();
      cleanupFunctions4.push(() => observer.disconnect());
    });
  }
  function initNestedSectorsVisibility() {
    const targetSelector = '[fs-list-element="nest-target"][fs-list-nest="sectors"]';
    const updateTargetState = (target) => {
      if (!(target instanceof Element))
        return;
      const hasVisibleItems = Array.from(target.querySelectorAll(".w-dyn-item")).some((item) => {
        const text = item.textContent || "";
        return text.trim().length > 0;
      });
      target.classList.toggle("is-nest-ready", hasVisibleItems);
    };
    const updateAllTargets = () => {
      document.querySelectorAll(targetSelector).forEach((target) => updateTargetState(target));
    };
    updateAllTargets();
    let rafId = 0;
    const observer = new MutationObserver(() => {
      if (rafId)
        cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updateAllTargets();
        rafId = 0;
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    cleanupFunctions4.push(() => {
      if (rafId)
        cancelAnimationFrame(rafId);
      observer.disconnect();
    });
  }
  var cleanupFunctions4;
  var init_program = __esm({
    "src/pages/program.js"() {
      init_helpers();
      init_logger();
      init_finsweet();
      cleanupFunctions4 = [];
    }
  });

  // src/components/toc.js
  function initProgramToc(options = {}) {
    if (typeof document === "undefined")
      return () => {
      };
    const config = {
      ...DEFAULT_OPTIONS,
      ...options
    };
    const roots = Array.from(document.querySelectorAll(config.rootSelector));
    if (!roots.length)
      return () => {
      };
    const cleanups = roots.map((root) => createTocInstance(root, config)).filter((cleanup) => typeof cleanup === "function");
    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }
  function createTocInstance(root, config) {
    const links = Array.from(root.querySelectorAll(config.linkSelector));
    if (!links.length)
      return () => {
      };
    const sectionMap = buildSectionMap();
    const linkItems = links.map((link) => preprocessLinkTarget(link, root, config, sectionMap)).filter(Boolean);
    if (!linkItems.length) {
      logger.warn("[ToC] No valid target sections found for ToC links.");
      return () => {
      };
    }
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("is-toc-ready");
    if (prefersReducedMotion) {
      root.classList.add("is-reduced-motion");
    }
    let activeLink = null;
    let observer = null;
    let ticking = false;
    let lenisUnsubscribe = null;
    const readingLineY = () => getActivationLine(config.offset, true);
    const setActive = (nextLink) => {
      if (activeLink === nextLink)
        return;
      linkItems.forEach(({ link, inner }) => {
        if (link !== nextLink) {
          link.removeAttribute("aria-current");
          inner.classList.remove(config.activeClass);
        }
      });
      if (!nextLink) {
        activeLink = null;
        return;
      }
      const next = linkItems.find((item) => item.link === nextLink);
      if (!next)
        return;
      next.link.setAttribute("aria-current", config.ariaCurrentValue);
      next.inner.classList.add(config.activeClass);
      activeLink = next.link;
    };
    const pickActiveItem = (lineY) => {
      let idx = 0;
      for (let i = 0; i < linkItems.length; i += 1) {
        const rect = linkItems[i].target.getBoundingClientRect();
        if (rect.top <= lineY)
          idx = i;
      }
      return linkItems[idx] || null;
    };
    const updateByViewport = () => {
      const candidate = pickActiveItem(readingLineY());
      setActive(candidate?.link || null);
    };
    const progressHost = (item) => item.progressHost || item.inner;
    const updateProgressAndPast = () => {
      const activeIndex = linkItems.findIndex((item) => item.link === activeLink);
      const lineY = readingLineY();
      const lastIndex = linkItems.length - 1;
      for (let i = 0; i < linkItems.length; i += 1) {
        const current = linkItems[i];
        const { inner } = current;
        const host = progressHost(current);
        const isLast = i === lastIndex;
        if (activeIndex >= 0 && i < activeIndex) {
          inner.classList.add(config.pastClass);
        } else {
          inner.classList.remove(config.pastClass);
        }
        if (!config.useProgress || isLast) {
          host.style.setProperty(config.progressVarName, "0");
          continue;
        }
        const next = linkItems[i + 1];
        const s0 = current.target.getBoundingClientRect().top;
        const s1 = next ? next.target.getBoundingClientRect().top : document.documentElement.getBoundingClientRect().bottom;
        const range = Math.max(1, s1 - s0);
        const rawProgress = (lineY - s0) / range;
        const progress = clamp(rawProgress, 0, 1);
        if (current.link === activeLink) {
          host.style.setProperty(config.progressVarName, String(progress));
        } else {
          host.style.setProperty(config.progressVarName, "0");
        }
      }
    };
    const queueSync = () => {
      if (ticking)
        return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateByViewport();
        updateProgressAndPast();
      });
    };
    const onClickHandlers = linkItems.map((item) => {
      const handler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setActive(item.link);
        const targetIsOffsetAnchor = item.target.classList.contains("offset-link") || item.target.hasAttribute("data-scroll-offset-anchor");
        scrollToTarget(item.target, {
          duration: config.scrollDuration,
          offset: config.scrollOffset,
          includeNavbarOffset: !targetIsOffsetAnchor,
          prefersReducedMotion
        });
      };
      item.link.addEventListener("click", handler);
      return () => item.link.removeEventListener("click", handler);
    });
    observer = new IntersectionObserver(
      () => {
        queueSync();
      },
      {
        root: null,
        rootMargin: `-${Math.round(readingLineY())}px 0px -35% 0px`,
        threshold: config.observerThreshold
      }
    );
    linkItems.forEach((item) => observer.observe(item.target));
    window.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);
    const attachLenisScroll = () => {
      const lenis2 = getLenis();
      if (!lenis2 || typeof lenis2.on !== "function")
        return null;
      const onLenisScroll = () => queueSync();
      lenis2.on("scroll", onLenisScroll);
      if (typeof lenis2.off === "function") {
        return () => lenis2.off("scroll", onLenisScroll);
      }
      return () => {
      };
    };
    lenisUnsubscribe = attachLenisScroll();
    let lenisPollCount = 0;
    const lenisPollMax = 50;
    const lenisPollId = window.setInterval(() => {
      if (lenisUnsubscribe) {
        window.clearInterval(lenisPollId);
        return;
      }
      lenisPollCount += 1;
      if (lenisPollCount > lenisPollMax) {
        window.clearInterval(lenisPollId);
        return;
      }
      const unsub = attachLenisScroll();
      if (unsub) {
        lenisUnsubscribe = unsub;
        window.clearInterval(lenisPollId);
      }
    }, 100);
    queueSync();
    return () => {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      onClickHandlers.forEach((off) => off());
      window.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
      window.clearInterval(lenisPollId);
      if (lenisUnsubscribe) {
        lenisUnsubscribe();
        lenisUnsubscribe = null;
      }
      linkItems.forEach((item) => {
        const { link, inner } = item;
        link.removeAttribute("aria-current");
        inner.classList.remove(config.activeClass, config.pastClass);
        progressHost(item).style.removeProperty(config.progressVarName);
      });
    };
  }
  function preprocessLinkTarget(link, root, config, sectionMap) {
    const href = link.getAttribute("href") || "";
    const hash = extractHash(href);
    if (!hash)
      return null;
    const target = resolveTarget(hash, sectionMap);
    if (!target) {
      logger.warn("[ToC] Target not found for hash:", hash);
      return null;
    }
    if (!target.id) {
      target.id = slugify(hash.replace(/^#/, "")) || `toc-section-${Date.now()}`;
    }
    const canonicalHref = `#${target.id}`;
    link.setAttribute("href", canonicalHref);
    link.dataset.tocTarget = target.id;
    const inner = resolveInnerElement(link, config.innerSelector);
    if (!link.hasAttribute("aria-label")) {
      const text = (link.textContent || "").trim();
      if (text)
        link.setAttribute("aria-label", text);
    }
    if (!root.contains(link))
      return null;
    const wrap = link.closest(".program-link");
    const progressHost = wrap instanceof Element ? wrap : inner;
    return {
      link,
      inner,
      target,
      wrap,
      progressHost
    };
  }
  function buildSectionMap() {
    const byId = /* @__PURE__ */ new Map();
    const allWithId = Array.from(document.querySelectorAll("[id]"));
    allWithId.forEach((el) => {
      const id = (el.id || "").trim();
      if (!id)
        return;
      const normalizedId = normalizeHash(id);
      const slugId = slugify(id);
      if (normalizedId && !byId.has(normalizedId))
        byId.set(normalizedId, el);
      if (slugId && !byId.has(slugId))
        byId.set(slugId, el);
    });
    return byId;
  }
  function resolveTarget(hash, sectionMap) {
    const normalized = normalizeHash(hash);
    if (normalized && sectionMap.has(normalized))
      return sectionMap.get(normalized);
    const decoded = decodeHash(hash);
    const decodedNorm = normalizeHash(decoded);
    if (decodedNorm && sectionMap.has(decodedNorm))
      return sectionMap.get(decodedNorm);
    const slug = slugify(decoded || hash);
    if (slug && sectionMap.has(slug))
      return sectionMap.get(slug);
    const clean = (decoded || hash).replace(/^#/, "");
    const direct = document.getElementById(clean);
    if (direct)
      return direct;
    return null;
  }
  function extractHash(href) {
    if (!href)
      return "";
    if (href.startsWith("#"))
      return href;
    if (href.includes("#"))
      return `#${href.replace(HASH_PREFIX_REGEX, "")}`;
    return "";
  }
  function normalizeHash(value) {
    if (!value)
      return "";
    return String(value).trim().replace(/^#/, "").toLowerCase();
  }
  function decodeHash(value) {
    try {
      return decodeURIComponent(String(value || ""));
    } catch (_) {
      return String(value || "");
    }
  }
  function slugify(value) {
    return String(value || "").trim().toLowerCase().replace(/^#/, "").replace(/[\u2019'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function getActivationLine(customOffset = 0, includeNavbarOffset = true) {
    if (!includeNavbarOffset)
      return customOffset;
    const navbar = document.querySelector(".nav") || document.querySelector("[data-navbar]");
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
    return navbarHeight + customOffset;
  }
  function resolveInnerElement(link, fallbackSelector) {
    const preferred = link.closest(".program-link__inner");
    if (preferred)
      return preferred;
    if (link.matches(".program-link-text"))
      return link;
    if (fallbackSelector) {
      const matched = link.closest(fallbackSelector);
      if (matched)
        return matched;
    }
    return link;
  }
  function scrollToTarget(target, options = {}) {
    if (!target || typeof window === "undefined")
      return;
    const includeNavbarOffset = options.includeNavbarOffset !== false;
    const baseOffset = options.offset || 0;
    const offset = includeNavbarOffset ? getActivationLine(baseOffset) : baseOffset;
    const lenis2 = getLenis();
    const prefersReducedMotion = Boolean(options.prefersReducedMotion);
    if (lenis2) {
      lenis2.scrollTo(target, {
        offset: -offset,
        duration: prefersReducedMotion ? 0 : options.duration ?? 1,
        immediate: prefersReducedMotion
      });
      return;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  var DEFAULT_OPTIONS, HASH_PREFIX_REGEX;
  var init_toc = __esm({
    "src/components/toc.js"() {
      init_lenis2();
      init_logger();
      DEFAULT_OPTIONS = {
        rootSelector: ".program-card__wrap",
        linkSelector: '.program-link a[href*="#"], .program-link-text[href*="#"]',
        innerSelector: ".program-link__inner, .program-link-text",
        activeClass: "w--current",
        ariaCurrentValue: "location",
        offset: 16,
        scrollOffset: 0,
        /** Match Lenis default in `lenis.js` so TOC clicks animate like other in-page links */
        scrollDuration: 1.2,
        useProgress: true,
        progressVarName: "--toc-progress",
        /** Applied to `.program-link__inner` for sections above the current one (typography only; no filled bars). */
        pastClass: "is-toc-past",
        observerThreshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
      };
      HASH_PREFIX_REGEX = /^.*?#/;
    }
  });

  // src/components/accordion.js
  function actuallyInitAccordion(accordion) {
    if (accordionInitialized.has(accordion))
      return;
    accordionInitialized.add(accordion);
    logger.log("\u{1F3B5} Accordion initializing...");
    try {
      let toggleItem = function(item, open) {
        if (!open && !collapsible) {
          const activeCount = accordion.querySelectorAll('[data-accordion="active"]').length;
          if (activeCount <= 1)
            return;
        }
        item.setAttribute("data-accordion", open ? "active" : "not-active");
        const toggle = item.querySelector("[data-accordion-toggle]");
        if (toggle) {
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        }
        item.dispatchEvent(
          new CustomEvent("accordion:toggle", {
            detail: { open },
            bubbles: true
          })
        );
        if (closeSiblings && open) {
          accordion.querySelectorAll('[data-accordion="active"]').forEach((sib) => {
            if (sib !== item) {
              sib.setAttribute("data-accordion", "not-active");
              const sibToggle = sib.querySelector("[data-accordion-toggle]");
              if (sibToggle) {
                sibToggle.setAttribute("aria-expanded", "false");
              }
              sib.dispatchEvent(
                new CustomEvent("accordion:toggle", {
                  detail: { open: false },
                  bubbles: true
                })
              );
            }
          });
        }
      };
      const closeSiblings = accordion.getAttribute("data-accordion-close-siblings") === "true";
      const firstActive = accordion.getAttribute("data-accordion-first-active") === "true";
      const collapsible = accordion.getAttribute("data-accordion-collapsible") !== "false";
      const eventType = accordion.getAttribute("data-accordion-event") || "click";
      accordion.setAttribute("role", "region");
      if (!accordion.hasAttribute("aria-label")) {
        accordion.setAttribute("aria-label", "Accordion");
      }
      const items = accordion.querySelectorAll("[data-accordion]");
      items.forEach((item, index) => {
        const toggle = item.querySelector("[data-accordion-toggle]");
        const content = item.querySelector("[data-accordion-content]");
        if (toggle && content) {
          const contentId = content.id || `accordion-content-${Date.now()}-${index}`;
          const toggleId = toggle.id || `accordion-toggle-${Date.now()}-${index}`;
          content.id = contentId;
          toggle.id = toggleId;
          toggle.setAttribute("role", "button");
          toggle.setAttribute("aria-controls", contentId);
          toggle.setAttribute("aria-expanded", item.getAttribute("data-accordion") === "active");
          toggle.setAttribute("tabindex", "0");
          content.setAttribute("role", "region");
          content.setAttribute("aria-labelledby", toggleId);
        }
      });
      if (firstActive) {
        const first = accordion.querySelector("[data-accordion]");
        if (first) {
          first.setAttribute("data-accordion", "active");
          const toggle = first.querySelector("[data-accordion-toggle]");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "true");
          }
          first.dispatchEvent(
            new CustomEvent("accordion:toggle", {
              detail: { open: true },
              bubbles: true
            })
          );
        }
      }
      if (eventType === "hover") {
        accordion.querySelectorAll("[data-accordion-toggle]").forEach((toggle) => {
          const item = toggle.closest("[data-accordion]");
          if (!item)
            return;
          toggle.addEventListener("mouseenter", () => {
            toggleItem(item, true);
          });
        });
      } else {
        accordion.addEventListener("click", (e2) => {
          const toggle = e2.target.closest("[data-accordion-toggle]");
          if (!toggle)
            return;
          const item = toggle.closest("[data-accordion]");
          if (!item)
            return;
          const isActive = item.getAttribute("data-accordion") === "active";
          toggleItem(item, !isActive);
        });
        accordion.addEventListener("keydown", (e2) => {
          const toggle = e2.target.closest("[data-accordion-toggle]");
          if (!toggle)
            return;
          if (e2.key === "Enter" || e2.key === " ") {
            e2.preventDefault();
            const item = toggle.closest("[data-accordion]");
            if (!item)
              return;
            const isActive = item.getAttribute("data-accordion") === "active";
            toggleItem(item, !isActive);
          }
        });
      }
    } catch (error) {
      handleError(error, "Accordion Initialization");
    }
  }
  function initAccordionCSS() {
    const accordions = document.querySelectorAll('[data-accordion-list="css"]');
    if (!accordions.length)
      return;
    logger.log(`\u23F3 Found ${accordions.length} accordion(s) - will initialize when visible...`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const accordion = entry.target;
            observer.unobserve(accordion);
            accordion.setAttribute("data-accordion-observed", "true");
            actuallyInitAccordion(accordion);
          }
        });
      },
      {
        root: null,
        rootMargin: "100px",
        // Initialize 100px before accordion enters viewport
        threshold: 0
      }
    );
    accordions.forEach((accordion) => {
      observer.observe(accordion);
    });
  }
  var accordionInitialized;
  var init_accordion = __esm({
    "src/components/accordion.js"() {
      init_helpers();
      init_logger();
      accordionInitialized = /* @__PURE__ */ new Set();
    }
  });

  // src/pages/programDetail.js
  var programDetail_exports = {};
  __export(programDetail_exports, {
    cleanupProgramDetailPage: () => cleanupProgramDetailPage,
    initProgramDetailPage: () => initProgramDetailPage
  });
  function initProgramDetailPage() {
    logger.log("\u{1F4C4} Program detail page initialized");
    try {
      cleanupFunctions5.push(initProgramToc());
      cleanupFunctions5.push(initCarousel());
      cleanupFunctions5.push(initAccordionCSS());
      initRegistrationCountdown();
    } catch (error) {
      handleError(error, "Program Detail Page Initialization");
    }
  }
  function cleanupProgramDetailPage() {
    cleanupFunctions5.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Program Detail Page Cleanup");
      }
    });
    cleanupFunctions5.length = 0;
  }
  function initRegistrationCountdown() {
    const selector = ".info-warning__wrap[data-end-date]";
    const wrappers = document.querySelectorAll(selector);
    wrappers.forEach((wrapper) => {
      updateCountdownBanner(wrapper);
    });
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element))
            return;
          if (node.matches(selector)) {
            updateCountdownBanner(node);
          }
          node.querySelectorAll(selector).forEach((wrapper) => {
            updateCountdownBanner(wrapper);
          });
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    cleanupFunctions5.push(() => observer.disconnect());
  }
  function updateCountdownBanner(wrapper) {
    if (!(wrapper instanceof Element))
      return;
    const endDateRaw = wrapper.getAttribute("data-end-date");
    const date = parseDateOnly(endDateRaw);
    const target = wrapper.querySelector(".style-label") || wrapper;
    if (!date) {
      logger.warn(`[Program Detail] Invalid data-end-date value: ${endDateRaw}`);
      wrapper.classList.add("is-countdown-ready");
      return;
    }
    const sourceText = target.textContent || "";
    const daysLeft = getDaysUntil(date);
    if (sourceText.includes("{{1}}")) {
      target.textContent = sourceText.replace(/\{\{\s*1\s*\}\}/g, String(daysLeft));
    }
    wrapper.classList.add("is-countdown-ready");
  }
  function parseDateOnly(value) {
    if (!value)
      return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()))
      return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  function getDaysUntil(endDate) {
    const today = /* @__PURE__ */ new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = endDate.getTime() - startOfToday.getTime();
    const dayMs = 24 * 60 * 60 * 1e3;
    return Math.max(0, Math.ceil(diffMs / dayMs));
  }
  var cleanupFunctions5;
  var init_programDetail = __esm({
    "src/pages/programDetail.js"() {
      init_helpers();
      init_logger();
      init_toc();
      init_carousel();
      init_accordion();
      cleanupFunctions5 = [];
    }
  });

  // src/global/index.js
  init_lenis2();

  // src/global/navbar.js
  init_helpers();
  init_logger();
  var cleanupFunctions = [];
  function initNavbar() {
    logger.log("\u{1F4F1} Navbar initialized");
    try {
      const toggleElements = document.querySelectorAll("[toggle-class]");
      if (toggleElements.length) {
        const getGroupElements = (el, className) => {
          const group = el.getAttribute("toggle-group");
          return group ? document.querySelectorAll(`[toggle-class="${className}"][toggle-group="${group}"]`) : document.querySelectorAll(`[toggle-class="${className}"]:not([toggle-group])`);
        };
        const shouldRemoveOnOutside = (el) => {
          return el.getAttribute("remove-class-outside") === "true";
        };
        document.addEventListener("click", (e2) => {
          const trigger = e2.target.closest("[toggle-trigger]");
          const clicked = trigger ? trigger.closest("[toggle-class]") : e2.target.closest("[toggle-class]");
          if (clicked) {
            const className = clicked.getAttribute("toggle-class");
            const isHoverToggle = clicked.getAttribute("toggle-on") === "hover";
            const groupEls = getGroupElements(clicked, className);
            const hasClass = clicked.classList.contains(className);
            if (isHoverToggle && window.innerWidth <= 768) {
              groupEls.forEach((el) => el.classList.remove(className));
              if (!hasClass)
                clicked.classList.add(className);
              return;
            }
            if (!isHoverToggle) {
              groupEls.forEach((el) => el.classList.remove(className));
              if (!hasClass)
                clicked.classList.add(className);
            }
          } else {
            toggleElements.forEach((el) => {
              if (!shouldRemoveOnOutside(el))
                return;
              const className = el.getAttribute("toggle-class");
              el.classList.remove(className);
            });
          }
        });
        toggleElements.forEach((el) => {
          if (el.getAttribute("toggle-on") === "hover" && window.innerWidth > 768) {
            const className = el.getAttribute("toggle-class");
            const triggers = el.querySelectorAll("[toggle-trigger]");
            const groupEls = getGroupElements(el, className);
            triggers.forEach((trigger) => {
              trigger.addEventListener("mouseenter", () => {
                groupEls.forEach((i) => i.classList.remove(className));
                el.classList.add(className);
              });
            });
            if (shouldRemoveOnOutside(el)) {
              el.addEventListener("mouseleave", () => {
                el.classList.remove(className);
              });
            }
          }
        });
      }
      const nav = document.querySelector("[nav]");
      const menuBtn = document.querySelector("[menu-button]");
      if (menuBtn && nav) {
        menuBtn.addEventListener("click", () => {
          nav.classList.toggle("open");
        });
      }
    } catch (error) {
      handleError(error, "Navbar Initialization");
    }
  }
  function cleanupNavbar() {
    cleanupFunctions.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Navbar Cleanup");
      }
    });
    cleanupFunctions.length = 0;
  }

  // src/global/footer.js
  init_helpers();
  init_logger();
  var cleanupFunctions2 = [];
  function initFooter() {
    logger.log("\u{1F9B6} Footer initialized");
    const copyrightYear = document.querySelector("[data-copyright-year]");
    if (copyrightYear) {
      copyrightYear.textContent = (/* @__PURE__ */ new Date()).getFullYear();
    }
    const backToTopButton = document.querySelector("[data-back-to-top]");
    if (backToTopButton) {
      const scrollHandler = rafThrottle(() => {
        if (window.pageYOffset > 300) {
          backToTopButton.classList.add("is-visible");
        } else {
          backToTopButton.classList.remove("is-visible");
        }
      });
      window.addEventListener("scroll", scrollHandler, { passive: true });
      const handleClick = () => {
        backToTop();
      };
      backToTopButton.addEventListener("click", handleClick, { passive: true });
      cleanupFunctions2.push(() => {
        window.removeEventListener("scroll", scrollHandler);
        backToTopButton.removeEventListener("click", handleClick);
      });
    }
  }
  function cleanupFooter() {
    cleanupFunctions2.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        handleError(error, "Footer Cleanup");
      }
    });
    cleanupFunctions2.length = 0;
  }

  // src/components/gsap.js
  init_helpers();
  init_logger();
  init_jsdelivr();
  var gsapLoaded = false;
  var scrollTriggerLoaded = false;
  var splitTextLoaded = false;
  var customEaseLoaded = false;
  var animationsInitialized = false;
  var SPLIT_TEXT_FALLBACK_URL = "https://cdn.prod.website-files.com/gsap/3.13.0/SplitText.min.js";
  function waitForGlobal(name, timeout = 5e3) {
    return new Promise((resolve, reject) => {
      if (window[name]) {
        resolve(window[name]);
        return;
      }
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (window[name]) {
          clearInterval(checkInterval);
          resolve(window[name]);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout waiting for ${name} to load`));
        }
      }, 50);
    });
  }
  async function loadGSAP() {
    if (gsapLoaded || isLibraryLoaded("gsap")) {
      if (typeof window.gsap === "undefined") {
        await waitForGlobal("gsap");
      }
      return;
    }
    try {
      await loadLibrary("gsap", { loadCSS: false });
      await waitForGlobal("gsap");
      gsapLoaded = true;
    } catch (error) {
      handleError(error, "GSAP Loader");
      throw error;
    }
  }
  async function loadScrollTrigger() {
    if (scrollTriggerLoaded || isLibraryLoaded("scrollTrigger")) {
      if (typeof window.ScrollTrigger === "undefined") {
        await waitForGlobal("ScrollTrigger");
      }
      return;
    }
    try {
      await loadLibrary("scrollTrigger", { loadCSS: false });
      await waitForGlobal("gsap");
      await waitForGlobal("ScrollTrigger");
      if (typeof window.gsap !== "undefined" && window.gsap.registerPlugin) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        scrollTriggerLoaded = true;
      } else {
        throw new Error("GSAP registerPlugin not available");
      }
    } catch (error) {
      handleError(error, "ScrollTrigger Loader");
      throw error;
    }
  }
  async function loadSplitText() {
    if (splitTextLoaded || isLibraryLoaded("splitText")) {
      if (typeof window.SplitText === "undefined") {
        await waitForGlobal("SplitText");
      }
      splitTextLoaded = true;
      logger.log("[SplitText] SplitText already loaded.");
      return true;
    }
    try {
      const customUrl = typeof window !== "undefined" ? window.GSAP_SPLIT_TEXT_URL : null;
      const urlToLoad = customUrl || SPLIT_TEXT_FALLBACK_URL;
      if (!customUrl) {
        logger.warn(
          `[SplitText] Using fallback SplitText URL. For control, set window.GSAP_SPLIT_TEXT_URL to your hosted SplitText.min.js path.`
        );
      }
      await loadScript(urlToLoad, { id: "split-text-custom" });
      await waitForGlobal("SplitText");
      splitTextLoaded = true;
      logger.log("[SplitText] SplitText loaded.");
      return true;
    } catch (error) {
      handleError(error, "SplitText Loader");
      return false;
    }
  }
  async function loadCustomEase() {
    if (customEaseLoaded || isLibraryLoaded("customEase")) {
      if (typeof window.CustomEase === "undefined") {
        await waitForGlobal("CustomEase");
      }
      if (window.gsap && window.gsap.registerPlugin && window.CustomEase) {
        window.gsap.registerPlugin(window.CustomEase);
      }
      customEaseLoaded = true;
      return;
    }
    try {
      await loadLibrary("customEase", { loadCSS: false });
      await waitForGlobal("CustomEase");
      if (window.gsap && window.gsap.registerPlugin && window.CustomEase) {
        window.gsap.registerPlugin(window.CustomEase);
      }
      customEaseLoaded = true;
    } catch (error) {
      handleError(error, "CustomEase Loader");
      throw error;
    }
  }
  async function ensureGSAPLoaded() {
    if (typeof window.gsap !== "undefined" && !gsapLoaded) {
      gsapLoaded = true;
    }
    if (typeof window.ScrollTrigger !== "undefined" && !scrollTriggerLoaded) {
      scrollTriggerLoaded = true;
    }
    if (typeof window.CustomEase !== "undefined" && !customEaseLoaded) {
      customEaseLoaded = true;
    }
    if (!gsapLoaded) {
      await loadGSAP();
    }
    if (!scrollTriggerLoaded) {
      await loadScrollTrigger();
    }
    if (!customEaseLoaded) {
      await loadCustomEase();
    }
    if (typeof window.gsap === "undefined") {
      try {
        await waitForGlobal("gsap", 2e3);
      } catch (error) {
        throw new Error("GSAP failed to load: Script loaded but gsap object not available");
      }
    }
    if (typeof window.ScrollTrigger === "undefined") {
      try {
        await waitForGlobal("ScrollTrigger", 2e3);
      } catch (error) {
        throw new Error(
          "ScrollTrigger failed to load: Script loaded but ScrollTrigger object not available"
        );
      }
    }
    if (window.gsap && window.gsap.registerPlugin && !window.gsap.plugins.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
    if (window.gsap && window.gsap.registerPlugin && window.CustomEase && !window.gsap.plugins.CustomEase) {
      window.gsap.registerPlugin(window.CustomEase);
    }
  }
  async function handleGlobalAnimation() {
    if (animationsInitialized) {
      return;
    }
    try {
      await ensureGSAPLoaded();
    } catch (error) {
      handleError(error, "GSAP Global Animation");
      return;
    }
    const gsap2 = window.gsap;
    const ScrollTrigger2 = window.ScrollTrigger;
    const defaultEase = window.CustomEase && window.CustomEase.create ? window.CustomEase.create("tokenz-default", "M0,0 C0.22,0.6 0.36,1 1,1") : "cubic-bezier(.22,.6,.36,1)";
    const defaultConfig = {
      duration: 0.75,
      ease: defaultEase
    };
    function setupScrollTrigger(elements, animationSettings, triggerSettings) {
      elements.forEach((element) => {
        gsap2.fromTo(element, animationSettings.from, {
          ...animationSettings.to,
          scrollTrigger: {
            trigger: element,
            ...triggerSettings
          }
        });
      });
    }
    function applyScaleAnimation() {
      const elements = document.querySelectorAll("[anim-scale]");
      if (elements.length === 0)
        return;
      setupScrollTrigger(
        elements,
        { from: { scale: 1.1 }, to: { scale: 1, duration: 1.5 } },
        { start: "top 95%" }
      );
    }
    function applyStaggerAnimation() {
      const staggerElements = document.querySelectorAll("[anim-stagger]:not([modal] [anim-stagger])");
      if (staggerElements.length === 0)
        return;
      staggerElements.forEach((element) => {
        const childrenSelector = element.getAttribute("anim-stagger");
        const children = element.querySelectorAll(childrenSelector);
        if (children.length === 0)
          return;
        gsap2.set(children, {
          y: element.getAttribute("from-y") || "0.75rem",
          opacity: 0
        });
        ScrollTrigger2.batch(children, {
          onEnter: (target) => {
            gsap2.to(target, {
              autoAlpha: 1,
              duration: element.getAttribute("data-duration") || defaultConfig.duration,
              y: "0rem",
              opacity: 1,
              stagger: {
                from: element.getAttribute("stagger-from") || "start",
                each: element.getAttribute("stagger-amount") || 0.1
              },
              ease: element.getAttribute("data-easing") || defaultConfig.ease,
              scrollTrigger: {
                trigger: element,
                start: element.getAttribute("scrollTrigger-start") || "top 95%",
                markers: element.getAttribute("anim-markers") || false
              },
              delay: element.getAttribute("data-delay") || 0.25,
              clearProps: "all"
            });
          }
        });
      });
    }
    function applyElementAnimation() {
      const elements = document.querySelectorAll(
        "[anim-element]:not([modal] [anim-element]), .anim-element:not([modal] .anim-element)"
      );
      if (elements.length === 0)
        return;
      elements.forEach((element) => {
        const fromConfig = {
          y: element.getAttribute("from-y") || "1.75rem",
          x: element.getAttribute("from-x") || 0,
          filter: `blur(6px)`,
          opacity: 0,
          scale: 0.98
        };
        const toConfig = {
          y: "0%",
          x: "0%",
          opacity: 1,
          filter: "blur(0px)",
          duration: element.getAttribute("data-duration") || defaultConfig.duration,
          ease: element.getAttribute("data-easing") || defaultConfig.ease,
          delay: element.getAttribute("data-delay") || 0.25,
          scale: 1,
          clearProps: "all"
        };
        setupScrollTrigger([element], { from: fromConfig, to: toConfig }, { start: "top 97%" });
      });
    }
    function applyParallaxAnimation() {
      if (window.innerWidth <= 768)
        return;
      const elements = document.querySelectorAll("[parallax-element]");
      if (elements.length === 0)
        return;
      setupScrollTrigger(
        elements,
        { from: { y: "-10%", scale: 1.1 }, to: { y: "10%", scale: 1.1 } },
        { start: "top bottom", end: "bottom -50%", scrub: 0.2 }
      );
    }
    function applyBackgroundLinesAnimation() {
      const lines = document.querySelectorAll(".bg-lines .bg-line");
      if (lines.length === 0)
        return;
      setupScrollTrigger(
        lines,
        { from: { y: 400 }, to: { y: -100, duration: 2 } },
        { start: "top bottom", end: "bottom top", scrub: 1 }
      );
    }
    async function applySplitTextAnimation() {
      const elements = document.querySelectorAll("[data-split-text]");
      if (elements.length === 0)
        return;
      const loaded = await loadSplitText();
      if (!loaded || typeof window.SplitText === "undefined") {
        return;
      }
      const splitTypeMap = {
        char: "chars",
        chars: "chars",
        word: "words",
        words: "words",
        line: "lines",
        lines: "lines"
      };
      let initialWindowWidth = window.innerWidth;
      let activeSplits = [];
      const cleanup = () => {
        document.querySelectorAll(".line-wrap").forEach((wrap) => {
          while (wrap.firstChild) {
            wrap.parentNode.insertBefore(wrap.firstChild, wrap);
          }
          wrap.remove();
        });
        activeSplits.forEach((split) => split?.revert?.());
        activeSplits = [];
      };
      const splitText = () => {
        cleanup();
        document.querySelectorAll("[data-split-text]").forEach((element) => {
          const attrValue = (element.getAttribute("data-split-text") || "").trim().toLowerCase();
          const splitKey = splitTypeMap[attrValue];
          if (!splitKey) {
            logger.warn(
              `[SplitText] Invalid data-split-text value "${attrValue}". Use "char", "word", or "line".`,
              element
            );
            return;
          }
          const split = new window.SplitText(element, { type: splitKey });
          activeSplits.push(split);
          if (split.chars && Array.isArray(split.chars) && splitKey === "chars") {
            split.chars.forEach((node) => node.classList?.add("char"));
          }
          if (split.words && Array.isArray(split.words) && splitKey === "words") {
            split.words.forEach((node) => node.classList?.add("word"));
          }
          if (splitKey === "lines" && Array.isArray(split.lines)) {
            split.lines.forEach((lineNode) => {
              lineNode.classList?.add("line");
              const wrap = document.createElement("div");
              wrap.classList.add("line-wrap");
              lineNode.parentNode.insertBefore(wrap, lineNode);
              wrap.appendChild(lineNode);
            });
          }
        });
      };
      splitText();
      window.addEventListener("resize", () => {
        if (window.innerWidth !== initialWindowWidth) {
          splitText();
          initialWindowWidth = window.innerWidth;
        }
      });
    }
    function subRiseAnimation() {
      const elements = document.querySelectorAll(".bg-sunrise.animate");
      if (elements.length === 0)
        return;
      elements.forEach((element) => {
        gsap2.fromTo(
          element,
          { yPercent: 100 },
          { yPercent: 0, duration: 3.5, scrollTrigger: { trigger: element, start: "top 95%" } }
        );
      });
    }
    function applyContentDividerAnimation() {
      const contentDividers = document.querySelectorAll(".content-divider");
      if (contentDividers.length === 0)
        return;
      contentDividers.forEach((contentDivider) => {
        observeInView(
          contentDivider,
          (element) => {
            element.classList.add("animate");
          },
          { once: true }
        );
      });
    }
    function applyCounterAnimation() {
      const counters = document.querySelectorAll("[counter-anim]:not([modal] [counter-anim])");
      console.log(counters);
      if (!counters.length)
        return;
      const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const easeOutQuad = (t2) => t2 * (2 - t2);
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting)
              return;
            const el = entry.target;
            obs.unobserve(el);
            if (el.getAttribute("data-counter-animated") === "true")
              return;
            el.setAttribute("data-counter-animated", "true");
            const text = el.textContent || "";
            const match = text.match(/(\d[\d.,]*)/);
            if (!match)
              return;
            const originalNumberToken = match[0];
            const numStr = originalNumberToken.replace(/,/g, "");
            const target = Number.parseFloat(numStr);
            if (!Number.isFinite(target))
              return;
            const decimals = (numStr.split(".")[1] || "").length;
            const useCommas = originalNumberToken.includes(",");
            const setValue = (value) => {
              const formatted = useCommas ? value.toLocaleString(void 0, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              }) : value.toFixed(decimals);
              el.textContent = text.replace(originalNumberToken, formatted);
            };
            if (prefersReducedMotion) {
              setValue(target);
              return;
            }
            const duration = Number.parseInt(el.getAttribute("counter-duration") || "", 10) || 1e3;
            let startTime = null;
            const animate = (time) => {
              if (!startTime)
                startTime = time;
              const progress = Math.min((time - startTime) / duration, 1);
              const eased = easeOutQuad(progress);
              setValue(eased * target);
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((c) => observer.observe(c));
    }
    applyScaleAnimation();
    applyStaggerAnimation();
    applyElementAnimation();
    applyParallaxAnimation();
    applyBackgroundLinesAnimation();
    await applySplitTextAnimation();
    await subRiseAnimation();
    applyContentDividerAnimation();
    applyCounterAnimation();
    animationsInitialized = true;
  }

  // src/global/index.js
  init_logger();

  // src/components/rive.js
  init_helpers();
  init_logger();
  var PLAY_THRESHOLD = 0.6;
  var RIVE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.35.0/rive.js";
  var io = null;
  var ro = null;
  var tabObservers = [];
  var accordionObservers = [];
  var riveScriptPromise = null;
  var activeHosts = /* @__PURE__ */ new Set();
  function isAccordionActive(el) {
    return el.hasAttribute("data-accordion-img") && el.getAttribute("data-accordion-img") === "active";
  }
  function loadRiveScriptOnce() {
    if (riveScriptPromise)
      return riveScriptPromise;
    riveScriptPromise = loadScript(RIVE_SCRIPT_URL).then(() => {
      if (typeof window.rive === "undefined") {
        throw new Error("Rive runtime not found on window");
      }
      logger.log("\u2705 Rive runtime loaded");
      return window.rive;
    }).catch((err) => {
      riveScriptPromise = null;
      handleError(err, "Rive Load");
      throw err;
    });
    return riveScriptPromise;
  }
  function cleanupRiveListeners() {
    const events = ["scroll", "mousemove", "touchstart", "pointerdown"];
    events.forEach((event) => {
      window.removeEventListener(event, initRiveScript, { passive: true });
      document.removeEventListener(event, initRiveScript, { passive: true });
    });
  }
  function initRiveScript() {
    if (window.riveScriptInitialized) {
      cleanupRiveListeners();
      return;
    }
    window.riveScriptInitialized = true;
    cleanupRiveListeners();
    const getPixelRatio = (w, h) => {
      const largest = Math.max(w, h);
      if (largest >= 512)
        return 2;
      if (largest >= 256)
        return 1.75;
      if (largest >= 128)
        return 1.5;
      return 1.25;
    };
    const ensureCanvas = (el) => {
      let canvas = el.querySelector("canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = "rive-canvas";
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = "display:block;width:100%;height:100%;opacity:0;transition:opacity .35s ease;will-change:opacity";
        el.appendChild(canvas);
      }
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width || 1));
      const h = Math.max(1, Math.round(rect.height || 1));
      const dpr = getPixelRatio(w, h);
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }
      return canvas;
    };
    const resizeHost = (el) => {
      try {
        ensureCanvas(el);
        el.__rive?.r?.resizeDrawingSurfaceToCanvas?.();
      } catch (_) {
      }
    };
    const getDelayMs = (el) => {
      const raw = el.getAttribute("data-delay");
      const s = raw == null || raw === "" ? 0 : parseFloat(raw);
      return Number.isFinite(s) && s > 0 ? Math.round(s * 1e3) : 0;
    };
    const clearDelayTimer = (el) => {
      const t2 = el?.__rive?.delayTimeout;
      if (t2) {
        clearTimeout(t2);
        el.__rive.delayTimeout = null;
      }
    };
    const destroyHost = (el) => {
      try {
        el.__rive?.r?.cleanup?.();
      } catch (_) {
      }
      clearDelayTimer(el);
      el.__rive = null;
      el.querySelector("canvas")?.remove();
      activeHosts.delete(el);
    };
    const getAnimationNames = (r) => {
      try {
        if (Array.isArray(r.animationNames))
          return r.animationNames;
        if (r.animations?.keys)
          return Array.from(r.animations.keys());
        if (r.animations && typeof r.animations === "object")
          return Object.keys(r.animations);
      } catch (_) {
      }
      return [];
    };
    const getStateMachines = (r) => {
      try {
        if (Array.isArray(r.stateMachineNames))
          return r.stateMachineNames;
        return r.stateMachines || [];
      } catch (_) {
        return [];
      }
    };
    const buildQueue = [];
    let building = false;
    const doBuild = (el) => new Promise((resolve) => {
      if (el.__rive?.r)
        return resolve(el.__rive.r);
      loadRiveScriptOnce().then(() => {
        if (el.closest(".w-tab-pane") && !el.closest(".w--tab-active")) {
          el.__rive = { builtWhileHidden: true };
          return resolve(null);
        }
        const src = el.getAttribute("data-rive-src");
        if (!src)
          return resolve(null);
        const canvas = ensureCanvas(el);
        const rive = window.rive;
        if (!rive)
          return resolve(null);
        try {
          const instance = new rive.Rive({
            src,
            canvas,
            autoplay: false,
            layout: new rive.Layout({
              fit: rive.Fit.cover,
              alignment: rive.Alignment.center
            }),
            onLoad: () => {
              const sms = getStateMachines(instance);
              const anims = getAnimationNames(instance);
              const sm = sms.length ? sms[0] : null;
              let totalDurationSec = 0;
              const animsMap = instance.animations;
              if (anims.length && animsMap) {
                anims.forEach((name) => {
                  const anim = typeof animsMap.get === "function" ? animsMap.get(name) : animsMap[name];
                  const sec = anim?.duration != null ? Number(anim.duration) : 0;
                  if (sec > 0) {
                    totalDurationSec += sec;
                    console.log(`[Rive] ${src} \u2014 "${name}": ${sec}s`);
                  }
                });
                if (totalDurationSec > 0) {
                  console.log(
                    `[Rive] ${src} \u2014 total timeline duration: ${totalDurationSec.toFixed(2)}s`
                  );
                }
              }
              if (sm && totalDurationSec === 0) {
                console.log(`[Rive] ${src} \u2014 state machine: "${sm}" (no timeline durations)`);
              }
              el.__rive = {
                r: instance,
                sm,
                anims,
                totalDurationSec: totalDurationSec > 0 ? totalDurationSec : null,
                inputs: sm && typeof instance.stateMachineInputs === "function" ? instance.stateMachineInputs(sm) || [] : [],
                isPlaying: false,
                hasPlayed: false,
                raf: null,
                builtWhileHidden: false,
                delayTimeout: null
              };
              activeHosts.add(el);
              resolve(instance);
            }
          });
        } catch (err) {
          handleError(err, "Rive Build");
          resolve(null);
        }
      }).catch(() => resolve(null));
    });
    const processBuildQueue = () => {
      if (building || !buildQueue.length)
        return;
      const { el, resolve, reject } = buildQueue.shift();
      building = true;
      doBuild(el).then(
        (r) => {
          resolve(r);
          building = false;
          processBuildQueue();
        },
        (err) => {
          reject(err);
          building = false;
          processBuildQueue();
        }
      );
    };
    const build = (el) => {
      if (el.__rive?.r)
        return Promise.resolve(el.__rive.r);
      return new Promise((resolve, reject) => {
        buildQueue.push({ el, resolve, reject });
        processBuildQueue();
      });
    };
    const stopAndReset = (el) => {
      const data = el.__rive;
      if (!data?.r)
        return;
      clearDelayTimer(el);
      cancelAnimationFrame(data.raf);
      data.raf = null;
      data.r.stop?.();
      data.r.reset?.();
      data.r.seek?.(0);
      data.r.advance?.(0);
      data.isPlaying = false;
      data.hasPlayed = false;
      const c = el.querySelector("canvas");
      if (c)
        c.style.opacity = "0";
    };
    const playOnce = (el, force = false) => {
      const data = el.__rive;
      if (!data?.r || data.hasPlayed && !force)
        return;
      resizeHost(el);
      try {
        data.r.stop?.();
        data.r.reset?.();
        data.r.seek?.(0);
        data.r.advance?.(0);
      } catch (_) {
      }
      data.inputs?.forEach((input) => {
        try {
          if (typeof input.fire === "function")
            input.fire();
          else if (typeof input.value === "boolean") {
            input.value = true;
            setTimeout(() => input.value = false, 600);
          } else if (typeof input.value === "number") {
            input.value = input.value || 1;
          }
        } catch (_) {
        }
      });
      data.isPlaying = true;
      data.hasPlayed = true;
      const canvas = el.querySelector("canvas");
      if (canvas) {
        canvas.style.opacity = "0";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            canvas.style.opacity = "1";
          });
        });
      }
      if (data.sm)
        data.r.play(data.sm);
      else if (data.anims?.length)
        data.r.play(data.anims[0]);
      else
        data.r.play?.();
    };
    const schedulePlay = (el, force = false) => {
      const data = el.__rive;
      if (!data?.r || data.hasPlayed && !force)
        return;
      clearDelayTimer(el);
      const delay = getDelayMs(el);
      if (delay <= 0)
        return playOnce(el, force);
      data.delayTimeout = setTimeout(() => {
        data.delayTimeout = null;
        const pane = el.closest(".w-tab-pane");
        const paneActive = !pane || pane.classList.contains("w--tab-active");
        const rect = el.getBoundingClientRect();
        const intersecting = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.left < (window.innerWidth || document.documentElement.clientWidth);
        if (paneActive && intersecting)
          playOnce(el, force);
      }, delay);
    };
    let pending = [];
    const handleEntry = (entry) => {
      const el = entry.target;
      const ratio = Math.max(0, Math.min(1, entry.intersectionRatio || 0));
      if (el.closest(".w-tab-pane") && !el.closest(".w--tab-active")) {
        stopAndReset(el);
        return;
      }
      if (el.hasAttribute("data-accordion-img")) {
        if (!isAccordionActive(el)) {
          if (ratio === 0)
            stopAndReset(el);
          return;
        }
      }
      if (ratio >= PLAY_THRESHOLD) {
        if (el.__rive?.r)
          schedulePlay(el);
        else
          build(el).then(() => schedulePlay(el));
      } else if (ratio === 0) {
        stopAndReset(el);
      }
    };
    const isInView = (el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0)
        return false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const visibleTop = Math.max(0, rect.top);
      const visibleLeft = Math.max(0, rect.left);
      const visibleBottom = Math.min(vh, rect.bottom);
      const visibleRight = Math.min(vw, rect.right);
      const visibleW = Math.max(0, visibleRight - visibleLeft);
      const visibleH = Math.max(0, visibleBottom - visibleTop);
      const visibleArea = visibleW * visibleH;
      const totalArea = rect.width * rect.height;
      const ratio = totalArea > 0 ? visibleArea / totalArea : 0;
      return ratio >= PLAY_THRESHOLD;
    };
    const checkAlreadyVisible = (el) => {
      if (el.closest(".w-tab-pane") && !el.closest(".w--tab-active"))
        return;
      if (el.hasAttribute("data-accordion-img") && !isAccordionActive(el))
        return;
      if (!isInView(el))
        return;
      if (el.__rive?.r)
        schedulePlay(el);
      else
        build(el).then(() => schedulePlay(el));
    };
    io = new IntersectionObserver(
      (entries) => {
        pending.push(...entries);
        if (pending.length && !io._raf) {
          io._raf = requestAnimationFrame(() => {
            const batch = pending;
            pending = [];
            io._raf = null;
            batch.forEach(handleEntry);
          });
        }
      },
      { threshold: [0, PLAY_THRESHOLD, 1] }
    );
    const activatePane = (pane) => {
      if (!pane)
        return;
      pane.parentNode.querySelectorAll(".w-tab-pane").forEach((sib) => {
        if (sib === pane)
          return;
        sib.querySelectorAll("[data-rive-src]").forEach((h) => {
          io.unobserve(h);
          stopAndReset(h);
        });
      });
      pane.querySelectorAll("[data-rive-src]").forEach((h) => {
        requestAnimationFrame(
          () => requestAnimationFrame(async () => {
            if (h.__rive?.builtWhileHidden)
              destroyHost(h);
            await build(h);
            io.observe(h);
          })
        );
      });
    };
    document.querySelectorAll(".w-tab-content").forEach((wrap) => {
      const mo = new MutationObserver(() => {
        const activePane = wrap.querySelector(".w-tab-pane.w--tab-active");
        if (activePane) {
          requestAnimationFrame(() => requestAnimationFrame(() => activatePane(activePane)));
        }
      });
      mo.observe(wrap, {
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
      });
      tabObservers.push(mo);
      const initial = wrap.querySelector(".w--tab-active");
      if (initial)
        activatePane(initial);
    });
    const init = () => {
      document.querySelectorAll("[data-rive-src]").forEach((el) => {
        const parentPane = el.closest(".w-tab-pane");
        if (parentPane && !parentPane.classList.contains("w--tab-active")) {
          el.__rive = { builtWhileHidden: true };
        } else {
          io.observe(el);
          requestAnimationFrame(() => checkAlreadyVisible(el));
        }
      });
      document.querySelectorAll("[data-rive-src][data-accordion-img]").forEach((el) => {
        const mo = new MutationObserver(() => {
          if (el.getAttribute("data-accordion-img") === "active") {
            if (el.__rive?.r)
              schedulePlay(el, true);
            else
              build(el).then(() => schedulePlay(el, true));
          } else {
            stopAndReset(el);
          }
        });
        mo.observe(el, { attributes: true, attributeFilter: ["data-accordion-img"] });
        accordionObservers.push(mo);
      });
      const preloadAccordionRives = () => {
        document.querySelectorAll("[data-rive-src][data-accordion-img]").forEach((el) => {
          if (!el.__rive?.r)
            build(el);
        });
      };
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(preloadAccordionRives, { timeout: 4e3 });
      } else {
        setTimeout(preloadAccordionRives, 500);
      }
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(init);
    } else {
      setTimeout(init, 200);
    }
    ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target;
        if (el.closest(".w-tab-pane") && !el.closest(".w--tab-active"))
          continue;
        resizeHost(el);
      }
    });
    document.querySelectorAll("[data-rive-src]").forEach((el) => ro.observe(el));
    logger.log("\u{1F3AC} Rive initialized");
  }
  function initRive() {
    if (typeof document === "undefined")
      return;
    const hosts = document.querySelectorAll("[data-rive-src]");
    if (!hosts.length)
      return;
    const hasEager = Array.from(hosts).some((el) => el.getAttribute("data-load") === "eager");
    if (hasEager) {
      initRiveScript();
      return;
    }
    const riveEvents = ["scroll", "mousemove", "touchstart", "pointerdown"];
    riveEvents.forEach((event) => {
      window.addEventListener(event, initRiveScript, { once: true, passive: true });
      document.addEventListener(event, initRiveScript, { once: true, passive: true });
    });
  }

  // src/global/index.js
  async function initGlobal() {
    logger.log("\u{1F310} Initializing global components...");
    cleanupNavbar();
    cleanupFooter();
    initRive();
    initLenis();
    initNavbar();
    initFooter();
    try {
      await ensureGSAPLoaded();
      logger.log("\u2705 GSAP and ScrollTrigger loaded globally");
      await new Promise((resolve) => setTimeout(resolve, 100));
      await handleGlobalAnimation();
      gsapGlobalAnimations();
    } catch (error) {
      logger.error("Error loading GSAP:", error);
    }
  }
  function gsapGlobalAnimations() {
    spheresMoveAnimation();
    cardMovementAnimation();
    themeChangeAnimation();
    freemiumSectionAnimation();
    sectionCTAanimation();
    shineMovementAnimation();
    clipSectionAnimation();
  }
  function spheresMoveAnimation() {
    const containers = Array.from(document.querySelectorAll("[spheres-move-anim]"));
    if (!containers.length)
      return;
    containers.forEach((container) => {
      const spheres = Array.from(container.querySelectorAll(".sphere .sphere-layers"));
      const CONFIG = {
        desktop: { impactRadius: 500, maxOffset: 60 },
        mobile: { impactRadius: 420, maxOffset: 40 }
      };
      let impactRadius, maxOffset;
      const applyConfig = () => {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        const cfg = isMobile ? CONFIG.mobile : CONFIG.desktop;
        impactRadius = cfg.impactRadius;
        maxOffset = cfg.maxOffset;
        pickInitialSphere();
      };
      let mouseX = 0, mouseY = 0;
      let ticking = false;
      let isActive = false;
      let isHovering = false;
      let initialSphere = null;
      const allowMouse = container.getAttribute("spheres-move-anim") === "true";
      const pickInitialSphere = () => {
        const isMobile = window.matchMedia("(max-width: 767px)").matches;
        initialSphere = isMobile ? container.querySelector('.sphere .sphere-layers[initial-active-mobile="1"]') : container.querySelector('.sphere .sphere-layers[initial-active="1"]');
        if (!initialSphere)
          initialSphere = spheres[0] || null;
      };
      applyConfig();
      window.addEventListener("resize", applyConfig);
      function applyInfluence(sourceX, sourceY, isInitial = false) {
        let closestSphere = null;
        let minDistance = Infinity;
        const duration = isInitial ? 0.6 : 0.25;
        const ease = isInitial ? "power2.out" : "power3.out";
        spheres.forEach((sphere) => {
          const rect = sphere.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = sourceX - cx;
          const dy = sourceY - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < minDistance && distance <= impactRadius) {
            minDistance = distance;
            closestSphere = sphere;
          }
          const strength = Math.max(0, 1 - distance / impactRadius);
          const nx = dx / (distance || 1);
          const ny = dy / (distance || 1);
          const moveX = gsap.utils.clamp(-maxOffset, maxOffset, -nx * strength * maxOffset);
          const moveY = gsap.utils.clamp(-maxOffset, maxOffset, -ny * strength * maxOffset);
          sphere.querySelectorAll(".sphere-layer-3").forEach((layer) => {
            gsap.to(layer, {
              xPercent: moveX,
              yPercent: moveY,
              scale: 1 + (1 - strength) * 0.6,
              duration,
              ease
            });
          });
          sphere.querySelectorAll(".sphere-layer-3a").forEach((layer) => {
            gsap.to(layer, {
              xPercent: moveX * 1.2,
              yPercent: moveY * 1.2,
              duration,
              ease
            });
          });
          sphere.querySelectorAll(".sphere-layer-glow").forEach((glow) => {
            if (glow.classList.contains("sphere-layer-4"))
              return;
            const boost = glow.classList.contains("white") ? 1.4 : 1;
            gsap.to(glow, {
              x: dx * 0.2 * boost,
              y: dy * 0.2 * boost,
              opacity: strength,
              duration: isInitial ? 0.35 : 0.15,
              ease
            });
          });
        });
        spheres.forEach((sphere) => {
          const rect = sphere.getBoundingClientRect();
          const dx = sourceX - (rect.left + rect.width / 2);
          const dy = sourceY - (rect.top + rect.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          sphere.querySelectorAll("*:not(.sphere-layer-glow)").forEach((el) => {
            if (el.classList.contains("sphere-layer-4"))
              return;
            if (distance <= impactRadius) {
              if (sphere === closestSphere) {
                el.classList.add("v3");
                el.classList.remove("v1");
              } else {
                el.classList.add("v1");
                el.classList.remove("v3");
              }
            } else {
              el.classList.remove("v1", "v3");
            }
          });
        });
      }
      function update() {
        if (!isActive)
          return;
        if (isHovering && allowMouse) {
          applyInfluence(mouseX, mouseY, false);
        } else if (initialSphere) {
          const r = initialSphere.getBoundingClientRect();
          applyInfluence(r.left + r.width / 2, r.top + r.height / 2, true);
        }
        ticking = false;
      }
      const onMouseMove = (e2) => {
        if (!allowMouse)
          return;
        mouseX = e2.clientX;
        mouseY = e2.clientY;
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };
      const resetAll = () => {
        spheres.forEach((sphere) => {
          sphere.querySelectorAll("*").forEach((el) => {
            if (!el.classList.contains("sphere-layer-4"))
              el.classList.remove("v1", "v3");
          });
          sphere.querySelectorAll(".sphere-layer-3, .sphere-layer-3a").forEach((layer) => {
            gsap.to(layer, { xPercent: 0, yPercent: 0, scale: 1, duration: 0.5, ease: "power2.out" });
          });
          sphere.querySelectorAll(".sphere-layer-glow").forEach((glow) => {
            if (glow.classList.contains("sphere-layer-4"))
              return;
            gsap.to(glow, { x: 0, y: 0, opacity: 0, duration: 0.4 });
          });
        });
      };
      container.addEventListener("mouseenter", () => {
        isHovering = true;
      });
      container.addEventListener("mouseleave", () => {
        isHovering = false;
        resetAll();
        requestAnimationFrame(update);
      });
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!isActive) {
                isActive = true;
                if (allowMouse)
                  window.addEventListener("mousemove", onMouseMove);
                requestAnimationFrame(update);
              }
            } else {
              isActive = false;
              if (allowMouse)
                window.removeEventListener("mousemove", onMouseMove);
              resetAll();
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(container);
    });
  }
  function cardMovementAnimation() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      const tracks = document.querySelectorAll("[cards-track]");
      if (tracks.length) {
        tracks.forEach((track) => {
          const intialY = parseFloat(getComputedStyle(track).getPropertyValue("--_size---cards-track-intial-y")) || 0;
          const finalY = parseFloat(getComputedStyle(track).getPropertyValue("--_size---cards-track-final-y")) || -100;
          gsap.fromTo(
            track,
            { yPercent: intialY },
            {
              yPercent: finalY,
              scrollTrigger: {
                trigger: "[cards-section]",
                start: "top 70%",
                end: "bottom 40%",
                scrub: true,
                markers: false
              }
            }
          );
        });
      }
    }
  }
  function themeChangeAnimation() {
    if (!document.querySelector("[theme]"))
      return;
    document.querySelectorAll("[theme]").forEach((el) => {
      const originalTheme = el.getAttribute("theme");
      const stages = [
        {
          to: el.getAttribute("theme-change-to"),
          trigger: el.getAttribute("theme-change-trigger")
        },
        {
          to: el.getAttribute("theme-change-to-2"),
          trigger: el.getAttribute("theme-change-trigger-2")
        }
      ].filter((stage) => stage.to && stage.trigger);
      if (!stages.length)
        return;
      stages.forEach((stage, index) => {
        const triggerEls = document.querySelectorAll(stage.trigger);
        if (!triggerEls.length)
          return;
        triggerEls.forEach((triggerEl) => {
          ScrollTrigger.create({
            trigger: triggerEl,
            start: "top 90%",
            onEnter: () => {
              el.setAttribute("theme", stage.to);
            },
            onEnterBack: () => {
              el.setAttribute("theme", stage.to);
            },
            onLeaveBack: () => {
              if (index === 0) {
                el.setAttribute("theme", originalTheme);
              } else {
                el.setAttribute("theme", stages[index - 1].to);
              }
            },
            markers: false
          });
        });
      });
    });
  }
  function freemiumSectionAnimation() {
    if (!document.querySelector("[freemium-section]"))
      return;
    document.querySelectorAll("[freemium-section]").forEach((section) => {
      if (!section)
        return;
      const ff1 = section.querySelector(".circle-comp.ff-1");
      const ff2 = section.querySelector(".circle-comp.ff-2");
      const text = section.querySelector("[freemium-section-text]");
      if (!ff1 && !ff2 && !text)
        return;
      const rootStyles = getComputedStyle(document.documentElement);
      const initialSize = rootStyles.getPropertyValue("--_size---freemium-components--intial-size").trim();
      const ff1Final = rootStyles.getPropertyValue("--_size---freemium-components--ff1-final-size").trim();
      const ff2Final = rootStyles.getPropertyValue("--_size---freemium-components--ff2-final-size").trim();
      const isMobile = window.innerWidth <= 768;
      const ff1InitialY = isMobile ? 10 : -50;
      const ff1FinalY = 90;
      const ff2InitialY = -150;
      const ff2FinalY = -70;
      if (ff1)
        ff1.style.width = initialSize;
      if (ff2)
        ff2.style.width = initialSize;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          markers: false
        }
      });
      const circleDuration = 1.2;
      const textDuration = 0.8;
      const staggerTime = 0.1;
      if (ff1) {
        tl.fromTo(
          ff1,
          { width: initialSize, yPercent: ff1InitialY },
          { width: ff1Final, yPercent: ff1FinalY, duration: circleDuration, ease: "power1.out" }
        );
      }
      if (ff2) {
        tl.fromTo(
          ff2,
          { width: initialSize, yPercent: ff2InitialY },
          { width: ff2Final, yPercent: ff2FinalY, duration: circleDuration, ease: "power1.out" },
          ff1 ? "<" : 0
          // sync with ff1 if it exists
        );
      }
      if (text) {
        const textChildren = Array.from(text.children);
        if (textChildren.length) {
          tl.from(
            textChildren,
            {
              opacity: 0,
              filter: "blur(5px)",
              y: 20,
              stagger: staggerTime,
              duration: textDuration,
              ease: "power1.out"
            },
            `-=${circleDuration * 0.2}`
          );
        } else {
          tl.from(
            text,
            {
              opacity: 0,
              filter: "blur(5px)",
              y: 20,
              duration: textDuration,
              ease: "power1.out"
            },
            `-=${circleDuration * 0.2}`
          );
        }
      }
    });
  }
  function sectionCTAanimation() {
    if (!document.querySelectorAll("[section-cta]"))
      return;
    document.querySelectorAll("[section-cta]").forEach((section) => {
      if (!section)
        return;
      const frame = section.querySelector(".dashboard-frame.for-cta");
      const circle = section.querySelector(".circle-comp.for-cta");
      if (!frame || !circle)
        return;
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 50%",
          end: "50% 50%",
          scrub: true,
          markers: false
        }
      }).to(frame, {
        rotationY: 0,
        y: 0,
        ease: "power1.out"
      }).from(
        circle,
        {
          opacity: 0.1,
          ease: "power1.out"
        },
        "<"
      );
    });
  }
  function shineMovementAnimation() {
    if (!window.matchMedia("(hover: hover)").matches)
      return;
    const areas = document.querySelectorAll("[shine-mover-area]");
    if (!areas.length)
      return;
    areas.forEach((area) => {
      if (area.dataset.shineInit)
        return;
      area.dataset.shineInit = "true";
      const point = area.querySelector("[shine-point]");
      if (!point)
        return;
      point.style.position = "absolute";
      point.style.pointerEvents = "none";
      point.style.transition = "transform 0.05s ease";
      let rafId = null;
      const onMouseMove = (e2) => {
        const rect = area.getBoundingClientRect();
        const x = e2.clientX - rect.left - point.offsetWidth / 2;
        const y = e2.clientY - rect.top - point.offsetHeight / 2;
        if (rafId)
          cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          point.style.transform = `translate(${x}px, ${y}px)`;
        });
      };
      const onMouseLeave = () => {
      };
      area.addEventListener("mouseenter", () => {
        area.addEventListener("mousemove", onMouseMove);
        area.addEventListener("mouseleave", onMouseLeave);
      });
      area.addEventListener("mouseleave", () => {
        area.removeEventListener("mousemove", onMouseMove);
        area.removeEventListener("mouseleave", onMouseLeave);
      });
    });
  }
  function clipSectionAnimation() {
    if (!document.querySelector('[cliped-section="anim"]'))
      return;
    document.querySelectorAll('[cliped-section="anim"]').forEach((el) => {
      const style = getComputedStyle(el);
      const padding = style.getPropertyValue("--_size---clip-padding").trim();
      const radius = style.getPropertyValue("--_size---clip-radius").trim();
      gsap.fromTo(
        el,
        { clipPath: `inset(0px round 0px)` },
        {
          clipPath: `inset(${padding} round ${radius})`,
          ease: "ease",
          scrollTrigger: {
            trigger: el,
            start: "top 50%",
            end: "bottom 50%",
            scrub: true,
            markers: false
          }
        }
      );
    });
  }

  // src/index.js
  init_logger();
  document.documentElement.classList.add("has-js");
  var pageRegistry = {
    home: () => Promise.resolve().then(() => (init_home(), home_exports)).then((m) => m.initHomePage),
    program: () => Promise.resolve().then(() => (init_program(), program_exports)).then((m) => m.initProgramPage),
    "program-detail": () => Promise.resolve().then(() => (init_programDetail(), programDetail_exports)).then((m) => m.initProgramDetailPage),
    programdetail: () => Promise.resolve().then(() => (init_programDetail(), programDetail_exports)).then((m) => m.initProgramDetailPage)
  };
  var cachedPageName = null;
  function getCurrentPage() {
    if (cachedPageName !== null)
      return cachedPageName;
    const bodyPage = document.body.getAttribute("data-page");
    const htmlPage = document.documentElement.getAttribute("data-page");
    cachedPageName = bodyPage || htmlPage || null;
    return cachedPageName;
  }
  async function initPage() {
    document.documentElement.classList.add("ready");
    try {
      await initGlobal();
    } catch (error) {
      logger.error("[Webflow Router] Error initializing global components:", error);
    }
    const pageName = getCurrentPage();
    if (!pageName) {
      logger.warn("[Webflow Router] No data-page attribute found on <html> or <body> tag");
      logger.log("[Webflow Router] Global components loaded, but no page-specific code will run");
      return;
    }
    const pageInit = pageRegistry[pageName];
    if (pageInit && typeof pageInit === "function") {
      try {
        const initFn = await pageInit();
        if (initFn && typeof initFn === "function") {
          initFn();
        }
      } catch (error) {
        logger.error(`[Webflow Router] Error initializing page "${pageName}":`, error);
      }
    } else {
      logger.warn(`[Webflow Router] No initialization function found for page: ${pageName}`);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
//# sourceMappingURL=index.js.map
