/**
 * GLSL for the "Midnight Mandap" hero scene.
 * All materials handle fog themselves (uFogColor / uFogNear / uFogFar) so that
 * additive glows fade to black-ish ink instead of adding the fog colour.
 */

const FOG_PARS = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  float fogFactor(float depth) {
    return smoothstep(uFogNear, uFogFar, depth);
  }
`;

const HASH = /* glsl */ `
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
`;

/* ------------------------------------------------------------------ */
/*  Photo planes                                                       */
/* ------------------------------------------------------------------ */

export const photoVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const photoFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uAspect;      // width / height
  uniform float uTopRadius;   // corner radius of the top corners (height units)
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform vec3 uCream;
  ${FOG_PARS}
  ${HASH}
  varying vec2 vUv;
  varying float vDepth;

  // iq's rounded box, r = (top-right, bottom-right, top-left, bottom-left)
  float sdRoundBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x = (p.y > 0.0) ? r.x : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 b = vec2(uAspect * 0.5, 0.5);
    float d = sdRoundBox(p, b, vec4(uTopRadius, 0.03, uTopRadius, 0.03));
    float aa = 0.0035;
    float mask = 1.0 - smoothstep(-aa, aa, d);
    if (mask <= 0.002) discard;

    // faint chromatic offset that grows toward the edges
    vec2 c = vUv - 0.5;
    float r2 = dot(c, c);
    vec2 off = c * r2 * 0.028;
    vec3 col;
    col.r = texture2D(uMap, vUv + off).r;
    col.g = texture2D(uMap, vUv).g;
    col.b = texture2D(uMap, vUv - off).b;

    // desaturate with distance, full colour when near
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    float farness = smoothstep(uFogNear * 0.35, uFogFar * 0.75, vDepth);
    col = mix(col, vec3(lum), farness * 0.75);

    // gentle warm print-like shift
    col = mix(col, col * uCream, 0.14);

    // soft inner vignette on the print
    col *= 1.0 - 0.32 * smoothstep(0.12, 0.55, r2);

    // film grain, stronger in the shadows
    float g = hash12(vUv * vec2(640.0, 640.0 / uAspect) + floor(uTime * 18.0 + uSeed * 100.0)) - 0.5;
    col += g * 0.055 * (1.0 - lum * 0.6);

    // hairline chai-cream border
    float edge = smoothstep(-0.016, -0.007, d);
    col = mix(col, uCream * 0.85, edge * 0.38);

    float f = fogFactor(vDepth);
    col = mix(col, uFogColor, f);

    // fade out when the camera is about to pass through the plane
    float alpha = mask * uOpacity * smoothstep(0.35, 1.5, vDepth);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------ */
/*  Glowing arch tubes (core + halo)                                   */
/* ------------------------------------------------------------------ */

export const archVertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const archFragment = /* glsl */ `
  uniform vec3 uColorLow;    // sindoor
  uniform vec3 uColorHigh;   // rani pink
  uniform vec3 uHot;         // hot core tint (pinkish cream, not gold)
  uniform float uIntensity;
  uniform float uFalloff;    // facing exponent
  uniform float uHotness;    // 0 = halo, 1 = bright core
  uniform float uGradLow;
  uniform float uGradHigh;
  uniform float uTime;
  ${FOG_PARS}
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying float vDepth;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vWorldPos);
    float facing = clamp(abs(dot(n, v)), 0.0, 1.0);
    float t = smoothstep(uGradLow, uGradHigh, vWorldPos.y);
    vec3 col = mix(uColorLow, uColorHigh, t);
    float shaped = pow(facing, uFalloff);
    // slow candle-like breathing
    float breathe = 0.92 + 0.08 * sin(uTime * 1.3 + vWorldPos.y * 0.8) * sin(uTime * 0.37);
    col = mix(col, uHot, pow(facing, 7.0) * uHotness * 0.3);
    col *= shaped * uIntensity * breathe;
    col *= 1.0 - fogFactor(vDepth);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------ */
/*  Petals (instanced, animated entirely on the GPU)                   */
/* ------------------------------------------------------------------ */

export const petalVertex = /* glsl */ `
  attribute vec4 aSeed;   // x0, z0, phase, size
  attribute vec4 aMotion; // fallSpeed, spinSpeed, swayAmp, yOffset
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec3 uHalf;     // half extents of the petal volume
  uniform vec3 uCenter;
  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vNormalW;
  varying float vDepth;

  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }

  void main() {
    vUv = uv;
    vColor = aColor;
    float phase = aSeed.z;
    float t = uTime;

    // fall + wrap in Y
    float ySpan = uHalf.y * 2.0;
    float y = mod(aMotion.w - t * aMotion.x, ySpan) - uHalf.y;
    // wind drift + sway, wrapped in X
    float xSpan = uHalf.x * 2.0;
    float x = mod(aSeed.x + t * 0.22 + sin(t * 0.55 + phase) * aMotion.z + uHalf.x, xSpan) - uHalf.x;
    float z = aSeed.y + cos(t * 0.41 + phase * 1.7) * aMotion.z * 0.6;
    vec3 center = uCenter + vec3(x, y, z);

    // tumbling
    float s = aMotion.y;
    mat3 R = rotY(t * s + phase) * rotX(t * s * 0.63 + phase * 2.1) * rotZ(sin(t * 0.8 + phase) * 0.7);

    // gently cupped petal
    vec3 local = position;
    local.z = 0.35 * local.x * local.x - 0.12 * local.y * local.y;
    vec3 nLocal = normalize(vec3(-0.7 * position.x, 0.24 * position.y, 1.0));

    vec3 world = center + R * (local * aSeed.w);
    vNormalW = R * nLocal;

    vec4 mv = viewMatrix * vec4(world, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const petalFragment = /* glsl */ `
  uniform vec3 uRim;
  ${FOG_PARS}
  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vNormalW;
  varying float vDepth;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // petal silhouette: rounded base, slightly pointed tip
    float w = 0.78 * sqrt(max(1.0 - p.y * p.y, 0.0)) * (1.0 - 0.28 * p.y) ;
    float edge = w - abs(p.x);
    float mask = smoothstep(-0.06, 0.08, edge);
    if (mask < 0.01) discard;

    vec3 n = normalize(vNormalW);
    vec3 L = normalize(vec3(0.3, 0.8, 0.5));
    float diff = 0.55 + 0.45 * abs(dot(n, L));
    // crease / vein down the middle
    float vein = 1.0 - 0.18 * smoothstep(0.08, 0.0, abs(p.x)) * (0.5 + 0.5 * p.y);
    vec3 col = vColor * diff * vein;
    // pink rim light from the arch
    float rim = pow(1.0 - abs(n.z), 2.0);
    col += uRim * rim * 0.22;
    // darker toward base
    col *= 0.85 + 0.15 * (p.y * 0.5 + 0.5);

    float f = fogFactor(vDepth);
    col = mix(col, uFogColor, f);
    float alpha = mask * smoothstep(0.25, 0.9, vDepth) * (1.0 - f * 0.6);
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------ */
/*  Soft radial glow (background light) and vignette                   */
/* ------------------------------------------------------------------ */

export const radialVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const glowFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float d = length((vUv - 0.5) * 2.0);
    float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.4);
    vec3 col = mix(uColorB, uColorA, a) * a * uIntensity;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const vignetteFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  ${HASH}
  varying vec2 vUv;
  void main() {
    vec2 q = (vUv - 0.5) * vec2(1.15, 1.0);
    float d = length(q);
    float a = smoothstep(0.32, 0.98, d) * uStrength;
    // tiny dither so the gradient never bands
    a += (hash12(vUv * 1024.0) - 0.5) * 0.012;
    gl_FragColor = vec4(uColor, clamp(a, 0.0, 1.0));
  }
`;
