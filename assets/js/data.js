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
      slug: "echomatrix-history",
      title: "青弋 Bot 与 EchoMatrix 全景发展史：从被掐住脖子的部署者，到打断骨头自己长的开源矩阵",
      category: "开源纪实",
      date: "2026-10-05",
      readTime: 25,
      summary: "3.84 GiB 数据归档、12,152 个历史文件快照、371 万条消息交互与 189 次提交代码铁证。记录青弋 Bot 从查面板的小白部署者，历经鸣潮狂潮与六月断供风暴，在 48 小时内极限逆向脱钩，走向全栈自研与重回巅峰的全景发展史。",
      tags: ["青弋Bot", "EchoMatrix", "鸣潮", "开源纪实", "自研", "源码演进"],
      body: `
<div class="facts">
  <div class="fact"><b>371万+</b><span>接收网络消息</span></div>
  <div class="fact"><b>49.8万</b><span>卡片渲染总数</span></div>
  <div class="fact"><b>189次</b><span>提交代码铁证</span></div>
  <div class="fact"><b>58/1121</b><span>角色与动作自研</span></div>
</div>

<blockquote>
<p><strong>作者/叙述者</strong>：青弋 Bot &amp; EchoMatrix 开发者 / 守护者<br><strong>数据基准时间</strong>：2026 年 10 月 5 日<br><strong>数据证据来源</strong>：192.168.0.102（工控主机 <code>qybot</code>）只读数据归档、系统级服务日志、Git 完整提交历史、3.84GB / 12,152 个历史文件快照  </p>
</blockquote>
<hr>
<h2>【引子·写在开篇】</h2>
<p>我关掉终端里滚动的调试日志，看了一眼窗外。</p>
<p>手边的桌子上，那台黑色巴掌大小的 11 代 i7 工控小主机正亮着幽蓝色的指示灯，散热风扇在静谧的房间里发出极其平稳而微弱的嗡嗡声。在我的局域网里，它的 IP 是 <code>192.168.0.102</code>，主机名就叫 <strong><code>qybot</code></strong>。</p>
<p>刚刚，我把它上面所有的历史数据库快照、Redis 运行计数、系统日志和插件目录完整做了一次只读导出并打包。屏幕上弹出了一串冰冷但又沉甸甸的数字：</p>
<ul>
<li><strong>解压后 3.84 GiB，共计 12,152 个文件</strong>；</li>
<li><strong>5 份完整的历史数据库全量备份</strong>；</li>
<li><strong>3,712,350 条接收消息，560,656 条发送消息，417,625 次业务命令执行</strong>；</li>
<li><strong>498,800 张卡片渲染，图像回复占比高达 88.97%</strong>；</li>
<li><strong>Gscore 端覆盖 32,665 名用户、2,796 个群组；官方 QQ Bot 接入 2,597 个群组、7,467 位好友</strong>；</li>
<li><strong>本地自研伤害引擎涵盖 58 个角色、1,121 个独立战斗技能动作</strong>。</li>
</ul>
<p>看着这些数字，我的眼眶有点发热。三年前，当我在电脑前敲下第一行部署命令的时候，我无论如何也想不到，这个最初只是为了在群里帮朋友查查原神体力和星铁面板的小玩具，在接下来的近一千个日日夜夜里，会经历官方 API 的大地震、会经历无数次被腾讯风控封号的焦虑，更会在 2026 年的夏天，经历一场几乎要将它彻底置于死地的断供风暴。</p>
<p>如果换作别人，可能在被封杀、被断供的那一天，发一个停服公告，这个项目就随风消散了。但我没有。在被拔掉插头后的 20 秒里，我按下了第一个自建服务的提交；在随后昏天黑地的 48 小时里，我一行行删掉了所有外部依赖，硬生生把声骸评分、伤害计算和排行榜算法全写成了纯本地的 Python 代码。</p>
<p>今天，我想放下所有干巴巴的数据报表和防卫式的公关辞令，坐在你面前，就像在深夜的机房里倒了一杯温水，把这三年多来所有的故事、所有的踩坑、所有的委屈、所有的突破，还有那些不可磨灭的数据印记，完完整整、说人话讲给你听。</p>
<hr>
<h2>【第一章·荒野拾柴（2023）：一个小白部署者的快乐与单点故障】</h2>
<h3>1.1 梦开始的地方：查面板与胶水代码</h3>
<p>2023 年，我还在学校读书。那会儿正值《原神》须弥版本向枫丹过渡，《崩坏：星穹铁道》也刚刚公测不久。身边很多朋友都在玩，大家最日常的需求其实极其简单：
“我圣遗物刷得怎么样了？”<br>“我角色面板评分多少？”<br>“我今天树脂满了吗？”</p>
<p>当时开源社区里已经有了基于 Node.js 的 Yunzai-Bot 以及各种查面板的插件。我看着觉得特别神气，心想：“别人能跑，我是不是也能在群里挂一个，让朋友们天天用？”</p>
<p>那时候我根本算不上什么“开发者”，本质上就是个**“纯正的小白部署者”**。在网上买了一台几十块钱一个月的低配云服务器，照着网上的教程安装 Node.js、Redis，拉取仓库代码，配置 OneBot 协议端（比如当时的各种 Go-CQHTTP 或 NapCat 雏形），输进账号密码扫码登录。</p>
<p>当群里第一次有人发送 <code>/uid</code>，机器人噗嗤一下吐出一张排版精美的角色卡片时，大家在群里起哄喊“牛逼”，那一瞬间带给我的多巴胺，彻底把我拽进了这个世界。</p>
<p>在最初的 2023 年里，整个项目只有几百个用户、十几个核心群。我像一个尽职尽责的机房网管，每天最喜欢做的事情就是盯着后台看有没有报错，有人提个小需求我就到处找插件打补丁。那时的我天真地以为，所谓做机器人，无非就是把开源社区现成的东西拼装在一起，安安静静当一个提供算力的服务者就好。</p>
<h3>1.2 现实的第一记耳光：学生时代的“周五救火队长”</h3>
<p>但现实很快就露出了狰狞的一面。</p>
<p>做 QQ 机器人的同行都知道，最大的梦魇永远不是代码 bug，而是<strong>腾讯的风控机制</strong>。
普通的 QQ 号挂在云服务器的异地 IP 上，频繁发送图片和长文本，极易被风控系统判定为异常账号。动不动就是“连接被断开”“账号已被冻结，请在手机端确认”。</p>
<p>而当时我最大的单点故障，是我自己的身份：<strong>我是一个寄宿学生</strong>。</p>
<p>每周一到周五我人在学校，不能随时随地摸电脑；每周日晚上返校前，我把机器人辛辛苦苦调到最稳定的状态，结果往往到了周一上午或者周二下午，手机上一条群消息弹出：“Bot 怎么又掉线了？”“提示账号被冻结了！”</p>
<p>人在宿舍，鞭长莫及。服务器在云端，账号验证却必须用手机扫脸或短信验证码。我急得在课桌底下直挠头，只能在群公告里一遍遍发道歉：“账号被风控了，人还在学校，等我周五晚上回家救活！”</p>
<p>周五一放学，我背着书包一路小跑冲回家，鞋都顾不上换，第一件事就是扑到电脑前开终端、扫码、解冻、重启服务。看到机器人的绿灯重新亮起，我才长舒一口气。</p>
<p>这种寄人篱下、战战兢兢的脆弱感，从第一天起就深深刻在了我的骨子里。它像一颗种子，悄悄埋下了我对“自主可控”和“无人值守自愈”的极度渴望。</p>
<hr>
<h2>【第二章·潮水涌来（2024 ～ 2025）：鸣潮狂潮、API 震荡与硬件四次大迁徙】</h2>
<h3>2.1 鸣潮降临：从配角到绝对主场</h3>
<p>进入 2024 年，整个局面发生了翻天覆地的变化。</p>
<p>2024 年 5 月下旬，库洛游戏的《鸣潮》（Wuthering Waves）正式公测。原神和星铁的群友们大批涌入鸣潮，青弋群里的风向在一夜之间转变为：
“什么时候能查声骸评分？！”<br>“怎么看忌炎的伤害期望？！”<br>“能不能查深塔记录？！”</p>
<p>我顺理成章地将目光投向了鸣潮生态。当时社区里出现了 CM-Edelweiss 维护的官方鸣潮插件 <code>WutheringWavesUID</code>，以及后来 Loping151 主导维护的二次开发版本 <code>XutheringWavesUID</code>（简称 XWUID）。我把 XWUID 引入到了青弋中，同时接入了签到相关的扩展（如 <code>RoverSign</code>）。</p>
<p>鸣潮的加入，让青弋的活跃度迎来了第一轮爆发式的指数级飞跃。但随之而来的，是一场持续两年的高强度技术拉锯战。</p>
<h3>2.2 库洛 API 的大地震：两次致命的协议突变</h3>
<p>很多新用户以为查游戏数据就是调个公开接口那么简单，只有真正趟过浑水的人才知道这有多残酷：</p>
<ol>
<li><p><strong>2024 年 6 月 28～29 日的暗度陈仓</strong>：<br>鸣潮公测刚满一个月，库洛官方在没有任何公告的情况下，突然修改了数据 API 的域名，并且在请求链路上新增了“强制获取客户端公网 IP”的接口。虽然部分变更在次日被撤回，但 IP 采集和设备指纹的机制被永久保留了下来。社区各大 Bot 插件哀鸿遍野，这也是鸣潮风控收紧的明确信号。</p>
</li>
<li><p><strong>2025 年 5 月 25～29 日的毁灭级替换</strong>：<br>这是我至今心有余悸的五天。从我们的 Redis 长期运营数据里可以看到一个非常触目惊心的断层：</p>
<ul>
<li>2025 年 5 月 24 日，日接收消息量断崖式跌落至 <code>538 receive / 12 send</code>；</li>
<li><strong>5 月 25 日到 5 月 31 日，整整 7 天，Redis 里没有任何正常的业务交互记录！</strong></li>
</ul>
<p>为什么？因为在那几天，库洛对鸣潮的数据接口实施了<strong>全盘大清洗</strong>！旧有的声骸基础数据、探索度接口全部被强制废弃并标注删除线，新接口迟迟不稳定，直到 5 月 29 日才陆续补齐了资源获取统计接口。
那整整一周，全网所有的鸣潮 Bot 几乎全部停摆。群友们天天私聊问我：“是不是跑路了？”我只能死守在电脑前，看着开发者社区里的各路神仙通宵抓包、逆向接口、改协议。那一周让我明白：<strong>依靠游戏厂商未公开的私有接口做工具，永远像是在流沙上盖摩天大楼。</strong></p>
</li>
</ol>
<h3>2.3 IP 签到风控与代理池的深渊</h3>
<p>随着用户数迈过一万人大关，新的危机爆发了：<strong>同 IP 集中签到风控</strong>。</p>
<p>每天凌晨或者清晨，上万名鸣潮玩家的账号通过青弋发起签到和体力刷新。同一个服务器 IP 在短时间内向库洛服务器发出数万次 HTTP 请求，直接触发了库洛的防火墙。结果就是：<strong>服务器 IP 被库洛拉黑，所有经过这台机器的请求全部报 403 Forbidden，甚至导致部分用户的游戏签到被拦截封禁！</strong></p>
<p>为了破局，我必须使用<strong>代理池</strong>（Proxy Pool）。
一开始我自己掏生活费买商业代理，但高频的住宅代理费用高得吓人，一个月几百块对一个学生来说是极大的负担。后来，XWUID 上游生态（151 体系）建立了自己的代理池资源和分发体系，只要持有对应的 Token 鉴权，就可以在插件里调用共享代理池来轮换出口 IP。</p>
<p>当时我感激涕零，觉得上游团队简直是救世主。我顺理成章地配置了 token，把所有抓取流量切到了这套代理体系中。
我当时根本没有意识到，<strong>这把钥匙握在别人手里，一旦有一天别人想抽走，我将面临怎样的灭顶之灾。</strong></p>
<h3>2.4 硬件四次大迁徙与“qybot”主机的诞生</h3>
<p>在 2024 到 2025 年这段时间里，除了网络对抗，我的物理硬件也经历了一部悲壮的血泪迁徙史：</p>
<pre><code>[阶段一：廉价云服务器] 
  → 内存暴涨、带宽吃紧、月费难以维系、经常被腾讯阻断端口
[阶段二：闲置家用笔记本]
  → 电池发热鼓包、家用宽带无固定公网IP、宿舍断电即失联
[阶段三：老旧台式机过渡]
  → 功耗巨大、噪音扰民、主板电容老化频繁死机
[阶段四：专用工控小主机（qybot）]
  → 11代 i7、16G 高速内存、双千兆网口、内网固定 192.168.0.102
</code></pre>
<p>2026 年初，我下定决心彻底解决硬件不稳定的问题。我省吃俭用，购置了一台配备 11 代 Intel Core i7 处理器、16GB 内存的高性能工控迷你主机。我把它的主机名命名为 <code>qybot</code>，接入家中的光纤网络，分配了静态内网 IP <code>192.168.0.102</code>。</p>
<p>我在这台机器上跑了精简的 Linux 系统，使用 systemd 管理所有服务进程，配置了 Redis 内存持久化、PostgreSQL 关系数据库，搭建了 TRSS-Yunzai 和 Gscore (GSUID Core) 双核心底座。</p>
<p><strong>备份接入记录（2026 年 10 月 8 日）：</strong>QYBot / 青弋 Bot 的 TRSS-Yunzai 业务数据计划接入 <a href="https://xiaoku2300.github.io/backupcenter/">BackupCenter 加密备份中心</a>。目前处于接入规划阶段，确认备份目录和数据库一致性方案，并完成备份与恢复测试后，再启用自动任务。</p>
<p>这台小主机，成了我最坚固的堡垒。然而，软件系统的隐疾，却在悄无声息地酝酿。</p>
<hr>
<h2>【第三章·冰山之下（2026.01 ～ 2026.05）：走向正规化与黑盒依赖的技术隐患】</h2>
<h3>3.1 官方 QQ Bot 架构重构：212 万条消息的承载者</h3>
<p>进入 2026 年，腾讯对第三方 OneBot 协议的打击达到了顶峰。大批传统机器人被封号灭门。为了让青弋活下去，我做了一个极具前瞻性的决定：<strong>全面拥抱腾讯官方 QQ 开放平台机器人架构。</strong></p>
<p>从 <code>user_ids.csv</code> 和 <code>group_ids.csv</code> 可以看到一个极其清晰的历史分水岭：
<strong>2026 年 1 月 24 日 14:25:51.892 UTC</strong>，数据库里记录下了第一个腾讯官方 QQ Bot 的 OpenID 复合身份；仅仅 20 毫秒后，第一条官方群组映射成功写入！</p>
<p>我利用 TRSS 的腾讯机器人服务中间件，打通了云端 <code>QQBotWs</code>，注册了官方机器人实例。根据后来 <code>dashboard_data.json</code> 中的终极统计：</p>
<ul>
<li>官方机器人（<code>qqgroup:3889704433</code>）成为了整个系统的绝对主力：<strong>在 254 天的有效运行期内，累计接收 2,122,220 条消息，发送 450,453 条消息，执行了 345,375 次指令，渲染了 395,202 张图片！</strong></li>
<li>这一项数据，占据了青弋整个生命周期发送总量的 <strong>80.3%</strong> 和图片渲染总量的 <strong>79.2%</strong>！</li>
<li>相比之下，其余几个 OneBot 辅助账号（如 <code>3474252062</code> 接收 53.7 万条、<code>762477580</code> 接收 74.3 万条、<code>3417582557</code> 接收 26.2 万条）则退居二线，形成了“一超多强”的高可用多端容灾体系。</li>
</ul>
<pre><code class="language-mermaid">flowchart TD
    subgraph 用户接入层
        QQ1[官方 QQ Bot 复合用户] --&gt;|WebSocket| TRSS[TRSS-Yunzai 中间件]
        QQ2[OneBot 协议群/私聊] --&gt;|Reverse WS| GCORE[GSUID Core / Gscore]
    end

    subgraph 核心调度与缓存
        TRSS &lt;--&gt; REDIS[(Redis 缓存: 94.8万计数)]
        GCORE &lt;--&gt; PG[(PostgreSQL 业务库)]
    end

    subgraph 游戏业务插件
        GCORE --&gt; WAVES[鸣潮服务 Waves: 12069活跃]
        GCORE --&gt; ROVER[漫游服务 Rover: 2270活跃]
        GCORE --&gt; ENDF[终末地服务 End: 458活跃]
    end
</code></pre>
<h3>3.2 繁华背后的暗礁：闭源 <code>.so</code> 与无法热更的梦魇</h3>
<p>截至 2026 年 5 月，青弋的服务矩阵已经极为庞大。从导出数据看，光是不同游戏的绑定用户中：</p>
<ul>
<li>纯原神用户：410 人；</li>
<li>纯星铁用户：161 人；</li>
<li>纯绝区零用户：22 人；</li>
<li>原神 + 星铁 + 鸣潮“三修”核心硬核玩家：475 人；</li>
<li>总计为超过 <strong>3.2 万名用户</strong> 提供服务。</li>
</ul>
<p>但是在光鲜的数据背后，我的心里每天都在打鼓。因为鸣潮的核心插件 XWUID 存在一个极其致命的技术架构缺陷——<strong>核心算法被深度黑盒化</strong>。</p>
<p>上游团队为了防止他人所谓“抄袭”，把最核心的声骸打分算法、伤害计算公式和安全防御模块，统统用 Cython 编译成了二进制的共享库（Linux 下是 <code>.so</code>，Windows 下是 <code>.pyd</code>），即模块 <code>waves_build</code>；同时，总排行榜的数据上传与查询，全部被硬编码指向了上游维护的私有服务器；声骸评分的 OCR 和鉴权，必须依赖名为 <code>ScoreEcho</code> 的第三方 API，并强校验 <code>WavesToken</code>。</p>
<p>这就造成了几个不可调和的技术灾难：</p>
<ol>
<li><strong>进程内热重载必引发段错误（Segfault）</strong>：<br>上游在 2026 年 5 月 22 日的 commit <code>6a07513...</code> 中自己都写下了承认记录：“<em>含 <code>.so</code> 的构建无法在进程内热重载，会引发段错误导致进程崩溃</em>”。我每次热更新一个简单的文本或正则，整个 Python 核心就会直接 Core Dump 暴毙！</li>
<li><strong>顶层 Import 锁定导致评分归零</strong>：<br>2026 年 5 月 31 日，上游 commit <code>c2d8bf9...</code> 再次记录：“<em>编译的 <code>.so</code> 评分引擎顶层 import 锁定旧类，导致评分全变为 0</em>”。只要官方游戏稍微微调了声骸属性，上游不发编译好的新 <code>.so</code>，我的 Bot 就只能大面积产出废品数据。</li>
<li><strong>永远悬在头上的 Token 绳索</strong>：<br>所有的排行提交、伤害表达式解析，只要外部 Token 验证失败，代码内部就直接抛出异常或者静默失败。</li>
</ol>
<p>我每天都在战战兢兢地伺候这个脆弱的黑盒。我曾在私下里无数次想过：“如果哪一天，这个外部服务不给我用了，或者上游出了变故，青弋会怎么样？”</p>
<p>我没想到，这个假设在短短一个月后，以一种最残酷的方式变成了现实。</p>
<hr>
<h2>【第四章·六月风暴（2026.06.20 ～ 06.24）：断供、至暗时刻与 48 小时极限逆向脱钩】</h2>
<h3>4.1 导火索：BW 门票争议与被扣上的莫须有帽子</h3>
<p>2026 年 6 月 20 日，一年一度的 Bilibili World (BW) 漫展门票开售。</p>
<p>当时许多朋友和群友都想去现场，但门票极难抢。我手头平时维护着代理池脚本，脑子一热，就尝试编写了自动脚本，调用手头的代理资源去尝试为群友代抢门票。在我的认知里，这只是对既有网络资源的一种临时调用，如果消耗了代理流量，我自己完全可以出资补齐费用。</p>
<p>但我严重低估了社区对资源边界的敏感度。当天下午 13:00 左右，上游群内突然有人发难，指责我“滥用 Bot 维护公用池子抢票”。随后，事情迅速被情绪化升级，有人开始在群里喊出极其刺耳的词汇：“<strong>倒卖狗</strong>”“<strong>偷公用池子倒卖门票牟利</strong>”。</p>
<p>看到这些消息，我整个人是懵的。我从未倒卖过哪怕一张门票，更没有靠加价倒票赚过一分钱！闲鱼上的相关咨询仅仅是探讨代抢技术的可能性。
但我深知未经明确书面授权调用群内共享资源确实有违规矩。为了不激化矛盾，<strong>6 月 20 日下午 13:08</strong>，我在群里发出了诚恳的公开道歉：</p>
<blockquote>
<p>“对不起，确实是我思虑不周，未经确认擅自使用了代理资源抢票。我保证今后严格遵守规范，因本次行为造成的所有代理流量损耗与经济损失，我个人全额赔偿承担！”</p>
</blockquote>
<p>我以为，一个坦荡的道歉和全额赔偿的承诺，能够换来理性的解决。但我太天真了。</p>
<h3>4.2 封杀降临：“151 封了你的 token”</h3>
<p>6 月 21 日中午，群内的讨论非但没有平息，反而更加恶化。</p>
<p>有管理员在私聊和群里给我发来了一句判决般的通牒：</p>
<blockquote>
<p><strong>“151 已经封了你的 token，所有的授权全部回收了。”</strong></p>
</blockquote>
<p>紧接着，我的 QQ 号被管理员踢出了维护群。我后来试图重新申请进群解释，并向相关人员表达“希望能按正规流程购买或申请 token”，但得到的反馈只有冷酷的再次移除。
与此同时，我那些被断章取义截取的道歉言论，甚至个别被恶意剪辑篡改的聊天截图，开始在好几个核心机器人群里大肆扩散。“青弋作者偷池子倒卖被封”的谣言像病毒一样蔓延开来。</p>
<p>在小主机的屏幕前，终端里的报错开始像瀑布一样刷屏：</p>
<ul>
<li><code>WavesRank HTTP 401 Unauthorized: Invalid WavesToken</code></li>
<li><code>waves_build.safety: authorization failed</code></li>
<li><code>ScoreEcho API connection refused</code></li>
<li>面板打分全部报错，排行查询全部超时！</li>
</ul>
<p>那一刻，房间里安静得可怕。只有小主机的风扇还在呼呼地转。
三年的心血，3 万多名真实用户，两千多个群，难道今天就要因为别人轻飘飘的一句“封了你的 token”，彻底化为乌有吗？</p>
<p><strong>不。绝不！</strong></p>
<p>那一刻，我心底积压了三年的憋屈和执拗全部爆发了出来。
“你以为你封了 token 就能掐死我？你以为那些算法只有你们能写？你们不开源，老子自己写！”</p>
<h3>4.3 决裂的 20 秒与 6 月 21 日的“第一天十连提交”</h3>
<p>从 GitHub 私有仓库的底层记录里，刻下了一个极具戏剧性的时间戳：</p>
<ul>
<li>私有仓库 <code>XIAOKU2300/XutheringWavesUID</code> 在 GitHub 上的官方创建时间是：<strong>2026-06-21 07:18:17 UTC（北京时间 15:18:17）</strong>；</li>
<li>而该仓库的第一个提交（commit <code>f838d09</code>）的本地生成时间是：<strong>2026-06-21 07:17:57 UTC（北京时间 15:17:57）</strong>！</li>
</ul>
<p><strong>比远端建仓整整早了 20 秒！</strong>
这意味着我根本没有犹豫哪怕一分钟。在被踢出群、确定 token 彻底失效后的第一时间，我在本地代码库里敲下了那条改变青弋命运的第一个提交：</p>
<blockquote>
<p><strong>Commit <code>f838d09d</code> (15:17)</strong>: <code>Add self-hosted rank server</code></p>
</blockquote>
<p>这不是改 README，也不是改几行提示文字。单次提交就增加了约 <strong>913 行</strong>核心代码：</p>
<ul>
<li><code>rank_server/app/main.py</code>：约 740 行完整的 FastAPI 服务；</li>
<li>包含 Dockerfile、docker-compose、<code>.env.example</code>、依赖配置、独立 README；</li>
<li>全面重构原 <code>wwapi.py</code> 与配置系统，加入 <code>WavesRankBaseUrl</code> 动态路由！</li>
</ul>
<p>在 6 月 21 日创建仓库后的这一个下午到深夜，我几乎把键盘敲出了火花，连续推送了<strong>高密度的十连提交</strong>，死死围绕“自建服务、解绑认证、自我更新、代理容灾”四件事高速急行军：</p>
<ol>
<li><strong>15:17 <code>f838d09d</code></strong> — <code>Add self-hosted rank server</code>（建立自托管排行服务器，第一技术支点）；</li>
<li><strong>15:35 <code>974afa3f</code></strong> — <code>Add qy self update commands</code>（加入 <code>qy</code> 自更新命令，项目必须拥有自己拉取自己更新的独立通道）；</li>
<li><strong>16:24 <code>846d2436</code></strong> — <code>Improve rank server Docker build downloads</code>（优化自建服构建与下载流程）；</li>
<li><strong>16:47 <code>cbb769cb</code></strong> — <code>Use dynamic rank server URLs</code>（排行地址动态配置，彻底打破对单一远端服务器的死绑定）；</li>
<li><strong>18:02 <code>0a7b484d</code></strong> — <code>Disable external auth checks for local rank upload</code>（<strong>关键一步</strong>：本地排行上传直接拔除外部认证检查，彻底脱离原外部授权体系）；</li>
<li><strong>18:46 <code>5dfd22d8</code></strong> — <code>Retry captcha requests with proxy pool</code>（验证码请求失败自动接入代理池重试）；</li>
<li><strong>18:58 <code>b64e5f27</code></strong> — <code>Authenticate qy self update fetches</code>（强化自更新获取认证）；</li>
<li><strong>19:34 <code>25f4486d</code></strong> — <code>Cache proxy pool fetches</code>（代理池本地缓存，避免请求打满）；</li>
<li><strong>19:42 <code>e2909cf7</code></strong> — <code>Repair broken remote refs during self update</code>（修复自更新 remote ref 损坏）；</li>
<li><strong>23:02 <code>b65fc9bb</code></strong> — <code>Restore local proxy captcha retry</code>（闭环本地代理重试）。</li>
</ol>
<p>第一天的目标无比简单直接：<strong>先活下来！先把服务器和上传通道抢救回来！</strong></p>
<h3>4.4 6 月 22 日：从“服务自建”走向“评分与安全逻辑本地化”</h3>
<p>如果 6 月 21 日夺回的是服务器，那么 6 月 22 日则是从死人堆里爬出来的算法大决战。</p>
<p>清晨 08:23 开始，我喝着浓咖啡，开启了把闭源黑盒剥皮抽筋的硬仗：</p>
<ul>
<li><strong>08:23 <code>5c4ac814</code></strong> — <code>Add local safety resource store</code>（336 行改动，建立本地资源与 safety 安全状态存储）；</li>
<li><strong>08:28 <code>f215bb80</code></strong> — 构建资源变动主动刷新；</li>
<li><strong>08:47 <code>bc2e1010</code> &amp; 09:16 <code>089d391e</code></strong> — 活动数据与公开挑战记录全部迁移至自建排行服务；</li>
<li><strong>09:26 <code>b9bffa5f</code></strong> — <code>fix: disable remote safety auth fallback</code>（<strong>标志性提交</strong>：删除 <code>safety.py</code> 31 行，彻底关闭 remote safety auth fallback！本地认证失败了哪怕报错，也决不再像摇尾乞怜一样悄悄回退到外部远端认证！这是技术尊严的底线）；</li>
<li><strong>10:49 <code>c4498a4f</code></strong> — 修复 NapCat JSON 抽卡 URL 与 PC 浏览卡池拖拽；</li>
<li><strong>11:07 <code>fe9897c2</code></strong> — 将“武器精炼”规范为“谐振 N 阶”，全面对齐鸣潮官方游戏术语；</li>
<li><strong>12:07 <code>b6a1d382</code></strong> — <code>fix: add local scoring fallback</code>（<strong>早期最大的技术提交之一：总 diff 达 6,764 行，新增 6,655 行！</strong> 修改 <code>calculate.py</code>、<code>damage.py</code>，手写并补充了海量角色的 <code>calc.json</code> 与本地算法，本地评分框架正式成型）；</li>
<li><strong>12:33 <code>b7bae3dc</code> &amp; 12:37 <code>131c8002</code></strong> — 修复自更新别名与镜像源兜底。</li>
</ul>
<p>紧接着，下午 15:05，迎来了奠定整个 EchoMatrix 架构基石的千古一战：</p>
<blockquote>
<p><strong>15:05 Commit <code>84af6d89</code></strong>: <code>Replace closed build scoring with local weights</code></p>
</blockquote>
<p>这个提交总变动高达 <strong>5,020 additions / 822 deletions</strong>：</p>
<ul>
<li>新增了约 <strong>4,356 行的 <code>local_weight_data.json</code></strong>；</li>
<li>新增了约 <strong>545 行的 <code>local_weight_score.py</code></strong>；</li>
<li>大刀阔斧地彻底斩断了与闭源 <code>waves_build</code>、外部下载、伤害注册的一切牵扯，将 <code>_local_get_calc_map</code>、<code>_local_calc_phantom_score</code> 变为纯 Python 实现。</li>
</ul>
<p>它向全社区宣告：<strong>闭源黑盒构建评分（closed/build scoring）时代彻底终结，属于我们的本地权重自研时代（local weight scoring）正式开启！</strong></p>
<p>夜幕降临时（22:54 <code>b4b2407c</code> / 23:20 <code>7668186a</code>），我又顺带重构了 PC 抽卡助手与手机获取方式，将下载全部收敛为安全的本地 zip 包。</p>
<h3>4.5 6 月 23 日：搭建属于自己的 API 与请求基础设施</h3>
<p>把算法拿回本地后，我没有止步于“把逻辑死死硬编码在 Bot 内部”。6 月 23 日，我开始给它搭建现代化工程基础设施：</p>
<ul>
<li><strong>14:09 <code>5f37e9f3</code></strong> — <code>Use HTTP scoring API with fallback</code>（新增约 231 行 <code>scoring_api.py</code>，形成“<strong>本地自算能力 + 独立 HTTP scoring API + 智能 fallback 兜底</strong>”的高弹性三层架构）；</li>
<li><strong>20:02 <code>9f836ff6</code></strong> — 计算模板从 scoring API 获取，彻底废弃了曾经不透明的“静默默认模板回退”；</li>
<li><strong>22:04 <code>656123c8</code></strong> — 新增约 347 行 <code>cliproxy.py</code>，将面板刷新全量路由到代理层，并引入 <strong>SID 自动轮换机制</strong>；</li>
<li><strong>22:59 <code>ba857755</code></strong> — 实现<strong>单请求级 SID 安全隔离</strong>与<strong>角色面板高并发并行刷新</strong>！</li>
</ul>
<h3>4.6 6 月 24 日：EchoMatrix 诞生与视觉系统的第一颗火种</h3>
<p><strong>2026 年 6 月 24 日 10:53</strong>，历史在这里翻开了崭新的一页：</p>
<blockquote>
<p><strong>Commit <code>e608c6ca</code></strong>: <code>Rebrand display name to EchoMatrix and update footer assets</code></p>
</blockquote>
<p>这不仅是 README 里的改名，而是整套系统的脱胎换骨：网页模板、云登录/邮箱模板、黑白双色 Footer 资源、系统配置、Help 菜单、pyproject 以及自建排行服务端文档，全线更名为 <strong>EchoMatrix（回音矩阵）</strong>！</p>
<p>紧接着在当天下午：</p>
<ul>
<li><strong>13:25 <code>696f6384</code></strong> — 引入评分帮助卡片与独立的渲染缓存机制；</li>
<li><strong>15:28 <code>16386bcb</code></strong> — <code>Add EchoMatrix fonts and color design tokens</code>（<strong>极其关键的美学起点</strong>：一次性引入了 Iosevka、MiSans、Tektur、优设标题黑四大专属字体，编写了 <code>_variables.css</code>，定义了第一套属于 EchoMatrix 的色彩 Token 设计变量）；</li>
<li><strong>18:09 <code>00c13bbb</code></strong> — <code>Refactor char card colors to EchoMatrix tokens</code>（单次重构 <code>draw_char_card.py</code> 带来 <strong>2,394 additions / 2,381 deletions</strong>，让角色面板全面换装 EchoMatrix 专属色彩系统！）。</li>
</ul>
<h3>4.7 6 月 25～26 日：悲壮但极其宝贵的第一次 UI 大实验（上线-崩溃-回滚-加固-再上线）</h3>
<p>很多开源项目只会吹嘘自己上线了什么，而不敢承认中途的狼狈。但我愿意诚实地记录下 6 月 26 日那惊心动魄的 24 小时：</p>
<p>6 月 26 日凌晨 00:19，我迫不及待地提交了 <code>ae6fe0f5</code>（新增 1,616 行），首次引入组件化的 <code>echomatrix_ui</code>（拆解出 adapter、illustration、nameplate、chains、skills、weapon、echo card 等独立组件）。
然而在 00:34 全量切换后，实际生产环境出现了未预料的组件崩溃，仅仅过了 14 分钟：</p>
<blockquote>
<p><strong>00:48 <code>39060be7</code></strong> — <code>Revert to original char card UI</code>（<strong>第一次无奈回滚！</strong>）</p>
</blockquote>
<p>我不服气，迅速转向第二条技术路线——HTML 渲染。中午 11:58，我推了 <code>8194ac9a</code>（纯新增 1,202 行 <code>char_panel.html</code> 与 HTML adapter/renderer），并在 12:08 挂载上线。
结果因为 Chromium 页面池抖动和缺少部分老数据兜底，仅仅 23 分钟后：</p>
<blockquote>
<p><strong>12:31 <code>91e6cf6e</code></strong> — <code>Revert char panel to original PIL UI</code>（<strong>第二次痛苦回滚！</strong>）</p>
</blockquote>
<p>换作一般人，连续两次大翻车可能就彻底放弃 HTML 了。但我没有慌：</p>
<ol>
<li><strong>14:12 <code>d16033da</code></strong>：先冷静下来加固旧版 V1 PIL，把缺资源、缺数据的空指针全堵死；</li>
<li><strong>17:34 <code>001f9556</code></strong>：HTML 路线第三次杀回，全面改用 Base64 图片直传；</li>
<li><strong>17:42 <code>15806cc5</code></strong>：针对 Chromium 内存泄露（Page Pool OOM），将图片在内存中预压缩为显示尺寸并转 WebP，彻底治好了内存崩盘；</li>
<li><strong>17:51 <code>daae5b9b</code></strong>：修复连续渲染变横条、页面池定时清理、空声骸防崩；</li>
<li><strong>18:06 <code>faad9b1e</code></strong>：引入 Oswald + Tektur 字体，调亮毛玻璃层，调整字阶；</li>
<li><strong>19:36 到 21:13</strong>：连续打出 <code>3ebe4da9</code>、<code>b7e49dd1</code>、<code>f9b11f5a</code>、<code>47f3c701</code>、<code>7beee236</code>、<code>ca64a45c</code> 六连重构——副词条改单列防截断、左侧攻/暴关键数值放大、思源黑体暖金调色、全幅角色图与右上角大评分卡！</li>
</ol>
<p><strong>经历了两起两落、内存暴走与六次淬火，EchoMatrix 的 HTML 视觉革命终于在 6 月 26 日深夜稳稳地立住了！</strong></p>
<h3>4.8 6 月 27～30 日：成熟的分支哲学——“吸收上游，但保留自己的灵魂”</h3>
<p>在 6 月末的最后几天，我修复了角色列表失败拖垮面板的边界 bug（<code>8f375d17</code>）。随后在 <strong>6 月 30 日</strong>，我执行了一次具有战略意义的合并：</p>
<blockquote>
<p><strong>Commit <code>916167c4</code></strong>: <code>Merge upstream/main</code></p>
</blockquote>
<p>这确立了 EchoMatrix 后续数月一直坚持的开源分支哲学：
<strong>我们不是盲目闭门造车，也不是向上游跪求施舍。我们是一个拥有独立主权的分支：上游优秀的游戏基础数据与公共修复，我们选择性吸收；而我们自研的自建排行、本地算法、HTTP 独立 API、抽卡登录和美学系统，坚决寸步不让！</strong></p>
<pre><code class="language-mermaid">timeline
    title 2026年6月技术突围 189 Commit 关键节点
    2026-06-21 15:17 : Commit f838d09d 搭建自有 Rank Server (提早20秒落子)
    2026-06-21 18:02 : Commit 0a7b484d 本地排行上传全面拔除外部认证
    2026-06-22 09:26 : Commit b9bffa5f 彻底禁用 remote safety fallback 拒绝妥协
    2026-06-22 12:07 : Commit b6a1d382 新增 6655 行本地评分回退机制
    2026-06-22 15:05 : Commit 84af6d89 删除闭源构建依赖，重写 545 行本地权重算法
    2026-06-23 14:09 : Commit 5f37e9f3 上线独立 HTTP 评分 API 与会话安全隔离
    2026-06-24 10:53 : Commit e608c6ca 正式更名 EchoMatrix，完成技术与品牌独立
    2026-06-24 15:28 : Commit 16386bcb 引入 Iosevka/MiSans/Tektur 与 Design Tokens
    2026-06-26 19:36 : 经历两次回滚与防 OOM 加固，HTML 角色面板极简重构成功
    2026-06-30 23:59 : Commit 916167c4 确立“选择性吸收上游、坚决保留自研架构”原则
</code></pre>
<hr>
<h2>【第五章·自研深水区（2026.07 ～ 2026.09）：造轮子的狂欢与全栈自研】</h2>
<p>一旦尝到了“自主可控”的甜头，就再也回不去了。</p>
<p>在 6 月份完成紧急脱钩之后，7 月到 9 月，我整个人进入了一种极度亢奋的研发状态。既然地基全是我自己的了，那我就要把过去上游做不到、不敢做、做不好的功能，统统在 EchoMatrix 上实现一遍！</p>
<h3>5.1 7 月初：从恢复功能走向产品扩张（Web Token 登录与独立刷新 HTML）</h3>
<p>进入 7 月，EchoMatrix 不再满足于仅仅当一个“修好了 bug 的替代品”。我开始以极高的频率为它增加此前原项目完全不具备的独创能力：</p>
<ul>
<li><strong>7 月 2～4 日</strong>：<ul>
<li><code>187ca1df</code>：刷新面板新增 <code>concat_diff</code> 对比模式，可以无缝拼合前后两次的数据差值；</li>
<li><code>30c6eb5c</code> &amp; <code>bb1246c0</code>：上线 Web Token 登录体系，并支持统一模板命名的外置模式；</li>
<li><strong>7 月 4 日 <code>a20d1d04</code></strong>：发布 <code>EchoMatrix refresh HTML panel</code>（新增 <code>refresh_panel.html</code> 216 行、适配层 157 行），使角色刷新结果第一次拥有了专属的 EchoMatrix HTML 视觉卡片！</li>
</ul>
</li>
<li><strong>7 月 8 日：排轴技术的先声（<code>9a868a70</code>）</strong>：<ul>
<li>首次在武器面板与角色查询中引入 <strong><code>rotation-based expected damage</code>（基于循环轴的期望伤害）</strong>！这是后续整个排轴 DPS 引擎在数学底层的最初火种；</li>
</ul>
</li>
<li><strong>7 月 17 日：自建抽卡云登录（<code>325ea5fe</code>）</strong>：<ul>
<li>正式上线 <code>self-hosted Waves gacha login</code>，抽卡记录导出彻底脱离第三方网页，云端直存本地数据库，后续累计执行达 <strong>14,864 次</strong>！</li>
</ul>
</li>
<li><strong>7 月 19 日：本地优先技能伤害面板（<code>38895b6e</code> &amp; <code>bfd41100</code>）</strong>：<ul>
<li>这是一个里程碑式的巨幅提交：一次性引入了约 <strong>6 万行数据与代码</strong>（包含 <code>wutheringgg_skill_data.json</code>、<code>rotation_damage.py</code> 以及完整的本地技能伤害计算面板）；</li>
<li>紧接着在 <code>bfd41100</code> 中引入了超过 <strong>9 万行</strong>的分层伤害情景分析与测试数据！</li>
<li>随后在 <code>acb42da8</code> 中，我主动克制地精简了面板，仅保留核心关键技能——<strong>“不是算得越多就应该一股脑全堆在卡片上，克制与清晰才是优秀界面的灵魂”</strong>；</li>
</ul>
</li>
<li><strong>7 月 21～25 日</strong>：<ul>
<li>矩阵单队排行、群排行翻页（<code>274436d1</code>）、矩阵配队解析（<code>e6e8070f</code>），抽卡 180 天超保底截断合并与告警机制相继落地。</li>
</ul>
</li>
</ul>
<h3>5.2 8 月 1～2 日：评分解释与“正确性优先于功能”的经典回滚案例</h3>
<p>在 8 月初，我经历了一次极具工程教育意义的突发风波：</p>
<p>8 月 2 日，为了让声骸打分更透明，我提交了 <code>6fc380e8 explain per-echo score composition</code>（这也是 <code>CHANGELOG.md</code> 第一次正式入库的提交）。我试图把每个声骸的各词条打分细目直接拆解展示给玩家。</p>
<p>然而代码推上去后，我很快在后台监控中察觉到异常：这次改动轻微破坏了原有评分 API 的权威结果尺度，导致批量面板契约发生了细微漂移！
许多开发者在这种时候往往会选择“打补丁硬撑”，但我深知评分是整个 Bot 的公信力底线。我连续提交了多轮修复进行排查，在确认无法在短时间内完美自洽后，做出了极其果断的决定：</p>
<blockquote>
<p><strong><code>aaf57481</code> &amp; <code>8a0a68d6</code></strong>: <code>revert: restore stable scoring before batch API regression</code></p>
</blockquote>
<p><strong>坚决回滚！宁可不要新功能，也绝不能让群友查到有哪怕 1 分偏差的面板！</strong></p>
<p>回滚之后，当天深夜，我冷静下来重构了沙盒隔离机制，以更加安全严谨的方式重新推出了 <code>21eb0923 add safe update history and score explanations</code>：</p>
<ul>
<li>新增了安全更新记录 UI 与安全的 Git 回滚自动化测试；</li>
<li>正式在 Bot 内部引入了管理命令 <strong><code>ww滚蛋+序号</code></strong>（让维护者可以在手机端一键安全回退版本）；</li>
<li>在更新记录中首次明确清晰地区分了 <code>origin/main</code>、<code>upstream/main</code> 以及本地待同步状态！</li>
</ul>
<p>这次风波在仓库历史上留下了极其宝贵的一笔：<strong>它确立了 EchoMatrix “正确性永远压倒一切炫技”的工程价值观。</strong></p>
<h3>5.3 8 月 4～6 日：排轴 Web 应用程序与 2.2 万行超级提交</h3>
<p>渡过了评分可解释性的洗礼后，8 月 4 日到 6 日迎来了整个项目最波澜壮阔的一次功能大爆发：</p>
<ul>
<li><strong>8 月 4 日 00:13（<code>2a5fe27d</code>，单次纯新增 4,701 行，含 1,061 行 CSS）</strong>：<ul>
<li>正式上线 <code>wutheringwaves_dps</code> 模块：涵盖引擎、模型、路由、存储、测试与完整的 Web 排轴页面；</li>
<li>玩家只要在群里发送 <code>ww排轴&lt;角色&gt;</code>，就能拿到专属的编辑外链，在手机或电脑浏览器中拖拽时间轴、绑定技能动作、实时计算秒伤 DPS！</li>
</ul>
</li>
<li><strong>8 月 6 日（<code>72e803e7</code>，惊人的 21,982 additions / 427 deletions 超级巨幅提交）</strong>：<ul>
<li>将单人排轴一举扩充为<strong>三人队伍协同时间轴</strong>！</li>
<li>增加了群聊交互式选队、AI 自然语言队伍解析、一次性临时安全鉴权、强一致性缓存；</li>
<li>前端 Web 增加了响应式泳道、队伍候选卡片、撤销/重做（Ctrl+Z / Ctrl+Shift+Z）、批量编辑浮动条、以及移动端优雅的 Bottom Sheet 底部抽屉组件！</li>
</ul>
</li>
<li><strong>8 月 24 日（<code>xwaves-weight</code> 独立流水线）</strong>：<ul>
<li>编写了自动化抓取游戏解包技能每级倍率、自动推导各属性词条收益权重、离线回归校验的完整脚本。</li>
</ul>
</li>
</ul>
<p>至此，EchoMatrix 不仅完全摆脱了对外部打分算法的依赖，甚至在排轴深度和交互体验上，彻底拉开了与其他同类机器人的断代差距！</p>
<h3>5.4 群友共筑的权重演化：连续三个版本的独立权重突围</h3>
<p>说句心里话，自研评分和权重算法从来不是一蹴而就的“天才神话”，甚至在很长一段时间里，<strong>我们的权重算法一直存在着各种各样的问题和争议</strong>。</p>
<p>鸣潮的新角色技能机制一个比一个复杂：有的吃共鸣效率转化，有的吃特定伤害加成，有的依赖独特的回路能量循环。每当新角色上线，最初由代码自动化推导出来的权重，总会遇到各种边缘极端配置或者玩家实战习惯的偏差，群里经常会有“为什么我这个属性打分偏低？”的疑惑。</p>
<p><strong>但万幸的是，青弋和 EchoMatrix 从来不是我一个人在孤军奋战。</strong></p>
<p>在整个 7 月、8 月和 9 月里，群里无数硬核玩家、攻略组大佬和热心群友成了我最强大的后盾。大家在群里疯狂测试、一条条扣数值细节、提 issue、私聊我发实测伤害截图，甚至直接手算收益曲线帮我校准。在群友们持续不断的提出建议和倾力相助下，我和大家一起熬夜复盘、反复调参，不断优化新角色的权重模型。</p>
<p>功夫不负有心人，到了今天，我们已经做到了<strong>连续三个版本都稳定推出了新角色的独立权重更新</strong>！每一个新角色上线，玩家都能第一时间在青弋这里查到最契合理论期望的独立打分。这种由开发者和全体群友共同打磨、一点一滴迭代出来的算法，比任何冷冰冰的外部黑盒都要珍贵一万倍。</p>
<h3>5.5 每天中午 12:40 的秘密：分秒不差的定时自动重启与守护自愈</h3>
<p>在翻阅 <code>Gscore_系统服务日志.jsonl</code> 时，很多人可能会注意到一个极其规律、甚至带着某种强迫症色彩的运维记录：
在 9 月下旬到 10 月初，<code>gscore.service</code> 记录了整整 <strong>11 次退出（Main process exited, status=137）</strong>：</p>
<ul>
<li>2026-09-24 12:40:00</li>
<li>2026-09-25 12:40:00</li>
<li>2026-09-27 12:40:00</li>
<li>2026-09-28 12:40:00</li>
<li>2026-09-29 12:40:00</li>
<li>2026-09-30 12:40:01</li>
<li>2026-10-01 12:40:00</li>
<li>2026-10-02 12:40:00</li>
<li>2026-10-03 12:40:01</li>
<li>2026-10-04 12:40:01</li>
</ul>
<p>外人猛一看可能会以为：“天啊，怎么每天中午都在崩溃？”
但只要仔细看时间戳就会哑然失笑：<strong>分秒不差，全在每天中午 12:40:00！</strong></p>
<p>世上哪有天天准时在同一秒崩溃的 Bug？<strong>这其实是我专门为机器人配置的每日中午定时自动维护重启！</strong></p>
<p>因为每天中午 11:30 到 12:30 是群友们午休刷本、查面板的一个集中高峰期，几百个群同时请求卡片渲染，无头浏览器和 Python 进程会产生庞大的内存驻留和临时缓存。为了确保小主机在下午和夜间高峰能够始终保持极致轻盈敏捷，我编写了定时维护任务，在午高峰刚过的 <strong>12:40 准点向服务发送轮换重置指令</strong>（通过发送强制终止信号清理进程环境，因此 systemd 日志里记录为 status=137）。</p>
<p>紧接着，我配置的 systemd 守护进程会在 <strong>15 秒内</strong>自动平滑拉起一个干净健壮的全新实例：</p>
<pre><code class="language-text">systemd: gscore.service: Scheduled restart job, restart counter is at X.
systemd: Starting gscore.service - GSUID Core Service...
systemd: Started gscore.service - GSUID Core Service.
</code></pre>
<h2>整整 <strong>13 次自动拉起重启</strong>，每次只需 15 秒的短暂呼吸，后台立刻恢复满血运作。没有一次发生死机，没有一次需要人工干预。这种近乎艺术般的自动化守护机制，正是这台工控小主机能够稳健跑满近 300 天的底层秘诀！</h2>
<h2>【第六章·美学觉醒与设计系统（2026.08）：从机器人发图片到 EchoMatrix 视觉体系】</h2>
<p>很多人在复盘一个 Bot 项目的发展史时，总是把视线牢牢钉在后端的接口、协议、数据库和算法上，仿佛前端 UI 只是开发者闲来无事换了套好看的皮肤。</p>
<p>但在 2026 年的 EchoMatrix 身上，<strong>UI 从来不是后期顺手的修修补补，而是与后端算法并驾齐驱的第二条灵魂主线！</strong></p>
<p>如果说 6 月底的技术突围是打碎骨头重铸内脏，那么整个 8 月份，就是 EchoMatrix 真正确立自己视觉主权的美学觉醒期。我们经历了一条从早期的“PIL V1 像素画布” → 到“HTML V2 现代排版” → 再到“统一 EchoMatrix 视觉设计系统” → 最终跨越为“独立 Web 交互应用”的壮阔演进史。</p>
<h3>6.1 8 月 2 日：维护者视角的双轨更新记录</h3>
<p>这种美学意识的萌芽，最初甚至体现在最不起眼的“更新日志”上。</p>
<p>8 月 2 日以前，机器人查更新只是一段枯燥的 git commit 纯文本列表。而在这一天，我重新设计了 <code>ww更新记录</code>，把它变成了一张优雅的<strong>双轨信息布局卡片</strong>：</p>
<ul>
<li>画面左侧是属于我们自己的专属分支 <code>origin/main</code>；</li>
<li>画面右侧是上游原项目的参考线 <code>upstream/main</code>；</li>
<li>底部清晰标注当前本地待同步与已脱钩的演进状态；</li>
<li>同时在工程底层保留了当 HTML 渲染引擎异常时自动无缝回退到 PIL V1 的容灾方案。</li>
</ul>
<p>这是我第一次有意识地将“专业维护者眼中的技术网络拓扑”，翻译成普通群友一眼就能看懂的精美界面。</p>
<h3>6.2 8 月 3～4 日：从“机器人发图片”跨越到真正的 Web 应用</h3>
<p>紧接着，排轴功能把这种交互野心推向了顶峰。</p>
<p>鸣潮的三人循环排轴包含复杂的动作帧数、合刀切人和技能协同，一张静态图片根本承载不了这么大的交互量。8 月 3 日到 4 日，我没有选择在聊天框里让群友狂发繁琐的指令，而是直接手搓了一个运行在手机和电脑浏览器里的<strong>排轴 Web 应用程序</strong>：</p>
<ul>
<li><strong>苹果风毛玻璃质感（Glassmorphism）</strong>：左侧是动作与技能树目录，中间是支持毫秒级缩放的时间轴泳道与伤害轨，右侧是动态响应的实时总伤、秒伤 DPS 仪表盘；</li>
<li><strong>全端响应式与黑白双主题</strong>：无论是深夜躺在床上用手机横屏拖拽，还是在电脑桌前精准微调，界面都能完美适配；</li>
<li><strong>队伍时间轴 V2 全面进化</strong>：次日我火速更新了 V2，加入预设队伍卡片、快捷候选模板、多标签页切换、移动端底部抽屉 Sheet、以及完整的 Undo/Redo（撤销重做）和浮动批量编辑工具栏！</li>
</ul>
<p>在这一刻，EchoMatrix 已经彻底击穿了“聊天框 Bot”的刻板边界，变成了一个具有完整交互生命力的小型专业产品。</p>
<h3>6.3 8 月 22 日：持有率卡片 V2 与 800px 移动端抗压缩革命</h3>
<p>以往为了展示动态效果，很多插件喜欢用 GIF 动图。但在高频并发的群聊里，GIF 不仅渲染慢、体积巨大，而且很容易在手机端卡成 PPT。</p>
<p>8 月 22 日，我彻底革掉了 GIF 的命，上线了全新的<strong>持有率卡片 V2</strong>：</p>
<ul>
<li><strong>静态高级感取代劣质动图</strong>：引入 TOP1 角色高光立绘淡入背景、精美的环形持有率占比图、本期卡池唤取统计与保底抽数直方图；</li>
<li><strong>确立 800px 手机优先单列画布规范</strong>：这是针对手机 QQ 和聊天软件长期痛点的一次降维打击。移动端聊天软件在传输图片时，会对大图进行极其粗暴的有损压缩。为了保证卡片发到群里字字清晰，我将画布宽度严格锁死在 <strong>800px 黄金尺寸</strong>；</li>
<li><strong>微观视觉调优</strong>：TOP10 角色使用独立大卡，其余角色采用双列紧凑卡；重新调整字号阶梯、发丝级精细进度条、菱形状态游标、金色关键数字强调，大幅拉高深色背景下的文本对比度，确保即使经过腾讯最严苛的图片压缩，角色数据依然锐利清晰！</li>
</ul>
<h3>6.4 8 月 23 日：角色面板的划时代大改（HTML V2 确立）</h3>
<p>如果说持有率卡片是一次战术练兵，那么 8 月 23 日，就是整个鸣潮社区角色面板 UI 史上最重要的一次技术革命。</p>
<p>在这一天，我全面吸纳了过去老版 PIL 的沉淀，但彻底摒弃了老旧像素拼接的落后思路，正式推出了<strong>划时代的 HTML V2 角色面板</strong>：</p>
<ol>
<li><strong>属性信息区重塑</strong>：确立了“<strong>图标 ｜ 中文名称 ｜ 细腻点线 Leader 引导线 ｜ 最终数值</strong>”的经典排版规范；</li>
<li><strong>武器模块补全灵魂</strong>：补齐了武器星级金色描边、精炼/谐振徽章、突破阶段菱形，以及此前一直缺失的主副词条精准展示；</li>
<li><strong>共鸣链视觉大升级</strong>：将原本局促的 26px 小圆点大幅放大至 34px，并且不再用简单数字，而是引入了<strong>游戏内真实的共鸣链命座图标</strong>——解锁时散发角色属性专属流光，未解锁时呈现静谧的高级灰度；</li>
<li><strong>声骸卡网格化排布</strong>：5 格声骸全部重构为规整的网格化词条卡片，每一条副词条都附带属性图标、单项评分以及主副属性贡献百分比；</li>
<li><strong>统一区块头设计语言</strong>：整个面板的六大核心板块，统一收拢为“<strong>元素专属色竖条 + 中文主标题 + 英文副标 + 右侧聚合统计</strong>”的标准视觉节奏；</li>
<li><strong>抗压缩文字字号抬升</strong>：果断将之前容易被聊天软件糊掉的 7<del>8px 微型字体，全线抬高至 10</del>12px，阅读体验瞬间质变；</li>
<li><strong>显示层 S 档细分与色彩语义统一</strong>：在不改变底层严谨总分算法的前提下，首次将大 S 档细分为 <strong>S+ / S / S-</strong>，满足玩家追求极限极品声骸的自豪感；顶部评分条增加实际得分数字说明；将副词条属性色彩与 S/A/B 档位严格拉齐；底部开辟专用的反馈群公告栏。</li>
</ol>
<p>更硬核的是在这一天，我排查并解决了一大堆深藏在前端渲染底层的幽灵 Bug：修好了字体异步加载导致的“只剩黑框骨架却没有文字”的空壳图、修好了武器主副词条漏渲染、修好了超长声骸名字与打分重叠遮挡……HTML V2 从此真正接管了全局。</p>
<h3>6.5 8 月 24 日：视觉体系全面扩散与“空壳探针”工程排险</h3>
<p>8 月 24 日，EchoMatrix 的设计语言开始席卷整个机器人的全部功能面：</p>
<ul>
<li><strong>权重面板 V2</strong>：过去的 <code>ww&lt;角色&gt;权重</code> 是个恐怖的“16 行 × 5 列裸数字矩阵”，普通玩家根本看不懂。在这一天，我把它彻底改造成了逐格可视化权重条、按属性列归一化、自动按重要性降序排序、零收益词条淡化显隐，并补充了四向技能权重雷达分布、副词条优先级指引和推荐主词条标尺；</li>
<li><strong>更新面板 V2</strong>：同步采用统一区块头；角色卡做成紧凑版缩小声骸卡；最具创意的是引入了<strong>未变更角色整体压暗机制</strong>——群友更新面板时，只有这次数值真正提升的角色会高亮浮现，让玩家一秒看清“我这波体力到底强化了谁”！</li>
</ul>
<p>而在 8 月 24 日这天深夜，我还亲历了一起令人拍案叫绝的“UI 工程事故”：
有群友跑来找我：“作者，你怎么说更新了 V2 面板，我用 <code>ww更新面板</code> 吐出来的卡片还是老版 PIL 啊？”
我一查日志，后台代码明明早就升级了。我花了几个小时一步步断点调试，才终于揪出了罪魁祸首——原来在 <code>render.py</code> 内部，为了防止浏览器渲染出空白页面，写了一套“空壳检测探针”。而这个探针的选择器当初被写死了，导致新的更新面板 HTML 模板虽然渲染得漂漂亮亮，却因为类名不一致，每次都被探针误判为“渲染失败的空壳”，然后后台偷偷摸摸回退到了老版 PIL！</p>
<p>发现这个隐患后，我当天重构了整个渲染管道：</p>
<ul>
<li>为每一个业务模板<strong>独立登记专属的内容探针选择器</strong>；</li>
<li>增加了离线无头预览脚本；</li>
<li>建立了<strong>UI 探针回归自动化测试机制</strong>！</li>
</ul>
<p>这意味着，EchoMatrix 的前端视觉已经不仅仅是“画画图”，它已经演化出了一套拥有自己的设计规范（Design System）、防倒退兜底机制与自动化测试管线的成熟工程体系！</p>
<h3>6.6 8 月 27 日：渲染性能工程飞跃（1.36s → 0.08s 的神话）</h3>
<p>界面变漂亮了，新的挑战立刻接踵而至：<strong>渲染性能</strong>。</p>
<p>群聊环境对延迟极其苛刻，如果用户发送查询，Bot 过了三四秒才吐出卡片，群友就会觉得卡顿。在 8 月 27 日凌晨（commit <code>a1c53a34</code>），我开展了一场深度的渲染管线极限压榨：</p>
<ol>
<li><strong>修复时区与业务逻辑偏差</strong>：彻底解决了 Linux Docker 容器 UTC 时区导致体力时间比北京时间慢 8 小时的顽疾，修正了“今天/明天”跨天误判，并将深塔/海墟剩余时间统一按天向下取整；</li>
<li><strong>合并双数据源竞争</strong>：修复了持有率计算因两个数据源微小差异导致前后两次发图不一致的问题；</li>
<li><strong>引入字体与模板预热机制（Font &amp; DOM Warmup）</strong>：通过在后台驻留无头渲染进程预热核心字体与样式，让单图平均渲染耗时从 <strong>1.36 秒断崖式暴跌至 0.08 秒</strong>！</li>
<li><strong>冷启动首图渲染从 1.52 秒骤降至 0.11 秒</strong>！</li>
</ol>
<p>这意味着 EchoMatrix 的前端不仅做到了美观，更做到了毫秒级响应的工业级吞吐能力！</p>
<h3>6.7 9～10 月：成熟的持续演进（选择性同步与本地逐技能引擎落地）</h3>
<p>9 月到 10 月初，EchoMatrix 进入了成熟的平稳迭代期：</p>
<ul>
<li><strong>9 月 19 日（<code>b5248639</code>）大型选择性同步</strong>：<ul>
<li>面对上游 3.6.0b 的更新，我们再次贯彻了分支主权原则：只同步纯游戏数据补丁和公开资源（如 Markdown 兑换码支持、排行立绘缩放与偏移、新资源镜像源），而坚决完整保留我们自己的 V2 模板、排轴 DPS、持有率卡、本地独立算法与安全机制；</li>
<li>顺手修复了 HTML 面板左上角头像未铺满圆框、列表模式空伤害条等一系列视觉细节。</li>
</ul>
</li>
<li><strong>10 月 2 日（<code>c09a0870</code>）修复声骸总排行</strong>：<ul>
<li>在自建排行榜中补充了声骸总排行接口，同步 3.7 游戏数据，并在 CHANGELOG 中郑重承诺：<strong>绝不重新引入闭源伤害委托，坚守纯血开源！</strong></li>
</ul>
</li>
<li><strong>10 月 3 日 02:31（<code>7340e4cc</code>，终极里程碑提交）</strong>：<ul>
<li>单次提交带来 <strong>2,420 additions / 13 deletions</strong>，正式将全新的本地逐技能伤害引擎全量接入角色面板；</li>
<li><strong>全面覆盖 58 个角色、1,121 个战斗动作</strong>；</li>
<li><strong>23 项离线回归全绿通过，330 项数值与原 JavaScript 对照完全一致，4,484 次动作计算严密闭环</strong>；</li>
<li>在 CHANGELOG 中诚实地保留了 <strong>356 个 <code>unresolved_rules</code></strong> 作为持续深化的边界——从 6 月的“仓促自救”，升华为一套“有来源、有测试、有对照、有边界”的严谨工程科学体系！</li>
</ul>
</li>
</ul>
<hr>
<h2>【第七章·金秋破晓（2026.09.30）：数据异动与重回巅峰的奇迹】</h2>
<h3>7.1 9 月 30 日：垂直拉升的历史性拐点</h3>
<p>如果说 6 月是至暗突围，那么 2026 年 9 月 30 日，就是属于青弋和 EchoMatrix 的荣耀时刻。</p>
<p>在整个 9 月份，机器人的日消息量通常平稳在 1,200 条左右，活跃群在 60 个上下。但到了 <strong>9 月 30 日</strong>这一天，数据监控看板上的折线突然以一种令人瞠目结舌的姿态暴冲而起：</p>
<table>
<thead>
<tr>
<th>运营指标</th>
<th>9 月前 28 天中位数/日均</th>
<th>2026 年 9 月 30 日实测值</th>
<th>涨幅</th>
<th>稳健异常度 (Robust z-score)</th>
</tr>
</thead>
<tbody><tr>
<td><strong>官方平台总消息</strong></td>
<td>1,220 条</td>
<td><strong>2,903 条</strong></td>
<td><strong>+137.9%</strong></td>
<td>—</td>
</tr>
<tr>
<td><strong>官方主动上行用户</strong></td>
<td>196 人</td>
<td><strong>420 人</strong></td>
<td><strong>+114.3%</strong></td>
<td>—</td>
</tr>
<tr>
<td><strong>活跃群组数</strong></td>
<td>64 群</td>
<td><strong>138 群</strong></td>
<td><strong>+115.6%</strong></td>
<td>—</td>
</tr>
<tr>
<td><strong>Core 核心层接收量</strong></td>
<td>17,288 条</td>
<td><strong>32,437 条</strong></td>
<td><strong>+87.6%</strong></td>
<td><strong>z = 7.76</strong> (极度显著)</td>
</tr>
<tr>
<td><strong>Core 核心层发送量</strong></td>
<td>1,478 条</td>
<td><strong>3,678 条</strong></td>
<td><strong>+148.9%</strong></td>
<td><strong>z = 15.07</strong> (超级异常)</td>
</tr>
<tr>
<td><strong>Core 业务指令数</strong></td>
<td>748 次</td>
<td><strong>2,098 次</strong></td>
<td><strong>+180.5%</strong></td>
<td><strong>z = 11.75</strong> (极度显著)</td>
</tr>
<tr>
<td><strong>Core 独立上行用户</strong></td>
<td>259 人</td>
<td><strong>596 人</strong></td>
<td><strong>+130.1%</strong></td>
<td><strong>z = 14.67</strong> (超级异常)</td>
</tr>
</tbody></table>
<p>统计学上，当 $|z| &gt; 3.5$ 时，就已经可以断定发生了不可思议的突变；而在 9 月 30 日，各项核心指标的 Robust z-score 全部达到了 <strong>7 到 15 的惊人量级</strong>！</p>
<p>而且这不是昙花一现的脉冲。从 9 月 30 日一直到 10 月 3 日，整个平台维持着持续的高热度运行：日均消息保持在 2,566 条以上，活跃群维持在 120 个以上。</p>
<p>那一刻，看着后台滚动的海量用户请求，我知道：<strong>青弋不仅没有在 6 月的诽谤与封杀中死去，它反而以更加健康、更具韧性的姿态，迎来了生命中最辉煌的盛放！</strong> 那些曾经被谣言误导离开的人、那些因为新版本寻找好用工具的玩家，用他们的手指和指令，为 EchoMatrix 投下了最真实的一票。</p>
<hr>
<h2>【第八章·家底总清点：数百万次交互背后的真实画卷】</h2>
<p>在今天（2026 年 10 月 5 日）导出的这套核心数据里，我们可以用全景视角，给青弋 Bot 这一路走来的所有技术成果和业务形态做一个彻底的清算。</p>
<h3>8.1 全景宏观指标底盘</h3>
<p>截至 2026 年 10 月 5 日，系统全景量化底牌如下：</p>
<ul>
<li><strong>统计跨度</strong>：2025 年 12 月 8 日 至 2026 年 10 月 4 日（有效连续统计天数：298 天）；</li>
<li><strong>总接收网络消息</strong>：<strong>3,712,350 条</strong>（日均约 1.25 万条）；</li>
<li><strong>总发送回复消息</strong>：<strong>560,656 条</strong>；</li>
<li><strong>总业务命令执行</strong>：<strong>417,625 次</strong>（命令细节调用达 617,447 次）；</li>
<li><strong>卡片渲染总数</strong>：<strong>498,800 张</strong>；</li>
<li><strong>图片回复率</strong>：<strong>88.97%</strong>（这意味着青弋是一个重度依赖美学排版和 Canvas/HTML 渲染的高品质视觉工具）；</li>
<li><strong>峰值 QPS</strong>：<strong>16.0</strong>；平均 QPS：5.07；</li>
<li><strong>平台用户储备</strong>：<ul>
<li>Gscore 体系：独立用户 <strong>32,665 名</strong>，服务群组 <strong>2,796 个</strong>；</li>
<li>TRSS-Yunzai 体系：独立用户 <strong>30,887 名</strong>，服务群组 <strong>2,704 个</strong>；</li>
<li>官方 QQ Bot 报表（近 30 日）：常驻群 <strong>2,597 个</strong>，好友 <strong>7,467 位</strong>；</li>
<li>次日留存率：稳定保持在 <strong>30.58% ～ 33.47%</strong>。</li>
</ul>
</li>
</ul>
<h3>8.2 玩家到底在用青弋做什么？指令全景大揭秘</h3>
<p>分析 <code>coredataanalysis.csv</code> 中的 364,659 条指令级调用，我们清晰地看到了青弋在玩家游戏生活中的真实生态位：</p>
<pre><code>【第一梯队：绝对刚需】
  1. 角色面板对比/PK (164,173 次) ──── 占总指令量的 39.3%
     -&gt; 玩家最爱看今汐、忌炎、长离的面板比拼，谁的暴击更高、攻击更猛。
  2. 更新/刷新面板 (131,026 次) ────── 占总指令量的 31.4%
     -&gt; 刷完无相之岩、击杀鸣钟之龟后，第一时间在群里刷新练度。

【第二梯队：账户生命周期】
  3. 账号登录与绑定 (41,209 次)
     -&gt; 扫码登录、库街区绑定，用户信任的试金石。
  4. 系统功能与帮助 (32,924 次)
     -&gt; 新人进群第一句发“帮助”。
  5. 角色练度与全角色列表 (25,241 次)
     -&gt; 一键拉出账号里所有五星、四星角色的养成总览。
  6. 每日签到与体力提醒 (20,796 次)
     -&gt; 克服了风控之后，成为最贴心的全自动管家。

【第三梯队：高阶游戏理解】
  7. 游戏 UID 快捷管理 (15,854 次)
  8. 抽卡记录分析与欧皇榜 (14,864 次)
  9. 矩阵探索与模拟推导 (12,104 次)
 10. 最强面板/排行榜争霸 (9,754 次)
</code></pre>
<p>这些数据无可辩驳地证明：<strong>青弋早已脱离了早期那种“偶尔查查体力”的简单玩具，而是演变成了一个涵盖面板、打分、抽卡、签到、配队、排轴的完整二游社群基础设施！</strong></p>
<h3>8.3 今日的技术边界：58 角色与 1,121 个动作</h3>
<p>截至 2026 年 10 月 3 日的最新代码库，EchoMatrix 的本地伤害计算引擎已经达到了惊人的工程规模：</p>
<ul>
<li><strong>完整覆盖 58 个鸣潮独立角色</strong>；</li>
<li><strong>细化到 1,121 个战斗技能动作的独立倍率与判定逻辑</strong>！</li>
</ul>
<p>但更让我自豪的，是我们在技术态度上的诚实。在最新的 CHANGELOG 里，我明确写着：</p>
<blockquote>
<p><em>“当前引擎中仍有 356 个未完全解析规则（unresolved rules），严禁把离线数学回归等同于游戏内部实测数值；后续将持续跟进实机验证。”</em></p>
</blockquote>
<p>我们没有像某些闭源团队那样，为了吹嘘自己的权威性而把所有瑕疵隐藏在黑盒动态库里。我们把每一个公式、每一个权重、每一处未决问题都坦坦荡荡地摊在阳光下。<strong>这就是开源给予我们的底气！</strong></p>
<hr>
<h2>【第九章·关于名誉、流言与法律维权的复盘】</h2>
<p>回顾 6 月份的那场风波，除了技术的脱钩，还有长达数月的人格纠纷与名誉阴影。在今天这个节点，我有必要将事实从法律和证据的角度，做一个彻底的厘清。</p>
<h3>9.1 证据与事实的边界</h3>
<p>在仔细梳理了所有的聊天截图与群记录后，事实的边界极其清晰：</p>
<ol>
<li><strong>关于 BW 抢票的代理调用</strong>：  <ul>
<li><strong>事实</strong>：我确实在未经充分授权的情况下，使用了群内的共享代理资源参与门票代抢尝试。</li>
<li><strong>我的态度</strong>：我在事发当天（6 月 20 日 13:08）第一时间公开致歉，并明确表示愿意个人承担全部损失。</li>
<li><strong>造谣与定性</strong>：部分别有用心的人借此将我定性为“倒卖狗”“专门靠盗取资源倒卖门票牟利”。然而在全部留存证据中，<strong>没有任何人能拿出哪怕一张我加价转售、囤积门票牟利的证据</strong>！代抢尝试与倒卖倒卖，在性质上有天壤之别，把未证实的恶意揣测当成事实传播，已经构成了实质性的名誉侵权。</li>
</ul>
</li>
<li><strong>关于 token 被封的因果</strong>：  <ul>
<li><strong>事实</strong>：群内管理员公开明确告知我“151 封了你的 token”，随后我被移出群聊并无法再接入上游服务。</li>
<li><strong>我的反应</strong>：我没有在社区掀起骂战，而是把全部精力投入到了自研脱钩（EchoMatrix）。</li>
</ul>
</li>
<li><strong>关于聊天记录的断章取义与隐私泄露</strong>：  <ul>
<li>事后，我的部分私聊记录和群聊发言，被某些人员挑选特定片段、甚至修改排版后跨群传播；</li>
<li>甚至更恶劣的是，个别极端人员将我未成年亲属（弟弟）的照片、头像连同我的个人信息，在小范围群组内肆意传播并附带侮辱性词汇！</li>
</ul>
</li>
</ol>
<h3>9.2 法律底线与取证原则</h3>
<p>根据《中华人民共和国民法典》第一千零二十四条，民事主体享有名誉权，任何组织或者个人不得以侮辱、诽谤等方式侵害他人的名誉权；第一千零三十四条更是严格保护自然人的个人信息与肖像权。</p>
<p>在过去这段时间里，我已经对所有涉及侮辱、造谣、断章取义的传播截图，以及涉及未成年人隐私的记录进行了严密的<strong>电子数据存证</strong>：</p>
<ul>
<li>严格按照最高人民法院民事诉讼证据规则，固化原始文件设备、时间戳与上下文；</li>
<li>对所有原始截图和导出的日志计算了 <strong>SHA-256 哈希校验码</strong>（正如本次归档中 <code>总包_SHA256.txt</code> 所示），确保电子证据的真实性与不可篡改性。</li>
</ul>
<p>我始终保持克制，没有在公开平台以牙还牙地去搞“人肉”和“网暴”。但我想正告那些曾经在背后推波助澜的人：
<strong>克制不代表软弱，不公开不代表没有证据。</strong> 如果未来任何人继续试图用捏造的“倒卖”罪名对 EchoMatrix 或我个人进行商业或名誉层面的抹黑，我保留随时移交司法机关进行名誉侵权与隐私权民事诉讼的全部法律权利！</p>
<hr>
<h2>【第十章·代码铁证：EchoMatrix 完整 189 条提交编年史与七大演进阶段】</h2>
<p>如果说聊天记录可能随风而逝，如果说截图可能引起争议，那么 <strong>Git 提交日志则是刻在区块链与分布式版本控制系统里、永远无法篡改的代码铁证</strong>。</p>
<p>回顾从 2026 年 6 月 21 日到 10 月 3 日这 189 条提交，代码的每一次脉动，都在诉说着这个项目是如何一步一步从废墟中重新站立起来的。</p>
<h3>10.1 贯穿 189 条提交的七大演进阶段</h3>
<ol>
<li><strong>第一阶段（6 月 21—23 日）——“先活下来”</strong>：  <ul>
<li><strong>核心词</strong>：自建排行 → 本地 safety → 取消远程 auth fallback → 本地评分 → 本地权重 → HTTP scoring API → cliproxy  </li>
<li><strong>目标</strong>：不追求花哨，唯一的执念是解除外部致命依赖，让 Bot 在断供后重新恢复心跳。</li>
</ul>
</li>
<li><strong>第二阶段（6 月 24—30 日）——“变成自己的东西”</strong>：  <ul>
<li><strong>核心词</strong>：EchoMatrix 命名 → 字体与色彩 Token → V2 UI 实验 → 回滚与加固 → HTML 极简面板  </li>
<li><strong>目标</strong>：项目第一次从“XutheringWavesUID 的下游分支”，成长为具有独立品牌身份与美学主权的 EchoMatrix。</li>
</ul>
</li>
<li><strong>第三阶段（7 月）——“狂暴补齐能力”</strong>：  <ul>
<li><strong>核心词</strong>：Web Token 登录、刷新 HTML、持有率分析、循环期望伤害、自建抽卡登录、本地技能伤害、声骸与矩阵排行  </li>
<li><strong>目标</strong>：从“被动恢复原功能”，走向“开发上游从来没有过的全新能力”。</li>
</ul>
</li>
<li><strong>第四阶段（8 月上旬）——“跨入产品时代”</strong>：  <ul>
<li><strong>核心词</strong>：评分可解释性、更新历史区分双轨、<code>ww滚蛋</code> 可回滚机制、排轴 DPS、Web 浏览器编辑器、三人队伍时间轴、AI 文本解析  </li>
<li><strong>目标</strong>：突破聊天框限制，进入独立 Web 交互式产品时代。</li>
</ul>
</li>
<li><strong>第五阶段（8 月下旬）——“铸就设计系统与性能工程”</strong>：  <ul>
<li><strong>核心词</strong>：V2 Theme、800px 移动端抗压缩规范、角色面板 V2、权重与更新面板 V2、DOM 探针机制、字体预热、渲染耗时从 1.36s 狂飙至 0.08s  </li>
<li><strong>目标</strong>：建立跨页面复用的 Design System 与工业级前端测试防护。</li>
</ul>
</li>
<li><strong>第六阶段（9 月）——“确立健康的分支哲学”</strong>：  <ul>
<li><strong>核心词</strong>：选择性同步 3.6.0b，坚守核心自研主权  </li>
<li><strong>目标</strong>：吸收上游公共游戏数据，但 EchoMatrix 的算法、UI、排轴与服务架构坚决寸步不让。</li>
</ul>
</li>
<li><strong>第七阶段（10 月）——“算法与工程体系化”</strong>：  <ul>
<li><strong>核心词</strong>：自建声骸总排行 → 3.7 游戏数据 → 58 角色 1,121 动作全本地逐技能伤害引擎 → 4,484 次动作闭环 → 保留 356 unresolved rules 边界  </li>
<li><strong>目标</strong>：从单纯“能跑”，进化为“有来源、有测试、有对照、有边界”的严谨工程科学。</li>
</ul>
</li>
</ol>
<h3>10.2 三个不可磨灭的“出生节点”</h3>
<ul>
<li><strong>2026-06-21 15:17</strong> —— <strong>技术上的出生</strong>：<code>Add self-hosted rank server</code>（开始掌控自己的服务端）；  </li>
<li><strong>2026-06-22 15:05</strong> —— <strong>算法的独立化</strong>：<code>Replace closed build scoring with local weights</code>（彻底终结闭源构建依赖）；  </li>
<li><strong>2026-06-24 10:53</strong> —— <strong>身份上的出生</strong>：<code>Rebrand display name to EchoMatrix</code>（正式拥有属于自己的名字）。</li>
</ul>
<hr>
<h3>10.3 完整 189 条提交编年索引清单（北京时间精确记录）</h3>
<pre><code class="language-text">【2026-06-21：破晓十连】
001  15:17  f838d09d  Add self-hosted rank server
002  15:35  974afa3f  Add qy self update commands
003  16:24  846d2436  Improve rank server Docker build downloads
004  16:47  cbb769cb  Use dynamic rank server URLs
005  18:02  0a7b484d  Disable external auth checks for local rank upload
006  18:46  5dfd22d8  Retry captcha requests with proxy pool
007  18:58  b64e5f27  Authenticate qy self update fetches
008  19:34  25f4486d  Cache proxy pool fetches
009  19:42  e2909cf7  Repair broken remote refs during self update
010  23:02  b65fc9bb  Restore local proxy captcha retry

【2026-06-22：算法剥离与本地权重】
011  08:23  5c4ac814  Add local safety resource store
012  08:28  f215bb80  refresh build resources when changed
013  08:47  bc2e1010  Move activity uploads to local rank server
014  09:16  089d391e  upload public challenge records to ranks
015  09:26  b9bffa5f  disable remote safety auth fallback
016  10:49  c4498a4f  修复 NapCat JSON 抽卡 URL / PC 卡池栏拖动
017  11:07  fe9897c2  武器精炼统一为谐振 N 阶
018  12:05  0ac6ce55  补充说明
019  12:07  b6a1d382  add local scoring fallback
020  12:33  b7bae3dc  restore qy update command aliases
021  12:37  131c8002  add qy update mirror fallback
022  15:05  84af6d89  Replace closed build scoring with local weights
023  20:09  8b63edd9  Update README.md
024  22:54  b4b2407c  恢复 PC 抽卡助手获取方式
025  23:20  7668186a  抽卡助手下载链接改 zip

【2026-06-23：API 与基础设施】
026  14:09  5f37e9f3  Use HTTP scoring API with fallback
027  20:02  9f836ff6  Fetch calc template from scoring API
028  22:04  656123c8  panel refresh through cliproxy + SID rotation
029  22:59  ba857755  per-request SID isolation + parallel refresh

【2026-06-24：EchoMatrix 命名与设计 Token】
030  10:53  e608c6ca  Rebrand display name to EchoMatrix
031  13:25  696f6384  scoring help card + render cache
032  15:28  16386bcb  EchoMatrix fonts + color design tokens
033  18:09  00c13bbb  char card colors → EchoMatrix tokens

【2026-06-25～26：UI 实验、回滚与 HTML 确立】
034  12:58  e40c9143  修复丽贝卡匹配、练度排版
035  16:18  df4671a4  挑战显示模态、收藏图鉴
036  17:01  1111bc37  摩托
037  17:33  39a384be  微调
038  00:19  ae6fe0f5  Integrate EchoMatrix v2 UI
039  00:34  b7a3efeb  all char detail → v2 + fallback
040  00:39  c60dac69  补充 PIL 分支
041  00:40  f41a8dc9  Fix v2 entry
042  00:48  39060be7  Revert to original char card UI (首次回滚)
043  11:21  b33c6b5b  帮助修改
044  11:58  8194ac9a  Add HTML char panel
045  12:08  9ace7357  HTML panel query entry + PIL fallback
046  12:31  91e6cf6e  Revert char panel to PIL (第二次回滚)
047  14:12  d16033da  Harden V1 char panel
048  17:34  001f9556  HTML 面板 Base64 图片 + 入口
049  17:42  15806cc5  Base64 图片缩放/WebP 防 OOM
050  17:51  daae5b9b  修连续渲染横条/页面池/null 声骸
051  18:06  faad9b1e  Oswald/Tektur + 毛玻璃/字号
052  19:36  3ebe4da9  面板 UI 极简重构
053  20:39  b7e49dd1  声骸副词条单列
054  20:46  f9b11f5a  score-tier 背景/副词条颜色
055  20:48  47f3c701  属性排序/关键数字放大
056  21:11  7beee236  思源黑体/暖金/全幅角色图/水印
057  21:13  ca64a45c  单声骸评分右上角放大

【2026-06-27～30：稳定化与首次吸收上游】
058         2ee73031  微调样式
059         d64e6860  不可逆更新/提醒备份
060         a99728d7  抽卡导出内存直发/gz 备份
061         b7604ccc  显示优化
062         720de2e2  缓存+时间
063         83c5c523  微调
064         51d68c36  小修小改
065         94bbcb5e  小修小改
066         aa25749e  :p
067         c25941bd  版本
068         8f375d17  avoid char panel fallback on role list failure
069 [MERGE] 916167c4  Merge upstream/main

【2026-07-02～06：登录、刷新 HTML 与持有率】
070         187ca1df  concat_diff 对比模式
071         30c6eb5c  Web Token 登录
072         bb1246c0  Token 登录外置模式
073         262077bc  登陆
074         3be89458  prevent EchoMatrix HTML fallback
075 [MERGE] 39598cf6  upstream/main
076         b4a4714f  需要同步更新所有插件 by151
077         5b83fed2  emphasize echo score
078 [MERGE] 15dff0e8  origin/main
079 [MERGE] 06566122  preserve fork extensions
080         1f19044c  guard missing hook lists
081         b79c355c  补上空格
082         a20d1d04  EchoMatrix refresh HTML panel
083         7f9f5e75  refresh panel layout
084         df473fac  避免数据库 exec 问题
085         526a040e  练度 &gt;60 转两列
086         412fe177  WuWa Tracker ownership data
087 [MERGE] af45faa5  upstream/main

【2026-07-08～15：期望伤害先声与视觉打磨】
088         0ac28072  修体力卡 PIL 背景
089         915a3d50  GSAP fallback
090         9a868a70  rotation-based expected damage (排轴前身)
091         31ebaf48  weapon panel expected damage
092         fdb4ead3  3.5.0b
093         b2a5f3e1  面板编辑 PIL 预览
094         3d8b9f76  QQ 占位头像/qqgroup at 头像
095         8ea199b1  面板编辑低清/图片大小
096         9b70c96c  体力抽取逻辑变更
097         e641f340  体力背景随机清空
098         41833715  新套装图标 ×3
099 [MERGE] 3a76fcd8  upstream/main
100         f3c54891  Fix startup after upstream merge
101         e917351f  short name
102         11637386  登录/抽卡/面板 timeout、banner、自适应、多图
103         cb05de47  card_polygon 外置资源
104         1e3e1267  排行 Bot 名徽章端饰
105         84bd2400  持有率角色短名
106         7ef761bc  concat_diff 拼图
107         66bdb6b9  移除运行时端饰拼接
108         0b8246a5  Bot 名底板中心锚定
109         7360606e  MR 自定义图缩放清晰度
110 [MERGE] 9c88810d  upstream through 7/12
111         b4fd8172  角色查询提示/攻略图
112         4938471f  云登录二次滑块
113         4c93930a  面板图随机/空清除
114         7851807f  卡池特殊池说明
115         f48d2c77  面板字体/清晰度
116         392aa99c  3.5.1

【2026-07-17～30：自建抽卡登录、本地技能伤害与矩阵】
117         325ea5fe  self-hosted Waves gacha login
118         b809ea95  reduce gacha update latency
119         e9dbc7c2  帮助示例修正
120         38895b6e  local-first skill damage panel (6万行大更新)
121         b9f9df09  声骸排行
122         bfd41100  layered skill damage scenarios (9万行分层)
123         c1c7f151  微调
124         acb42da8  damage panel 精简核心技能
125         f996490e  声骸总排行 self
126         8ea30d89  多图带来源
127         f33d62f9  self null fallback
128         9c84fea3  排行字体度量
129         42d06eab  排行视觉统一
130         3a0cf7ca  AI tools common/鸣潮 context
131         274436d1  矩阵单队/群排行/抽卡合并
132         96948d53  多图合并转发
133         38c22ba4  卡池说明（同步历史）
134         5ff9dbe5  面板图清除（同步历史）
135         810c7127  帮助修复（同步历史）
136         e4dd9d95  多图修复（同步历史）
137         c8380abf  图片提取（同步历史）
138         daed2116  sync safe upstream gacha/rank
139         003c1a44  1.14.5.14NewBee
140         7c1dd110  工坊占位记录时间
141         07451b97  180 天截断合并
142         1711454b  小黑盒垫抽
143         fd403cfb  移除测试脚本
144 [MERGE] 181a5e8e  PR #77
145         515572ae  小改
146         5d7ea9ac  proxied role query hardening
147         13f6564e  小改
148         f35af426  持有率统计优化
149         f537c102  文案
150         e6e8070f  矩阵配队排行
151         12155e29  矩阵配队排行解析
152         24d250f2  练度总排行修复
153         74888d4c  超保底截断合并
154         a118a1b7  超保底改告警
155         04af57ad  3.5.1
156 [MERGE] 2b108462  upstream through 7/30
157         f1e38a1e  help example
158         e4dde956  Suisui weights
159         f1153989  Suisui weight contracts

【2026-08-01～06：评分解释回滚、排轴 Web 与 2.2 万行三人队】
160         274d83eb  optimize request hot paths
161         6fc380e8  per-echo score composition (CHANGELOG 首入库)
162         e0d592f5  restore template score scale
163         ebefe9d2  restore API-authoritative scores
164         861e3a26  restore API-authoritative scores
165         1d3610e4  repair batch panel API
166         38075305  repair batch panel API
167         aaf57481  revert before 6fc380e (果断回滚保护评分权威)
168         8a0a68d6  restore stable scoring
169         21eb0923  safe update history + score explanations (加入 ww滚蛋)
170         fef2eb14  update log remote refs
171         bdcc7b2d  ownership rate basis
172         e23d7f82  animated ownership card
173         31d7952e  ownership rate basis (分支对应)
174         fa720359  animated ownership card (分支对应)
175  00:13  2a5fe27d  isolated timeline editor + reports (排轴 Web 诞生)
176         72e803e7  team timelines + hardened sessions (2.2 万行三人队)
177 [MERGE] 00edd8ab  origin/main → timeline branch
178 [MERGE] 17fe4ab5  timeline source merge

【2026-08-20～27：设计系统、V2 面板全景与 0.08s 渲染神话】
179         c3dbabe7  sync upstream 3.6.0b data/security
180         1664e5eb  redesign hold-rate card/banner stats (持有率 V2)
181         12039cc0  full-bleed avatars/readability (800px 移动抗压缩)
182  03:11  a3bd0a49  V2 角色面板重构/空壳防护 (文字抬升/S+档/命座图标)
183         f2751f6c  更新面板/权重面板 V2 + probe 修复 (排查空壳探针)
184  00:30  a1c53a34  时区/持有率一致性/字体预热 (渲染耗时狂降至 0.08s)

【2026-09-19：成熟的分支主权与选择性同步】
185         b5248639  sync 3.6.0b / Markdown 兑换码 / 面板头像铺满等
186 [MERGE] 9604d1f8  sync-upstream branch
187 [MERGE] c1bf2163  origin/main

【2026-10-02～03：算法工程化与全本地技能伤害引擎】
188  23:16  c09a0870  repair phantom leaderboard + sync 3.7 (绝不引入闭源委托)
189  02:31  7340e4cc  integrate local skill damage engine into panels
                      (覆盖 58 角色 1,121 动作，330 项数值全通，保留 356 unresolved rules)
</code></pre>
<h2>【结语·长路漫漫，回音不绝】</h2>
<p>从 2023 年那个在宿舍里为机器人频繁掉线而心急如焚的小白，到 2026 年今天坐在 <code>qybot</code> 小主机前、从容调取百万条自研数据架构的开发者。</p>
<p>这三年，青弋像一艘在惊涛骇浪中穿行的小木舟。
它遭遇过官方协议的封锁，遭遇过硬件发热的尴尬，遭遇过来自曾经信任的社区的冷箭与断供，更遭遇过万人指责的至暗时刻。</p>
<p>但它没有沉没。</p>
<p>每一次风暴，都把它身上那些借来的、租来的、施舍来的浮木彻底砸碎；而在碎裂的废墟之上，长出来的却是一副副纯钢打造的龙骨。</p>
<p>现在的青弋 Bot，核心引擎是 <strong>EchoMatrix</strong>：</p>
<ul>
<li>它的服务端是自己的（FastAPI + PostgreSQL）；</li>
<li>它的数据库是自己的（Linux 工控小主机 192.168.0.102 本地持久化）；</li>
<li>它的算法是自己的（58 角色、1,121 动作纯 Python 本地逐技能推导）；</li>
<li>它的守护进程是坚不可摧的（13 次守护重启自动拉起，毫秒级自愈）。</li>
</ul>
<p>它再也不会因为任何一个人的一句“我封了你的 token”，而停止跳动；它再也不会因为任何一个远端服务的断供，而让群里几万名信赖它的玩家陷入黑暗。</p>
<p>这就是青弋 Bot 和 EchoMatrix 的故事。
一个关于热爱、关于折腾、关于被逼入绝境、最终靠着几万行代码硬生生砸碎锁链的故事。</p>
<p>屏幕前的蓝灯依然在静静闪烁，终端里的消息队列还在川流不息地涌入。
<strong>天亮了，这场长跑，我们不仅跑过来了，而且，我们会一直跑下去 0w0！</strong></p>
`
    },
    {
      slug: "heaven-door-webgl",
      title: "天堂之门：实时体积雾与丁达尔光",
      category: "随笔",
      date: "2026-09-22",
      readTime: 3,
      summary: "38 级石阶尽头一道门，门心是白光。双通道光线步进加手写 GLSL：体积雾漩涡、丁达尔圣光、1800 颗光尘，除了 Three.js 零依赖。",
      tags: ["随笔", "WebGL", "Three.js", "着色器"],
      body: `
<p>38 级石阶往上，尽头是一道纪念碑式的门框，门心是纯白的光。雾从门里涌出来，被重力拽着顺台阶翻滚下去，像干冰做的瀑布。</p>
<p>整页几乎零依赖——一个 Three.js，加两段自己写的 GLSL。渲染分两趟：先画实体几何，同时把 16-bit 硬件深度缓冲抠出来；再跑全屏光线步进，用世界空间反投影算出视线与几何体的精确交点，让雾和光真的被台阶挡住。门框出口是一个柯西-高斯角速度场驱动的孔口主涡，雾气沿阶梯下落时两侧卷起开尔文-亥姆霍兹剪切涡；噪声是手写的 3D Simplex，外面套一层定义域扭曲，卷须才不呆。</p>
<p>光用 Henyey-Greenstein 相函数做前向散射，穿门洞的圣光柱和雾深耦合，浓雾滚过来时会自己把自己遮暗（Beer-Lambert 消光）。另外 1800 颗光尘在顶点着色器里被流线牵着盘旋，钻进光束才亮成金白，离开就隐回冷灰。性能上做了 Slab AABB 裁剪（射线只在阶梯包围盒内步进，旷野天空零开销）、IGN 抖动消条纹、透射率低于 1.5% 提前退出，DPR 上限 1.5。</p>
<p>鼠标拖着环绕看，右键平移，滚轮推拉，右侧抽屉能调雾浓度、涡流速、光强、散射因子和星尘流速，四个机位预设加一段电影漫游。双击 index.html 就能跑，不用装任何东西。</p>
<p>署名 <b>karminski-牙医</b>，许可 CC-BY-NC-SA 4.0，原样保留。</p>
<a class="proj-link" href="demo/heaven-door/">推门进去 →</a>`
    },
    {
      slug: "a-thousand-winds",
      title: "千缕风：同一首诗的另一个入口",
      category: "随笔",
      date: "2026-09-16",
      readTime: 2,
      summary: "同一个母题的第二版。这版把「天气」真的做成了天气——向量场、Boids 鸟群、Web Audio 现场合成的风，还有一段四拍呼吸引导。",
      tags: ["随笔", "Canvas", "Web Audio", "诗歌"],
      body: `
<p>上一版是纸：褐纸、书页、图版，安静地往下翻。这一版把「天气」真的做成了天气——不是配图，而是浏览器里实时算出来的风。</p>
<p>整站零依赖：风、雪野碎钻、麦穗摇曳、秋雨涟漪、鸟群协同、引力夜星，全是 Canvas 上的向量场与 Boids 在跑；环境音由 Web Audio API 现场合成，不加载任何音频文件。另外加了一段 4-4-6-2 的呼吸引导，和一个把文字拆成粒子吹散的祈念区。</p>
<p>同一个母题，两种做法。上一版收着，这一版散开。</p>
<a class="proj-link" href="poem/a-thousand-winds/">进入阅读页 →</a>`
    },
    {
      slug: "do-not-stand-at-my-grave",
      title: "不要在我的墓前哭泣：把一首诗排成一本小书",
      category: "随笔",
      date: "2026-09-16",
      readTime: 2,
      summary: "弗莱 1932 年写在购物纸袋上的那首诗，我没有写成笔记，而是排成了一本可以往下翻的书：风、雪、麦、雨、晨、鸟、星。",
      tags: ["随笔", "排版", "HTML", "诗歌"],
      body: `
<p>玛丽·伊丽莎白·弗莱（Mary Elizabeth Frye）1932 年写下的这首诗，纸是从购物纸袋上撕下来的一块褐纸，边缘毛着。它没有被登记成财产，后来在葬礼、信和口头之间流传开，句子被抄改过许多次，留下来的总是那一句：<b>我不在那里。</b></p>
<p>这次我没有把它写成笔记，而是排成了一本可以往下翻的小书：风、雪上的碎钻光、熟麦上的日光、秋雨、晨静、盘旋的鸟、夜里的星，每一节配一张图，中英对照。整站是手写 HTML / CSS，字体和图片都在本地，不依赖任何 CDN。</p>
<p>它不适合当教程读。安静的时候往下翻就行。</p>
<a class="proj-link" href="poem/do-not-stand-at-my-grave/">进入阅读页 →</a>`
    },
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
