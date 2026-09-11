# XutheringWavesUID（EchoMatrix）技术架构全解

> 分析对象：XutheringWavesUID-main.zip（品牌名 EchoMatrix，版本 3.6.0bNewBee）
> 分析方式：全量源码阅读，共 325 个 Python 文件、约 8.5 万行 Python 代码、1.9 万行 HTML 模板
> 本文所有引用均标注到具体文件与行号，行号来自解包后的原始仓库

## 导读

这份报告不是功能清单，而是一次把项目拆开看内部结构的记录。我按数据流的方向组织章节：一条消息从 QQ 群进来之后，经过命令解析、凭据查找、上游 API 请求、反爬对抗、数据清洗、伤害计算、评分、渲染出图、发送回群，每一环对应一到两章。三个相对独立的子系统（排轴 Web 服务、AI 知识库、独立排行服务器）单独成章。

第一章 项目概述
第二章 宿主框架与插件启动流程
第三章 上游数据源与 API 请求层
第四章 登录与用户凭据体系
第五章 数据库层
第六章 配置系统
第七章 角色数据与伤害计算体系
第八章 渲染管线
第九章 功能模块逐一剖析
第十章 DPS 排轴子系统
第十一章 AI 知识库与工具子系统
第十二章 rank_server 独立排行服务
第十三章 基础设施横切面
第十四章 工程化与质量
第十五章 深水区补遗（上）：榜单卡片家族、抽卡合并与卡池统计
第十六章 深水区补遗（下）：面板图生态、wiki 渲染器与效应常量
第十七章 端到端链路走查
第十八章 二次开发指南
第十九章 总结

附录 A 目录速查 / 附录 B 术语对照 / 附录 C 材料边界 / 附录 D 配置项速查 / 附录 E 上游接口清单 / 附录 F 部署与排障 FAQ / 附录 G 命令速查 / 附录 H 数值常量速查 / 附录 I 生态对比

---

# 第一章 项目概述

## 1.1 这个项目是什么

XutheringWavesUID 是一个跑在 QQ 机器人框架里的鸣潮（Wuthering Waves）游戏数据查询插件。用户在群里发"查角色 莫特斐"或"mr"（每日体力），机器人调库街区（KuroBBS，库洛游戏的社区 API）拿到账号数据，算伤害、算评分、渲染成图片发回群里。查的东西覆盖游戏里几乎所有数值系统：角色面板、声骸、武器、深塔（逆境深塔）、冥歌海墟、全息矩阵、抽卡记录、签到日历、探索度、公告、兑换码。

README 里写的项目名是 EchoMatrix（回音矩阵），说明文字交代了血缘：基于 Loping151 的 XutheringWavesUID 二次开发，GPL-3.0 协议，原作者是 tyql688 等人。pyproject.toml 里 `name = "XutheringWavesUID"`、`version = "1.0.0"`，而包内 `version.py` 写的是 `3.6.0bNewBee`——两套版本号并存，poetry 元数据没跟上包内版本，这类不一致在项目里不止一处。

它不是独立程序，而是 gsuid_core 的插件。gsuid_core 是一个 Python 写的多平台机器人核心（支持 OneBot/QQ、QQ 频道、微信、KOOK、Telegram、飞书、DoDo、米游社大别野、Discord 等），pyproject.toml 的 description 把这些平台全列了一遍。插件只负责游戏逻辑，协议接入、消息路由、HTTP 服务、数据库基座都由 gsuid_core 提供。这个分工决定了整个项目的形态：它长得像一个"库"，而不是一个"应用"。

## 1.2 规模与技术栈

统计口径：Python 325 个文件、84,859 行；HTML 模板 35 个、18,808 行。最大的几个文件：

| 文件 | 行数 | 内容 |
|---|---|---|
| wutheringwaves_charinfo/draw_char_card.py | 2896 | 角色面板渲染（PIL 主体） |
| utils/damage/register_weapon.py | 2256 | 122 个武器 buff 类 |
| utils/damage/register_echo.py | 1674 | 223 个声骸类 |
| utils/rotation_damage.py | 1586 | 循环伤害模拟引擎 |
| utils/api/requests.py | 1456 | 库街区 API 请求核心 |
| utils/damage/register_char.py | 1395 | 53 个角色 buff 类 |

技术栈可以概括为一句话：SQLModel/pydantic 做数据，aiohttp/httpx 做网络，PIL 和 Playwright 双轨渲染，FastAPI 做内嵌 Web，apscheduler 做定时，pydantic-ai 做模型调用。依赖意外地少，pyproject.toml 里显式声明的只有 pypinyin、rapidfuzz、playwright、opencv-python 四个，其余全靠 gsuid_core 传递依赖。opencv 只用在一个地方：用户上传自定义面板图时用 ORB 特征做查重。

## 1.3 目录结构

仓库根目录下有四个值得注意的东西：

- `XutheringWavesUID/`——插件包本体，代码都在这里；
- `rank_server/`——独立部署的 FastAPI 排行服务，和插件分开跑，Docker 部署；
- `tests/`——26 个测试文件，几乎全是为排轴子系统和伤害规则写的；
- 根目录散着 `tmp_v2_panel_preview.py`、`tmp_v2_panels_preview.py`、`tmp_v2_probe_check.py` 三个 tmp 前缀脚本，是开发 V2 面板时的临时预览工具，没清理。

插件包内部，`XutheringWavesUID/` 下有两类东西。一是 `utils/`，横向基础设施：API 客户端、数据库模型、伤害计算、渲染工具、缓存、资源管理，约 70 个文件。二是 33 个 `wutheringwaves_*` 开头的功能目录，每个目录至少一个 `__init__.py` 注册命令，通常还有 draw_xxx.py（HTML 渲染版）和 draw_xxx_pil.py（PIL 降级版）、texture2d/（PIL 素材）。这个命名是 gsuid_core 插件生态的惯例，目录即模块，模块即功能。

33 个功能目录按性质分四类：

1. 数据查询展示类（大头）：charinfo（角色面板）、charlist（练度统计）、stamina（体力）、abyss（深塔）、explore（探索度）、roleinfo（名片/皮肤/月报）、sign（签到日历）、bbs（库洛币）、more（声骸牌局）、period（当期信息）、echo（声骸列表）、scoring_help（评分说明）；
2. 记录与排行类：gachalog（抽卡记录）、rank（排行）、query（持有率/出场率）、up（卡池复刻统计）；
3. 信息服务类：ann（公告）、calendar（活动日历）、wiki（图鉴/攻略）、code（兑换码）、alias（别名管理）、help（帮助）、update（自更新）、config（设置）、user（token/绑定管理）、login（登录）、master（联系主人）、status（状态上报）、start（启动资源下载）、resource（资源下载）、develop（开发工具）；
4. 独立子系统：dps（排轴 Web 服务）、ai_rag（AI 知识库）。

## 1.5 一张总架构图

把全部子系统放进一张图，箭头标数据流向（编号对应本报告章节）：

```
                      ┌──────────────────────────────────────────────┐
                      │                gsuid_core 宿主                │
   QQ/TG/KOOK/... ──► │  Event → SV 命令路由 → Bot.send（含 hook）     │
                      │  FastAPI web_app :8765   APScheduler          │
                      └────┬──────────────────┬───────────────┬──────┘
                           │                  │               │
              ┌────────────▼─────┐   ┌────────▼────────┐  ┌───▼──────────────┐
              │ 33 个功能模块 [9] │   │ dps 排轴 [10]    │  │ ai_rag [11]      │
              │ charinfo/stamina │   │ FastAPI 路由     │  │ KP/工具/Skill    │
              │ gachalog/wiki... │   │ CAS 存储/AI 解析 │  │ 注册进 AI Core   │
              └──┬────────┬──────┘   └───┬──────┬─────┘  └───┬──────────────┘
                 │        │              │      │            │
      ┌──────────▼──┐  ┌──▼──────────────────────────────┐  ┌─▼────────────┐
      │ waves_api   │  │ utils 横向层                     │  │ gsuid_core   │
      │ [3] 请求层  │  │ calc/damage/rotation [7]         │  │ AI Core      │
      │ 代理/对冲   │◄─►│ render_utils/echomatrix [8]      │  │ (模型/向量库) │
      └──────┬──────┘  │ TimedCache/queues/player_store   │  └──────────────┘
             │         └─────────────────────────────────┘
   ┌─────────▼─────────────────────────────┐    ┌────────────────────────────┐
   │ 上游                                   │    │ rank_server [12]（可自建）  │
   │ KuroBBS / SDK / 云鸣潮 / wuwatracker  │    │ FastAPI + SQLModel          │
   │ 镜像站 / 4399 / 椰果工坊 / wuthering.gg│    │ 7 张表，实时聚合统计         │
   └───────────────────────────────────────┘    └────────────────────────────┘
```

三条主干值得在图上看清楚：消息主干（左，命令进、图片出，中途过凭据与反爬）；Web 主干（中，排轴编辑器和登录页、抽卡页、面板编辑器共用 core 的 FastAPI，鉴权各自独立）；数据回流主干（右下，面板算分进队列上传排行服务，统计接口又反过来供持有率、出场率和排轴的队伍候选消费）。AI 主干（右）是单向注入——插件把知识和工具注册进 core 的 AI Core，模型调用全部由 core 配置。

数据库和文件系统是两套并行的持久化：SQLModel 管 9 张结构化表（凭据、绑定、活跃度），players/ 目录管大块 JSON（面板、抽卡、时间轴），resource/ 管静态素材，CACHE_PATH 管可再生的降级缓存。四类存储的分区标准是"谁写、多大、丢了疼不疼"。

## 2.7 为什么自建 Chromium 池

一个常被问到的设计选择：gsuid_core 自带 html_render 渲染工具，插件为什么在 render_utils.py 里自建了一套 Playwright 管理？从代码里的注释和结构可以拼出答案（以下推断处已标注）：

core 的 html_render 是通用工具——每次渲染开页面、出图、关闭，不管理浏览器生命周期。而本插件的渲染量是"每个查询一张图"的量级，通用模式在两件事上吃不消：字体缓存和内存。Chromium 的字体缓存跟 page 实例走，每次新开页面 CJK 字体全量重载（1.36 秒），页面池复用后降到 0.08 秒（注释里的实测数）；浏览器进程的内存只增不减，必须按使用次数或空闲时长主动重启。这些治理逻辑只有自建才有地方放。

第二个原因是代理隔离：渲染机的网络环境应该独立于请求层（render_utils.py:59-67 启动参数显式禁代理，注释说明代理故障曾连带渲染超时）。core 的渲染工具如果共享全局代理配置，反爬代理池的抖动会打垮出图——渲染和请求在网络上解耦是硬需求。

第三个原因是渲染质量协议：EchoMatrix 三模板的就绪握手（window.__READY__）、空壳探针、CDP 高清截图，都是模板侧 JS 与渲染器约定的私有协议，通用 html_render 没有挂载点。

代价也真实存在：这 600 多行的渲染管理代码（浏览器池、页面池、驱动重启、字体预热）本质是在插件里重造了半个无头浏览器运维层。作者显然权衡过——从"每个模块自带 _pil 版"这个事实看，Playwright 在目标部署环境里的可靠性从未达到免维护水平，自建池加 PIL 兜底是那套环境下的最优解。


## 1.4 代码组织的三条规律

读完整个项目，我总结出三条贯穿始终的写法，后文会反复遇到。

第一，双实现降级。几乎所有出图功能都有两份实现：HTML 版走 Jinja2 加 Playwright 截图，PIL 版用 Pillow 纯手工画。配置项 UseHtmlRender 决定走哪条，HTML 失败时自动落回 PIL。动机写在 config_default.py:401 的注释里："低配机器（1c2g 以下）建议不开"——Playwright 加 Chromium 对 1 核 2G 的服务器太重。这个设计让插件能跑在从树莓派到独立服务器的任何环境，代价是每张卡片要维护两套布局代码。

第二，API 优先加本地回退。伤害评分、评分模板、角色列表，全都是"先请求远程评分 API，网络失败再退回本地硬编码数据"。scoring_api.py:13 的默认地址是 `http://192.168.0.103:8787`，这是作者的内网地址，普通部署下连不上，于是所有请求走 3 秒超时然后落回本地实现。远程通道对作者是便利，对用户是每次查询白等 3 秒（有 warn_once 去重告警，且业务异常不回退，只对网络类错误回退）。

第三，防御性写法密集。删 URL 防注入（refresh_char_detail.py:134）、错误文案永不回显用户输入（name_resolve.py:5）、损坏 JSON 拒绝覆盖（refresh_char_detail.py:292）、维护中不误杀 cookie（requests.py:226）、国际服凭据不进 KuroBBS 校验链避免被误标失效（requests.py:250）。这些细节散落各处，说明作者被真实的线上事故教育过——多处注释直接记录了事故现场，比如 echomatrix_html/render.py 第 205-243 行注释写明曾经把 char_panel 的空壳探针类名误用到 refresh_panel，导致那张卡永远回退 PIL。

---

# 第二章 宿主框架与插件启动流程

## 2.1 gsuid_core 提供了什么

要理解这个插件，得先弄清 gsuid_core 给了它什么。gsuid_core 是原神 UID 系列插件（GenshinUID 衍生生态）的通用核心，提供：

1. 多平台协议接入（OneBot V11/V12、QQ 频道、Telegram、微信……），把各平台消息统一成 `Event` 对象；
2. 插件系统：`Plugins(name=..., force_prefix=[...])` 注册插件，`SV("服务名", priority, pm)` 声明服务，`@sv.on_fullmatch / on_command / on_regex / on_prefix` 挂命令处理器；
3. Web 服务：一个 FastAPI 应用（`gsuid_core.web_app.app`），插件可以往上面挂自己的路由；
4. 数据库基座：SQLModel 的 `Bind`/`User` 基类、通用 CRUD、`gs_subscribe` 订阅 API、Web 管理后台（`@site.register_admin`）；
5. 基础设施：日志、配置框架（StringConfig）、定时器（APScheduler 封装）、图片下载、资源目录管理、AI Core（pydantic-ai 封装的模型调用与 RAG）；
6. 生命周期钩子：`@on_core_start`、`@on_core_start_before`、`@on_core_shutdown`。

插件的全部业务就建立在这套底座上。理解了这一点，很多设计就顺理成章：为什么数据库模型都继承 core 的基类，为什么排轴子系统的路由"导入即注册"，为什么订阅推送直接读写 core 的 Subscribe 表。

## 2.2 插件注册与命令前缀

主入口 `XutheringWavesUID/__init__.py` 第一件正经事：

```python
if "XutheringWavesUID" not in SL.plugins:
    Plugins(name="XutheringWavesUID", force_prefix=["ww", "qy"], allow_empty_prefix=False)
```

force_prefix 要求用户消息必须带 "ww" 或 "qy" 前缀（"qy" 是"清云"？从上下文看更像历史遗留的第二前缀），`allow_empty_prefix=False` 表示不能省略。所以所有命令实际形态是 `wwmr`、`ww排轴 莫特斐`。这个 if 判断本身有一段注释值得抄下来：

> 幂等: 防止跨插件 cross-import 让本文件在新 namespace 下重 exec 时把 disable_force_prefix 用默认值 False 覆盖掉。

Python 的模块在两个不同命名空间下被 import 会执行两次，gsuid_core 的插件生态里跨插件 import 是真实存在的场景。作者用 `SL.plugins` 成员检查做幂等保护。项目里这种"防重 exec"手法出现了三次，另外两处在伤害注册器（damage/abstract.py:9-16）和评分超参（score.py:7-12），都是把状态锚进 `sys.modules`，后面第七章细讲。

## 2.3 启动初始化链

`__init__.py` 被加载时按顺序做了一串初始化，这条链就是插件的"main 函数"：

1. **malloc 调参**（第 15-19 行）：尝试导入 `utils/malloc_tuning`，Linux/glibc 下用 ctypes 设 `mallopt(M_ARENA_MAX=2, M_TRIM_THRESHOLD=128K)`，再起一个每 10 分钟 `malloc_trim(0)` 的定时器。理由写在文件头："缓解本地渲染 RSS 驻留"。Playwright 渲染大量图片后 glibc 的多 arena 机制会把内存攥在手里不还，这个文件是实测内存问题后的对策，Windows 上自动失效不报错。

2. **安装 Bot 消息钩子**（第 22-35 行）：`install_bot_hooks()` 用 Monkey Patch 包装 `Bot.send` 和 `Bot.target_send`，然后注册三个钩子函数。钩子做两件事：每条群消息触发 `WavesSubscribe.check_and_update_bot`（校正"这个群该由哪个 bot 实例服务"，第五章细讲）；用户/群活跃度写入内存缓冲。钩子里有两个过滤条件：`ANN_PUSH_GUARD`（ContextVar，公告推送期间置位）和 `is_from_waves_plugin()`（plugin_checker.py 沿调用栈遍历 frame，从文件路径拆出 `/plugins/<name>/` 判断消息是不是本插件发的）。第二个过滤很有意思——钩子是全局的，core 里其他插件的消息也会进来，不过滤的话活跃度统计就脏了。

3. **活跃度缓冲与批量落库**（第 38-96 行）：内存里两个 dict 暂存活跃记录，后台协程 `_activity_flush_loop` 每 60 秒批量写库。文件头注释直接给了动机："避免高并发写入损坏数据库"。SQLite 并发写是真实痛点，这里选择了最朴素的方案：攒一批，单线程顺序写。退出时 `@on_core_shutdown` 钩子先停循环再强制 flush，防止丢数据。

4. **本地化初始化**（第 162-164 行）：`utils/localization` 提供 5 语种支持（简中、繁中、英、日、韩），用户语言偏好存数据库表 WavesLangSettings，PIL 渲染文案经 `t(key, locale)` 翻译。

5. **自定义图 hash 索引构建**（第 166-171 行）：扫描用户上传的自定义面板图/背景/体力卡三个目录，建 hash 到路径的倒排索引（card_hash_index.py），启动一次、O(1) 查询。

6. **旧缓存迁移**（第 175 行起）：删掉改名前的 `login_cache.db`（现在是 url_cache.db）。

整条链的每个环节都包着 try/except，失败只 warning 不阻断。插件加载失败会拖死整个 core，所以这里的哲学是：任何初始化失败都降级运行，别把宿主搞挂。

## 2.4 生命周期全景

把所有挂了生命周期钩子的地方汇总，能看到插件和 core 的咬合点：

| 钩子 | 位置 | 做什么 |
|---|---|---|
| on_core_start_before | utils/database/models.py | 执行 25 条一次性迁移 SQL（exec_list） |
| on_core_start | utils/database/models.py:811 | 跑 auto_migrate 补列；wutheringwaves_start 触发资源全量下载 |
| 模块导入时 | 各处 | 注册命令、注册伤害计算器、注册 AI 知识与工具、挂 FastAPI 路由 |
| 定时器 | 各模块 | 公告轮询、缓存清理、无效 CK 清理、自更新、RAG 重载、malloc_trim |
| on_core_shutdown | 主 __init__.py | 刷活跃度缓冲 |

没有独立的"插件 main"，一切发生在导入期和钩子期。这既是 gsuid_core 生态的惯例，也带来一个副作用：导入期的顺序依赖很脆弱，主 __init__.py 里那些 import 的先后位置是不能随便动的（先 install_bot_hooks 再注册钩子函数，先拿 MAIN_PATH 再做迁移删除）。

## 2.5 命令注册模式

33 个功能模块的命令注册是高度同构的，模式值得单独说明。每个模块的 `__init__.py` 开头声明服务：

```python
sv = SV("waves体力", priority=5)
sv_self_config = SV("waves配置", priority=3)
```

`priority` 决定多个服务同时命中一条消息时的优先顺序（数字小者优先），`pm` 是权限门槛（0 主人、3 管理员、6 普通用户，数字越小权限越高）。然后挂四类事件装饰器：

- `@sv.on_fullmatch(["每日", "mr", "实时便笺", "便笺", "便签", "体力"])`——完全匹配，命令的别名全靠这里堆；
- `@sv.on_prefix("角色面板")`——前缀匹配，后面接参数；
- `@sv.on_command("订阅公告")`——语义化命令，core 会做额外的标准化处理；
- `@sv.on_regex(rf"^(?P<char>[a-zA-Z\u4e00-\u9fff·0-9]+)面板(?P<damage>\d*)$")`——正则捕获组直接解析参数，charinfo 的命令族大量使用。

两个值得注意的细节。第一，大量命令注册时带 `to_ai="""..."""` 文档串，这是给 gsuid_core AI 函数调用用的命令描述——AI Agent 决定要不要替用户执行某条命令时读的就是这段文字（第十一章的工具体系与之衔接）。第二，群聊与私聊的分离靠 `sv` 变体和运行时判断组合实现：有的服务声明时限定 `only_to_me`，有的在函数体内判断 `ev.group_id is None` 分流（公告订阅强制群聊、联系主人强制私聊）。命令的"拼写容错"也在这层做：charinfo 的命令正则带 typo 纠正路由表（charinfo/__init__.py:651），用户打错字也能路由到正确处理器。

插件前缀的处理是透明的：主入口的 force_prefix=["ww", "qy"] 由 core 层剥掉，模块代码里看不到前缀；但按钮和提示文案里需要显示带前缀的命令时，用 button.py 的 `get_plugin_available_prefix("XutheringWavesUID")` 动态取——用户配置了空前缀的部署，提示文案也跟着变。

## 2.6 它在插件生态里的位置

这个项目不是凭空长出来的。gsuid_core 本身脱胎于 GenshinUID（原神查询插件）社区的多平台化重构，生态里有一批结构相似的游戏查询插件：原神、星穹铁道、绝区零、鸣潮各有自己的 UID 插件。pyproject.toml 的 description 保留了一句历史："支持 OneBot(QQ)、OneBotV12、QQ频道、微信、KOOK、Telegram、FeiShu、DoDo、Villa、Discord 的全功能 HoshinoBot/NoneBot2/Koishi/yunzai/ZeroBot 鸣潮机器人插件"——HoshinoBot、NoneBot2、Koishi、yunzai 是更早一代机器人框架，GenshinUID 系项目当年是跨这些框架分发代码的，迁移到 gsuid_core 之后框架适配收敛到了 core 一层。

血缘上，XutheringWavesUID 源自 tyql688 的 WutheringWavesUID 一脉，Loping151 的 fork 加入了大量工程化改造（反爬体系、EchoMatrix 渲染、排轴、rank_server 都是这一侧的产物），本仓库又在其上二次开发。代码里能看到不同时期风格的叠加：部分模块的注释是纯中文口语体（"扰我道心"），部分是严谨的工程文档体（rotation_damage 的 docstring），评分权重表注明改自 erzaozi/waves-plugin（生态里另一个鸣潮插件）。理解了"这是社区生态里多个项目杂交的产物"，很多不一致就有了着落——它不是一个人按一份架构文档写出来的，而是几拨人接力演进、互相借鉴的活体。

---

# 第三章 上游数据源与 API 请求层

这一章讲插件怎么跟库洛服务器打交道。这是整个项目工程密度最高的部分，8.5 万行代码里，光是 API 请求层就占了一万多行，其中相当比例在跟反爬对抗。

## 3.1 四类数据源

插件的上游不止一个，按用途分四类：

| 数据源 | 地址 | 客户端 | 用途 |
|---|---|---|---|
| 库街区 KuroBBS | api.kurobbs.com | utils/api/requests.py 的 WavesApi | 国服全部数据：面板、体力、深塔、签到、公告、wiki |
| 库洛官方 SDK / PC 启动器 | sdkapi.kurogame-service.com、pc-launcher-sdk-api.kurogame.net | utils/api/api_sdk.py 的 WavesLauncherApi | 国际服邮箱登录、凭据续期、国际服面板 |
| 云鸣潮 | cloud-game-sh.aki-game.com | wutheringwaves_login/cloud_api.py | 抽卡记录凭据 recordId |
| 第三方排行服务 | wh.loping151.site（可自建替换） | utils/api/wwapi.py | 声骸排行、持有率、出场率的上传与查询 |

另有一个特殊的：抽卡记录走 gmserver-api.aki-game2.com 的 `/gacha/record/query`，这是游戏客户端抽卡历史的出口，官方只保留 180 天，所以插件把记录拉下来存本地 JSON。

全插件共享一个 WavesApi 实例。utils/waves_api.py 整个文件就一行有效代码：`waves_api = WavesApi()`。20 多个功能模块都 import 这个对象，让 aiohttp 会话池、公告缓存、验证码求解器全局共享。

## 3.2 api.py：URL 表与代理决策

api.py 前 95 行是 60 多个接口 URL 的常量表，全部 f-string 拼在 `MAIN_URL` 上。`get_main_url()` 会读配置 `KuroUrlProxyUrl`，配置了镜像地址就换。有个小坑：`MAIN_URL = get_main_url()` 在模块导入时求值一次，运行中改配置不生效，得重载插件。

服务器 ID 是硬编码的：国服 `SERVER_ID = "76402e5b20be2c39f095a152090afddc"`，国际服按 UID 前缀映射（`roleId // 100000000` 得到区号，对应 5~9 各区），查不到兜底美服。UID 判定国际服的统一逻辑是 `is_net(roleId)`：UID 大于等于 2 亿即国际服（requests.py:136-138）。这个判定贯穿全项目，登录、面板、体力，每条链路开头都分叉一次。

api.py 后半段是代理决策三件套：

- `get_local_proxy_url()`：读 `LocalProxyUrl` 配置，正则校验合法性；
- `need_proxy_for_func(func_name)`：读 `NeedProxyFunc` 配置列表，决定哪些接口必须走代理。有个兼容逻辑：老配置写 "all" 时只对 `get_role_detail_info` 生效，因为角色详情接口是反爬最重的；
- `get_request_proxy_url(func_name)`：返回 `(proxy_url, managed_proxy)` 二元组。先问 cliproxy 管理器（managed=True，每次请求可以换出口 IP），没有就回落本地代理（managed=False）。

注释里有一句关键设计说明（api.py:150-151）：角色详情是独立读，可以扇出到不同出口 IP；有状态的 API 链（登录、验证）要保持 SID 稳定，换 IP 会掉会话。这个区别决定了后面所有的代理使用策略。

## 3.3 request_util.py：伪装与统一响应

请求头伪装的目标是把自己扮成库街区官方 App。`KURO_VERSION = "3.1.3"`，`PLATFORM_SOURCE = "ios"`，UA 是 `KuroGameBox/3.1.3`。request_util.py:37-40 有一段注释掉的代码，说明早期版本会在 ios 和 android 之间随机选一个，后来固定成 ios——随机 UA 反而是个稳定特征，不如固定。每个请求带 32 位随机 devCode 冒充设备号。

响应层是泛型 pydantic 模型 `KuroApiResp[T]`（request_util.py:122-188），收录了库洛的业务码：220 是 token 失效，10903 是数据令牌（bat）失效，130/132 是验证码错误，270 是"环境风险"——IP 被风控了，999 是维护中。这个模型做了三件超出普通响应封装的事：

1. **主动告警**：model_validator 在每次响应解析时自动判断，code=270 直接 `create_task(send_master_info(...))` 私聊通知机器人主人"你的 IP 被风控了"，维护告警走独立冷却通道；
2. **调用栈追踪**：收到未知 code 时用 `inspect.stack()` 抓调用栈打 warning，方便定位是哪个接口出了新花样；
3. **凭据状态联动**：`mark_cookie_invalid()` 在 token 失效时顺手把数据库里 `WavesUser.status` 置"无效"，凭据生命周期管理嵌在响应层里。

## 3.4 requests.py：WavesApi 与 _waves_request

requests.py 是请求层的心脏，1456 行。WavesApi 类里有 30 多个业务方法（get_daily_info、get_role_detail_info、get_sign_in_init、get_ann_list……），全是同一个模式：`get_base_header()` 加凭据头，`{gameId, serverId, roleId}` 组表单，然后交给 `_waves_request`。

凭据头组装 `get_used_headers`（requests.py:164-187）值得单独说。库街区的角色接口要三个东西凑齐：token（cookie）、did（设备号）、b-at（bat，accessToken）。插件从数据库 WavesUser 反查补齐后两个。少任何一个，接口都返回异常。

CK（cookie）获取是一条策略链 `get_ck_result`（requests.py:189-198）：先用用户自己的凭据，失败就 `get_waves_random_cookie` 从公共池随机抽一个别人的（库里所有登录用户的 token 池），全挂了还有最后一招：`generate_random_jwt_token()` 现场伪造一个 JWT——用于只查公开数据的场景，骗过"必须带 token"的表层校验。公共池机制有个隐私边界：配置 `WavesOnlySelfCk` 可以整个关掉。公共池探活（requests.py:284-319）写得相当克制：login_log 失败立即标死不计次、refresh_data 深探最多 5 个省配额、bat 失效先续期再重探、维护中不标死。国际服账号在池子里跳过，因为它们的 cookie 字段存的是 launcher 的 auto_token，当 KuroBBS 的 JWT 用必然失败，还会被误标成无效——这类"两种凭据体系不能互串"的防御在代码里出现了一打以上。

`_waves_request`（requests.py:1134-1456）是所有请求的必经之路，300 行里塞了六层逻辑，按执行顺序：

1. **取调用方函数名**：`inspect.stack()[1].function` 拿到是谁在调，决定是否走代理。这是以优雅换灵活的典型手法，省掉了每个业务方法传 func_name 参数的样板代码；
2. **超时与重试预算**：managed 代理时超时用 `CliproxyRequestTimeout`（默认 5 秒），重试次数取 `CliproxyMaxAttempts`（封顶 5）；
3. **业务码重试**：`{999, 102, 270, 500, 1000, 1005, 10900}` 这些码可重试，重试前如果走 managed 代理就旋转 SID 换出口，退避是指数加随机抖动——requests.py:1189-1193 的注释说得很直白：防止一批失败的定时刷新任务同一瞬间把代理池转完；
4. **响应解析兜底**：上游 `data` 字段有时是 JSON 字符串而不是对象，会尝试二次 `json.loads`；
5. **geeTest 验证码应对**（1369-1407）：响应里 `data.geeTest == true` 时按优先级试三级——managed 代理就换 SID 重试；本地代理就直接经代理重试；都不行且配了过码器，就 `solve_captcha()` 解出五元组塞进重试表单的 `geeTestData` 字段重发。全失败返回错误码 104；
6. **异常分类**：InvalidURL、TimeoutError、ClientError 各自处理，统一换代理后退避重试，耗尽次数抛 TypeError。

**磁盘降级缓存**是 _waves_request 体系外的一层保险。配置 `CacheEverything` 开启后，base_info、role_detail、calabash、explore、abyss 等 11 类数据成功时写 `CACHE_PATH/<类名>/<roleId>.json`，请求异常时读缓存顶上（比如 requests.py:389-403）。配合三个列表接口的 `@timed_async_cache(86400)` 装饰器（24 小时内存缓存），插件对上游的依赖被尽量削平。

## 3.5 Hedged request：对冲竞速

requests.py:1274-1350 实现了对冲请求（hedged request），这是整个请求层最有意思的一段。触发条件苛刻：managed 代理 + 调用方是 `get_role_detail_info`（角色详情，反爬最重的接口）。机制：主出口请求发出后，若超过 `hedge_delay`（默认 800 毫秒，加 15% 随机抖动）还没返回，就通过 `rotate_request_proxy_url` 启动第二个出口并发竞速，谁先返回"决定性响应"（拿到了可用面板数据，或 token 明确失效）就用谁的，另一个取消。

为什么要抖动？如果一批刷新任务同时触发对冲，两个出口的请求会同步打出去，池子瞬间翻倍压力。15% 抖动把它们错开。备用出口受 `_role_detail_hedge_semaphore = Semaphore(4)` 管制（requests.py:103），竞速是并发的，但预算封顶。

这套东西说明一个事实：角色详情接口在不走代理或代理质量差时，超时率高到值得为它单独造一套机制。

## 3.6 cliproxy.py：住宅代理池

cliproxy.py 对接 cliproxy.io 的住宅代理网关，是反 IP 风控的核心。几个设计点：

**SID 会话粘性**。用户名里内嵌参数 `region-{TW}-sid-{sid}-t-{sticky_minutes}`（cliproxy.py:96-111）。住宅代理按用户名参数路由，同一个 sid 在粘性时长内出口 IP 不变。SID 生成为 `"ww"` 加 14 位随机串。

**ContextVar 级会话**。`_REQUEST_SID: ContextVar`（cliproxy.py:17-20）让同一异步请求链天然共享 SID——一次用户请求里可能发出七八个上游调用，它们应该走同一个出口 IP，而不同用户请求之间互相隔离。ContextVar 是 asyncio 生态里做请求级上下文的标准答案。失败时 `rotate_sid(reason)` 换新 SID 并打 warning。

**两跳中继**。如果配置了 `CliproxyTransitProxyUrl`（前置中转代理，比如境外 VPS），插件在本机 `127.0.0.1:0` 起一个仅支持 CONNECT 的 HTTP 代理（`_CliproxyRelay`，cliproxy.py:186-392），把客户端 CONNECT 请求里 Proxy-Authorization 头解出 SID，再向真实网关发起第二跳 CONNECT。为什么这么绕？因为 httpx/aiohttp 不支持"两级代理各自带认证参数"，中继是把两层代理串起来的胶水。用 asyncio.start_server 手写 CONNECT 协议，200 行，说明作者在这上面真摔过跤。

**降级链**。凭据缺失时只告警一次，回落 `LocalProxyUrl`；独立读类请求传 `fresh=True` 每次拿新 SID 摊薄负载。

## 3.7 验证码体系

captcha/ 目录是一个插件化的过码器框架：`register_solver` 装饰器做注册表，`pkgutil` 自动发现子模块，`get_solver()` 按配置 `CaptchaProvider` 实例化。base.py 里硬编码了库洛的极验 CAPTCHA_ID `3afb60f292fa803fa809114b9a89b3f5`，`CaptchaResult` 承载极验四代滑块的五元组（lot_number、pass_token、gen_time、captcha_output、captcha_id）。

但 ttorc.py（对接 ttocr.com 打码平台）的 `create()` 现在直接返回 None 并警告"已禁用"（ttorc.py:22-24）。也就是说自动过码这条路目前是断的，实际的对抗手段是前面说的：换 SID、换代理、绕过去。过码器框架留着，等有可用的打码服务再插上。

## 3.8 api_sdk.py：国际服的签名与混淆

国际服走的是另一套完全不同的协议——库洛官方 SDK 和 PC 启动器接口。api_sdk.py 硬编码了一堆内置凭据：client_id、product_key、app_key、projectId=G153、productId=A1730（登录态）/A1725（token），SDK 版本 2.6.1。这些是抓包 PC 启动器得到的。

**签名算法 `_sign_payload`**（api_sdk.py:64-80）：剔除 sign/market 和空值字段，按 key 字典序拼成 `key=value&` 串，追加 app_key，算 32 位小写 MD5，然后对摘要的 ASCII 字节做三处位置互换 `((1,13),(5,17),(7,23))`。互换没有密码学意义，纯粹是让第三方不能直接套用标准 MD5 签名流程——一个廉价的混淆。

**密码混淆 `_scramble_password`**（api_sdk.py:83-97）：先 base64，再做两轮（offset 0 和 1）步长 4 的邻位字符互换。同样不是加密，只是防明文上链。

这个类的其他部分是体力活：launcher 接口返回 PascalCase 字段（`EnergyRecoverTime`、`CreatTime`），要适配成国服的模型；SDK 端点返回扁平结构（状态码在 `codes` 字段），要归一化成 `{code, msg, data}` 喂给统一的 KuroApiResp；日志脱敏 `_mask_sensitive` 把 password/token 只留首尾 4 字符。还有个国际服特有的重试：launcher 的 code=1005 表示服务端在异步生成玩家数据还没好，`_retry_launcher` 用 0.5 秒起步、乘 1.6、封顶 2 秒的退避重试最多 4 次。

## 3.9 launcher_chain.py：凭据续期高层链

国际服的凭据有三个：auto_token（相当于 cookie，存在 WavesUser.cookie 字段）、access_token（相当于 bat，存在 bat 字段）、device_no（存在 did 字段），外加 WavesUserSdk 表里的 region 和 token 过期时间。launcher_chain.py 把"用这些凭据查面板、失效了自动续"封成一个高层函数：

`_fetch_with_refresh`（launcher_chain.py:97-170）的逻辑分三路。文件头注释把失败路径分成三类：maintenance（维护中，直接放弃）、expired（鉴权失败，走续登）、other（其他问题，上抛——续登救不了）。若 access_token 还在有效期内（距 `bat_expires_at` 有 60 秒保护期）就先直接查；鉴权失败才 `auto_login` 加 `exchange_access_token` 续登，新凭据回写两张表后重查一次。

保护期设计防止了一个经典竞态：token 刚刷新还没过期，另一处代码误判过期又去续，造成续登风暴。

唯一消费方是体力模块：draw_waves_stamina.py:89-90 判断 `waves_api.is_net(uid)` 为真就走 `_process_uid_launcher` → `fetch_launcher_panel`。国际服的面板渲染只有体力这一处打通了，其他功能国际服用户用不了或体验降级——这是项目的现状边界。

## 3.10 wwapi.py 与数据模型

wwapi.py 是第三方排行服务（自建 rank_server 或官方远端 wh.loping151.site）的客户端，30 多个端点全有 pydantic 请求/响应模型，但网络调用只有一处 `get_char_rank_options` 用裸 httpx 10 秒超时直连，不走代理不重试。消费方是 rank、query、abyss、code 模块和上传队列。

model/ 目录是库街区响应 `data` 段的强类型映射，12 个子模块覆盖 account、daily、role、gacha、sign、battle（深塔/冥海/矩阵/全息/探索）、calculator、period、activity、skin、motor。角色模型 RoleDetailData（role.py:138）是下游一切计算的输入，字段有 role/level/chainList（命座）/weaponData/phantomData（声骸）/skillList/activeBranchId。PhantomProp 的 attributeName/attributeValue 是字符串形式（"10.5%"），后文的伤害计算层要专门处理这种字符串百分比。有几个模型方法带着语义陷阱：`get_skill_level()` 返回 `level - 1`，因为技能倍率数组是 0 基的——这个约定在两处代码里各自实现了一遍（role.py:169 和 rotation_damage.py 的 `_safe_skill_level`），必须保持一致，不一致就是隐蔽的数值 bug。

## 3.12 镜像站与静态数据分发

API 请求之外，还有一条静态数据的分发链。角色白值、技能树、武器、声骸、怪物、挑战详情这些结构化数据（resource/map/detail_json/）以及图片素材，由 wutheringwaves_resource 模块整包下载：check_speed（download_all_resource.py:33）对 ww1/ww2/ww3.loping151.top|.cn 三组镜像并发测速选最快源，然后走 gsuid_core 的 download_all_file 批量拉取；download_utils.py 提供 hash.json 的 sha256 校验，不匹配即删。启动时（wutheringwaves_start）和每日定时（ResourceDownloadTime 加随机 0-3600 秒抖动）各跑一次，下载完触发各模块 reload 和 AI 知识库重注册。

按需懒下载（download_file.py）覆盖另一半场景：get_skill_img/get_phantom_img/get_material_img 等在文件缺失且有 URL 时现场下载，缺失时回退内置默认图（比如未收录角色的星星花占位），异常时返回 100x100 透明图防崩溃——渲染层永远拿得到一个"能画"的东西。

这条分发链存在的背景：库街区没有公开的静态数据 API，社区镜像（作者自建的 loping151 系）承担了"游戏 wiki 数据库"的角色。镜像挂了的影响不是功能失效而是数据过期，所以校验和测速两个动作放在最前面。

## 3.13 请求层的考古层

utils/api 里有几处"注释掉的代码"，单独拎出来是因为它们记录了对抗策略的演化史：

- **ds.py**：整个文件只有一段被完全注释的 AES-ECB 解密代码，key 是 base64 的 `XSNLFgNCth8j8oJI3cNIdw==`，PKCS7 去填充。说明早期某个上游接口返回过加密数据，插件解过；后来接口不加密了（或改版了），解密代码整体退役但文件没删。当前项目不存在活跃的请求签名，唯一的签名在国际服 SDK（MD5 加摘要换位）；
- **随机 UA 的兴衰**：request_util.py:37-40 注释掉的代码显示曾随机轮换 ios/android 两种 UA，后来固定成 ios。可以推测的因果：随机会让同一 devCode 绑定不同平台特征，反而是更扎眼的异常信号——伪装系统里"稳定一致"比"随机多变"更接近真实客户端；
- **僵尸端点**：cloud_login.py:452-465 的两个旧短信接口返回固定文案，登录方案从直连演进到网页 SDK 直通后，旧路由留着给老用户过渡提示；
- **safety.py 空壳**：10 行的桩函数无人引用（13.5 节），内部版本剥离的痕迹。

这类"代码地层学"在商业改开源的项目里很常见，本仓库的特点是地层保存得完整——没有清理痕迹，反而让后来的读代码者能看到每个方案的生命周期。对二次开发者的提醒：这些注释代码不要随手"清理"，除非你确定上游接口不会再回退到旧行为。

## 3.14 重试预算的哲学

把各条链路的重试参数放在一起看，能看到一套隐含的预算分配原则——越重要的调用，预算越宽松；越廉价的调用，失败越干脆：

| 调用 | 超时 | 重试 | 特殊机制 |
|---|---|---|---|
| 角色详情（最重要） | 5 秒（代理） | 最多 5 次 | 对冲竞速、换出口、结构校验后重试 |
| 体力等常规数据 | 常规 | 业务码重试加退避 | 磁盘降级缓存兜底 |
| launcher 面板 | 常规 | 1005 专用 4 次（0.5s×1.6 封顶 2s） | 凭据自动续期一轮 |
| 评分 API | 3 秒 | 2 次 | 网络错误才回退本地 |
| 排行上传 | 10 秒 | 队列异步，失败放弃 | 不阻塞消息、不丢已渲染结果 |
| wuwatracker 爬取 | — | 失败退避 10 分钟 | 24 小时成功缓存 |
| 外置渲染 | 60 秒 | 失败回本地 | 本地再失败回 PIL |

原则可以归纳成三条。第一，用户可感知的操作（查询）给足预算，用户无感知的操作（上传、爬取）失败就失败，下次再来。第二，重试必须搭配"换一个变量"——换代理出口、换 SID、换通道——原样重试同一个失败请求只放大故障。第三，预算封顶后要有兜底物：查询的兜底是缓存或明确的错误文案，渲染的兜底是 PIL，评分的兜底是本地公式。没有兜底物的重试（比如排行榜查询）就只能失败返回，所以它们的重试也最少。

## 3.11 模型层的字段细节

RoleDetailData 的几个模型方法值得展开，它们定义了"从原始 JSON 到可计算数据"的语义转换：

- `get_chain_num()`（role.py:149-159）：数未解锁的命座。注意方向——API 给的是"解锁了什么"，计算层关心"还差什么"，这个方法做了一次反转；
- `get_skill_level(name)`：按技能中文名取等级，返回 level-1。0 基的原因是倍率数组 `values[]` 按等级 2 起步存储，等级 1 没有独立倍率条目，直接用下标会越界或错位；
- `get_skill_branch()`（role.py:175）：取当前激活的"共鸣链分支"（skillBranchList）。守岸人这类有多模态的角色靠它区分 frost/phantom 形态，模态值一路传到评分模板选择（第 7.8 节的条件表达式变量之一）。

声骸侧的三层结构也要记住：EquipPhantomData（一件声骸）包含 phantomId、cost、quality（品质）、fetterDetail（所属合鸣套装）、mainProps/subProps（主副词条）。`get_props()` 把主副合并成扁平列表——评分和聚合都吃扁平列表，套装归属单独从 fetterDetail 取。装备 PhantomProp.attributeValue 的"10.5%"字符串形态贯穿了从聚合（_add_prop_value 做字符串加法）到评分（权重乘数值）的全链，中途没有任何一层把它转成 float——这是上游 API 的形态决定的，插件选择"原样携带、按需解析"。

battle 类模型（深塔/冥海/矩阵/全息/探索）的结构差异较大但模式一致：期数元信息（season/zzzGameDay 起止时间戳）、区域或关卡列表、每层（每关）的角色与队伍、评分。period.py 在这批模型之上做期数推算，深塔以固定锚点日加 42 天周期推"当期/上期/下期"，这个换算同时服务于 wiki 查询和 AI 知识库的动态标签。

model_other.py 只有一个 EnemyDetailData：敌人等级（默认 90）和各属性抗性（默认 10%）。它是伤害公式里抗性乘区和防御乘区的输入，用户可以用文本指令覆盖（role_info_change.py 支持改敌人参数），排轴的报告也用它。

---

# 第四章 登录与用户凭据体系

用户想查自己的私人数据（体力、面板、抽卡），得先把库街区账号"交给"机器人。这一章讲登录的四条路径和凭据的落库管理。

## 4.1 四条登录路径

| 入口命令 | 方式 | 产出凭据 |
|---|---|---|
| `ww登录`（无参） | 网页填手机号+验证码 | KuroBBS token + did |
| `ww登录 手机号,验证码` | 群聊直接发短信验证码 | 同上 |
| `ww邮箱登录` | 网页填国际服邮箱密码（带极验） | launcher auto_token + access_token + device_no |
| `ww抽卡登录` | 网页直通官方 SDK 拿云鸣潮登录态 | 云鸣潮 recordId（抽卡凭据） |
| `ww添加token <token>` | 用户自己抓包拿 token 贴进来 | KuroBBS token |

四条路径共享一套基础设施（login.py）：一次性登录会话、本地/外置双模式、轮询交付。

**一次性会话**。`get_token()` 用 `secrets.token_urlsafe(16)` 生成会话 token，存进 `TimedCache(timeout=180, maxsize=10)`——3 分钟有效期，最多 10 个并发会话。这个缓存带 sqlite 落盘（persist_path 指向 url_cache.db），cache.py:21-27 的注释解释了动机：多 worker 部署下，登录页写进 A 进程内存的状态，B 进程的轮询读不到，用户就会拿到 404。落盘后磁盘是权威源。`evict_user_login` 会在发新链接前撤销同用户全部未完成会话，保证任何时刻只有一个有效登录链接。

**本地/外置双模式**。`get_url()`（login.py:47-62）读配置 `WavesLoginUrl`：配置了外置登录站就用它（is_local=False），没配就用 gsuid_core 自己的 HOST/PORT 加自动探测的公网 IP（is_local=True）。这个设计照顾了两种部署：家里 NAS 跑 bot 的，直接用 core 端口；没公网或不想暴露端口的，把登录页部署到 VPS 上，bot 只拿结果。

## 4.2 网页短信登录的完整流程

以本地模式为例（login.py:134-175），流程是个五步接龙：

1. bot 生成 user_token，cache 写入 `{flow:"page", mobile:-1, code:-1, user_id}`，发链接 `{url}/waves/i/{user_token}` 给用户；
2. 用户在网页填手机号，收验证码，填入提交。网页由插件自己的 FastAPI 端点渲染（login.py:348-416），POST `/waves/login` 把 mobile/code 写回 cache；
3. bot 侧 `page_login_local` 每秒轮询 cache，最多 180 秒，等到 mobile/code 非默认值；
4. `code_login`（login.py:273-324）校验大陆手机号格式 `1[3-9]\d{9}` 和 6 位验证码，生成大写 UUID4 设备号，调 `waves_api.login(mobile, code, did)` 打库洛 sdkLogin 接口，取回 token；
5. `add_cookie` 落库（下一节），成功后发回执。

群聊直接发"手机号,验证码"的路径跳过网页，少两步轮询。但 login.py:304-311 有个细节：库洛对错误验证码返回"系统繁忙"之类的占位响应，代码专门做了防泄漏处理，统一回错误文案，不把上游原话透给用户。

外置模式（page_login_other，login.py:178-258）里 bot 的工作更少：POST 外置站 `/waves/token` 领会话号，发链接，轮询 `/waves/get` 拿到现成的 `{ck, did}`。也就是说外置站负责"网页到库洛 API"这一整段，bot 只做凭据入库。这个契约让登录站的实现可以完全独立。

## 4.3 邮箱登录：串起 SDK 四步

国际服邮箱登录（email_login.py）的网页端点 `/waves/l/login`（397-484 行）把 api_sdk.py 的四步串成一条链：`email_login`（密码经 `_scramble_password` 混淆，极验四字段由前端传入）→ `exchange_access_token`（登录 code 换 access_token，OAuth authorization_code 流）→ `make_oauth_code`（access_token 换 launcher 用的 OAuth Code）→ `query_player_brief`（拿各区服角色列表）。

拿到角色列表后有个分支：单区服直接进入绑定流程（phase 置 done）；多区服返回 `bound:false` 让前端弹卡片让用户选，选完 POST `/waves/l/bind`（487-519 行），服务端校验 role_id 和 region 与会话中 regions 匹配才放行。

`_persist_login`（272-332 行）是国际服凭据入库的核心，字段映射关系需要记住，因为整个国际服体系都建立在这个约定上：**WavesUser.cookie 存 auto_token，bat 存 access_token，did 存 device_no**。另外 `WavesUserSdk.upsert` 存 region，`update_bat_expires_at` 存过期时间戳；首次登录按区服设默认语言（HMT 区默认繁中，REGION_LANG_DEFAULTS，email_login.py:44-50）。

## 4.4 云鸣潮登录

抽卡记录的凭据走第三条路。cloud_api.py 直连云鸣潮（云游戏版）服务器：网页前端拿到官方 SDK 登录信息 `{cuid, username, token}` 后 POST 到插件端点 `/waves/c/sdkLogin`，服务端 `exchange_cloud_token` 把它换成云鸣潮 app token（请求头伪装 `Origin/Referer: mc.kurogames.com`，cloud_api.py:59-70），再 GET `/Message/GameRecordInfo` 拿 `playerId` 和 `recordId`——recordId 就是抽卡链接查询的核心凭据。login_info 整包存进 WavesGachaCloud 表，成功后立即拉一次抽卡记录。

cloud_login.py:452-465 有两个返回固定文案的僵尸端点 `/waves/c/sendCode` 和 `/waves/c/login`，注释说明是旧版手机验证码直连方案，已停用。登录方式从"短信直连"演进到"网页 SDK 直通"，旧路由留着是给老用户的提示。

输入校验 `normalize_sdk_login_info`（cloud_api.py:31-42）对 cuid/username/token 限长并拒绝换行符。登录态刷新 `refresh_login_record` 先用旧 app token 试，失败再用存档的 sdk_login_info 重登；重登也失败但旧 login_info 里有 recordId，就降级继续用旧 recordId（cloud_login.py:59-91）——抽卡查询只需要 recordId，登录态别的部分死了不影响。

## 4.5 凭据落库与绑定

deal.py 的 `add_cookie`（26-181 行）是所有路径的汇合点。它做的事：

1. 拿 token 同时查鸣潮（game_id=3）和战双（game_id=2）的角色列表——一个库街区账号通吃库洛两款游戏，所以这个插件顺带支持了战双的部分功能；
2. 对每个鸣潮角色调 `get_request_token` 取 bat（accessToken），存在就 update（status 清空、is_login 用 OR 逻辑只升不降，deal.py:55-72），不存在就 insert，然后补 bat/did，`WavesBind.insert_waves_uid` 绑定并把当前 UID 切到新绑的；
3. 战双角色走同构逻辑；
4. 汇总文案 `[鸣潮]【名字】特征码【脱敏uid】登录成功!`。

第 4 步看似普通，其实是个内部契约：上层命令处理器靠严格匹配"登录成功"四个字判断成败，deal.py:176-181 附近的注释专门解释了为什么不能用模糊匹配——上游占位响应里也有"请求成功"字样。

is_login 的 OR 语义值得展开：同一个 uid 可能对应多个 QQ 号的登录记录（比如群友都用公共 token 查过），`update_token_by_login`（models.py:375）在登录续期时批量刷新同 uid 且活跃的记录的 cookie/did。反过来，`delete_cookie`（models.py:331）删除 is_login=True 的记录时会级联删除所有同 uid 记录——共享登录的记录同生共死。

## 4.6 登录成功回执与防护

login_succ.py 的 `login_success_msg` 做最后一公里：查区服拼后缀，国服渲染刷新面板图加体力/深塔按钮；国际服只发文本。国际服不渲染的原因写在 login_succ.py:38-48 注释里：auto_token 拿去打 KuroBBS 的接口会被当成过期 token，触发 mark_cookie_invalid 会把好好的 launcher 凭据冲掉。为了渲染一张图把用户凭据搞死，不值得。

用户侧还有每日维护任务：23:30 cron 删除全量无效 cookie（DelInvalidCookie 开关，wutheringwaves_user/__init__.py:259-287），删完私聊通知主人。"删除不活跃群成员"命令按 WavesUserActivity 的活跃时间把 42 天（ActiveUserDays 可配）没说过话的用户从群绑定里摘除，但无活跃记录的新用户有宽限期，任一 uid 活跃则整行豁免。

## 4.7 token 生命周期治理

把凭据当成有生命周期的对象看，插件有一整套治理动作，命令面如下：

| 命令 | 权限 | 动作 |
|---|---|---|
| `ww添加token <token>` 或 `ww添加token <token>,<did>` | 用户 | 贴 token 落库（did 校验 32/36/40 位） |
| `ww删除token` | 用户 | 删除自己的凭据（is_login=True 级联删同 uid） |
| `ww获取token` | 用户 | 私聊回显 token+did 明文，供用户迁移到其他工具 |
| `ww刷新绑定` | 用户 | 遍历所有 token 重新拉角色列表刷新绑定关系 |
| `ww删除无效token` | 主人(pm=1) | 全库清理 status=无效 的记录 |
| `ww绑定/切换 <uid>` | 用户 | 特征码绑定与切换，带按钮交互，MaxBindNum 限制未登录绑定数 |

治理的三个机制：一是**被动标记**——请求层发现 220/登录态失败就 mark_cookie_invalid；二是**主动巡检**——check_self_login 在每次查询前验登录态，bat 失效先续期；三是**定时清淤**——23:30 的全量清理加活跃度驱动的绑定摘除。三者各管一段：被动标记兜准确率，主动巡检兜体验（不让用户每次查询都撞失效凭据），定时清淤兜库存健康（无效 token 留在公共池里会拖累所有人的查询）。

获取token 命令回显明文这个设计值得停一下：用户对自己账号的凭据有完全的处置权（搬家到其他工具是正当需求），但明文回显必须强制私聊——群聊回显等于凭据泄露。代码里对这条命令的群聊分支直接拒绝。

## 4.8 凭据的安全边界

站在用户角度评估"把 token 交给机器人"的风险面：这个 token 能做什么、不能做什么。

能做的：查询游戏数据（面板、抽卡、体力、深塔记录）、执行社区签到（消耗签到次数但不产生损失）、读取库街区账号的角色列表——而且一个 token 通吃鸣潮和战双两款游戏（deal.py 同时查两个 game_id）。不能做的：token 不涉及支付能力，也改不了账号设置（这些走官方客户端的独立鉴权）。

插件侧的保管措施：token 明文存 SQLite（没有额外加密，文件系统权限即边界）；回显仅私聊；公共池使用他人的 token 只做只读查询；每日清理无效凭据减少库存暴露面。相对薄弱的环节：SQLite 文件本身没有加密，拿到服务器文件系统的人可以导出全部用户 token；登录会话的 URL 若被转发，token 在 180 秒窗口内可被抢注（evict 机制缓解但不杜绝）。这类风险是此类社区机器人的共性而非本项目独有，用户应当以"这个 token 最多丢掉签到和隐私数据"的心理预期来决定是否登录。

---

# 第五章 数据库层

## 5.1 ORM 基座与表清单

数据库全部基于 gsuid_core 传递的 SQLModel + SQLAlchemy async。模型继承关系决定行为：`Bind`（绑定表基类）和 `User`（用户表基类）自带 `insert_data/select_data/update_data/delete_uid` 通用 CRUD；`BaseIDModel` 只有 id 主键；`BaseBotIDModel` 在 BaseModel 之上加 bot_self_id——多 bot 实例部署时，活跃度要按实例分开统计。

插件自己的表有 9 张：

| 表 | 基类 | 干什么 |
|---|---|---|
| WavesBind | Bind | QQ 号到游戏 UID 的绑定，多 UID 用 `_` 拼接存储，group_id 记录出现过的群 |
| WavesUser | User | 登录凭据主体：cookie/uid/platform/bat/did/game_id/is_login/status/avatar_url/last_used_time 等 |
| WavesStaminaRecord | BaseModel | 体力查询与推送记录：mr_value、stamina_push_switch、stamina_threshold、user_email、email_* 一组字段 |
| WavesLangSettings | BaseIDModel | 用户语言偏好 |
| WavesSubscribe | BaseModel | 群到 bot 实例的映射（不是订阅本体） |
| WavesUserActivity | BaseBotIDModel | 用户活跃时间 |
| WavesGroupActivity | BaseBotIDModel | 群活跃时间 |
| WavesUserSdk | BaseModel | 国际服 launcher 凭据扩展：region、bat_expires_at |
| WavesGachaCloud | BaseModel | 云鸣潮登录态 JSON |

WavesUser 的字段演化痕迹很重。models.py:32-45 的 exec_list 里一长串 `ALTER TABLE ADD COLUMN`（pgr_uid、platform、stamina_bg_value、hide_uid_self_value、bbs_sign_switch、bat、did、game_id、is_login、created_time、last_used_time、avatar_url）对应了功能一步步加上去的历史：先是支持战双（pgr_uid），再是体力背景自定义，再是国际服（bat/did），再是活跃度治理（created_time/last_used_time）。

## 5.2 双轨迁移机制

这是数据库层最值得学的一块。插件面临的问题：exec_list 里的 SQL 只在 core 启动前跑一次，而 gsuid_core 支持插件热重载（reload_plugin），热重载不会重跑 exec_list。模型加了新列而实表没有，全表 ORM 查询直接报 `no such column`。

解法是 auto_migrate.py 的 `auto_add_missing_columns`（:84），挂在 `@on_core_start` 钩子上——core 启动和插件热重载都会触发。机制分四步：

1. **表清单不手写**：`_plugin_tables`（:29）从调用方模块名推出插件包前缀，递归遍历 `SQLModel.__subclasses__()`，收集 `__module__` 匹配前缀的所有 table 名。新加表不需要登记；
2. **对比**：SQLAlchemy `inspect` 取实表列集合，逐个对比模型 `table.columns`，模型有、实表缺的才补；
3. **生成 SQL**：`_add_column_sql`（:73）按方言编译列类型，默认值取 server_default，否则取标量 default（bool 转 1/0、字符串加引号转义），有默认值且非 nullable 追加 NOT NULL；
4. **执行**：只读检查用一次 connect 完成，每条 ALTER 在独立事务里跑，幂等，失败仅 warning。

一次性重迁移（跨版本大改，比如改列类型、数据订正）走 exec_list；日常加列走 auto_migrate。双轨的分工清晰。models.py 里还有一段注释掉的大块迁移代码（__init__.py:221-312 附近，WWUID 改名、bg→show 目录迁移），是从旧插件名 XWavesUID/WWUID 迁过来的历史化石。

## 5.3 WavesSubscribe：多 Bot 实例的路由校正

这张表只有三个字段：group_id（unique）、bot_self_id、updated_at。它不是订阅本体（订阅存在 core 的 Subscribe 表），而是解决多 Bot 部署下的一个路由问题：同一个 QQ 群可能在多个 bot 的群里，公告推送该由哪个实例发？答案：谁最近在群里发过消息谁发。

维护方式是 Monkey Patch：bot_send_hook.py:179 的 `install_bot_hooks()` 包装 `Bot.send` 和 `Bot.target_send`（幂等标记防重复安装），每条群消息发出前触发 `waves_bot_check_hook` → `WavesSubscribe.check_and_update_bot`（:31）：先把 core Subscribe 表里该群 bot_self_id 不一致的订阅记录批量 UPDATE 成当前实例，再用 SQLite `INSERT ... ON CONFLICT DO UPDATE` 原子 upsert 本表。注释明确说用 upsert 是为了避免并发 INSERT 竞态导致索引损坏。

整个项目只有三处消费这张表：消息 hook（自动校正）、订阅公告时、联系主人订阅时。推送前查一下群该由谁发，避免多实例重复推送。

## 5.4 活跃度体系：缓冲、防自污染、legacy 兼容

WavesUserActivity/WavesGroupActivity 记录用户和群的最后活跃时间，消费方有三类：公告推送过滤（42 天内活跃的群才推）、排行活跃过滤（RankActiveFilterGroup）、群主清理不活跃绑定。

写入路径前面讲过：Monkey Patch 钩子 → 内存缓冲 → 60 秒批量落库 → 退出 flush。两个细节：

**防自污染**。公告推送会往群里发消息，发消息触发钩子，钩子把群标记为活跃，下次推送又推给它——推送流量自己证明了自己活跃，形成正反馈。解法是 `ANN_PUSH_GUARD: ContextVar[bool]`（waves_group_activity.py:11），推送期间置位，钩子检查到就跳过。用 ContextVar 而不是全局变量，是因为异步环境下多路推送并发，全局开关会互相踩。

**legacy 键兼容**。waves_user_activity.py:67-82 的注释记录了一次事故：旧版曾把 bot_self_id 错存进 bot_id 列。升级后查询按新键找不到，代码会按 legacy 键再找一次，找到就迁移。这种"写数据时留后路"的兼容代码是运营型项目绕不开的债。

## 5.5 player_store：玩家 JSON 的落盘规范

用户面板数据不走数据库，走文件系统：`players/<uid>/rawData.json`（全角色面板）、`rover.json`（主角各形态）、`charListData.json`（评分缓存）、`gacha_logs.json`（抽卡记录）、`matrixData.json`（矩阵记录）。utils/player_store.py 给这批文件定了规矩：

- **白名单 gzip**：rawData.json、rover.json、gacha_logs.json 等六个文件名走 gz 压缩（player_store.py:11-18）——全角色面板 JSON 很大，压缩率高；
- **原子写**：写临时文件后 `os.replace()` 原子替换；gz 文件先写验再删旧明文（:92-113）；
- **多候选读**：gz 优先，坏了回退明文（:74-89）；
- **异步包装**：所有 IO 经 `asyncio.to_thread`，避免阻塞事件循环（:116-121）。

配套的还有 refresh_char_detail.py:292 的损坏检测：rawData_corrupt 时跳过保存，防止用坏数据覆盖好数据。数据库管结构化状态，文件管大块 JSON，各干各的。

## 5.6 Web 管理后台

models.py:729-808 用 gsuid_core 的 `@site.register_admin` 注册了 8 个管理页：鸣潮绑定、用户、发送-群组绑定、用户活跃度、体力推送、launcher 扩展、云登录。部署者可以在 core 的 Web 后台直接看改数据，不用进 sqlite 命令行。体力推送那张表的管理页放在这里有点尴尬——推送本体在外部伴随插件 roverreminder 里，表却在主插件这边，管理员会在这里改开关然后疑惑为什么没效果。

## 5.7 核心表字段速览

几张高频表的字段设计记录着功能的演化，列出来备查。

**WavesUser**（凭据主体，models.py:179-191）：cookie（token，国服/国际服语义不同）、uid、platform（凭据平台）、stamina_bg_value（体力背景偏好）、hide_uid_self_value（隐藏 UID）、bbs_sign_switch（自动社区签到）、bat（accessToken，国际服存 access_token）、did（设备号）、game_id（3=鸣潮、2=战双，server_default="3"）、is_login（是否 waves 登录）、created_time / last_used_time（活跃统计依据）、avatar_url（发消息时缓存的头像）、status（"无效"标记）。一张表同时承担凭据存储和用户偏好，是演化最快的表——exec_list 里 12 条 ALTER 全是给它加列。

**WavesStaminaRecord**（models.py:549-560）：uid、bot_self_id、mr_query_time / mr_value（上次查询时间与体力值）、user_email、stamina_push_switch（默认 off）、stamina_threshold、email_last_try_time / email_send_success / email_last_success_time / email_fail_count、is_ck_valid。推送相关字段占了一半，但推送本体在外部插件——这批字段是数据契约。

**WavesBind**（models.py:63 起）：继承 core 的 Bind，多 uid 用 `_` 拼接存一个字段，group_id 记录绑定出现过的群。insert_waves_uid（:93）处理拼接与 group_id 追加；delete_uid（:155）覆写父类，删除成功后联动清理 WavesStaminaRecord。

**WavesUserSdk**（waves_user_sdk.py:18）：region（国际服区服）、bat_expires_at（access_token 过期时间戳）。它存在的意义是把"launcher 体系特有的字段"和通用凭据表分开，避免 WavesUser 无限膨胀。

**WavesGachaCloud**（waves_gacha_cloud.py:20）：login_info JSON 整包存储（sdk_login_info/app_login_info/device_id/platform/record_info），schema_version 字段为将来格式变更留了退路。

## 5.8 数据库访问的代码模式

模型方法层的写法有几个固定习惯，二次开发时应当沿用：

**通用 CRUD 优先**。core 基类提供的 insert_data/select_data/update_data/delete_uid 覆盖八成场景，插件自己的方法只写有业务语义的（update_token_by_login 的批量续期、delete_cookie 的级联）。没有到处手写 select 的现象。

**with_session 装饰器**。所有自定义方法经 core 的 with_session 包装，会话的开启提交回滚由装饰器统一管理，方法体里不碰事务边界——这和 FastAPI 项目里 Depends(get_db) 的思路一致。

**原子 upsert**。涉及"存在则更新否则插入"的场景全部用 SQLite 的 INSERT ... ON CONFLICT DO UPDATE（waves_subscribe.py:67-82），注释明确说明是为了避开并发 INSERT 竞态损坏索引。不用"先查再插再改"的三段式。

**批量写走缓冲**。高频写（活跃度）不直接落库，进内存缓冲由后台循环批量刷（2.3 节）。高频读靠 TimedCache，读库是最后手段。

**级联与一致性手写**。SQLModel 层没配外键级联，删除 WavesUser 的登录记录时手动联动清理 WavesStaminaRecord（models.py:155 附近），is_login 的 OR 只升不降语义在应用层维护。没有数据库层约束兜底，一致性依赖调用方纪律——这是 SQLite 单写者场景下的务实选择，换 PostgreSQL 且多写者时要重新审视。

---

# 第六章 配置系统

## 6.1 三层配置与两处例外

配置分散在三个层面，读写机制各不相同：

1. **全局配置**：wutheringwaves_config.py 用 gsuid_core 的 `StringConfig("XutheringWavesUID", CONFIG_PATH, CONFIG_DEFAULT)` 声明，60 多个配置项定义在 config_default.py，落到 core 的 data/config.json，部署者在 core Web 后台或 JSON 文件里改；
2. **群级 JSON**：三份不走 gsuid_core 配置框架的独立文件——ann_config.py（公告已见 ID）、gacha_config.py（群抽卡排行阈值）、guide_config.py（群排除的攻略提供方），各带 `threading.Lock` 和"临时文件 + os.replace"原子写；
3. **用户级偏好**：直接存数据库行字段（WavesUser.stamina_bg_value、hide_uid_self_value）或绑定关系（panel_card_pref 的面板图 pin）。

展示类的登录页模板路径、毛玻璃参数、帮助图素材走另一份独立 JSON（show_config.py，`StringConfig("鸣潮展示配置", ...)`），因为它们大多配图，不适合塞进 core 的配置后台。

## 6.2 主配置里值得注意的项

config_default.py 60 多项，按功能分组后有几个值得点名：

**代理组**（243-305 行）是一整块 cliproxy 面板：Enable/GatewayHost/Port/Username/Password/Region/StickyMinutes/RequestTimeout/MaxAttempts/HedgeDelayMs/TransitProxyUrl。配置粒度细到对冲延迟毫秒数和 SID 粘性分钟数，说明作者在自己的部署环境里反复调过这组参数。

**自更新组**（153-211 行）：QyAutoUpdate、QyUpdateProxy（默认 Clash 7899 端口）、QyUpdateGithubUser/Token/Branch、UpstreamRemote/UpstreamUrl、AutoPush。wutheringwaves_update 模块每天 4:20 从上游 XutheringWavesUID 仓库拉取合并，推到自己的 fork。`ww滚蛋+序号` 命令做安全回滚：备份 ref 加祖先校验，防止回滚到不存在的提交（CHANGELOG 2026-08-02 记录）。

**渲染组**：UseHtmlRender（总开关）、RemoteRenderEnable/RemoteRenderUrl（外置渲染服务，POST HTML 返回图片，给装不动 Chromium 的机器用）、FontCssUrl。

**活跃治理组**：ActiveUserDays 默认 42（公告推送活跃群认定、排行活跃过滤、清理不活跃绑定共用）、DelInvalidCookie、CacheDaysToKeep 默认 45。

**HelpExtraModules**（:372）暴露了一个架构事实：帮助文案里预留了 roversign（自动签到）、todayecho、scoreecho、roverreminder（体力邮件推送）四个"额外模块"位，这些功能在生态里的伴随插件实现，主插件只留数据表和帮助位。

## 6.3 设置命令与权限分层

`ww设置` 命令（set_config.py + __init__.py:52 起）按三级权限分发：

- **任意用户（需已绑定 uid）**：设语言（5 语种校验）、设体力背景（含角色名别名归一化和图片 hash 校验，set_config.py:31-44）、隐藏 UID on/off、面板图 pin；
- **群管理（user_pm ≤ 3）**：`设置群排行 1/2` 改群级排行开关（写全局配置的两个群列表）、`设置排除攻略 X` 写 guide_config.json、`设置抽卡条件 <数字>` 写 gacha_config.json；
- **主人**：只有 Web 后台和 secret 配置（WavesToken、WavesLoginUrl 等），命令层面不提供。

权限判断的原文是 `ev.user_pm > 3` 拒绝——gsuid_core 的 user_pm 数字越小权限越高（0 是主人，3 大约是管理员，6 是普通用户）。

## 6.4 部署者的常见配置组合

配置项有 77 个，但典型部署其实只动其中几组。按场景归纳：

**低配机器（1c2g）**：UseHtmlRender=false 关掉 Playwright 路径，全部走 PIL；或者配 RemoteRenderUrl 把渲染甩给另一台机器——POST HTML 返回图片，插件侧零渲染开销。这两条路是 config_default.py:401 注释明说的官方建议。

**家用 NAS 且有公网**：什么都不用配。登录页走 core 端口（get_url 自动探测公网 IP），渲染走本地 Playwright，排行走默认远端。装好就能用是项目的主路径。

**无公网环境**：WavesLoginUrl 指向一台外置登录站（登录、贴 token、抽卡授权全走它，bot 只收结果），RemoteRenderUrl 可选配外置渲染。这条链路的契约在 4.2 节讲过：外置站负责"网页↔库洛 API"，bot 负责落库。

**想自建排行**：部署 rank_server（compose 一条命令），配 WavesToken 和 WavesRankBaseUrl 两个 secret 项，注意两者必须一致且改地址后要重载插件。

**上游风控严重的网络环境**：配置 cliproxy 全家桶（住宅代理池），NeedProxyFunc 至少包含 get_role_detail_info（角色详情）。如果只是偶尔风控，LocalProxyUrl 挂个普通代理就够。

**隐私敏感的群**：WavesOnlySelfCk=true 关公共凭据池、HideUid 开、RankActiveFilterGroup 按需开。这三个开关分别关掉"用别人的 token 查"、"明文显示 UID"、"不活跃用户进排行"三件事。

## 6.5 secret 配置与敏感值

77 个配置项里有 5 个标注了 secret（在 core 的配置后台会隐藏显示）：WavesLoginUrl、WavesToken、WavesRankBaseUrl、FontCssUrl、WavesPanelEditPassword。敏感的原因各不相同——前两个是凭据（泄漏等于别人能以你的身份上传排行或架设登录钓鱼站），WavesRankBaseUrl 和 FontCssUrl 泄漏会暴露自建服务与字体源的地址，编辑器密码更是直接的攻击入口。

值得部署者知道的一点：这些值最终都明文存在 core 的 data/config.json 里，文件系统权限是真正的边界（和 4.8 节的用户 token 同理）。secret 标记防的是"配置后台截屏泄漏"和"配置导出时误带"，防不了拿_shell 的人。另外几个容易被忽视的敏感点：QQPicCache 的缓存目录里有用户头像、players/ 目录有全部用户面板数据、gacha_logs 是完整的抽卡历史——备份或迁移服务器时这批数据比配置文件更该小心。

---

# 第七章 角色数据与伤害计算体系

这是项目技术含量最高的部分。鸣潮的数值系统相当复杂：六维属性、五件声骸的主副词条、合鸣套装、武器谐振、固有技能、命座、共鸣链分支、元素反应（聚爆/霜渐/虚湮/风蚀/电磁/光噪六种效应）、队伍 buff、延奏变奏。要把一张面板算出期望伤害和评分，代码量上万行。这一章拆开看。

## 7.1 数据从哪来：面板获取与清洗

一切从 `refresh_char_detail.py` 的 `refresh_char`（:430）开始。用户发"刷新面板"，插件用其凭据调库街区 API 拿角色列表和每个角色的 RoleDetailData，SemaphoreManager 控制并发（默认 8，配置 RefreshCardConcurrency），gather 并发拉取。

拉回来的数据不能直接用，要清洗（:561-603）：

- 删除武器描述里的 effectDescription 字段——注释原文："扰我道心 难道谐振几阶还算不明白吗"。武器效果文本会被后文的注册器按谐振阶重算，API 给的原文是冗余的；
- 用角色列表里的 chainUnlockNum 修正 chainList[].unlocked——详情接口的解锁标记有时不准；
- 修正错误套装名："雷曜日冕之冠"改成"荣斗铸锋之冠"，API 数据错误在插件侧打补丁；
- phantomData.cost == 0 时清空 equipPhantomList——未装备声骸的角色会返回 cost 0 的空壳数据。

清洗完落盘三个文件（player_store）：rawData.json 存全角色数组（先经 `remove_urls_from_data` 递归剥掉所有 URL 字段，防注入也防体积膨胀），rover.json 按 canonical id 合并存储主角各属性形态（漂泊者在鸣潮里是特殊角色，男女形态加多属性分支，全项目用 SPECIAL_CHAR 映射表贯穿处理，存储时折叠、查询时展开、排行时随机化性别避免分布倾斜），charListData.json 存评分缓存并挑选"top_improver"——跨评分档位（210/195/175 阈值）提升的用户会收到提示。

## 7.2 静态数值层

伤害计算的分子分母都需要游戏静态数值：角色白值（各等级各突破阶段的攻击/生命/防御）、武器白值和副词条、技能倍率、合鸣套装效果参数、声骸技能。这些数据来自 `resource/map/detail_json/`，由资源下载模块从镜像站（ww1/ww2/ww3.loping151.top|.cn，启动时并发测速选最快的）整包下载。

utils/ascension/ 是这批数据的访问层，模块级惰性单例加载。几个解析细节：

**角色固有技能**（char.py:117-168）：鸣潮角色的技能树里有一个"固有技能"条目，白送面板属性（比如"攻击力提升 12%"）。新版 API 直接在 param[0] 给数值；老数据要从描述文本里抽——`extract_param_index` 找 `{n}` 占位符确定取 param 数组第几位，取不到再对描述做正则。产出 `fixed_skill: {词条名: "x%"}` 映射，这是面板里"白送属性"的来源。

**武器效果**（weapon.py:79-125）：武器描述里的 `{i}` 占位符依次替换为 `param[i][resonLevel-1]` 得到当前谐振阶的效果文本。`sub_effect` 判断效果文本是否以 18 个标准词条名（fixed_name，"攻击力提升"这类）开头，是的话当作面板词条直接计入，否则是特殊机制交给注册器。

**合鸣组合检测**（sonata.py:103-125）：COMBO_SONATA_RULES 硬编码了特定角色的 2+2 套装规则（洛可可"湮灭+攻击 2+2"、菲比同理），`detect_combo_sonata` 动态发现候选 2 件套组合，产出"洛2+2|套装A|套装B"这样的标签。

## 7.3 WuWaCalc：三段式面板聚合

utils/calc/__init__.py 的 WuWaCalc 把"API 原始面板"折叠成"可计算面板"，三段流水线：

**第一段 prepare_phantom()（:107）**：声骸词条求和。把五件声骸的主副词条逐条累加，含 `%` 的攻击/生命/防御自动改名成"攻击%/生命%/防御%"（字符串百分比相加由 `_add_prop_value` 处理）；按套装名归组，满 2 件把两件套效果加进面板；产出 ph_detail（每件声骸的名字、件数、是否满件）和首位声骸 id。

**第二段 enhance_summation_phantom_value()（:152）**：白值合成。角色白值加武器白值得基础攻击，然后按"攻击 = 基础 × 攻击% + 声骸固定攻击"合成（:174-185），同时保留 atk_flat/atk_percent 等中间量——后面的 buff 系统要按"加固定值"还是"加百分比"分别处理，所以面板 dict 必须保留成分。首位声骸的特殊属性走注册器：`WavesEchoRegister.find_class(echo_id).do_equipment_first(roleId)`，比如"万囮牢·朽躯"放首位给热熔/重击伤害 +12%。

**第三段 enhance_summation_card_value()（:202）**：全量叠加成 card_sort_map。武器副词条、武器 sub_effect、角色 fixed_skill、共鸣效率基础 +100%、暴击 5% 和暴伤 150% 底数、本角色属性伤害加成，逐项累加。中间穿插两个套装特判："无惧浪涛之勇"满 5 件且共鸣效率 ≥250% 时属性伤害 +30%（:269-276）；"失序彼岸之梦"3 件且角色属于 Ancient_Role_Ids（弗洛洛/洛瑟菈）时暴击 +20%（:278-284）。伤害分类键在这里归一：普攻/重击/共鸣技能/共鸣解放/声骸伤害加成映射成 attack/hit/skill/liberation/phantom_damage 五个英文键。

最后 `card_sort_map_to_attribute()`（:338）把 dict 转成 DamageAttribute 对象，注入敌人参数（默认抗性 10%、等级 90，来自 EnemyDetailData，用户可以用文本指令改）和 RoleDetailData 引用。

## 7.4 DamageAttribute 与伤害公式

utils/damage/damage.py 的 DamageAttribute（:32）承载全部乘区。所有属性经 `_to_float` 归一（% 字符串除以 100）。角色三维模板：atk/life/defense property（:110-120）= 白值 × (1 + 百分比) + 固定值；`char_template ∈ {temp_atk, temp_life, temp_def}` 决定技能倍率乘哪个基底——生命盾角色（比如某些奶妈）的技能倍率乘的是生命模板。

核心公式 `calc_damage_value`（:319-350）展开是这样：

```
伤害 = base（面板值 × 倍率）
     × (1 + dmg_bonus + 分类加成)         伤害加成乘区
     × (1 + dmg_deepen + effect_dmg_deepen)  伤害加深
     × (1 + easy_damage + effect_easy_damage) 易伤/最终伤害
     × crit                                暴伤（期望伤害时 = 1 + 暴击率 × (暴伤-1)）
     × resistance                          抗性分段：<0 → 1-r/2；<0.8 → 1-r；否则 1/(1+5r)
     × defense                             防御：(100+攻方等级) / ((100+攻方等级) + (100+敌等级)×(1-减防)×(1-无视))
```

抗性的分段函数是鸣潮的实际机制（负抗减半生效、高抗递减收益），`ignore_bonus` 参数只去掉加成乘区、保留加深/防御/抗性——某些技能"无视伤害加成"的语义就这么表达。

这个类有两个精巧的设计。

**动态方法生成**（`__getattr__`，:352-373）：任何 `add_xxx/set_xxx/is_xxx/env_xxx` 形式的方法，只要没显式定义就自动生成——`add_` 走 `_add_number` 记录到 effect 日志，`is_` 返回恒 False，`env_` 返回 False。为什么需要这个？后文的 buff 注册器有近 400 个手写类，角色机制迭代很快，注册器代码里想调 `attr.add_夜归重激()` 这种新乘区时，不用回头改 DamageAttribute 核心，任何新字段名即调即有。代价是字段名打错不报错，静默变成一个没人消费的乘区。

**效果日志**：每个 buff 调用都带 title/msg 记进 `self.effect` 列表，面板渲染时把"哪些 buff 生效了、各加了多少"画成列表（draw_char_card.py:816 起）。伤害数字从黑盒变成可解释的过程，用户能对照游戏内行为检查。

`calc_percent_expression`（:402-416）把"12.5%*3+6%"这类武器 buff 表达式转成 AST 白名单求值（只允许四则运算），register_weapon.py 里大量使用——武器叠层数值经常是"每层 12.5%，最多 3 层"的表达式形态。

## 7.5 Buff 注册器：398 个手写类

伤害计算的另一半是"这个角色的 buff 在什么条件下加多少"。鸣潮每个角色有独特机制（命座效果、队伍增益、延奏效果），武器有特效，声骸有主动技能。utils/damage/abstract.py 定义了七张注册表（WavesRegister/WavesWeaponRegister/WavesEchoRegister/WavesCharRegister/DamageDetailRegister/DamageRankRegister/ScoreDetailRegister），三个抽象基类规定钩子：

- `WeaponAbstract.do_action(func_list, attr, isGroup)`：按"本次结算的是什么动作"（普攻/重击/技能/解放/变奏）依次调 `cast_attack/cast_skill/cast_liberation/cast_variation` 钩子，自动追加环境效应钩子（env_spectro 等六种元素效应）；
- `EchoAbstract`：`damage()` 是声骸技能主动伤害，`do_equipment_first()` 是首位放置属性；
- `CharAbstract.do_buff()`：先 `attr.add_teammate(id)` 防止队友 buff 重复叠加，再调子类 `_do_buff`。

三个 register 文件共 398 个类，全部硬编码：register_char.py 53 个角色类（每个角色的命座、延奏、队伍 buff 手写）、register_weapon.py 122 个武器类（5 星武器实现 cast 钩子，2-4 星多为空壳只注册名字）、register_echo.py 223 个声骸类。看一个例子（register_char.py:29，散华 Char_1102）：六链攻击 +20%、装备"轻云出月"套 +22.5% 攻、装备"无常凶鹭"声骸 +12% 伤害、延奏给下个角色的普攻加深 38%——按 `attr.char_damage` 判断该进哪个乘区。

武器侧的写法看两个。浩境粲光（Weapon_21010015，register_weapon.py:36）的施放钩子里直接用 `param(1) * param(2)` 计算叠层数值——param 按 1 基取当前谐振阶的参数表，配合表达式求值器处理"每层 x%，至多 y 层"这类结构。苍鳞千嶂（:44）在变奏/解放钩子里加重击伤害，每个钩子开头都有 `if attr.char_damage != "重击伤害": return` 这样的门控——buff 只在结算动作匹配时生效，不做全局常驻。这个门控是武器注册器的通用写法：鸣潮武器特效普遍是"某类动作命中时"生效，把条件写进门控比塞进数值更直白。

声骸注册器分两类职责：实现 `damage()` 的声骸（主动技能打伤害，走 do_echo 结算）和实现 `do_equipment_first()` 的声骸（放置首位给面板属性）。前者参与伤害结算流程，后者只在面板聚合时跑一次。223 个类里多数只注册了名字和 cost——供图鉴和识别用，不参与计算。

注册入口统一在 utils/map/damage/register.py：`reload_all_register()` 依次调 register_weapon/register_echo/register_damage/register_rank/register_score/register_char，最后 init_queues() 启动上传队列。评分和伤害计算函数注册到全部"可用角色 ID"（来自本地权重表的 39 个角色加漂泊者别名 ID_ALIASES：1408→1406、1501→1502 等，男女形态共用权重）。

注册器有个跨进程锚定技巧（abstract.py:9-16）：注册表 dict 存进 `sys.modules["__waves_register_state__"]`，而不是模块级变量。注释没展开原因，但结合主入口的幂等注释可以推断：gsuid_core 的进程池或热重载会让模块在新命名空间下重新 exec，模块级变量被清空，注册表就丢了——锚到 sys.modules 的全局槽位后，重 exec 也能找回来。同样的手法在 score.py:7-12 出现。一个项目里三处同样的补丁，说明这个坑踩了不止一次。

## 7.6 循环伤害模拟：rotation_damage.py

7.5 节的手写注册器覆盖全角色但维护成本高（新角色要等手写）。utils/rotation_damage.py（1586 行）是另一条路线：数据驱动。它从 wuthering.gg（第三方数据站）抓技能倍率，从命座描述文本里用正则抽 buff 规则，自动构建伤害模拟。两套引擎并行存在，评分编排优先走新引擎。

**倍率数据来源**。utils/sync_wutheringgg_skills.py 从 wuthering.gg 抓数据——这个站把数据库编译进 Nuxt 的哈希命名 chunk，脚本要动态发现 entry chunk → route chunk → loader chunk → data chunk 四层引用才能找到真数据（:41）。解码出 57 个角色的逐技能等级倍率数组和命座参数，写 `utils/map/wutheringgg_skill_data.json`，schema v2 带 sha256 校验，低于 57 个角色拒绝写入（防止上游改版导致脏数据落盘）。运行时哈希校验失败或出现数据里没有的新角色，触发在线刷新；网站数据不可用时退回本地 char.json 的技能树（倍率精度降级，source 标"本地角色资源"）。

**动作构建** `_build_actions`（:742）：遍历四个技能类别（常态攻击/共鸣技能/共鸣解放/回路，可扩展变奏），按当前技能等级从 values[] 取倍率表达式。过滤非伤害词条（SKIP_DAMAGE_KEYS：耐力、冷却、持续、消耗、回复、协奏、能量——"回复 5 点耐力"不是伤害）。倍率表达式解析（:651）把"24.50%"规范成 `P(24.50%)` 后 AST 解析成 multiplier（百分比部分）和 fixed（固定值部分，比如召唤物的固定伤害），裸数字只在固定伤害语境下允许——类型上禁止"两个倍率相乘"这种歧义表达式。动作标志（能否暴击、是否必暴、是否无视加成）从描述文本推断。产出 RotationAction 列表。

**命座规则抽取** `_chain_effects`（:977）：对每个已解锁命座的中文描述跑一组白名单正则——"全伤害加深X%"、"(元素)伤害加成提升X%"、"…暴击伤害提升X%"、"…伤害倍率提升X%"（倍率类直接加到 multiplier_delta）、"…最终伤害提升X%"。`{n}` 占位符用命座的 description_params 还原。含"持续/命中目标时/每层/队伍中的角色"这类前缀（STATEFUL_MARKERS）的规则标记 stateful，裸面板场景下拒绝生效、列入 unresolved_rules。设计哲学写在 docstring（:978-983）：只应用能确定指向当前动作的直接规则，其余留给场景适配器，宁可少算不可错算。每个动作的结果里带 unresolved 列表，诚实标注"这条命座我没能算进去"。

**场景系统**。裸面板算出来的伤害没有意义——不带队友 buff 的伤害和游戏里打出来的对不上。DamageScenario（:168）提供三种模式：self_panel（纯面板）、recommended（推荐队伍，来自 utils/map/damage_scenarios.json，没有就用深塔矩阵出场率数据里的队友兜底）、custom。`_apply_scenario_effects`（:1154）按场景开关状态（havoc_bane 等元素反应）并调用注册器 `char_cls().do_buff(attr, chain, reson_level, isGroup=True)` 给自己上队友 buff——新旧引擎在这里合流：场景 buff 仍然依赖手写注册器，倍率来自爬取数据。`_apply_equipment_effects` 只在含 equipment 的场景执行，武器 buff 与动作挂钩（cast 钩子按动作触发），只在模拟具体循环时才有意义。

**两个出口**：`calculate_skill_damage` 输出全部动作的暴击/期望伤害明细（面板上"技能伤害"列表的数据源）；`calculate_rotation_damage`（:1490）算"循环伤害"——用评分模板的 skill_weight（普攻/重击/技能/解放四类权重，归一化后）对每类动作的期望伤害加权求和，得到一个综合数字，面板上那行"循环伤害"就是它。权重来自评分 API 的模板（理论上反映该角色的实际输出占比），这就是"伤害"和"循环伤害"的区别：前者是单发上限，后者是按输出结构加权后的期望。

## 7.7 评分体系：两套公式与三个口径

"评分"在项目里其实是三个不同的东西，容易混：

1. **声骸单件评分**：一件声骸值多少分（0-25 分制）；
2. **声骸总分**：五件合计（0-250 或换算到 50 分制），出 c/b/a/s/ss/sss 评级；
3. **综合评分**：考虑角色定位权重的面板综合分（0-150/210 等口径），出 S+/S/S- 细化档位。

实现上每一样都有"HTTP 评分 API 优先、本地公式回退"的双通道（calculate.py:87、:228、:313；local_weight_score.py:559-578）。只对网络类错误回退（scoring_api.py 的 `is_api_unavailable`），API 业务异常直接抛——回退是为了容错，不是为了掩盖 bug。

**本地声骸评分**（calculate.py:181 `_local_calc_phantom_entry`）：每条词条的分数 = 权重 × 词条数值，归一到 50 分制（`floor(score/max_score×50×100)/100`）。权重来自评分模板：主词条按 cost 查 main_props 表（4 cost 位权重最高），副词条查 sub_props 表（暴击 2.0、暴伤 1.0、攻击% 1.1 这类）。词条名归一有个细节："X% 属性伤害加成"只有匹配当前角色属性才计入"属性伤害加成"，火属性角色身上的雷伤加成词条权重归零；四类技能词条（普攻/重击/技能/解放伤害加成）用 skill_weight 加权合并成"技能伤害加成"一项。

**评分模板的来源**（get_calc_map，calculate.py:87）：先 POST 评分 API `/calc/map`；失败退本地 `utils/map/character/<角色名>/calc.json`。本地还有一层条件选择：`find_first_matching_expression`（:33）读 condition-user.json 里的规则链（比如"暴击>70% 且 模态=声骸 → 用 calc2.json"），按当前面板的 ctx 变量（含模态 modal）挑变体模板，没有规则命中就用 calc.json，角色目录缺失回退 default/calc.json。默认模板的结构：main_props/sub_props 两张权重表、skill_weight 四类技能权重、score_max 三档归一分母、total_grade/props_grade 档位阈值、grade.valid_s/a/b 词条染色规则。

**本地综合评分**（local_weight_score.py）：权重表 `utils/local_weight_data.json`（96KB，39 个角色），文件头注释声明改自 erzaozi/waves-plugin 的 Weight 目录（经授权）。公式（:302）：副词条分 = 值/最大值 × 21 × weight；主词条分 = 值/最大值 × (44/30/18) × weight 加固定基底；分母用"该角色最优 5 副词条理论分加最优主词条分"做归一；每件封顶 25 分，五件 125 raw 换算到 150 分制（:485-486）。这个公式同时产出"最优配装"对照（43311 布局即 4-3-3-1-1 cost 分布加最优副词条）和提升方向分项，喂给面板的"提升建议"。

评级的档位阈值有两套口径。声骸总分的 total_grade 按 250 分制切档；综合评分用 `_PANEL_GRADE_THRESHOLDS`（score.py:152）：125=sss、115=ss、105=s、90=a、72=b。前端展示还有更细的 S+/S/S- 三分（CHANGELOG 2026-08-24 的评分说明图对齐了这套口径，tests 里有 test_echomatrix_score_explanation.py 守着说明文案与阈值的一致性——连文档都有回归测试，这在同类项目里少见）。词条染色走另一张表：副词条逐级数值表（calc_score_script.py 的 phantom_sub_value）判断"是否满词条"，满词条染熔山色，视觉上提示"这条没得洗了"。

**综合评分的注册机制**：utils/map/damage/register.py 把 `local_score_detail` 注册为所有可用角色的 ScoreDetailRegister 条目（title 是"综合评分-HTTP API"，讽刺的是实际多数时间跑本地回退），`local_rank_detail` 注册为 DamageRankRegister（期望伤害计算）。漂泊者男女形态共用权重，用 ID_ALIASES 显式别名（register.py:12-18）。

另有一套 `ScoreHyperParams`（score.py:59）：能量锚点、44111 与 43311 槽位布局、评分场景等超参数据结构，CHANGELOG 2026-08-24 记录了它的来历——"评分权重引擎重做（Tier0 双爆自洽点 → Tier1 中心差分 → Tier2 共效解阈值 → Tier3 换算 DSL）"，一套带方法论的重算流程。这套超参服务于"逐词条边际收益"式的精确评分，是评分 API 后端（不在本仓库）的逻辑在插件侧的镜像。

## 7.8 表达式求值器与角色状态

utils/expression_evaluator.py 的 ExpressionEvaluator 只干一件事：求值评分模板的条件表达式。规则链形如 `[{"op":"&&","sub":[{"key":"modal","op":"=","value":"frost"}]},{"choose":"calc2.json"}]`，支持与或非加六种比较，数值和百分比字符串自动转换。它是配置语言，不是计算语言——真正的数值计算在 damage.py 的 AST 求值器里，两者不要混。

utils/char_state.py 记录每角色的查看/刷新计数和时间戳，驱动两个机制：每刷 10 次单角色或 42 天强制核对一次库街区持有角色列表（防止用户删了角色插件还缓存着）；B/C 级面板生成"建议提升词条方向"提示。

## 7.9 名字解析链

用户输入的角色名千奇百怪（"今汐""今昔""jx""626"），解析链分三级（name_resolve.py:85 `resolve_char`）：

1. **精确别名**：utils/name_convert.py 读 `resource/map/alias/char_alias.json`（规范名到别名列表），合并用户自定义 custom_char_alias.json（别名模块可增删），按规范名长度排序保证长名优先匹配；
2. **模糊建议**：fuzzy_match.py 的 `fuzzy_suggest` 对规范名和别名打分，分数取三个维度最大值——字符级 ratio、整串拼音 ratio、拼音 token 多重集重合率（`_reorder_ratio`，处理"重云/云重"这种音节颠倒）。3 字符以上的拼音串有子串加分和 partial_ratio 近子串容错。pypinyin 和 rapidfuzz 是可选依赖，缺了静默降级到 difflib；
3. **自动确认**：top3 建议逐一验证能否转成合法 ID，命中即用，并标记 fuzzy_used=True——上层在图片前加一条提示"已按 XX 匹配"，用户知道自己打错了但结果还是对的。

有个安全设计值得记住：`CharResolution`（name_resolve.py:21）的失败文案**永不回显用户原串**。docstring 写明是防注入——游戏名可以包含特殊字符，拼进消息模板或 HTML 就是注入点。fuzzy 命中时也只回显已验证的规范名。

跨类型查询（wiki 的"X图鉴"）用 `fuzzy_suggest_multi` 并联搜角色/武器/声骸/合鸣四个空间。

## 7.10 漂泊者（主角）的特殊处理

鸣潮的主角"漂泊者"是全项目唯一需要专门数据结构的角色：一个角色名下有男女两个形态、多属性分支（衍射/湮灭/风/光/导电各系各算一个角色实例），库街区 API 把它们编成相邻的 charId（比如 1501/1502）。处理散在几处，值得集中记录：

- **存储折叠**：rover.json 以 canonical id 为 key 合并存储各形态（refresh_char_detail.py:301-315），合并式保存保证刷新女形态不会覆盖男形态的数据；
- **查询展开**：SPECIAL_CHAR 映射表（resource/constant.py:59，如 "1501": ["1501","1502"]）把用户查询映射到 canonical id，get_char_detail_for_id（char_info_utils.py:46）优先读 rover.json 的形态 map；
- **排行折叠**：SPECIAL_CHAR_RANK_MAP（constant.py:124）把男女形态折叠为同一 id 参与排行，避免同一角色占两个名额；randomize_special_char_id（:71）在展示层随机化性别，防止榜单上清一色某一形态；
- **别名全集**：ID_FULL_CHAR_NAME / SPECIAL_CHAR_NAME / NAME_ALIAS（constant.py:105-124）维护"衍射主角""湮灭主角"这类称呼到具体 id 的映射，用户输入"光主"也能命中；
- **注册器别名**：register.py:12-18 的 ID_ALIASES 让男女形态共用同一份权重表和伤害注册；
- **上传约束**：自定义面板图上传时主角必须带性别后缀（card_utils.py:79-104），否则无法确定入哪个目录。

一个角色牵动六处代码，这就是"加新角色"的隐藏成本样板——幸好只有漂泊者这样，后续新角色都走标准路径。

## 7.11 评分权重引擎的方法论

CHANGELOG 08-24 有一条技术含量很高的记录："评分权重引擎重做（xwaves-weight skill：Tier0 双爆自洽点 → Tier1 中心差分 → Tier2 共效解阈值 → Tier3 换算 DSL），重算清宵/景燃权重并发布到评分 API"。这条记录勾勒出一套权重标定的科学流程，插件侧对应的产物是 score.py 的 ScoreHyperParams 结构（能量锚点、43311/44111 槽位布局、apply_buffs、skill_weight_overrides、score_damage_func 评分场景）和 tests/test_suisui_weights.py。

按名字和上下文推断各层含义（CHANGELOG 没有展开细节，这里标注推断成分）：Tier0 先确定暴击与暴伤的自洽配比（双爆词条互为机会成本，需要先固定一个基准点）；Tier1 用中心差分算每个词条的边际收益（词条数值微调后综合伤害的变化率，即"这一条暴击值多少分"）；Tier2 处理共效类词条的阈值效应（攻击%堆到某程度后收益递减，需要解出阈值）；Tier3 把分析结果换算成权重 DSL 落盘。清宵/景燃是新角色，权重重算后发布到评分 API——这也解释了为什么评分体系是"API 优先"：权重标定是集中化的专业工作，客户端只消费结果。

对这套流程的评价：大多数同类项目的评分权重是拍脑袋定的常数，这里至少有一套可复现的标定方法加回归测试（test_suisui_weights 守着清宵的权重），方法论上高了一个档次。局限也明显：标定管线本身（xwaves-weight skill）不在本仓库，社区只能消费结果不能复现过程。

## 7.12 五个解析器的分工

项目里有五套各自独立的"文本转数值/意图"机制，初读容易混淆，列一张分工表：

| 解析器 | 文件 | 输入 | 输出 | 用途 |
|---|---|---|---|---|
| ExpressionEvaluator | utils/expression_evaluator.py | condition-user.json 的规则链（与或非加比较） | 命中的模板文件名 | 选择评分模板变体（"暴击>70% 用 calc2"） |
| calc_percent_expression | utils/damage/damage.py:402 | "12.5%*3+6%" 式表达式 | 数值 | 武器 buff 的叠层计算，AST 白名单四则 |
| 倍率表达式解析 | utils/rotation_damage.py:651 | "24.50%"、复合倍率串 | multiplier + fixed | 技能倍率结构化，禁止歧义运算 |
| text_parse | wutheringwaves_dps/text_parse.py | "EEE Q @1.2s x2" | 动作序列 | 排轴的文字转轴（规则版） |
| ai_parse | wutheringwaves_dps/ai_parse.py | 同上（规则识别不了时） | 意图四元组 | AI 兜底，禁止输出数值 |

共同的设计取向：所有面向"计算"的解析都走白名单 AST（不 eval、不 exec），所有面向"用户输入"的解析都限制输入长度（text_parse 的 _MAX_TOKENS=200 字符）并且永不回显原文。规则解析永远先于 AI——AI 只补规则的洞，且输出被类型约束在"意图"层面。五个解析器五种语法，维护成本不低，但各自的语法都是为其消费场景定制的最小集，没有为了统一而统一。

---

# 第八章 渲染管线

## 8.1 实际有四条渲染路径

项目对外的说法是"HTML 渲染 + PIL 降级"两套，实际是四代体系并存：

| 层 | 位置 | 技术 | 现状 |
|---|---|---|---|
| HTML V1 | templates/*.html | Jinja2 + Playwright | 老卡片，V2 失败时的兜底 |
| HTML V2 | templates/v2/ | Jinja2 + Playwright | V1 的换肤层，同名路径镜像映射 |
| EchoMatrix HTML | templates/echomatrix/ + utils/echomatrix_html/ | 手写 HTML/JS + JSON 注入 + Playwright + CDP 截图 | 角色面板/刷新面板/权重面板的高保真版 |
| EchoMatrix UI | utils/echomatrix_ui/ | 纯 PIL 模块化 block 组装 | 面板的 PIL 主渲染，也是 HTML 失败的最终兜底 |

四代并存不是重构失败，而是渐进换肤策略：render_utils.py 的 `render_html()`（:585-608）维护一张 `_V2_CARD_TEMPLATES` 集合（21 个模板名），命中就先渲染 v2/ 下的同名模板，失败回落 V1。新皮肤逐卡上线，旧皮肤兜底，数据层不动。

## 8.2 通用 HTML 渲染：自建 Chromium 池

render_utils.py 的 `_render_html_once`（:421-553）流程：Jinja2 取模板 → 判断外置渲染（配置了 RemoteRenderUrl 就 POST HTML 给外部服务拿图，60 秒超时，失败回本地）→ 本地 Playwright 截图。

本地 Playwright 不是调 gsuid_core 的 html_render，而是插件自己封的 Chromium 池，这部分工程细节很密：

- **启动参数**禁沙箱、禁 /dev/shm、禁代理（:59-67）。注释解释：代理故障会连带 HTML 渲染超时，回退 PIL——渲染不该被网络代理拖累；
- **浏览器池**：`_MAX_BROWSER_USES=1000` 次或空闲 3600 秒自动重启，控制内存泄漏；驱动（node 进程）挂死时重启驱动再试一次；
- **页面池**：asyncio.Queue 复用 page。注释给了实测数据：Chromium 的字体缓存跟 page 走，复用后 CJK 字体加载从 1.36 秒降到 0.08 秒。新 context 后台预热 7 个字体族；
- **字体等待**：`page.set_content(html, wait_until='domcontentloaded')` 而不是默认的 load——字体请求慢会卡死 load 事件，改为 domcontentloaded 后显式等 `document.fonts.status === 'loaded'`（5 秒上限）。CHANGELOG 2026-08-26 记录了这次优化（1.52 秒降到 0.11 秒）；
- **截图**：量 `.container` 元素尺寸，调整 viewport，`container.screenshot(type='jpeg', quality=90)`。

字体来源有个小路由：本地有 TEMP_PATH/fonts/fonts.css 时，插件往 core 的 FastAPI 挂 `/waves/fonts` 静态路由走本地字体；没有就用配置 FontCssUrl 的 loli.net CDN。

## 8.3 PIL 降级路径

每个 draw_xxx.py 开头都有同构的判断：

```python
use_html_render = WutheringWavesConfig.get_config("UseHtmlRender").data
if not PLAYWRIGHT_AVAILABLE or not use_html_render:
    return await draw_abyss_img_pil(ev, uid, user_id)
```

HTML try 块里任何异常或返回 None，也落回 _pil 版。所以 PIL 版是功能等价的完整实现，不是缩略图——draw_char_card.py 的 PIL 主体有 2896 行。PIL 渲染的最终出口统一走 gsuid_core 的 `convert_img` 把 PIL Image 转成可发送 bytes。

例外：练度统计（charlist）只有 PIL 版，纯 ImageDraw 手绘进度条和角色行——那张图结构规整，PIL 画反而简单。

PIL 渲染的公共素材在 utils/texture2d/（29 个文件：bg1..bg13 随机背景池、avatar_mask 圆形头像遮罩、footer 水印、属性图标），各功能模块还有自己的 texture2d/ 目录。公共绘制函数集中在 utils/imagetool.py（顶部信息条、圆环头像、按星级选武器图标底）和 utils/image.py（1081 行的大杂烩：背景选取、文字描边、圆角矩形）。

字体栈（utils/fonts/waves_fonts.py）处理得很细：主字体 waves_fonts.ttf，fallback 链 arial-unicode → NotoColorEmoji → 思源黑体。用 fontTools 建每个字体的 cmap 字符集合，逐字符检查缺字再 fallback，`draw_text_with_fallback` 处理 emoji 混排——不做这个，名字里带 emoji 的用户渲染出来就是方框。

## 8.4 EchoMatrix HTML 渲染器

utils/echomatrix_html/render.py 是角色面板专属的渲染器，和通用链路有四个关键差异：

**模板机制不同**。不是 Jinja2，是占位符替换：`__DATA_PLACEHOLDER__` 换成 `json.dumps(data)`，`__FONT_FACE_PLACEHOLDER__` 换成 @font-face CSS（:100-108）。HTML/JS 是"前端产物"，Python 只管喂数据。adapter.py 的铁律写在文件头："不改 HTML/CSS/JS，只产出 JS 期望的 dict；伤害绝对值没真实来源一律留空，绝不编造数值。"

**页面级断网**。小字体 base64 内联，MiSans/思源黑体走 `ecm.local` 假域名加 `page.route()` 拦截：命中字体路由就从磁盘 fulfill，其余请求全部 abort（:111-130）。渲染期间页面发不出任何真实网络请求，字体加载既快又不受环境影响。

**就绪握手加空壳保险**。等 `window.__READY__ === true`（模板 JS 自己等字体加载完才置位，8 秒超时），然后按模板登记的数据节点选择器（`_CONTENT_SELECTORS`：char_panel 找 `.arow/.ec`，refresh_panel 找 `.cc`，weight_panel 找 `.wrow`）做探针，全空或高度不足 300px 判空壳，抛错回退 PIL（:216-243）。注释记录了事故：曾把 char_panel 的类名误用到 refresh_panel，探针永远空，那张卡永远回退 PIL，图能出但样式降级，不细看发现不了。宁可回退出"略有偏差的图"，不发空图，这是整条渲染链的底线设计。

**CDP 高清截图**。不走 Playwright 的 element.screenshot，改用 CDP `Page.captureScreenshot` 加 clip scale 1.5（:245-268），三个模板统一一条高清路径。

## 8.5 EchoMatrix UI：PIL 的模块化重写

wutheringwaves_charinfo/draw_char_card.py 的 PIL 主体（近 2900 行单文件）随着功能叠加越来越难改，于是有了 utils/echomatrix_ui/ 的重构：adapter 把 RoleDetailData 转成冻结的数据契约 `schema.CardData`，render_card 用"轨道流式布局"——左/中/右三条 `_TrackFlow`（render_card.py:23-35），blocks/ 下 11 个 PIL 模块（top_bar、left_illustration、mid_weapon、right_echo_card 等）动态 import 后逐个贴到轨道上，缺 block 优雅跳过（`_try_block`）。

配色抽成了设计 token 常量（draw_char_card.py:143-159，BG_MAIN_V2=(11,13,18)、ACCENT_CYAN=#00E5FF），PIL 版和 HTML 版共用同一组色值保证视觉对齐。这个"设计 token"概念从 Web 前端搬进 PIL 渲染，配合 V2 模板层，让两套实现的观感趋同。

## 8.6 资源管理与缓存体系

**资源路径单一来源**（utils/resource/RESOURCE_PATH.py）：MAIN_PATH 下分 resource/（avatar、weapon、role_pile、role_bg、phantom、material、share、map/detail_json）、guide_new/（9 个攻略组目录）、players/（用户 JSON）、backup/、other/（calendar/bake/wiki）。全量下载（download_all_resource.py）对三个镜像并发测速选最快源，再走 gsuid_core 的 download_all_file；按需懒下载（download_file.py）提供 get_skill_img/get_phantom_img 等，缺失时回退内置默认图，异常时返回 100x100 透明占位防崩溃。

**图片烘焙缓存**（render_utils.py:688-750）：`get_image_b64_with_cache` 把"下载 → webp 转换 → 可选 cover 裁切"的结果按参数 hash 落盘到 other/bake/，命中直接读文件跳过 PIL。面板图里有几十张外部素材图，每次渲染都转码一遍太浪费，烘焙缓存把转换成本变成一次性的。

**三套缓存体系**并存且边界清晰：

1. 自定义图 hash 索引（card_hash_index.py）：sha256(文件名)[:8]，启动全量扫描建双索引，miss 时限频自愈重建（2 秒 TTL 加 1024 上限，防悬空 hash 风暴），上传/删除处同步维护；
2. TimedCache（utils/cache.py，656 行）：OrderedDict + TTL 的内存 LRU，可升级为 SQLite WAL 落盘（磁盘为权威源），提供 `transition()`（BEGIN IMMEDIATE 写事务 CAS，"恰好一个调用者成功"）和 `replace_where_if_key_absent` 等原语——排轴子系统的兑换码和会话管理全靠这几个原语；
3. API 层缓存：进程内公告字典、`@timed_async_cache` 装饰器、CacheEverything 磁盘降级、图片 webp 转换缓存。

每日 3:00 cron 清理缓存目录（保留 CacheDaysToKeep 天），启动时清一次。

## 8.7 模板数据结构

模板变量以"base64 data URI 内联资源 + 纯数据"为主：`image_to_base64()`、`get_logo_b64()`（库街区 logo）、`get_footer_b64()`（黑/白水印图）。图片全部内联，模板渲染出来是自包含 HTML——外置渲染服务拿到 HTML 后不需要再访问原服务器。字体是例外，通过 `font_css_url` 变量注入 `<link>`，因为字体文件大，内联会让 HTML 膨胀到几 MB。

自定义模板支持：custom_waves_template 环境指向用户数据目录 `XutheringWavesUID/show/`，部署者可以放自己的模板覆盖内置的（登录页四套模板都走这个机制）。

## 8.8 模板清单

35 个 HTML 模板的分布：abyss/ 下 5 个（深塔、冥海、矩阵、挑战各版式），wiki/ 下 6 个（角色、武器、声骸、列表、塔、物品），roleinfo/ 下 3 个（名片、皮肤、月报），echomatrix/ 下 3 个（char_panel、refresh_panel、weight_panel），v2/ 下 4 个加一张 21 个模板名的 V2 映射表（render_utils.py:559-582 的 _V2_CARD_TEMPLATES：abyss/alias/ann/bbs/explore/roleinfo/sign/stamina/wiki 等命中即走 v2 皮肤），根目录散着 stamina_card、ann_card、explore_card、bbs_coin、alias_card、alias_all、dps_report、scoring_help、sign_calendar，外加登录体系四页（index、index_email、index_token、index_cloud）和 404。

有两类模板不走 Jinja2：echomatrix 三件套走占位符注入（8.4 节），page.html（抽卡网页版，1418 行）是独立 SPA 由 web_view 直接输出。模板总量 1.9 万行 HTML，其中 page.html 和 echomatrix 三件套占了近一半——前端化程度最高的部分恰恰是体验最重要的两个面：抽卡复盘和角色面板。

V2 映射表值得多说一句：它是"换肤不换数据"的实现载体。render_html 收到模板名先查这张表，命中就改渲染 v2/ 同名路径，渲染失败打 warning 回落 V1。21 个名字逐个上线，任何一张卡出问题只影响自己——渐进化换肤的正确姿势，代价是两套模板要同时维护到迁移完成。

## 8.9 渲染性能预算

把散在各处的实测数字收拢成一张预算表，可以看出作者对渲染链路的性能心中有账：

| 环节 | 耗时/预算 | 优化手段 |
|---|---|---|
| CJK 字体加载（冷） | 1.36 秒 → 复用 page 后 0.08 秒 | 页面池复用字体缓存，新 context 预热 7 个字体族 |
| 页面加载策略 | domcontentloaded + 字体等待 5 秒上限 | 避开字体请求卡死 load 事件 |
| EchoMatrix 就绪握手 | 8 秒超时 | 模板 JS 自置 window.__READY__ |
| 空壳探针 | 高度 <300px 判失败 | 宁回退 PIL 不发空图 |
| CDP 截图 | clip scale 1.5 | 三模板统一高清路径 |
| 通用截图 | JPEG quality 90 | 尺寸与体积折中 |
| 浏览器生命周期 | 1000 次或 1 小时空闲重启 | 控制内存泄漏 |
| 外置渲染 | 60 秒超时 | 失败回本地 |
| 图片素材 | 烘焙缓存 other/bake/ | 下载+转 webp+裁切只做一次 |
| 内存归还 | malloc_trim 每 10 分钟 | glibc 调参配合 |

热态下一张普通卡片的 HTML 渲染可以压进 300-500 毫秒（页面池命中加字体缓存命中），PIL 版在低配机上通常 1-2 秒但内存占用低一个数量级。渲染层没有缓存成品图——每张卡片都随数据实时变化（评分、体力倒计时），缓存成品收益低风险高，所以优化火力全集中在字体、页面复用和素材烘焙这三样"可复用但不变化"的成本上。这个取舍判断得准。

## 8.10 PIL 工具库盘点

PIL 路线的支撑代码集中在三个文件加一批素材目录，二次改图前先认识它们：

**utils/image.py（1081 行）**：跨模块的大杂烩——背景选取（get_waves_bg 从 bg1..bg13 随机池取图、get_random_share_bg 从 share 目录）、文字绘制（描边、阴影、渐变字）、圆角矩形、图片圆角裁切、按品质色染色。它是"函数库"不是"框架"，每个函数独立可用。

**utils/imagetool.py**：稍高层的公共件——draw_base_info_img 画顶部账号信息条（头像、UID、等级，各卡片顶部长得一样就是它画的）、draw_pic_with_ring 画圆环头像（avatar_mask/ring 遮罩）、按武器星级选 weapon_icon_bg_{star}.png 底图。卡片之间视觉一致的功臣。

**utils/fonts/waves_fonts.py**：字体栈管理。主字体 waves_fonts.ttf，fallback 链 arial-unicode → NotoColorEmoji → 思源黑体；用 fontTools 读每个字体的 cmap 建字符集合，绘制时逐字符检查缺字并切换字体（draw_text_with_fallback 处理 emoji 混排）；导出 waves_font_12 到 waves_font_50 的系列字号加 MiSans/Iosevka/YouShe 等风格字体。中文渲染最常见的"豆腐块"问题在这里被系统性解决。

**素材目录**：utils/texture2d/ 29 个文件是全局共享（随机背景池 bg.jpg 加 bg1..bg13、头像遮罩、黑/白双色的 footer 水印、attribute/ 属性图标）；各功能模块自有 texture2d/（TEXT_PATH = Path(__file__).parent/"texture2d" 是每个 draw 文件的标准开头）。素材走本地优先，缺图回退占位，从不因为一张图缺失而崩整卡。

写 PIL 渲染的实践建议：先看 imagetool 有没有现成的（信息条和圆环头像几乎每张卡都要），再用 image.py 的原子函数拼，最后才考虑手绘——这个顺序能保证新卡片和旧卡片观感一致。

---

# 第九章 功能模块逐一剖析

前面讲了横切的基础设施，这章按模块过一遍业务面。每个模块说清三件事：触发命令、数据来源、实现要点。

## 9.1 charinfo：角色面板（核心模块）

命令族最庞大：`ww刷新面板/wwmb`（全量刷新）、`ww角色面板 查询 X`、`wwX面板/伤害N/pk/换声骸`（正则解析，带 typo 纠正路由——用户打错的命令在 :651 有一张纠正表）、`wwX权重/qz`、`wwX优化/提升`，外加面板图上传/查看/删除/查重（上传可配置转交主人审核，图片先过尺寸校验再用 cv2 ORB 特征查重，主人有一个带 HTTP Basic Auth 的网页编辑器 `/waves/panel-edit/`）。

数据流是全项目最长的一条：base_info_cache 取账号缓存 → char_info_utils 读 rawData.json 或触发刷新 → WuWaCalc 聚合 → 评分（API 优先本地回退）→ 伤害计算（DamageRankRegister 注册的函数，即 7.6 节的循环伤害引擎）→ 渲染（EchoMatrix HTML → PIL）→ 发送。附带的交互还有 PK 拼图（两个角色的面板图拼接对比）、换装预览（role_info_change.py 支持文本指令改面板：换武器、改词条、设敌人抗性等级）。

渲染链的分流逻辑在 8.4 节讲过：这个模块无条件先试 EchoMatrix HTML（不检查 UseHtmlRender 开关），失败才走 PIL。B/C 级面板还会附带"提升建议"文本条（char_state 驱动）。

## 9.2 stamina：体力

命令 `ww每日/mr/实时便笺/体力`。数据是 `get_daily_info`（结晶波片数量、恢复倒计时）加 `get_base_info`（账号等级等）。国际服 UID 分流到 launcher 链（fetch_launcher_panel）。渲染 HTML stamina_card.html 或 PIL 版，用户可以设置自定义背景（stamina_bg_value，支持立绘/背景/随机三种语义，角色名做别名归一化）。

这个模块还是国际服面板的唯一消费方，以及体力推送的数据源：每次查询把体力值 upsert 进 WavesStaminaRecord（draw_waves_stamina.py:134、:188），CK 失效时 update_ck_valid(False)。推送本体（邮件通知体力满）在外部伴随插件 roverreminder 里，本插件只管把数据记好。

## 9.3 abyss：深塔与三大挑战

逆境深塔（abyss）、冥歌海墟（slash）、全息矩阵（matrix）、超载 domains（challenge）四个玩法各有一组 draw_xxx_card.py / draw_xxx_pil.py。数据来自库街区的 battle 类接口，渲染出期数、层数、每层队伍、评分。period.py 处理期数换算（深塔每期 42 天左右，从固定锚点日期推算当前期数）。

画完卡片会把队伍快照 push 进 QUEUE_ABYSS_RECORD 等队列，异步上传排行服务（出场率统计的数据来源）。

## 9.4 gachalog：抽卡记录

命令族：`ww抽卡记录/gacha`（统计图）、`ww导入抽卡链接 <url>`（从云鸣潮分享链接解析 record_id）、`ww导入工坊抽卡记录`（mcgf 格式合并）、`ww导入小黑盒抽卡记录`、`ww刷新/更新抽卡记录`（增量拉取）、群内 `ww抽卡排行`（按群阈值过滤）、`ww导出/删除`、`ww抽卡页面`（生成 10 分钟有效的网页版链接）。

关键约束：官方抽卡接口只保留 180 天流水，所以插件必须增量拉取并本地持久化（players/<uid>/gacha_logs.json，gzip 白名单内）。merge_utils.py 处理多来源合并（官方拉取、工坊导入、小盒导入的去重排序）。导入按 uid 加锁（_gacha_import_lock_key），防止同一用户并发导入产生重复记录。卡池信息（角色 UP 池、武器池、常驻池）本地维护在 model.py/pool.py。

统计图是 PIL 渲染：总抽数、出金数、垫抽数、各池分布、最近记录列表。抽卡排行卡按群配置的最小抽数阈值（gacha_config.json）过滤参与人。

## 9.5 ann：公告推送

这是项目里唯一完整的推送闭环，五步：

1. **订阅**：`ww订阅公告`（pm=3，仅群聊，总开关 WavesAnnOpen）→ 先校正 WavesSubscribe → `gs_subscribe.add_subscribe("session", task_name="订阅鸣潮公告", event=ev)`。订阅数据存 core 的 Subscribe 表，插件只调 core 的订阅 API；
2. **轮询**：`@scheduler.scheduled_job("interval", minutes=AnnMinuteCheck)`，带 `_ann_poll_lock` 和推送任务集合双保险防重入；
3. **差集**：拉最新公告 ID 列表，与本地 ann_config.json 的已见 ID 求差集。首次拉取只建基线不推送（否则新订阅者会被历史公告轰炸）；
4. **渲染**：后台 task 逐条渲染公告卡片。渲染返回字符串（过期/未找到）视为永久失败跳过，异常视为临时失败进 retry_ids 下轮重试；
5. **发送**：活跃过滤（42 天内活跃的群/用户才推）→ `asyncio.Semaphore(1)` 串行 → 每条订阅前 sleep(3) 防风控 → 置 ANN_PUSH_GUARD 防活跃度自污染。

`ww公告` 命令查询单条公告（支持 `公告#1456` 短码），数据来自 get_ann_list/get_ann_detail/get_bbs_list。

## 9.6 calendar：活动日历

`ww个人日历/rl`。数据源有两路：官方 wiki 首页的活动/卡池 JSON（get_wiki_home，解析出活动起止时间、卡池内容），加上攻略组的日历图（get_latest_calendar_image 直接下载图片）。PIL 合成一张带当前时间轴的日历卡。没有订阅推送功能——日历提醒在帮助文案里不存在，只有查询。

## 9.7 wiki：图鉴

命令 `ww<名字>图鉴/共鸣链/技能/机制/介绍/专武`、`wwdps榜`、`wwX套装备`、`ww深塔信息N/st`、`ww海墟/冥海信息`、`ww矩阵信息`（期数支持"上期/下期/数字"）。数据全部来自本地 map/detail_json（启动时整包下载的角色/武器/声骸/怪物/挑战详情 JSON），带 WIKI_CACHE_PATH 渲染缓存。渲染 HTML wiki/*.html 加 PIL 版。攻略查询接 guide_new/ 下 9 个攻略组的图片资源，群可以配置排除某些攻略组（guide_config.json）。

## 9.8 query：持有率与出场率

`ww角色持有率/占有率`、`ww深塔使用率/出场率`（可分左右中区域）、`ww冥海出场率`、`ww矩阵出场率`。数据两路：全局持有率爬 wuwatracker.com——这不是 API，是解析 Next.js 的 RSC payload（wuwatracker_ownership.py:15-19），24 小时缓存；出场率来自排行服务的统计接口。渲染 v2/query/char_hold_rate.html（render_v2 的唯一调用方）加 PIL 版。CHANGELOG 记录这张卡从 10 秒 GIF 演进到静态 HTML 加直方图，手机端 800px 重排。

## 9.9 rank：排行

命令族按榜单分：群内 `ww<角色>排行/评分排行`、`ww<角色>声骸排行`、跨群 `ww<角色>总排行`、`ww练度总排行`（全角色 total_phantom_score 求和）、`ww声骸总排行`、`ww练度排行`。数据是本群聚合加排行服务查询（draw_total_rank_card.py:59-62 等直接 httpx POST）。伤害类排行需要 WavesToken（上传配额的凭据），权限判断在 _permissions.py：RankUseToken/WavesRankUseTokenGroup/NoLimitGroup 三层配置叠加。参与排行可配置活跃过滤（RankActiveFilterGroup）。

## 9.10 其余模块速览

- **alias**：`ww添加/删除 X别名`、`wwX别名`、`ww别名列表`。写 custom_alias JSON（热加载），渲染别名卡；
- **code**：`wwcode/兑换码`。抓 4399 的 JSONP 文件（newsimg.5054399.com/.../data_102.js）解析兑换码和过期时间——官方兑换码 API 不存在，第三方聚合页是最稳定来源；
- **explore**：`wwts/探索`，探索度百分比地图卡，HTML/PIL 双版；
- **up**：`ww卡池倒计时/未复刻角色统计`，数据来自排行服务的卡池列表加本地 pool.py 的复刻历史；
- **update**：`ww更新记录/log`、`ww更新/强制更新/同步上游`、`ww滚蛋+N`（回滚）。git 自更新：从 upstream 拉取合并推送到 origin，更新日志渲染 v2/update_log.html；
- **help**：`ww帮助`，由 gsuid_core 的 help 元数据生成，help.json 声明全部命令；
- **bbs**：`ww库洛币`，库街区签到与库洛币余额（月卡状态）；
- **roleinfo**：`ww身份/皮肤/月报`，名片、时装、月度报告；
- **more**：`wwpoker/牌局`，声骸牌局激斗活动进度卡；
- **period**：当期深塔/海墟/矩阵信息汇总；
- **status**：向 core 状态页上报三个指标（绑定 UID 数、登录账号数、活跃账号数）；
- **start/resource**：启动时全量下载资源（每日定时 + 启动触发），资源下载后 reload 各模块并触发 AI 知识库重注册；
- **develop**：开发调试命令（渲染单模板、测试消息）；
- **scoring_help**：`ww计算帮助`，评分说明图，缓存到 CACHE_PATH/scoring_help.png 只渲染一次，删文件强制重渲。

速览表里的条目再挑几个有内容的展开。

**charlist（练度统计）**：`ww练度/ld` 输出全角色列表图——每个角色的等级、命座、声骸评分和进度条。它是唯一只有 PIL 实现的展示模块（没有 HTML 版）：结构规整的表格型图，ImageDraw 手绘进度条（_render_bar，:222）反而比模板快，离屏合成（_compose_char_list，:340）先算画布高度再画，不浪费内存。

**update（自更新）**：每天 4:20 从 upstream 拉取合并推到 origin（QyUpdate* 配置组），`ww更新记录/log` 渲染 v2/update_log.html。回滚命令 `ww滚蛋+序号` 是 CHANGELOG 08-02 记录的安全设计：先备份当前 ref，校验目标提交是当前提交的祖先（防止滚到不存在的分叉），再执行 reset。自动更新失败不影响运行中的插件，下次重启生效。

**master（联系主人）**：`ww联系主人` 用 core 的订阅 API 建立私聊通道（12.1 节的转发目的地），外加一个 `ww压缩数据` 命令——对存量用户 JSON 批量转 gzip（compress_existing_sync 跑线程池），报告前后体积和压缩率，是 player_store 白名单压缩上线后的存量迁移工具。

**status（状态上报）**：向 gsuid_core 的状态页注册三个指标：绑定 UID 数（WavesBind 中 uid 非空且非战双）、登录账号数、活跃账号数（ActiveUserDays 窗口内）。部署者在 core 状态页一眼看到插件的健康度。

**develop（开发工具）**：渲染单模板、测试消息发送等调试命令，pm 限主人，平时用不上，改模板时省大劲。

**bbs / roleinfo / more / period / echo**：库洛币（签到与月卡余额）、名片/时装/月报（roleinfo 三卡）、声骸牌局激斗活动进度（more 的 draw_poker，拉 get_more_activity 后 PIL 合成徽章进度卡）、当期三玩法信息汇总（period，给"这期深塔有什么"一个快速入口）、声骸列表图（echo，数据坞全声骸的等级一览）。

**calendar（活动日历）**：`ww日历/rl` 的数据是两路合成的——官方 wiki 首页 JSON（get_wiki_home，解析活动与卡池的起止时间戳）提供结构化条目，攻略组日历图（get_latest_calendar_image）提供"老玩家风格"的活动汇总图。PIL 在自绘时间轴上排布官方条目，攻略图作为补充部分拼接。双数据源互为冗余：官方 JSON 缺活动时攻略图顶上。

**sign（签到日历）**：`ww签到日历/qdjl` 查询库街区签到记录（get_sign_in_init + get_sign_in_surface + get_base_info 三个接口组合），渲染月历式签到图。注意它只是"查"——自动签到功能在帮助里挂的 roversign 是外部伴随插件，主插件不代签。

**explore（探索度）**：`wwts/探索` 拉 get_explore_data 加 base_info，渲染各地区探索百分比的地图卡，HTML/PIL 双版。

**query 的两个版本**：持有率命令注册了群内和群外两个处理器——群内版本带群成员对比（谁的持有率高于群均值），私聊版本只有全局数据。同一个数据源两种切片，命令注册层的小技巧。

## 9.11 定时任务总表

| 任务 | 位置 | 触发 |
|---|---|---|
| 公告轮询与推送 | wutheringwaves_ann/__init__.py:303 | interval（AnnMinuteCheck 分钟） |
| 缓存清理 | ann/__init__.py:483 | cron 3:00 + 启动时 |
| 无效 CK 清理 | wutheringwaves_user/__init__.py:259 | cron 23:30 |
| 插件自更新 | wutheringwaves_update/__init__.py:85 | cron 4:20 |
| 资源全量下载 | wutheringwaves_resource/__init__.py:71 | cron（ResourceDownloadTime + 随机 0-3600 秒抖动） |
| AI 知识重注册 | wutheringwaves_ai_rag/__init__.py:818 | cron 4:01 |
| malloc_trim | utils/malloc_tuning.py:52 | interval 10 分钟 |
| 活跃度缓冲落库 | 主 __init__.py:68 | 自建 asyncio 循环 60 秒 |

资源下载带随机抖动（0-3600 秒），这个细节和请求层的退避抖动一脉相承：所有定时任务都怕整点齐射。

## 9.12 消息发送辅助

- button.py（8 行）：WavesButton 子类自动带插件前缀，配合 `bot.send_option(img, buttons)` 生成可点按的快捷回复按钮（QQ 的 JSON 按钮消息）；
- at_help.py：`ruser_id(ev)` 实现"at 别人查别人的面板"（AtCheck 配置开启时返回被 at 者），safe_sender_avatar 防 at 查询覆盖被查者头像。这个工具在排轴模块被禁用（见 10.3 节的 P0 攻击链）；
- waves_send_msg.py：`send_board_cast_msg` 全服广播器，按订阅匹配实例，逐条 target_send，每条间隔 0.5 + rand(1,3) 秒防风控。

## 9.13 模块实现的共同套路

33 个模块的 `__init__.py` 命令处理器虽然业务各异，但骨架高度一致，抽出来是这样的：

1. **解析**：从 Event 提取命令参数。查角色的模块统一走 `ruser_id(ev)`（at 他人则查他人，见 8.3 节例外），用 at_help 的 `safe_sender_avatar` 拿头像时还要防止被查者头像覆盖；
2. **取凭据**：`waves_api.get_ck_result(uid, user_id, bot_id)`——自己的 CK、公共池、伪造 JWT 三级策略链（3.4 节）；
3. **查数据**：调 waves_api 对应方法。带冷却的（RefreshInterval 控制面板刷新频率）、带单飞锁的（重渲染去重）、带磁盘降级缓存的（CacheEverything）在这层各自挂钩；
4. **渲染**：按 UseHtmlRender 分流 HTML/PIL，或按模块的特殊逻辑（charinfo 无条件先 HTML）；
5. **发送**：`bot.send_option(img, buttons)`——图加可点按按钮是标配（体力图下挂"刷新面板/深塔/冥海"三个按钮，引导用户下一步）；
6. **善后**：错误码经 error_reply 转用户文案；排行榜类模块把快照 push 进上传队列。

错误处理有一条不成文的约定：用户可见的错误分两类——"你需要做什么"（未登录、未绑定、CDK 过期，error_reply 的 102/103 码）和"出了什么问题"（上游失败、渲染失败），前者给操作指引，后者给简化原因加日志细节。异常栈永远进日志不进群聊。

并发控制按模块定制：抽卡导入按 uid 加锁、公告轮询全局锁加任务集合、面板图查重按 hash 加锁、排轴会话按作用域加白名单。没有统一的并发框架，每个模块用自己的粒度——粗看是散乱，细看是各场景的锁语义确实不同（导入要串行、轮询要跳过、查重要等待）。

国际化、时区（game_time 统一 UTC+8）、UID 脱敏（列表图上 uid 显示中间打码，HideUid 配置全隐）这类横切关注点都在发送前最后处理。

## 9.14 角色面板命令族细看

charinfo 的命令面值得单独展开，它是用户接触最多的入口，命令解析的复杂度也最高。

**命令解析**：`ww莫特斐面板2` 这类输入由 on_regex 的捕获组拆出角色名和伤害条目编号，`parse_text_and_number` 处理"伤害3"这种指定位。角色名交给 7.9 节的解析链（精确别名 → 模糊建议 → 自动确认）。打错命令有纠正路由（__init__.py:651）：一张 typo 映射表把常见错拼路由到正确处理器，用户无感。

**PK 对比**：`wwA面板 pk B` 走 _concat_pk_images（:54），两张面板图横向拼接加中线分隔——纯图片操作，没有重新计算，对比的维度靠用户自己看图。

**文本改面板**（role_info_change.py:604 的 change_role_detail）：`ww换武器 X`、`ww改词条`、`ww设敌人 95级 抗性30%` 这类指令在内存里改 RoleDetailData 再走完整计算管线。敌人参数解析进 EnemyDetailData（:748-750），抗性等级直接进 7.4 节公式的抗性乘区。这是"理论伤害计算器"的交互形态：不改账号数据，只改计算输入。

**权重面板**：`wwX权重` 输出该角色的词条权重说明图（_draw_weight_html_v2，:1408-1475 走 weight_panel.html，失败回 PIL 的 draw_char_score_img），展示的是评分模板的 main_props/sub_props 权重表加 skill_weight——用户能看懂"为什么我的暴击权重 2.0 而攻击只有 1.1"。

**优化建议**：`wwX优化` 输出提升方向。数据来自综合评分公式的副产品：最优配装对照（local_weight_score 的 _optimal_loadout/_optimal_totals，43311 布局加最优副词条组合）和分项差距（_partials）。B/C 级面板在查询时还会附带 char_state 生成的简版建议条（_append_advice），不动图只加一条文本。

**面板图偏好**：用户上传的立绘按 hash 绑定到角色（panel_card_pref 的 pin），查询时 card_hash_index O(1) 找到图。上传审核流（ORB 查重、转主人审核、网页编辑器）在第十六章展开。

## 9.15 消息发送的四种形态

发送侧的形态比"发一张图"丰富，四种各有适用场景：

**纯图**：`bot.send(img)`，最普通的出口。**图加按钮**：`bot.send_option(img, [WavesButton(...)])`——QQ 的 JSON 按钮消息，点按等价于替用户发出对应命令（core 层处理回调），本项目的按钮引导链设计得比较系统：体力图挂"刷新面板/深塔/冥海"，面板图挂"权重/优化/排行"，用户旅程被按钮串起来。

**转发消息**：配置 WavesLoginForward 后，登录链接等敏感内容用合并转发包裹——降低 QQ 对裸链接的拦截概率，也让群聊里 less 醒目。登录链接还有一招：经腾讯文档的 scenario/link.html 转短链（login.py:116-117），QQ 对腾讯域名的链接宽容得多。

**全服广播**：waves_send_msg.py 的 send_board_cast_msg，按订阅逐个 target_send，每条间隔 0.5 + rand(1,3) 秒——随机化让批量发送的流量特征不像机器。广播场景（公告推送用 Semaphore(1) 加 3 秒间隔是另一条更保守的实现）两套限速并存，历史原因，但都有效。

发送还有一个横切细节：所有出图的命令都支持"at 别人查别人"（AtCheck），但写操作类命令（排轴编辑、token 管理）一律只认发送者——9.13 节的共同套路加 10.3 节的 P0 案例共同划出了这条线：读可以代理，写必须本人。

---

# 第十章 DPS 排轴子系统

wutheringwaves_dps 是一个内嵌的 Web 应用：FastAPI 路由挂到 gsuid_core 的 web_app 上（routes.py:8-10），端口复用 core 的（默认 8765）。它解决的问题是：鸣潮的输出循环（一套连招的时间轴）对 DPS 影响巨大，同一面板不同手法伤害差几倍。用户在网页编辑器里拖拽动作、设定命中时间，插件按自己面板的数据算出整条轴的期望伤害，输出报告图。

## 10.1 群聊入口与网页交互的接缝

群聊命令族（__init__.py，SV("waves时间轴DPS")）：`ww排轴` 出快捷选择卡、`ww排轴选 <sid> <序号>` 统一按钮入口、`ww排轴 <角色>` 直达单人编辑、`ww排轴队<A><B><C>` 三人队伍编辑、`ww排轴查<角色>` 只读报告、`ww排轴解析 <文本>` 文字转轴、`ww排轴确认 <码>` 身份认证。

网页和群聊的接缝是 deliver.py 的 `deliver_editor`（:56-128）：私聊直接发带 token 的编辑器链接；群聊**绝不发 token 链接**，改发无凭据页面链接加 6 位兑换码加确认指引。公网链接强制 HTTPS（`_transport_is_safe`），外置 URL 未启用 HTTPS 直接拒发。这个区别是安全模型的基石：群消息可能被任何人看到，token 不能进群。

## 10.2 路由表与鉴权

routes.py 挂了 19 个路由，核心的几个：GET `/waves/dps/{token}`（编辑器页）、GET `/waves/dps/api/session`（拉会话）、PUT `/waves/dps/api/timeline`（CAS 保存，冲突 409）、POST `/waves/dps/api/calculate`（重算）、POST `/waves/dps/api/import-afyg`（第三方轴导入）、GET `/waves/dps/api/report`（报告 JPEG）、POST `/waves/dps/api/redeem`（兑换码消费）加 GET `/waves/dps/api/redeem/status`（轮询领取）。

编辑会话鉴权（auth.py）：Bearer token 放 `x-waves-dps-token` 头，TTL 30 分钟，存 SQLite 持久化 TimedCache（多 worker 一致）。`create_session` 用 `replace_where_if_key_absent` 在 SQLite 写事务里抢占 key——绝不用 INSERT OR REPLACE，防止覆盖别人的会话。token 里带 character_ids 白名单，`validate_character_scope` 越界 403；`_require_single/_require_team` 保证单人令牌和团队令牌不互串。

兑换码流程（auth.py:142-653）是个精巧的双通道确认：

1. 群里发页面链接 + 6 位兑换码（字母表去掉 0/O/1/I 防混淆）；
2. 用户在网页 POST /api/redeem 消费兑换码，服务端把状态从 pending 推到 awaiting_confirm（TimedCache.transition 的 CAS 原语），签发确认码 challenge，并给这个浏览器种 HttpOnly Cookie（cookie 名含会话 hash）；
3. 发起者回到群里发 `ww排轴确认 <challenge>`，confirm_redeem 校验 user_id + bot_id 双匹配（跨平台同号必须比对 bot_id，历史记录缺 bot_id 一律 fail-closed）；
4. 浏览器凭 Cookie 轮询 /api/redeem/status，claim 时状态 approved → claimed 原子推进，可幂等重取同一 token。

攻击者复制了兑换码但没有发起者的群账号，过不了第 3 步；复制了确认码但没有那个浏览器的 Cookie，过不了第 4 步。两个通道各自持有一半凭据，缺一不可。网页换队授权是同一套模式的三态版（approved → minting 15 秒租约 → claimed，防多 worker 重复铸造）。

## 10.3 一个真实的 P0 攻击链

__init__.py:200-223 的 `_resolve_uid` 注释记录了一次安全复盘：开启 AtCheck 后（at 别人查别人的面板），攻击者可以发"@受害者 ww排轴解析…"，把会话、AI 限流、保存操作全部绑到受害者名下。修复：排轴模块一律取 `ev.user_id`（消息发送者），不走 ruser_id；at 他人只允许走只读报告（`_resolve_query_uid`）。这个案例说明 at_help 的通用工具不是所有模块都能直接用——查询类和编辑类的身份语义不同。

## 10.4 计算引擎与数据模型

engine.py 的 `calculate_timeline`（:24-131）很克制：逐条事件查动作目录（ActionCatalogItem 的 expected_damage/crit_damage × 次数），未命中时间的 time_pending 事件只占位不计伤，未知动作键保留并打警告（`afyg:un:` 前缀），按参考线 bisect_right 切时间段，输出每段 DPS 和动作贡献排序。队伍版（:134-214）让每个成员用自己的动作目录独立计算，再跨成员按段求和——注释强调"队友的未知动作绝不会伪造另一成员的 DPS"。

也就是说排轴的伤害结算不重新跑伤害公式，而是复用面板查询时算好的每个动作的伤害数字（动作目录来自 service 层调用 charinfo 的计算管线），时间轴引擎只做编排和分段统计。这个分层避免了在 Web 端重复实现乘区系统。

数据模型（models.py）用 pydantic 严格约束：单人文档 v1 限制 duration 100ms-300s、操作点和伤害事件各 ≤1000、参考线 ≤50、`extra="forbid"` 拒绝未知字段；队伍文档 v2 限制成员 1-3 名，且全队伤害事件总和 ≤1000——注释点明这是防止"3 × 1000 绕过单成员上限"的绕过。

## 10.5 CAS 保存与并发

storage.py 实现了文件级的乐观并发控制：每个轴存 `players/<uid>/timeline_dps/<char_id>.json`（队伍轴按排序后 id 用 '-' 连接做文件名），文档带 updatedAt。保存时校验请求里的 expected_updated_at 与磁盘一致，不一致抛 TimelineConflictError → HTTP 409。双锁（线程锁加 msvcrt/fcntl 跨进程咨询锁）加临时文件 os.replace 原子写加 updatedAt 单调递增。损坏存档隔离（quarantine_illegal_team_saves），内置审核模板库 templates/audit_teams.json。

chat_flow.py 的状态机配合 CAS：预览模板时捕获磁盘 revision 作 baseUpdatedAt（:441-446），防止用户预览几分钟后保存覆盖掉别人的修改；保存前再核对操作者身份（`_session_matches_actor`，纵深防御）。群聊按钮会话（chat_session.py）10 分钟 TTL、上限 3000、六种会话类型，绑定 uid+user_id+bot_id+group_id，他人点击直接拒绝，`drop_sibling_sessions` 防卡片串话。

## 10.6 AI 解析的克制用法

ai_parse.py 用 pydantic_ai 的 Agent 接 gsuid_core AI Core 配置的"低成本任务模型"（`get_model_for_task("low")`），只干一件事：把用户的一段文字描述（"EEE Q A 接重击"这种）解析成结构化意图。约束写得非常清楚：

- 非流式一次性调用，20 秒超时，retries=0，任何失败静默降级到纯规则解析（text_parse.py 的 A/E/R/Q 简写解析器）；
- 输出契约只允许 `{characterId, actionQuery, count, explicitTimeMs}`，system prompt 明令禁止输出伤害/倍率/Buff 数值——AI 只负责"听懂你想干什么"，数值一律由确定性引擎算；
- 越权 characterId（不在用户面板里）直接丢弃；
- 限流即状态：SQLite 跨 worker 共享的 `_RateStore`，每人 5 次/小时、实例总预算 300、并发信号量 2、记录封顶 1000 条有界淘汰，限流键用 contextvar 绑定调用者，换绑 UID 绕不过。

服务层（service.py:730-832 的 parse_rotation_text）串起完整流程：取面板 → 规则解析 → AI 兜底 → 动作目录映射 → 组队校验。AI 额度耗尽时如实告知用户"按纯规则解析"，不装。

## 10.7 AFYG 导入

afyg_import.py 对接第三方排轴分享平台"椰果工坊"（wuwa-afyg-share.200503.xyz）：单份下载 `/share/{code}/download`，目录 `/api/public/projects`。安全线：25 秒超时、Content-Length 预检加 64KB 分块流式累计、解压后硬上限 2 MiB、目录缓存 600 秒加冷缓存单飞锁。

最有意思的是时间映射：AFYG 编辑器用像素记录动作位置（60px = 1 秒），插件要转成毫秒。`build_time_mapper`（:109-150）用分享数据里的 resultAnalysis.timings 锚点（{refLineId, seconds}）构建分段线性 pixel→ms 映射，没有锚点按 60px=1s 估算并标记 time_quality="estimated"——估算结果会如实标注。未匹配到面板动作的条目保留为可读未知键 `afyg:un:<角色>|<技能类型>|<hitName>#<hash8>`，编辑器里显示原文让用户手动替换，不静默丢弃。

## 10.8 前端编辑器结构

static/ 下的前端是纯静态单页，没有构建工具和框架：index.html（180 行骨架）负责装配，app.js（2971 行）是编辑器主体——时间轴画布、动作拖拽、参考线、撤销重做（CHANGELOG 08-04 记录的 60 帧栈）、批量编辑浮动条。辅助脚本各管一件事：request-guard.js 做乱序响应守卫（快速连续保存时，晚发的旧请求不能覆盖新状态，前端版的 CAS 意识）；avatar-loader.js 预取角色头像；report-window.js 处理报告弹窗；batch-edit.js 是批量编辑。

配套 tests/ 下的 Node 单测（*.test.js）覆盖前端关键逻辑——没有构建链的项目用 Node 直接跑测试文件，依赖里看不到 jest，是手写的极简测试脚手架。前端与后端的契约全在 models.py 的 pydantic 文档（TimelineDocument 的 extra="forbid" 让契约双向强制：后端拒收多余字段，前端少发字段也过不了校验）。

## 10.9 动作目录：排轴与计算管线的接口

10.4 节说排轴"复用面板查询时算好的伤害数字"，这里把接口讲清楚。动作目录（ActionCatalog）的构建在 service 层：取用户面板 → WuWaCalc 聚合 → 对时间轴上可能出现的每个动作算出 expected_damage/crit_damage，连同次数与动作元数据打包。编辑器里拖拽的动作项引用的是 action_key——一个稳定的动作标识（技能类型加序号），CHANGELOG 08-03 特意记录了"action_key 稳定引用"这个设计：面板重刷、评分口径变化后，已保存的时间轴不需要迁移，重算时按 key 重新取最新数值。

这个间接层带来两个性质。其一，排轴的存档只存"编排"不存"数值"，伤害口径升级后历史轴的报告自动跟随新口径；其二，目录里没有的动作（AFYG 导入的陌生技能）以 afyg:un: 前缀的占位键存在，可读、可替换、永不参与 DPS 计算——10.4 节"队友的未知动作绝不伪造另一成员的 DPS"的保证，落点就在这个键的设计上。

代价是耦合：动作目录构建依赖 charinfo 的完整管线（面板加载、聚合、注册器），排轴模块因此无法独立部署。对插件形态来说这不是问题（本来就同进程），但它是把排轴抽成独立服务时第一个要切断的依赖。

---

# 第十一章 AI 知识库与工具子系统

wutheringwaves_ai_rag 不是聊天机器人，它做的是把插件的游戏知识、查询能力和个人数据暴露给 gsuid_core 的 AI Core（基于 pydantic-ai 的 agent 框架），让 AI 对话能回答"这期深塔怎么配队"这类问题。三件套：知识实体（RAG）、工具（function calling）、Agent Skill（工作流）。

## 11.1 知识注册：全量游戏知识进向量库

__init__.py 的 `register_all`（:754-791，模块导入即执行）把本地资源目录里的结构化数据注册成 KnowledgePoint：

- 每个角色两条 KP：档案（满级面板、forte 定位、机制详解、共鸣链）和技能天赋，命名 `ww_char_<cid>_profile/_skill`；
- 全部武器（星级/类型/满级面板/效果/谐振 1-5 数值表）、声骸（cost/套装/skill）、合鸣套装；
- 三大挑战的每期数据：深塔的区域/层/Buff/怪物、海墟的信物 Buff、矩阵的关卡/Buff/敌人抗性/推荐角色——带**当期/上期/下期动态标签**（`_period_label`，:300-309），让"这期深塔"这样的查询能命中正确的期数；
- 全角色/全武器汇总表、怪物出场索引、期数-日期索引表；
- 别名注册成 ai_alias（AI 查询时能理解"今昔"指今汐）；
- 攻略图片注册成 ImageEntity（AI 可以引用攻略组图片）；
- help.json 的全部命令转成 KP，副作用命令（绑定/登录/管理类）标注"AI 不可代为执行"——工具能力边界写进知识里。

生命周期管理：`_clear_self_entries` 先清本插件旧实体保证可重入；每日 4:01 cron 重注册让期数标签滚动；资源下载完成后 `reload_ai_rag` 失败回滚旧实体，然后 `rag.sync_knowledge()` 推送向量库同步。这些细节说明作者把 RAG 当成一个要长期运维的数据管道，不是一次性灌进去就完。

## 11.2 工具集：9 个 @ai_tools

tools/ 目录注册 9 个工具函数，签名 `ctx: RunContext[ToolContext]`（pydantic_ai），通过 `ctx.deps.ev` 拿到当前聊天事件。分三类：

**检索类**：`search_wuwa_kb`（kb.py:18-80）是最关键的一个。文件头注释解释了它的存在理由：gsuid_core 内置的 `search_knowledge` 是按相似度阈值动态上桌的 buildin 工具，query 与工具描述相似度不够就进不了工具表，AI 根本不知道要去查知识库。所以作者自建一个 `category="common"` 的常驻工具，强制 `plugin_filter=["XutheringWavesUID"]` 调 `rag.query_knowledge`，专取当期挑战详情。这是对 RAG 框架工具发现机制的一个 workaround，注释值得读。

**目录类**：`filter_chars_wuwa`（按属性/武器/星级筛选）、`filter_weapons_wuwa`、`filter_echoes_wuwa`（按 cost/套装）、`get_sonata_echoes_wuwa`（套装反查声骸）、`get_char_signature_weapon_wuwa`（专武匹配，靠别名表里"X专武"的标注）。

**攻略类**：`get_monster_resistance_wuwa`（怪物抗性，模糊子串匹配）、`recommend_against_monster_wuwa`（剔除被抗属性后按属性分组推荐）、`get_current_period_wuwa`（当期挑战查询，优先按每期 JSON 的 Begin/End 实测，缺失回退周期推算，并给 AI 返回"再调 search_wuwa_kb 取 ww_tower_N"的跟进指引——工具之间会互相引导调用链）。

**个人数据类**（user.py，5 个工具全带越权防护）：查用户 UID 列表、角色列表、角色详情、评分、账号概览。权限：uid 归属校验查 WavesBind，查他人仅限 user_pm==0 的主人，uid 必须 9 位数字。AI 能查到什么数据、查谁的，边界在工具实现里硬编码。

## 11.3 Agent Skill：配队顾问工作流

skills/wuwa-endgame-advisor/SKILL.md 是一个 169 行的完整 skill：当期挑战配队顾问。frontmatter 声明触发意图（"本期深塔/海墟/矩阵怎么配队"），正文包含三大玩法机制速查（深塔深境区 12 位角色/疲劳 10 点、海墟无尽+焚烬系统、矩阵叠兵的"稳态协议奶妈最多出场 2 次"机制），以及严格的六步工作流：查当期 → 搜知识库 → 查怪物抗性（抗性 ≥0.4 不推荐、≤-0.2 视为克制）→ 解读 Buff 适配 → 查用户练度（只用 1 开头的国服 UID）→ 三重打分撮合输出。

skill.py 把 skills/ 下的 SKILL.md 同步到 gsuid_core 的 SKILLS_PATH，内容变化时热重载，AI Core 未启用时静默跳过。这相当于给 AI 写了一份"标准作业程序"，防止它自由发挥漏掉抗性检查这种关键步骤。

## 11.4 与 AI Core 对接的机制细节

插件与 gsuid_core AI Core 的接口面有四类，各自的注册和消费方式：

**知识实体**：ai_entity 注册 KnowledgePoint（id/title/content），ai_image 注册 ImageEntity（攻略图），ai_alias 注册别名表。id 用 ww_ 前缀做命名空间隔离，_clear_self_entries 按 id 前缀清理旧实体保证重注册幂等。注册后要调 rag.sync_knowledge() 把变更推给向量库——向量嵌入和检索由 core 负责，插件只管内容。

**工具**：@ai_tools 装饰器注册，category="common" 保证常驻工具表（绕过内置工具的相似度动态发现，11.2 节）。工具签名收 pydantic_ai 的 RunContext[ToolContext]，通过 ctx.deps.ev 拿到当前聊天事件——工具因此知道"是谁在问"，权限校验在工具内部做。

**Skill**：SKILL.md 同步到 SKILLS_PATH 加 _reload_skills() 热重载。Skill 是提示层资产（工作流说明），与工具（能力层）、知识（数据层）构成三层。

**模型调用**：插件自身不接任何模型 API，唯一的直接调用点在 dps/ai_parse.py，也只经由 core 的 get_model_for_task("low") 拿模型配置。这意味着 API key、base URL、对话主模型、向量库选型全是 core 部署者的配置，插件对模型infra零侵入。这样设计的好处：换模型供应商不用动插件；代价：AI 功能的可用性完全绑定在 core 的 AI Core 配置上，没配模型就整块静默失效（各注册点都有"未启用则跳过"的守卫）。

期数标签的滚动更新（每日 4:01 cron 重注册）是这套体系里最容易被忽略的一环：不重注册的话，"当期深塔"的知识点会永远指向注册那天的期数——AI 会一本正经地告诉你三个月前的怪物配置。数据有"保鲜期"这个意识，在 RAG 实践里少见。

---

# 第十二章 rank_server 独立排行服务

## 12.1 定位

rank_server 是仓库里唯一可以独立部署的服务（FastAPI + SQLAlchemy 2.0 + uvicorn，单文件 app/main.py 1224 行），协议完全兼容主插件的排行接口，用来替代默认远端 wh.loping151.site——自托管排行榜，数据自己攒。部署方式 Docker：docker-compose 两服务（postgres:16-alpine + app，9001 端口），也支持 SQLite 单文件裸跑。

主插件侧的切换点在 wwapi.py:10-17：配置 `WavesRankBaseUrl` 指向自建服务。注意 `RANK_MAIN_URL` 模块导入时求值一次，改配置要重载插件。兑换码和卡池列表两个端点仍固定走官方远端（:38、:46），README 说明是"非上传统计类公开接口保留原远端"。

## 12.2 数据模型

7 张表：rank_accounts（上传者身份）、rank_characters（主键 (waves_id, char_id, modal)——modal 是共鸣模态分榜键，列含 chain/weapon/sonata/phantom_score/expected_damage/overall_score/total_phantom_score，5 个复合索引）、slash_records/matrix_records/abyss_records（三大挑战快照，队伍和角色列表存 JSON Text 列）、local_resource_cache、local_safety_state（后两张是预留）。

统计全部是"实时聚合"：读 JSON 列 → Counter → 算 rate。没有预聚合表，数据量大了会慢，但换来零维护的口径一致性——改统计逻辑不用回填历史。

## 12.3 路由与鉴权

鉴权 `require_auth`（:179-185）：环境变量 `RANK_API_TOKEN` 非空时校验 Bearer token，为空完全开放。插件侧的 `WavesToken` 就是这个 token（README 明确要求两端一致）。

上传走 4 条异步队列（utils/queues/__init__.py:20-25）：面板 `/top/waves/upload`、深渊、冥海、矩阵的 upload 端点，httpx POST 带 Bearer 头，10 秒超时，队列消费在后台不阻塞消息响应。上传内容在 refresh_char_detail 构造（含声骸明细 phantoms），`single_refresh=1` 时只更新 overall_score，全量刷新才写 total_phantom_score——练度总榜的统计口径因此是"只统计全量刷新"，阈值 175 分起（README 数据表说明）。

查询路由：单角色分榜（rank_type 1=声骸分/2=期望伤害/3=综合分）、白名单榜单、练度总榜、单人名次（未上传过给"约N"估算）、三大挑战出场率、持有率与命座分布。有 4 个统计 GET 路由和 2 个上传查询路由没挂鉴权（:627、:773-:802），README 的说法是这些属于"公开接口"——自部署时如果期望全站鉴权，要自己补 Depends。

## 12.5 部署手册要点

rank_server 的部署材料齐全（Dockerfile、docker-compose.yml、.env.example、README 部署节），要点记录：

- **镜像**：python:3.11-slim，构建 ARG 支持清华 PyPI 镜像和 HTTP/HTTPS/ALL 代理（国内网络友好）；EXPOSE 9001，CMD 用环境变量注入 host/port；
- **编排**：compose 两服务——db（postgres:16-alpine，named volume 持久化）加 app（9001:9001，DATABASE_URL 指向 db 容器）；SQLite 模式则去掉 db 服务，DATABASE_URL 用 sqlite:///./waves_rank.db；
- **令牌**：.env 里 RANK_API_TOKEN 必须与插件侧 WavesToken 一致（README 用大写强调 Must match）；
- **口径**：README 数据表说明里写清了练度总榜的统计口径——只统计全量刷新写入的 total_phantom_score，且阈值 175 分起；单人名次接口对未上传者返回"约N"估算。部署者要理解这些口径才能回答用户的"为什么我在总榜看不到"；
- **迁移成本**：从官方远端切自建服务，历史数据是空的——排行和出场率从零攒，切完要等数据积累几天，排行类功能才有内容可看。

## 12.6 统计接口的口径

rank_server 的统计接口全部是"实时聚合"——读 JSON 列、Counter 计数、算比率，没有预聚合表。几个口径的细节：

持有率接口（/api/waves/hold/rates）：基于 rank_characters 的角色行数除以去重账号数，命座分布按 chain 字段 0-6 分桶。出场率接口（abyss/slash/matrix 三组）：读上传的队伍快照 JSON 列，Counter 统计角色出现次数除以记录数；矩阵版多一档 count_top/score_top 两个视角（main.py:1054-1103）——按出场次数和按平均分排是完全不同的榜，前端要选对。

分榜的 tiebreak 值得注意：分数相同时按 updated_at 升序排（:816-837 的注释口径），即"先上传者在前"——给老数据让位，避免刷分时段的重测垄断榜单头部。单人名次接口对没上传过的用户返回"约N"估算（:1182-1224）：按分数段插值估位次，让"我大概排多少"有答案而不强迫用户先上传。

实时聚合的代价是查询成本随数据量线性涨（每请求全表扫），收益是改口径不用回填历史。这个取舍对几千账号量级没问题，十万级就该换物化视图了——README 没提容量上限，部署者心里要有数。

## 12.4 数据流闭环

整个排行体系的数据流：用户刷新面板 → _compute_one_char_rank 算出声骸分/伤害/综合分 → save_card_info 写本地缓存 → push 队列 → rank_server 入库 → 其他用户查排行/出场率/持有率 → 出图。用户贡献数据、社区共享统计，这是这个生态能算出"持有率""出场率"这种全网指标的根本原因——没有任何官方 API 提供这些，全是机器人用户上传的面板攒出来的样本。

样本偏差是显然的：用机器人的玩家偏活跃、偏氪金，持有率会系统性偏高。代码层面没有做任何去偏处理，排行服务的 README 也没提。这个局限值得用户知道。

---

# 第十三章 基础设施横切面

把散在各处的通用组件收拢成一章。

## 13.1 缓存：TimedCache

utils/cache.py（656 行）是项目里被依赖最多的基础件。核心是 OrderedDict + TTL 的内存 LRU，但它的价值在增强层：

- **SQLite 落盘**：传 persist_path 后磁盘为权威源，解决多 worker 与重启场景（登录会话、排轴会话都用这个形态）；
- **transition()**（:609-644）：BEGIN IMMEDIATE 写事务做 CAS，"恰好一个调用者成功"——兑换码消费、换队确认这类一次性状态迁移的原语；
- **replace_where_if_key_absent**：排轴会话创建用的抢占式写入。

TimedCache 有个使用上的心智负担：它是进程内缓存加可选落盘，多 worker 部署下内存副本可能各自过期，但磁盘数据一致。需要强一致的流程必须全程走落盘 API。

## 13.2 队列与单飞

utils/queues/ 的 TaskDispatcher：单 asyncio.Queue 加注册表加常驻 worker 协程，纯 asyncio 不开线程。四条生产者（深渊/冥海/矩阵/面板卡片画完后 push），消费者统一绑定到排行上传 handler。关停重启有边缘处理（复用旧 worker 时重置 running 标志）。init_queues 在伤害注册器初始化时触发（register.py:70）——启动顺序上，队列必须先于第一批卡片渲染就绪。

utils/single_flight.py 的 SingleFlightLock 是个 10 行的去重锁（_holding: set），同一 key 的重操作同时只放行一个，并发请求直接忽略。用在周年庆报告这类重渲染上。和它互补的是请求层的对冲竞速——单飞是"重复请求合并成一个"，对冲是"一个请求拆成两个赛跑"，方向相反，解决的是不同问题。

## 13.3 内存治理

malloc_tuning.py 只在 Linux/glibc 生效：ctypes 设 mallopt(M_ARENA_MAX=2) 限制 arena 数量，每 10 分钟 malloc_trim(0) 归还内存。加上渲染层的浏览器 1000 次重启、页面池复用、图片烘焙缓存，构成了一个完整的内存治理组合。这些代码存在的背景是：1c2g 的服务器跑一个带 Chromium 的 Python 进程，内存是第一约束。

## 13.4 其他小件

- error_reply.py：错误码到用户文案的映射（102=未登录提示去登录、103=未绑定），hint.py 的 error_reply 薄封装加 error 日志；
- game_time.py：游戏时区工具，所有面板时间统一 UTC+8（GAME_TZ），宿主机在 UTC Docker 容器里显示不错位；ceil_days 向上取整修复"还剩 3 小时显示余 0 天"（CHANGELOG 2026-08-26）；
- limit_user_card.py：从 map/1.json 读一份预置面板写进 players/1/rawData.json——用 uid=1 的假用户承载"受限展示卡"，给未绑定用户演示用的；
- plugin_checker.py：沿调用栈判断消息来源插件，hook 过滤的基础；
- localization：5 语种，用户偏好存库，PIL 文案经 t(key, locale)。

## 13.5 safety.py 空壳与"内网地址"现象

有两个发现值得单说。utils/safety.py 全文 10 行：generate_dynamic_version 返回空串、safe_calc_damage 返回 ("0","0")、safe_calc_score 返回 None，全项目无人 import 它——是内部版本剥离后的遗留桩。scoring_api.py:13 的默认评分地址是作者内网 `http://192.168.0.103:8787`（可用环境变量 SCORING_API_URL 覆盖）。

两个现象合起来看：这个仓库是从作者的完整环境里"导出"的副本，作者自用的评分服务、部分内部接口不在里面，对外发布版保留了双通道结构但远程端不可达。对普通部署者的影响是每次评分多 3 秒超时等待加一条 warn_once 告警，然后走本地公式——功能完整，性能略损。二次开发者应该知道这个背景，免得以为评分服务坏了。

## 13.6 资源目录布局

RESOURCE_PATH.py 是全插件文件路径的唯一来源，布局如下（都在 gsuid_core 的资源目录 /XutheringWavesUID/ 下）：

```
XutheringWavesUID/
├── resource/                下载的静态资源
│   ├── avatar/ weapon/      角色头像、武器图标（懒下载）
│   ├── role_pile/ role_bg/  自定义面板图、面板背景（用户上传）
│   ├── phantom/ material/   声骸图、突破材料图
│   ├── share/               共享背景池（随机背景）
│   └── map/                 结构化数据
│       ├── detail_json/     角色/武器/声骸/怪物详情（整包下载）
│       ├── alias/           四套别名词典（+ 用户自定义 custom_*.json）
│       ├── character/       各角色评分模板 calc.json（+ condition 规则链）
│       ├── damage/          伤害注册入口与场景配置
│       ├── wutheringgg_skill_data.json   技能倍率缓存（sha256 校验）
│       └── 1.json           受限展示卡的假用户面板
├── guide_new/<9个攻略组>/   攻略图片（按作者分目录）
├── players/<uid>/           用户数据（rawData/rover/charListData/gacha_logs/
│   │                        matrixData/baseInfo + timeline_dps/ 时间轴存档）
├── backup/gacha_backup/     抽卡记录备份
├── other/                   calendar/ 日历图、bake/ 烘焙缓存、wiki/ 图鉴缓存
└── show/                    用户自定义模板与展示配置（show_config.json）
```

几个路径有专门的保护：players/ 走 player_store 的原子写加白名单 gzip（5.5 节）；role_pile/role_bg/custom_mr_card 三个上传目录被 card_hash_index 双索引盯梢（8.6 节）；map/ 下的数据文件有 sha256 校验或不合格拒写（rotation_damage 的技能数据）。路径集中管理的直接收益是"压缩数据"（master 模块）和每日缓存清理这类全局操作可以遍历着写，不用各模块自己拼路径。

一个无人值守跑在用户服务器上的插件，可观测性决定排障效率。这个项目的做法散在四处，收拢来看：

**日志**：全项目走 gsuid_core 的 logger，前缀统一 `[鸣潮·插件]` / `[鸣潮·Hook]` / `[鸣潮·伤害注册]`，grep 一个前缀就能圈出本插件全部日志。关键路径都有埋点：钩子触发（debug 级）、批量写入失败（warning 级）、渲染回退（warning 级）、未知响应码（warning 加调用栈）。

**主动上报**：两类事件直接私聊通知 bot 主人——IP 风控（code 270，KuroApiResp 的 validator 自动触发）和服务器维护（独立冷却通道避免刷屏）。每日维护任务（删无效 CK）完成后也发报告。这相当于把"需要人介入的异常"从日志里捞出来推到主人面前，比等用户投诉快得多。

**状态页**：status 模块往 core 的状态页注册三个指标（绑定数、登录数、活跃数），部署者不用查库就能看库存健康。

**诊断信息前置**：_waves_request 对未知 code 用 inspect.stack() 抓调用方打日志（3.3 节）；渲染空壳探针的失败信息带模板名和选择器（render.py 的注释里连历史事故都记着）；错误码表（error_reply）让用户看到的文案和日志里的 code 一一对应。

不足也有：没有结构化日志（全是 f-string），没有指标计数器（请求成功率、缓存命中率这些没有聚合），排障依然靠人翻日志。对一个插件项目够用，但若要做成多租户服务，这是第一块要补的短板。

---

# 第十四章 工程化与质量

## 14.1 测试

tests/ 目录 26 个测试文件，覆盖面集中且偏科：

- 排轴子系统占一半：timeline 的 models/storage/auth/routes/engine/deliver/cache、chat_flow、team 文档与模板、1-2 人队伍 e2e、afyg 导入、ai 限流、text_parse，外加两个前端 Node 测试（frontend_smoke.js 等）；
- 伤害与评分：test_damage_rules.py（命座正则规则）、test_rotation_damage_regression.py（循环伤害回归）、test_suisui_weights.py（权重）；
- 安全回归：test_dps_atcheck_attack.py、test_dps_confirm_atcheck.py——10.3 节那个 P0 攻击链的回归测试；
- 其他：cliproxy、echomatrix 评分说明、更新回滚。

测试策略是"哪里炸过测哪里"。排轴是新子系统且直接暴露 Web 面，测试密度最高；charinfo 这种老模块几乎没有单测，靠线上验证。test_dps_atcheck_attack.py 的存在说明安全事件会沉淀成回归用例，这个习惯不错。

## 14.2 代码风格与约束

pyproject.toml 配了 isort（black profile、line_length 79、**length_sort**——按长度排序 import，比较少见的选择）和 pre-commit。Python 版本要求 ≥3.10（用了 match、X | Y 类型语法）。没有 lint 配置（无 ruff/flake8），行内风格靠约定。

命名上有一套稳定的内部语言：draw_xxx（渲染入口）、_xxx_pil（PIL 版）、refresh_xxx（刷新链）、_compute_one_char_rank（评分管线）、SPECIAL_CHAR（漂泊者）、texture2d（素材目录）。跨模块的隐式契约也不少：deal.add_cookie 的"登录成功"文案匹配、WavesUser 字段语义（cookie 字段在不同体系里存不同凭据）、技能等级 0 基约定——这些契约没有类型检查兜底，全靠注释和测试。

## 14.3 版本演进

CHANGELOG 覆盖 2026-08-02 到 08-26（一个月窗口），脉络清楚：

1. **功能扩张期**（08-02 至 08-06）：排轴从单人轴到三人队伍轴到并发安全加固（CAS、兑换码、409 语义），节奏是三天一个安全补丁；
2. **渲染 V2 化**（08-22 至 08-24）：持有率卡 GIF → 静态 HTML，V2 面板三轮大改（空壳探针修复、CDP 1.5x 截图、字体 display:swap），评分权重引擎科学化重做；
3. **稳定性打磨**（08-26）：时区修复、渲染提速（页面池复用 1.52s → 0.11s）、渲染超时收敛。

models.py 里注释掉的 2025 年迁移代码（改名、目录迁移）和僵尸端点（云登录旧接口）则记录了更早的演化。整个仓库像一层层沉积岩：每个时期的决策痕迹都留在代码里，没有抹平。

## 14.4 安全设计汇总

把散落各章的安全机制收个总账：

| 威胁 | 对策 | 位置 |
|---|---|---|
| 群消息泄露编辑凭据 | token 不进群，兑换码+确认码双通道 | dps/deliver.py、auth.py |
| at 他人劫持会话 | 排轴一律取发送者 uid，只读才允许 at | dps/__init__.py:200-243 |
| 用户输入注入 | 失败文案不回显原串、AST 白名单求值、递归剥 URL | name_resolve.py、damage.py、refresh_char_detail.py |
| 第三方数据攻击面 | AFYG 大小硬上限 2MiB、流式下载、分享码白名单 | afyg_import.py |
| 多 worker 竞态 | SQLite CAS（transition）、INSERT ON CONFLICT、抢占式写 | cache.py、waves_subscribe.py、auth.py |
| 凭据误杀 | 维护中不标死、国际服不进 KuroBBS 校验、保护期防续登风暴 | requests.py、launcher_chain.py |
| Web 面攻击 | CSP/nosniff/no-referrer 统一头、Cookie Secure 判定、HttpOnly | dps/routes.py:76-114 |
| 上传滥用 | 面板图转主人审核、cv2 查重、Basic Auth 编辑器 | charinfo |

也有弱点：rank_server 部分路由无鉴权（文档声明为公开接口，但部署者容易误解）；ttorc 过码器被禁用后 geeTest 只能靠换 IP 硬抗；MAIN_URL 导入期固化导致改镜像配置不生效。

## 14.5 一个月的迭代节奏

把 CHANGELOG 的时间线摊开，能看到一个维护期项目的真实节奏（2026-08）：

| 日期 | 主题 |
|---|---|
| 08-02 | 持有率 GIF 卡；自更新双轨与回滚命令 |
| 08-03 | 排轴 v1：网页编辑器、30 分钟令牌、原子存档 |
| 08-04 | 排轴 v2：三人队伍、撤销重做（60 帧栈）、AI 兜底解析 |
| 08-06 | 排轴安全加固：CAS 保存、一次性兑换码、409 语义 |
| 08-22 | 持有率 V2（GIF → 静态 HTML + 直方图）、wuwatracker 抓取 |
| 08-23/24 | V2 面板三轮大改；评分权重引擎科学化重做 |
| 08-26 | 时区修复、渲染提速（页面池复用 1.52s → 0.11s）、超时收敛 |

三天一个大功能、隔天一个安全补丁、月底集中做稳定性和性能——这个节奏和代码里的痕迹完全对得上：排轴子系统的高测试密度对应 08-03 到 08-06 的密集迭代，render_utils 的性能注释对应 08-26 的优化，评分说明的回归测试对应 08-24 的口径重做。CHANGELOG 的写法也偏工程纪要而非宣传文案，每条都指向可验证的代码变更。

## 14.6 依赖与构建的考古

根目录的构建材料有点"战国"：pyproject.toml 同时保留 [tool.poetry] 和 [project] 两套元数据（build-backend 声明是 pdm.backend，poetry 节里的 version 1.0.0 和包内 3.6.0bNewBee 不同步）；三个锁文件并存且都只有两三百字节——pdm.lock、poetry.lock、uv.lock 形同虚设，真正的依赖解析靠 gsuid_core 宿主环境；requirements.txt 只有 2 字节（空文件）。这套配置说明作者实际上从不在隔离环境里从头装依赖，插件永远装在现成的 core 环境里，锁文件是脚手架残留。

显式依赖只有四个（pypinyin、rapidfuzz、playwright、opencv-python），其余全部由 gsuid_core 传递：aiohttp、httpx、SQLModel、pydantic、FastAPI、APScheduler、Pillow、fontTools、jinja2……这带来一个隐含约束：gsuid_core 锁定什么版本，插件就得跟什么版本。ai_parse.py:466-469 的注释直接印证了这一点——"构造参数刻意跟随 gsuid_core 部署环境的 pydantic-ai-slim 老 API"。给 core 生态写插件，依赖自由度天然受限，代码里到处用 try/except 包可选依赖（pypinyin、rapidfuzz 缺了降级 difflib）也是同一约束的产物。

质量工具链：.pre-commit-config.yaml 只有 153 字节（isort 钩子），isort 配置用 black profile 加 length_sort（按长度排序 import，比较少见但让 import 块视觉整齐）。没有 ruff/flake8/mypy——类型标注覆盖不低（新版模块几乎全标注），但没有任何工具强制。测试用 pytest 风格的裸文件加 Node 脚本，CI 配置不在仓库里。

## 14.7 技术债清单：15 处同一个 TODO

grep 全仓的 TODO/FIXME，结果出奇地单一：15 处标记，全部是同一句话的变体——"PIL 卸到线程池"。分布在 abyss 四个 PIL 卡、charinfo 两个、rank 家族六个、矩阵榜两处。展开注释都有具体病灶描述，比如 draw_rank_card.py:263："loop body 多处 await get_attribute / get_square_weapon / get_attribute_effect，重构成本大"。

问题的本质：Pillow 是同步库，直接跑在 asyncio 事件循环里会阻塞所有协程——渲染一张大图的几百毫秒里，整个 bot 不响应任何消息。项目的标准解法本来是 `asyncio.to_thread`（player_store 就是这么包 IO 的），但这些渲染函数的病不在"一次 PIL 调用"，而在"await 网络请求与 PIL 操作在循环里深度交错"：要把整段循环搬进线程，就得先把所有 await 收敛成批量预取——注释里写的"需要批量预取重构"就是这个意思。重构成本大，于是一处一处先标记。

这批 TODO 是全项目最诚实的部分：作者清楚问题、清楚解法、也清楚暂时不修的理由。有意思的是它至今没有爆发成事故——单实例部署下事件循环阻塞只表现为"渲染时bot卡顿半秒"，量级可忍。但如果有人想把这个插件改成高并发多租户形态，这是第一颗会炸的雷，14.7 的清单可以直接当工单用。

---

# 第十五章 深水区补遗（上）：榜单卡片家族、抽卡合并与卡池统计

主线章节覆盖的是架构骨架，这一章和下一章补上几个体量大但位置偏的模块。先说排行体系的前端——那十几个 draw_rank_xxx 卡片文件不是重复劳动，每张对应一种榜单口径。

## 15.1 排行卡片家族

wutheringwaves_rank 模块注册了 6 个 SV 服务（__init__.py:17-22），对应六种榜单，加上 gachalog 模块注册的抽卡排行，一共七类卡片：

| 卡片 | 榜单口径 | 数据来源 |
|---|---|---|
| draw_rank_card.py（573 行） | 本群单角色伤害/评分排行 | 本地：遍历群成员的面板现算 |
| draw_all_rank_card.py（481 行） | 跨群单角色总排行（伤害/评分/综合） | 远端：POST /top/waves/rank |
| draw_rank_list_card.py（487 行） | 本群练度排行（全角色声骸分总和） | 本地：charListData.json 缓存 |
| draw_total_rank_card.py（274 行） | 跨群练度总排行 | 远端：/top/waves/total/rank |
| draw_phantom_rank_card.py | 本群单件声骸排行 | 本地现算 |
| draw_phantom_total_rank_card.py（674 行） | 跨群单声骸总榜 | 远端 |
| draw_gacha_rank_card.py（314 行） | 本群抽卡欧非排行 | 本地 gacha_logs.json |

本地榜和远端榜的分工对应数据流的两端：本群数据自己算（draw_rank_card 的 draw_rank_img，:264——WavesBind.get_group_all_uid 取群成员，Semaphore(50) 并发读本地面板，get_one_rank_info 用 WuWaCalc 算分加注册表算伤害，排序后分页绘制），全网数据查排行服务（rank_type_num 映射 3=综合/2=伤害/1=评分，draw_all_rank_card.py:155）。有个混合模式：群内发"综合评分排行"时，本群 UID 列表转给远端的 /top/waves/cards/rank 做白名单过滤（draw_rank_card.py:276-294），等于"远端算分、按群切分"。

排序口径随榜单语义变化：评分榜按 score/damage/level/chain 降序，伤害榜把 damage 提到首位（draw_rank_card.py:351-360）；单声骸榜按 (score, cost, level, qid) 排（draw_phantom_rank_card.py:288）——同分比 cost（更贵的声骸词条上限高）、再比等级和强化次数。

抽卡欧非榜的算法值得一提（draw_gacha_rank_card.py:73-77）：`weighted = (char_avg×char_up + weapon_avg×weapon_up) / (81×char_up + 54×weapon_up) × 100`——角色池硬保底 80 抽、武器池 54 抽（鸣潮的武器池保底更低），按各自 UP 金数量加权归一到百分制，无 UP 金记 1000 分垫底。欧非分界 100（期望值），支持欧/非/抽数三种排序。

分页与装饰是公共组件：pagination.py 定 RANK_PAGE_SIZE=20、RANK_MAX_PAGE=50，`paginate_group_rank` 切片后如果"自己不在当前页"就把自己补在末尾——用户翻榜时总能看到自己的位置，这个小设计对群排行体验影响很大。rank_badge.py 画前三名徽章（PNG 裁中心 45x45 缩到 55x55，:21-37），名次超 1000 显示"999+"。rank_bar.py 的 `stretch_rank_bar`（:4-41）做九宫格式拉伸——进度条素材只拉伸中央 1 像素条带，四角保真。rank_avatar.py 是四级头像回退链：消息里带的 sender_avatar → 数据库 avatar_url → QQ 官方头像 → 角色头像兜底，TimedCache(600,200) 缓存；注释解释了为什么数据库优先于 QQ：qlogo 对未注册 QQ 号也返回占位图，区分不出来。

_colors.py 按玩法分档配色，最高档返回一个特殊哨兵值 CRYSTAL_SENTINEL=(-1,-1,-1)，触发 draw_crystal_text 做"水晶字"——逐像素横向七色渐变加纵向 sin 调亮（:29-75）。榜单顶部的名次能用上水晶字的只有绝无仅有的那几个，视觉稀缺性靠颜色值本身编码。

## 15.2 matrix_rank.py：矩阵双榜单

全息矩阵（叠兵玩法）有 1020 行的独立榜单实现，远端总榜加本地群榜双轨（matrix_rank.py:200-570 与 :733-1020）。数据结构两级：MatrixTeamInfo（score/role_icons/buff_icon/char_ids）与 MatrixRankListInfo——从矩阵记录的 modeDetails 里取 modeId==1 的记录，按分数降序取前 2 队（:584-629），team_key 支持过滤指定队伍组合（:611-619）。

一个实现细节体现了数据一致性意识：单队榜的金数直接用 API 返回的 chain（:123-130），群榜却要逐角色查 get_role_chain_count（:708-729，走 rawData.json 的 chainList，主角查 rover.json）——因为群内重算时不能信上传时的旧数据。周期校验 is_matrix_record_expired（:668-673）过滤过期记录，权限复用 _permissions.py 的 token 条件加活跃过滤（Semaphore 50 并发查 WavesUserActivity）。

## 15.3 抽卡记录的合并算法

gachalog 模块在第九章只讲了个轮廓，它的数据工程其实相当讲究，值得单独展开。

**多格式导入**。model.py 定义本插件自己的导出格式 WWUIDGacha（51 行：info 加 item 列表，Item 允许 extra 字段）；model_for_waves_plugin.py 定义兼容 Waves-Plugin 的格式（91 行，字段全字符串），`turn_wwuid_gacha()`（:67-91）做转换——池名映射（"角色活动唤取"→"角色精准调谐"，:33-38）、时间戳毫秒转秒、rank_type 转 int。用户手里有各种工具导出的记录，格式层统一在入口消化。

**保底校验**。merge_utils.py（153 行）在合并前做物理合理性检查：GACHA_HARD_PITY=80，按老到新累计 pity，5 星 pity 超 80 或末尾垫抽超 80 报 GachaPityViolation。两个出口的取舍写在注释里：assert_valid_gacha_pity 抛异常阻断（严格模式），warn_gacha_pity_violations 只告警放行——因为断档（historyGapBefore）跨段计数时真实抽数不可还原，拒绝合并会让用户永远导不进来。宁可收下有疑问的数据加警告，不把用户挡在门外。

**合并算法**（get_gachalogs.py）：find_longest_common_subarray_indices（:151）找新旧记录的最长公共子数组做锚点，锚点前后的数据按段拼接；没有公共锚点时退化为按时间戳分组多数表决（_merge_timestamp_groups，:413-450），用 Counter 校验合并后数量一致；_reconcile_filler_cycles（:271）处理"凑数周期"的截断匹配。这套算法的背景是官方接口只留 180 天：用户半年前导过一次，现在再导，新拉的数据和旧数据重叠又各有独占段，合并必须无损。

**网页版**。web_view.py（568 行）：用户发"抽卡页面"，生成 secrets token，会话存持久化 TimedCache（url_cache.db，TTL 600 秒），挂 /waves/gacha/{token} 路由。没有用户鉴权——凭 token 即看，安全性靠短时效加 UID 脱敏。数据计算 _build_pool_view（:319-405）：老到新扫描，两个 5 星之间算一个"周期"，统计平均出金、平均 UP 金、当前垫抽；断档处保底重置；旧 API 没有四星记录且周期超 10 抽的标记 is_stub（数据残缺但没法补）。过期访问返回 200 加提示页而不是 404——注释说明是为了防 nginx 的 error_page 拦截。外置登录站模式下，网页资源（摘要 JSON、头像、武器 PNG）先 asset-check 问远端缺什么再增量上传（:168-313）。前端 page.html 是 1418 行的单文件 SPA，引 html2canvas 和 gsap。

## 15.4 卡池复刻统计

wutheringwaves_up 的"未复刻角色/卡池倒计时"命令背后是 pool.py（309 行）的统计逻辑。get_pool_data 从远端拉全部历史卡池（1 小时缓存），clean_pool_data（:59-131）做核心清洗：对每个池算 total_seconds = now - end_time——正值表示"已结束多久"（即已 X 天没 UP），负值表示"当前 UP 还剩多久"。去重有两处：同一 end_time 的池属于同版本双 UP 或分阶段，只统计与当前 UP 期一致的；四星用 fixed_four_repeat 集合按 (end_time, pool_type) 去重，因为同一期常驻四星会出现在多个 UP 池里被重复计数。第一个 total_seconds<0 的池定为本期 UP 锚点。渲染双列布局，seconds_to_human 格式化成"已有 X 天未UP"或"当前UP(X天后关闭)"。周年庆这类特殊池不剔除，只在图上标注"不计入复刻次数"——数据诚实优于图表整洁。

## 15.5 wuwatracker 爬虫：解析 Next.js RSC payload

持有率和卡池统计的数据来自爬 wuwatracker.com——这不是调 API，是解析网页。该站是 Next.js SSR，数据以 RSC flight payload 形式嵌在 HTML 里：`self.__next_f.push([1,"..."])` 的一堆 chunk。两个解析器（wuwatracker_ownership.py 329 行、wuwatracker_banner_stats.py 305 行）共用一套技术：正则抽出所有 chunk，逐个 json.loads 反转义后拼接，再用 JSONDecoder.raw_decode 从标记位置前缀解码（_decode_json_prefix）——把嵌在 JS 里的组件 props 当流式 JSON 读。

ownership 版（持有率）：找 "ownership":{ 之前最近的 "data":[，前缀解码出角色持有数组，转相对持有率 count/total×100；flight 解析失败时退化为对原始 HTML 做转义还原再找（:103-109）。banner_stats 版（卡池统计）：抓 /tracker/stats 页，_find_object_before 向前回溯找总览 props（总用户数、总抽数、当前 UP 池列表），_find_pity_histogram 靠 `barColor":"var(--five-star)"` 这个 CSS 标记定位保底直方图——用样式当数据锚点，脆但有效。i18n 中文名映射解决"英文名转角色 ID"。

网络层带三级代理回退（cliproxy → 配置代理 → 本地代理，:243-262），24 小时成功缓存加 10 分钟失败退避（_stats_failure_until，:221-233）——爬挂了不硬打，10 分钟后再试。这类"爬第三方站"的代码最大的风险是对方改版，所以解析器里全是防御性回退和缓存隔离，挂了也不影响其他功能。

## 15.6 排行的治理与样本

榜单类功能的治理逻辑集中在 rank 模块的 _permissions.py 和 _colors.py 之外的三个文件里，值得单独记录，因为它回答了"谁能上榜、什么数据能上榜"：

**准入控制**：get_rank_token_condition（_permissions.py:13-34）实现"登录后排行"——配置 RankUseToken 开启后，伤害类榜单要求用户有登录态（OwnWavesChar），WavesRankUseTokenGroup 与 NoLimitGroup 两个群列表做覆盖（某些群强制要求、某些群豁免）。动机是防刷：登录态提高了伪造面板的成本。

**活跃过滤**：filter_active_group_users（:37-76）按 ActiveUserDays 查 WavesUserActivity，把窗口期没在本插件说过话的用户从榜单里摘掉（Semaphore 50 并发查库）。RankActiveFilterGroup 决定哪些群启用。这个设计的立场很明确：排行是社区功能，活跃成员优先。

**口径约束**：总榜只认全量刷新写入的 total_phantom_score（12.3 节），单件声骸榜只收满 5 条副词条的声骸（expression_ctx.py:128）——半残词条没有比较意义。

样本问题也要摆在台面上：这套排行的一切数据来自"愿意用这个机器人并刷新面板的用户"。持有率、出场率会被"使用机器人的玩家偏活跃"这个选择效应系统性扭曲，伤害榜头部则是深度玩家互卷。代码没有做任何去偏，README 也没有声明口径局限。作为社区玩具这没问题，引用这些数字做严肃分析前要清楚这一点。

---

# 第十六章 深水区补遗（下）：面板图生态、wiki 渲染器与效应常量

## 16.1 面板图社区生态：从上传到审核到编辑器

自定义面板图（用户上传的角色立绘卡片）是这类机器人的社区粘性所在，项目围绕它建了一条完整的流水线：指令上传 → ORB 查重 → 主人审核 → 网页编辑器管理 → hash 索引生效。

**指令上传流**（upload_card.py:71-165）：从消息取图，解析角色（主角必须带性别后缀），下载到 CUSTOM_PATH_MAP 对应目录，先过尺寸校验（card/stamina 必须竖版、bg 必须横版，:39-49），再 ORB 查重——最高相似度超过 ORB_BLOCK_THRESHOLD 的直接删除并提示"请使用强制上传继续"。成功后更新 ORB 特征缓存加 card_hash_index 索引，回给用户一个 hash id（以后用"设置面板图 角色名 hash"绑定）。

**ORB 查重算法**（card_utils.py，807 行，这是全项目唯一用 opencv 的地方）：参数 Lowe ratio 0.75、最小匹配 40、报警阈值 0.7、阻止阈值 0.9、特征数 2000（:56-60）。流程：灰度化后 ORB detectAndCompute；卡片类型有特殊预处理——上传分支按屏幕坐标裁可见区（CROP_PORTRAIT=(85,265,525,1070)）再放大 2 倍，存图分支走另一条裁剪路径，两路归一到同一分辨率保证描述子可比；相似度 = BFMatcher 汉明距离 knnMatch 过 ratio test 后，RANSAC 单应矩阵的内点数比 good 匹配数（:462-491）。特征按文件名 sha256 前 8 位缓存 .npz（带版本戳 ORB_FEATURE_VERSION=2，改参数自动失效）。批量查重用并查集聚类（:494-573）——找出"这批图互相重复"的等价类，不只是"和库里重复"。

为什么用 ORB 不用感知哈希？面板图多为二次元立绘加排版，pHash 对这类图的区分度差，而 ORB 特征点对"同一张图的不同压缩/裁剪"敏感、对"不同图"稳定，实测阈值 0.9 的误杀率可控。代价是 CPU：全库查重用 ThreadPoolExecutor 按 cpu-2 并发（panel_editor/routes.py:656-715）。

**审核流**（charinfo/__init__.py:286-436）：开启 WavesUploadAudit 后，普通用户上传走 _forward_upload_to_master——同样先查重剔除重复，WavesUploadAuditKeepLocal 开启时原图存入 panel_editor 的 pending 区（storage.save_pending，:382-391），然后按"联系主人"订阅逐个转发文字加图片。主人确认后自己发上传命令正式入库。pending 区就是网页编辑器"待审核"页的数据源。

**网页编辑器**（wutheringwaves_resource/panel_editor/）：挂 /waves/panel-edit/，是整个项目 Web 安全线做得最细的一块。鉴权 HTTP Basic Auth（用户名固定 admin，密码 WavesPanelEditPassword，secrets.compare_digest 恒时比较，auth.py:291-299），密码为空直接 503 关站。防爆破两层：单来源（IPv6 按 /64 聚合）10 分钟 5 次失败锁 15 分钟返 429（:27-31）；全站失败速率超限后对失败请求做 tarpit 式延迟（0.4 秒起步、步进 0.3 秒、上限 8 秒，:140-155）——让爆破者在延迟里烧时间。CSRF：写请求必须带自定义头 X-Waves-Panel-Edit: 1（:160），配合 sec-fetch-site/origin/referer 校验。IP 信任策略：仅上游为回环时才信 X-Real-IP/X-Forwarded-For（:48-59），防伪造头绕过限速。

功能面：列表、三档缩略图（180/360/720，防 disk-fill）、临时上传（100MB 上限）、裁剪（始终从 original 裁、越界白色填充、画布限 8000px/40MP 防 OOM，:347-411）、缩放压缩转 webp、入库/替换/删除、全库查重、预览（card 走 Playwright 面板渲染、bg/stamina 走体力渲染，:776-814）。tmp 区 6 小时 GC。每次入库/删除/替换都同步维护 ORB 缓存和 card_hash_index 双索引（:47-76）。

**别名管理**（char_alias_ops.py）：用户自定义别名独立持久化于 CUSTOM_CHAR_ALIAS_PATH。添加的关键校验：新别名若已能被反解到任意角色则拒绝（:69-71），防止覆盖内置别名；删除刻意放宽——不要求别名可反解，注释说是为了清"脏数据"。批量操作一次 load 一次 save（:79-102），失败项不影响已成功项。查询渲染三级降级：Playwright HTML → PIL → 纯文本。

## 16.2 wiki 渲染器的分工

wutheringwaves_wiki 的九个文件按"HTML 组装层 + PIL 绘制层"分工：

HTML 层三个 render 文件只负责组装模板上下文。char_wiki_render.py（352 行）做角色技能/命座/forte 图鉴：技能按固定 skillTreeId 顺序（常态攻击/共鸣技能/回路/解放/变奏/延奏/谐度破坏）拼接关联节点，倍率表取 param[0][5:10]，`{N}` 占位符替换为内联图标（:305-321）；缓存键 (char_id, render_type) 落 WIKI_CACHE_PATH。other_wiki_render.py（309 行）做武器/声骸单卡和两类列表页。tower_wiki_render.py（440 行）做三大挑战的本期信息：深塔默认左塔右塔只显示第 4 层、中塔显示 1-9 层（玩法结构如此）；矩阵找"奇点扩张"关卡输出 buff 加去重后的 boss Tags；海墟取 EndLess 挑战（兼容旧版期数命名）。怪物图标用声骸图反查（get_monster_icon，:52-60）——库里没有独立的怪图资源，借声骸立绘。

PIL 层五个 draw 文件是降级实现，其中 draw_tower.py（913 行）工作量最大：矩阵的 PIL 版要重建整个 HTML 布局（buff 卡、怪物卡、角色增益面板，:550-884），连标签颜色的文字对比度都要自己算（:591-604）。

guide.py（226 行）是个例外，不走渲染——攻略查询直接发攻略组的成品图。9 个攻略组映射目录名，按 `{角色名}.jpg` 文件名匹配，多图按 -1/-2 序号排序；超 JPG 尺寸上限（65535 像素）会缩放，逐级降质压到配置大小（:133-179）；发送用显式 MessageSegment 列表避免合并转发的平台兼容问题。攻略图的"配置大小"压缩是个实用细节：QQ 对大图会转 CDN 二压，先自己压到合理体积反而保清晰。

## 16.3 效应系统常量表

第七章提到六种元素效应，倍率数据全部硬编码在 damage/constants.py（349 行），按"层数-1"索引：

| 效应 | 倍率曲线 | 备注 |
|---|---|---|
| 聚爆 fusion_burst | 1 层 84%，1-10 层每层 +68.29%，11-16 层每层 +232.9% | 13 层标注"千咲延奏 +3 上限"；爆炸基础值 3674 |
| 霜渐 glacio_chafe | 1-10 层每层 +19.92%，10→11 跳 +67.92%，16 层 611.30% | |
| 虚湮 havoc_bane | 1-12 层每层 +2% | 另有独立减防表（每层 -31.86，:64-77） |
| 风蚀 aero_erosion | 1 层 45%，1→2 +67.5%，之后每层 +112.5%，上限 15 层 | |
| 电磁 electro | 1-10 层每层 +40.65%，11-16 层每层 +138.62% | 注释说明伤害与爆发共用此表 |
| 光噪 spectro_frazzle | 1-10 层每层 +24.39%，11-16 层每层 +83.17% | 另有 90 项"附加攻击力"表（按角色等级，:146-237） |

这些表是逐层算伤害的根据，注释里保留了调参痕迹（"千咲延奏 +3 上限"）。可施加效应的角色列表在 damage/utils.py:114-129（光噪 [1407,1501,1502,1506,1507]、虚湮 [1508,1610]、聚爆 [1210,1211]、霜渐 [1108,1109,1110]、风蚀 [1406-1409]、电磁 [1309,1310]），并集 Abnormal_Role_Ids 供快速判断。配套工具函数处理"1313+5.97%"这种复合倍率串（parse_skill_multi，:194-203）。

modal.py（62 行）的模态系统目前只有一个角色用到（1109，frost/phantom 双模态），但接口设计留了余地：每个模态有三个字段——key（稳定标识，进排行数据和请求参数）、name（命令后缀）、match（在技能分支名里匹配的子串）。key 与 branchName 刻意解耦，注释的理由是防止官方改文案破坏已上传的排行数据。get_role_modal 取不到时回退默认模态，get_modal_options 供总排行命令列出可选模态。

## 16.4 网页添加 Token 的服务端细节

第 4.2 节讲了网页登录，add_token_web.py 的贴 token 流程是同一模式的又一实例，值得记录的是它的鉴权模型：网页本身无登录态，安全性依赖三件事——一次性 auth token 的 180 秒时效（TimedCache）、flow 字段绑定（POST /waves/add_token 校验会话 flow == "add_token"，防跨流程复用 auth，:219-220）、evict 机制保证同用户只有一个活会话。外置模式向远端 POST /waves/t/token 领会话号，轮询 /waves/t/get 拿结果，非 200 最多重试 3 次。

_token 落库后的成功判定沿用那个严格文案匹配（:46-47，"登录成功"/"记录成功"），避免上游"请求成功"占位误判——这个契约在第二章提过，这里是它的第三个消费方。

---

# 第十七章 端到端链路走查

前面各章是按子系统解剖的，这一章换一种读法：挑四条有代表性的完整链路，从用户按下发送键开始，一步步走到图片回到群里。所有步骤都对应前文的章节，走查的作用是把零件装配回机器。

## 17.1 链路一：wwmr（体力查询）

这是最短的主链路，也是国际服分流的样本。

1. **命令命中**。用户在群里发"wwmr"。gsuid_core 剥掉前缀，fullmatch 命中 wutheringwaves_stamina/__init__.py 的 SV("waves体力") 处理器（priority=5）。at_help 判断这条消息没有 at 他人，目标 uid 取发送者自己绑定的 UID。

2. **凭据检查**。draw_waves_stamina.py:92 调 `waves_api.check_self_login(uid, user_id, bot_id)`。这个函数先查数据库 WavesUser 拿 cookie（models.py:220），然后两连击：`login_log` 校验登录态（打 LOGIN_LOG_URL）、`refresh_data` 刷新账号数据。第二击如果返回 10903（bat 失效），走 `refresh_bat_token`（requests.py:147-162）重新调 get_request_token 换新 accessToken 并回写数据库；如果返回 999（维护中），不判死 cookie，静默用旧凭据继续；其他失败则 mark_cookie_invalid 把 status 标"无效"，上层回复"登录已过期，请重新登录"并附登录按钮。如果 UID ≥ 2 亿（is_net 为真），整条链在 :89-90 分流到 launcher_chain.fetch_launcher_panel，走 SDK 链，本步之后的库街区调用全部不发生。

3. **拉取数据**。`get_daily_info(uid, ck)` 进入 _waves_request（requests.py:1134）。inspect 栈帧取到 caller_func 是 get_daily_info，不在 NeedProxyFunc 默认列表里，直连（或按配置走本地代理）。GET_GAME_DATA_URL 返回结晶波片数量和恢复时间戳，pydantic 解析成 DailyData。响应如果带 geeTest 标记（没配代理时的常见遭遇），按 3.4 节的三级策略尝试换 IP 重发。

4. **落库**。查到的体力值 upsert 进 WavesStaminaRecord（draw_waves_stamina.py:134）——这一步是给外部伴随插件 roverreminder 的体力邮件推送供数。CK 失效的分支会同时 update_ck_valid(False)，推送插件据此暂停推送。

5. **渲染分流**。默认配置开了 UseHtmlRender：组装 Jinja2 上下文（体力值、倒计时、用户头像经 get_image_b64_with_cache 走烘焙缓存、背景按用户 stamina_bg_value 选取——可能是他 pin 的角色立绘），render_html("stamina_card.html") 先试 v2/ 同名模板（不在 _V2_CARD_TEMPLATES 集合则直接 V1），Playwright 从页面池取 page，domcontentloaded 加字体等待，量 container 截 JPEG。任何一步失败，日志 warning 后调用 `_render_stamina_card_pil`，PIL 从 texture2d 取底图手工绘制。

6. **发送与善后**。`bot.send_option(img, [WavesButton("刷新面板"), WavesButton("深塔数据"), WavesButton("冥海数据")])`。发送动作本身触发两条 hook：群消息 hook 校正 WavesSubscribe（这个群归本实例服务）、活跃度 hook 把用户和群写进内存缓冲（ANN_PUSH_GUARD 未置位、is_from_waves_plugin 通过）。60 秒后批量落库。用户点"刷新面板"按钮，core 的按钮回调把按钮映射成新的命令事件，进入链路二。

全程时间预算：凭据两连击约 300-800ms（两个上游 RTT），数据拉取 100-300ms，HTML 渲染 100-400ms（页面池热态），PIL 冷启动则要 1-2 秒。卡顿大头永远在上游 RTT，这也是作者把对冲竞速只给角色详情接口——体力接口不值得。

## 17.2 链路二：ww刷新面板（全量刷新）

最长也最重的链路，把第 3、5、7 章的零件全部串起来。

1. **冷却与并发**。命令命中 charinfo 的 `ww刷新面板/wwmb` 处理器（__init__.py:442-476）。先过 RefreshInterval 冷却检查（防止用户连点刷爆配额），然后 `refresh_char`（refresh_char_detail.py:430）开工。get_ck_result 拿凭据后，get_role_info 拉角色列表，RoleList 模型校验。

2. **并发拉取详情**。SemaphoreManager（默认并发 8，配置 RefreshCardConcurrency 或 UseGlobalSemaphore 共享全局量）控制，asyncio.gather 对每个角色调 get_role_detail_info。这里是全项目反爬等级最高的调用：NeedProxyFunc 默认含它，managed 代理下触发对冲竞速（3.5 节）——主出口 800ms 没回来就开第二出口赛跑，任一返回决定性响应（可用面板或明确失效）即收兵，Semaphore(4) 管着备用出口预算。响应过 RoleDetailData.model_validate，结构不完整算失败重试（换 SID 旋转出口）。这一步最容易触发 geeTest 和 270 风控，重试退避加抖动全在这里生效。

3. **清洗与落盘**。每个详情过 7.1 节的清洗（删武器描述、修命座标记、修套装名、清空壳声骸、下载共鸣模态图）。然后 save_card_info（:231）做新旧 diff：有变化的角色进 refresh_update 列表，char_state.record_refresh_batch 记录到 state.json，数据递归剥 URL 后 gzip 写 rawData.json；主角各形态合并写 rover.json；评分缓存增量写 charListData.json，跨档位（210/195/175）提升的角色记为 top_improver 待提示。

4. **评分管线**。get_waves_char_rank → _compute_one_char_rank（expression_ctx.py:93，可 pickle 供进程池并行）对每个角色：WuWaCalc 三段聚合 → get_calc_map 拿模板（评分 API 3 秒超时，普通部署必然超时落本地 calc.json）→ 逐声骸算分评级 → DamageRankRegister.find_class(char_id) 的函数算期望伤害（即循环伤害引擎：wuthering.gg 倍率加正则抽的命座规则加场景 buff，7.6 节）→ ScoreDetailRegister 算综合评分 → 产出 WavesCharRank。

5. **渲染**。数据齐了以后无条件先试 EchoMatrix HTML：adapter 把 RoleDetailData 压成 CardData dict（伤害绝对值没有真实来源就留空，不编造），build_html 占位符注入 JSON，页面级断网加字体路由拦截，等 window.__READY__，空壳探针检查数据节点（.arow/.ec 有内容且高度够），CDP captureScreenshot 1.5 倍出图。失败回 PIL 主体（2896 行的 draw_fixed_img 加逐块 paste，配色用 EchoMatrix design token 保证两版观感一致）。

6. **上传与通知**。图片发出后，后台任务把 WavesCharRank 转 rank dict push 进 QUEUE_SCORE_RANK（_upload_rank，:208-228），队列 worker POST 到排行服务（Bearer WavesToken），不阻塞下一条消息。B/C 级面板附带 char_state 生成的提升建议文本条；top_improver 用户收到档位跨越提示。

一次全量刷新的上游请求量：1 次角色列表加 N 次角色详情（N 是持有角色数，满编 40+），外加若干图片下载。用户等待时间通常在 5-20 秒，取决于详情接口的脾气——这正是对冲、缓存、并发控制三层机制存在的理由。

## 17.3 链路三：ww登录（网页短信登录）

1. **会话建立**。命令命中 login 模块（__init__.py:19-49，无参走网页流程）。get_url() 判断配置：没配 WavesLoginUrl，用 core 的 HOST/PORT 加探测的公网 IP，is_local=True。get_token() 生成 secrets token，TimedCache 写入 `{flow:"page", mobile:-1, code:-1, user_id}`——这个 cache 带 sqlite 落盘（url_cache.db），多 worker 也能读同一份。evict_user_login 先撤销该用户旧会话。发链接 `{base}/waves/i/{token}`（可配转发消息包裹、可经腾讯文档转短链防 QQ 拦截）。

2. **用户侧**。浏览器打开链接，FastAPI 端点（login.py:348-416）按 state.flow 分发渲染 page 登录页模板（支持用户自定义模板路径）。用户填手机号，点发送验证码——网页直接打库街区的验证码接口（不经过 bot），收到后填入提交，前端 POST /waves/login 写回 cache。

3. **bot 侧轮询**。page_login_local 每秒查 cache，180 秒上限（login.py:150-166）。拿到 mobile/code 后 code_login：正则校验大陆手机号加 6 位验证码，生成大写 UUID4 设备号，waves_api.login 打 sdkLogin。库洛对错误验证码返回"系统繁忙"占位文案，:304-311 专门拦下不透传。

4. **落库与回执**。add_cookie（deal.py:26-181）：token 同时查鸣潮和战双角色列表；每个鸣潮角色 get_request_token 取 bat，WavesUser update（status 清空、is_login 只升不降）、补 bat/did、WavesBind.insert_waves_uid 绑定并切当前 UID；战双角色走同构分支。汇总文案严格匹配"登录成功"。login_success_msg：查 WavesUserSdk.region 拼区服后缀（国际服账号在 KuroBBS 校验链里会被误判，:38-48 注释写明只发文本不渲染）；国服渲染刷新面板图加按钮组，链路到此汇入链路二的第 4 步之后。

5. **超时收尾**。180 秒没等到，会话过期（TimedCache TTL 180 秒兜底），提示重新发起。每次登录独占会话的代价是：同一用户重复发起会撤销旧链接，旧的网页提交会 404——这是防重放的特性而不是缺陷。

## 17.4 链路四：ww排轴（从发起到报告）

排轴链路横跨群聊和网页两个世界，走一遍完整的"编辑→保存→出报告"。

1. **发起**。用户发"ww排轴 今汐"。`_resolve_uid` 取 ev.user_id（注释里写明绝不用 ruser_id，防 at 劫持，10.3 节），校验该 uid 有面板数据（没面板就没法算伤害，先引导去刷新面板）。deliver_editor：本地模式 is_local=False 拒发（外置 URL 未启用 HTTPS 也不发），生成 30 分钟 Bearer 会话（SQLite TimedCache，token_urlsafe(24)），私聊直接发 `/waves/dps/{token}` 链接；群聊改成发无凭据页面链接加 6 位兑换码加"ww排轴确认 <码>"指引。

2. **兑换码确认**（群聊场景）。用户浏览器打开页面，POST /api/redeem 消费兑换码：TimedCache.transition 的 SQLite CAS 把状态 pending → awaiting_confirm，签发确认码 challenge，给浏览器种 HttpOnly Cookie（名字含会话 hash）。用户回群里发"ww排轴 确认 A3F9K2"，confirm_redeem 校验 user_id 加 bot_id 双匹配 → approved。浏览器轮询 /api/redeem/status，claim 时 approved → claimed 原子推进，幂等领取同一个编辑 token。攻击者即使拿到兑换码和确认码（都在群里可见），没有那个浏览器的 Cookie 也领不到 token。

3. **编辑**。网页加载编辑器（static/app.js，近 3000 行），GET /api/session 拉会话（token 的 character_ids 白名单决定能编辑谁，越权 403）。用户拖拽动作到时间轴、设参考线。AI 解析是可选捷径：输入框敲"EEE Q A 接重击"，POST 走 parse_rotation_text——text_parse 的规则解析器先跑，识别不了的部分 AI 兜底（pydantic_ai Agent，get_model_for_task("low")，20 秒超时失败静默降级），AI 只被允许输出意图四元组，数值永远由本地引擎算。

4. **保存与计算**。PUT /api/timeline 带 expected_updated_at：storage.py 校验磁盘 updatedAt 一致才写（不一致 409，前端提示刷新），双锁加临时文件原子写。POST /api/calculate：service 层从 rawData.json 取该角色面板，WuWaCalc 聚合出 DamageAttribute，动作目录把时间轴上每个动作映射到循环伤害引擎的单动作伤害（_calculate_action_value：模板值 × (倍率+命座 delta) + 固定值，统一公式），engine 按参考线切段求 DPS。队伍轴让每个成员用自己的动作目录独立计算再按段合并——队友的未知动作绝不伪造另一成员的 DPS。

5. **报告**。GET /api/report 触发 render_timeline_report：render_html 渲染 dps_report.html（走通用 Jinja2 加 Playwright 链路，不在 EchoMatrix 三模板之列），JPEG 返回。用户也可以发"ww排轴查 今汐"在群里直接出只读报告——chat_flow 状态机核对会话绑定（uid+user_id+bot_id+group_id），他人点击按钮直接拒绝。

这条链路是全项目工程最重的部分，也是测试密度最高的部分（26 个测试文件里排轴占一半）。把它放在最后走查有个用意：排轴把前面所有章的能力都用上了——凭据与面板（第 3、5、7 章）、渲染（第 8 章）、Web 路由与鉴权（第 2 章的 FastAPI 底座）、AI（第 11 章）、甚至排行服务的出场率数据（队伍候选兜底）。看懂这条链，整个项目的装配关系就通了。

## 17.5 链路五：ww今汐图鉴

最后补一条轻量链路，它的特点是"同源数据喂两个消费端"。

1. **解析**：`ww今汐图鉴` 命中 wiki 模块的 on_regex，角色名走 fuzzy_suggest_multi 并联搜（7.9 节）——用户打成"今昔"也能命中，图片前带"已按 今汐 匹配"提示条；
2. **组装上下文**：char_wiki_render.py 的 _get_base_context（:64-130）从本地 ascension 数据取满级面板、属性图标、突破材料（材料图懒下载，缺了给占位）。技能数据按固定 skillTreeId 顺序拼接，倍率表取 param 数组，`{N}` 占位符替换成内联图标（:305-321）；
3. **缓存命中判断**：缓存键 (char_id, render_type)，WIKI_CACHE_PATH/{char_id}_{type}.jpg 存在就直接读文件发出去——图鉴内容只在版本更新后变化，成品图缓存是安全的；
4. **渲染分流**：未命中缓存走标准 HTML（UseHtmlRender 开）加 PIL 回退（draw_char.py:103 按 query_type 分派 skill/chain/forte 三个 PIL 绘制器）。产出落缓存，下次秒回；
5. **攻略分支**：`ww今汐攻略` 不走渲染，guide.py 直接按攻略组目录找 `{角色名}.jpg`（9 个攻略组，群可排除某些），超 65535 像素缩放、逐级降质压到配置大小，显式 MessageSegment 列表发送（:201-226）——成品图直接转发，压缩是为了躲 QQ 的大图二压；
6. **AI 侧镜像**：同一个 MAP_DETAIL_PATH 数据源在 11.1 节被注册成 AI 知识点（ww_char_<cid>_profile/_skill）。于是"ww今汐图鉴"和"问 AI 今汐怎么玩"消费的是同一份结构化数据——一个渲染给人看，一个灌给模型读。数据单源、多端消费，这是整个 wiki 体系最值得记住的设计。

---

# 第十八章 二次开发指南

这一章面向想改代码或基于它做衍生项目的人。先把环境和依赖盘清楚，再走一遍"加一个新功能"的完整流程，最后是踩坑清单——里面每一条都对应仓库里的真实代码。

## 18.1 环境搭建

插件不能独立运行，前置是 gsuid_core（Python 3.10+）。推荐路径：

1. 安装 gsuid_core 并启动一次，生成 data 目录结构；
2. 把 XutheringWavesUID/ 整个目录放进 gsuid_core 的 plugins/ 下，重启 core。插件加载时会自动：跑 exec_list 迁移、auto_migrate 补列、下载全量资源（wutheringwaves_start 触发，镜像 ww1/ww2/ww3.loping151.top|.cn 测速选择）、注册伤害计算器和 AI 知识。首次启动资源下载量大（数 GB 级，含角色立绘、声骸图、攻略图），要耐心；
3. 装插件显式依赖：`pip install pypinyin rapidfuzz opencv-python`（pyproject.toml 声明的四项里 playwright 单独装）；
4. 渲染要出图必须二选一：装 playwright 加 Chromium（`playwright install chromium`，内存吃紧的机器用 PIL 模式，配置 UseHtmlRender=false），或配置 RemoteRenderUrl 指向外部渲染服务；
5. 数据库零配置（SQLite 自动建表），想换 PostgreSQL 看 gsuid_core 的 core_config。

验证装好的最快路径：群私聊机器人发"ww帮助"，出帮助图说明渲染通；发"wwmr"会提示未绑定；"ww登录"走一遍网页登录流程说明 FastAPI 路由和凭据落库都通。

## 18.2 加一个查询模块的最小完整示例

以"查询XX"这类标准功能为例，五个文件改动：

第一步，建目录 wutheringwaves_myfeature/，写 __init__.py：

```python
from gsuid_core.sv import SV
from gsuid_core.bot import Bot
from gsuid_core.models import Event
from gsuid_core.aps import scheduler

sv = SV("waves我的功能", priority=5)

@sv.on_fullmatch(["我的功能", "wmgn"])
async def my_feature(bot: Bot, ev: Event):
    uid = await WavesBind.get_uid_by_game(ev.user_id, ev.bot_id)
    if not uid:
        return await bot.send(error_reply(103))
    ck = await waves_api.get_ck_result(uid, ev.user_id, ev.bot_id)
    if not ck:
        return await bot.send(error_reply(102))
    data = await waves_api.get_some_data(uid, ck)
    img = await draw_my_card(data)
    await bot.send_option(img, [WavesButton("刷新面板")])
```

error_reply 来自 utils/error_reply.py（102 未登录、103 未绑定，文案自带前缀）；get_ck_result 是三级凭据策略链；WavesButton 自动带插件前缀。这十行就是全项目所有查询模块的骨架。

第二步，如果需要新上游接口：URL 常量加进 utils/api/api.py，业务方法加进 WavesApi（照抄 get_daily_info 的模式：get_base_header 加 get_used_headers 加表单加 _waves_request），响应模型加进 utils/api/model/。注意 _waves_request 用 inspect 栈帧取调用方函数名决定代理，新方法名如果需要代理，要加进 NeedProxyFunc 配置。

第三步，渲染。模板放 templates/（Jinja2），上下文里图片一律过 image_to_base64 或烘焙缓存；或直接 PIL（素材放模块自己的 texture2d/）。模块内加 draw_xxx_pil.py 做降级，分支写法照抄 draw_abyss_card.py:48-52。

第四步，帮助注册。help.json 加一条命令声明，帮助图才会出现。

第五步（可选），定时任务用 `@scheduler.scheduled_job(...)` 挂在模块里，周期任务记得加防重入锁和随机抖动。

## 18.3 加一个角色/武器的伤害注册

新角色出池后面板能查但伤害算不了（循环伤害引擎有 wuthering.gg 数据可临时顶），补全注册的步骤：

1. 在 utils/damage/register_char.py 加一个类，类名 `Char_<角色ID>`，继承 CharAbstract，实现 `_do_buff(self, attr, chain, reson_level)`。写法参考同类角色：命座效果按 `if chain >= N` 分层，调用 attr 的 add_/set_ 方法（新乘区名可以直接发明，__getattr__ 动态生成），效果文案作为 title/msg 参数传入（会显示在面板 buff 列表里）；
2. 需要队伍增益的角色在 do_buff 里用 attr.add_teammate(id) 标记（基类已处理防重复）；
3. 武器特效在 register_weapon.py 加 `Weapon_<武器ID>`，cast_attack/cast_skill 等钩子按动作触发，开头写 attr.char_damage 门控；数值用 self.param(i) 取谐振阶参数，表达式交给 calc_percent_expression；
4. 声骸在 register_echo.py 加 `Echo_<声骸ID>`，主动伤害实现 damage()，首位属性实现 do_equipment_first()；
5. 验证：utils/calc 和 rotation_damage 都要能跑通，跑 tests/test_damage_rules.py 和 test_rotation_damage_regression.py。本地权重表 local_weight_data.json 加该角色的 subProps/mainProps，评分才有依据。

调试技巧：DamageAttribute 的 effect 日志列表就是为调试准备的——把每个 buff 调用的 title/msg 打出来和游戏内描述逐条对照，差异一目了然。

## 18.4 加 AI 工具或知识

知识：在 wutheringwaves_ai_rag/__init__.py 的 register_all 里加注册函数，KnowledgePoint 带 id（ww_ 前缀保持命名空间）、title、content，往 ai_entity 里塞。注意 _clear_self_entries 按 id 前缀清理，前缀错旧数据清不掉。

工具：tools/ 下新文件，函数加 @ai_tools 装饰器。三个纪律：一是工具要幂等且快（AI 可能反复调用），内部数据用 _cache.py 的懒加载缓存并记得在 invalidate_caches 里清；二是涉及用户数据的照抄 user.py 的三件套（uid 归属校验、主人判断、格式校验）；三是返回文本里给 AI 写清下一步指引（参考 get_current_period_wuwa 返回"再调 search_wuwa_kb"的写法，工具间要能互相引导）。

## 18.5 踩坑清单

以下每条都有代码出处，二次开发前过一遍能省不少时间：

1. **技能等级是 0 基**。RoleDetailData.get_skill_level 返回 level-1（role.py:169），rotation_damage._safe_skill_level 独立实现了同语义。你写的新代码如果直接用 level 索引倍率数组，数值会整体错位一级，而且不报错；
2. **WavesUser.cookie 字段存三种东西**。国服存 KuroBBS token，国际服存 launcher auto_token，云登录存 SDK 信息。跨体系调用前必须 is_net 分流，国际服凭据拿去打 KuroBBS 接口会被 mark_cookie_invalid 误杀（login_succ.py:38-48 注释）；
3. **导入期固化的配置**。MAIN_URL（api.py:24）、RANK_MAIN_URL（wwapi.py:26）都在模块导入时求值，运行时改配置不生效，要重载插件；
4. **auto_migrate 只补列不改列**。改字段类型或删列要自己往 exec_list 写迁移（models.py:29-56），热重载场景 exec_list 不跑，改动要在 on_core_start 钩子里做兼容；
5. **评分 API 默认不可达**。DEFAULT_SCORING_API_URL 是作者内网地址（scoring_api.py:13），部署后评分走本地回退，每次多 3 秒超时。想消除等待：设环境变量 SCORING_API_URL 指向可达地址，或者接受 warn_once 的那一条告警；
6. **公共 CK 池默认开启**。用户 A 查询可能用到用户 B 的 token（get_waves_random_cookie），隐私敏感的部署必须开 WavesOnlySelfCk；
7. **错误文案不回显用户输入**。name_resolve 的铁律（docstring 写明防注入），新写的解析代码要沿用：要么回显已验证的规范名，要么用泛化文案；
8. **钩子是全局的**。Bot.send 的 Monkey Patch 影响所有插件的消息，新 hook 必须带 is_from_waves_plugin 过滤和 ANN_PUSH_GUARD 检查（主 __init__.py:100-157），否则污染其他插件的流量统计；
9. **别动主 __init__.py 的 import 顺序**。钩子安装、缓冲区创建、索引构建之间有顺序依赖，重排可能导致 None 引用；
10. **per-worker 一致性**。任何跨请求状态（会话、限流、兑换码）必须走 SQLite 持久化 TimedCache，纯内存版在多 worker 部署下行为不一致——排轴子系统的 auth.py 是标准参考实现；
11. **重量级任务的坑位**。批量推送用 Semaphore 限速加间隔 sleep，批量上传走 utils/queues，批量 IO 用 asyncio.to_thread——事件循环被阻塞的表现是"整个 bot 无响应"，排查时先看有没有同步 IO 直接跑在协程里；
12. **协议义务**。GPL-3.0 传染性适用，衍生项目需同协议开源并保留原项目署名（README 的开源声明节）。

## 18.6 读代码的建议路径

按依赖顺序读，不要按目录顺序读：utils/resource/RESOURCE_PATH.py（所有路径的唯一来源）→ utils/database/models.py（数据长什么样）→ wutheringwaves_stamina/draw_waves_stamina.py（最短的完整链路）→ utils/api/requests.py 的 _waves_request（请求层心脏）→ utils/calc/__init__.py 加 utils/damage/damage.py（计算核心，配合 damage/abstract.py）→ utils/rotation_damage.py（读 docstring 再读代码，设计哲学都在注释里）→ utils/render_utils.py 与 utils/echomatrix_html/render.py（渲染双轨）→ wutheringwaves_dps/（工程密度最高的一块）。每个阶段穿插跑对应模块的 tests，比干读快得多。

## 18.7 上手第一天的检查清单

部署完成后按顺序验证，每步通过再走下一步，出问题时定位范围最小：

1. `ww帮助` 出帮助图——验证插件加载、资源下载、渲染链（HTML 或 PIL）至少一条通；
2. `wwmr` 回体力图或"未绑定"——验证 API 请求层通（能连上库街区）；
3. `ww登录` 走完网页流程——验证 FastAPI 路由、登录页、凭据落库；完成后应自动收到面板刷新图；
4. `ww刷新面板`——验证并发拉取、清洗落盘、评分管线；注意首次评分会等 3 秒（评分 API 超时，附录 F）；
5. `ww<你练度最高的角色>排行`——验证本地聚合；配了 WavesToken 的话验证上传（rank_server 的 /local/status 看行数在涨）；
6. `ww订阅公告` 后等一个轮询周期——验证推送链路的活跃过滤和限速；
7. `ww排轴 <角色>` 走一遍网页编辑——验证 Web 子系统和 CAS 保存；
8. 如果部署了 AI Core：问一句"这期深塔怎么配队"——验证知识注册、常驻检索工具、Skill 触发。

每步对应的日志前缀（`[鸣潮·插件]` 等）在 13.7 节列过。八步全绿，这套系统在部署者的环境里就算完全立住了。

---

# 第十九章 总结

## 19.1 这是一个什么样的项目

技术上，这是一个把"游戏数据机器人"这个品类做到了相当深度的项目：8.5 万行 Python，覆盖请求对抗、数值计算、双轨渲染、Web 服务、AI 集成、独立排行服务六块。它最突出的三块工程积累：

**反爬对抗体系**。住宅代理池（SID 粘性、ContextVar 会话、两跳中继）、对冲竞速、验证码三级应对、按函数粒度的代理路由、指数退避加抖动、磁盘降级缓存——这一整套是在上游不欢迎第三方查询的环境下磨出来的，代码注释里全是实战痕迹。

**伤害计算的诚实性**。近 400 个手写 buff 类加数据驱动的新引擎并行，新引擎对没把握的规则显式标注 unresolved 而不是硬猜，效果日志把每个乘区摊开给用户看。"宁可少算不可错算"这个原则贯穿了 rotation_damage 的设计。

**部署环境的宽容度**。四代渲染并存、外置渲染服务、1c2g 可跑的 PIL 路径、malloc 调参、浏览器池——项目明确服务"配置参差不齐的自部署用户"这个群体，为此付出了每张卡两套实现的代价。

## 19.2 值得学的设计

几处我认为可以直接搬走的手法：auto_migrate 的"模型列对比实表列自动补列"（SQLModel 项目的热重载迁移方案）；TimedCache.transition 的 SQLite CAS 原语（任何需要"恰好一次"状态迁移的场景）；兑换码双通道确认（把两个互不相通的信任通道各分一半凭据）；空壳探针加回退（渲染类系统的可观测降级）；以及"未知 code 抓调用栈打日志"这种把诊断信息前置到错误发生点的习惯。

还有一类收获不在于具体手法，而在于态度：这个项目对"失败"的处理几乎从不简陋。缓存坏了回退明文，渲染失败回退 PIL，评分 API 挂了回退本地公式，AI 超时降级纯规则，存档损坏隔离而不是覆盖——每个组件都想过"我不工作的时候，别人怎么继续"。运营型项目真正难写的不是主路径，是这些回退路径。

## 19.3 不足与风险

- **双实现维护成本**：每张卡两套布局代码，V1/V2/EchoMatrix 四代并存，模板层的历史包袱会越来越重；
- **隐式契约多**：文案匹配、字段语义复用（cookie 存三种东西）、0 基技能等级两处独立实现，类型系统帮不上忙，重构风险集中在这些点上；
- **评分通道的"幽灵依赖"**：默认指向作者内网的评分 API，普通部署每次查询多 3 秒超时，双通道结构对社区用户反而是负担；
- **排行样本偏差**：持有率/出场率来自机器人用户上传，无去偏，统计口径的局限没有在任何用户可见的地方说明；
- **测试偏科**：排轴测试密、老模块裸奔，重构 charinfo 时没有安全网；
- **仓库卫生**：tmp 脚本、僵尸端点、注释掉的迁移代码、两套版本号并存。

## 19.4 结语

想基于这个项目改东西，按十八章的路径上手：先跑通资源下载，再读 stamina 模块（最短完整链路），改伤害计算前先读 rotation_damage.py 的 docstring，改渲染前先看 echomatrix_html/adapter.py 的铁律注释。配置改动记得 MAIN_URL 类导入期固化的要重载插件，改字段类型要自己写 exec_list 迁移。

最后说一句观感。这个项目的代码注释密度和质量明显高于同类开源项目，大量注释不是复述代码，而是记录决策理由和事故现场（为什么用 upsert、为什么抖动、哪次探针配错导致永远回退、哪个 at 查询差点变成越权漏洞）。读它的收获一半来自代码，一半来自这些注释里的经验教训。GPL-3.0 的开源声明写明了基于 Loping151/XutheringWavesUID 的二次开发，EchoMatrix 是展示品牌名——如果你要基于它再开发，同样的协议义务和署名礼节也适用于你。

## 19.5 架构模式清单

把全书出现过的设计手法按模式名归档，标上出处，作为收尾的索引：

| 模式 | 在本项目中的实例 |
|---|---|
| 注册表 | 七张伤害/评分注册表（damage/abstract.py），sys.modules 锚定防重 exec |
| 模板方法 | WeaponAbstract 的 cast_attack/cast_skill 钩子序列，子类只填钩子 |
| 策略双实现 | 每张卡片的 HTML 版与 PIL 版，配置开关加异常回退 |
| 对冲请求 | 角色详情接口的双出口竞速加抖动加信号量预算 |
| 乐观锁（CAS） | 排轴存档的 expected_updated_at/409；TimedCache.transition 的写事务 |
| 单飞 | SingleFlightLock 合并同 key 并发重操作 |
| Monkey Patch | Bot.send 钩子注入活跃度与实例校正 |
| 适配器 | echomatrix adapter（数据契约）、AFYG 像素→毫秒映射、launcher 字段归一 |
| 回退链 | CK 三级（自有→公共池→伪造 JWT）、渲染三级（外置→本地→PIL）、代理三级、AI 降级纯规则 |
| 快照与隔离 | 编辑器 tmp 双文件（current/original）、pending 审核区、损坏存档隔离 |
| 令牌桶/限流 | AI 限流库（per-caller 加全局预算加并发信号量）、编辑器 tarpit |
| 数据契约 | pydantic extra="forbid" 的双向强制、CardData 冻结结构、strict 文档校验 |
| 降级缓存 | CacheEverything 磁盘快照、烘焙缓存、成品图缓存（wiki） |
| 工厂单例 | waves_api = WavesApi() 全局共享会话池 |
| 条件表达式引擎 | expression_evaluator 的规则链选评分模板 |

这些模式没有一个是新发明，价值在于它们出现在对的位置：限流加在了 AI 这种有真实成本的调用上而不是普通查询，CAS 加在了多人编辑的存档上而不是一切写入，回退链的每一级都有明确的触发条件和日志。模式选用的判断力比模式本身更值得学。

## 19.6 如果重新设计

读完全部代码，有几处如果推倒重来会走不同路线的地方。这不是对作者的苛责——每一处现状都有当时的理由——而是给后来者的参照。

**凭据语义拆开**。WavesUser.cookie 一个字段装三种语义（KuroBBS token、launcher auto_token、云登录信息），靠 is_net 分流加注释维持正确性。重新设计会拆成 credential_type + 凭据表，类型系统把"国服凭据不能打国际服接口"变成编译期错误而不是运行时事故。bat/did 同理——launcher 凭据的三个字段散在两张表，是演化不是设计。

**渲染器抽象**。四代渲染并存意味着同一张卡最多四份布局代码。重新设计会把"卡片"定义为数据契约加布局描述，HTML 与 PIL 是布局的两个后端——EchoMatrix UI 的 schema.CardData 已经走在半路上（adapter 产出冻结契约），差的是让 HTML 模板也消费同一份契约。8.5 节的模块化 PIL 是对的方向，值得做完然后删掉旧路径。

**评分通道本地化**。默认配置指向不可达的内网评分 API，等于所有用户都在为作者的工作流付 3 秒税。重新设计会把标定结果（权重表、模板）作为版本化资源随插件分发，远程 API 只做增量更新——现在的双通道结构保留，但本地必须是"完整可用"而不是"降级可用"。

**结构化日志与指标**。13.7 节的不足：没有计数器、没有结构化字段。如果重做，请求成功率、缓存命中率、渲染耗时分布会在第一周就埋点——这个项目的优化史（对冲、页面池、烘焙缓存）证明作者靠实测数据做决策，那数据采集本身值得基础设施化。

**统一解析语法**。7.12 节的五套解析器各自为政。至少倍率表达式和武器 buff 表达式可以共用一个带类型的表达式 DSL（rotation_damage 的 P() 规范化已经是个好起点）。

最后保留一项不动的：活跃度缓冲、公告推送限速、请求退避抖动这些"不起眼的小防御"。它们是长期运营换来的肌肉记忆，重写时最容易被当垃圾清掉，清掉之后一个月内就会原样长回来。

---

# 附录

## 附录 A 目录速查

```
XutheringWavesUID-main/
├── XutheringWavesUID/            插件包本体（约 8.5 万行 Python）
│   ├── __init__.py               主入口：插件注册、钩子、活跃度缓冲
│   ├── version.py                3.6.0bNewBee
│   ├── utils/                    横向基础设施
│   │   ├── api/                  上游客户端（requests/api_sdk/wwapi/cliproxy/captcha/model）
│   │   ├── database/             9 张表 + 双轨迁移
│   │   ├── damage/               buff 注册器（register_char/weapon/echo）
│   │   ├── calc/                 WuWaCalc 面板聚合
│   │   ├── echomatrix_html/      面板 HTML 渲染器（adapter/render）
│   │   ├── echomatrix_ui/        面板 PIL v2（schema/blocks/render_card）
│   │   ├── map/                  静态数据与注册入口（damage/register.py）
│   │   ├── queues/               上传队列（4 条 Bearer 队列）
│   │   ├── cache.py              TimedCache（内存 LRU + SQLite 落盘 + CAS）
│   │   ├── scoring_api.py        评分 API 客户端（默认内网地址）
│   │   ├── rotation_damage.py    循环伤害模拟引擎
│   │   ├── refresh_char_detail.py 刷新链总入口
│   │   └── ...
│   ├── wutheringwaves_*/         33 个功能模块（目录即功能）
│   │   ├── charinfo/             角色面板（draw_char_card.py 2896 行）
│   │   ├── dps/                  排轴 Web 服务（FastAPI + AI 解析 + AFYG 导入）
│   │   ├── ai_rag/               AI 知识库/工具/Skill
│   │   └── ...（stamina/abyss/gachalog/ann/wiki/rank/...）
│   └── templates/                35 个 HTML 模板（v2/ echomatrix/ wiki/ ...）
├── rank_server/                  独立排行服务（FastAPI 单文件 + Docker）
├── tests/                        26 个测试（排轴为主 + 伤害回归 + 安全回归）
└── CHANGELOG.md                  2026-08 版本演进记录
```

## 附录 B 关键术语对照

| 术语 | 含义 |
|---|---|
| CK / cookie | 库街区登录 token， WavesUser.cookie 字段 |
| bat / b-at | accessToken，游戏数据接口的第二凭据，存 WavesUser.bat |
| did | 设备号，第三凭据，存 WavesUser.did |
| is_net | UID ≥ 2 亿判定国际服 |
| 声骸 / phantom / echo | 装备系统，五件套，4-3-3-1-1 cost 分布 |
| 合鸣 / sonata | 声骸套装效果 |
| 深塔 / abyss | 逆境深塔，42 天一期 |
| 海墟 / slash | 冥歌海墟 |
| 矩阵 / matrix | 全息矩阵 |
| 漂泊者 / rover | 主角，男女形态加多属性，SPECIAL_CHAR 特殊处理 |
| 模态 / modal | 守岸人的双形态分支，影响评分模板选择 |
| 43311 / 44111 | 声骸 cost 布局的简称 |
| AFYG / 椰果 | 第三方排轴分享平台 |
| wuthering.gg | 技能倍率数据来源站 |
| WH | 排行服务（wh.loping151.site 或自建 rank_server） |
| gsuid_core | 宿主机器人框架 |
| SV | gsuid_core 的服务声明单元 |
| top_improver | 跨评分档位提升的用户提示 |
| unresolved_rules | 循环伤害引擎中"没能确定应用"的规则清单 |

## 附录 C 报告所用分析材料的边界

本报告基于仓库静态源码阅读，未实际运行机器人或请求上游 API。行为描述（如重试次数、耗时数据）来自代码常量与注释中记录的实测值，个别注释数据可能滞后于当前代码。CHANGELOG 只覆盖 2026-08-02 之后的窗口，更早的演化靠代码化石（注释掉的迁移、僵尸端点）推断，已注明。涉及作者部署环境的细节（内网评分地址、镜像站、排行服务域名）如实引用自代码，仅供参考。

## 附录 D 配置项速查

config_default.py 的 77 个配置项按用途分组（★ 标注 secret 项）：

**公告与推送**：WavesAnnOpen（总开关）、WavesAnnBBSSub（库洛 BBS 博主订阅）、AnnMinuteCheck（轮询分钟数）、AnnActiveGroupDays（42 天活跃认定）。

**登录与凭据**：WavesLoginUrl ★（外置登录站）、WavesLoginUrlSelf、WavesTencentWord（腾讯文档转短链）、WavesQRLogin（二维码登录）、WavesLoginForward（转发消息包裹）、WavesOnlySelfCk（关闭公共 CK 池）、MaxBindNum（未登录绑定上限 2）、DelInvalidCookie（每日清理无效 CK）。

**排行**：RankUseToken（登录后排行总开关）、WavesRankUseTokenGroup / WavesRankNoLimitGroup（群级覆盖列表）、GachaRankMin（抽卡排行默认阈值）、WavesToken ★（排行上传凭据）、WavesRankBaseUrl ★（自建排行服务地址）、RankActiveFilterGroup（活跃过滤）。

**代理与验证码**：KuroUrlProxyUrl（上游镜像）、LocalProxyUrl（本地代理）、NeedProxyFunc（按函数走代理）、CaptchaProvider / CaptchaAppKey（过码器）、cliproxy 全家桶十一项：CliproxyEnable、GatewayHost、GatewayPort、Username、Password ★、Region、StickyMinutes、RequestTimeout、MaxAttempts、HedgeDelayMs、TransitProxyUrl。

**刷新与并发**：RefreshInterval / RefreshSingleCharInterval（冷却秒）、RefreshIntervalNotify / RefreshSingleCharIntervalNotify（冷却提示开关）、RefreshCardConcurrency（8）、GachaLogConcurrency（13）、GachaLogHedgeDelayMs（抽卡对冲延迟）、UseGlobalSemaphore、RefreshSingleCharBehavior（刷新后行为五选一）、AutoSendCharAfterRefresh、CharCardNum（面板展示角色数）、RoleListQuery。

**抽卡**：WavesGachaWebPage（网页版开关）。

**资源与缓存**：ResourceDownloadTime（每日下载时：分）、CacheDaysToKeep（45 天）、CacheEverything（磁盘降级缓存）、QQPicCache。

**渲染**：UseHtmlRender、RemoteRenderEnable / RemoteRenderUrl（外置渲染）、FontCssUrl ★。

**社区内容**：WavesGuide（攻略提供方多选，9 个攻略组）、WavesGuideMaxSize、WavesUploadAudit（上传转审核）、WavesUploadAuditKeepLocal（审核暂存本地）、WavesPanelEditPassword ★（编辑器密码）、WavesPanelEditGuestView（访客只读）。

**自更新**：QyAutoUpdate、QyUpdateProxy、QyUpdateGithubUser / QyUpdateGithubToken ★、QyUpdateBranch、QyUpdateOriginRemote / QyUpdateOriginMirrorUrl、QyUpdateUpstreamRemote / QyUpdateUpstreamUrl / QyUpdateUpstreamMirrorUrl、QyUpdateAutoPush。

**活跃治理与杂项**：ActiveUserDays（42）、HideUid（隐藏 UID）、AtCheck（at 他人查询）、EnableLocalization、HelpExtraModules（外部伴随模块清单）。

## 附录 E 上游接口清单

utils/api/api.py 定义了 44 个 URL 常量，按功能分组（域名统一走 MAIN_URL，国际服走对应域名）：

**登录与凭据**：LOGIN_URL（sdkLogin 短信登录）、LOGIN_LOG_URL（登录态校验）、REFRESH_URL（刷新账号数据）、KURO_ROLE_URL（库洛角色列表）、QUERY_USERID_URL、GACHA_LOG_URL / GACHA_NET_LOG_URL（抽卡流水，国服 .com / 国际服 .net）。

**账号数据**：GAME_DATA_URL（体力/日常）、BASE_DATA_URL（基础信息）、ROLE_LIST_URL（角色列表）、ROLE_DATA_URL、ROLE_DETAIL_URL（角色详情，反爬最重的接口）、CALABASH_DATA_URL（数据坞/声骸收集）、SKIN_DATA_URL（时装）、MOTOR_DATA_URL（驱动电机）、DATA_REVIEW_URL（数据回顾/月报）。

**玩法记录**：CHALLENGE_DATA_URL / CHALLENGE_INDEX_URL（挑战首页）、EXPLORE_DATA_URL（探索度）、TOWER_INDEX_URL / TOWER_DETAIL_URL（深塔）、SLASH_INDEX_URL / SLASH_DETAIL_URL（海墟）、MATRIX_INDEX_URL / MATRIX_DETAIL_URL（矩阵）、MORE_ACTIVITY_URL（声骸牌局等活动）。

**签到**：SIGNIN_URL（每日签到）、SIGNIN_TASK_LIST_URL（任务列表）、SIGNIN_SURFACE_URL（签到记录）。

**社区与 wiki**：ANN_LIST_URL / ANN_CONTENT_URL（公告）、HOME_WIKI_DETAIL_URL（wiki 首页，日历数据源）、WIKI_TREE_URL / WIKI_HOME_URL / WIKI_DETAIL_URL / WIKI_ENTRY_DETAIL_URL（图鉴树与条目）、CALCULATOR_REFRESH_DATA_URL（计算器）、PERIOD_LIST_URL / MONTH_LIST_URL / WEEK_LIST_URL / VERSION_LIST_URL（期数/月历/周历/版本列表）。

另有三类不在 api.py 常量表里的上游：国际服 SDK 四端点加 launcher 两端点（api_sdk.py 硬编码）、云鸣潮两步接口（cloud_api.py）、第三方服务（wuwatracker.com 两页、4399 兑换码 JSONP、椰果工坊、镜像站三组、排行服务）。接口层的一手信息只有 URL 和表单结构，全部靠抓包官方 App 和网页获得，这也是伪装头（iOS KuroGameBox UA 加 devCode）在每一类客户端里都不可省略的原因。

## 附录 F 部署与排障 FAQ

从代码里能确定的故障路径，整理成问答备查。

**首次启动卡住或很慢？**资源全量下载有几 GB（角色立绘、声骸、攻略图），镜像测速后才开始拉。看日志确认 wutheringwaves_resource 的进度；下载完成会自动 reload 模块。资源没下完之前大部分图鉴和面板功能会缺图。

**渲染出空白图或一直走 PIL？**两步排查：确认 playwright 加 chromium 装上了、UseHtmlRender 是否开启；若 HTML 路径反复失败，看日志有没有空壳探针触发的记录——echomatrix 渲染器检测到页面数据节点为空会主动回退 PIL（8.4 节），这不是故障而是降级保护，但持续触发说明模板和数据版本不匹配。

**每次评分都慢三秒？**评分 API 默认指向作者内网地址（scoring_api.py:13），连不上会等 3 秒超时再走本地公式。设环境变量 SCORING_API_URL 指向可达服务，或无视这条告警（warn_once 只报一次，功能不受影响）。

**公告不推送？**四个条件缺一不可：WavesAnnOpen 开启、群执行过"ww订阅公告"（仅群聊、pm=3）、群在 AnnActiveGroupDays（默认 42 天）内活跃过、机器人实例与群匹配（WavesSubscribe 校正）。另外推送串行限速每条间隔 3 秒，群多时滞后是正常的。

**体力邮件推送没有？**本插件只负责把体力值写进 WavesStaminaRecord 表，邮件推送在外部伴随插件 roverreminder 里（帮助文案的 HelpExtraModules 有说明）。装对应插件才有效果。

**内存一直涨？**Linux 上确认 malloc_tuning 生效（WAVES_MALLOC_TUNING=0 是关闭）；渲染内存由浏览器 1000 次使用或 1 小时空闲自动重启兜底；1c2g 机器直接关 HTML 渲染。

**查询提示登录已过期？**凭据被标记无效（220 码或登录态校验失败），重新"ww登录"即可。维护期间（code 999）插件不会误杀凭据，等维护结束自然恢复。国际服账号的凭据语义不同（4.6 节），不要拿国际服 token 手动贴进国服接口调试。

**改了配置不生效？**MAIN_URL、RANK_MAIN_URL 这类在模块导入时求值的配置（3.2、12.1 节）需要重载插件；其余 StringConfig 项多数即时生效。数据库加列类改动由 auto_migrate 在 on_core_start 时处理，热重载同样触发。

**国际服能查什么？**目前打通的是体力（launcher_chain 完整支持凭据续期），面板渲染国际服只回文本（login_succ.py:38-48 的原因），其余功能逐步支持中。is_net 的分界是 UID ≥ 2 亿。

## 附录 G 命令速查

按模块整理的常用命令（均需插件前缀 ww，部分有别名未列全）：

**账号与凭据**：`登录`（网页短信）、`登录 手机号,验证码`、`邮箱登录/国际服登录`、`抽卡登录/云登录`、`添加token <token>[,<did>]`、`获取token`、`删除token`、`刷新绑定`、`绑定/切换 <uid>`、`删除无效token`（主人）。

**面板**：`刷新面板/mb`、`角色面板 查询 <角色>`、`<角色>面板`、`<角色>伤害<N>`、`<角色>pk <角色>`、`<角色>换声骸`、`<角色>权重/qz`、`<角色>优化/提升`、`练度/ld`、`面板图上传/查看/删除/查重`、`设置面板图 <角色> <hash>`。

**日常与记录**：`每日/mr/体力/实时便笺`、`签到日历/签到记录`、`探索/ts`、`身份/皮肤/月报`、`库洛币`、`poker/牌局`。

**玩法**：`深塔/冥海/矩阵数据`（abyss 族）、`当期信息`（period）、`<角色>图鉴/技能/共鸣链/机制/介绍/专武`、`dps榜`、`<角色>套装备`、`深塔信息<N>/st`、`海墟信息`、`矩阵信息[N]`。

**抽卡**：`抽卡记录/gacha`、`导入抽卡链接 <url>`、`导入工坊/小黑盒抽卡记录`、`刷新/更新抽卡记录`、`导出/删除抽卡记录`、`抽卡页面`、`抽卡排行`（群内）。

**排行与统计**：`<角色>排行/评分排行`（群）、`<角色>声骸排行`、`<角色>总排行`（可带模态后缀）、`练度总排行`、`<角色>声骸总排行`、`练度排行`（可带 a/s/ss 筛选）、`角色持有率/占有率`、`深塔使用率/出场率`、`冥海/矩阵出场率`、`卡池倒计时`、`未复刻角色/武器统计`。

**信息与服务**：`公告`、`公告#<id>`、`订阅公告/退订公告`（群管理）、`日历/rl`、`别名/别名列表`、`<角色>别名`、`添加/删除 <角色>别名 <别名>`、`code/兑换码`、`帮助/help/bz`、`计算帮助`、`更新记录/log`、`更新/强制更新/同步上游`、`滚蛋+<序号>`（回滚，主人）。

**设置**：`设置 语言 <语种>`、`设置 体力背景 <角色/随机>`、`设置 隐藏uid on/off`、`设置面板图`、`设置群排行 1/2`（群管理）、`设置排除攻略 <提供方>`（群管理）、`设置抽卡条件 <数字>`（群管理）。

**排轴**：`排轴帮助`、`排轴 <角色>`、`排轴选 <sid> <序号>`、`排轴沿用`、`排轴搜索 <关键词>`、`排轴解析 <文本>`、`排轴 <A> <B> <C>`、`排轴队<A><B><C>`、`排轴查 <角色>`、`排轴队查 <A> <B> <C>`、`排轴确认 <码>`。

**管理**：`联系主人/取消联系主人`、`压缩数据`（主人）、`删除不活跃/清理不活跃`（群管理）、`开启/关闭自动更新`（主人）。

## 附录 H 数值常量速查

散落各处的关键常数，排障和调参时用得上：

| 常量 | 值 | 位置 |
|---|---|---|
| 国际服判定阈值 | UID ≥ 2 亿 | waves_api.is_net |
| 登录会话 TTL | 180 秒 | login.py TimedCache |
| 登录轮询上限 | 180 秒/每秒一次 | login.py:150 |
| 抽卡网页有效期 | 600 秒 | web_view.py:45 |
| 排轴编辑会话 TTL | 30 分钟 | auth.py:15 |
| 排轴 AI 限流 | 5 次/小时/人，总预算 300，并发 2 | ai_parse.py:54-58 |
| AI 解析超时 | 20 秒，retries=0 | ai_parse.py:524 |
| 面板刷新并发 | 8（RefreshCardConcurrency） | config_default |
| 抽卡拉取并发 | 13 | config_default |
| 对冲延迟 | 800ms ± 15% 抖动 | requests.py:1274 |
| 对冲备用出口预算 | Semaphore(4) | requests.py:103 |
| 代理重试上限 | 5（CliproxyMaxAttempts 封顶） | requests.py:1160 |
| launcher 1005 重试 | 0.5s×1.6 封顶 2s，最多 4 次 | api_sdk.py:331 |
| 活跃认定窗口 | 42 天（ActiveUserDays） | config_default |
| 缓存保留 | 45 天（CacheDaysToKeep） | config_default |
| 深塔周期 | 42 天 | period 推算锚点 |
| 抽卡硬保底 | 角色池 80 / 武器池 54 | merge_utils.py:6 |
| 排行分页 | 每页 20，最多 50 页 | pagination.py:6 |
| 练度总榜阈值 | total_phantom_score ≥ 175 | rank_server main.py:518 |
| 综合评分档位 | 125 sss / 115 ss / 105 s / 90 a / 72 b | score.py:152 |
| ORB 查重 | 特征 2000、报警 0.7、阻止 0.9、最小匹配 40 | card_utils.py:56-60 |
| 编辑器防爆破 | 10 分钟 5 次锁 15 分钟；tarpit 0.4s 起 | panel_editor auth.py |
| AFYG 响应上限 | 2 MiB，25 秒超时 | afyg_import.py:53 |
| 浏览器重启 | 1000 次使用或 1 小时空闲 | render_utils.py:56 |
| malloc_trim 周期 | 10 分钟 | malloc_tuning.py:52 |
| 活跃度落库周期 | 60 秒批量 | 主 __init__.py |
| 推送限速 | Semaphore(1) + 每条 3 秒 | ann __init__.py |
| 群按钮会话 | TTL 10 分钟、上限 3000 | chat_session.py:12 |

## 附录 I 生态对比

把本项目放进鸣潮工具生态里看，定位会更清楚（以下对比基于仓库内可证的引用关系和公开常识，主观判断已标注）。

**与 erzaozi/waves-plugin 的关系**：这是生态里另一个主流鸣潮插件（本项目评分权重表注明改自它并经授权，抽卡导入兼容它的导出格式）。两者定位相近，差异在工程取向：waves-plugin 面向开箱即用的轻量部署；本仓库（XutheringWavesUID/EchoMatrix 一系）在反爬对抗、渲染体系、排行服务、排轴、AI 集成上堆得更深，代价是复杂度高一个量级。格式兼容（而不是另起炉灶）是生态内健康竞争的样本。

**与 GenshinUID 传统的传承**：目录即模块、draw_xxx 加 draw_xxx_pil 双实现、Jinja2 模板渲染、texture2d 素材目录、CK/token 治理——这套骨架是 GenshinUID 时代定下的社区惯例，gsuid_core 把它框架化。本项目是惯例的忠实执行者加突破者：突破发生在渲染（EchoMatrix 的占位符注入加页面断网加空壳探针，超出社区平均水平）、Web 子系统（排轴的鉴权设计在同类里没见过对手）和 AI（知识/工具/Skill 三件套加自建常驻检索工具）三处。

**与官方工具的关系**：库洛官方 App 提供账号数据但没有开放 API，官方社区工具没有提供持有率、出场率、跨群排行、评分对比这类聚合视角。本项目的全部价值几乎都长在官方能力的空隙里——这也是它必须做反爬、必须自建排行服务、必须爬第三方站的根本原因：所有上游都是"借用"的。

**客观局限**（避免只说好话）：生态项目的通病它都有——上游一改版全链惊魂（抽卡接口、角色详情接口都经历过）、数据准确性依赖手工维护的常量表、新人上手曲线陡峭。而且它强依赖 gsuid_core 这个单一宿主，跨框架移植（pyproject description 里列举的那批框架）实际是历史叙述而非现期能力。
