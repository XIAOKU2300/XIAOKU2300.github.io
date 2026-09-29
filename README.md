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
- `assets/observatory/chapter-scene.js`：材质、摄影棚光照、章节变形和渲染调度。
- `assets/observatory/sculptures.js`：共用拓扑的倒角薄片，生成轨道、书页、构架、星芒、信号波五种姿态。
- `assets/observatory/quotes.js`：24 组原创中英文首页短句。
- `assets/observatory/scene.bundle.js`：供浏览器直接加载的压缩场景包。
- `assets/observatory/writer.js`：写作与发布逻辑。
- `assets/observatory/fonts.css`、`fonts/`：本地字体及 Unicode 分片。
- `assets/observatory/vendor/`：固定版本的本地依赖。

Three.js 与 GSAP 协调镜头、材质、轨道和排字。点击五个主栏目时，同一组几何薄片在约 1.65 秒内经过错时展开、空间转向、连续形变和收拢，成为对应栏目的抽象形体。新操作会从当前姿态接续。首页使用无裁切的斜体排字，按实际文字宽度适配不同短句。顶部 `MOTION ON/OFF` 控制动效，并记住用户选择。系统开启“减少动态效果”时默认静止。文章、文档和写作模式使用静止的低亮度背景；离开浏览器标签页时停止渲染。WebGL 不可用时显示二维替代图形，内容与导航仍可使用。

静态站点运行时没有外部 CDN 请求（用户主动访问外链、发布文章及原有独立作品除外）。三维材质与环境在代码中生成，无须加载外部模型或贴图。依赖版本和许可见 [DEPENDENCIES.md](assets/observatory/DEPENDENCIES.md)。

修改 `scene.js` 后，用 esbuild 0.25.10 重新生成场景包：

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
```

若 Playwright 已在当前 Node 环境安装，直接 `node tests/observatory.spec.mjs` 即可。可用 `BASE_URL` 指定预览地址。真实设备上的 GPU 性能与触控手感仍应在目标手机和电脑上体验。

### Reliability checks

`tests/resilience.spec.mjs` adds isolated browser checks for draft persistence, delayed document loads, hash history, keyboard navigation, storage failures, and long writer content. External requests are blocked; publishing scenarios use mocked GitHub responses only. Run both suites before committing UI or routing changes.

- Drafts are flushed when the page is hidden or left, as well as after the typing debounce. Storage failures are visible in the writer instead of silently discarding work.
- Publishing clears only the saved version that was submitted. Edits made while publishing remain an unpublished draft; tokens are excluded from drafts.
- Contents links preserve the current article DOM. Back navigation restores a saved position after document content and fonts load, rather than jumping back to an old heading.
- The mobile menu moves keyboard focus into navigation, makes background content inert, and restores focus on Escape. Its links remain scrollable in short landscape viewports.
- Writer columns contain long titles and code without widening the page.

Drafts are still local to the current browser, not a backup service. Copy important work before clearing browser storage. A local Git commit does not deploy the blog; deployment still requires an explicit push to the publishing branch.
