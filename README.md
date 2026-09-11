# Aster 的个人博客

一个纯静态的个人博客：没有框架、没有构建工具，双击 `index.html` 就能跑。
设计走「个人写作站」路线——霞鹜文楷 + 冷调纸白 + 群青蓝，首页是一块会打字的
终端登录横幅；页面间有转场动画，主题按钮是从点击处圆形扩散换肤的。

## 快速开始

- **本地预览**：双击 `index.html`（或用 VS Code 的 Live Server）
- **修改内容**：只改 **`assets/js/data.js`** 这一个文件
- **发布上线**：推到 GitHub 开 GitHub Pages，或拖进 Vercel / Netlify

## 文件结构

```
personal/
├── index.html            首页：登录横幅（MOTD）+ 自我介绍 + 最近文章 + 在折腾的
├── blog.html             文章列表：分类筛选 + 按年分组
├── post.html             文章详情（模板页，通过 ?slug=文章标识 打开）
├── projects.html         折腾清单
├── about.html            关于我：自述 + 会用的东西 + 这几年 + 联系方式
├── contact.html          联系：邮箱 / QQ（点击复制）
└── assets/
    ├── css/style.css     设计系统（变量、排版、深色模式、响应式）
    ├── js/data.js        ★ 全站内容都在这里，你只改这个文件
    ├── js/main.js        渲染与交互（一般不用动）
    └── images/           头像、项目截图等图片
```

## 怎么改内容（都在 `assets/js/data.js`）

| 想改什么 | 改哪里 |
|---|---|
| 名字 / 年级 / 邮箱 / QQ / 首页自我介绍 | `profile` |
| 首页终端横幅的台词 | `motd` |
| 社交链接（GitHub 已填真实地址；留空自动隐藏） | `socials` |
| 首页「在折腾的」清单（icon 选图标；link 填了就可点击，没填的点了会掉个 ×） | `now` |
| 项目清单（icon 选图标；link 填了显示「项目地址」，没填的点击会掉个 ×） | `projects` |
| 文章 | `posts`（见下） |
| 关于页的自述、技能、时间线、小声说 | `about` |
| 页脚小字 | `footerNote` |

图标可选值（在 `assets/js/main.js` 的 ICONS 里定义，可自己加）：
`sparkle` AI · `server` 服务器 · `gamepad` 游戏 · `audio` 音频 ·
`palette` AI 绘画 · `robot` 机器人 · `network` 网络 · `cube` Minecraft ·
`mail` / `qq` / `bilibili` / `github` 联系方式 · `sakura` 樱花

### 写一篇新文章

打开 `data.js` 的 `posts` 数组，复制一段示例改内容，追加到末尾：

```js
{
  slug: "my-new-post",        // 英文短横线，全站唯一
  title: "文章标题",
  category: "自托管",          // 分类随缘起，筛选器自动生成
  date: "2026-09-10",
  readTime: 8,
  summary: "列表页显示的一句话摘要。",
  tags: ["Docker", "NAS"],
  body: `
    <p>正文段落，支持 <b>加粗</b>。</p>
    <h2>小标题</h2>
    <ul><li>列表项</li></ul>
    <pre><code>代码块</code></pre>
    <blockquote>引用</blockquote>`
}
```

保存刷新，列表、筛选、归档、上一篇/下一篇全部自动更新。
现在 `posts` 里共 7 篇（6 篇方向示例 + 1 篇架构剖析），按需替换。
正文里还能用这些增强标记：
- `<mark>重点句</mark>` —— 蓝色荧光划线，随滚动划入
- `<span class="term" tabindex="0" data-tip="名词解释">术语</span>` —— 虚线名词，悬停/聚焦弹出注释气泡
- `<div class="facts"><div class="fact"><b>数字</b><span>说明</span></div>…</div>` —— 数据卡

### 放图片 / 换头像

图片丢进 `assets/images/`，在文章 `body` 里用
`<img src="assets/images/xxx.jpg" alt="">` 引用即可。

## 设计说明

- **字体**：标题 Noto Serif SC 700/900，正文系统黑体，元数据 JetBrains Mono。全部走 jsDelivr 的 @fontsource CDN（国内可达），按 unicode-range 分片加载，离线时回退系统字体
- **配色**：三套主题一键循环——浅色（纸白 `#F6F6F4` + 群青蓝）/ 深色（墨黑）/ **猛男粉**（樱色纸面 `#FFF1F5` + 玫瑰粉，二次元浓度全开），切换有圆形扩散转场和花瓣爆发，自动记忆
- **动效**：页面切换淡入转场、主题按钮圆形扩散换肤、首屏直接就位 + 滚动显现、
  悬停时标题下划线生长、列表项交错入场、MOTD 打字机；
  全部尊重系统「减弱动态」设置，不支持的浏览器自动降级不闪烁
- **日式点缀**：全站樱花飘落（canvas 绘制，低调不挡内容）、首页竖排日文
  「昼は学生、夜はオタク。」、关于页 GitHub 头像与「アスター」樱花色小注、
  文章 404 页「迷子になっちゃった…」
- **无障碍**：键盘焦点可见、语义化标签、对比度达标
