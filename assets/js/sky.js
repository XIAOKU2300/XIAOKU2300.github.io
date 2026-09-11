/* ════════════════════════════════════════════════════════════
   Aster 的博客 · 星层（sky）
   三层纵深的光斑 / 星屑 / 细环在慢慢向你飘来，指针一动整片
   天空跟着视差偏移，滚动时远近层错开；靠近指针的光会轻轻让开。
   浅 / 深 / 粉三主题各一套配色；若叶绿有自己的插画底，这里不出。
   纯 Canvas 2D + 预渲染贴图，DPR 封顶 1.5，页面隐藏时停 rAF。
   ════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const c = document.createElement("canvas");
  c.className = "sky";
  c.setAttribute("aria-hidden", "true");
  document.body.prepend(c);
  const ctx = c.getContext("2d", { alpha: true });

  const PAL = {
    light: { bokeh: ["125,211,252", "249,168,212", "196,181,253", "253,230,138"], spark: "47,85,201", ring: "2,132,199", alpha: .55, blend: "source-over", nebula: ["125,211,252", "249,168,212"] },
    dark:  { bokeh: ["125,211,252", "165,180,252", "244,114,182", "253,224,71"],  spark: "226,232,240", ring: "125,211,252", alpha: .9, blend: "lighter", nebula: ["56,189,248", "129,140,248"] },
    pink:  { bokeh: ["249,168,212", "251,207,232", "186,230,253", "253,230,138"], spark: "232,67,155", ring: "240,108,155", alpha: .6, blend: "source-over", nebula: ["244,114,182", "125,211,252"] }
  };
  const theme = () => root.dataset.theme || "light";
  const pal = () => PAL[theme()] || PAL.light;

  let W = 0, H = 0, dpr = 1;
  const sprites = new Map();   // "rgb|r" → 预渲染光斑
  function sprite(rgb, r) {
    const k = rgb + "|" + r;
    if (sprites.has(k)) return sprites.get(k);
    const s = document.createElement("canvas");
    s.width = s.height = r * 2;
    const g = s.getContext("2d");
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(.35, `rgba(${rgb},.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, r * 2, r * 2);
    sprites.set(k, s);
    return s;
  }

  /* 粒子：x,y 为 0..1 的相对坐标，z 为纵深（0.25 近 … 1.6 远） */
  const P = [];
  const rand = (a, b) => a + Math.random() * (b - a);
  function spawn(p, far) {
    p.x = Math.random(); p.y = Math.random();
    p.z = far ? rand(1.2, 1.6) : rand(.3, 1.6);
    p.kind = Math.random() < .68 ? 0 : Math.random() < .7 ? 1 : 2;   // 0 光斑 1 星屑 2 细环
    p.r = p.kind === 0 ? rand(10, 34) : p.kind === 1 ? rand(1.2, 2.6) : rand(14, 30);
    p.col = Math.floor(Math.random() * 4);
    p.vx = rand(-.00005, .00005); p.vy = rand(-.00012, -.00003);   // 微微上浮
    p.ph = rand(0, 6.28); p.tw = rand(.004, .012);
    p.rot = rand(0, 6.28);
    return p;
  }
  function fill() {
    const n = Math.round(Math.min(150, Math.max(60, (innerWidth * innerHeight) / 11000)));
    P.length = 0;
    for (let i = 0; i < n; i++) P.push(spawn({}, false));
  }
  /* 三团巨型星云：极慢漂移，给背景一层呼吸的底光 */
  const NEB = [
    { x: .18, y: .22, r: .55, ph: 0 },
    { x: .82, y: .7, r: .6, ph: 2.1 },
    { x: .55, y: .05, r: .45, ph: 4.2 }
  ];

  /* 相机：指针视差 + 滚动视差，都经过缓动 */
  let mx = 0, my = 0, cx = 0, cy = 0, sy = 0, csy = 0;
  let px = -1e4, py = -1e4;   // 指针的屏幕坐标（让开用）
  addEventListener("pointermove", (e) => {
    mx = (e.clientX / innerWidth - .5) * 2;
    my = (e.clientY / innerHeight - .5) * 2;
    px = e.clientX; py = e.clientY;
  }, { passive: true });
  addEventListener("pointerleave", () => { px = py = -1e4; });
  addEventListener("scroll", () => { sy = scrollY; }, { passive: true });

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let t = 0, running = true, raf = 0;
  function frame() {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    draw();
  }
  function draw() {
    t += 1;
    cx += (mx - cx) * .04; cy += (my - cy) * .04; csy += (sy - csy) * .08;
    const p0 = pal();
    ctx.clearRect(0, 0, W, H);

    // 星云
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < NEB.length; i++) {
      const n = NEB[i];
      const breathe = .9 + .1 * Math.sin(t * .0045 + n.ph);
      const r = Math.max(W, H) * n.r * breathe;
      const x = n.x * W + Math.sin(t * .0016 + n.ph) * 40 - cx * 26;
      const y = n.y * H + Math.cos(t * .0013 + n.ph) * 30 - cy * 18 - csy * .04;
      ctx.globalAlpha = theme() === "dark" ? .16 : .12;
      ctx.drawImage(sprite(p0.nebula[i % 2], 128), x - r, y - r, r * 2, r * 2);
    }

    ctx.globalCompositeOperation = p0.blend;
    // 远的先画（z 变化极慢，每 24 帧排一次就够）
    if (t % 24 === 1) P.sort((a, b) => b.z - a.z);
    for (let i = 0; i < P.length; i++) {
      const p = P[i];
      p.x += p.vx; p.y += p.vy; p.ph += p.tw;
      if (!reduce) p.z -= .00035;                   // 缓缓向你飘来
      if (p.z < .25 || p.y < -.1) spawn(p, true);
      const inv = 1 / p.z;
      const par = 60 * inv;                          // 视差幅度随近远变化
      let x = (p.x - .5) * W * (1 + (1 - p.z) * .25) + W / 2 - cx * par;
      let y = (p.y - .5) * H * (1 + (1 - p.z) * .25) + H / 2 - cy * par * .7 - csy * .12 * inv;
      // 靠近指针的光轻轻让开
      const dx = x - px, dy = y - py, d2 = dx * dx + dy * dy;
      if (d2 < 22500) { const d = Math.sqrt(d2) || 1, f = (150 - d) / 150 * 28 * inv; x += dx / d * f; y += dy / d * f; }
      if (x < -60 || x > W + 60 || y < -60 || y > H + 60) continue;
      const tw = .55 + .45 * Math.sin(p.ph);
      const a = p0.alpha * tw * Math.min(1, (1.7 - p.z));
      const r = p.r * inv;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      if (p.kind === 0) {
        ctx.drawImage(sprite(p0.bokeh[p.col], 32), x - r, y - r, r * 2, r * 2);
      } else if (p.kind === 1) {
        // 四芒星屑
        ctx.fillStyle = `rgb(${p0.spark})`;
        const s = r * 2.2;
        ctx.beginPath();
        ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y);
        ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y);
        ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(${p0.ring},.8)`;
        ctx.lineWidth = Math.max(.6, .9 * inv);
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * .42, p.rot + t * .002, 0, 6.29);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function start() {
    running = theme() !== "green" && !document.hidden;
    c.style.display = theme() === "green" ? "none" : "";
    cancelAnimationFrame(raf);
    if (!running) return;
    if (reduce) { draw(); running = false; return; }   // 减弱动态：只画一帧静止的星空
    frame();
  }
  resize(); fill(); start();
  addEventListener("resize", () => { resize(); fill(); });
  document.addEventListener("visibilitychange", start);
  new MutationObserver(start).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* 点击：在落点激起一圈涟漪光晕（与花瓣一起） */
  window.__skyPulse = (x, y) => {
    if (reduce) return;
    for (let i = 0; i < 4; i++) {
      const p = spawn({}, false);
      p.x = x / W; p.y = y / H; p.z = rand(.4, .7); p.kind = 0; p.r = rand(16, 30);
      p.vx = rand(-.0008, .0008); p.vy = rand(-.001, -.0003);
      P.push(p);
    }
    if (P.length > 220) P.splice(0, P.length - 220);
  };
})();
