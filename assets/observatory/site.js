(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean = html => DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
  const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const backArrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>';
  const allPosts = [...SITE.posts].sort((a,b) => b.date.localeCompare(a.date));
  const main = $('#main');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const readStore = key => { try{return localStorage.getItem(key);}catch{return null;} };
  const saveStore = (key,value) => {try{localStorage.setItem(key,value);return true;}catch{return false;} };
  const quotes=window.OBSERVATORY_QUOTES;
  let quoteDeck=[],lastQuote=-1,quoteChanging=false,quoteRevision=0;
  try{const saved=JSON.parse(sessionStorage.getItem('aster-quote-deck')||'null');if(saved&&Array.isArray(saved.deck)){quoteDeck=[...new Set(saved.deck)].filter(i=>Number.isInteger(i)&&quotes[i]);lastQuote=Number.isInteger(saved.last)?saved.last:-1;}}catch{}
  function nextQuote(){
    if(!quoteDeck.length){quoteDeck=quotes.map((_,i)=>i);for(let i=quoteDeck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[quoteDeck[i],quoteDeck[j]]=[quoteDeck[j],quoteDeck[i]];}if(quoteDeck.at(-1)===lastQuote)[quoteDeck[0],quoteDeck[quoteDeck.length-1]]=[quoteDeck.at(-1),quoteDeck[0]];}
    lastQuote=quoteDeck.pop();try{sessionStorage.setItem('aster-quote-deck',JSON.stringify({deck:quoteDeck,last:lastQuote}));}catch{}
    return {...quotes[lastQuote],id:lastQuote};
  }
  function fitHeadline(){
    const title=$('.hero-title');if(!title)return;
    title.style.fontSize='';const base=parseFloat(getComputedStyle(title).fontSize),available=title.clientWidth-6;
    const widest=Math.max(...$$('.quote-ink',title).map(ink=>ink.offsetWidth));
    if(widest>available)title.style.fontSize=(Math.floor(base*available/widest*10)/10)+'px';
  }
  function quoteMarkup(phrase){return `<span class="line"><span class="word"><span class="quote-ink">${esc(phrase.en[0])}</span></span></span> <span class="line"><span class="word"><span class="quote-ink"><em>${esc(phrase.en[1])}</em></span></span></span>`;}
  function cycleQuote(){
    if(quoteChanging)return;quoteChanging=true;const revision=++quoteRevision;const title=$('.hero-title');if(!title){quoteChanging=false;return;}
    const change=()=>{
      if(revision!==quoteRevision)return;if(!title.isConnected){quoteChanging=false;return;}
      const phrase=nextQuote();title.innerHTML=quoteMarkup(phrase);title.dataset.quoteId=phrase.id;$('.hero-chinese').textContent=phrase.zh;$('.quote-counter').textContent=String(phrase.id+1).padStart(2,'0')+' / '+quotes.length;fitHeadline();
      gsap.set('.hero-chinese',{clearProps:'transform,opacity,filter'});
      if(!motionPaused){gsap.fromTo('.hero-title .word',{y:24,opacity:0,filter:'blur(7px)',rotationX:-9},{y:0,opacity:1,filter:'blur(0px)',rotationX:0,duration:1,stagger:.09,ease:'power3.out',clearProps:'all',onComplete:()=>{if(revision===quoteRevision)quoteChanging=false;}});gsap.fromTo('.hero-chinese',{y:10,opacity:0},{y:0,opacity:1,duration:.8,delay:.18,clearProps:'all'});scene?.replay?.();}else quoteChanging=false;
    };
    if(motionPaused)change();else gsap.to(['.hero-title .word','.hero-chinese'],{y:-10,opacity:0,duration:.23,ease:'power2.in',onComplete:change});
  }
  let motionPaused = readStore('aster-motion') === 'off' || (readStore('aster-motion') === null && reduced.matches);
  let scene, animationContext, revealObserver, graphicObserver, tocObserver, pageCleanup, navigationId = 0, navigating = false;
  let currentPage = 'home', currentAddress = location.pathname+location.search, pageReady = Promise.resolve(), toastTimer, scrollQueued = false;
  const routes = { 'index.html':'home','blog.html':'blog','post.html':'post','projects.html':'projects','about.html':'about','contact.html':'contact','doc.html':'doc','write.html':'write' };
  const pagePath = () => location.pathname.split('/').pop() || 'index.html';
  const route = () => routes[pagePath()] || 'home';
  const postURL = post => `post.html?slug=${encodeURIComponent(post.slug)}`;
  const link = (href,label,cls='text-link') => `<a class="${cls}" href="${esc(href)}"><span>${label}</span>${arrow}</a>`;
  const tags = values => `<div class="work-tags">${values.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;
  function toast(text){clearTimeout(toastTimer);const el=$('#toast');el.textContent=text;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);}
  async function copy(text){
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(field);field.select();
      let result=false;try{result=document.execCommand('copy');}catch{}field.remove();return result;
    }
  }
  function pageHead(number,title,subtitle,caption=''){
    return `<header class="page-head"><div class="eyebrow intro-motion">${number} / ASTER'S OBSERVATORY</div><h1 class="page-title intro-motion" lang="en">${title}</h1><p class="page-description intro-motion">${subtitle}</p>${caption?`<p class="page-caption intro-motion">${caption}</p>`:''}</header>`;
  }
  function transmission(p,i){return `<a class="transmission reveal" href="${postURL(p)}"><div class="transmission-date"><span class="entry-no">${String(i+1).padStart(2,'0')}</span><time datetime="${esc(p.date)}">${esc(p.date.slice(5).replace('-','.'))}<span class="sr-year"> / ${esc(p.date.slice(0,4))}</span></time></div><div class="transmission-content"><h3>${esc(p.title)}</h3><div class="transmission-meta">${esc(p.category)} <span aria-hidden="true"> · </span> ${p.readTime} MIN READ</div></div><p class="transmission-summary">${esc(p.summary)}</p>${arrow}</a>`;}
  function homeGraphic(){return `<svg class="hero-graphic" viewBox="0 0 650 650" fill="none" aria-hidden="true"><g class="graphic-orbit"><ellipse class="orbit-guide" cx="345" cy="315" rx="253" ry="219" transform="rotate(-27 345 315)" stroke-dasharray="2 10"/><path class="guide draw-line" d="M56 312H118M556 312H620M344 31V84M344 541V592"/><path class="orbit-guide draw-line" d="M100 461C155 578 330 590 450 539"/><path class="guide draw-line" d="m432 114 45-48h92M153 427l-55 62H37"/><g class="graphic-cross"><path d="M83 255h10m-5-5v10M522 478h10m-5-5v10M261 68h8m-4-4v8"/></g><text class="graphic-type" x="493" y="57">A SLOW ORBIT</text><text class="graphic-type" x="42" y="510">FORM / 001</text><circle cx="477" cy="65" r="2" fill="#c7ae7c"/><circle cx="98" cy="489" r="2" fill="#a8c7be"/></g></svg>`;}
  function workGraphic(type){
    if(type==='sound')return `<svg viewBox="0 0 500 280" aria-hidden="true"><defs><linearGradient id="wave-fill" gradientUnits="userSpaceOnUse" x1="30" x2="470" y1="0" y2="0"><stop stop-color="#a8c7be" stop-opacity=".06"/><stop offset=".5" stop-color="#a8c7be" stop-opacity=".7"/><stop offset="1" stop-color="#c7ae7c" stop-opacity=".05"/></linearGradient></defs><g class="sound-lines">${Array.from({length:55},(_,i)=>{const h=12+Math.pow(Math.sin(i/54*Math.PI),2)*Math.abs(Math.sin(i*.49))*120;return `<path d="M${30+i*8.1} ${140-h/2}v${h}" stroke="url(#wave-fill)" stroke-width="1.4"/>`;}).join('')}</g><ellipse cx="250" cy="140" rx="127" ry="83" class="etch-gold" opacity=".35"/><path d="M30 216h440" class="etch" opacity=".2"/><text x="31" y="239">20 Hz</text><text x="423" y="239">20 kHz</text><text x="31" y="43">LISTEN CLOSELY.</text></svg>`;
    return `<svg viewBox="0 0 560 280" aria-hidden="true"><defs><linearGradient id="frame-fill" x1="0" x2="1" y2="1"><stop stop-color="#a8c7be" stop-opacity=".13"/><stop offset="1" stop-color="#a8c7be" stop-opacity="0"/></linearGradient></defs><g class="wire-frames">${[0,1,2,3,4].map(i=>`<path d="m${176+i*16} ${56+i*7} 132 24v118l-132-24z" fill="url(#frame-fill)" stroke="#a8c7be" stroke-opacity="${.2+i*.12}" stroke-width=".8"/>`).join('')}</g><path d="M43 177h104m231-48h138" class="etch" opacity=".35"/><circle cx="148" cy="177" r="3" fill="#c7ae7c"/><circle cx="378" cy="129" r="3" fill="#a8c7be"/><path d="M245 82v127M209 74v127" class="etch-gold" opacity=".5"/><text x="43" y="161">IMAGINATION</text><text x="418" y="151">IN / PROCESS</text><text x="43" y="251">WORKFLOW STUDY / 01</text></svg>`;
  }
  function renderHome(){
    const first=SITE.projects[0],phrase=nextQuote();
    main.innerHTML=`<div class="shell"><section class="home-hero" aria-label="Aster 的私人观测站"><div class="hero-intro"><p class="eyebrow hero-kicker intro-motion">A PERSONAL OBSERVATORY / EST. 2020</p><h1 class="hero-title" lang="en" data-quote-id="${phrase.id}">${quoteMarkup(phrase)}</h1><p class="hero-chinese intro-motion">${esc(phrase.zh)}</p><p class="hero-caption intro-motion">我是 Aster。写代码，听音乐，收藏一些微小的发现。</p>${link('about.html','Meet the observer <span lang="zh-CN"> / 关于我</span>','hero-link intro-motion')}<button class="quote-next intro-motion" id="quote-next" aria-label="换一句首页寄语"><span class="quote-counter">${String(phrase.id+1).padStart(2,'0')} / ${quotes.length}</span>换一句 <span aria-hidden="true">↻</span></button></div>${homeGraphic()}<p class="hero-art-label mono">BETWEEN SILENCE AND STARLIGHT</p><div class="hero-coordinate mono">AN OBJECT IN SLOW ORBIT</div><div class="hero-bottom"><a class="scroll-cue" href="#transmissions"><i aria-hidden="true"></i><span>SCROLL TO WANDER<br>向下，接收一些信号</span></a><div class="hero-note"><span>Systems, sound & small discoveries.</span>技术 · 声音 · 还有一点幻想</div></div><div class="hero-index"><span>01</span> — ∞</div></section><section class="section" id="transmissions"><div class="section-head reveal"><div><div class="section-number mono">01 / TRANSMISSIONS</div><h2 class="section-title">Notes from <em>here.</em></h2><p class="section-sub">最近写下的 · 一些探索留下的回声</p></div>${link('blog.html','全部文章 / All notes')}</div><div class="transmission-list">${allPosts.slice(0,4).map(transmission).join('')}</div></section><section class="section featured-work"><div class="section-head reveal"><div><div class="section-number mono">02 / IN ORBIT</div><h2 class="section-title">Made of <em>curiosity.</em></h2><p class="section-sub">把脑海里的东西，做成能运行的东西。</p></div>${link('projects.html','所有项目 / All projects')}</div><div class="work-grid"><article class="work reveal"><a class="work-art-link" href="${esc(first.link)}" target="_blank" rel="noopener noreferrer" aria-label="查看 WineFox Desktop 项目"><div class="work-art">${workGraphic('code')}</div><div class="work-topline"><span class="mono">01 / SOFTWARE & IMAGINATION</span>${arrow}</div><h3>WineFox Desktop</h3></a><p>${esc(first.desc)}</p>${tags(first.tags)}</article><article class="work reveal"><a class="work-art-link" href="blog.html?cat=${encodeURIComponent('音频')}"><div class="work-art">${workGraphic('sound')}</div><div class="work-topline"><span class="mono">02 / A SMALL LISTENING ROOM</span>${arrow}</div><h3>The art of listening.</h3></a><p>Hi-Fi、foobar2000、DAC。听见更多细节，也记下两年里交过的学费。</p>${tags(['Hi-Fi','Sound','Field notes'])}</article></div></section><section class="fragments"><div class="reveal"><div class="section-number mono">03 / THE OBSERVER</div><h2 class="fragment-heading">More than<br><em>one orbit.</em></h2><p class="fragment-intro">白天上学，晚上和周末折腾电脑。兴趣散落在不同方向，好奇心把它们连在一起。</p>${link('about.html','关于这个不太安分的人')}</div><div class="reveal"><div class="interest-line"><strong>Systems & code</strong><span>NAS / Docker / AI / Bot</span></div><div class="interest-line"><strong>Sound & silence</strong><span>Hi-Fi / 音乐 / 听觉</span></div><div class="interest-line"><strong>Other little worlds</strong><span>Minecraft / 鸣潮 / 东方</span></div><div class="touhou-note"><span class="seal" aria-hidden="true">幻想</span><p><span>A LITTLE TRACE OF GENSOKYO.</span><br>在理性之外，留一点位置给幻想乡。</p></div></div></section></div><div class="orbit-marquee" aria-hidden="true"><div class="orbit-marquee-inner">${Array(2).fill('<span>Stay curious.<i>✦</i>Keep making.<i>✦</i>Listen closely.<i>✦</i>Leave a little room for wonder.<i>✦</i></span>').join('')}</div></div>`;
  }
  function renderBlog(){
    const cats=['全部',...new Set(allPosts.map(p=>p.category))];
    const params=new URLSearchParams(location.search);let category=cats.includes(params.get('cat'))?params.get('cat'):'全部';let query=params.get('q')||'';
    main.innerHTML=`<div class="shell">${pageHead('01','Field <em>notes.</em>','写下来的，才不会丢。','教程、踩坑记录、声音与诗。这里收藏每一次好奇留下的痕迹。')}<section class="page-content"><div class="archive-toolbar intro-motion"><div class="filters" aria-label="文章分类">${cats.map(c=>`<button class="filter" data-category="${esc(c)}" aria-pressed="${c===category}">${esc(c)}<span>${c==='全部'?allPosts.length:allPosts.filter(p=>p.category===c).length}</span></button>`).join('')}</div><label class="search-field"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><input id="archive-search" type="search" value="${esc(query)}" placeholder="寻找一个词 / Search notes" aria-label="搜索文章"></label></div><p class="results-caption" id="results-count" role="status" aria-live="polite"></p><div class="archive-list" id="archive-list"></div></section></div>`;
    function update(sync=true){
      const q=query.trim().toLocaleLowerCase();const found=allPosts.filter(p=>(category==='全部'||p.category===category)&&(!q||[p.title,p.summary,p.category,...p.tags].join(' ').toLocaleLowerCase().includes(q)));
      $('#results-count').textContent=`${String(found.length).padStart(2,'0')} NOTES / ${category}${q?' · '+query:''}`;
      $('#archive-list').innerHTML=found.length?found.map(transmission).join(''):`<div class="empty-state"><h2>No signal, yet.</h2><p>没有找到对应的文章，试试别的词。</p><button class="text-link" id="reset-search">清除筛选 ${arrow}</button></div>`;
      $$('.filter').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===category)));
      if(sync){const u=new URL(location.href);if(category==='全部')u.searchParams.delete('cat');else u.searchParams.set('cat',category);if(query)u.searchParams.set('q',query);else u.searchParams.delete('q');history.replaceState(history.state,'',u);currentAddress=u.pathname+u.search;}
      if(!motionPaused&&sync)gsap.fromTo('#archive-list .transmission',{opacity:0,y:10},{opacity:1,y:0,duration:.4,stagger:.035,overwrite:true});
      $('#reset-search')?.addEventListener('click',()=>{category='全部';query='';$('#archive-search').value='';update();});
    }
    update(false);
    $$('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;update();}));
    $('#archive-search').addEventListener('input',e=>{query=e.target.value;update();});
  }
  function renderProjects(){
    const groups=[['all','全部'],['bot','软件与自动化'],['sys','服务与网络'],['hw','声音与硬件']];
    main.innerHTML=`<div class="shell">${pageHead('02','Things in <em>orbit.</em>','一些正在运转的小世界。','个人软件、服务、机器人和声音实验。它们是我把好奇变成现实的方式。')}<section class="page-content"><div class="filters project-filter-row intro-motion" aria-label="项目分类">${groups.map(([id,name])=>`<button class="filter" data-project-filter="${id}" aria-pressed="${id==='all'}">${name}</button>`).join('')}</div><div class="project-list" id="project-list"></div></section></div>`;
    const render=group=>{
      const rows=SITE.projects.map((p,i)=>({...p,index:i})).filter(p=>group==='all'||p.tone===group);
      $('#project-list').innerHTML=rows.map(p=>`<article class="project-entry reveal"><span class="project-no">${String(p.index+1).padStart(2,'0')} / ${esc(p.year)}</span><span class="project-status"><i class="status-dot" aria-hidden="true"></i>${esc(p.status)}</span><h2>${esc(p.name)}</h2><p>${esc(p.desc)}</p>${tags(p.tags)}${p.link?`<a class="text-link" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"><span>查看项目 / Explore</span>${arrow}</a>`:`<span class="mono muted" style="font-size:9px">A PERSONAL EXPLORATION</span>`}</article>`).join('');
    };
    render('all');$$('[data-project-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-project-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render(b.dataset.projectFilter);if(!motionPaused)gsap.from('#project-list .project-entry',{opacity:0,y:12,duration:.45,stagger:.04});}));
  }
  function renderAbout(){
    const a=SITE.about;
    main.innerHTML=`<div class="shell">${pageHead('03','A work<br>in <em>progress.</em>','一个人，很多个尚未完成的想法。')}<section class="page-content about-layout"><aside class="about-side intro-motion"><div class="about-monogram" aria-hidden="true">a.</div><h2>Aster</h2><p>${esc(SITE.profile.grade)} · ${esc(SITE.profile.location)}</p><p class="mono" style="font-size:9px">XIAOKU2300 / SINCE 2020</p>${link('contact.html','留个信号 / Say hello')}</aside><div><div class="bio">${a.bio.map(t=>`<p class="reveal">${clean(t)}</p>`).join('')}</div><div class="about-memo reveal"><span class="mono">A LITTLE TRACE OF GENSOKYO / 东方同好</span><p>${esc(a.memo.text)}</p></div><section class="about-section"><div class="section-number mono reveal">THE THINGS I WORK WITH</div><h2 class="reveal">My little toolkit.</h2><div class="inventory">${a.inventory.map(g=>`<div class="inventory-entry reveal"><h3>${esc(g.group)}</h3>${tags(g.items)}<p>${esc(g.note)}</p></div>`).join('')}</div></section><section class="about-section"><div class="section-number mono reveal">A FEW WAYPOINTS</div><h2 class="reveal">How I got here.</h2><ol class="timeline">${a.timeline.map(t=>`<li class="reveal"><time>${esc(t.year)}</time><p>${esc(t.text)}</p></li>`).join('')}</ol></section><p class="page-caption reveal" style="margin-top:35px">${esc(a.aside)}</p></div></section></div>`;
  }
  function contactChannels(){return SITE.socials.filter(s=>s.url||s.copy).map(s=>{const name=s.icon==='mail'?'Email':s.label==='QQ'?'QQ / Say hello':s.label;const label=s.copy||s.url.replace(/^mailto:/,'').replace('https://github.com/','github.com/');const inside=`<div><div class="channel-name">${esc(name)}</div><div class="channel-address">${esc(label)}${s.copy?' · 点击复制':''}</div></div>${arrow}`;return s.copy?`<button class="contact-channel" data-copy="${esc(s.copy)}">${inside}</button>`:`<a class="contact-channel" href="${esc(s.url)}"${s.url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}>${inside}</a>`;}).join('');}
  function renderContact(){main.innerHTML=`<div class="shell">${pageHead('04','Across the<br><em>quiet distance.</em>','有趣的相遇，往往从一句话开始。')}<section class="contact-layout page-content"><div class="intro-motion"><p class="contact-intro">聊聊技术，交换一首歌，<br>或者，只是打声招呼。</p><div class="contact-notes">${SITE.about.contactNotes.map(t=>`<p>${esc(t)}</p>`).join('')}</div><div class="touhou-note" style="margin-top:35px"><span class="seal" aria-hidden="true">来信</span><p><span>YOUR SIGNAL IS WELCOME.</span><br>这个小小的宇宙，始终留着一个入口。</p></div></div><div class="intro-motion">${contactChannels()}</div></section></div>`;}
  function articleMarkup(p,body){return `<div class="shell"><header class="article-header"><a class="article-back intro-motion" href="blog.html">${backArrow}全部文章 / Field notes</a><div class="eyebrow intro-motion">${esc(p.category)} / A FIELD NOTE</div><h1 class="article-title intro-motion">${esc(p.title)}</h1><div class="article-meta intro-motion"><time>${esc(p.date||'2026')}</time><span>${p.readTime?`${p.readTime} MIN READ`:'FULL DOCUMENT'}</span><span>BY ASTER</span></div>${p.summary?`<p class="article-summary intro-motion">${esc(p.summary)}</p>`:''}</header><div class="article-layout"><article class="article-body" id="article-body">${body}</article><nav class="toc" id="toc" aria-label="文章目录" hidden></nav></div><div class="article-end"><div class="tags">${(p.tags||[]).map(t=>`<a href="blog.html?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join('')}</div><div class="end-signature">Until the next discovery.</div><div id="post-navigation"></div></div></div>`;}
  function renderPost(){
    const slug=new URLSearchParams(location.search).get('slug');const index=allPosts.findIndex(p=>p.slug===slug);const p=allPosts[index];
    if(!p){main.innerHTML=`<div class="shell">${pageHead('404','Lost in <em>orbit.</em>','这条信号，暂时找不到了。','文章链接可能有误，也许能在目录里重新找到它。')}<div class="page-content">${link('blog.html','返回文章目录')}</div></div>`;document.title='文章未找到 · Aster';return;}
    document.title=`${p.title} · Aster`;setDescription(p.summary);main.innerHTML=articleMarkup(p,clean(p.body));
    const prev=allPosts[index-1],next=allPosts[index+1];
    $('#post-navigation').innerHTML=`<nav class="post-nav" aria-label="相邻文章">${prev?`<a href="${postURL(prev)}"><span class="mono">← NEWER NOTE / 上一篇</span><p>${esc(prev.title)}</p></a>`:'<span></span>'}${next?`<a href="${postURL(next)}"><span class="mono">OLDER NOTE / 下一篇 →</span><p>${esc(next.title)}</p></a>`:''}</nav>`;
    enhanceArticle();
  }
  async function renderDocument(id){
    const p={title:'XutheringWavesUID（EchoMatrix）技术架构全解',category:'源码剖析',summary:'325 个 Python 文件，约 8.5 万行代码。一次从接口到渲染、从数据到工程取舍的完整阅读。',tags:['XutheringWavesUID','EchoMatrix','架构分析']};
    main.innerHTML=articleMarkup(p,'<p class="muted" role="status">正在接收这份长长的记录…</p>');
    document.title=p.title+' · Aster';setDescription(p.summary);
    try{const [response,{marked}]=await Promise.all([fetch('assets/xw-arch.md'),import('./vendor/marked.js')]);if(!response.ok)throw new Error('fetch');const md=await response.text();if(id!==navigationId)return;$('#article-body').innerHTML=clean(marked.parse(md));enhanceArticle(true);}
    catch{if(id!==navigationId)return;$('#article-body').innerHTML='<div class="read-error"><h2>A quiet interruption.</h2><p>全文暂时未能加载，请稍后重试。</p><button class="text-link" id="retry-doc">重新加载 →</button></div>';$('#retry-doc').onclick=()=>render();}
  }
  function enhanceArticle(doc=false){
    const body=$('#article-body');if(!body)return;
    const headings=$$(doc?'h1,h2':'h2',body);headings.forEach((h,i)=>{if(!h.id)h.id=doc?'ch-'+(i+1):'sec-'+i;});
    const toc=$('#toc');let used=headings;if(doc){const chapter=headings.filter(h=>/^(第.+章|导读|附录)/.test(h.textContent.trim()));if(chapter.length)used=chapter;}
    if(used.length>=2){toc.hidden=false;toc.innerHTML=`<div class="toc-title">ON THIS PAGE / 目录</div>${used.map(h=>`<a href="#${encodeURIComponent(h.id)}">${esc(h.textContent)}</a>`).join('')}`;
      const update=()=>{let current=used[0];for(const h of used){if(h.getBoundingClientRect().top<=innerHeight*.3)current=h;}$$('a',toc).forEach(a=>a.classList.toggle('active',a.hash==='#'+encodeURIComponent(current.id)));};
      addEventListener('scroll',update,{passive:true});pageCleanup=()=>removeEventListener('scroll',update);update();
    }
    $$('pre',body).forEach(pre=>{const code=$('code',pre);if(!code)return;const b=document.createElement('button');b.className='copy-code';b.textContent='COPY / 复制';b.setAttribute('aria-label','复制代码');b.addEventListener('click',async()=>{const ok=await copy(code.textContent);toast(ok?'代码已复制':'复制失败，请选择代码手动复制');});pre.appendChild(b);});
    $$('a[href^="http"]',body).forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});
  }
  function writerMarkup(){return `<div class="shell">${pageHead('05','Before it<br>becomes a <em>signal.</em>','把今天的发现，留给以后的自己。')}<section class="page-content"><details class="writer-gate"><summary>发布设置 / Publishing settings</summary><label>GitHub fine-grained token<input id="token" type="password" autocomplete="off" placeholder="仅授权本仓库 Contents: Read & Write"></label><div class="write-actions"><button class="action-button" id="token-save">记住在这台电脑</button><button class="action-button" id="token-forget">忘掉</button><span class="write-log" id="gate-log" role="status"></span></div><p>Token 仅在你主动选择记住时保存在本机浏览器，用于向本仓库发布文章。不填写也可以写作、保存草稿和复制文章片段。</p></details><div class="writer-grid"><form class="writer-form" id="form" autocomplete="off"><div class="write-row"><label>标题<input id="title" required placeholder="今天，又发现了什么？"></label><label>网址标识 / Slug<input id="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="a-small-discovery"></label></div><div class="write-row3"><label>分类<input id="category" list="cats" required><datalist id="cats">${[...new Set(allPosts.map(p=>p.category))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist></label><label>日期<input id="date" type="date" required></label><label>阅读分钟<input id="readTime" type="number" min="1" max="999" placeholder="自动"></label></div><label>标签 / 用逗号分隔<input id="tags" placeholder="Docker, NAS"></label><label>摘要<textarea id="summary" placeholder="让人想继续读下去的一两句话。"></textarea></label><label for="body">正文</label><div class="fmt" role="group" aria-label="正文格式"><button type="button" class="on" data-fmt="md" aria-pressed="true">Markdown</button><button type="button" data-fmt="html" aria-pressed="false">HTML</button></div><textarea id="body" aria-label="文章正文" placeholder="## 起因&#10;&#10;那天晚上……"></textarea><div class="write-actions"><button class="action-button primary" type="submit" id="publish">发布到 GitHub</button><button class="action-button" type="button" id="draft-save">保存草稿</button><button class="action-button" type="button" id="copy-snippet">复制文章片段</button></div><p class="write-log" id="write-log" role="status" style="margin-top:15px"></p></form><article class="writer-preview"><div class="preview-label">LIVE PREVIEW / 你的文字在这里成形</div><span class="eyebrow" id="pv-cat">分类</span><h2 id="pv-title">尚未命名的发现</h2><div class="article-meta"><span id="pv-date"></span><span id="pv-read"></span></div><div class="article-body" id="pv-body"></div></article></div></section></div>`;}
  async function renderWriter(id){
    main.innerHTML=writerMarkup();
    try{const {initWriter}=await import('./writer.js');if(id!==navigationId)return;pageCleanup=initWriter({SITE,copy,clean,readStore,saveStore});}
    catch{if(id!==navigationId)return;$('#write-log').textContent='写作工具暂时未能加载，请刷新后重试。';$('#publish').disabled=true;}
  }
  function footer(){
    $('#site-footer').innerHTML=`<div class="shell"><div class="footer-main"><div><a class="footer-invitation" href="contact.html">Leave a <em>signal.</em>${arrow}</a><p class="footer-quote">宇宙很大，很高兴在这里遇见你。</p></div><div class="footer-socials"><a href="https://github.com/XIAOKU2300" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href="mailto:${esc(SITE.profile.email)}">EMAIL ↗</a><a href="blog.html">FIELD NOTES ↗</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ASTER · A PERSONAL OBSERVATORY</span><span class="coordinate">STAY CURIOUS. KEEP WANDERING.</span><span><a href="write.html">写作室</a><a href="gov.html">另一条世界线 ↗</a></span></div></div>`;
  }
  function setDescription(text){$('meta[name="description"]')?.setAttribute('content',text);}
  function animatePage(){
    if(motionPaused)return;
    animationContext=gsap.context(()=>{
      gsap.from('.intro-motion',{y:18,opacity:0,duration:.8,stagger:.075,ease:'power3.out',clearProps:'transform,opacity'});
      if(currentPage==='home'){
        gsap.from('.hero-title .word',{y:30,opacity:0,filter:'blur(8px)',rotationX:-10,transformPerspective:900,duration:1.15,stagger:.13,delay:.12,ease:'power3.out',clearProps:'transform,opacity,filter'});
        gsap.from('.hero-graphic',{opacity:0,scale:.94,duration:1.6,ease:'power2.out'});
        $$('.draw-line').forEach((p,i)=>{const length=p.getTotalLength();gsap.fromTo(p,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:1.7,delay:.2+i*.09,ease:'power2.inOut'});});
        gsap.to('.graphic-orbit',{rotation:3,transformOrigin:'50% 50%',duration:9,ease:'sine.inOut',repeat:-1,yoyo:true});
      }
      const artTimelines=new Map();
      $$('.work-art',main).forEach(art=>{
        const timeline=gsap.timeline({paused:true});
        if($('.sound-lines',art))timeline.to($$('.sound-lines path',art),{scaleY:.45,transformOrigin:'50% 50%',duration:i=>1.4+(i%7)*.21,stagger:.025,repeat:-1,yoyo:true,ease:'sine.inOut'});
        else timeline.to($$('.wire-frames path',art),{y:-9,opacity:.55,duration:3.8,stagger:.18,repeat:-1,yoyo:true,ease:'sine.inOut'});
        artTimelines.set(art,timeline);
      });
      graphicObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{const timeline=artTimelines.get(entry.target);if(entry.isIntersecting)timeline?.play();else timeline?.pause();}),{threshold:.1});
      artTimelines.forEach((_,art)=>graphicObserver.observe(art));
    },main);
    revealObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){gsap.fromTo(e.target,{y:22,opacity:0},{y:0,opacity:1,duration:.8,ease:'power3.out',clearProps:'transform,opacity'});revealObserver.unobserve(e.target);}}},{rootMargin:'0px 0px -25px 0px',threshold:.04});
    $$('.reveal',main).forEach(el=>revealObserver.observe(el));
  }
  function updateMotion(){
    document.documentElement.classList.toggle('motion-paused',motionPaused);
    const b=$('#motion-toggle');b.setAttribute('aria-pressed',String(motionPaused));b.setAttribute('aria-label',motionPaused?'开启动效':'暂停动效');$('#motion-label').textContent=motionPaused?'MOTION OFF':'MOTION ON';
    scene?.setPaused(motionPaused);
    animationContext?.revert();animationContext=null;revealObserver?.disconnect();graphicObserver?.disconnect();
    gsap.set('.reveal',{clearProps:'transform,opacity'});
    if(!motionPaused)animatePage();
  }
  function setMenu(open){
    document.documentElement.classList.toggle('menu-open',open);
    const button=$('#menu-toggle');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'关闭导航菜单':'打开导航菜单');
    main.inert=open;$('#site-footer').inert=open;$('#back-top').inert=open;
    if(open)$('#navigation a')?.focus({preventScroll:true});
  }
  function closeMenu(){setMenu(false);}
  function savePosition(){history.replaceState({...history.state,observatory:true,scrollY},'',location.href);}
  function restoreHash(focus=false){
    if(!location.hash)return;let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const target=document.getElementById(id);if(!target)return;
    target.scrollIntoView({behavior:'instant'});
    if(focus){if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  }
  function render({focus=false,scrollTop=true,restoreY}={}){
    const id=++navigationId;animationContext?.revert();animationContext=null;revealObserver?.disconnect();graphicObserver?.disconnect();tocObserver?.disconnect();pageCleanup?.();pageCleanup=null;
    currentPage=route();currentAddress=location.pathname+location.search;document.body.dataset.page=currentPage;
    $$('[data-nav]').forEach(a=>{const active=a.dataset.nav===currentPage||(currentPage==='post'||currentPage==='doc')&&a.dataset.nav==='blog';a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const titles={home:'Aster · A quiet kind of infinity',blog:'文章 · Field notes — Aster',projects:'项目 · Things in orbit — Aster',about:'关于 · The observer — Aster',contact:'联系 · Leave a signal — Aster',write:'写作室 · Aster'};
    document.title=titles[currentPage]||'Aster';setDescription(SITE.profile.intro);
    let pending;
    if(currentPage==='home')renderHome();else if(currentPage==='blog')renderBlog();else if(currentPage==='projects')renderProjects();else if(currentPage==='about')renderAbout();else if(currentPage==='contact')renderContact();else if(currentPage==='post')renderPost();else if(currentPage==='doc')pending=renderDocument(id);else if(currentPage==='write')pending=renderWriter(id);
    quoteRevision++;quoteChanging=false;if(currentPage==='home'){fitHeadline();document.fonts?.ready.then(fitHeadline);$('#quote-next').addEventListener('click',cycleQuote);}scene?.setPage(currentPage);closeMenu();if(scrollTop)window.scrollTo({top:0,behavior:'instant'});animatePage();onScroll();
    main.setAttribute('tabindex','-1');if(focus)main.focus({preventScroll:true});
    if(!pending&&Number.isFinite(restoreY))window.scrollTo({top:restoreY,behavior:'instant'});
    // Restore only after asynchronous content and fonts establish the document height.
    pageReady=Promise.resolve(pending).then(()=>document.fonts?.ready).then(()=>{
      if(id!==navigationId)return;
      if(Number.isFinite(restoreY))window.scrollTo({top:restoreY,behavior:'instant'});else restoreHash();
      onScroll();
    });
    return pageReady;
  }
  async function navigate(url,pop=false){
    closeMenu();
    if(pop&&url.pathname+url.search===currentAddress){
      const restoreY=history.state?.scrollY;await pageReady;if(location.href!==url.href)return;
      if(Number.isFinite(restoreY))window.scrollTo({top:restoreY,behavior:'instant'});else restoreHash();
      onScroll();return;
    }
    // A second navigation replaces the pending one instead of queueing old animations.
    const ticket=++navigationId;navigating=true;const destination=routes[url.pathname.split('/').pop()||'index.html'];scene?.setPage(destination,{replay:true});
    const restoreY=pop?history.state?.scrollY:undefined;
    if(!pop)savePosition();
    gsap.killTweensOf(main);gsap.killTweensOf('.transition-rule');
    if(!motionPaused){gsap.to('.transition-rule',{opacity:.5,scaleY:1,duration:.25,ease:'power2.out'});await new Promise(resolve=>gsap.to(main,{opacity:0,y:-7,duration:.18,ease:'power1.in',onComplete:resolve,onInterrupt:resolve}));}
    if(ticket!==navigationId)return;
    if(!pop)history.pushState({observatory:true,scrollY:0},'',url);
    gsap.set(main,{clearProps:'transform,opacity'});const ready=render({focus:true,scrollTop:!pop,restoreY});const renderedId=navigationId;
    if(!motionPaused)gsap.to('.transition-rule',{opacity:0,scaleY:.3,duration:.5,ease:'power2.out'});
    await ready;if(renderedId===navigationId)navigating=false;
  }
  function onScroll(){if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;document.documentElement.classList.toggle('scrolled',scrollY>25);document.documentElement.classList.toggle('scrolled-far',scrollY>600);const max=document.documentElement.scrollHeight-innerHeight;const read=currentPage==='post'||currentPage==='doc';$('#reading-progress').style.transform=`scaleX(${read&&max>0?Math.min(scrollY/max,1):0})`;const head=$('.page-head');const fade=currentPage==='home'?Math.max(.06,1-scrollY/(innerHeight*.9)):(read||currentPage==='write')?.045:Math.max(.035,1-scrollY/Math.max(300,(head?.offsetHeight||innerHeight)*.85));$('#visual-world').style.opacity=String(fade);});}
  document.addEventListener('click',async e=>{
    const copyButton=e.target.closest('[data-copy]');if(copyButton){toast(await copy(copyButton.dataset.copy)?'已复制，期待你的来信。':'复制失败，请手动复制。');return;}
    const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank'||a.hasAttribute('download'))return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin)return;
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash){
      e.preventDefault();closeMenu();savePosition();if(url.href!==location.href)history.pushState({observatory:true},'',url);
      restoreHash(true);savePosition();return;
    }
    const name=url.pathname.split('/').pop()||'index.html';
    if(!routes[name]||url.pathname.substring(0,url.pathname.lastIndexOf('/'))!==location.pathname.substring(0,location.pathname.lastIndexOf('/')))return;
    e.preventDefault();navigate(url);
  });
  $('#menu-toggle').addEventListener('click',()=>setMenu(!document.documentElement.classList.contains('menu-open')));
  $('#motion-toggle').addEventListener('click',()=>{motionPaused=!motionPaused;saveStore('aster-motion',motionPaused?'off':'on');updateMotion();});
  reduced.addEventListener('change',()=>{if(readStore('aster-motion')===null){motionPaused=reduced.matches;updateMotion();}});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.documentElement.classList.contains('menu-open')){closeMenu();$('#menu-toggle').focus({preventScroll:true});}
    if(e.key==='Tab'&&document.documentElement.classList.contains('menu-open')){const list=$$('a,button',$('#site-header')).filter(el=>el.getClientRects().length);const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
  addEventListener('popstate',()=>navigate(new URL(location.href),true));
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',()=>{if(innerWidth>760)closeMenu();fitHeadline();onScroll();},{passive:true});
  addEventListener('pageshow',()=>{gsap.set(main,{clearProps:'transform,opacity'});navigating=false;});
  $('#back-top').addEventListener('click',()=>scrollTo({top:0,behavior:motionPaused?'instant':'smooth'}));
  history.scrollRestoration='manual';footer();render();updateMotion();
  import('./scene.bundle.js?v=2').then(({createObservatory})=>{scene=createObservatory($('#visual-world'),{paused:motionPaused});scene.setPage(currentPage,{replay:!motionPaused});}).catch(()=>{$('#visual-world').dataset.renderer='fallback';});
})();
