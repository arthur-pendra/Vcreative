/* GLSL-bronnen voor de WebGL-laag (useWebGLEffects):
   - text*: noise-mask die oplost en de DOM-tekst onthult
   - img*:  textured quad met bend-vervorming en parallax-pan */

/* ── Text Overlay Shader (bg-colored mask dissolves to reveal DOM text) ── */

export const textVertShader = /* glsl */ `
precision highp float;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const textFragShader = /* glsl */ `
precision highp float;
uniform float uReveal;
uniform vec3 uColor;
uniform vec2 uAspect;
uniform vec2 uSize;
varying vec2 vUv;

float random(vec2 co) {
  highp float a = 12.9898;
  highp float b = 78.233;
  highp float c = 43758.5453;
  highp float dt = dot(co.xy, vec2(a, b));
  highp float sn = mod(dt, 3.14);
  return fract(sin(sn) * c);
}

// Value noise (Morgan McGuire) — fijne korrel, zelfde familie als de
// menu-inkt. Verstoort de rand van de reveal-veeg i.p.v. de tekst zelf
// op te lossen (dat gaf de oude radiale "olievlek").
float noise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  // Rusttoestand vóór de reveal: de mask dekt de tekst volledig af.
  if (uReveal <= 0.001) {
    gl_FragColor = vec4(uColor, 1.0);
    return;
  }

  float smoothness = 0.5;

  // Reveal-front: radiale afstand vanaf de linkerbovenhoek (0,1),
  // aspect-gecorrigeerd en genormaliseerd zodat de rechtsonder-hoek op 1
  // ligt. De veeg loopt zo van linksboven naar rechtsonder.
  vec2 ratio = vec2(1.0, 1.0 / uAspect.x);
  float maxDist = length(ratio) * 0.75;
  float dist = length((vUv - vec2(0.0, 1.0)) * ratio * 0.75) / maxDist;

  // Noise-korrel rafelt de rand van de veeg organisch open. Schaal op
  // pixelgrootte (zoals unseen: ~0.08/px) zodat de korrel overal even fijn
  // is, los van hoe groot het tekstblok is.
  float n = noise(vUv * uSize * 0.08);

  float p = mix(-smoothness, 1.0 + smoothness, uReveal);
  float edge = smoothstep(p - smoothness, p + smoothness, n);
  float q = smoothstep(uReveal - edge, uReveal, dist);

  if (q < 0.01) discard;
  gl_FragColor = vec4(uColor, q);
}
`

/* ── Image Shaders ── */

export const imgVertShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 ssCoords;

uniform vec2 uTextureSize;
uniform vec2 uQuadSize;
uniform float u_progress;
uniform bool u_enableBend;

void main() {
  vec3 pos = position;
  mat4 MVPM = projectionMatrix * modelViewMatrix;
  vec4 originalPosition = MVPM * vec4(position, 1.0);
  ssCoords = vec2(originalPosition.xy / originalPosition.w);

  if (u_enableBend) {
    float startAt = uv.y - 0.5;
    float finishAt = uv.y;
    float bend = smoothstep(startAt, finishAt, 1.0 - u_progress);
    pos.x *= 1.0 + (bend * 0.04) * abs(ssCoords.x);
    pos.z += bend * 7.0;
  }

  vUv = uv;
  gl_Position = MVPM * vec4(pos, 1.0);
}
`

export const imgFragShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform vec2 uQuadSize;
uniform float u_opacity;
uniform float u_innerScale;
uniform float u_innerY;
uniform float u_edgeFade;

varying vec2 vUv;
varying vec2 ssCoords;

vec2 getCoverUv(vec2 uv, vec2 textureSize, vec2 quadSize) {
  vec2 ratio = vec2(
    min((quadSize.x / quadSize.y) / (textureSize.x / textureSize.y), 1.0),
    min((quadSize.y / quadSize.x) / (textureSize.y / textureSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vec2 uv = getCoverUv(vUv, uTextureSize, uQuadSize);

  vec2 scaleOrigin = vec2(0.5);
  uv = (uv - scaleOrigin) / u_innerScale + scaleOrigin;
  uv.y += u_innerY;

  vec4 color = texture2D(uTexture, uv);

  float thresholdLeft = smoothstep(-0.85, -1.0, ssCoords.x) * u_edgeFade;
  float thresholdRight = smoothstep(0.85, 1.0, ssCoords.x) * u_edgeFade;
  float thresholdTop = smoothstep(0.85, 1.0, ssCoords.y) * u_edgeFade;
  float thresholdBottom = smoothstep(-0.85, -1.0, ssCoords.y) * u_edgeFade;
  float threshold = thresholdLeft + thresholdRight + thresholdBottom + thresholdTop;

  float colorShiftR = texture2D(uTexture, uv + vec2(0.0, 0.003)).r;
  float colorShiftG = texture2D(uTexture, uv - vec2(0.0, 0.003)).g;
  color.r = mix(color.r, colorShiftR, threshold);
  color.g = mix(color.g, colorShiftG, threshold);

  gl_FragColor = vec4(color.rgb, color.a * u_opacity);
}
`
