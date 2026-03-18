'use strict';

import * as THREE from 'three';

export function initSpheresThree() {
  function init() {
    var container = document.getElementById('three-container');
    if (!container) return;

    var width = container.clientWidth;
    var height = container.clientHeight;

    // If the container has no size yet (Webflow has not finished layout) — try again on the next frame.
    if (!width || !height) {
      requestAnimationFrame(init);
      return;
    }

    // --- Settings (edit here to tune the spheres) ---
    var SETTINGS = {
      lightRadius: 0.8,
      falloffPower: 2.4,
      intensity: { min: 0.3, max: 1.2 },
      glow: {
        edgeActive: 0.25,
        edgeIdle: 0.25,
        centerActive: 0.05,
        centerIdle: 0.15,
        centerRadius: 0.32,
      },
      layers: {
        violet1Strength: 1.65,
        violet2Strength: 1.45,
        ringStrength: 1.05,
        violet1RadiusMult: 0.62,
        violet2RadiusMult: 2.56,
      },
      outerFade: {
        start: 2.2,
        end: 4.8,
        shadowStrength: 1.1,
      },
      colors: {
        basePinkLight: '#FD4472',
        basePinkShadow: '#C62F70',
        violet1: '#1D196B',
        violet2: '#140B28',
        centerGlow: '#FFEAF2',
        background: '#010416',
      },
    };

    // --- Scene and shader parameters (derived from SETTINGS) ---

    var LERP_SPEED = 0.08;

    var USE_SMOOTH_RETURN = true;

    // Geometry and grid of circles
    var SPHERE_RADIUS = 0.78;
    var GRID_SPACING = 1.55;
    var GRID_ROWS = 7;
    var GRID_COLS = 9;

    // Base colors (from SETTINGS.colors)
    var COLOR_PINK_START = new THREE.Color(SETTINGS.colors.basePinkLight);
    var COLOR_PINK_END = new THREE.Color(SETTINGS.colors.basePinkShadow);
    var COLOR_VIOLET1 = new THREE.Color(SETTINGS.colors.violet1);
    var COLOR_VIOLET2 = new THREE.Color(SETTINGS.colors.violet2);
    var COLOR_CENTER_GLOW = new THREE.Color(SETTINGS.colors.centerGlow);

    // Animated glow state (targets come from SETTINGS.glow)
    var EDGE_GLOW_FACTOR = SETTINGS.glow.edgeIdle;
    var CENTER_GLOW_FACTOR = SETTINGS.glow.centerIdle;

    // Vertex shader
    var circleVertexShader = [
      'varying vec2 vUv;',
      'void main() {',
      '  vUv = uv;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}',
    ].join('\n');

    // Fragment shader: draws a single "sphere" with all the layers
    var circleFragmentShader = [
      'uniform float uProximity;', // global proximity (for brightness, edge glow, center glow, etc.)
      'uniform float uProximityDark;', // spare channel, can be reused as an extra radius
      'uniform float uProximityV1;', // separate proximity radius for the Violet 1 layer
      'uniform float uProximityV2;', // separate proximity radius for the Violet 2 layer
      'uniform float uBrightness;',
      'uniform float uEdgeGlowFactor;',
      'uniform float uCenterGlowFactor;',
      'uniform float uViolet1Strength;',
      'uniform float uViolet2Strength;',
      'uniform float uRingStrength;',
      'uniform float uCenterGlowRadius;',
      'uniform vec2  uCursorDir;',
      'uniform vec3  uPinkStart;',
      'uniform vec3  uPinkEnd;',
      'uniform vec3  uViolet1;',
      'uniform vec3  uViolet2;',
      'uniform vec3  uCenterGlowColor;',
      'uniform float uOuterFade;',
      'uniform float uOuterShadowStrength;',
      'uniform vec3  uBackgroundColor;',
      'varying vec2 vUv;',
      '',
      'void main() {',
      '  vec2 p = (vUv - 0.5) * 2.0;',
      '  float r = length(p);',
      '  if (r > 1.0) discard;',
      '',
      // tBase — main proximity (for brightness, edge glow, center glow)
      // tV1 / tV2 — separate proximity values for the two violet layers (independent radii)
      '  float tBase = uProximity;',
      '  float tV1   = uProximityV1;',
      '  float tV2   = uProximityV2;',
      '  float t     = tBase;',
      '  vec2 n = r > 0.001 ? p / r : vec2(0.0);',
      '  float facing = 1.0 - r;',
      '  float rawFresnel = r;',
      '',
      // Base pink gradient
      '  vec3 pinkStart = uPinkStart;',
      '  vec3 pinkEnd   = uPinkEnd;',
      '  vec3 pinkGrad = mix(pinkStart, pinkEnd, p.x * 0.5 + 0.5);',
      '',
      // LAYER 1 (lighter violet): always present, shifted AWAY from the cursor
      '  vec3 violet1 = uViolet1;',
      '  vec2 v1Off = -uCursorDir * 0.30;',
      '  float v1Sc = 1.0 + 0.28 * (1.0 - tBase);',
      // Widen and soften the disk so violet smoothly stretches toward the center
      '  float v1Dist = length((p - v1Off) / v1Sc);',
      '  float v1Disc = 1.0 - smoothstep(0.30, 1.00, v1Dist);',
      // Slightly softer curve instead of a hard power so the transition is smoother
      '  float v1Falloff = pow(1.0 - tV1, 1.3);',
      '  float v1Amt = v1Disc * v1Falloff * 0.92 * uViolet1Strength * uOuterFade * uOuterShadowStrength;',
      '  vec3 base = mix(pinkGrad, violet1, clamp(v1Amt, 0.0, 1.0));',
      '',
      // LAYER 2 (darker): deep violet operating at a larger radius (tV2)
      '  vec3 violet2 = uViolet2;',
      '  vec2 v2Off = -uCursorDir * 0.22;',
      '  float v2Sc = 1.0 + 0.35 * (1.0 - tV2);',
      // Sharper disk for the second, deeper shadow
      '  float v2Dist = length((p - v2Off) / v2Sc);',
      '  float v2Disc = 1.0 - smoothstep(0.6, 0.96, v2Dist);',
      '  float farFactor = max(0.0, 1.0 - tV2 * 2.5);',
      '  float v2Amt = v2Disc * farFactor * 0.7 * uViolet2Strength * uOuterFade * uOuterShadowStrength;',
      '  base = mix(base, violet2, clamp(v2Amt, 0.0, 1.0));',
      '',
      // Pink ring around the sphere (mimics extra ellipses from the Figma design)
      '  float glowRingD = r / 0.95;',
      '  float glowRing = smoothstep(0.5, 0.95, glowRingD) * (1.0 - smoothstep(0.95, 1.05, glowRingD));',
      '  vec3 glowRingColor = vec3(0.95, 0.35, 0.55);',
      '  base = mix(base, glowRingColor, glowRing * 0.35 * t * uRingStrength * uOuterFade);',
      '',
      // White edge glow along the rim of the sphere
      '  float edgeGlow = smoothstep(0.73, 1.0, r);',
      '  vec3 edgeGlowColor = vec3(1.0, 1.0, 1.0);',
      // Direction from sphere to cursor in 2D
      '  vec2 dir = uCursorDir;',
      '  float dirLen = length(dir);',
      '  vec2 dirNorm = dirLen > 0.001 ? dir / dirLen : vec2(1.0, 0.0);',
      // sideDirectional lights only the rim facing the cursor (crescent shape)
      '  float sideDirectional = max(0.0, dot(dirNorm, n));',
      // centerBlend → 1 when t is near 1 (cursor directly over the sphere) → full ring
      // and → 0 when t is small → pure crescent
      '  float centerBlend = smoothstep(0.6, 1.0, t);',
      '  float sideFactor = mix(sideDirectional, 1.0, centerBlend);',
      // sqrt(t) so neighboring spheres inside the radius also light up, not just the center one
      '  float edgeGlowStrength = edgeGlow * sideFactor * (0.2 + 0.8 * sqrt(t)) * uEdgeGlowFactor;',
      '  base = mix(base, edgeGlowColor, edgeGlowStrength);',
      '',
      '  vec3 col = base;',
      '  col *= uBrightness;',
      '',
      // Central white-pink spot that moves toward the cursor
      '  vec2 glowCenter = uCursorDir * 0.35;',
      '  float glowDist = length(p - glowCenter) / uCenterGlowRadius;',
      '  float glowShape = 1.0 - smoothstep(0.0, 1.0, glowDist);',
      '  float edgeMask = 1.0 - smoothstep(0.6, 0.9, r);',
      '  float glowOp = t > 0.1 ? min(1.0, 0.3 + t * 0.5) : 0.0;',
      '  float centerGlow = glowShape * edgeMask * glowOp;',
      '  vec3 glowColor = uCenterGlowColor;',
      '  col = mix(col, glowColor, centerGlow * 0.45 * uCenterGlowFactor);',
      '',
      // Smoothly fade the circle into the background using uOuterFade
      '  col = mix(uBackgroundColor, col, uOuterFade);',
      '  float alpha = (1.0 - smoothstep(0.97, 1.0, r)) * uOuterFade;',
      '  gl_FragColor = vec4(col, alpha);',
      '}',
    ].join('\n');

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(SETTINGS.colors.background);

    var aspect = width / height;
    var frustumSize = 10;
    var camera = new THREE.OrthographicCamera(
      -frustumSize * aspect * 0.5,
      frustumSize * aspect * 0.5,
      frustumSize * 0.5,
      -frustumSize * 0.5,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // mouse in NDC (-1..1); actual cursor coordinates
    var mouse = new THREE.Vector2(0, 0);
    // virtualMouse — smoothed coordinates used for animation (including return-to-center)
    var virtualMouse = new THREE.Vector2(0, 0);
    var lastMouseMoveTime = performance.now();
    var loadStartTime = performance.now();
    var projectedPos = new THREE.Vector3();
    var planeIntersect = new THREE.Vector3();
    var cursorWorld = new THREE.Vector3(0, 0, 0);
    var raycaster = new THREE.Raycaster();
    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    var sphereMeshes = [];
    var PLANE_SIZE = SPHERE_RADIUS * 2;
    var sharedGeometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);

    for (var row = 0; row < GRID_ROWS; row++) {
      for (var col = 0; col < GRID_COLS; col++) {
        var material = new THREE.ShaderMaterial({
          vertexShader: circleVertexShader,
          fragmentShader: circleFragmentShader,
          transparent: true,
          uniforms: {
            uProximity: { value: 0 },
            uProximityDark: { value: 0 },
            uProximityV1: { value: 0 },
            uProximityV2: { value: 0 },
            uBrightness: { value: 1.0 },
            uEdgeGlowFactor: { value: 1.0 },
            uCenterGlowFactor: { value: 1.0 },
            uViolet1Strength: { value: 1.0 },
            uViolet2Strength: { value: 1.0 },
            uRingStrength: { value: 1.0 },
            uCenterGlowRadius: { value: 0.5 },
            uCursorDir: { value: new THREE.Vector2(0, 0) },
            uPinkStart: { value: COLOR_PINK_START },
            uPinkEnd: { value: COLOR_PINK_END },
            uViolet1: { value: COLOR_VIOLET1 },
            uViolet2: { value: COLOR_VIOLET2 },
            uCenterGlowColor: { value: COLOR_CENTER_GLOW },
            uOuterFade: { value: 1.0 },
            uOuterShadowStrength: { value: SETTINGS.outerFade.shadowStrength },
            uBackgroundColor: { value: new THREE.Color(SETTINGS.colors.background) },
          },
        });
        var mesh = new THREE.Mesh(sharedGeometry, material);
        mesh.position.x = (col - (GRID_COLS - 1) * 0.5) * GRID_SPACING;
        mesh.position.y = (row - (GRID_ROWS - 1) * 0.5) * GRID_SPACING;
        mesh.position.z = 0;
        mesh.userData = {
          targetIntensity: SETTINGS.intensity.min,
          currentIntensity: SETTINGS.intensity.min,
          tSmooth: 0,
        };
        scene.add(mesh);
        sphereMeshes.push(mesh);
      }
    }

    function getMouseNDC(e) {
      var rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      virtualMouse.copy(mouse);
      lastMouseMoveTime = performance.now();
    }

    container.addEventListener('mousemove', getMouseNDC, false);

    // When the mouse leaves the frame:
    // - in smooth mode we return virtualMouse to the center over ~2 seconds
    // - in snap mode we move it to the center instantly without animation
    var returningToCenter = false;
    var returnStartTime = 0;
    var returnStartMouse = new THREE.Vector2();

    container.addEventListener(
      'mouseleave',
      function () {
        if (USE_SMOOTH_RETURN) {
          // плавний варіант: запускаємо автодоводку до центру
          returnStartMouse.copy(virtualMouse);
          returnStartTime = performance.now();
          returningToCenter = true;
        } else {
          // snap: move to center and glow to idle
          virtualMouse.set(0, 0);
          returningToCenter = false;
          CENTER_GLOW_FACTOR = SETTINGS.glow.centerIdle;
          EDGE_GLOW_FACTOR = SETTINGS.glow.edgeIdle;
        }
        lastMouseMoveTime = 0;
      },
      false
    );

    function animate() {
      requestAnimationFrame(animate);

      // Determine how recently the mouse moved to drive center/edge glow animation
      var now = performance.now();
      var secondsSinceMove = (now - lastMouseMoveTime) / 1000;
      var activeThreshold = 0.8; // lifetime of the "active" state after mouse stops (seconds)
      var isActive = secondsSinceMove < activeThreshold;

      // Time constants for glow animation (seconds)
      var riseSpeed = 0.5; // quick ramp-up while cursor is moving (~0.5 s)
      var fallSpeed = 0.03; // slower fade-out (~2 s)

      var targetCenterGlow = isActive ? SETTINGS.glow.centerActive : SETTINGS.glow.centerIdle;
      var targetEdgeGlow = isActive ? SETTINGS.glow.edgeActive : SETTINGS.glow.edgeIdle;

      var centerLerp = isActive ? riseSpeed : fallSpeed;
      var edgeLerp = isActive ? riseSpeed : fallSpeed;

      CENTER_GLOW_FACTOR += (targetCenterGlow - CENTER_GLOW_FACTOR) * centerLerp;
      EDGE_GLOW_FACTOR += (targetEdgeGlow - EDGE_GLOW_FACTOR) * edgeLerp;

      // Initial "glow up" animation for the center (~2 seconds)
      var loadSeconds = (now - loadStartTime) / 1000;
      var loadT = Math.max(0, Math.min(1, loadSeconds / 2.0));
      var loadEase = loadT * loadT * (3 - 2 * loadT); // smoothstep ease

      // Smoothly return the virtual cursor to the center (~2 seconds)
      if (returningToCenter) {
        var returnSeconds = (now - returnStartTime) / 1000;
        var rt = Math.max(0, Math.min(1, returnSeconds));
        var re = rt * rt * (3 - 2 * rt);
        virtualMouse.x = returnStartMouse.x + (0 - returnStartMouse.x) * re;
        virtualMouse.y = returnStartMouse.y + (0 - returnStartMouse.y) * re;
        if (rt >= 1) {
          returningToCenter = false;
        }
      }

      // Use smoothed virtualMouse for all calculations
      raycaster.setFromCamera(virtualMouse, camera);
      var mouseInView =
        virtualMouse.x >= -1.2 &&
        virtualMouse.x <= 1.2 &&
        virtualMouse.y >= -1.2 &&
        virtualMouse.y <= 1.2;
      if (mouseInView && raycaster.ray.intersectPlane(plane, planeIntersect)) {
        cursorWorld.copy(planeIntersect);
      } else {
        cursorWorld.set(0, 0, 0);
      }

      for (var i = 0; i < sphereMeshes.length; i++) {
        var mesh = sphereMeshes[i];
        projectedPos.copy(mesh.position).project(camera);
        var dx = virtualMouse.x - projectedPos.x;
        var dy = virtualMouse.y - projectedPos.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        var t = Math.max(0, 1 - dist / SETTINGS.lightRadius);
        var tSmooth = Math.pow(t, SETTINGS.falloffPower);
        mesh.userData.tSmooth = tSmooth;
        mesh.userData.targetIntensity =
          SETTINGS.intensity.min + (SETTINGS.intensity.max - SETTINGS.intensity.min) * tSmooth;
      }

      for (var j = 0; j < sphereMeshes.length; j++) {
        var m = sphereMeshes[j];
        m.userData.currentIntensity +=
          (m.userData.targetIntensity - m.userData.currentIntensity) * LERP_SPEED;
      }

      var radiusV1 = SETTINGS.lightRadius * SETTINGS.layers.violet1RadiusMult;
      var radiusV2 = SETTINGS.lightRadius * SETTINGS.layers.violet2RadiusMult;
      scene.background.set(SETTINGS.colors.background);
      for (var k = 0; k < sphereMeshes.length; k++) {
        var m2 = sphereMeshes[k];
        var proximity = Math.max(
          0,
          Math.min(
            1,
            (m2.userData.currentIntensity - SETTINGS.intensity.min) /
            (SETTINGS.intensity.max - SETTINGS.intensity.min)
          )
        );
        projectedPos.copy(m2.position).project(camera);
        var dxDark = virtualMouse.x - projectedPos.x;
        var dyDark = virtualMouse.y - projectedPos.y;
        var distDark = Math.sqrt(dxDark * dxDark + dyDark * dyDark);
        var tV1Raw = Math.max(0, 1 - distDark / radiusV1);
        var tV2Raw = Math.max(0, 1 - distDark / radiusV2);
        var proximityV1 = Math.pow(tV1Raw, SETTINGS.falloffPower);
        var proximityV2 = Math.pow(tV2Raw, SETTINGS.falloffPower);
        var cdx = cursorWorld.x - m2.position.x;
        var cdy = cursorWorld.y - m2.position.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        var dirX = cdist > 0.001 ? cdx / cdist : 0;
        var dirY = cdist > 0.001 ? cdy / cdist : 0;
        var localScale = Math.min(1, cdist / SPHERE_RADIUS);
        var outerFadeT = Math.max(
          0,
          Math.min(
            1,
            (cdist - SETTINGS.outerFade.start) /
            (SETTINGS.outerFade.end - SETTINGS.outerFade.start)
          )
        );
        var outerFade = 1.0 - outerFadeT * outerFadeT * (3 - 2 * outerFadeT);
        outerFade *= loadEase;
        m2.material.uniforms.uProximity.value = proximity;
        m2.material.uniforms.uProximityV1.value = proximityV1;
        m2.material.uniforms.uProximityV2.value = proximityV2;
        m2.material.uniforms.uOuterFade.value = outerFade;
        m2.material.uniforms.uOuterShadowStrength.value = SETTINGS.outerFade.shadowStrength;
        m2.material.uniforms.uProximityDark.value = proximityV2;
        m2.material.uniforms.uBrightness.value = 0.42 + 0.58 * proximity;
        m2.material.uniforms.uEdgeGlowFactor.value = EDGE_GLOW_FACTOR * loadEase;
        m2.material.uniforms.uCenterGlowFactor.value = CENTER_GLOW_FACTOR * loadEase;
        m2.material.uniforms.uViolet1Strength.value = SETTINGS.layers.violet1Strength;
        m2.material.uniforms.uViolet2Strength.value = SETTINGS.layers.violet2Strength;
        m2.material.uniforms.uRingStrength.value = SETTINGS.layers.ringStrength;
        m2.material.uniforms.uCenterGlowRadius.value = SETTINGS.glow.centerRadius;
        m2.material.uniforms.uCursorDir.value.set(dirX * localScale, dirY * localScale);
        // Colors from SETTINGS (live update)
        m2.material.uniforms.uPinkStart.value.set(SETTINGS.colors.basePinkLight);
        m2.material.uniforms.uPinkEnd.value.set(SETTINGS.colors.basePinkShadow);
        m2.material.uniforms.uViolet1.value.set(SETTINGS.colors.violet1);
        m2.material.uniforms.uViolet2.value.set(SETTINGS.colors.violet2);
        m2.material.uniforms.uCenterGlowColor.value.set(SETTINGS.colors.centerGlow);
        m2.material.uniforms.uBackgroundColor.value.set(SETTINGS.colors.background);
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', function () {
      var w = container.clientWidth;
      var h = container.clientHeight;
      if (!w || !h) return;
      var a = w / h;
      camera.left = -frustumSize * a * 0.5;
      camera.right = frustumSize * a * 0.5;
      camera.top = frustumSize * 0.5;
      camera.bottom = -frustumSize * 0.5;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  init();
}
