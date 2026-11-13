# Aster · A personal observatory

一个关于技术、声音与微小发现的个人博客。深空青瓷配色，Newsreader 与中文宋体/黑体搭配，Three.js 实体材质结合 SVG 与文字动效。内容保存在 `assets/js/data.js`。

## 本地预览

在项目根目录运行：

```sh
python3 -m http.server 4173
```

打开 `http://localhost:4173`。页面使用 JavaScript 模块与本地文档请求，需通过 HTTP 服务访问。

GitHub Pages、Netlify 等静态托管可以直接发布当前目录，无需服务器或线上构建步骤。

## 页面与内容

| 路径 | 内容 |
| --- | --- |
| `index.html` | 私人观测站：首页星仪、近期文章、精选项目和兴趣 |
| `blog.html` | 文章目录：分类与全文标题/摘要/标签检索 |
| `post.html?slug=…` | 文章、章节目录、代码复制、相邻文章 |
| `projects.html` | 软件、基础设施、声音与硬件项目 |
| `about.html` | 个人介绍、工具箱、时间线和东方兴趣 |
| `contact.html` | GitHub、邮箱和 QQ |
| `doc.html` | EchoMatrix 全量架构报告 |
| `write.html` | Markdown/HTML 写作、预览、草稿与 GitHub 发布 |
| `gov.html` | 原有政务版，作为另一条世界线保留 |
| `poem/`、`demo/` | 原有独立诗歌与图形作品 |

文章数据、原有链接和独立作品保持兼容。核心页面使用真实 HTML 路径；站内切换复用同一个 3D 场景，并支持浏览器前进/后退。

## 修改内容

编辑 `assets/js/data.js`：

- `profile`：个人资料和介绍。
- `socials`：社交链接；未配置的链接不显示。
- `projects`：项目名称、描述、状态、分类与链接。
- `posts`：文章列表；每篇文章需要唯一的 `slug`。
- `about`：自述、兴趣、工具箱、时间线和联系说明。

首页精选项目和声音专题在 `assets/observatory/site.js`；24 组原创中英短句在 `assets/observatory/quotes.js`。每次回到首页或点击「换一句」会抽取下一组，整组用完前不重复。文章列表按日期排序，分类和搜索结果自动生成。

新增文章示例：

```js
{
  slug: "my-new-post",
  title: "文章标题",
  category: "自托管",
  date: "2026-09-29",
  readTime: 5,
  summary: "列表页显示的摘要。",
  tags: ["Docker", "NAS"],
  body: `<p>正文内容。</p><h2>一个小节</h2><p>继续写。</p>`
}
```

正文支持常见 HTML、SVG 架构图、代码块、`mark`、带 `data-tip` 的 `.term` 术语解释，以及 `.facts` 数据展示。呈现前经过 DOMPurify 处理，脚本和事件属性不会执行。

## 设计与动效

- `assets/observatory/observatory.css`：布局、深空配色、中英排字和移动端适配。
- `assets/observatory/site.js`：页面呈现、路由、搜索、目录及二维 MG 动效。
- `assets/observatory/scene.js`：三维场景构建入口。
- `assets/observatory/chapter-scene.js`：材质、摄影棚光照、章节变形、指针交互和渲染调度。
- `assets/observatory/sculptures.js`：共用拓扑的倒角薄片，生成轨道、书页、构架、星芒、信号波五种姿态。
- `assets/observatory/cosmos.js`：深空星野、星云，以及五圈持续运转的巨大装置环、刻度与卫星，并有约 40 秒一次的加速事件。
- `assets/observatory/overlay.js`：覆盖整页的仪表层——细网格、边缘标尺、角标、瞄准环、遥测灯、雷达扇面、横扫光带，以及可连续叠加的光圈脉冲。
- `assets/observatory/boot.js`、`boot.css`：首页开场序列（约 9.5 秒，六拍：点火、穹顶开缝、四片带棱面的星刃翻滚对接成立体星、陀螺环仪翻转归位并坍缩、带厚度的 ASTER 字标逐笔敲出、镜头穿过字标后溶解；全程无闪烁，立体部分用 2D canvas 自行投影着色，不依赖 WebGL；每个浏览器会话只播一次，点击或任意键跳过；系统减少动态效果或站内关闭动效时不播放）。结束后无缝交给 3D 场景的轮廓遮罩。地址加 `?boot` 可强制重播，`?boot&bootframe=90` 定格在第 90 帧便于调试。
- `assets/observatory/quotes.js`：24 组原创中英文首页短句。
- `assets/observatory/scene.bundle.js`：供浏览器直接加载的压缩场景包。
- `assets/observatory/writer.js`：写作与发布逻辑。
- `assets/observatory/fonts.css`、`fonts/`：本地字体及 Unicode 分片。
- `assets/observatory/vendor/`：固定版本的本地依赖。

Three.js and GSAP coordinate the sculpture, chapter transitions, and typography. The same ten ribbons morph between five chapter shapes over approximately 1.85 seconds; interrupted navigation continues from the current geometry. Once settled, each chapter retains gentle rocking and breathing, with restrained page, petal, or wave movement. The homepage phrase changes automatically on each return, using a non-repeating 24-phrase deck; there is no manual quote button.

The decorative orbit loader stays inside the artwork region, never covering or disabling content; the later full-page transition lives in the same non-interactive background layer, so it darkens only the background and never the text. Fonts load separately from critical layout CSS; late font completion refits the current headline. Scene creation yields between geometry batches, prepares only the initial chapter before first render, and warms other shapes later. The canvas fades in after rendering. Failed downloads and unavailable WebGL leave a static fallback; a slow download can still complete after the loader becomes quiet.

Rounded bevels use 168 longitudinal segments and six samples per corner, with separate outward-facing end caps. Broad studio reflections and smoother ceramic/brass materials replace transmission and high-frequency surface noise. Rendering caps pixel density, steps quality down after sustained slow frames (fine grid and reticles first, then pixel density, then the apparatus drift), and avoids continuous rendering on reading routes, in hidden tabs, or when the sculpture is offscreen. `MOTION ON/OFF` remembers the explicit preference; system reduced motion defaults to a still scene and disables the loader animation. WebGL context loss returns to the fallback without interrupting navigation.

The background is a place rather than a backdrop. A deterministic deep field is arranged as a galaxy with a warmer galactic band, three soft additive nebulae sit behind the sculpture, and five enormous rings turn on their own slow periods at radii far larger than the viewport, so only an arc is ever in frame; graduated ticks mark two of them and travelling nodes run the outer two forever. Every forty seconds the whole apparatus runs hot — the rings spin up and the field brightens — then settles. Everything shares the sculpture's clock and easing, so the machine reads as one instrument rather than layered effects.

A second pass covers the entire viewport in the same canvas: a fine drifting grid with major divisions, graduated rulers along all four edges, corner brackets, targeting reticles, a telemetry row, a radar fan, a band of light that crosses the page once per cycle and drags a brightening of the deep field with it, and aperture rings that open outwards from the sculpture. The pass thins out inside the text column so the copy stays legible, each chapter tints it slightly, and the aperture is a four-slot buffer: a new pulse overlaps one still opening instead of snapping it back to the centre.

The loading transition is performed by the sculpture itself. A dark veil sits in its own layer above the page and below the header, so it genuinely covers the content; it opens from a single point at the instrument's centre, widens to exactly the model's settled silhouette as the ribbons finish forming, and keeps opening until it has swallowed the page. The silhouette is taken from every vertex of every ribbon's surface, projected through the same camera as the HUD, closed into a smooth spline and feathered, so the hole matches the shape on screen with a soft edge. Reduced motion, reading routes and a paused scene skip it entirely.

The sculpture is directly grabbable on two axes: dragging turns it about the camera's own up and right axes with inertia on both, the wheel and a two-finger pinch zoom it, and a press that never became a drag answers with a full-page aperture pulse. When a visitor leaves a turned model behind — by scrolling away from the top of the homepage or by changing page — the pose and the zoom ease back to neutral and a wave marks the return. Idle behaviour differs per chapter: the armillary drifts, the pages breathe, the lattice keeps orbiting atoms of its own, and exposure, polish, reflectivity and light temperature drift by a few percent, so sections read as one machine changing mode. Solid ribbon materials are pushed back a fraction of a depth unit and engraving lines never write depth, so drawn lines no longer tear or flicker against the surfaces they belong to; the reticle, apparatus rings and nebulae follow the same rule.

静态站点运行时没有外部 CDN 请求（用户主动访问外链、发布文章及原有独立作品除外）。三维材质与环境在代码中生成，无须加载外部模型或贴图。依赖版本和许可见 [DEPENDENCIES.md](assets/observatory/DEPENDENCIES.md)。

After changing `scene.js`, `chapter-scene.js`, `sculptures.js`, `cosmos.js`, or `overlay.js`, regenerate the browser bundle with esbuild 0.25.10:

```sh
esbuild assets/observatory/scene.js --bundle --minify --format=esm --target=es2020 --legal-comments=inline --outfile=assets/observatory/scene.bundle.js
```

本机开发工具安装在 `/data/aster/work/aster-observatory-tools`，浏览器工具位于 `/data/aster/work/ui-tools`，缓存位于 `/data/aster/cache`。

## 写作与发布

打开 `write.html` 即可写作，草稿自动保存在当前浏览器。可复制文章片段，手动加入 `data.js`。

发布到 GitHub 需要只授权本仓库 **Contents: Read & Write** 的 fine-grained token。Token 仅在主动点击“记住在这台电脑”时持久保存，不写入文章草稿或仓库。发布先读取远程文件和 SHA，检查重复 slug，再创建内容提交；仓库发生冲突时会提示重试。

发布仍写入 `XIAOKU2300/XIAOKU2300.github.io` 的 `main` 分支。应先把本次设计发布到该分支，再使用线上写作入口。

## 验证

`tests/observatory.spec.mjs` 使用 Playwright，覆盖核心路由、搜索筛选、目录、代码复制、未知文章、草稿恢复、HTML 预览隔离、手机布局、历史位置、连续导航、五种形体切换、24 组短句不重复及窄屏斜体完整显示。发布接口全部拦截为模拟响应，不会向 GitHub 写入任何内容。

先启动上述 HTTP 服务，再运行：

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/observatory.spec.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/resilience.spec.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/scene-loading.spec.mjs
node tests/sculptures.spec.mjs
```

若 Playwright 已在当前 Node 环境安装，直接 `node tests/observatory.spec.mjs` 即可。可用 `BASE_URL` 指定预览地址。真实设备上的 GPU 性能与触控手感仍应在目标手机和电脑上体验。

### Reliability checks

`tests/resilience.spec.mjs` adds isolated browser checks for draft persistence, delayed document loads, hash history, keyboard navigation, storage failures, and long writer content. External requests are blocked; publishing scenarios use mocked GitHub responses only. `tests/scene-loading.spec.mjs` holds back font and scene requests, verifies fallback/recovery, and observes actual WebGL transform uploads and draw calls to check idle motion and suspension. It saves desktop/mobile screenshots in a temporary directory. `tests/sculptures.spec.mjs` checks all fifty meshes for matching topology, finite unit normals, bounded vertices, and outward cap normals. Run all four suites before committing scene, UI, or routing changes.

- Drafts are flushed when the page is hidden or left, as well as after the typing debounce. Storage failures are visible in the writer instead of silently discarding work.
- Publishing clears only the saved version that was submitted. Edits made while publishing remain an unpublished draft; tokens are excluded from drafts.
- Contents links preserve the current article DOM. Back navigation restores a saved position after document content and fonts load, rather than jumping back to an old heading.
- The mobile menu moves keyboard focus into navigation, makes background content inert, and restores focus on Escape. Its links remain scrollable in short landscape viewports.
- Writer columns contain long titles and code without widening the page.

Drafts are still local to the current browser, not a backup service. Copy important work before clearing browser storage. A local Git commit does not deploy the blog; deployment still requires an explicit push to the publishing branch.
