/* ════════════════════════════════════════════════════════════
   Aster 的博客 · 数据配置（全站内容都在这一个文件里）
   改完保存刷新即可，不用碰 HTML/CSS。
   正文 body 支持 <h2> <p> <b> <ul><li> <pre><code> <blockquote>，
   代码块里 <span class="tok-k"> 等是语法配色，嫌麻烦可以不写。
   ════════════════════════════════════════════════════════════ */

const SITE = {

  siteName: "Aster",

  /* ── 个人资料 ─────────────────────────────────────────── */
  profile: {
    name: "Aster",
    grade: "高二在读",
    location: "中国",
    email: "fandashabi26@gmail.com",
    qq: "1982975523",
    status: "深夜折腾中",
    /* 首页终端的运行时长从这一刻起算（北京时间 ISO 写法，想改开站时刻就改这里） */
    uptimeSince: "2026-09-06T00:00:00+08:00",
    /* 首页开头那段自我介绍 */
    intro: "平时折腾 NAS、Docker、Minecraft 服务器和 ComfyUI，给鸣潮写过查分 Bot，给 Yunzai 写过插件，Hi-Fi 也玩了两年。这个站放我写的教程和踩坑记录。写下来主要是怕自己忘，要是恰好帮到了你，那更好。"
  },

  /* ── 首页终端横幅（MOTD），一行一行打出来 ────────────────── */
  motd: [
    { c: "cmd", t: "$ ssh aster@blog" },
    { c: "out", t: "Welcome to aster.blog", dot: true },
    { c: "cmd", t: "$ systemctl status zhengteng" },
    { c: "ok", t: "● active — NAS · MC服 · 查分Bot · Hi-Fi", dot: true },
    { c: "cmd", t: "$ uptime" },
    { c: "out", t: "load average: 作业 3.0，折腾 2.7，睡眠 0.5" }
  ],

  /* ── 社交链接（url 留空就不显示）────────────────────────── */
  socials: [
    { label: "GitHub",   icon: "github",   url: "https://github.com/XIAOKU2300" },
    { label: "B站",      icon: "bilibili", url: "" },                        // ← 填你的 B 站主页
    { label: "邮箱",     icon: "mail",     url: "mailto:fandashabi26@gmail.com" },
    { label: "QQ",       icon: "qq",       copy: "1982975523" }
  ],

  /* ── 首页「在折腾的」清单（icon 见 main.js 图标库；
     link 填了就能点进去，没填的点了会掉个 × 表示互动不了）───── */
  now: [
    { icon: "palette", name: "WineFox Desktop",
      tone: "bot", status: "主力开发",
      note: "Windows 本地 ComfyUI 工作流和 LoRA 客户端，我折腾 AI 绘画的主阵地。",
      link: "https://github.com/XIAOKU2300/WineFoxDesktop" },
    { icon: "gamepad", name: "鸣潮查分 Bot",
      tone: "bot", status: "在跑",
      note: "群友 @ 一下就能查分。版本一更新就得跟着调权重，算是长期饭碗。" },
    { icon: "cube", name: "Minecraft NeoForge 服",
      tone: "sys", status: "稳定运行",
      note: "三十来个模组，和同学一起玩。TPS 暂时很稳，立此存照。" },
    { icon: "server", name: "fnOS NAS",
      tone: "sys", status: "在跑",
      note: "Jellyfin、qBittorrent、图床，十几个容器 24 小时连轴转。" },
    { icon: "robot", name: "Yunzai 机器人", status: "越加越多",
      note: "Nikke 查询、B 站开播提醒、复读机，群里点单就写。",
      link: "https://github.com/XIAOKU2300/YunzaiPlughin" },
    { icon: "audio", name: "Hi-Fi 小摊", status: "持续入坑",
      note: "foobar 独占输出，暖声党，DSD 仓鼠，兼职频谱鉴定师。" }
  ],

  /* ── 项目清单（status 随便写；icon 见 main.js 图标库；
     link 填仓库或演示地址，留空则不显示链接）────────────────── */
  projects: [
    {
      icon: "palette",
      name: "WineFox Desktop",
      tone: "bot",
      status: "主力开发",
      year: "2026",
      desc: "Windows 本地的 ComfyUI 工作流和 LoRA 客户端。我折腾 AI 绘画的主阵地，也是目前 star 数最高的仓库。",
      tags: ["Python", "ComfyUI", "LoRA"],
      stars: 8,
      link: "https://github.com/XIAOKU2300/WineFoxDesktop"
    },
    {
      icon: "gamepad",
      name: "鸣潮查分 Bot",
      tone: "bot",
      status: "在跑",
      year: "2025",
      desc: "自建的角色评分 API 加查询 Bot。数据自己抓，权重自己写，版本自己跟。群里 @ 一下就能查分。",
      tags: ["Python", "API", "Bot", "权重脚本"],
      link: ""
    },
    {
      icon: "cube",
      name: "Minecraft NeoForge 服",
      tone: "sys",
      status: "稳定运行",
      year: "2025",
      desc: "从零开的模组服，跑了一年左右。性能调优、模组取舍、自动备份，踩过的坑都写成了文章。",
      tags: ["Java", "NeoForge", "服务端运维"],
      link: ""
    },
    {
      icon: "server",
      name: "fnOS NAS",
      tone: "sys",
      status: "在跑",
      year: "2024",
      desc: "旧机器装飞牛 fnOS，上面跑着影视库、下载机、密码管理、图床，全家人的数据都在这台机器上。",
      tags: ["fnOS", "Docker", "NAS"],
      link: ""
    },
    {
      icon: "robot",
      name: "Yunzai 插件合集",
      tone: "bot",
      status: "随缘更新",
      year: "2025",
      desc: "给 YunzaiBot 写的自用插件：Nikke 数据查询、B 站开播提醒、复读机，基本都是群里点单的产物。",
      tags: ["JavaScript", "Yunzai", "Bot"],
      link: "https://github.com/XIAOKU2300/YunzaiPlughin"
    },
    {
      icon: "sparkle",
      name: "AI 工具链",
      tone: "bot",
      status: "越加越多",
      year: "2026",
      desc: "Agent 加 MCP 加 TTS 加邮件自动化。一开始只想省点事，后来停不下来了。",
      tags: ["AI Agent", "MCP", "TTS"],
      link: ""
    },
    {
      icon: "network",
      name: "Clash 分流",
      tone: "sys",
      status: "随缘更新",
      year: "2024",
      desc: "全家设备的分流规则和配置管理。理顺之后基本没再动过。",
      tags: ["Clash", "网络", "分流规则"],
      link: ""
    },
    {
      icon: "audio",
      name: "Hi-Fi 播放系统",
      tone: "hw",
      status: "一直折腾",
      year: "2025",
      desc: "foobar2000 独占输出加 DAC。DSD 音源管理、升频检测、真伪 Hi-Res 鉴定，交过的学费不少。",
      tags: ["Hi-Fi", "foobar2000", "DAC"],
      link: ""
    }
  ],

  /* ── 文章（新增一篇就复制一段改内容，追加到后面即可）──────── */
  posts: [
    {
      slug: "xw-echo-matrix-arch",
      title: "XutheringWavesUID（EchoMatrix）技术架构全解 · 精编",
      category: "源码剖析",
      date: "2026-09-05",
      readTime: 15,
      summary: "325 个文件、8.5 万行 Python 的鸣潮机器人插件是怎么造出来的：分层、反爬、凭据、伤害计算与工程取舍。附 19 章完整版全文入口。",
      tags: ["XutheringWavesUID", "EchoMatrix", "鸣潮", "gsuid_core", "源码剖析"],
      body: `
<div class="facts">
  <div class="fact"><b>325</b><span>个 Python 文件</span></div>
  <div class="fact"><b>8.5万+</b><span>行 Python</span></div>
  <div class="fact"><b>33</b><span>个功能模块</span></div>
  <div class="fact"><b>19</b><span>章全量架构报告</span></div>
</div>
<p>上一篇解剖了 ComfyUI 绘图插件，这次轮到体量大得多的家伙：<b>XutheringWavesUID</b>（品牌名 EchoMatrix，版本 3.6.0bNewBee）——一个跑在 QQ 机器人框架里的鸣潮数据查询插件。我把全量源码读了一遍，写成了一份 19 章、2042 行的架构报告，<a class="proj-link" href="doc.html">完整版全文在站内这里在线阅读</a>，所有引用都标注到文件与行号。下面是精编版，挑主干讲。</p>
<h2>它是谁：一个长得像「库」的插件</h2>
<p>用户在群里发「查角色 莫特斐」或「mr」（每日体力），机器人调<span class="term" tabindex="0" data-tip="库洛游戏的社区 API，国服数据的唯一正式来源">库街区（KuroBBS）</span>拿到账号数据，算伤害、算评分、渲染成图片发回群里。它不是独立程序，而是 <span class="term" tabindex="0" data-tip="多平台机器人框架，脱胎于原神 UID 插件生态，负责协议接入、消息路由、数据库基座">gsuid_core</span> 的插件——协议接入、消息路由、HTTP 服务、数据库基座全部由宿主提供，插件只负责游戏逻辑。<mark>它长得像一个「库」，而不是一个「应用」。</mark></p>
<p>体量：Python 325 个文件、84,859 行，HTML 模板 35 个、18,808 行。最大的文件是角色面板渲染（<code>draw_char_card.py</code>，2896 行）和 122 个武器 buff 类（<code>register_weapon.py</code>，2256 行）。技术栈一句话：SQLModel 做数据，aiohttp/httpx 做网络，<span class="term" tabindex="0" data-tip="无头浏览器自动化，这里用来把 HTML 截成图片">Playwright</span> 和 <span class="term" tabindex="0" data-tip="Python 图像处理库，用来手工画渲染降级图">PIL</span> 双轨渲染，FastAPI 做内嵌 Web。</p>
<p>内部结构分两类：约 70 个文件的 <code>utils/</code> 横向基础设施（API 客户端、伤害计算、渲染、缓存），加 33 个 <code>wutheringwaves_*</code> 功能目录——目录即模块，模块即功能，这是 gsuid_core 插件生态的惯例。</p>
<h2>一张总架构图</h2>
<svg class="arch" viewBox="0 0 780 616" role="img" aria-label="XutheringWavesUID 总架构图">
  <defs>
    <marker id="aB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--blue)"/></marker>
    <marker id="aS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--sakura)"/></marker>
  </defs>
  <rect x="250" y="14" width="280" height="42" rx="21" class="pill"/>
  <text x="390" y="41" text-anchor="middle" class="t" style="font-size:14px">QQ · TG · KOOK …消息入口</text>
  <path d="M390 56 V94" class="flow" marker-end="url(#aB)"/>
  <text x="404" y="80" class="lbl">ww / qy 前缀命令</text>

  <rect x="120" y="96" width="540" height="58" rx="12" class="box acc"/>
  <text x="390" y="121" text-anchor="middle" class="t">gsuid_core 宿主</text>
  <text x="390" y="143" text-anchor="middle" class="s">协议接入 · 命令路由 · 消息发送 · FastAPI :8765 · 定时器</text>

  <path d="M300 154 L115 202" class="flow" marker-end="url(#aB)"/>
  <path d="M390 154 L301 202" class="flow" marker-end="url(#aB)"/>
  <path d="M480 154 L487 202" class="flow" marker-end="url(#aB)"/>
  <path d="M660 132 H673 V202" class="link"/>

  <rect x="30" y="204" width="170" height="64" rx="10" class="box"/>
  <text x="115" y="231" text-anchor="middle" class="t">33 个功能模块</text>
  <text x="115" y="253" text-anchor="middle" class="s">面板·体力·深塔·抽卡</text>
  <rect x="216" y="204" width="170" height="64" rx="10" class="box"/>
  <text x="301" y="231" text-anchor="middle" class="t">dps 排轴 Web</text>
  <text x="301" y="253" text-anchor="middle" class="s">FastAPI 路由 · CAS</text>
  <rect x="402" y="204" width="170" height="64" rx="10" class="box"/>
  <text x="487" y="231" text-anchor="middle" class="t">ai_rag 知识库</text>
  <text x="487" y="253" text-anchor="middle" class="s">知识 / 工具注册</text>
  <rect x="588" y="204" width="170" height="64" rx="10" class="box"/>
  <text x="673" y="231" text-anchor="middle" class="t">AI Core</text>
  <text x="673" y="253" text-anchor="middle" class="s">宿主内置 · 向量库</text>
  <path d="M572 236 H586" class="back" marker-end="url(#aS)"/>

  <path d="M115 268 V342" class="flow" marker-end="url(#aB)"/>
  <text x="124" y="312" class="lbl">查询</text>
  <rect x="120" y="344" width="250" height="64" rx="10" class="box acc"/>
  <text x="245" y="371" text-anchor="middle" class="t">waves_api 请求层</text>
  <text x="245" y="393" text-anchor="middle" class="s">代理 · 对冲竞速 · 验证码</text>
  <rect x="430" y="344" width="250" height="64" rx="10" class="box"/>
  <text x="555" y="371" text-anchor="middle" class="t">utils 横向层</text>
  <text x="555" y="393" text-anchor="middle" class="s">伤害计算 · 渲染 · 缓存</text>
  <path d="M370 376 H428" class="flow" marker-start="url(#aB)" marker-end="url(#aB)"/>
  <text x="399" y="366" text-anchor="middle" class="lbl">面板/参数</text>

  <path d="M180 408 V466" class="flow" marker-end="url(#aB)"/>
  <text x="192" y="442" class="lbl">请求 · 反爬 · 代理</text>
  <rect x="60" y="468" width="320" height="64" rx="10" class="box"/>
  <text x="220" y="495" text-anchor="middle" class="t">上游数据源</text>
  <text x="220" y="517" text-anchor="middle" class="s">KuroBBS · SDK · 云鸣潮 · 镜像站</text>
  <rect x="450" y="468" width="320" height="64" rx="10" class="box"/>
  <text x="610" y="495" text-anchor="middle" class="t">rank_server 排行服务</text>
  <text x="610" y="517" text-anchor="middle" class="s">FastAPI + SQLModel · 可自建</text>
  <path d="M555 408 V466" class="back" marker-start="url(#aS)" marker-end="url(#aS)"/>
  <text x="567" y="442" class="lbl">评分上传 / 榜单查询</text>

  <path d="M40 580 H88" class="flow" marker-end="url(#aB)"/>
  <text x="98" y="584" class="lbl">消息 / 查询主干</text>
  <path d="M300 580 H352" class="back" marker-end="url(#aS)"/>
  <text x="362" y="584" class="lbl">数据回流 · 注入</text>
  <text x="640" y="584" class="lbl">白底盒 = 宿主提供</text>
</svg>
<p>三条主干：消息主干（命令进、图片出，中途过凭据与反爬）、Web 主干（排轴编辑器、登录页共用宿主的 FastAPI）、数据回流主干（面板算分上传排行服务，统计接口又反过来供持有率和排轴消费）。</p>
<h2>四个贯穿全项目的设计判断</h2>
<p><b>双实现降级。</b>几乎所有出图功能都有两份实现：HTML 版走 Jinja2 加 Playwright 截图，<span class="term" tabindex="0" data-tip="Python 图像处理库，这里用于降级手绘卡片">PIL</span> 版纯手工画，配置项决定走哪条、失败自动落回。动机写在注释里：Playwright 加 Chromium 对 1 核 2G 的服务器太重。代价是每张卡片维护两套布局代码。</p>
<p><b>API 优先加本地回退。</b>评分、模板、角色列表全是「先请求远程 API，失败退回本地硬编码」。有个真实的坑：默认评分地址是作者的内网 IP，普通部署连不上，每次查询白等 3 秒才落回本地。</p>
<p><b>自建 Chromium 池。</b>宿主自带的渲染工具每次开新页面都要全量重载 CJK 字体（1.36 秒），页面池复用后降到 0.08 秒；渲染机的网络还要和反爬代理隔离，防止代理抖动打垮出图。<mark>600 多行的渲染管理，本质是在插件里重造了半个无头浏览器运维层</mark>——但在那个部署环境里，这是最优解。</p>
<span class="scribble">（拆到这段的时候，我想起自己那个没做防注入的查分 Bot，回头连夜补了三行 try。）</span>
<p><b>防御性写法密集。</b>删 URL 防注入、错误文案永不回显用户输入、损坏 JSON 拒绝覆盖、维护中不误杀 cookie、国际服凭据不进国服校验链避免被误标失效。多处注释直接记录了线上事故现场——作者被真实故障教育过。</p>
<h2>反爬对抗：请求层是工程密度最高的部分</h2>
<p>上游分四类：国服走库街区、国际服走官方 SDK（抓包 PC 启动器得到的内置凭据加 MD5 摘要换位混淆签名）、抽卡走云鸣潮、排行走第三方服务。请求层 300 多行的必经之路里塞了六层逻辑：调用方识别、代理超时预算、业务码重试（重试前换代理出口，退避加随机抖动防雪崩）、响应解析兜底、<span class="term" tabindex="0" data-tip="极验滑块验证码，遇到时换出口或调打码服务">geeTest 验证码</span>应对、异常分类。</p>
<p>最有意思的是<span class="term" tabindex="0" data-tip="主请求超时未返回时，并发再发一个备用请求，谁先返回有效结果用谁的">对冲请求（hedged request）</span>：角色详情这个反爬最重的接口，主出口超过 800 毫秒（加 15% 抖动）没返回，就自动从第二个代理出口并发竞速，信号量封顶防压力翻倍。<mark>这说明该接口在代理质量差时超时率高到值得为它单独造一套机制。</mark></p>
<p>验证码体系是个插件化框架，但对接打码平台的实现目前已被禁用返回 None——实际的对抗手段是换出口、换代理、绕过去，框架留着等可用的打码服务。</p>
<h2>凭据与数据库：把 token 当成有生命周期的对象</h2>
<p>四条登录路径（网页短信、群聊直发、国际服邮箱、云鸣潮）共享一套一次性会话基础设施：3 分钟有效的会话 token、落盘缓存防多进程丢状态、发新链接前撤销旧会话。凭据落库后有三层治理：<b>被动标记</b>（请求层发现 token 失效就地标无效）、<b>主动巡检</b>(查询前验登录态，失效先自动续期)、<b>定时清淤</b>（每日清理无效凭据，42 天不活跃的用户从绑定里摘除）。</p>
<p>数据库 9 张表，最值得学的是<span class="term" tabindex="0" data-tip="启动和插件热重载时自动对比模型与实表，缺列就自动生成 ALTER 语句补上">双轨迁移</span>：一次性大迁移走启动前的 SQL 清单，日常加列走自动对比补列的 auto_migrate——因为宿主支持插件热重载，热重载不会重跑启动清单，模型加了新列而实表没有，全表查询直接报错。活跃度统计还有个「防自污染」细节：公告推送会触发活跃钩子，推送流量自己证明自己活跃，解法是用 ContextVar 在推送期间置位跳过。</p>
<h2>伤害计算：398 个手写类与一条数据驱动路线</h2>
<p>鸣潮的数值系统很复杂：六维属性、五件声骸主副词条、武器谐振、命座、六种元素效应、队伍 buff。面板聚合是三段流水线（声骸求和 → 白值合成 → 全量叠加），核心伤害公式展开是七个乘区相乘，抗性还是分段函数（负抗减半生效、高抗递减收益）。</p>
<p>buff 侧是 <b>398 个手写注册类</b>（53 角色 + 122 武器 + 223 声骸），配合一个精巧设计：<span class="term" tabindex="0" data-tip="访问未定义方法时自动拦截生成，这里用于即调即有地创建新乘区">动态方法生成</span>——注册器里调 <code>attr.add_夜归重激()</code> 这种新乘区时不用回头改核心类，即调即有，每个 buff 调用还带说明记进效果日志，伤害数字从黑盒变成可解释的过程。</p>
<p>另一条路线是数据驱动：从第三方数据站抓技能倍率（要动态穿透四层混淆的 chunk 才能找到真数据），命座效果用白名单正则从中文描述里抽取。<mark>设计哲学写在 docstring 里：只应用能确定指向当前动作的直接规则，其余诚实标注「这条命座我没能算进去」——宁可少算不可错算。</mark></p>
<h2>我的评价</h2>
<p>最打动我的还是它对失败路径的想象力：OOM、黑屏、LoRA 缺失、节点缺失、队列消失……不对，这是上一篇的台词。这一篇的关键词是<b>对抗</b>：风控、验证码、代理熔断、凭据续期、镜像测速——每一层上游不可控，它就往下多垫一层保险。代价是 8.5 万行里相当比例在「绕」，以及两套版本号、三个 tmp 脚本没清理这类演化痕迹。</p>
<p>但站在它的真实场景里——一个人维护、用户是 QQ 群里的玩家、上游接口随时变脸、部署环境从树莓派到独立服务器都有——<mark>这种带着完整对抗体系的「活体」，比教科书式的整洁值钱得多。</mark>二次开发的话，先读第十八章的指南，别急着动 <code>main.py</code>。</p>
<p>完整版 19 章在此：<a class="proj-link" href="doc.html">XutheringWavesUID 技术架构全解（全文）</a>——含端到端链路走查、二次开发指南和九个附录。</p>`
    },
    {
      slug: "astrbot-comfyui-arch",
      title: "astrbot_plugin_comfyui_pro_UltraPlusMax 技术架构剖析",
      category: "源码剖析",
      date: "2026-09-05",
      readTime: 22,
      summary: "5.6 万行 Python、1175 个方法的 QQ 绘图插件是怎么造出来的：分层设计、LoRA 档案匹配、失败路径想象力和工程取舍。",
      tags: ["AstrBot", "ComfyUI", "LoRA", "源码剖析"],
      body: `
<div class="facts">
  <div class="fact"><b>5.6万+</b><span>行 Python</span></div>
  <div class="fact"><b>16</b><span>个 ComfyUI 工作流 JSON</span></div>
  <div class="fact"><b>30077</b><span>行 main.py</span></div>
  <div class="fact"><b>1175</b><span>个方法 / 36 个命令</span></div>
</div>
<p>先把体量摆出来：整个项目约 5.6 万行 Python，外加 16 个 <span class="term" tabindex="0" data-tip="开源的节点式 AI 绘图后端；工作流 JSON 是它的图配置文件，记录节点与连线，可以当参数模板用">ComfyUI 工作流 JSON</span>、3 个 HTML 模板和一个装在 ComfyUI 侧的自定义节点。<code>main.py</code> 独占 30077 行，一个 <code>ComfyUIPlugin</code> 类塞了 1175 个方法、36 个命令注册。第一眼会觉得这违背软件工程常识，但读完你会发现<mark>它的分层其实想得很清楚，只是全部长在一个类里。</mark></p>
<h2>一、分层结构</h2>
<p>代码按职责切成六块。<code>main.py</code> 是<mark>门面兼调度中心</mark>：命令解析、权限、冷却、排队、<span class="term" tabindex="0" data-tip="给绘图模型的文字描述（prompt），决定画什么、什么风格">提示词</span>流水线全在这里。<code>comfyui_api.py</code>（6371 行）是 ComfyUI HTTP API 的客户端封装，负责把参数注入工作流 JSON 并跟 ComfyUI 服务端对话。<code>gpt_magic.py</code>（6989 行）是独立的 GPT 生图子系统，自带账号、计费和两个 Web 服务器。<code>civitai_api.py</code>（2639 行）管模型下载和 <span class="term" tabindex="0" data-tip="Low-Rank Adaptation，小体积的微调模型，常用来固定角色或画风">LoRA</span> 档案。<code>features/</code> 目录下七个模块用 <span class="term" tabindex="0" data-tip="把一个类的功能拆进多个父类、按需混入的代码组织方式">mixin</span> 方式拆出去：自更新、测试模式、收藏、提示词小本本、生成统计、识图、图片审核，每个 feature 持有插件实例的引用，读主对象的状态。最后是 <code>comfyui_custom_nodes/ComfyUI-AstrBot-LoraBridge</code>，这个比较特别，它不是装在 <span class="term" tabindex="0" data-tip="多平台聊天机器人框架，这个插件跑在它上面">AstrBot</span> 上，而是装到 ComfyUI 的 custom_nodes 里，充当跨机器的文件通道。</p>
<span class="scribble">（30077 行的 main.py，方法数我数了三遍，真的是 1175 个。）</span>
<h2>二、一条「酒狐来点」的完整旅程</h2>
<p>用户发「酒狐来点 xxx」之后发生的事，能看出这个项目的全部设计思路。入口不是命令装饰器，而是 <code>main.py:18722</code> 那个监听所有消息的 <code>_jh_plain_paint_entry</code>，它用文本前缀匹配来分流，顺便把群里的图片缓存下来供识图功能复用。进入 <code>_handle_paint_prompt</code> 后第一件事是<mark>防重入</mark>：往 event 的 extra 里写标记，同一事件二次触发直接丢弃。然后依次过权限检查（封锁模式、群白名单、管理员）、头像重绘分支（@群友会去拉 QQ 头像当<span class="term" tabindex="0" data-tip="以一张已有图为底稿进行重绘的生成方式">图生图</span>源图）、敏感词、源图提取。</p>
<p>真正的主流程在 <code>comfyui_txt2img</code>（<code>main.py:29803</code>），是个 async 生成器。提示词先交给 <code>_prepare_draw_prompt_before_generation_lock</code> 做四步加工：判断是否需要切换模型族；做 LoRA 档案预匹配，命中角色就生成一段「翻译保护提示」；把中文描述发给 LLM 翻成英文 tag 提示词，这段保护提示会拼在翻译 system prompt 里，防止角色触发词被 LLM 改写掉；最后注入 LoRA 触发词和多人构图检测的结果。这里有个很实际的设计判断：<mark>翻译和匹配发生在拿生成锁之前</mark>，因为 LLM 调用可能要十几秒，先做掉可以不占用别人的生成时间。</p>
<p>之后是敏感词复查、冷却检查、抢全局生成锁。锁的实现是 <span class="term" tabindex="0" data-tip="Python 异步编程里的互斥锁，同一时间只放行一个协程">asyncio.Lock</span> 加队列登记表，每条任务记录状态和过期时间，卡死的任务会被 stale 秒数回收。拿到锁才切换工作流，然后进入 <code>_generate_image_file</code>，这是可靠性工程最集中的地方，下一节细说。图生成后还要过发送前审核、写统计、记收藏索引、构建消息链，自动撤回则靠 <code>_send_generation_chain_with_auto_recall</code> 起延时任务。发送失败还有降级链：富媒体失败改发文件，再失败退回纯文本报路径。</p>
<h2>三、工作流即配置，代码即注入器</h2>
<p><code>comfyui_api.py</code> 的核心思路是<mark>把 ComfyUI 的工作流 JSON 当配置文件，运行时改节点参数</mark>。<code>generate()</code>（<code>comfyui_api.py:5666</code>）先加载工作流，再用 <span class="term" tabindex="0" data-tip="ComfyUI 的接口，返回本机可用的节点类与参数清单">/object_info</span> 检查工作流用到的节点类和必填输入在本机 ComfyUI 里是否存在，缺了就自动换兼容工作流，这步能挡住大部分「用户环境没装插件」的报错。接着 <code>_inject_params</code> 定位正面/负面提示词节点、<span class="term" tabindex="0" data-tip="控制去噪过程的算法，影响出图速度和质感">采样器</span>，重连引用，写入 seed、步数、尺寸。</p>
<p>图生图的处理更重：上传源图，按 options 注入 <span class="term" tabindex="0" data-tip="图生图的重绘强度，0 保持原图、1 完全重画">denoise</span> 强度、重绘遮罩、<span class="term" tabindex="0" data-tip="用姿态、线稿等条件图控制生成构图的插件">ControlNet</span> 强度，还要检查 <span class="term" tabindex="0" data-tip="变分自编码器，负责潜空间与图像互转，异常时常产出黑图">VAE</span> 引用是否断裂并修复。多 LoRA 是最难的部分，代码里备了四条注入路线：新版 <span class="term" tabindex="0" data-tip="ComfyUI 新版官方提供的 LoRA 挂载节点">Hook 节点</span>、区域条件（每人一块遮罩，遮罩按重叠率和模糊参数在插件侧生成后分片上传）、<span class="term" tabindex="0" data-tip="不靠遮罩、通过改注意力实现分区控图的方案">DenseDiffusion</span>、safe chain 降级。<mark>某条路线在 ComfyUI 执行报错，会根据错误特征自动重载到下一条路线重试。</mark></p>
<p>提交任务后轮询 <code>/history</code>。这里有个细节：轮询不到时还会查 <code>/queue</code> 快照，确认任务没从队列里消失，防止 ComfyUI 重启导致插件傻等。错误分类也很细：<span class="term" tabindex="0" data-tip="显卡显存不足的报错（Out of Memory）">CUDA OOM</span> 会先调 <code>/free</code> 释放显存再降参重试一次；LoRA 校验失败会解析出无效的 LoRA 名，中和对应节点后重新提交。队列锁那头还区分了本地 ComfyUI 锁和 API 视频锁，两者走不同资源，故意允许并发。</p>
<h2>四、LoRA 角色档案：这个项目真正的核心资产</h2>
<p><code>main.py</code> 里大约四千行代码在做一件事：<mark>把用户随口说的中文名字对应到正确的 LoRA 文件</mark>。支撑它的是 <code>LoraProfileStore</code>（<code>civitai_api.py</code> 尾部）：从 <span class="term" tabindex="0" data-tip="最大的 AI 绘画模型分享站，LoRA 的主要来源">Civitai</span> 抓模型时，清洗标题抽角色名候选、展开别名、提取触发词、记录身份词，落盘成 <code>lora_profiles.json</code>（schema 版本号到 3，说明这个结构反复迭代过）。</p>
<p>匹配引擎的防御性很强。匹配键统一归一化并挂 <span class="term" tabindex="0" data-tip="Python 标准库的结果缓存装饰器，重复查询直接吃缓存">lru_cache</span>；匹配词分强弱档，弱词比如常见服装词不会单独触发；CJK 短标记要做边界检查，防止「？」这种两字角色名命中无关文本；还有身份冲突检测，两个档案声称同一个身份词时会按证据链裁决，冲突的自动禁配并限流打日志。多人意图判断放在独立的 <code>intent_utils.py</code>，纯正则实现：连接词表、身体部位排除词表（「手」「腿」不是人名）、显式数量词（"2girls"）、拉丁人名配对，凑够证据分才走多角色管线。</p>
<h2>五、模型族、GPT 魔法与模型获取</h2>
<p>系统支持 Anima 和 Illustrious 两个模型族，各自有 <span class="term" tabindex="0" data-tip="基础大模型文件，决定画面的底层风格与能力">checkpoint</span> 候选、工作流、画风预设和 LoRA 可见性过滤，状态存在 <code>model_family_state.json</code>。因为两族的基础模型不兼容，插件会按 base model 过滤 LoRA 列表，提示词里命中另一族的角色 LoRA 时还会自动切族，画完恢复。</p>
<p><code>gpt_magic.py</code> 本质是个塞进插件的小型 SaaS。<code>GptMagicStore</code> 用单个 JSON 文件管所有状态：用户、额度、卡密、历史、收藏、画廊账号、资金账本，读写走路径级的 get/set，还会把部分叶子配置反向同步进 AstrBot 的配置界面。额度体系完整：注册送量、卡密生成与兑换、管理员加扣、每次消耗记账。<code>OpenAIImageProvider</code> 按提示词里的关键词猜比例和分辨率，再映射到具体模型。任务队列加 pump 循环控制并发。两个 <span class="term" tabindex="0" data-tip="Python 的异步 HTTP 库，这里用来起内置网页服务">aiohttp</span> 服务器分别跑画图页（<code>templates/winefox_draw.html</code>）和收藏画廊，画廊有注册 token 激活制、<span class="term" tabindex="0" data-tip="慢哈希密码存储算法，能抗暴力破解">PBKDF2</span> 密码、按次视频计费和管理接口。默认密码 114514 这种梗数字，安全上别太当真。</p>
<p><code>civitai_api.py</code> 里搜索有三级兜底：<span class="term" tabindex="0" data-tip="搜索引擎服务，这里指 Civitai 的站内搜索接口">Meilisearch</span> 接口、解析页面 <code>__NEXT_DATA__</code>、REST API，<mark>就为了在 Civitai 风控收紧时还能搜到东西。</mark>下载器三选一：单线程、内置的 Range 分片多线程（预分配 <code>.part</code> 文件，分片写 <code>.done</code>/<code>.progress</code> 标记，支持断点续传）、外部 aria2c。代理带熔断器，连续网络错误会暂时封锁代理路径直接走直连。LoraBridge 解决的是跨机器问题：AstrBot 和 ComfyUI 常不在一台主机，模型必须落在 GPU 那台机器上，于是 ComfyUI 侧起 HTTP 服务，插件远程投递下载任务。它的安全设计反而很正经：域名白名单、扩展名白名单、token 鉴权、只允许私网来源、路径穿越防护和 IP 解析防 SSRF。</p>
<h2>六、可靠性、视频与工程杂项</h2>
<p><code>_generate_image_file</code> 是个审计重试循环：生成后先做黑屏检测（VAE 解码异常的典型症状是纯黑或纯色填充图），命中就换种子重试；开了单人审计就跑本地 <span class="term" tabindex="0" data-tip="本地运行的鉴黄模型，拦截不适宜图片">NSFW 检测</span>模型，拒收也换种子；Illustrious 走完基础图还有足部 <span class="term" tabindex="0" data-tip="对面部、手足等局部做二次精修的节点">Detailer</span> 精修，精修图如果本身黑屏则保留原图不覆盖。<mark>所有重试共用一个预算，耗尽就明确报错，绝不把坏图发出去。</mark><code>tests/test_stability_static.py</code> 有 2395 行，不是单元测试，是对自己源码的静态规则扫描，用这种方式防回归。视频链路走 <span class="term" tabindex="0" data-tip="阿里 Wan 系列的图生视频模型">Wan 图生视频</span>，快速档 Q4 四步、画质档 FP8 二十步，分段续写拼出十五到二十秒，成品打成带密码的 zip，<span class="term" tabindex="0" data-tip="传统 ZIP 密码加密格式，兼容性最好">ZipCrypto</span> 的 CRC 表都是手写的（<code>main.py:745</code>），没引第三方库。</p>
<p>配置这块，<code>main.py</code> 前两千多行全是迁移代码：<span class="term" tabindex="0" data-tip="数据结构的版本定义，配置迁移靠它识别新旧格式">schema</span> 自动注入、旧配置递归合并、用指纹识别过期运行时配置并替换。这是插件从 8.0 一路升到 8.5 还能保住用户配置的原因。</p>
<h2>七、我的评价</h2>
<p>这个项目最打动我的不是功能多，而是<mark>它对失败路径的想象力</mark>：OOM、黑屏、LoRA 缺失、节点缺失、队列消失、翻译改词、同名 LoRA 误配，每一种都有对应的检测和出路。LoRA 档案匹配对中文语境下的模糊输入处理得足够细，是花时间磨出来的东西。</p>
<p>代价也明摆着。<code>main.py</code> 一个类一千多个方法，features 虽然拆了文件，状态还是全挂在 self 上，模块之间没有访问边界，改一处容易碰坏另一处，所以作者才要写两千多行的静态自检来兜底。JSON 文件当数据库，锁加得再勤也有并发上限。可对它的真实场景（一个人维护、用户是 QQ 群里的非技术玩家、ComfyUI 环境千差万别）来说，<mark>这种「土法但活着」的工程选择，比教科书式的整洁更站得住。</mark></p>`
    },
    {
      slug: "ai-agent-mcp",
      title: "让 AI 给我打工：Agent + MCP 实操记录",
      category: "AI 自动化",
      date: "2026-08-30",
      readTime: 8,
      summary: "把 Agent、MCP、TTS、邮件自动化串起来用的过程记。结论先说：AI 不是魔法，流程才是。",
      tags: ["AI Agent", "MCP", "自动化", "TTS"],
      body: `
<p>很多人对 AI 的印象还停留在「聊天」，但我更想把它当成一套可以指挥的<b>生产力工具链</b>。这段时间我把 AI Agent、MCP、TTS 和邮件自动化串在了一起，砍掉了不少重复劳动。</p>
<h2>我在用 AI 做什么</h2>
<ul>
<li><b>AI Agent</b>：把「查资料 → 整理 → 汇总」这类流程交给 Agent 跑；</li>
<li><b>MCP 工具</b>：让模型能直接调用我自己的脚本和服务，而不是只会输出文字；</li>
<li><b>TTS 语音</b>：把通知和播报转成语音，配合自动化推送；</li>
<li><b>邮件自动化</b>：定时汇总、自动分类、按规则提醒。</li>
</ul>
<h2>一个最小可用示例</h2>
<p>下面这种思路几乎贯穿了我所有的自动化脚本——定义工具、注册给 Agent、让它自己决定什么时候调用：</p>
<pre><code><span class="tok-c"># 伪代码：把「发邮件」注册成 Agent 的工具</span>
<span class="tok-k">from</span> agent <span class="tok-k">import</span> Agent, tool

<span class="tok-f">@tool</span>
<span class="tok-k">def</span> <span class="tok-f">send_mail</span>(to: <span class="tok-k">str</span>, subject: <span class="tok-k">str</span>, body: <span class="tok-k">str</span>):
    <span class="tok-s">"""当需要通知我时，调用这个工具发邮件"""</span>
    smtp.send(to, subject, body)

bot = Agent(tools=[send_mail])
bot.run(<span class="tok-s">"每天 22 点总结今天的 NAS 运行日志并发邮件给我"</span>)</code></pre>
<blockquote>与其反复问 AI 问题，不如把「问题」固化成「流程」，让 AI 在流程里干活。</blockquote>
<h2>写在最后</h2>
<p>这套东西目前最大的问题是栈太杂：Agent 一停，后面全停。等把监控和失败重试补上，再写篇续集。</p>`
    },
    {
      slug: "fnos-docker-homelab",
      title: "飞牛 fnOS + Docker：我的自托管服务全家桶",
      category: "自托管",
      date: "2026-08-12",
      readTime: 10,
      summary: "旧机器装了飞牛 fnOS 之后，家里机箱就没关过机。这篇记我在跑什么服务、踩过什么坑。",
      tags: ["fnOS", "Docker", "NAS", "自托管"],
      body: `
<p>家里的旧机器装上飞牛 fnOS 之后，就成了我 24 小时运转的「家用数据中心」。这篇记录我在 NAS 上跑的服务，以及一些新手向的踩坑经验。</p>
<h2>为什么自己搭？</h2>
<p>网盘会限速、会员会过期、数据在别人手里总归不踏实。自托管的好处很简单：<b>数据在自己手里，服务按自己的喜好来。</b></p>
<h2>我目前在跑的服务</h2>
<ul>
<li>影视与下载：Jellyfin、qBittorrent；</li>
<li>工具类：密码管理、书签服务、图床；</li>
<li>游戏相关：鸣潮查分 Bot、Minecraft 服务端的备份脚本；</li>
<li>自动化：Agent 定时任务、TTS 播报。</li>
</ul>
<h2>一个标准的 compose 模板</h2>
<pre><code><span class="tok-k">services</span>:
  jellyfin:
    image: jellyfin/jellyfin
    <span class="tok-k">restart</span>: unless-stopped
    <span class="tok-k">volumes</span>:
      - /vol1/media:/media
    <span class="tok-k">ports</span>:
      - <span class="tok-s">"8096:8096"</span></code></pre>
<h2>新手避坑三条</h2>
<ul>
<li>数据目录一定要放在重要卷上，容器随便删，数据不能丢；</li>
<li>每个服务写清楚端口映射，避免冲突，建议建一张端口表；</li>
<li>先学会 <code>docker logs</code> 和 <code>docker compose up -d</code>，能解决 80% 的问题。</li>
</ul>
<p>下一篇写 Clash 分流，正好接上。</p>`
    },
    {
      slug: "mc-neoforge-server",
      title: "Minecraft 开服记：NeoForge 模组服从零到稳定",
      category: "游戏",
      date: "2026-07-28",
      readTime: 12,
      summary: "从 Java 参数到模组取舍，一台开了快一年的模组服是怎么活下来的。",
      tags: ["Minecraft", "NeoForge", "开服"],
      body: `
<p>自己的服务器，规则自己定。这篇记录我从零把一台 NeoForge 模组服跑稳定的过程。</p>
<h2>为什么选 NeoForge</h2>
<p>Forge 系的社区分叉，模组兼容推进得很快，版本跟进也勤。对想长期经营的生存服来说，是目前比较省心的选择。</p>
<h2>开服清单</h2>
<ul>
<li>Java 版本与内存参数先配好，<code>-Xmx</code> 别贪大，留够系统开销；</li>
<li>模组宁少勿多：先跑核心（性能 + 地形 + 存储），再逐个加；</li>
<li>定期备份，出事的时候你会感谢自己。</li>
</ul>
<h2>启动脚本模板</h2>
<pre><code>java <span class="tok-f">-Xms4G</span> <span class="tok-f">-Xmx6G</span> <span class="tok-f">-jar</span> neoforge.jar <span class="tok-f">nogui</span></code></pre>
<blockquote>服务器的稳定 = 合理的模组数量 + 及时的备份 + 别在周五晚上乱改配置。</blockquote>
<p>之后会写一篇性能调优的续篇，聊聊结构生成和实体数量对 TPS 的影响。</p>`
    },
    {
      slug: "wuwa-rating-bot",
      title: "给鸣潮写个查分 Bot：API、权重与版本跟进",
      category: "游戏",
      date: "2026-07-10",
      readTime: 9,
      summary: "嫌群里吵强度说不清，干脆自己写了个评分 Bot。数据、权重、跟版本，全流程记一遍。",
      tags: ["鸣潮", "Bot", "Python"],
      body: `
<p>玩鸣潮的时候总觉得角色强度讨论太主观，于是干脆自己写了一套评分 API 和 Bot：输入角色与配队，输出量化评分。</p>
<h2>整体思路</h2>
<ul>
<li>数据层：抓取并整理角色面板、技能倍率；</li>
<li>权重层：按版本环境给词条、技能分配权重；</li>
<li>应用层：Bot 接口，群里 @ 一下就能查。</li>
</ul>
<h2>权重大概长这样</h2>
<pre><code><span class="tok-k">WEIGHTS</span> = {
    <span class="tok-s">"暴击率"</span>:   <span class="tok-n">0.30</span>,
    <span class="tok-s">"暴击伤害"</span>: <span class="tok-n">0.26</span>,
    <span class="tok-s">"攻击%"</span>:    <span class="tok-n">0.18</span>,
    <span class="tok-s">"元素伤害"</span>: <span class="tok-n">0.16</span>,
    <span class="tok-s">"共鸣效率"</span>: <span class="tok-n">0.10</span>,
}</code></pre>
<h2>版本跟进</h2>
<p>每到一个新版本，先看改动公告，再调整权重与新增角色数据，最后跑一遍回归测试。评分可以不完美，但逻辑必须自洽。</p>
<p>这个项目让我第一次体会到：<b>写工具给玩家用，比自己肝舒服多了。</b></p>`
    },
    {
      slug: "hifi-dsd-guide",
      title: "Hi-Fi 入坑两年，记点省钱的教训",
      category: "音频",
      date: "2026-06-22",
      readTime: 7,
      summary: "DSD 音源、DAC、独占输出、真伪 Hi-Res 验证，把我交过的学费整理成一篇。",
      tags: ["Hi-Fi", "DSD", "DAC"],
      body: `
<p>入坑 Hi-Fi 之后才知道，这坑有多深：格式、接口、调音风格……这篇先记最基础的几件事，给同样想入坑的朋友省点学费。</p>
<h2>我的听音取向</h2>
<p>暖声向。听人声和流行居多，偏好扎实的中频和不算刺激的高频。</p>
<h2>关于 DSD 与音源</h2>
<ul>
<li>DSD/DFF 本质是为 SACD 服务的格式，资源相对小众，但串流和本地播放都能玩；</li>
<li>foobar2000 + ASIO 独占输出，是最省心的本地播放方案；</li>
<li>所谓「无损升级」，很多是采样率变换，听感提升见仁见智。</li>
</ul>
<h2>真伪 Hi-Res 的坑</h2>
<p>网上很多标着 Hi-Res 的音源其实是重采样货。用频谱工具看一眼高频截止位置，能过滤掉大部分「贴牌」资源。</p>
<blockquote>器材带来的提升没有想象中大。先搞清楚自己平时听什么，再考虑花钱。</blockquote>
<p>之后准备写 DAC 搭配和小尾巴选择的入门篇。</p>`
    },
    {
      slug: "clash-proxy-config",
      title: "Clash 分流入门：把家里的网络理顺",
      category: "自托管",
      date: "2026-06-05",
      readTime: 6,
      summary: "该直连的直连，该代理的代理。配置理顺一次，后面基本不用再碰。",
      tags: ["Clash", "网络", "分流"],
      body: `
<p>自托管玩多了，网络这一层迟早要理顺：内网怎么互访、规则怎么分流、配置怎么管理。这篇是我的 Clash 入门笔记。</p>
<h2>为什么需要分流规则</h2>
<p>不是「能上网」就算完，而是<b>该直连的直连、该代理的代理</b>：游戏走低延迟线路，下载走带宽线路，日常流量按规则分流。</p>
<h2>我的配置习惯</h2>
<ul>
<li>订阅与规则文件分开管理，避免手改订阅被覆盖；</li>
<li>规则按「直连 → 代理 → 兜底」的顺序整理；</li>
<li>给家里的服务单独配内网直连，减少绕路。</li>
</ul>
<pre><code><span class="tok-k">rules</span>:
  - <span class="tok-f">DOMAIN-SUFFIX</span>,lan,<span class="tok-s">DIRECT</span>
  - <span class="tok-f">IP-CIDR</span>,192.168.0.0/16,<span class="tok-s">DIRECT</span>
  - <span class="tok-f">MATCH</span>,<span class="tok-s">Proxy</span></code></pre>
<p>理顺之后基本就没再动过，改配置的次数一只手数得过来。</p>`
    }
  ],

  /* ── 关于页 ────────────────────────────────────────────── */
  about: {
    bio: [
      "我是 Aster，GitHub ID 是 <b>XIAOKU2300</b>，现在读高二。白天上学，晚上和周末折腾电脑——NAS、Docker、Minecraft 服务器、ComfyUI、游戏 Bot、Hi-Fi，都算。",
      "2020 年注册的 GitHub，当时除了给别人的项目点 Star 啥也不会；2023 年有了自己的电脑，才开始真正上手。现在家里的旧机器装了飞牛 fnOS 当 NAS，十几个容器 24 小时跑着；鸣潮查分 Bot 在群里服役；WineFox Desktop 是我折腾 AI 绘画的主阵地。",
      "写文章对我来说有个额外的好处：能发现过程里漏掉的理解漏洞，好几次都是写到一半回去重看了文档。你要是也在折腾类似的东西，欢迎来信。"
    ],
    /* 二次元浓度便签：单独一张手账卡 */
    memo: {
      stamp: "※ TOUHOU PROJECT // 东方同好",
      text: "闲下来写的东西二次元浓度有点高：猜 ZUN 绘的网页、每日老婆抽签、孤独摇滚主题页，都是现学现卖。GitHub 个人简介写的是「喵喵喵喵喵」，算是官方认证。"
    },
    /* 实体工具箱：按真实折腾场景分组 */
    inventory: [
      { group: "逻辑与服务", note: "机器人插件、查分 Bot、这个站，全是脚本和胶带粘起来的。",
        items: ["Python", "JavaScript", "HTML/CSS", "命令行"] },
      { group: "基础设施", note: "十几个容器 24 小时连轴转，全家人的数据都在那台旧机器上。",
        items: ["fnOS", "Docker", "Linux", "Clash 分流"] },
      { group: "物理世界 & 声学", note: "画过几块板子，焊点歪但能跑；会看频谱、能验音源真伪，学费交了不少。",
        items: ["STM32", "焊台", "Hi-Fi", "foobar2000"] },
      { group: "AI 绘画 & 自动化", note: "一开始只想省点事，后来停不下来了。",
        items: ["ComfyUI", "LoRA", "Agent", "MCP"] }
    ],
    timeline: [
      { year: "2020", text: "注册了 GitHub，ID 是 XIAOKU2300。当时除了收藏别人的项目，啥也不会。" },
      { year: "2023", text: "有了自己的电脑，在 B 站大学入学，从此走上自己动手的路。" },
      { year: "2024", text: "旧机器装上飞牛 fnOS 当 NAS，Docker 容器越装越多，机箱再没关过。" },
      { year: "2025", text: "Minecraft NeoForge 服开服；给鸣潮写查分 Bot；Hi-Fi 入坑，钱包瘦了一圈。" },
      { year: "2026", text: "开始写 WineFox Desktop，把 AI 当劳动力使，顺手把折腾记录整理成这个博客。" }
    ],
    aside: "另外，我对命理玄学有点兴趣，之后可能开个不正经的小栏目。图一乐，别当真。",
    contactNotes: [
      "一般晚上十点后在线，上课时间回得慢，见谅。",
      "聊技术、一起开黑、拼服务器都行，开口先说清楚是谁、想干啥。"
    ]
  },

  /* ── 页脚那一行小字 ────────────────────────────────────── */
  footerNote: "手写 HTML / CSS / JS，没有框架"
};
