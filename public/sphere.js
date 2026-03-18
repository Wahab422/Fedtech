(function () {
  'use strict';
  var container = document.getElementById('canvas-wrap');
  if (!container) return;

  // Мінімальна/максимальна яскравість кулі (0–1)
  var INTENSITY_DIM = 0.3;
  var INTENSITY_BRIGHT = 1.2;

  // Наскільки швидко сфера реагує на зміну освітлення
  var LERP_SPEED = 0.08;

  // Радіус впливу курсора в нормалізованих координатах екрана (-1..1)
  var LIGHT_RADIUS_NDC = 0.8;

  // Наскільки різко згасає освітлення з відстанню
  var FALLOFF_POWER = 2.4;

  // ОКРЕМИЙ радіус/фолоф тільки для edge-glow
  var EDGE_LIGHT_RADIUS = 0.8;
  var EDGE_FALLOFF_POWER = 1.0;

  // Окремі множники радіуса для фіолетових шарів
  var V1_RADIUS_MULT = 0.62;
  var V2_RADIUS_MULT = 2.56;
  var V3_RADIUS_MULT = 0.22; // залишив без змін, бо в JSON немає значення

  // Параметри для зовнішнього затухання кіл до фону
  var OUTER_FADE_START = 2.2;
  var OUTER_FADE_END = 4.8;
  var OUTER_SHADOW_STRENGTH = 1.1;

  // Ambient floor: мінімальна видимість орб на периферії
  var AMBIENT_FLOOR = 0.85;

  // Режим повернення курсора в центр
  var USE_SMOOTH_RETURN = false;

  // Геометрія та сітка кіл
  var SPHERE_RADIUS = 0.78;
  var GRID_SPACING = 1.55;
  var GRID_ROWS = 7;
  var GRID_COLS = 9;

  // Базові кольори
  var COLOR_PINK_START = new THREE.Color('#FD4472');
  var COLOR_PINK_END = new THREE.Color('#C62F70');
  var COLOR_VIOLET1 = new THREE.Color('#1D196B');
  var COLOR_VIOLET2 = new THREE.Color('#140B28');
  var COLOR_VIOLET3 = new THREE.Color('#140830'); // залишив без змін
  var COLOR_CENTER_GLOW = new THREE.Color('#FFEAF2');

  // Коефіцієнти glow
  var EDGE_GLOW_ACTIVE = 0.25;
  var EDGE_GLOW_IDLE = 0.25;
  var EDGE_GLOW_FACTOR = EDGE_GLOW_IDLE;

  var CENTER_GLOW_ACTIVE = 0.05;
  var CENTER_GLOW_IDLE = 0.15;
  var CENTER_GLOW_FACTOR = CENTER_GLOW_IDLE;

  // Layer tuning
  var VIOLET1_STRENGTH = 1.65;
  var VIOLET2_STRENGTH = 1.45;
  var VIOLET3_STRENGTH = 0.45; // залишив без змін
  var RING_STRENGTH = 1.05;
  var CENTER_GLOW_RADIUS = 0.32;

  // Параметри розповсюдження білого ріма по сусідніх орбах
  var EDGE_SPREAD_START = 0.0;
  var EDGE_SPREAD_END = 0.55;
  var EDGE_BASE_STRENGTH = 2.4;
  var EDGE_MAX_STRENGTH = 4.45;

  // Вершинний шейдер
  var circleVertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  // Фрагментний шейдер
  var circleFragmentShader = [
    'uniform float uProximity;',
    'uniform float uProximityDark;',
    'uniform float uProximityV1;',
    'uniform float uProximityV2;',
    'uniform float uProximityV3;',
    'uniform float uBrightness;',
    'uniform float uEdgeGlowFactor;',
    'uniform float uCenterGlowFactor;',
    'uniform float uViolet1Strength;',
    'uniform float uViolet2Strength;',
    'uniform float uViolet3Strength;',
    'uniform float uRingStrength;',
    'uniform float uCenterGlowRadius;',
    'uniform vec2  uCursorDir;',
    'uniform vec3  uPinkStart;',
    'uniform vec3  uPinkEnd;',
    'uniform vec3  uViolet1;',
    'uniform vec3  uViolet2;',
    'uniform vec3  uViolet3;',
    'uniform vec3  uCenterGlowColor;',
    'uniform float uOuterFade;',
    'uniform float uOuterShadowStrength;',
    'uniform float uEdgeSpreadStart;',
    'uniform float uEdgeSpreadEnd;',
    'uniform float uEdgeBaseStrength;',
    'uniform float uEdgeMaxStrength;',
    'uniform float uEdgeProximity;',
    'uniform vec3  uBackgroundColor;',
    'varying vec2 vUv;',
    '',
    'void main() {',
    '  vec2 p = (vUv - 0.5) * 2.0;',
    '  float r = length(p);',
    '  if (r > 1.0) discard;',
    '',
    '  float tBase = uProximity;',
    '  float tV1   = uProximityV1;',
    '  float tV2   = uProximityV2;',
    '  float tV3   = uProximityV3;',
    '  float t     = tBase;',
    '  vec2 n = r > 0.001 ? p / r : vec2(0.0);',
    '  float facing = 1.0 - r;',
    '  float rawFresnel = r;',
    '  vec2 dir = uCursorDir;',
    '  float dirLen = length(dir);',
    '  vec2 dirNorm = dirLen > 0.001 ? dir / dirLen : vec2(1.0, 0.0);',
    '  float sideDirectional = max(0.0, dot(dirNorm, n));',
    '',
    '  vec3 pinkStart = uPinkStart;',
    '  vec3 pinkEnd   = uPinkEnd;',
    '  vec3 pinkGrad = mix(pinkStart, pinkEnd, p.x * 0.5 + 0.5);',
    '',
    '  vec3 violet1 = uViolet1;',
    '  vec2 v1Off = -uCursorDir * (0.28 + 0.48 * t);',
    '  float v1Sc = 0.98 + 0.28 * (1.0 - tBase);',
    '  float v1Dist = length((p - v1Off) / v1Sc);',
    '  float v1Disc = 1.0 - smoothstep(0.12, 1.15, v1Dist);',
    '  float v1Falloff = pow(1.0 - tV1, 1.25);',
    '  float v1NearFade = 1.0 - smoothstep(0.18, 0.95, t);',
    '  float v1Amt = v1Disc * v1Falloff * v1NearFade * 0.88 * uViolet1Strength * uOuterFade * uOuterShadowStrength;',
    '  float v1AmtSoft = pow(clamp(v1Amt, 0.0, 1.0), 0.72);',
    '  vec3 base = mix(pinkGrad, violet1, v1AmtSoft);',
    '',
    '  vec3 violet2 = uViolet2;',
    '  vec2 v2Off = -uCursorDir * (0.22 + 0.42 * t);',
    '  float v2Sc = 0.88 + 0.32 * (1.0 - tV2);',
    '  float v2Dist = length((p - v2Off) / v2Sc);',
    '  float v2Disc = 1.0 - smoothstep(0.18, 1.02, v2Dist);',
    '  float farFactor = max(0.0, 1.0 - tV2 * 2.2);',
    '  float v2NearFade = 1.0 - smoothstep(0.14, 0.92, t);',
    '  float v2Amt = v2Disc * farFactor * v2NearFade * 0.62 * uViolet2Strength * uOuterFade * uOuterShadowStrength;',
    '  float v2AmtSoft = pow(clamp(v2Amt, 0.0, 1.0), 0.78);',
    '  base = mix(base, violet2, v2AmtSoft);',
    '',
    '  vec3 violet3 = uViolet3;',
    '  vec2 v3Off = -uCursorDir * (0.16 + 0.36 * t);',
    '  float v3Sc = 0.75 + 0.28 * (1.0 - tV3);',
    '  float v3Dist = length((p - v3Off) / v3Sc);',
    '  float v3Disc = 1.0 - smoothstep(0.12, 0.88, v3Dist);',
    '  float v3Falloff = pow(1.0 - tV3, 1.2);',
    '  float v3NearFade = 1.0 - smoothstep(0.12, 0.88, t);',
    '  float v3Amt = v3Disc * v3Falloff * v3NearFade * 0.52 * uViolet3Strength * uOuterFade * uOuterShadowStrength;',
    '  float v3AmtSoft = pow(clamp(v3Amt, 0.0, 1.0), 0.82);',
    '  base = mix(base, violet3, v3AmtSoft);',
    '',
    '  vec3 softPink = vec3(1.0, 0.76, 0.90);',
    '  float softMask = smoothstep(0.15, 0.72, r);',
    '  float softPinkAmount = softMask * sideDirectional * (0.35 + 0.58 * t) * (1.0 - min(v1Amt, 1.0)) * 0.12;',
    '  base = mix(base, softPink, softPinkAmount);',
    '',
    '  float glowRingD = r / 0.95;',
    '  float glowRing = smoothstep(0.45, 0.92, glowRingD) * (1.0 - smoothstep(0.92, 1.06, glowRingD));',
    '  vec3 glowRingColor = vec3(1.0, 0.50, 0.68);',
    '  base = mix(base, glowRingColor, glowRing * 0.45 * t * uRingStrength * uOuterFade);',
    '',
    '  float edgeGlow = smoothstep(0.7, 1.0, r);',
    '  vec3 warmPinkRim = vec3(0.99, 0.70, 0.85);',
    '  vec3 softWhiteRim = vec3(1.0, 0.93, 0.96);',
    '  float tEdge = uEdgeProximity;',
    '  float whiteRimAmount = smoothstep(uEdgeSpreadStart, uEdgeSpreadEnd, tEdge);',
    '  vec3 baseEdgeColor = mix(warmPinkRim, softWhiteRim, whiteRimAmount);',
    '  vec3 farEdgeColor = vec3(0.78, 0.38, 0.68);',
    '  float farRimFactor = 1.0 - smoothstep(0.22, 0.62, tEdge);',
    '  vec3 edgeGlowColor = mix(baseEdgeColor, farEdgeColor, farRimFactor);',
    '  float centerBlend = smoothstep(0.42, 1.0, tEdge);',
    '  float sideFactor = mix(sideDirectional, 1.0, centerBlend);',
    '  float coloredRimStrength = 0.32;',
    '  float whiteRimStrength = sideFactor * (uEdgeBaseStrength + uEdgeMaxStrength * tEdge);',
    '  float rimStrength = mix(coloredRimStrength, whiteRimStrength, whiteRimAmount);',
    '  float minFarRim = 0.58 * farRimFactor;',
    '  float edgeGlowStrength = edgeGlow * max(rimStrength, minFarRim) * uEdgeGlowFactor;',
    '  base = mix(base, edgeGlowColor, edgeGlowStrength);',
    '',
    '  vec3 col = base;',
    '  col *= uBrightness;',
    '',
    '  float farOutline = edgeGlow * farRimFactor * 0.65;',
    '  col = mix(col, edgeGlowColor, farOutline);',
    '',
    '  vec2 glowCenter = uCursorDir * 0.30;',
    '  float glowDist = length(p - glowCenter) / uCenterGlowRadius;',
    '  float glowShape = 1.0 - smoothstep(0.0, 1.2, glowDist);',
    '  float edgeMask = 1.0 - smoothstep(0.55, 0.85, r);',
    '  float glowOp = t > 0.1 ? min(1.0, 0.25 + t * 0.45) : 0.0;',
    '  float centerGlow = glowShape * edgeMask * glowOp;',
    '  vec3 glowColor = uCenterGlowColor;',
    '  col = mix(col, glowColor, centerGlow * 0.48 * uCenterGlowFactor);',
    '',
    '  col = mix(uBackgroundColor, col, uOuterFade);',
    '  float alpha = (1.0 - smoothstep(0.97, 1.0, r)) * uOuterFade;',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  var width = container.offsetWidth;
  var height = container.offsetHeight;
  if (!width || !height) return;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x010416);

  var aspect = width / height;
  var frustumSize = 10;
  var camera = new THREE.OrthographicCamera(
    -frustumSize * aspect * 0.5,
     frustumSize * aspect * 0.5,
     frustumSize * 0.5,
    -frustumSize * 0.5,
    0.1, 100
  );
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  var mouse = new THREE.Vector2(0, 0);
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
          uProximityV3: { value: 0 },
          uBrightness: { value: 1.0 },
          uEdgeGlowFactor: { value: 1.0 },
          uCenterGlowFactor: { value: 1.0 },
          uViolet1Strength: { value: 1.0 },
          uViolet2Strength: { value: 1.0 },
          uViolet3Strength: { value: 1.0 },
          uRingStrength: { value: 1.0 },
          uCenterGlowRadius: { value: 0.5 },
          uCursorDir: { value: new THREE.Vector2(0, 0) },
          uPinkStart: { value: COLOR_PINK_START },
          uPinkEnd: { value: COLOR_PINK_END },
          uViolet1: { value: COLOR_VIOLET1 },
          uViolet2: { value: COLOR_VIOLET2 },
          uViolet3: { value: COLOR_VIOLET3 },
          uCenterGlowColor: { value: COLOR_CENTER_GLOW },
          uOuterFade: { value: 1.0 },
          uOuterShadowStrength: { value: OUTER_SHADOW_STRENGTH },
          uEdgeSpreadStart: { value: EDGE_SPREAD_START },
          uEdgeSpreadEnd: { value: EDGE_SPREAD_END },
          uEdgeBaseStrength: { value: EDGE_BASE_STRENGTH },
          uEdgeMaxStrength: { value: EDGE_MAX_STRENGTH },
          uEdgeProximity: { value: 0 },
          uBackgroundColor: { value: new THREE.Color(0x010416) }
        }
      });
      var mesh = new THREE.Mesh(sharedGeometry, material);
      mesh.position.x = (col - (GRID_COLS - 1) * 0.5) * GRID_SPACING;
      mesh.position.y = (row - (GRID_ROWS - 1) * 0.5) * GRID_SPACING;
      mesh.position.z = 0;
      mesh.userData = { targetIntensity: INTENSITY_DIM, currentIntensity: INTENSITY_DIM, tSmooth: 0 };
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

  var returningToCenter = false;
  var returnStartTime = 0;
  var returnStartMouse = new THREE.Vector2();
  container.addEventListener('mouseleave', function () {
    if (USE_SMOOTH_RETURN) {
      returnStartMouse.copy(virtualMouse);
      returnStartTime = performance.now();
      returningToCenter = true;
    } else {
      virtualMouse.set(0, 0);
      returningToCenter = false;
      CENTER_GLOW_FACTOR = CENTER_GLOW_IDLE;
      EDGE_GLOW_FACTOR = EDGE_GLOW_IDLE;
    }
    lastMouseMoveTime = 0;
  }, false);

  function animate() {
    requestAnimationFrame(animate);

    var now = performance.now();
    var secondsSinceMove = (now - lastMouseMoveTime) / 1000;
    var activeThreshold = 0.8;
    var isActive = secondsSinceMove < activeThreshold;

    var riseSpeed = 0.5;
    var fallSpeed = 0.03;

    var targetCenterGlow = isActive ? CENTER_GLOW_ACTIVE : CENTER_GLOW_IDLE;
    var targetEdgeGlow = isActive ? EDGE_GLOW_ACTIVE : EDGE_GLOW_IDLE;

    var centerLerp = isActive ? riseSpeed : fallSpeed;
    var edgeLerp = isActive ? riseSpeed : fallSpeed;

    CENTER_GLOW_FACTOR += (targetCenterGlow - CENTER_GLOW_FACTOR) * centerLerp;
    EDGE_GLOW_FACTOR += (targetEdgeGlow - EDGE_GLOW_FACTOR) * edgeLerp;

    var loadSeconds = (now - loadStartTime) / 1000;
    var loadT = Math.max(0, Math.min(1, loadSeconds / 2.0));
    var loadEase = loadT * loadT * (3 - 2 * loadT);

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

    raycaster.setFromCamera(virtualMouse, camera);
    var mouseInView = virtualMouse.x >= -1.2 && virtualMouse.x <= 1.2 && virtualMouse.y >= -1.2 && virtualMouse.y <= 1.2;
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

      var t = Math.max(0, 1 - dist / LIGHT_RADIUS_NDC);
      var tSmooth = Math.pow(t, FALLOFF_POWER);
      mesh.userData.tSmooth = tSmooth;
      mesh.userData.targetIntensity = INTENSITY_DIM + (INTENSITY_BRIGHT - INTENSITY_DIM) * tSmooth;

      var tEdgeRaw = Math.max(0, 1 - dist / EDGE_LIGHT_RADIUS);
      var tEdge = Math.pow(tEdgeRaw, EDGE_FALLOFF_POWER);
      mesh.userData.edgeProximity = tEdge;
    }

    for (var j = 0; j < sphereMeshes.length; j++) {
      var m = sphereMeshes[j];
      m.userData.currentIntensity += (m.userData.targetIntensity - m.userData.currentIntensity) * LERP_SPEED;
    }

    var radiusV1 = LIGHT_RADIUS_NDC * V1_RADIUS_MULT;
    var radiusV2 = LIGHT_RADIUS_NDC * V2_RADIUS_MULT;
    var radiusV3 = LIGHT_RADIUS_NDC * V3_RADIUS_MULT;

    for (var k = 0; k < sphereMeshes.length; k++) {
      var m = sphereMeshes[k];
      var proximity = Math.max(0, Math.min(1, (m.userData.currentIntensity - INTENSITY_DIM) / (INTENSITY_BRIGHT - INTENSITY_DIM)));
      var edgeProximity = m.userData.edgeProximity || 0.0;

      projectedPos.copy(m.position).project(camera);
      var dxDark = virtualMouse.x - projectedPos.x;
      var dyDark = virtualMouse.y - projectedPos.y;
      var distDark = Math.sqrt(dxDark * dxDark + dyDark * dyDark);

      var tV1Raw = Math.max(0, 1 - distDark / radiusV1);
      var tV2Raw = Math.max(0, 1 - distDark / radiusV2);
      var tV3Raw = Math.max(0, 1 - distDark / radiusV3);

      var proximityV1 = Math.pow(tV1Raw, FALLOFF_POWER);
      var proximityV2 = Math.pow(tV2Raw, FALLOFF_POWER);
      var proximityV3 = Math.pow(tV3Raw, FALLOFF_POWER);

      var cdx = cursorWorld.x - m.position.x;
      var cdy = cursorWorld.y - m.position.y;
      var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
      var dirX = cdist > 0.001 ? (cdx / cdist) : 0;
      var dirY = cdist > 0.001 ? (cdy / cdist) : 0;
      var localScale = Math.min(1, cdist / SPHERE_RADIUS);

      var outerFadeT = Math.max(0, Math.min(1, (cdist - OUTER_FADE_START) / (OUTER_FADE_END - OUTER_FADE_START)));
      var outerFadeRaw = 1.0 - (outerFadeT * outerFadeT * (3 - 2 * outerFadeT));
      var outerFade = Math.max(AMBIENT_FLOOR, outerFadeRaw) * loadEase;

      m.material.uniforms.uProximity.value = proximity;
      m.material.uniforms.uProximityV1.value = proximityV1;
      m.material.uniforms.uProximityV2.value = proximityV2;
      m.material.uniforms.uProximityV3.value = proximityV3;
      m.material.uniforms.uOuterFade.value = outerFade;
      m.material.uniforms.uOuterShadowStrength.value = OUTER_SHADOW_STRENGTH;
      m.material.uniforms.uProximityDark.value = proximityV2;
      m.material.uniforms.uBrightness.value = 0.62 + 0.38 * proximity;
      m.material.uniforms.uEdgeGlowFactor.value = EDGE_GLOW_FACTOR * loadEase;
      m.material.uniforms.uCenterGlowFactor.value = CENTER_GLOW_FACTOR * loadEase;
      m.material.uniforms.uViolet1Strength.value = VIOLET1_STRENGTH;
      m.material.uniforms.uViolet2Strength.value = VIOLET2_STRENGTH;
      m.material.uniforms.uViolet3Strength.value = VIOLET3_STRENGTH;
      m.material.uniforms.uRingStrength.value = RING_STRENGTH;
      m.material.uniforms.uCenterGlowRadius.value = CENTER_GLOW_RADIUS;
      m.material.uniforms.uEdgeProximity.value = edgeProximity;
      m.material.uniforms.uCursorDir.value.set(dirX * localScale, dirY * localScale);
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', function () {
    var w = container.offsetWidth;
    var h = container.offsetHeight;
    if (!w || !h) return;
    var a = w / h;
    camera.left = -frustumSize * a * 0.5;
    camera.right = frustumSize * a * 0.5;
    camera.top = frustumSize * 0.5;
    camera.bottom = -frustumSize * 0.5;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();