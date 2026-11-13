/* Opening sequence ("boot") for the home page.
 *
 * A small inline script in index.html decides whether to play it (first visit
 * of the browser session, motion allowed, or `?boot` in the address) and adds
 * `html.booting`. This file builds the overlay and plays a ~9.5 s timeline on
 * a fixed 30 fps frame clock: every state is a pure function of the frame
 * number, so each cut and impact lands on the same frame every time.
 *
 * Six beats, one thing on screen at a time. Nothing flashes: no strobing, no
 * negative frames, no white-out.
 *   1  ignition   a spark, then a hairline across the dark
 *   2  aperture   the dome slit opens onto the star field
 *   3  forge      four faceted blades tumble in and dock into a solid star
 *   4  alignment  a gyroscope of arcs tumbles around it, spins down into one
 *                 plane, tips back and collapses
 *   5  name       the extruded ASTER wordmark is struck stroke by stroke
 *   6  launch     the camera flies through the name; everything dissolves
 *
 * The star and the gyroscope are real solids: projected, lit and depth-sorted
 * here on a 2D canvas (no WebGL, no dependency on the scene bundle).
 *
 * It ends on the loader veil's exact background; site.js then calls
 * `asterBoot.handoff()` once the scene has put its own veil up, and the
 * overlay simply disappears, letting the veil open onto the site.
 *
 * Any click, key, wheel or touch jumps straight to the launch.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('booting')) { window.asterBoot = null; return; }
  try { sessionStorage.setItem('aster-boot', 'seen'); } catch {}

  const FPS = 30;
  // Beat boundaries, in frames.
  const OPEN = 22;           // shutters start to part
  const FORGE = 80;          // the last blade docks; the star is whole
  const ALIGN = 96;          // the star shrinks into the gyroscope
  const LOCK = 146;          // every arc lies in one plane
  const NAME = 160;          // the arcs have collapsed; the wordmark starts
  const EXIT = 245;          // launch (skip jumps here)
  const END = 284;           // everything has dissolved into the veil's background
  const TAU = Math.PI * 2;

  // ---- small helpers ------------------------------------------------------
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ramp = (f, a, b) => clamp01((f - a) / (b - a));
  const lerp = (a, b, u) => a + (b - a) * u;
  const outCubic = u => 1 - Math.pow(1 - u, 3);
  const outQuart = u => 1 - Math.pow(1 - u, 4);
  const outExpo = u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u);
  const inCubic = u => u * u * u;
  const inExpo = u => u <= 0 ? 0 : Math.pow(2, 10 * u - 10);
  const inOut = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const inOutExpo = u => u <= 0 ? 0 : u >= 1 ? 1 : u < .5 ? Math.pow(2, 20 * u - 10) / 2 : (2 - Math.pow(2, -20 * u + 10)) / 2;
  const outBack = u => 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2);
  const n2 = v => v.toFixed(2);
  // A small deterministic generator, so the star field is the same every time.
  const random = (seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let v = Math.imul(seed ^ seed >>> 15, 1 | seed); v = v + Math.imul(v ^ v >>> 7, 61 | v) ^ v; return ((v ^ v >>> 14) >>> 0) / 4294967296; })(1836);

  // ---- content ------------------------------------------------------------
  const PAPER = '#e7e7de', CELADON = '#a8c7be', GOLD = '#c7ae7c';
  const MARK = 'M16 2c0 10-4 14-14 14 10 0 14 4 14 14 0-10 4-14 14-14C20 16 16 12 16 2Z';

  // The star as a solid. Tips in order round the outline (screen axes: x right, y down, z towards the viewer).
  const TIPS = [[0, -1], [-1, 0], [0, 1], [1, 0]];
  const LAND = [62, 80, 74, 68];        // the frame each tip's blade docks on: top, right, bottom, left
  const STAR_R = .3325;                 // the star's tip radius, as a share of the stage
  const APEX = .21;                     // how far the centre stands proud of the outline, front and back
  const CAMERA = 5;                     // viewer distance, in star radii
  const LIGHT = (v => { const m = Math.hypot(...v); return v.map(c => c / m); })([-.5, -.62, .6]);
  const SHADE_DARK = [30, 49, 56], SHADE_LIGHT = [246, 244, 233];
  const FACETS = [];
  {
    const HALF = 6, K = 4 / 14;         // the outline's Bezier handles sit 4/14 of the way out
    for (let c = 0; c < 4; c++) {
      const a = TIPS[c], b = TIPS[(c + 1) % 4], curve = [];
      for (let i = 0; i <= HALF * 2; i++) {
        const u = i / (HALF * 2), v = 1 - u, w0 = v * v * v + 3 * v * v * u * K, w1 = u * u * u + 3 * v * u * u * K;
        curve.push([a[0] * w0 + b[0] * w1, a[1] * w0 + b[1] * w1, 0]);
      }
      for (const side of [1, -1]) {
        const apex = [0, 0, side * APEX];
        [[c, curve.slice(0, HALF + 1)], [(c + 1) % 4, curve.slice(HALF)]].forEach(([tip, edge]) => {
          const p = edge[0], r = edge[edge.length - 1];
          const u = [p[0] - apex[0], p[1] - apex[1], p[2] - apex[2]], v = [r[0] - apex[0], r[1] - apex[1], r[2] - apex[2]];
          let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
          const m = Math.hypot(...n) * (Math.sign(n[2]) === side ? 1 : -1);
          FACETS.push({ tip, points: [apex, ...edge], normal: n.map(x => x / m) });
        });
      }
    }
  }
  // Gyroscope arcs: radius (stage units of 800), stroke px, span, in-plane turns, tumble about x and y, colour, lock side.
  const RINGS = [
    { r: 352, w: 2, span: TAU * .82, turns: 1.4, ax: .9, ay: .35, color: CELADON, side: 0 },
    { r: 300, w: 18, span: TAU * .3, turns: -2.2, ax: -.6, ay: 1.1, color: CELADON, side: 1 },
    { r: 248, w: 2, span: TAU, turns: .6, ax: .4, ay: -.8, color: GOLD, side: 0, dashed: true },
    { r: 200, w: 10, span: TAU * .56, turns: 2.8, ax: -1.2, ay: -.5, color: PAPER, side: 0 },
    { r: 150, w: 2, span: TAU * .88, turns: -1.8, ax: .7, ay: 1.4, color: CELADON, side: 1 },
    { r: 104, w: 14, span: TAU * .2, turns: 3.6, ax: 1.5, ay: -.9, color: GOLD, side: 1 },
  ];
  const SATELLITES = [{ ring: 2, at: 0, turns: 1.9, size: 9, color: GOLD }, { ring: 4, at: Math.PI, turns: -2.6, size: 7, color: PAPER }];
  // The wordmark, built from heavy strokes on a 445 x 100 grid. [x offset, strokes]
  const LETTERS = [
    [0, ['M6 112L40 25L74 112']],
    [106, ['M50 29A21 21 0 1 0 29 50A21 21 0 1 1 8 71']],
    [190, ['M0 8H72', 'M36 0V100']],
    [288, ['M0 8H60', 'M0 50H50', 'M0 92H60']],
    [374, ['M8 100V0', 'M0 8H42A21 21 0 0 1 42 50H8', 'M34 50L62 112']],
  ];
  const WORD_W = 445, WORD_H = 100;
  const A_STAR = [40, 73, 30];          // the star standing in the A: centre x, y, size
  const LAYERS = 8;                     // slices that give the wordmark its thickness
  const DEPTH_NEAR = [143, 176, 168], DEPTH_FAR = [36, 60, 64];

  // ---- build --------------------------------------------------------------
  const strokes = [];
  LETTERS.forEach(([x, list], li) => list.forEach((d, si) => strokes.push({ x, d, start: NAME + 2 + li * 4 + si * 3 })));
  const slice = layer => {
    const u = (layer - 1) / (LAYERS - 2), color = layer ? `rgb(${DEPTH_NEAR.map((c, i) => Math.round(lerp(c, DEPTH_FAR[i], u))).join(',')})` : PAPER;
    return `<svg class="boot-wordmark${layer ? ' boot-depth' : ''}" style="--layer:${layer}" viewBox="0 0 ${WORD_W} ${WORD_H}" fill="none">
      <defs><clipPath id="boot-word-clip-${layer}"><rect width="${WORD_W}" height="${WORD_H}"/></clipPath></defs>
      <g clip-path="url(#boot-word-clip-${layer})" stroke="${color}" stroke-width="16" stroke-linejoin="miter">
        ${strokes.map(s => `<path class="boot-stroke" transform="translate(${s.x} 0)" d="${s.d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" opacity="0"/>`).join('')}
      </g>
      ${layer ? '' : `<g class="boot-a-star"><path d="${MARK}" fill="${GOLD}" transform="scale(${n2(A_STAR[2] / 28)}) translate(-16 -16)"/></g>`}
    </svg>`;
  };
  const overlay = document.createElement('div');
  overlay.className = 'boot';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <canvas class="boot-stars"></canvas>
    <div class="boot-content">
      <i class="boot-spike boot-spike-x"></i><i class="boot-spike boot-spike-y"></i>
      <canvas class="boot-solid"></canvas>
      <i class="boot-shock"></i>
      <div class="boot-title">
        <div class="boot-plate">
          <div class="boot-word">${Array.from({ length: LAYERS }, (_, i) => slice(LAYERS - 1 - i)).join('')}</div>
          <div class="boot-bar" lang="en"><span>A quiet kind of infinity.</span></div>
          <div class="boot-zh">在无垠处，继续好奇。</div>
        </div>
      </div>
    </div>
    <i class="boot-shutter boot-shutter-top"></i><i class="boot-shutter boot-shutter-bottom"></i>
    <i class="boot-ignite"></i><i class="boot-spark"></i>
    <div class="boot-skip">SKIP <b>⟶</b></div>`;
  document.body.appendChild(overlay);

  const q = s => overlay.querySelector(s);
  const qa = s => [...overlay.querySelectorAll(s)];
  const el = {
    stars: q('.boot-stars'), solid: q('.boot-solid'), content: q('.boot-content'), spikeX: q('.boot-spike-x'), spikeY: q('.boot-spike-y'),
    shock: q('.boot-shock'), title: q('.boot-title'), plate: q('.boot-plate'), strokes: qa('.boot-stroke'), aStar: q('.boot-a-star'),
    bar: q('.boot-bar'), zh: q('.boot-zh'),
    shutTop: q('.boot-shutter-top'), shutBottom: q('.boot-shutter-bottom'), ignite: q('.boot-ignite'), spark: q('.boot-spark'), skip: q('.boot-skip'),
  };

  // ---- canvases -------------------------------------------------------------
  const sky = el.stars.getContext('2d'), g = el.solid.getContext('2d');
  const STARS = Array.from({ length: 340 }, () => {
    const tint = random();
    return { x: random() * 2 - 1, y: random() * 2 - 1, z: random(), size: .5 + random() * 1.3, color: tint > .9 ? GOLD : tint > .7 ? CELADON : PAPER };
  });
  let width = 0, height = 0, dpr = 1, stage = 600;
  function resize() {
    width = innerWidth; height = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    stage = width <= 760 ? Math.min(width * .92, height * .66) : Math.min(Math.min(width, height) * .78, 760);
    for (const canvas of [el.stars, el.solid]) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  function drawStars(F) {
    sky.setTransform(dpr, 0, 0, dpr, 0, 0);
    sky.clearRect(0, 0, width, height);
    const alpha = ramp(F, OPEN, OPEN + 16) * (1 - ramp(F, EXIT + 22, END - 2));
    if (alpha <= 0) return;
    const warp = ramp(F, EXIT - 9, END);
    const travel = F * .0005 + 1.5 * inCubic(warp);
    const streak = .002 + .42 * warp * warp;
    const cx = width / 2, cy = height / 2, reach = Math.max(width, height) * .5;
    sky.lineCap = 'round';
    for (const star of STARS) {
      let z = (star.z - travel) % 1; if (z < 0) z += 1;
      const near = .06 + z * .94, far = .06 + Math.min(1, z + streak) * .94;
      const x0 = cx + star.x / near * reach * .6, y0 = cy + star.y / near * reach * .6;
      if (x0 < -40 || x0 > width + 40 || y0 < -40 || y0 > height + 40) continue;
      const x1 = cx + star.x / far * reach * .6, y1 = cy + star.y / far * reach * .6;
      sky.globalAlpha = alpha * Math.min(1, (1 - z) * 3) * (.35 + .65 * (1 - z));
      sky.strokeStyle = star.color;
      sky.lineWidth = star.size * (.6 + (1 - z) * 1.1);
      sky.beginPath(); sky.moveTo(x1, y1); sky.lineTo(x0 + .01, y0 + .01); sky.stroke();
    }
    sky.globalAlpha = 1;
  }

  // Rotations of a point [x, y, z], in place.
  const turnX = (p, c, s) => { const y = p[1] * c - p[2] * s; p[2] = p[1] * s + p[2] * c; p[1] = y; };
  const turnY = (p, c, s) => { const x = p[0] * c + p[2] * s; p[2] = -p[0] * s + p[2] * c; p[0] = x; };

  // The solid star and the gyroscope, projected, lit and depth-sorted.
  function drawSolid(F) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, width, height);
    if (F < LAND[0] - 14 || F >= NAME) return;
    const unit = stage * STAR_R, cx = width / 2, cy = height / 2;
    const project = p => { const s = CAMERA / (CAMERA - p[2]); return [cx + p[0] * s * unit, cy + p[1] * s * unit]; };

    // the camera work: a tilted approach, one full turn once whole, then a steady spin as the core
    const whole = inOut(ramp(F, FORGE, FORGE + 32));
    // the gyroscope is always seen at an angle, drifting round; it tips right back as it collapses
    const tip = lerp(.62, 1.38, inOut(ramp(F, LOCK + 3, NAME))), yaw = -.5 + (F - ALIGN) * .011;
    const collapse = inExpo(ramp(F, LOCK + 4, NAME));
    const shrink = inOut(ramp(F, ALIGN, ALIGN + 18));
    const ry = F < FORGE + 32 ? lerp(-.62, TAU, whole) : (F - FORGE - 32) * .075;
    const rx = .42 * (1 - whole) + .34 * ramp(F, ALIGN + 16, ALIGN + 30) + (tip - .62);
    const scale = (1 - .04 * ramp(F, FORGE, ALIGN)) * (1 - shrink * .78) * (1 - collapse);
    const cy_ = Math.cos(ry), sy_ = Math.sin(ry), cx_ = Math.cos(rx), sx_ = Math.sin(rx);

    // gyroscope arcs, split into the part behind the star and the part in front
    const spin = Math.pow(1 - ramp(F, ALIGN + 4, LOCK), 2.2);
    const ct = Math.cos(tip), st = Math.sin(tip), cw = Math.cos(yaw), sw = Math.sin(yaw);
    const ringPoint = (ring, angle) => {
      const r = ring.r / 800 / STAR_R * (1 - collapse), p = [r * Math.cos(angle), r * Math.sin(angle), 0];
      const ax = ring.ax * TAU * spin, ay = ring.ay * TAU * spin;
      turnX(p, Math.cos(ax), Math.sin(ax)); turnY(p, Math.cos(ay), Math.sin(ay)); turnY(p, cw, sw); turnX(p, ct, st);
      return p;
    };
    const drawRings = front => {
      if (F < ALIGN + 4) return;
      g.lineCap = 'butt'; g.lineJoin = 'round';
      RINGS.forEach((ring, i) => {
        const sweep = outCubic(ramp(F, ALIGN + 4 + i * 3, ALIGN + 24 + i * 3)) * ring.span;
        if (sweep <= 1e-3) return;
        const start = (ring.side ? Math.PI / 2 : -Math.PI / 2) + ring.turns * TAU * spin - sweep / 2;
        const steps = ring.dashed ? 180 : Math.max(10, Math.ceil(sweep / TAU * 140));
        g.beginPath();
        let previous = ringPoint(ring, start), pen = false;
        for (let k = 1; k <= steps; k++) {
          const point = ringPoint(ring, start + sweep * k / steps);
          const visible = (previous[2] + point[2] >= -1e-6) === front && !(ring.dashed && k % 3 !== 0);
          if (visible) { if (!pen) { const a = project(previous); g.moveTo(a[0], a[1]); } const b = project(point); g.lineTo(b[0], b[1]); }
          pen = visible; previous = point;
        }
        g.globalAlpha = front ? 1 : .38;
        g.strokeStyle = F >= LOCK ? PAPER : ring.color;
        g.lineWidth = Math.max(1, ring.w * stage / 760);
        g.stroke();
      });
      const shown = ramp(F, ALIGN + 10, ALIGN + 18);
      if (shown > 0) for (const moon of SATELLITES) {
        const p = ringPoint(RINGS[moon.ring], moon.at + moon.turns * TAU * spin);
        if ((p[2] >= -1e-6) !== front) continue;
        const at = project(p);
        g.globalAlpha = shown * (front ? 1 : .45); g.fillStyle = moon.color;
        g.beginPath(); g.arc(at[0], at[1], moon.size * stage / 760 * CAMERA / (CAMERA - p[2]) * (1 - collapse), 0, TAU); g.fill();
      }
      g.globalAlpha = 1;
    };

    drawRings(false);

    // the star: each blade tumbles about its own axis as it flies in, then the solid turns as one
    const drawn = [];
    for (const facet of FACETS) {
      const land = LAND[facet.tip], axis = TIPS[facet.tip];
      const flight = ramp(F, land - 14, land), away = (1 - inCubic(flight)) * 5.2, tumble = (1 - outCubic(flight)) * TAU * 1.25;
      const alpha = F >= FORGE ? 1 : ramp(F, land - 14, land - 9);
      if (alpha <= 0) continue;
      const ctb = Math.cos(tumble), stb = Math.sin(tumble);
      const place = (v, moved) => {
        const p = [v[0], v[1], v[2]];
        if (tumble) { if (axis[0]) turnX(p, ctb, stb); else turnY(p, ctb, stb); }
        if (moved) { p[0] = (p[0] + axis[0] * away) * scale; p[1] = (p[1] + axis[1] * away) * scale; p[2] *= scale; }
        turnY(p, cy_, sy_); turnX(p, cx_, sx_);
        return p;
      };
      const normal = place(facet.normal, false);
      if (normal[2] <= 0) continue;                                    // facing away
      const points = facet.points.map(v => place(v, true));
      const lit = .2 + .8 * Math.max(0, normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
      drawn.push({ points, alpha, depth: points.reduce((sum, p) => sum + p[2], 0) / points.length, color: `rgb(${SHADE_DARK.map((c, i) => Math.round(lerp(c, SHADE_LIGHT[i], lit))).join(',')})` });
    }
    drawn.sort((a, b) => a.depth - b.depth);
    g.lineJoin = 'round'; g.lineWidth = .8;
    for (const facet of drawn) {
      g.beginPath();
      facet.points.forEach((p, i) => { const at = project(p); if (i) g.lineTo(at[0], at[1]); else g.moveTo(at[0], at[1]); });
      g.closePath();
      g.globalAlpha = facet.alpha; g.fillStyle = g.strokeStyle = facet.color;
      g.fill(); g.stroke();
    }
    g.globalAlpha = 1;

    drawRings(true);
  }

  // ---- frame ----------------------------------------------------------------
  const set = (node, key, value) => { if (node['_' + key] !== value) { node['_' + key] = value; node.style[key] = value; } };
  const attr = (node, key, value) => { if (node['$' + key] !== value) { node['$' + key] = value; node.setAttribute(key, value); } };

  function frame(t) {
    const F = t * FPS, f = Math.floor(F);
    const diag = Math.hypot(width, height);

    // 1 · ignition: a spark, then a hairline thrown to both edges
    set(el.spark, 'opacity', F < 1 ? '0' : String(1 - ramp(F, OPEN, OPEN + 6)));
    set(el.spark, 'transform', `translate(-50%,-50%) scale(${Math.max(0, outBack(ramp(F, 1, 8))).toFixed(3)})`);
    set(el.ignite, 'opacity', F < 6 ? '0' : String(1 - ramp(F, OPEN + 4, OPEN + 12)));
    set(el.ignite, 'transform', `scaleX(${outExpo(ramp(F, 6, OPEN)).toFixed(4)})`);

    // 2 · aperture: the shutters part, their lit edges riding with them
    const open = inOutExpo(ramp(F, OPEN, OPEN + 26));
    set(el.shutTop, 'transform', `translateY(${(-open * 102).toFixed(2)}%)`);
    set(el.shutBottom, 'transform', `translateY(${(open * 102).toFixed(2)}%)`);
    const edge = String(ramp(F, OPEN - 1, OPEN + 1) * (1 - ramp(F, OPEN + 18, OPEN + 26)));
    set(el.shutTop, 'opacity', F >= OPEN + 26 ? '0' : '1'); set(el.shutBottom, 'opacity', F >= OPEN + 26 ? '0' : '1');
    if (overlay._edge !== edge) { overlay._edge = edge; overlay.style.setProperty('--edge', edge); }
    drawStars(F);

    // 3–4 · the solid star and its gyroscope
    drawSolid(F);
    // each docking nudges the frame along the blade's line of travel
    let shakeX = 0, shakeY = 0;
    TIPS.forEach((axis, i) => {
      const k = f - LAND[i];
      if (k >= 0 && k < 3) { const kick = [9, -5, 2][k] * (LAND[i] === FORGE ? 1.8 : 1); shakeX -= axis[0] * kick; shakeY -= axis[1] * kick; }
    });
    // the strike: diffraction spikes drawn out across the whole screen, then let go
    const spike = F < FORGE ? 0 : outExpo(ramp(F, FORGE, FORGE + 16));
    const spikeOpacity = F < FORGE ? '0' : String(ramp(F, FORGE, FORGE + 5) * (1 - ramp(F, FORGE + 12, FORGE + 34)) * .8);
    set(el.spikeX, 'transform', `scaleX(${spike.toFixed(4)})`); set(el.spikeX, 'opacity', spikeOpacity);
    set(el.spikeY, 'transform', `scaleY(${spike.toFixed(4)})`); set(el.spikeY, 'opacity', spikeOpacity);
    const punch = (F >= FORGE ? .04 * (1 - outCubic(ramp(F, FORGE, FORGE + 14))) : 0) + (F >= NAME ? .05 * (1 - outCubic(ramp(F, NAME, NAME + 16))) : 0);
    set(el.content, 'transform', `translate(${shakeX.toFixed(1)}px,${shakeY.toFixed(1)}px) scale(${(1 + punch).toFixed(4)})`);

    // 5 · name: a shock ring, then the wordmark struck stroke by stroke while its slab swings round to face us
    const shock = ramp(F, NAME, NAME + 24);
    set(el.shock, 'opacity', shock > 0 && shock < 1 ? String((1 - shock) * .7) : '0');
    const shockSize = (outCubic(shock) * diag * 1.05).toFixed(1) + 'px';
    set(el.shock, 'width', shockSize); set(el.shock, 'height', shockSize);
    const leave = ramp(F, EXIT, EXIT + 26);
    set(el.title, 'visibility', F >= NAME && F < EXIT + 26 ? 'visible' : 'hidden');
    const swing = outCubic(ramp(F, NAME, NAME + 56)), drift = ramp(F, NAME + 40, EXIT + 12);
    const turn = lerp(-46, -9, swing) + 18 * drift, pitch = lerp(20, 6, swing) - 6 * drift;
    set(el.plate, 'transform', `translateZ(${(inCubic(leave) * 1180).toFixed(1)}px) rotateX(${pitch.toFixed(2)}deg) rotateY(${turn.toFixed(2)}deg)`);
    set(el.title, 'opacity', String(1 - ramp(F, EXIT + 12, EXIT + 25)));
    const draws = strokes.map(stroke => [F >= stroke.start ? '1' : '0', (1 - outExpo(ramp(F, stroke.start, stroke.start + 14))).toFixed(4)]);
    el.strokes.forEach((path, i) => { const d = draws[i % strokes.length]; attr(path, 'opacity', d[0]); attr(path, 'stroke-dashoffset', d[1]); });
    const pop = ramp(F, NAME + 30, NAME + 42);
    attr(el.aStar, 'transform', `translate(${A_STAR[0]} ${A_STAR[1]}) rotate(${n2((1 - outCubic(pop)) * -180)}) scale(${Math.max(0, outBack(pop)).toFixed(4)})`);
    attr(el.aStar, 'opacity', pop > 0 ? '1' : '0');
    set(el.bar, 'clipPath', `inset(0 ${((1 - outExpo(ramp(F, NAME + 38, NAME + 54))) * 100).toFixed(2)}% 0 0)`);
    const zh = ramp(F, NAME + 52, NAME + 68);
    set(el.zh, 'opacity', String(zh));
    set(el.zh, 'letterSpacing', (.9 - .4 * outCubic(zh)).toFixed(3) + 'em');
    set(el.skip, 'opacity', String(ramp(F, 30, 42) * .5 * (1 - ramp(F, EXIT, EXIT + 4))));

    // 6 · launch: the name rushes past (set above) and the star field stretches, then dissolves (drawStars)
  }

  // ---- clock, skip, hand-off ---------------------------------------------
  let t = 0, last = performance.now(), raf = 0, ended = false, handedOff = false;
  let resolveEnded, resolveRevealed;
  const endedPromise = new Promise(r => { resolveEnded = r; });
  const revealedPromise = new Promise(r => { resolveRevealed = r; });

  function finishTimeline() {
    if (ended) return;
    ended = true;
    cancelAnimationFrame(raf);
    // Strip the overlay down to its background: it now matches the veil.
    while (overlay.firstChild) overlay.firstChild.remove();
    resolveEnded();
    // If the scene never answers, leave on our own.
    setTimeout(() => api.handoff(), 2500);
  }
  function tick(nowTime) {
    // Clamp the step so a hidden tab pauses the sequence instead of skipping it.
    t += Math.min(1 / 15, Math.max(0, (nowTime - last) / 1000));
    last = nowTime;
    try { frame(t); } catch (error) { console.warn('[boot]', error); t = END / FPS; }
    if (t * FPS >= END) finishTimeline();
    else raf = requestAnimationFrame(tick);
  }
  function skip() { if (!ended && t * FPS < EXIT) t = EXIT / FPS; }
  overlay.addEventListener('pointerdown', skip);
  addEventListener('keydown', skip);
  addEventListener('wheel', skip, { passive: true });
  addEventListener('touchstart', skip, { passive: true });
  function unbind() {
    removeEventListener('keydown', skip);
    removeEventListener('wheel', skip);
    removeEventListener('touchstart', skip);
    removeEventListener('resize', resize);
  }

  const api = {
    /** Resolves when the timeline has played (the overlay is plain background). */
    ended: endedPromise,
    /** Resolves when the page becomes visible. */
    revealed: revealedPromise,
    get done() { return handedOff; },
    /** Called by site.js once the scene's veil is up (or failed to come up). */
    handoff() {
      if (handedOff) return;
      if (!ended) { endedPromise.then(() => api.handoff()); return; }
      handedOff = true;
      unbind();
      const veil = document.querySelector('.load-veil');
      root.classList.remove('booting');
      resolveRevealed();
      if (veil) { overlay.remove(); return; }
      // No veil (WebGL unavailable, or motion paused): fade out ourselves.
      overlay.style.transition = 'opacity .55s ease';
      overlay.style.pointerEvents = 'none';
      requestAnimationFrame(() => { overlay.style.opacity = '0'; });
      setTimeout(() => overlay.remove(), 650);
    },
  };
  window.asterBoot = api;
  // Development aid: `?boot&bootframe=90` freezes the sequence on frame 90.
  const freeze = Number(new URLSearchParams(location.search).get('bootframe'));
  if (Number.isFinite(freeze) && freeze > 0) { frame(freeze / FPS); return; }
  // A last resort: the page never stays behind the overlay.
  setTimeout(() => { skip(); setTimeout(() => { finishTimeline(); api.handoff(); }, 2400); }, 20000);
  frame(0);
  raf = requestAnimationFrame(n => { last = n; raf = requestAnimationFrame(tick); });
})();
