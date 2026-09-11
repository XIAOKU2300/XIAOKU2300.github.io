/* ════════════════════════════════════════════════════════════
   Aster 的博客 · 渲染与交互
   内容都在 assets/js/data.js，这个文件一般不用动。
   ════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rand = (a, b) => a + Math.random() * (b - a);
  const page = document.body.dataset.page || "";

  /* 字体就绪（带超时兜底）：避免字形加载替换造成的闪烁 */
  function whenReady(max = 900) {
    return Promise.race([
      (document.fonts && document.fonts.ready) || Promise.resolve(),
      sleep(max)
    ]);
  }

  /* ── 小图标库（线性 SVG，跟随文字颜色）──────────────────── */
  const S = (inner) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const ICONS = {
    sparkle:  S('<path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3z"/><path d="M18.5 16.5v3M17 18h3"/>'),
    server:   S('<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>'),
    gamepad:  S('<rect x="2.5" y="7.5" width="19" height="10" rx="5"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".55" fill="currentColor" stroke="none"/><circle cx="18" cy="13.5" r=".55" fill="currentColor" stroke="none"/>'),
    audio:    S('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="2"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="2"/>'),
    palette:  S('<circle cx="13.5" cy="6.5" r=".6" fill="currentColor" stroke="none"/><circle cx="17.5" cy="10.5" r=".6" fill="currentColor" stroke="none"/><circle cx="8.5" cy="7.5" r=".6" fill="currentColor" stroke="none"/><circle cx="6.5" cy="12.5" r=".6" fill="currentColor" stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1.1a1.64 1.64 0 0 1 1.7-1.7h2c3 0 5.5-2.5 5.5-5.5C22 6 17.5 2 12 2z"/>'),
    robot:    S('<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>'),
    network:  S('<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>'),
    cube:     S('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7l8.7 5 8.7-5M12 22V12"/>'),
    mail:     S('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7.5 12 13l8.5-5.5"/>'),
    qq:       S('<path d="M12 3a8.5 8.5 0 0 1 8.5 8.5c0 4.7-3.8 8.5-8.5 8.5-1.6 0-3.1-.44-4.35-1.2L3.5 20l1-4.55A8.5 8.5 0 0 1 12 3z"/>'),
    bilibili: S('<rect x="3" y="7" width="18" height="13" rx="3.5"/><path d="M8 3.5 10.5 7M16 3.5 13.5 7M9.5 12v3.5M14.5 12v3.5"/>'),
    github:   `<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>`,
    code:     S('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    sakura:   `<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="6" r="3"/><circle cx="6.5" cy="10" r="3"/><circle cx="17.5" cy="10" r="3"/><circle cx="8.5" cy="15.8" r="3"/><circle cx="15.5" cy="15.8" r="3"/><circle cx="12" cy="11.5" r="1.7" fill="var(--paper)" stroke="none"/></svg>`,
    upright:  S('<path d="M7 17 17 7M8 7h9v9"/>'),
    arrowRight: S('<path d="M5 12h14M13 6l6 6-6 6"/>')
  };

  /* 文章分类 → 图标 */
  const CAT_ICON = { "自托管": "server", "游戏": "gamepad", "音频": "audio", "AI 自动化": "sparkle", "源码剖析": "code" };

  /* 社交链接 → 图标按钮 */
  function socialsHTML() {
    return SITE.socials.map((s) => {
      const ico = ICONS[s.icon] || "";
      if (s.url) return `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.label}" title="${s.label}">${ico}</a>`;
      if (s.copy) return `<button data-copy="${s.copy}" aria-label="${s.label}" title="${s.label}">${ico}</button>`;
      return "";
    }).filter(Boolean).join("");
  }
  /* 项目状态 → 呼吸灯颜色 */
  const STATUS_TONE = {
    "在跑": "st-ok", "稳定运行": "st-ok", "运营中": "st-ok", "已上线": "st-ok",
    "迭代中": "st-mid", "越加越多": "st-mid", "随缘更新": "st-mid", "维护中": "st-mid",
    "主力开发": "st-dev", "持续折腾": "st-dev", "一直折腾": "st-dev"
  };

  /* ── Toast / 复制 ───────────────────────────────────────── */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("已复制");
    if (btn) {
      btn.classList.remove("copied");
      void btn.offsetWidth;   // 重启动画
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 900);
    }
  }

  /* ── 点了互动不了的东西：掉一串 ×，条目摇头（随机散落）────── */
  function dropX(x, y, src) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (src) {
      src.classList.remove("nope-shake");
      void src.offsetWidth; // 重启动画
      src.classList.add("nope-shake");
      setTimeout(() => src.classList.remove("nope-shake"), 450);
    }
    const rand = (a, b) => a + Math.random() * (b - a);
    const count = 3 + (Math.random() < .4 ? 1 : 0); // 心血来潮多掉一颗
    for (let k = 0; k < count; k++) {
      setTimeout(() => {
        const s = document.createElement("span");
        s.className = "nope-x";
        s.textContent = "×";
        s.style.left = (x + rand(-30, 30)) + "px";
        s.style.top = (y + rand(-16, 12)) + "px";
        s.style.fontSize = rand(15, 42).toFixed(1) + "px";
        s.style.setProperty("--rot", rand(-30, 30).toFixed(1) + "deg");
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 1050);
      }, k * rand(45, 110));
    }
  }

  /* ── 主题四态：浅色 → 深色 → 猛男粉 → 若叶绿（初始判定在 <head> 内联脚本）── */
  const THEMES = [
    { id: "light", name: "浅色", bar: "#FAF7F1" },
    { id: "dark",  name: "深色", bar: "#0B0F19" },
    { id: "pink",  name: "猛男粉", bar: "#FDF0F5" },
    { id: "green", name: "若叶绿", bar: "#EAF6EE" }
  ];

  function syncThemeMeta(id) {
    const t = THEMES.find((x) => x.id === id) || THEMES[0];
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.bar);
  }

  /* 站内翻页判定（vt-nav / vt-native）在 <head> 内联脚本里做，首帧前就绪 */

  /* ── 翻页动效：支持跨文档 View Transition 时交给浏览器柔和交接；
     否则 JS 交棒（内容层上浮淡出）再导航。点击处可炸开主题花瓣。
     纯锚点/外链/修饰键点击/减弱动态均不拦截 ── */
  function initPageTransitions() {
    const supportsVT = typeof CSS !== "undefined" &&
      CSS.supports("view-transition-name", "site-head");

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.dataset.nope !== undefined) return;
      if (e.defaultPrevented || a.target === "_blank") return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!/\.html($|\?)/.test(a.getAttribute("href"))) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (document.documentElement.classList.contains("leaving")) { e.preventDefault(); return; }

      let url;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;

      burstAt(e.clientX || innerWidth / 2, e.clientY || 60, document.documentElement.dataset.theme || "light");
      openRing(a.closest(".blog-card, .post-row, .proj-card, .now-list li, .post-nav a, .pn-title, .menu a") || a);

      // 原生跨文档视图过渡：不拦截，让浏览器做页头连续 + 正文淡入淡出
      if (supportsVT) {
        // 点的是文章卡片：命名为共享元素，浏览器把它变形成文章页的阅读画卷
        const card = a.closest(".blog-card, .post-row");
        if (card && /post\.html/.test(url.pathname)) nameCard(card);
        return;
      }

      e.preventDefault();
      document.documentElement.classList.add("leaving");
      setTimeout(() => { location.href = a.href; }, 200);
    });
    addEventListener("pageshow", (e) => {
      document.documentElement.classList.remove("leaving");
      if (!e.persisted) return;
      $$('[style*="view-transition-name"]').forEach((el) => {   // bfcache 回来：清掉临时命名
        el.style.viewTransitionName = "";
        $$(".blog-title, .pr-title", el).forEach((t) => { t.style.viewTransitionName = ""; });
      });
    });

    // 过渡瞬间页头改用平面底：两页快照像素一致，毛玻璃不再闪色差
    const root = document.documentElement;
    addEventListener("pageswap", (e) => { if (e.viewTransition) root.classList.add("vt-flat"); });
    addEventListener("pagereveal", (e) => {
      if (!e.viewTransition) return;
      root.classList.add("vt-flat");
      const unflat = () => root.classList.remove("vt-flat");
      e.viewTransition.finished.finally(unflat);
      setTimeout(unflat, 1200);   // 兜底：过渡被跳过也不能让页头一直是平面底
    });
  }

  /* 点开动效：从被点的元素向外扩一圈光框，再交给页面过渡 */
  function openRing(el) {
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const ring = document.createElement("i");
    ring.className = "open-ring";
    ring.style.cssText = `left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border-radius:${Math.min(16, Math.max(6, parseFloat(getComputedStyle(el).borderRadius) || 10)) + 4}px`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 600);
  }

  /* 共享元素命名：卡片 → post-card，标题 → post-title */
  function nameCard(card) {
    card.style.viewTransitionName = "post-card";
    const t = card.querySelector(".blog-title, .pr-title");
    if (t) t.style.viewTransitionName = "post-title";
  }
  /* 从文章页返回列表：把对应卡片命名，让画卷缩回卡片里 */
  function nameReturnTarget() {
    try {
      const ref = new URL(document.referrer);
      if (ref.origin !== location.origin || !/post\.html/.test(ref.pathname)) return;
      const slug = ref.searchParams.get("slug");
      if (!slug) return;
      const card = $$(".blog-card, .post-row").find((a) => new URL(a.href).searchParams.get("slug") === slug);
      if (card) nameCard(card);
    } catch {}
  }

  /* ── 卡片追光：一束柔光跟着指针游走（单个委托监听，rAF 节流）── */
  const SPOT_SEL = ".card, .blog-card, .proj-card, .reading-glass, .fact, .copy-rows, .post-toc, .doc-toc, .motd-frame";
  function initSpots() {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(SPOT_SEL).forEach((c) => {
      if (c.classList.contains("spot-host")) return;
      c.classList.add("spot-host");
      const i = document.createElement("i");
      i.className = "spot";
      i.setAttribute("aria-hidden", "true");
      c.appendChild(i);
    });
  }
  let spotRaf = 0;
  document.addEventListener("pointermove", (e) => {
    const host = e.target.closest?.(".spot-host");
    if (!host || spotRaf) return;
    spotRaf = requestAnimationFrame(() => {
      spotRaf = 0;
      const r = host.getBoundingClientRect();
      host.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      host.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    });
  }, { passive: true });

  /* ── 看板娘：左下角的 Live2D 少女（shizuku）。桌面端才出，
     CDN 挂了/无 WebGL 就记入 sessionStorage 安静走开，绝不影响站点 ── */
  function initMusume() {
    if (matchMedia("(max-width: 900px)").matches) return;   // 手机端不出，省流量
    if (sessionStorage.getItem("musume-off")) return;
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js";
    s.onload = () => {
      try {
        L2Dwidget.init({
          model: {
            jsonPath: "https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json",
            scale: 1
          },
          display: { position: "left", width: 150, height: 220, hOffset: 0, vOffset: -6 },
          mobile: { show: false },
          react: { opacity: 0.92, motionOnTap: true },
          dev: { log: false }
        });
        initMusumeTips();
      } catch { sessionStorage.setItem("musume-off", "1"); }
    };
    s.onerror = () => sessionStorage.setItem("musume-off", "1");
    document.head.appendChild(s);
  }

  /* 看板娘台词气泡：开场打招呼，之后每隔一阵说一句，点她也会说 */
  function initMusumeTips() {
    const lines = [
      "欢迎来到 Aster 的博客～",
      "站长又在熬夜折腾了呢。",
      "要一起听 Hi-Fi 吗？",
      "服务器今天也很稳定哦。",
      "东方 Project，同担欢迎！",
      "翻页的时候，注意脚下花瓣～",
      "NAS 又自己重启了…没你的事哦。"
    ];
    const tip = document.createElement("div");
    tip.className = "musume-tip";
    tip.setAttribute("role", "status");
    document.body.appendChild(tip);
    let timer = null;
    const say = (t) => {
      tip.textContent = t;
      tip.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => tip.classList.remove("show"), 3800);
    };
    setTimeout(() => say(lines[0]), 1800);
    setInterval(() => say(lines[Math.floor(Math.random() * lines.length)]), 26000);
    document.addEventListener("click", (e) => {
      const cv = document.querySelector("#live2d-widget canvas");
      if (!cv) return;
      const r = cv.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        say(lines[Math.floor(Math.random() * lines.length)]);
      }
    });
  }

  /* ── 鼠标点击动效：落点炸开一小撮主题花瓣 + 一圈声纳涟漪。
     站内链接走交棒动效已有花瓣，此处自动跳过不叠加 ── */
  function initClickFx() {
    document.addEventListener("click", (e) => {
      if (e.button !== 0) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches || !petalCtx) return;
      const href = e.target.closest("a[href]")?.getAttribute("href") || "";
      if (/\.html($|\?)/.test(href)) return;
      if (e.target.closest("#theme-btn")) return;   // 换肤已有自己的花瓣
      if (burstPetals.length > 130) return;   // 疯狂连点兜底
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 * i) / 6 + rand(-.3, .3);
        const sp = rand(1.3, 2.4);
        burstPetals.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - .8,
          s: rand(2.6, 4.6), rot: rand(0, 6.28), vr: rand(-.1, .1),
          life: .9, col: petalColor(),
          heart: document.documentElement.dataset.theme === "pink" && i % 3 === 0
        });
      }
      window.__skyPulse?.(e.clientX, e.clientY);
      const ring = document.createElement("i");
      ring.className = "click-ring";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 460);
    });
  }

  function initTheme() {
    const root = document.documentElement;
    syncThemeMeta(root.dataset.theme || "light");
    $("#theme-btn")?.addEventListener("click", (e) => {
      const cur = THEMES.findIndex((t) => t.id === (root.dataset.theme || "light"));
      const next = THEMES[(cur + 1) % THEMES.length];
      const bx = e.clientX || innerWidth - 44;
      const by = e.clientY || 30;
      const apply = () => {
        root.dataset.theme = next.id;
        syncThemeMeta(next.id);
        if (next.id === "green") initKomorebi();   // 切到若叶绿才拉随机底图
        try { localStorage.setItem("aster-theme", next.id); } catch {};
      };
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

      // 首选：View Transitions 换肤——新皮肤从点击处圆形晕开（clip-path 合成器动画）
      if (document.startViewTransition && !reduce) {
        const r = Math.hypot(Math.max(bx, innerWidth - bx), Math.max(by, innerHeight - by));
        root.style.setProperty("--tx", bx + "px");
        root.style.setProperty("--ty", by + "px");
        root.style.setProperty("--tr", Math.ceil(r) + "px");
        root.classList.add("theme-vt");
        window.__pauseTyping = true;   // 打字机暂停：揭幕瞬间文字才不会跳变
        burstAt(bx, by, next.id);      // 花瓣与换肤同时炸开，成为转场的一部分
        const cleanup = () => {
          root.classList.remove("theme-vt");
          window.__pauseTyping = false;
        };
        const vt = document.startViewTransition(apply);
        vt.finished.finally(cleanup).catch(() => {});
        setTimeout(cleanup, 800);      // 兜底
        toast(`已切换到「${next.name}」主题`);
        return;
      }

      // 降级：整页渐变换肤，不闪烁
      root.classList.add("theme-anim");
      apply();
      setTimeout(() => root.classList.remove("theme-anim"), 340);
      toast(`已切换到「${next.name}」主题`);
    });
  }

  /* ── data-bind 填充 ─────────────────────────────────────── */
  function hydrate() {
    const p = SITE.profile;
    const map = { name: p.name, grade: p.grade, email: p.email, qq: p.qq, location: p.location, status: p.status, intro: p.intro };
    $$("[data-bind]").forEach((el) => {
      const v = map[el.dataset.bind];
      if (v !== undefined) el.textContent = v;
    });
    $$("[data-mail]").forEach((el) => { el.href = "mailto:" + p.email; });
  }

  /* ── 导航 / 进度条 / 回到顶部 ────────────────────────────── */
  function initNav() {
    $$(".menu a").forEach((a) => a.classList.toggle("active", a.dataset.nav === page));

    const menu = $("#nav-links"), menuBtn = $("#menu-btn");
    $$("a", menu).forEach((a, i) => a.style.setProperty("--i", i));
    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      menuBtn?.classList.toggle("open", open);
      menuBtn?.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    menuBtn?.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu?.classList.contains("open")) setMenu(false); });
    addEventListener("resize", () => { if (innerWidth > 720 && menu?.classList.contains("open")) setMenu(false); });
    menu?.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        menu.classList.remove("open");
        menuBtn?.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    const bar = $(".progress"), toTop = $("#to-top");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const h = document.documentElement;
        if (!bar.dataset.nav) bar.style.setProperty("--p", (h.scrollTop / (h.scrollHeight - h.clientHeight) || 0).toFixed(4));
        toTop?.classList.toggle("show", h.scrollTop > 640);
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop?.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ── 首页 MOTD：登录横幅，一次性打完，光标留着 ───────────── */
  async function typeMotd() {
    const el = $("#motd");
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.innerHTML = SITE.motd.map((l) => `<span class="t-${l.c}">${l.t}</span>`).join("\n");
      return;
    }
    const caret = document.createElement("span");
    caret.className = "caret";
    let skip = false;   // 点终端或敲任意键：剩下的瞬间打完，直接进 shell
    const onSkip = () => { skip = true; };
    el.addEventListener("click", onSkip, { once: true });
    addEventListener("keydown", onSkip, { once: true });
    for (const line of SITE.motd) {
      while (window.__pauseTyping) await sleep(120);   // 主题转场期间暂停，防止揭幕跳字
      if (line.dot) {
        const dot = document.createElement("i");
        dot.className = "t-dot";
        el.appendChild(dot);
      }
      const span = document.createElement("span");
      span.className = "t-" + line.c;
      el.appendChild(span);
      el.appendChild(caret);
      for (const ch of line.t) {
        span.textContent += ch;
        if (!skip) await sleep(line.c === "cmd" ? 22 : 10);
      }
      el.removeChild(caret);
      el.appendChild(document.createTextNode("\n"));
      if (!skip) await sleep(line.c === "cmd" ? 180 : 320);
    }
    el.removeEventListener("click", onSkip);
    removeEventListener("keydown", onSkip);
    el.appendChild(caret);
    startTelemetry();
    initUptime();
    initCli(el, caret);
  }

  /* ── 真·终端：MOTD 打完后接管为可输入的 shell。点终端或按 / 聚焦，
     help 看命令。cd/cat 会真的翻页，theme 真的换肤。 ── */
  function initCli(el, caret) {
    if (el.dataset.cli) return;
    el.dataset.cli = "1";
    const frame = el.closest(".motd-frame");
    const input = document.createElement("input");
    input.className = "cli-input";
    input.setAttribute("aria-label", "终端输入");
    input.autocomplete = "off"; input.spellcheck = false; input.autocapitalize = "off";
    frame.appendChild(input);

    const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const hint = document.createElement("span");
    hint.className = "cli-hint cli-out";
    hint.textContent = "# 这是个能用的终端：点这里，输入 help 试试\n";
    el.appendChild(hint);
    caret.remove();

    let line, typed;
    const prompt = () => {
      line = document.createElement("span");
      line.className = "cli-line";
      line.innerHTML = `<span class="t-cmd">$ </span><span class="cli-typed"></span>`;
      typed = line.querySelector(".cli-typed");
      line.appendChild(caret);
      el.appendChild(line);
      el.scrollTop = el.scrollHeight;
    };
    const out = (html, cls = "t-out") => {
      const o = document.createElement("span");
      o.className = `${cls} cli-out`;
      o.innerHTML = html + "\n";
      el.appendChild(o);
      el.scrollTop = el.scrollHeight;
    };
    const PAGES = { home: "index.html", index: "index.html", blog: "blog.html", posts: "blog.html", projects: "projects.html", about: "about.html", contact: "contact.html", gov: "gov.html", write: "write.html", "~": "index.html" };
    const go = (href) => { out(`→ ${href}`, "t-ok"); setTimeout(() => { location.href = href; }, 240); };
    const posts = () => sortedPosts();
    const CMDS = {
      help: () => out([
        "help            这份清单",
        "ls [posts]      列出页面 / 文章",
        "cd &lt;page&gt;       跳转：home blog projects about contact gov write",
        "cat &lt;n|slug&gt;    打开第 n 篇文章",
        "theme &lt;name&gt;    light / dark / pink / green",
        "whoami · uptime · date · neofetch · echo · clear",
        "petals off|on   花瓣开关 · musume 看板娘开关",
      ].join("\n")),
      ls: (a) => {
        if (a[0] === "posts" || a[0] === "blog") return out(posts().map((p, i) => `${String(i + 1).padStart(2)}  <a href="post.html?slug=${p.slug}">${esc(p.title)}</a>  <span class="cli-hint">${p.date}</span>`).join("\n"));
        out("index.html  blog.html  projects.html  about.html  contact.html  gov.html");
      },
      cd: (a) => { const h = PAGES[(a[0] || "~").replace(/\.html$/, "").replace(/^\//, "")]; h ? go(h) : out(`cd: ${esc(a[0])}: 没有这个目录`, "cli-err"); },
      open: (a) => CMDS.cd(a),
      cat: (a) => {
        const k = a[0] || "";
        const p = /^\d+$/.test(k) ? posts()[+k - 1] : posts().find((x) => x.slug === k);
        p ? go(`post.html?slug=${p.slug}`) : out(`cat: ${esc(k)}: 没有这篇（ls posts 看看）`, "cli-err");
      },
      theme: (a) => {
        const id = (a[0] || "").toLowerCase();
        if (!THEMES.some((t) => t.id === id)) return out("theme: light / dark / pink / green", "cli-err");
        const btn = $("#theme-btn");
        let guard = 0;
        const step = () => { if ((document.documentElement.dataset.theme || "light") !== id && guard++ < 4) { btn.click(); setTimeout(step, 700); } };
        step();
      },
      whoami: () => out(`${SITE.profile.name} · ${SITE.profile.grade} · ${SITE.profile.location}\n${esc(SITE.profile.status)}`),
      uptime: () => {
        const sec = Math.max(0, Math.floor((Date.now() - Date.parse(SITE.profile.uptimeSince || 0)) / 1000));
        out(`up ${Math.floor(sec / 86400)} days, ${Math.floor(sec / 3600) % 24}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")},  load average: 作业 3.0, 折腾 2.7, 睡眠 0.5`);
      },
      date: () => out(new Date().toLocaleString("zh-CN", { hour12: false })),
      echo: (a) => out(esc(a.join(" "))),
      clear: () => { el.innerHTML = ""; },
      neofetch: () => out([
        `<span class="t-ok">   ,-.   </span>  <b>aster</b>@<b>homelab</b>`,
        `<span class="t-ok">  ( o )  </span>  ─────────────────`,
        `<span class="t-ok">   \`-'   </span>  OS: fnOS (Linux) · 手写 HTML/CSS/JS`,
        `           Theme: ${document.documentElement.dataset.theme || "light"} · Font: LXGW WenKai`,
        `           Bot: AstrBot · 鸣潮查分 · Live2D: shizuku`,
        `           Petals: ${ambientPetals.length} · Uptime: since ${(SITE.profile.uptimeSince || "").slice(0, 10)}`,
      ].join("\n")),
      petals: (a) => { const c = $(".petals"); if (!c) return; c.style.display = a[0] === "off" ? "none" : ""; out(`petals ${a[0] === "off" ? "off" : "on"}`, "t-ok"); },
      musume: () => { const w = $("#live2d-widget"); if (!w) return out("看板娘还没来（手机端不出）", "cli-err"); w.style.display = w.style.display === "none" ? "" : "none"; out("ok", "t-ok"); },
      sudo: () => { out(`${SITE.profile.name} is not in the sudoers file. This incident will be reported.`, "cli-err"); dropX(innerWidth / 2, innerHeight / 2, frame); },
      rm: (a) => out(a.join(" ").includes("-rf") ? "别闹。" : "rm: 这里没什么好删的", "cli-err"),
      hi: () => out("你好呀～ 欢迎来 Aster 的小站 ♪", "t-ok"),
      hello: () => CMDS.hi(), exit: () => out("logout\n（其实关不掉，这就是个网页）"), vim: () => out(":q! 都不会你还想用 vim？", "cli-err"),
    };
    const history = []; let hi = 0;
    const run = (raw) => {
      const cmd = raw.trim();
      out(`$ ${esc(cmd)}`, "t-cmd");
      if (cmd) {
        history.push(cmd); hi = history.length;
        const [name, ...args] = cmd.split(/\s+/);
        const fn = CMDS[name.toLowerCase()];
        fn ? fn(args) : out(`bash: ${esc(name)}: command not found（试试 help）`, "cli-err");
      }
      prompt();
    };
    input.addEventListener("input", () => { typed.textContent = input.value; el.scrollTop = el.scrollHeight; });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { line.remove(); run(input.value); input.value = ""; }
      else if (e.key === "ArrowUp") { if (hi > 0) { input.value = history[--hi]; typed.textContent = input.value; } e.preventDefault(); }
      else if (e.key === "ArrowDown") { hi = Math.min(hi + 1, history.length); input.value = history[hi] || ""; typed.textContent = input.value; e.preventDefault(); }
    });
    frame.addEventListener("click", (e) => { if (!e.target.closest("a")) input.focus({ preventScroll: true }); });
    addEventListener("keydown", (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && document.activeElement !== input && !/^(input|textarea)$/i.test(e.target.tagName)) {
        e.preventDefault(); input.focus({ preventScroll: true });
        frame.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
    prompt();
  }

  /* ── 在线状态：挂机一分钟没动，状态胶囊换句话，动一动就回来 ── */
  function initIdle() {
    const st = $(".presence [data-bind=\"status\"]");
    if (!st) return;
    const orig = st.textContent;
    let t;
    const arm = () => {
      clearTimeout(t);
      if (st.textContent !== orig) st.textContent = orig;
      t = setTimeout(() => { st.textContent = "挂机中…（动一动？）"; }, 60000);
    };
    ["pointermove", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, arm, { passive: true }));
    arm();
  }

  /* 遥测行：延迟数值抖动 + 随机生活切片轮播，面板像有人住在里面 */
  const LIFE_SNIPPETS = [
    "reading docs...",
    "playing hi-fi track...",
    "listening to ZUN...",
    "feeding containers...",
    "syncing echos...",
    "debugging with cola..."
  ];
  /* ── 运行时长：挂在终端状态栏下，秒位翻牌滚动，走北京时间起算 ── */
  function initUptime() {
    const foot = $("#cli-foot");
    if (!foot || foot.nextElementSibling?.classList.contains("cli-uptime")) return;
    const since = Date.parse(SITE.profile.uptimeSince || "2026-09-06T00:00:00+08:00");
    if (Number.isNaN(since)) return;

    const row = document.createElement("div");
    row.className = "cli-uptime";
    row.innerHTML = `<i class="u-dot" aria-hidden="true"></i>本站已连续运行 <b class="u-day">0</b> 天 <b class="u-time" role="timer"></b><span class="u-zone">北京时间 · UTC+8</span>`;
    foot.after(row);

    const dayEl = row.querySelector(".u-day");
    const timeEl = row.querySelector(".u-time");
    const pad = (n) => String(n).padStart(2, "0");

    const draw = (str) => {
      // 逐位翻牌：只替换变化的位。替换对象必须是 .u-cell 整格——
      // 若替换内层 .u-d 会把新格塞进旧格里，DOM 每秒多套一层壳
      const prev = timeEl.dataset.v || "";
      if (prev.length !== str.length) {
        timeEl.innerHTML = [...str].map((ch) => /\d/.test(ch)
          ? `<span class="u-cell"><span class="u-d">${ch}</span></span>`
          : `<span class="u-sep">${ch}</span>`).join("");
      } else {
        const cells = timeEl.querySelectorAll(".u-cell");
        const digits = str.replace(/\D/g, "").length;
        if (cells.length !== digits) {
          timeEl.innerHTML = [...str].map((ch) => /\d/.test(ch)
            ? `<span class="u-cell"><span class="u-d">${ch}</span></span>`
            : `<span class="u-sep">${ch}</span>`).join("");
        } else {
          let k = 0;
          for (let i = 0; i < str.length; i++) {
            if (!/\d/.test(str[i])) continue;
            if (prev[i] !== str[i] && cells[k]) {
              cells[k].outerHTML = `<span class="u-cell"><span class="u-d">${str[i]}</span></span>`;
            }
            k++;
          }
        }
      }
      timeEl.dataset.v = str;
    };

    const tick = () => {
      let s = Math.floor((Date.now() - since) / 1000);
      if (s < 0) s = 0;
      const d = Math.floor(s / 86400);
      draw(`${pad(Math.floor(s / 3600) % 24)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`);
      dayEl.textContent = d;
    };
    tick();
    setInterval(tick, 1000);
  }

  function startTelemetry() {
    const el = $("#cli-foot");
    if (!el || el.dataset.on) return;
    el.dataset.on = "1";
    let net = 8;
    const tele = () => {
      net = Math.max(4, Math.min(18, net + Math.round(rand(-2.5, 2.5))));
      return `net ${net}ms · containers 12 · load 2.7`;
    };
    el.textContent = tele();
    setInterval(() => {
      el.textContent = tele();
    }, 900);
    /* 每 9 秒插入一句生活切片，打完停留 3 秒回到遥测 */
    setInterval(async () => {
      const line = LIFE_SNIPPETS[Math.floor(Math.random() * LIFE_SNIPPETS.length)];
      const out = `> ${line}`;
      for (let i = 1; i <= out.length; i++) { el.textContent = out.slice(0, i); await sleep(24); }
      await sleep(3000);
      const back = tele();
      for (let i = 1; i <= back.length; i++) { el.textContent = back.slice(0, i); await sleep(10); }
    }, 9000);
  }
  const sortedPosts = () => [...SITE.posts].sort((a, b) => b.date.localeCompare(a.date));

  const d = (i, step = 45, cap = 240) => `--d:${Math.min(i * step, cap)}ms`;

  function postRow(p, i = 0) {
    const catIco = ICONS[CAT_ICON[p.category]] || "";
    return `<a class="post-row rv" style="${d(i)}" href="post.html?slug=${p.slug}">
      <span class="pr-date">${p.date}</span>
      <span class="pr-title">${p.title}</span>
      <span class="pr-cat">${catIco}${p.category}</span>
    </a>`;
  }

  const CAT_TONE = { "自托管": "sys", "源码剖析": "sys", "AI 自动化": "bot", "游戏": "bot", "音频": "hw" };

  function blogCard(p, i) {
    const catIco = ICONS[CAT_ICON[p.category]] || "";
    return `<a class="blog-card rv" data-tone="${CAT_TONE[p.category] || "sys"}" style="${d(i)}" href="post.html?slug=${p.slug}">
      <div class="blog-meta">
        <span>${p.date}</span>
        <span class="cat">${catIco}${p.category}</span>
        <span>约 ${p.readTime} 分钟</span>
      </div>
      <h3 class="blog-title">${p.title}</h3>
      <p class="blog-sum">${p.summary}</p>
    </a>`;
  }

  function renderHome() {
    const posts = $("#home-posts");
    if (posts) posts.innerHTML = sortedPosts().slice(0, 5).map((p, i) => postRow(p, i)).join("");

    const socials = $("#home-socials");
    if (socials) socials.innerHTML = socialsHTML();

    const now = $("#now-list");
    if (now) now.innerHTML = SITE.now.map((n, i) => {
      const body = `
          <div class="now-top">
            <span class="now-ico">${ICONS[n.icon] || ""}</span>
            <span class="now-name">${n.name}</span>
            <span class="now-status">（${n.status}）</span>
            ${n.link ? `<span class="now-go">${ICONS.upright}</span>` : ""}
          </div>
          <p class="now-note">${n.note}</p>`;
      return n.link
        ? `<li class="rv" style="${d(i)}"><a class="now-body" href="${n.link}" target="_blank" rel="noopener">${body}</a></li>`
        : `<li class="rv" style="${d(i)}"><div class="now-body" data-nope>${body}</div></li>`;
    }).join("");
  }

  /* ── 文章列表页：分类筛选 + 按年分组（筛选状态进 URL，可分享）── */
  function initBlogPage() {
    const list = $("#post-list"), filters = $("#post-filters");
    if (!list) return;
    const all = sortedPosts();
    const cats = ["全部", ...new Set(all.map((p) => p.category))];

    filters.innerHTML = cats.map((c) => {
      const n = c === "全部" ? all.length : all.filter((p) => p.category === c).length;
      return `<button class="flink ${c === "全部" ? "active" : ""}" data-cat="${c}">${c}<span class="n">${n}</span></button>`;
    }).join("");

    function syncURL(cat) {
      const u = new URL(location.href);
      if (cat === "全部") u.searchParams.delete("cat"); else u.searchParams.set("cat", cat);
      history.replaceState(null, "", u);
    }

    function render(cat, instant) {
      const rows = cat === "全部" ? all : all.filter((p) => p.category === cat);
      const html = rows.map((p, i) => blogCard(p, i)).join("");
      list.innerHTML = html;
    }

    // 初始：读取 ?cat=（无效值回落全部）
    const fromURL = new URLSearchParams(location.search).get("cat");
    let current = cats.includes(fromURL) ? fromURL : "全部";
    if (current !== "全部") {
      $$(".flink", filters).forEach((b) => b.classList.toggle("active", b.dataset.cat === current));
      render(current, true);
    }

    let switching = false;
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest(".flink");
      if (!btn || switching || btn.dataset.cat === current) return;
      $$(".flink", filters).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      switching = true;
      current = btn.dataset.cat;
      syncURL(current);
      // 视口回到列表顶部，对齐点击位置
      if (scrollY > 4) scrollTo({ top: 0, behavior: "instant" });
      // 两段式：旧列表淡出 → 换内容 → 新列表交错淡入（确定性，无跳变）
      list.classList.add("leaving");
      setTimeout(() => {
        render(current, true);
        list.classList.remove("leaving");
        switching = false;
      }, 170);
    });

    if (current === "全部") render("全部", false);
  }

  /* ── 文章详情页 ─────────────────────────────────────────── */
  function initPostPage() {
    const root = $("#post-root");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("slug");
    const i = sortedPosts().findIndex((p) => p.slug === slug);
    const p = sortedPosts()[i];

    if (!p) {
      root.innerHTML = `
        <div class="reading-glass">
          <h1 class="article-h1">迷子になっちゃった…</h1>
          <p class="page-sub" style="margin-top:14px">文章走丢了，链接可能打错了。<a href="blog.html">回文章列表</a>找找。</p>
        </div>`;
      return;
    }

    document.title = `${p.title} · ${SITE.profile.name}的博客`;
    const prev = sortedPosts()[i - 1], next = sortedPosts()[i + 1];

    // 头部信息不依赖正文：立即上屏，骨架只留给正文区
    root.innerHTML = `
      <a class="back rv" href="blog.html">← 全部文章</a>
      <div class="reading-glass">
        <span class="eyebrow rv" style="--d:20ms"><i class="dot"></i>${p.category}</span>
        <svg class="halo halo-title" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="96" />
          <circle cx="100" cy="100" r="80" class="h-sakura" />
          <circle cx="100" cy="100" r="62" />
          <circle cx="100" cy="100" r="88" class="h-ticks" />
        </svg>
        <h1 class="article-h1 rv" style="--d:60ms">${p.title}</h1>
        <div class="article-meta rv" style="--d:110ms">
          <span>${p.date}</span>
          <span>约 ${p.readTime} 分钟</span>
        </div>
        <div class="beam-divider" aria-hidden="true"></div>
        <div class="body">
          <div class="skeleton" aria-hidden="true">
            <div class="sk" style="width:100%"></div>
            <div class="sk" style="width:94%"></div>
            <div class="sk" style="width:97%"></div>
            <div class="sk" style="width:88%"></div>
            <div class="sk" style="width:100%"></div>
            <div class="sk" style="width:64%"></div>
          </div>
        </div>
      </div>`;

    // 字体就绪后正文落地（骨架最短 shimmer 一拍，避免闪烁）
    Promise.all([whenReady(900), sleep(120)]).then(() => {
      const glass = $(".reading-glass", root);
      const body = $(".body", root);
      body.innerHTML = p.body;
      glass.insertAdjacentHTML("beforeend", `
        <div class="tags rv rv-late" style="--d:190ms">${p.tags.map((t) => `<span>#${t}</span>`).join("")}</div>
        <p class="end-mark rv rv-late" style="--d:210ms">（完）</p>
        ${prev || next ? `<div class="post-nav rv rv-late" style="--d:230ms">
          ${prev ? `<a href="post.html?slug=${prev.slug}"><span class="pn-label">上一篇</span><span class="pn-title">${prev.title}</span></a>` : "<span></span>"}
          ${next ? `<a class="next" href="post.html?slug=${next.slug}"><span class="pn-label">下一篇</span><span class="pn-title">${next.title}</span></a>` : ""}
        </div>` : ""}`);

      // 粘性章节目录（≥2 个小节才显示）
      const heads = $$(".body h2", root);
      const toc = $("#post-toc");
      if (toc && heads.length >= 2) {
        toc.hidden = false;
        toc.innerHTML = `<div class="pt-title">本页目录</div>` + heads.map((h, i) => {
          h.id = "sec-" + i;
          return `<a class="pt-link" data-i="${i}" href="#sec-${i}">${h.textContent}</a>`;
        }).join("");
        const links = $$(".pt-link", toc);
        // 高亮规则：阅读线（视口 30% 处）以上最后一个标题 = 当前小节
        // 直接滚动监听逐帧算，无状态累积，滚到哪亮到哪
        const onSpy = () => {
          const line = innerHeight * .3;
          let curHead = heads[0];
          for (const h of heads) {
            if (h.getBoundingClientRect().top <= line) curHead = h;
          }
          links.forEach((l) => l.classList.toggle("cur", l.dataset.i === String(heads.indexOf(curHead))));
        };
        addEventListener("scroll", onSpy, { passive: true });
        onSpy();
      }

      // 正文逐段浮现（.rv 插入即播）。不再逐字拆分：阅读中的文字不该消失，
      // 也省掉成百上千个过渡节点带来的滚动卡顿
      if (body) {
        [...body.children].forEach((el, i) => {
          el.classList.add("rv", "rv-late");
          el.style.setProperty("--d", Math.min(i * 40, 280) + "ms");
        });
      }
      addCopyButtons(root);
    });
  }
  /* 技术标签情境分类：运维/硬件 → 薄荷，其余 → 冰青 */
  const OPS_KEYWORDS = ["NAS", "Docker", "Linux", "Clash", "STM32", "焊台", "Hi-Fi", "foobar2000", "服务端"];
  const pillKind = (t) => OPS_KEYWORDS.some((k) => t.includes(k)) ? "pill-ops" : "pill-code";

  /* ── 项目清单页：亚克力悬浮卡片 ─────────────────────────── */
  function renderProjects() {
    const el = $("#project-list");
    if (!el) return;
    el.innerHTML = SITE.projects.map((p, i) => `
      <article class="proj-card rv" data-tone="${p.tone || "sys"}" style="${d(i)}"${p.link ? "" : " data-nope"}>
        <span class="notch-tag mono" aria-hidden="true">[AST-DEV-${String(i + 1).padStart(2, "0")}]</span>
        <i class="cart-strip" aria-hidden="true"></i>
        <i class="pulse-dot" aria-hidden="true"></i>
        <div class="proj-top">
          <h3 class="pi-name">${p.name}</h3>
          <div class="proj-meta">
            ${p.stars ? `<span class="pi-star">★ ${p.stars}</span>` : ""}
            <span class="proj-status"><i class="st-ring ${STATUS_TONE[p.status] || "st-mid"}" aria-hidden="true"></i>${p.status}</span>
            <span class="proj-year">${p.year}</span>
          </div>
        </div>
        <p class="pi-desc">${p.desc}</p>
        <div class="proj-foot">
          <div class="proj-stack">${p.tags.map((t) => `<span class="stk-pill ${pillKind(t)}">${t}</span>`).join("")}</div>
          ${p.link ? `<a class="proj-link" href="${p.link}" target="_blank" rel="noopener">项目地址${ICONS.upright}</a>` : ""}
        </div>
      </article>`).join("");
  }

  /* ── 关于页 ─────────────────────────────────────────────── */
  /* 关于页：角色档案（身份停坞 + 故事长卷 + 工具箱 + 轨迹日志） */
  function renderAbout() {
    const a = SITE.about;

    const bio = $("#about-bio");
    if (bio) bio.innerHTML = a.bio.map((t) => `<p>${t}</p>`).join("");

    const memo = $("#memo");
    if (memo) memo.innerHTML = `
      <span class="memo-stamp mono">${a.memo.stamp}</span>
      <p>${a.memo.text}</p>`;

    const inv = $("#inventory");
    if (inv) inv.innerHTML = a.inventory.map((g) => `
      <div class="inv-card card">
        <div class="inv-head mono">[ ${g.group} ]</div>
        <div class="inv-items">${g.items.map((i) => `<span class="stk-pill ${pillKind(i)}">${i}</span>`).join("")}</div>
        <p class="inv-note">${g.note}</p>
      </div>`).join("");

    /* 时间轴 → Changelog：首个逗号/分号前是版本标题，后面是注记 */
    const tl = $("#timeline");
    if (tl) tl.innerHTML = a.timeline.map((t, i) => {
      const m = t.text.match(/^(.*?)[，；](.*)$/s);
      const title = m ? m[1] : t.text;
      const note = m ? m[2] : "";
      return `
      <li class="tl-item">
        <i class="tl-node ${i === a.timeline.length - 1 ? "tl-now" : ""}" aria-hidden="true"></i>
        <b class="tl-title"><span class="tl-year mono">${t.year}</span>${title}</b>
        ${note ? `<p class="tl-note">${note}</p>` : ""}
      </li>`;
    }).join("");

    const aside = $("#aside");
    if (aside) { aside.classList.add("rv"); aside.textContent = a.aside; }

    const socials = $("#about-socials");
    if (socials) socials.innerHTML = socialsHTML();

    renderContactRows($("#about-contact"), SITE.profile);
    const notes = $("#about-notes");
    if (notes) notes.innerHTML = SITE.about.contactNotes.map((t) => `<p>${t}</p>`).join("");
  }

  /* ── 联系方式复制行（关于页 / 联系页共用）────────────────── */
  function renderContactRows(el, p) {
    if (!el) return;
    el.classList.add("rv");
    el.innerHTML = `
      <div class="copy-row">
        <span class="copy-label">${ICONS.mail}邮箱</span>
        <span class="copy-value">${p.email}</span>
        <button class="copy-btn" data-copy="${p.email}">复制</button>
      </div>
      <div class="copy-row">
        <span class="copy-label">${ICONS.qq}QQ</span>
        <span class="copy-value">${p.qq}</span>
        <button class="copy-btn" data-copy="${p.qq}">复制</button>
      </div>`;
  }

  function renderContactPage() {
    renderContactRows($("#contact-rows"), SITE.profile);
    const notes = $("#contact-notes");
    if (notes) notes.innerHTML = SITE.about.contactNotes.map((t) => `<p>${t}</p>`).join("");
  }

  /* ── 页脚 ───────────────────────────────────────────────── */
  function renderFooter() {
    const links = $("#foot-links");
    if (links) {
      const parts = SITE.socials.map((s) => {
        const ico = ICONS[s.icon] || "";
        if (s.url) return `<a href="${s.url}" target="_blank" rel="noopener">${ico}${s.label}</a>`;
        if (s.copy) return `<button data-copy="${s.copy}">${ico}${s.label} ${s.copy}</button>`;
        return "";
      }).filter(Boolean);
      const mail = `<a data-mail href="mailto:${SITE.profile.email}">${ICONS.mail}邮箱</a>`;
      links.innerHTML = parts.length ? parts.join("") : mail;
    }
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
    const note = $("#foot-note");
    if (note) note.textContent = SITE.footerNote;
  }

  /* ── 卡带通电：卡片滚经视口，能量光点沿边框跑一圈 ────────── */
  function initEnergize() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting || en.boundingClientRect.top < 0) return;
        const el = en.target;
        el.classList.add("energized");
        setTimeout(() => el.classList.remove("energized"), 1600);
      });
    }, { threshold: .25 });
    const watch = () => $$(".proj-card").forEach((c) => io.observe(c));
    watch();
    document.addEventListener("click", (e) => {
      if (e.target.closest(".flink")) setTimeout(watch, 250);  // 筛选重挂
    });
  }

  /* ── 显现：入场交给 CSS load 动画（.rv），内容永远直接可见 ── */

  /* ── 拆字工具：把文本节点拆成动画单元 ─────────────────────
     拉丁词（含 main.py / Playwright 这类）整体成组，防止词中断行；
     CJK 逐字拆分。mark / code / term 作为整体成组移动，
     避免下划线和荧光底留在原地。 */
  /* 行首禁则标点：拆字时不允许这些字符单独成盒（会跑到行首） */
  const NO_HEAD = "，。、！？：；）」』》…·—％";
  const MAX_TOKEN = 14;   // 超长英文标识符分段，保证能换行
  function chunkWord(w) {
    if (w.length <= MAX_TOKEN) return [w];
    const out = [];
    let start = 0;
    while (start < w.length) {
      let end = Math.min(start + MAX_TOKEN, w.length);
      if (end < w.length) {
        // 优先在分隔符处断，别把标识符硬切成两半
        const sep = Math.max(w.lastIndexOf("_", end), w.lastIndexOf(".", end), w.lastIndexOf("-", end));
        if (sep > start) end = sep + 1;
      }
      out.push(w.slice(start, end));
      start = end;
    }
    return out;
  }
  function tokenizeText(text) {
    const raw = text.match(/[A-Za-z0-9][A-Za-z0-9@._\-/:+#%']*|[^A-Za-z0-9]/gs) || [];
    const out = [];
    for (const tk of raw) {
      if (/^[A-Za-z0-9]/.test(tk) && tk.length > MAX_TOKEN) {
        out.push(...chunkWord(tk));
      } else if (out.length && tk.length === 1 && NO_HEAD.includes(tk)) {
        out[out.length - 1] += tk;
      } else {
        out.push(tk);
      }
    }
    return out;
  }

  /* ── 标题逐字上浮 + 滚出顶部时歪头坠落 ───────────────────── */
  function splitChars(el) {
    if (!el || el.dataset.split) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.split = "1";
    const label = el.textContent;
    el.setAttribute("aria-label", label);
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          tokenizeText(child.textContent).forEach((tk) => {
            if (/^\s+$/.test(tk)) { frag.appendChild(document.createTextNode(" ")); return; }
            if (lastBox && tk.length === 1 && NO_HEAD.includes(tk)) { lastBox.textContent += tk; return; }
            const s = document.createElement("span");
            s.className = "ch";
            s.setAttribute("aria-hidden", "true");
            s.textContent = tk;
            lastBox = s;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    let lastBox = null;
    walk(el);
    [...el.querySelectorAll(".ch")].forEach((s, i) => {
      s.style.setProperty("--i", Math.min(i, 16));                    // 逐字上浮的先后
      s.style.setProperty("--fr", (Math.random() * 16 - 8).toFixed(1) + "deg"); // 离场轻微歪头
      s.style.setProperty("--fd", Math.min(i * 14, 220) + "ms");                 // 离场按字序散开
      // 入场动画结束后松手，让离场转场接管
      s.addEventListener("animationend", () => { s.style.animation = "none"; }, { once: true });
    });
  }

  /* ── 离场触发器：大标题滚出页头时轻轻散开（一次固定动画，不跟滚轮），
     滚回来按原路重现。只观察 .fall-text，正文不参与。 */
  let exitTopIO = null;
  const exitWatched = new WeakSet();
  const exitSeen = new WeakSet();      // 曾进入过视口（离场效果的前置条件）
  function initExitFx() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const line = 62;                                   // 页头高度
    if (!exitTopIO) {
      exitTopIO = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          const el = en.target;
          if (en.isIntersecting) {
            exitSeen.add(el);
            el.classList.remove("bye");
          } else if (exitSeen.has(el) && en.boundingClientRect.bottom <= line + 4) {
            el.classList.add("bye");
          }
        });
      }, { rootMargin: `-${line}px 0px 0px 0px`, threshold: 0 });
    }
    $$(".fall-text").forEach((t) => {
      if (exitWatched.has(t)) return;
      exitWatched.add(t);
      exitTopIO.observe(t);
    });
  }

  /* ── 樱花飘落（全站背景装饰，猛男粉主题会混入爱心，「减弱动态」关闭）── */
  let petalCtx = null, petalW = 0, petalH = 0;
  const ambientPetals = [], burstPetals = [];

  function petalColor() {
    const t = document.documentElement.dataset.theme;
    if (t === "dark") return "rgba(216,150,175,.32)";
    if (t === "pink") return "rgba(240,100,155,.55)";
    if (t === "green") return "rgba(120,195,150,.5)";   // 若叶：新叶飘落
    return "rgba(238,158,180,.5)";
  }

  function drawPetal(s, heart) {
    petalCtx.beginPath();
    if (heart) {
      petalCtx.moveTo(0, s * .35);
      petalCtx.bezierCurveTo(-s, -s * .55, -s * .55, -s * 1.15, 0, -s * .35);
      petalCtx.bezierCurveTo(s * .55, -s * 1.15, s, -s * .55, 0, s * .35);
    } else {
      petalCtx.ellipse(0, 0, s, s * .55, 0, 0, 6.29);
    }
    petalCtx.fill();
  }

  // 换装庆祝：从某点炸开一圈花瓣/爱心
  function burstAt(x, y, theme) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !petalCtx) return;
    const col = theme === "dark" ? "rgba(190,200,255,.75)"
      : theme === "pink" ? "rgba(246,110,165,.85)"
      : theme === "green" ? "rgba(74,200,130,.85)" : "rgba(120,145,240,.65)";
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 + rand(-.25, .25);
      const sp = rand(2.2, 4.8);
      burstPetals.push({
        x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.4,
        s: rand(3.5, 7.5), rot: rand(0, 6.28), vr: rand(-.12, .12),
        life: 1, col, heart: theme === "pink" && i % 3 === 0
      });
    }
  }

  function initPetals() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas");
    c.className = "petals";
    c.setAttribute("aria-hidden", "true");
    document.body.prepend(c);
    petalCtx = c.getContext("2d");
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);   // 高分屏不糊，上限 2 省 GPU
      petalW = innerWidth; petalH = innerHeight;
      c.width = Math.round(petalW * dpr); c.height = Math.round(petalH * dpr);
      petalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    addEventListener("resize", resize);
    resize();
    let running = true;
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) tick();          // 回到前台再起 rAF，切走时不空转
    });
    for (let i = 0; i < (innerWidth < 720 ? 12 : 22); i++) {
      ambientPetals.push({
        x: rand(0, innerWidth), y: rand(-innerHeight, 0),
        s: rand(4.5, 9), vy: rand(.35, .85),
        phase: rand(0, 6.28), sway: rand(.3, .7),
        rot: rand(0, 6.28), vr: rand(-.025, .025),
        o: rand(.35, .65), heart: false
      });
    }
    function tick() {
      if (!running) return;
      requestAnimationFrame(tick);
      petalCtx.clearRect(0, 0, petalW, petalH);
      petalCtx.fillStyle = petalColor();
      const pink = document.documentElement.dataset.theme === "pink";
      for (let i = 0; i < ambientPetals.length; i++) {
        const p = ambientPetals[i];
        p.y += p.vy; p.phase += .016;
        p.x += Math.sin(p.phase) * p.sway; p.rot += p.vr;
        if (p.y > petalH + 14) { p.y = -14; p.x = rand(0, petalW); }
        if (p.x < -14) p.x = petalW + 14;
        if (p.x > petalW + 14) p.x = -14;
        petalCtx.save();
        petalCtx.translate(p.x, p.y); petalCtx.rotate(p.rot); petalCtx.globalAlpha = p.o;
        drawPetal(p.s, pink && i % 5 === 0);
        petalCtx.restore();
      }
      for (let i = burstPetals.length - 1; i >= 0; i--) {
        const p = burstPetals[i];
        p.x += p.vx; p.y += p.vy; p.vy += .07; p.vx *= .99;
        p.rot += p.vr; p.life -= .014;
        if (p.life <= 0) { burstPetals.splice(i, 1); continue; }
        petalCtx.save();
        petalCtx.translate(p.x, p.y); petalCtx.rotate(p.rot);
        petalCtx.globalAlpha = Math.max(p.life, 0);
        petalCtx.fillStyle = p.col;
        drawPetal(p.s, p.heart);
        petalCtx.restore();
      }
      petalCtx.globalAlpha = 1;
    }
    tick();
  }

  /* ── 若叶绿底图：loliapi 随机二次元图。整个浏览会话固定一张：
     首次经 json 接口（已开 CORS）拿到稳定图链存入 sessionStorage，
     翻页/刷新复用同一张（浏览器缓存秒开），新开标签页才换新图；
     图链失效自动换一张随机（不再缓存），接口不通退回跳转随机，
     再失败停在本地占位插画。呼吸缩放交给 CSS ── */
  function initKomorebi() {
    let el = document.querySelector(".bg-komorebi");
    if (!el) {
      el = document.createElement("div");
      el.className = "bg-komorebi";
      el.setAttribute("aria-hidden", "true");
      document.body.prepend(el);
    }
    if (el.dataset.loadBound) return;   // 主题来回切不重复请求
    el.dataset.loadBound = "1";

    const show = (src, isRetry, instant) => {
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.onload = () => {
        if (instant) el.classList.add("instant");   // 会话缓存命中：跳过淡入，免翻页闪烁
        el.appendChild(img);
        el.classList.add("ready");
        // 动态壁纸层已接管：摘掉 body 的 fixed 兜底底图，免掉滚动重绘开销
        document.body.classList.add("komorebi-live");
      };
      img.onerror = () => {
        try { sessionStorage.removeItem("komorebi-bg"); } catch {}
        if (isRetry) return;   // 再失败就停在本地兜底底图
        show("https://www.loliapi.com/acg/", true);
      };
      img.src = src;
    };

    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("komorebi-bg") || "null"); } catch {}
    if (saved && saved.url) { show(saved.url, false, true); return; }

    fetch("https://www.loliapi.com/acg/?type=json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        const url = d.url || d.imgurl;   // 兼容文档旧字段 imgurl
        if (!url) throw new Error("no url");
        try {
          sessionStorage.setItem("komorebi-bg", JSON.stringify({ url }));
          // 兜底底图同步成同一张：新会话首屏也无缝，淡入只是隐形保险
          document.documentElement.style.setProperty("--wallpaper", `url("${url}")`);
        } catch {}
        show(url);
      })
      .catch(() => show("https://www.loliapi.com/acg/"));   // 接口不通：仅本页随机
  }

  /* ── 开机动画：冷启动才出（判定在 <head> 内联脚本里加 html.booting）。
     终端式滚三行日志，等 load / 字体就绪且至少亮 1s 后揭幕；
     最长 2.4s 强制放行，绝不卡住内容。 ── */
  function initBoot() {
    const root = document.documentElement;
    const el = $("#boot");
    if (!root.classList.contains("booting") || !el) return Promise.resolve();
    try { sessionStorage.setItem("aster-booted", "1"); } catch {}
    const log = $("#boot-log");
    const lines = ["mounting /home/aster", "loading fonts + petals", "systemctl start blog"];
    let i = 0;
    const caret = '<span class="caret" aria-hidden="true"></span>';
    const step = () => {
      if (!log || i >= lines.length) return;
      log.innerHTML = `<span class="t-out">&gt; ${lines[i++]}</span>${caret}`;
    };
    step();
    const stepTimer = setInterval(step, 300);
    const loaded = new Promise((r) => {
      if (document.readyState === "complete") r();
      else addEventListener("load", r, { once: true });
    });
    return Promise.race([
      Promise.all([loaded, whenReady(1200), sleep(1000)]),
      sleep(2400)
    ]).then(() => {
      clearInterval(stepTimer);
      if (log) log.innerHTML = `<span class="t-ok">&gt; ready. welcome ♪</span>`;
      return sleep(160);
    }).then(() => {
      el.classList.add("done");
      root.classList.remove("booting");   // 入场动画从暂停态起播（见 CSS .booting .rv）
      setTimeout(() => el.remove(), 600);
    });
  }

  /* ── 指针微倾斜：hero 卡与头像卡跟着鼠标轻轻转头（±2°），离开回正 ── */
  function initTilt() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".hero-card, .dock-card").forEach((card) => {
      card.classList.add("tilt");
      let raf = 0;
      card.addEventListener("pointermove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - .5;
          const py = (e.clientY - r.top) / r.height - .5;
          card.classList.add("tilting");
          card.style.setProperty("--ry", (px * 4).toFixed(2) + "deg");
          card.style.setProperty("--rx", (-py * 4).toFixed(2) + "deg");
        });
      });
      card.addEventListener("pointerleave", () => {
        card.classList.remove("tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ── 代码块复制按钮（文章正文 / 全文页）────────────────────── */
  function addCopyButtons(scope = document) {
    $$("pre", scope).forEach((pre) => {
      if (pre.querySelector(".pre-copy")) return;
      const btn = document.createElement("button");
      btn.className = "pre-copy";
      btn.type = "button";
      btn.textContent = "COPY";
      btn.setAttribute("aria-label", "复制代码");
      btn.addEventListener("click", async () => {
        await copyText(pre.querySelector("code")?.innerText ?? pre.innerText);
        btn.textContent = "COPIED ✓";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "COPY"; btn.classList.remove("copied"); }, 1400);
      });
      pre.appendChild(btn);
    });
  }

  /* ── 小玩意：标签页离开时改标题、快捷键、控制台署名、Konami 花瓣暴风 ── */
  function initToys() {
    // 切走标签页：标题撒娇，回来恢复（文章页标题在 initPostPage 里改过，所以延后取）
    let keptTitle = "";
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { keptTitle = document.title; document.title = "( ˘･з･) 去哪了… · Aster"; }
      else if (keptTitle) document.title = keptTitle;
    });

    // 快捷键：T 换肤（在输入框里不生效）
    addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.key === "t" || e.key === "T") $("#theme-btn")?.click();
    });

    // Konami：↑↑↓↓←→←→BA → 樱吹雪 + 提示
    const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let pos = 0;
    addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === KONAMI[pos] ? pos + 1 : (k === KONAMI[0] ? 1 : 0);
      if (pos !== KONAMI.length) return;
      pos = 0;
      toast("樱吹雪 · コナミコマンド発動！");
      const theme = document.documentElement.dataset.theme || "light";
      let n = 0;
      const storm = setInterval(() => {
        burstAt(rand(0, innerWidth), rand(-20, innerHeight * .4), theme);
        if (++n > 14) clearInterval(storm);
      }, 90);
    });

    // 控制台署名
    try {
      console.log(
        "%c ✦ aster.blog %c 手写 HTML / CSS / JS，没有框架 \n%c快捷键：T 换肤 · Esc 关菜单 · ↑↑↓↓←→←→BA 有惊喜",
        "background:#2F55C9;color:#fff;padding:3px 8px;border-radius:4px 0 0 4px;font-weight:600",
        "background:#0B0F19;color:#7DD3FC;padding:3px 8px;border-radius:0 4px 4px 0",
        "color:#8B857B;font-size:11px"
      );
    } catch {}
  }

  /* ── 启动：脚本挂在 body 末尾，DOM 已齐，直接跑（不等 DOMContentLoaded，
     配合 <link rel="expect" blocking="render"> 让首帧就带内容，翻页快照不空） ── */
  const boot = () => {
    const booting = initBoot();
    initTheme();
    hydrate();
    initNav();
    renderFooter();

    if (page === "home") {
      renderHome();
      nameReturnTarget();
      initIdle();
      booting.then(() => typeMotd());   // 打字机等幕布揭开再开敲
    }
    if (page === "blog") { initBlogPage(); nameReturnTarget(); }
    if (page === "post") initPostPage();
    if (page === "projects") renderProjects();
    if (page === "about") renderAbout();
    if (page === "contact") renderContactPage();

    // 全站大标题：逐字上浮 + 离场触发器
    $$(".home-h1, .page-h1, .article-h1").forEach((el) => {
      splitChars(el);
      el.classList.add("fall-text");
    });
    initExitFx();

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (btn) { copyText(btn.dataset.copy, btn); return; }
      const nopeEl = e.target.closest("[data-nope]");
      if (nopeEl) dropX(e.clientX, e.clientY, nopeEl);
      const ext = e.target.closest('a[target="_blank"]');
      if (ext) openRing(ext.closest(".proj-card, .now-list li") || ext);
    });

    initPetals();
    if ((document.documentElement.dataset.theme || "light") === "green") initKomorebi();
    initPageTransitions();
    initClickFx();
    initTilt();
    initToys();
    addCopyButtons();
    initSpots();
    // 异步渲染的内容（正文、筛选列表、全文页）落地后补挂追光与复制按钮
    let moRaf = 0;
    new MutationObserver((ms) => {
      if (moRaf) return;
      if (!ms.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && !n.matches(".spot, .pre-copy, .click-ring, .nope-x, .cli-out, .cli-line")))) return;
      moRaf = requestAnimationFrame(() => { moRaf = 0; addCopyButtons(); initSpots(); });
    }).observe(document.body, { childList: true, subtree: true });
    // 看板娘让路：等主线程空闲再加载（内容/字体/壁纸优先）
    (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(() => initMusume());
    initEnergize();
  };
  if (document.readyState === "loading" && !document.body) document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
