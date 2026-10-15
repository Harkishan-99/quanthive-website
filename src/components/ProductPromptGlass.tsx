import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

const PROMPT = "Can you explain this company's business model?";
const LOADER_APPEAR_DELAY_MS = 300;
const LOADER_DOT_STAGGER_MS = 54;
const LOADER_DOT_COUNT = 7;
const LOADER_ORBIT_RADIUS_PERCENT = 38.8889;
const LOADER_DOTS = Array.from({ length: LOADER_DOT_COUNT }, (_, index) => {
  const angle = -Math.PI / 2 + index * ((Math.PI * 2) / LOADER_DOT_COUNT);

  return {
    x: 50 + Math.cos(angle) * LOADER_ORBIT_RADIUS_PERCENT,
    y: 50 + Math.sin(angle) * LOADER_ORBIT_RADIUS_PERCENT,
  };
});
const INITIAL_CIRCLE_APPEAR_DURATION_MS = 400;
const INITIAL_CIRCLE_HOLD_MS = 1300;
const LOGO_BLOB_GROW_START_MS = INITIAL_CIRCLE_APPEAR_DURATION_MS + INITIAL_CIRCLE_HOLD_MS;
const LOGO_BLOB_GROW_DURATION_MS = 520;
const LOGO_DRAW_DELAY_MS = 140;
const LOGO_DRAW_START_MS = LOGO_BLOB_GROW_START_MS + LOGO_DRAW_DELAY_MS;
const LOGO_DRAW_DURATION_MS = 500;
const LOGO_HOLD_MS = 2000;
const LOGO_LEAVE_START_MS = LOGO_DRAW_START_MS + LOGO_DRAW_DURATION_MS + LOGO_HOLD_MS;
const LOGO_LEAVE_DURATION_MS = 440;
const INTRO_RETURN_DURATION_MS = 620;
const EXPAND_DELAY_MS = LOGO_LEAVE_START_MS + INTRO_RETURN_DURATION_MS + 100;
const EXPAND_DURATION_MS = 1100;
const SIDE_ARC_START_MS = EXPAND_DELAY_MS + EXPAND_DURATION_MS * 0.15;
const SIDE_ARC_DURATION_MS = 1120;
const SEND_DELAY_MS = EXPAND_DELAY_MS + EXPAND_DURATION_MS + 800;
const SEND_DURATION_MS = 920;
const TEXT_START_MS = EXPAND_DELAY_MS + 50;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// The surface is an SDF metaball union, rather than a DOM blur/filter. It keeps
// the prompt and send button as genuinely refractive WebGL shapes throughout the
// reverse-merge animation.
const FRAG = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec2 u_res;
uniform float u_intro_appear;
uniform float u_logo_grow;
uniform float u_logo_leave;
uniform float u_intro_offset_y;
uniform float u_intro_stretch;
uniform float u_expand;
uniform float u_side_arc;
uniform float u_separate;
uniform vec2 u_hover;
uniform float u_click;
uniform float u_press;
uniform float u_loading;

float smin(float a, float b, float k) {
  if (k <= 0.001) return min(a, b);
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdRoundBox(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
}

vec2 promptCenter() { return vec2(u_res.x * 0.478424, u_res.y * 0.5 - u_intro_offset_y); }
float promptScale() { return mix(0.72, 1.0, u_intro_appear); }
float logoBlobShape() { return u_logo_grow * (1.0 - u_logo_leave); }
float promptHalfHeight() {
  // Lift compresses the blob slightly sideways and stretches it vertically,
  // which lets the little spring read as soft liquid rather than a rigid move.
  float preludeHeight = mix(19.0, 30.0, logoBlobShape()) * (1.0 + u_intro_stretch);
  return mix(preludeHeight, 19.0, u_expand) / 426.0 * u_res.y * promptScale();
}
float promptRadius() {
  float preludeRadius = mix(19.0, 15.5, logoBlobShape()) * (1.0 + u_intro_stretch * 0.24);
  return mix(preludeRadius, 19.0, u_expand) / 426.0 * u_res.y * promptScale();
}
float promptWidth() {
  // The logo stage grows from the original circle into the Figma-style compact,
  // rounded square, then resolves back to the circle before prompt expansion.
  float preludeWidth = mix(38.0 / 1066.0, 60.0 / 1066.0, logoBlobShape()) * (1.0 - u_intro_stretch * 0.36);
  return mix(preludeWidth, 282.0 / 1066.0, u_expand) * u_res.x * promptScale();
}
vec2 sendCenter() {
  // The button is born from the completed prompt's right edge, never from its
  // first blob state. This makes the later separation read as a reverse merge.
  vec2 edge = promptCenter() + vec2(promptWidth() * 0.5, 0.0);
  vec2 final = vec2(u_res.x * 0.63227, u_res.y * 0.5) + u_hover;
  return mix(edge, final, u_separate);
}

float field(vec2 p) {
  float w = promptWidth();
  float r = promptRadius();
  float dPrompt = sdRoundBox(p - promptCenter(), vec2(w * 0.5, promptHalfHeight()), r);

  // No send-button geometry exists until the prompt is already complete and
  // the requested one-second hold has elapsed.
  if (u_separate <= 0.0001) return dPrompt;

  if (u_loading >= 0.999) return dPrompt;

  float pressedRadius = r * (1.0 - 0.10 * u_press) * (1.0 - u_loading);
  float dSend = length(p - sendCenter()) - pressedRadius;
  float mergeReach = mix(25.0 / 426.0 * u_res.y, 0.0, u_separate);
  return smin(dPrompt, dSend, mergeReach);
}

vec2 normalAt(vec2 p) {
  vec2 e = vec2(1.25, 0.0);
  return normalize(vec2(
    field(p + e.xy) - field(p - e.xy),
    field(p + e.yx) - field(p - e.yx)
  ) + 0.0001);
}

float nearestGridLine(float value, float a, float b, float c, float d, float e, float f, float g) {
  float distanceToLine = min(abs(value - a), abs(value - b));
  distanceToLine = min(distanceToLine, abs(value - c));
  distanceToLine = min(distanceToLine, abs(value - d));
  distanceToLine = min(distanceToLine, abs(value - e));
  distanceToLine = min(distanceToLine, abs(value - f));
  return min(distanceToLine, abs(value - g));
}

float gridInk(vec2 p) {
  // This is the same non-uniform line geometry as product-grid.svg. Rendering
  // it in WebGL gives the lens a source it can actually bend, instead of simply
  // tinting the straight DOM lines sitting beneath the canvas.
  vec2 q = vec2(p.x, u_res.y - p.y);
  float sx = u_res.x / 1066.0;
  float sy = u_res.y / 426.0;
  float dx = nearestGridLine(q.x, 0.0, 82.0 * sx, 161.0 * sx, 243.0 * sx, 322.0 * sx, 404.0 * sx, 486.0 * sx);
  dx = min(dx, nearestGridLine(q.x, 565.0 * sx, 647.0 * sx, 729.0 * sx, 808.0 * sx, 890.0 * sx, 969.0 * sx, 1066.0 * sx));
  float dy = nearestGridLine(q.y, 0.0, 71.0 * sy, 142.0 * sy, 213.0 * sy, 284.0 * sy, 355.0 * sy, 426.0 * sy);
  float vertical = 1.0 - smoothstep(0.45, 1.65, dx);
  float horizontal = 1.0 - smoothstep(0.45, 1.65, dy);
  return 0.11625 * max(vertical, horizontal);
}

vec3 gridGround(vec2 p) {
  vec2 q = vec2(p.x, u_res.y - p.y);
  float wash = 0.012 * sin(q.x * 0.021 + q.y * 0.014);
  return vec3(0.958 + wash) - vec3(gridInk(p));
}

float safeAsin(float value) {
  return asin(clamp(value, -1.0, 1.0));
}

float liquidGlassEdgeFactor(float depth, float thickness, float refractionFactor) {
  // Compact port of the optical edge calculation from Liquid Glass Studio.
  // Past the curved edge the glass is clear; near it Snell's law supplies the
  // vector and amount of background displacement.
  if (depth >= thickness) return 0.0;
  float edgeRatio = 1.0 - depth / thickness;
  float thetaIncident = safeAsin(edgeRatio * edgeRatio);
  float thetaTransmitted = safeAsin(sin(thetaIncident) / refractionFactor);
  return -tan(thetaTransmitted - thetaIncident);
}

vec3 getGridDispersion(vec2 p, vec2 offset, float dispersion) {
  // This is the referenced renderer's getTextureDispersion path, adapted to
  // the analytical Figma grid in place of its background texture. It creates
  // chromatic separation by reading each screen colour channel from a slightly
  // different refracted position—not by painting coloured contour lines.
  const float N_R = 1.0 - 0.02;
  const float N_G = 1.0;
  const float N_B = 1.0 + 0.02;
  float red = gridGround(p + offset * (1.0 - (N_R - 1.0) * dispersion)).r;
  float green = gridGround(p + offset * (1.0 - (N_G - 1.0) * dispersion)).g;
  float blue = gridGround(p + offset * (1.0 - (N_B - 1.0) * dispersion)).b;
  return vec3(red, green, blue);
}

// The same compact, refractive highlight used for both the send action and
// the prelude blob. The latter simply moves this source through its surface.
float containedShine(vec2 localPoint, float radius, float pulse) {
  float distanceFromSource = length(localPoint);
  return pulse * (1.0 - smoothstep(radius * 0.12, radius * 1.06, distanceFromSource));
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float d = field(p);
  if (d > 1.4) discard;

  vec2 n = normalAt(p);
  float radius = promptRadius();
  float halfHeight = promptHalfHeight();
  float rim = 1.0 - smoothstep(0.0, 3.4, abs(d));
  float pixelScale = u_res.y / 426.0;
  float edgeFactor = liquidGlassEdgeFactor(-d, 12.0 * pixelScale, 1.42);
  vec2 refractionOffset = -n * edgeFactor * 46.8 * pixelScale;
  vec3 col = getGridDispersion(p, refractionOffset, 3.055);

  // The glass has a real vertical fill above the refracted scene: nearly black
  // at its visual top edge and almost clear at its visual bottom edge. WebGL's
  // origin is bottom-left, so the interpolation is intentionally inverted.
  float topToBottom = clamp((promptCenter().y + halfHeight - p.y) / (halfHeight * 2.0), 0.0, 1.0);
  float fillOpacity = mix(0.95, 0.02, topToBottom);
  col = mix(col, vec3(0.0), fillOpacity);

  // A soft optical arc lives directly on the prompt's left rounded cap. It is
  // part of the same refractive surface (not a DOM border), and grows from its
  // vertical midpoint in both directions only after expansion has completed.
  vec2 promptLocal = p - promptCenter();
  vec2 leftCapCenter = vec2(-promptWidth() * 0.5 + radius, 0.0);
  float leftArcDistance = abs(length(promptLocal - leftCapCenter) - radius);
  float leftArcSide = 1.0 - smoothstep(-radius * 0.04, radius * 0.34, promptLocal.x - leftCapCenter.x);
  float leftArcCore = (1.0 - smoothstep(0.25, 1.6, leftArcDistance)) * leftArcSide;
  float leftArcBloom = (1.0 - smoothstep(1.0, 8.0, leftArcDistance)) * leftArcSide;
  float leftArcAura = (1.0 - smoothstep(3.0, 12.0, leftArcDistance)) * leftArcSide;
  float arcFront = radius * 1.24 * clamp(u_side_arc, 0.0, 1.0);
  float leftArcReveal = smoothstep(0.0, 1.75, arcFront - abs(promptLocal.y));
  float leftArcTipFade = 1.0 - smoothstep(radius * 0.72, radius * 1.08, abs(promptLocal.y));
  col += leftArcReveal * leftArcTipFade * (
    leftArcAura * vec3(0.012, 0.018, 0.026)
    + leftArcBloom * vec3(0.055, 0.075, 0.10)
    + leftArcCore * vec3(0.32, 0.40, 0.48)
  );

  // Keep the completed prompt calm and refractive. Its only specular event is
  // a short glint at the separating right edge — there is no looping shine.
  float separation = clamp(u_separate, 0.0, 1.0);
  float separationPulse = sin(separation * 3.14159265);
  vec2 separationEdge = promptCenter() + vec2(promptWidth() * 0.5, 0.0);
  float edgeDistance = length(p - separationEdge);
  float edgeFocus = 1.0 - smoothstep(radius * 0.45, radius * 2.25, edgeDistance);
  float glint = separationPulse * (edgeFocus * 0.82 + rim * 0.28);
  col += glint * vec3(0.42, 0.45, 0.49);

  // The logo surface has two single-pass light sweeps: bottom-to-top while it
  // grows into the rounded square, then top-to-bottom as the mark dissolves.
  vec2 introLocal = p - promptCenter();
  float growProgress = clamp(u_logo_grow, 0.0, 1.0);
  float leaveProgress = clamp(u_logo_leave, 0.0, 1.0);
  float growSweepY = mix(-halfHeight - 8.0, halfHeight + 8.0, growProgress);
  float leaveSweepY = mix(halfHeight + 8.0, -halfHeight - 8.0, leaveProgress);
  float growSweep = containedShine(
    introLocal - vec2(0.0, growSweepY), radius * 2.7, sin(growProgress * 3.14159265)
  );
  float leaveSweep = containedShine(
    introLocal - vec2(0.0, leaveSweepY), radius * 2.7, sin(leaveProgress * 3.14159265)
  );
  col += (growSweep + leaveSweep) * vec3(0.72, 0.77, 0.86);

  // A click releases a contained highlight within the send blob. It is driven
  // by the same WebGL surface, so the shine follows the refractive geometry.
  float clickShine = containedShine(p - sendCenter(), radius, u_click);
  col += clickShine * vec3(0.72, 0.77, 0.86);

  // Opaque interior prevents straight DOM grid lines from bleeding through;
  // only the displaced WebGL reconstruction is visible inside the lens.
  float alpha = 1.0 - smoothstep(-0.25, 1.4, d);
  outColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smootherstep = (value: number) => {
  const progress = clamp01(value);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
};
const settle = (value: number) => {
  const progress = clamp01(value);
  const overshoot = 0.9;
  const overshootPlusOne = overshoot + 1;
  const bounce = 1 + overshootPlusOne * (progress - 1) ** 3 + overshoot * (progress - 1) ** 2;
  const wobble = Math.sin(progress * Math.PI * 4) * 0.028 * progress * (1 - progress);
  return bounce + wobble;
};

const introReturnOffset = (elapsed: number) => {
  const progress = clamp01((elapsed - LOGO_LEAVE_START_MS) / INTRO_RETURN_DURATION_MS);
  const envelope = Math.sin(progress * Math.PI);
  const travel = envelope * 9.2;
  const wobble = Math.sin(progress * Math.PI * 4.5) * 0.78 * envelope;
  return travel + wobble;
};

const introGrowOffset = (elapsed: number) => {
  const progress = clamp01((elapsed - LOGO_BLOB_GROW_START_MS) / LOGO_BLOB_GROW_DURATION_MS);
  const envelope = Math.sin(progress * Math.PI);
  const lift = -envelope * 8.2;
  const wobble = Math.sin(progress * Math.PI * 4.5) * 0.72 * envelope;
  return lift + wobble;
};

const introStretch = (elapsed: number) => {
  const grow = clamp01((elapsed - LOGO_BLOB_GROW_START_MS) / LOGO_BLOB_GROW_DURATION_MS);
  const leave = clamp01((elapsed - LOGO_LEAVE_START_MS) / INTRO_RETURN_DURATION_MS);
  const spring = (progress: number, strength: number) => {
    const envelope = Math.sin(progress * Math.PI);
    return envelope * (strength + Math.sin(progress * Math.PI * 4.5) * strength * 0.12);
  };
  return spring(grow, 0.06) + spring(leave, 0.05);
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[flash-product] prompt shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function FlashIntroGlyph({ drawDelayMs }: { drawDelayMs: number }) {
  // Uses the exact Flash mark paths from the exported Figma wordmark, separated
  // here so the filled brand shape can be drawn before it resolves to white.
  return (
    <svg
      className="product-prompt__flash-intro"
      viewBox="0 0 33.0772 29.162"
      style={{ "--flash-logo-draw-delay": `${drawDelayMs}ms` } as CSSProperties}
      aria-hidden
    >
      <path pathLength="1" d="M10.9593 28.8344H0L10.9593 9.79036C15.3908 2.0879 18.539 0.268363 33.0227 0.268356V9.79036C25.0567 9.79036 20.9641 11.5311 18.539 15.7362L10.9593 28.8344Z" />
      <path pathLength="1" d="M21.9155 28.8344L16.4853 19.384H33.0772V28.8344H21.9155Z" />
    </svg>
  );
}

function PromptLoader() {
  return (
    <span className="product-prompt__loader" aria-hidden="true">
      <span className="product-prompt__loader-orbit">
        {LOADER_DOTS.map((dot, index) => (
          <span
            className="product-prompt__loader-dot"
            key={index}
            style={{
              "--loader-x": `${dot.x}%`,
              "--loader-y": `${dot.y}%`,
              "--loader-delay": `${LOADER_APPEAR_DELAY_MS + index * LOADER_DOT_STAGGER_MS}ms`,
            } as CSSProperties}
          />
        ))}
      </span>
    </span>
  );
}

export default function ProductPromptGlass() {
  const rootRef = useRef<HTMLFormElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(performance.now());
  const sendHoverRef = useRef({ x: 0, y: 0 });
  const sendHoverTargetRef = useRef({ x: 0, y: 0 });
  const sendClickRef = useRef(0);
  const loadingStartRef = useRef(0);
  const textEditableRef = useRef(false);
  const [typedText, setTypedText] = useState("");
  const [textEditable, setTextEditable] = useState(false);
  const [sendReady, setSendReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  // The words finish shortly before the glass reaches its final width. Values go
  // directly onto the DOM node so the 60fps glass timeline never re-renders React.
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion) {
      root.style.setProperty("--intro-appear", "1");
      root.style.setProperty("--logo-grow", "0");
      root.style.setProperty("--logo-leave", "1");
      root.style.setProperty("--logo-opacity", "0");
      root.style.setProperty("--logo-scale", "1");
      root.style.setProperty("--logo-offset-y", "0px");
      root.style.setProperty("--logo-stretch-x", "1");
      root.style.setProperty("--logo-stretch-y", "1");
      root.style.setProperty("--prompt-expand", "1");
      root.style.setProperty("--send-separate", "1");
      root.style.setProperty("--text-in", "1");
      setTypedText(PROMPT);
      textEditableRef.current = true;
      setTextEditable(true);
      setSendReady(true);
      return;
    }

    startRef.current = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const introAppear = settle(elapsed / INITIAL_CIRCLE_APPEAR_DURATION_MS);
      const logoGrow = settle((elapsed - LOGO_BLOB_GROW_START_MS) / LOGO_BLOB_GROW_DURATION_MS);
      const logoLeave = settle((elapsed - LOGO_LEAVE_START_MS) / LOGO_LEAVE_DURATION_MS);
      const logoEnter = clamp01((elapsed - LOGO_DRAW_START_MS) / 170);
      const logoOpacity = logoEnter * clamp01(1 - logoLeave);
      const logoOffsetY = introGrowOffset(elapsed) + introReturnOffset(elapsed);
      const blobStretch = introStretch(elapsed);
      const expand = settle((elapsed - EXPAND_DELAY_MS) / EXPAND_DURATION_MS);
      // The send control stays fused and invisible through a short completed-
      // prompt hold, then peels away as a reverse metaball merge.
      const separate = settle((elapsed - SEND_DELAY_MS) / SEND_DURATION_MS);
      const textIn = clamp01((elapsed - TEXT_START_MS) / 720);
      root.style.setProperty("--intro-appear", introAppear.toFixed(4));
      root.style.setProperty("--logo-grow", logoGrow.toFixed(4));
      root.style.setProperty("--logo-leave", logoLeave.toFixed(4));
      root.style.setProperty("--logo-opacity", logoOpacity.toFixed(4));
      root.style.setProperty("--logo-scale", (0.86 + logoEnter * 0.14 - clamp01(logoLeave) * 0.12).toFixed(4));
      root.style.setProperty("--logo-offset-y", `${logoOffsetY.toFixed(3)}px`);
      root.style.setProperty("--logo-stretch-x", (1 - blobStretch * 0.36).toFixed(4));
      root.style.setProperty("--logo-stretch-y", (1 + blobStretch).toFixed(4));
      root.style.setProperty("--prompt-expand", expand.toFixed(4));
      root.style.setProperty("--send-separate", separate.toFixed(4));
      root.style.setProperty("--text-in", textIn.toFixed(4));
      if (!textEditableRef.current) {
        const count = Math.floor(PROMPT.length * textIn);
        if (textIn >= 1) {
          setTypedText(PROMPT);
          textEditableRef.current = true;
          setTextEditable(true);
        } else {
          setTypedText((current) => (current.length === count ? current : PROMPT.slice(0, count)));
        }
      }
      if (elapsed >= SEND_DELAY_MS) setSendReady(true);
      if (elapsed < SEND_DELAY_MS + SEND_DURATION_MS + 100) frame = requestAnimationFrame(animate);
      else {
        root.style.setProperty("--prompt-expand", "1");
        root.style.setProperty("--send-separate", "1");
        root.style.setProperty("--text-in", "1");
        if (!textEditableRef.current) setTypedText(PROMPT);
        setSendReady(true);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      setWebglUnavailable(true);
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERT);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      setWebglUnavailable(true);
      vertex && gl.deleteShader(vertex);
      fragment && gl.deleteShader(fragment);
      program && gl.deleteProgram(program);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[flash-product] prompt program error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      setWebglUnavailable(true);
      return;
    }

    const uRes = gl.getUniformLocation(program, "u_res");
    const uIntroAppear = gl.getUniformLocation(program, "u_intro_appear");
    const uLogoGrow = gl.getUniformLocation(program, "u_logo_grow");
    const uLogoLeave = gl.getUniformLocation(program, "u_logo_leave");
    const uIntroOffsetY = gl.getUniformLocation(program, "u_intro_offset_y");
    const uIntroStretch = gl.getUniformLocation(program, "u_intro_stretch");
    const uExpand = gl.getUniformLocation(program, "u_expand");
    const uSideArc = gl.getUniformLocation(program, "u_side_arc");
    const uSeparate = gl.getUniformLocation(program, "u_separate");
    const uHover = gl.getUniformLocation(program, "u_hover");
    const uClick = gl.getUniformLocation(program, "u_click");
    const uPress = gl.getUniformLocation(program, "u_press");
    const uLoading = gl.getUniformLocation(program, "u_loading");
    const parent = canvas.parentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    const resize = () => {
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };
    const observer = new ResizeObserver(resize);
    parent && observer.observe(parent);
    resize();

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    let frame = 0;
    const render = (now: number) => {
      const elapsed = now - startRef.current;
      const introAppear = settle(elapsed / INITIAL_CIRCLE_APPEAR_DURATION_MS);
      const logoGrow = settle((elapsed - LOGO_BLOB_GROW_START_MS) / LOGO_BLOB_GROW_DURATION_MS);
      const logoLeave = settle((elapsed - LOGO_LEAVE_START_MS) / LOGO_LEAVE_DURATION_MS);
      const logoOffsetY = introGrowOffset(elapsed) + introReturnOffset(elapsed);
      const blobStretch = introStretch(elapsed);
      const expand = settle((elapsed - EXPAND_DELAY_MS) / EXPAND_DURATION_MS);
      const sideArc = smootherstep((elapsed - SIDE_ARC_START_MS) / SIDE_ARC_DURATION_MS);
      const separate = settle((elapsed - SEND_DELAY_MS) / SEND_DURATION_MS);
      const clickProgress = sendClickRef.current ? (now - sendClickRef.current) / 620 : 1;
      const clickPulse = clickProgress < 1 ? Math.sin(clickProgress * Math.PI) : 0;
      const loadingProgress = loadingStartRef.current
        ? (reducedMotion ? 1 : smootherstep((now - loadingStartRef.current) / 360))
        : 0;
      const hover = sendHoverRef.current;
      const hoverTarget = sendHoverTargetRef.current;
      hover.x += (hoverTarget.x - hover.x) * 0.14;
      hover.y += (hoverTarget.y - hover.y) * 0.14;
      const root = rootRef.current;
      root?.style.setProperty("--send-hover-x", `${hover.x.toFixed(2)}px`);
      root?.style.setProperty("--send-hover-y", `${hover.y.toFixed(2)}px`);
      root?.style.setProperty("--send-press-scale", (1 - clickPulse * 0.10).toFixed(4));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uIntroAppear, introAppear);
      gl.uniform1f(uLogoGrow, logoGrow);
      gl.uniform1f(uLogoLeave, logoLeave);
      gl.uniform1f(uIntroOffsetY, logoOffsetY * dpr);
      gl.uniform1f(uIntroStretch, blobStretch);
      gl.uniform1f(uExpand, expand);
      gl.uniform1f(uSideArc, sideArc);
      gl.uniform1f(uSeparate, separate);
      gl.uniform2f(uHover, hover.x * dpr, -hover.y * dpr);
      gl.uniform1f(uClick, clickPulse);
      gl.uniform1f(uPress, clickPulse);
      gl.uniform1f(uLoading, loadingProgress);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      gl.deleteProgram(program);
    };
  }, []);

  const updateSendHover = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    sendHoverTargetRef.current = { x: x * 2.2, y: y * 2.2 };
  };

  const resetSendHover = () => {
    sendHoverTargetRef.current = { x: 0, y: 0 };
  };

  const shineSend = () => {
    const now = performance.now();
    sendClickRef.current = now;
    loadingStartRef.current = now;
    sendHoverTargetRef.current = { x: 0, y: 0 };
    setLoading(true);
  };

  return (
    <form
      className="product-prompt"
      ref={rootRef}
      onSubmit={(event) => event.preventDefault()}
      data-loading={loading || undefined}
      aria-busy={loading}
      aria-label="Ask Flash a research question"
    >
      <canvas className="product-prompt__glass" ref={canvasRef} aria-hidden />
      {webglUnavailable && <span className="product-prompt__fallback" aria-hidden />}
      <FlashIntroGlyph drawDelayMs={LOGO_DRAW_START_MS} />
      <label className="sr-only" htmlFor="flash-product-question">Ask Flash</label>
      <span className="product-prompt__input-clip">
        <input
          id="flash-product-question"
          className="product-prompt__input"
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
          readOnly={!textEditable || loading}
          spellCheck={false}
        />
      </span>
      <button
        className="product-prompt__send"
        type="submit"
        aria-label="Send question"
        data-ready={sendReady || undefined}
        disabled={loading}
        onPointerMove={updateSendHover}
        onPointerLeave={resetSendHover}
        onClick={shineSend}
      >
        <img src="/images/figma-product/send-arrow.svg" alt="" />
        <PromptLoader />
      </button>
    </form>
  );
}
