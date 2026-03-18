# GSAP & ScrollTrigger Guide

Complete guide to using GSAP animations and ScrollTrigger in your Webflow project.

## Overview

GSAP (GreenSock Animation Platform) is the industry-standard animation library. This component includes:

- ✅ **Auto-loaded** - GSAP loads from CDN only when needed
- ✅ **ScrollTrigger** - Scroll-based animations
- ✅ **Data attribute config** - No code needed for basic animations
- ✅ **Programmatic API** - Full control for custom animations
- ✅ **Performance optimized** - Lazy loading, efficient updates
- ✅ **Zero bundle impact** - Loads from CDN (not in your bundle)

## Quick Setup

### Step 1: Import in Your Page

```javascript
// src/pages/home.js
import { initGSAP } from '../components/gsap';

export function initHomePage() {
  initGSAP(); // Initialize GSAP on this page
}
```

### Step 2: Add Data Attributes in Webflow

```html
<!-- Fade in from bottom -->
<div
  data-gsap
  data-gsap-from='{"opacity": 0, "y": 50}'
  data-gsap-to='{"opacity": 1, "y": 0}'
  data-gsap-duration="1"
>
  Content here
</div>
```

### Step 3: Done!

The animation runs automatically! 🎉

---

## Basic Animations (No Scroll)

### Fade In

```html
<div data-gsap data-gsap-from='{"opacity": 0}' data-gsap-to='{"opacity": 1}'>
  Fades in on page load
</div>
```

### Slide from Left

```html
<div data-gsap data-gsap-from='{"opacity": 0, "x": -100}' data-gsap-to='{"opacity": 1, "x": 0}'>
  Slides in from left
</div>
```

### Scale Up

```html
<div data-gsap data-gsap-from='{"scale": 0.5}' data-gsap-to='{"scale": 1}'>Scales up on load</div>
```

### Rotate In

```html
<div
  data-gsap
  data-gsap-from='{"opacity": 0, "rotation": -180}'
  data-gsap-to='{"opacity": 1, "rotation": 0}'
>
  Rotates in
</div>
```

### With Delay & Duration

```html
<div
  data-gsap
  data-gsap-from='{"opacity": 0, "y": 30}'
  data-gsap-duration="2"
  data-gsap-delay="0.5"
>
  Animates after 0.5s delay over 2 seconds
</div>
```

---

## Stagger Animations

Animate children one after another:

```html
<div data-gsap data-gsap-from='{"opacity": 0, "y": 30}' data-gsap-stagger="0.1">
  <div>Item 1</div>
  <!-- Animates first -->
  <div>Item 2</div>
  <!-- 0.1s later -->
  <div>Item 3</div>
  <!-- 0.1s later -->
  <div>Item 4</div>
  <!-- 0.1s later -->
</div>
```

Perfect for lists, grids, or feature cards!

---

## Scroll-Based Animations (ScrollTrigger)

### Basic Scroll Animation

```html
<div
  data-scroll-trigger
  data-gsap-from='{"opacity": 0, "y": 100}'
  data-gsap-to='{"opacity": 1, "y": 0}'
>
  Animates when scrolled into view
</div>
```

### Scrub Animation (Linked to Scroll)

```html
<div
  data-scroll-trigger
  data-trigger-scrub="true"
  data-gsap-from='{"opacity": 0, "scale": 0.8}'
  data-gsap-to='{"opacity": 1, "scale": 1}'
>
  Animation progress linked to scroll position
</div>
```

### Pin Element While Scrolling

```html
<div
  data-scroll-trigger
  data-trigger-pin="true"
  data-trigger-start="top top"
  data-trigger-end="bottom top"
>
  Pins to top while scrolling
</div>
```

### Custom Trigger Points

```html
<div
  data-scroll-trigger
  data-trigger-start="top 80%"
  data-trigger-end="bottom 20%"
  data-gsap-from='{"x": -100}'
  data-gsap-to='{"x": 0}'
>
  Custom start/end points
</div>
```

### Debug Mode (See Trigger Points)

```html
<div data-scroll-trigger data-trigger-markers="true">Shows markers to debug trigger points</div>
```

---

## ScrollTrigger Options

### Trigger Start/End

```html
<!-- Start when top of element hits 80% of viewport -->
<div data-trigger-start="top 80%">
  <!-- Start when bottom of element hits center -->
  <div data-trigger-start="bottom center">
    <!-- Common values -->
    data-trigger-start="top top"
    <!-- Element top hits viewport top -->
    data-trigger-start="top center"
    <!-- Element top hits viewport center -->
    data-trigger-start="top bottom"
    <!-- Element top hits viewport bottom -->
    data-trigger-start="center center"
    <!-- Element center hits viewport center -->
  </div>
</div>
```

### Scrub (Link to Scroll Position)

```html
<!-- Smooth scrub -->
<div data-trigger-scrub="true">
  <!-- Animation tied to scroll position -->
</div>
```

### Pin Element

```html
<!-- Pin element during scroll -->
<div data-trigger-pin="true"></div>
```

---

## Advanced: Programmatic Animations

For complex animations, use the JavaScript API:

### Example 1: Custom Timeline

```javascript
// src/pages/home.js
import { initGSAP, createTimeline } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();

  // Create a timeline
  const tl = await createTimeline({
    defaults: { duration: 1, ease: 'power2.out' },
  });

  // Chain animations
  tl.from('[data-hero-title]', { opacity: 0, y: 50 })
    .from('[data-hero-subtitle]', { opacity: 0, y: 30 }, '-=0.5')
    .from('[data-hero-button]', { opacity: 0, scale: 0.8 }, '-=0.3');
}
```

### Example 2: Scroll-Based Animation

```javascript
import { initGSAP, createScrollTrigger } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();

  // Create scroll trigger
  await createScrollTrigger({
    trigger: '[data-feature-section]',
    start: 'top center',
    end: 'bottom center',
    scrub: 1,
    pin: true,
    onEnter: () => console.log('Entered!'),
    onLeave: () => console.log('Left!'),
  });
}
```

### Example 3: Parallax Effect

```javascript
import { initGSAP, getGSAP, getScrollTrigger } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();
  const ScrollTrigger = getScrollTrigger();

  // Parallax background
  gsap.to('[data-parallax-bg]', {
    y: 200,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-parallax-section]',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}
```

### Example 4: Stagger Cards on Scroll

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  gsap.from('[data-card]', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.15,
    scrollTrigger: {
      trigger: '[data-cards-container]',
      start: 'top 80%',
    },
  });
}
```

### Example 5: Horizontal Scroll Section

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  const sections = gsap.utils.toArray('[data-horizontal-section]');

  gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-horizontal-container]',
      pin: true,
      scrub: 1,
      end: () => '+=' + document.querySelector('[data-horizontal-container]').offsetWidth,
    },
  });
}
```

---

## Common Animation Patterns

### Hero Section Animation

```html
<div data-gsap data-gsap-from='{"opacity": 0, "y": 100}' data-gsap-duration="1.5">
  <h1>Hero Title</h1>
</div>
```

### Features Grid (Stagger)

```html
<div data-gsap data-gsap-from='{"opacity": 0, "y": 50}' data-gsap-stagger="0.2">
  <div>Feature 1</div>
  <div>Feature 2</div>
  <div>Feature 3</div>
</div>
```

### Fade In on Scroll

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0}' data-gsap-to='{"opacity": 1}'>
  Content fades in when scrolled into view
</div>
```

### Slide In from Left on Scroll

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "x": -100}' data-trigger-start="top 80%">
  Slides in from left
</div>
```

### Pin Section While Scrolling

```html
<div
  data-scroll-trigger
  data-trigger-pin="true"
  data-trigger-start="top top"
  data-trigger-end="+=500"
>
  Stays pinned for 500px of scroll
</div>
```

---

## Animation Properties

You can animate any CSS property:

```javascript
{
  // Position
  "x": 100,           // translateX
  "y": 50,            // translateY
  "z": 20,            // translateZ

  // Scale
  "scale": 1.5,       // scale
  "scaleX": 2,        // scaleX
  "scaleY": 0.5,      // scaleY

  // Rotation
  "rotation": 360,    // rotate in degrees
  "rotationX": 45,    // rotateX
  "rotationY": 90,    // rotateY

  // Opacity
  "opacity": 0.5,     // opacity

  // Transform origin
  "transformOrigin": "center center",

  // Misc
  "width": "100%",
  "height": "auto",
  "backgroundColor": "#ff0000",
  "color": "#ffffff"
}
```

---

## Webflow Setup Examples

### Example 1: Hero Section

**In Webflow:**

1. Add `data-gsap` to hero container
2. Add attributes:
   - `data-gsap-from='{"opacity": 0, "y": 100}'`
   - `data-gsap-duration="1.5"`

**Result:** Hero fades in from bottom on page load

### Example 2: Feature Cards

**In Webflow:**

1. Add `data-scroll-trigger` to container
2. Add `data-gsap-stagger="0.15"` for stagger effect
3. Add `data-gsap-from='{"opacity": 0, "y": 50}'`

**Result:** Cards animate in one by one when scrolled into view

### Example 3: Parallax Background

**In Code:**

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  gsap.to('[data-parallax]', {
    y: 300,
    ease: 'none',
    scrollTrigger: {
      trigger: '[data-parallax-section]',
      scrub: true,
    },
  });
}
```

**In Webflow:**

- Add `data-parallax` to the background image
- Add `data-parallax-section` to the section

**Result:** Background moves slower than content (parallax effect)

---

## Best Practices

### 1. Use Data Attributes for Simple Animations

```html
<!-- ✅ Good - declarative -->
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "y": 50}'>Content</div>

<!-- ❌ Bad - unnecessary code -->
<div id="my-element">Content</div>
<!-- Then writing JS to animate #my-element -->
```

### 2. Use Code for Complex Animations

```javascript
// ✅ Good - complex timeline
const tl = await createTimeline();
tl.from('.hero', { opacity: 0 }).from('.subtitle', { y: 50 }).from('.button', { scale: 0 });
```

### 3. Refresh After DOM Changes

```javascript
import { refreshScrollTrigger } from '../components/gsap';

// After loading dynamic content
loadContent().then(() => {
  refreshScrollTrigger(); // Update ScrollTrigger
});
```

### 4. Clean Up When Needed

```javascript
import { killAllScrollTriggers } from '../components/gsap';

// When leaving page or switching views
killAllScrollTriggers();
```

---

## Performance Tips

✅ **Lazy loaded** - GSAP only loads when `initGSAP()` is called  
✅ **GPU acceleration** - Use `x`, `y`, `rotation`, `scale` (not `left`, `top`)  
✅ **will-change** - GSAP auto-applies for better performance  
✅ **RequestAnimationFrame** - GSAP uses RAF internally  
✅ **Batch updates** - GSAP batches DOM reads/writes

---

## Common Use Cases

### Hero Section Animation

```html
<div data-gsap data-gsap-from='{"opacity": 0, "y": 100}' data-gsap-duration="1.5">
  <h1>Welcome to Our Site</h1>
  <p>This animates on page load</p>
</div>
```

### Image Gallery (Stagger)

```html
<div data-gsap data-gsap-from='{"opacity": 0, "scale": 0.8}' data-gsap-stagger="0.1">
  <img src="image1.jpg" />
  <img src="image2.jpg" />
  <img src="image3.jpg" />
</div>
```

### Statistics Counter

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  gsap.from('[data-stat]', {
    textContent: 0,
    duration: 2,
    snap: { textContent: 1 },
    scrollTrigger: {
      trigger: '[data-stats-section]',
      start: 'top 80%',
    },
  });
}
```

### Reveal Section on Scroll

```html
<div
  data-scroll-trigger
  data-gsap-from='{"opacity": 0, "clipPath": "inset(100% 0 0 0)"}'
  data-gsap-to='{"opacity": 1, "clipPath": "inset(0% 0 0 0)"}'
>
  Section reveals from top
</div>
```

### Text Slide Up

```html
<h2 data-scroll-trigger data-gsap-from='{"y": 100, "opacity": 0}' data-trigger-start="top 90%">
  Text slides up when visible
</h2>
```

---

## Animation Recipes

### 1. Fade In Up (Most Common)

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "y": 50}'>Content</div>
```

### 2. Slide From Left

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "x": -100}'>Content</div>
```

### 3. Scale In

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "scale": 0.5}'>Content</div>
```

### 4. Rotate In

```html
<div data-scroll-trigger data-gsap-from='{"opacity": 0, "rotation": 90}'>Content</div>
```

### 5. Clip Path Reveal

```html
<div
  data-scroll-trigger
  data-gsap-from='{"clipPath": "inset(0 100% 0 0)"}'
  data-gsap-to='{"clipPath": "inset(0 0 0 0)"}'
>
  Content
</div>
```

---

## Advanced Examples

### Parallax Layers

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  // Different speeds for different layers
  gsap.to('[data-parallax-slow]', {
    y: 100,
    scrollTrigger: {
      trigger: '[data-parallax-section]',
      scrub: true,
    },
  });

  gsap.to('[data-parallax-fast]', {
    y: 300,
    scrollTrigger: {
      trigger: '[data-parallax-section]',
      scrub: true,
    },
  });
}
```

### Horizontal Scroll Gallery

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  const sections = gsap.utils.toArray('[data-panel]');
  const container = document.querySelector('[data-panels-container]');

  gsap.to(sections, {
    xPercent: -100 * (sections.length - 1),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      snap: 1 / (sections.length - 1),
      end: () => '+=' + container.offsetWidth,
    },
  });
}
```

### Scroll Progress Indicator

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  gsap.to('[data-progress-bar]', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });
}
```

### Text Reveal Animation

```javascript
import { initGSAP, getGSAP } from '../components/gsap';

export async function initHomePage() {
  await initGSAP();
  const gsap = getGSAP();

  // Split text into words/chars if needed
  const headings = document.querySelectorAll('[data-text-reveal]');

  headings.forEach((heading) => {
    const words = heading.textContent.split(' ');
    heading.innerHTML = words.map((word) => `<span>${word}</span>`).join(' ');

    gsap.from(heading.querySelectorAll('span'), {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.05,
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
      },
    });
  });
}
```

---

## Troubleshooting

**Animations not working:**

- Check GSAP loaded (look for "✅ GSAP loaded" in console)
- Verify data attributes are correct (valid JSON)
- Check element has `[data-gsap]` or `[data-scroll-trigger]`
- Make sure you called `initGSAP()` in your page

**ScrollTrigger not working:**

- Check element has `[data-scroll-trigger]`
- Verify trigger points with `data-trigger-markers="true"`
- Make sure content is tall enough to scroll
- Check browser console for errors

**Animations jump or flicker:**

- Set initial state in CSS to match `data-gsap-from`
- Use `visibility: hidden` initially if needed
- Check for conflicting CSS transitions

**Refresh not working:**

- Call `refreshScrollTrigger()` after DOM changes
- Wait for images to load before refreshing
- Check ScrollTrigger is loaded

---

## Performance Notes

✅ **Zero bundle impact** - GSAP loads from CDN (~40kb gzipped)  
✅ **Lazy loaded** - Only loads when you call `initGSAP()`  
✅ **GPU accelerated** - Smooth 60fps animations  
✅ **Optimized** - Uses RAF, batched updates, efficient DOM handling  
✅ **Mobile friendly** - Works great on all devices

**Total impact**: ~40kb from CDN (not in your 16.8kb bundle!)

---

## API Reference

### Functions

- `initGSAP()` - Initialize GSAP and auto-animate elements
- `animate(target, vars)` - Create custom animation
- `createTimeline(vars)` - Create animation timeline
- `createScrollTrigger(config)` - Create scroll trigger
- `refreshScrollTrigger()` - Refresh all triggers
- `getGSAP()` - Get GSAP instance
- `getScrollTrigger()` - Get ScrollTrigger instance
- `killAllScrollTriggers()` - Clean up all triggers

### Data Attributes

- `[data-gsap]` - Enable GSAP animation
- `[data-scroll-trigger]` - Enable scroll animation
- `data-gsap-from` - Starting state (JSON)
- `data-gsap-to` - Ending state (JSON)
- `data-gsap-duration` - Duration in seconds
- `data-gsap-delay` - Delay in seconds
- `data-gsap-stagger` - Stagger delay for children
- `data-trigger-start` - ScrollTrigger start point
- `data-trigger-end` - ScrollTrigger end point
- `data-trigger-scrub` - Link to scroll position
- `data-trigger-pin` - Pin element
- `data-trigger-markers` - Debug mode

---

## Learn More

- [GSAP Documentation](https://greensock.com/docs/)
- [ScrollTrigger Documentation](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [GSAP Cheat Sheet](https://greensock.com/cheatsheet/)
- [CodePen Examples](https://codepen.io/GreenSock/)

---

## Summary

- ✅ Import `initGSAP()` on pages that need animations
- ✅ Add `[data-gsap]` for basic animations
- ✅ Add `[data-scroll-trigger]` for scroll animations
- ✅ Use data attributes for simple animations
- ✅ Use JavaScript API for complex timelines
- ✅ GSAP loads from CDN (no bundle bloat)
- ✅ ScrollTrigger included for scroll effects

**Professional animations made easy!** 🎬
