import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-zygote']});
const failures=[];
let passed=0;
async function check(name,fn){try{await fn();passed++;console.log('PASS '+name);}catch(error){failures.push(name);console.log('FAIL '+name+': '+error.message);}}
try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
  // Publishing is always intercepted. These tests cannot write to GitHub.
  await context.route('https://api.github.com/**',route=>route.abort());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const ready=()=>page.waitForFunction(()=>document.querySelector('.page-title,.hero-title,.article-title'));
  const visit=async path=>{await page.goto(origin+path,{waitUntil:'networkidle'});await ready();};
  const nav=async name=>{await page.locator('[data-nav="'+name+'"]').click();await page.waitForFunction(expected=>document.body.dataset.page===expected,name);};
  const motion=async enabled=>{const paused=(await page.locator('#motion-toggle').getAttribute('aria-pressed'))==='true';if(paused===enabled)await page.locator('#motion-toggle').click();};
  await check('Homepage renders real WebGL, content, and local fonts',async()=>{
    await visit('/');await page.waitForFunction(()=>document.querySelector('#visual-world').dataset.renderer==='webgl');await page.evaluate(()=>document.fonts.ready);
    assert.ok((await page.locator('h1').textContent()).length>15);assert.equal(await page.locator('.hero-title .line').count(),2);assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('.transmission').count(),4);
    assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'true');
  });
  await check('Article search, categories, URL state, and empty-state recovery',async()=>{
    await nav('blog');const total=await page.locator('.transmission').count();assert.ok(total>=10);
    await page.locator('#archive-search').fill('Docker');assert.ok(await page.locator('.transmission').count()<total);assert.ok(new URL(page.url()).searchParams.has('q'));
    await page.locator('#archive-search').fill('no-such-signal-999');assert.equal(await page.locator('.transmission').count(),0);await page.locator('#reset-search').click();assert.equal(await page.locator('.transmission').count(),total);
    await page.locator('[data-category="音频"]').click();assert.equal(await page.locator('.transmission').count(),1);assert.equal(new URL(page.url()).searchParams.get('cat'),'音频');
  });
  await check('Project archive preserves all projects and filters accurately',async()=>{
    await nav('projects');assert.equal(await page.locator('.project-entry').count(),8);await page.locator('[data-project-filter="hw"]').click();assert.equal(await page.locator('.project-entry').count(),1);assert.match(await page.locator('.project-entry h2').textContent(),/Hi-Fi/);await page.locator('[data-project-filter="all"]').click();assert.equal(await page.locator('.project-entry').count(),8);
  });
  await check('About and contact retain biography, interests, timeline, and copy action',async()=>{
    await nav('about');assert.equal(await page.locator('.inventory-entry').count(),4);assert.equal(await page.locator('.timeline li').count(),5);assert.match(await page.locator('.about-memo').textContent(),/东方/);
    await nav('contact');assert.equal(await page.locator('.contact-channel').count(),3);await page.locator('[data-copy]').click();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('已复制'));
  });
  await check('Article deep links, diagrams, contents links, and code copying',async()=>{
    await visit('/post.html?slug=xw-echo-matrix-arch');assert.ok(await page.locator('.article-body h2').count()>3);assert.equal(await page.locator('.article-body svg').count(),1);assert.ok(await page.locator('#toc a').count()>3);
    await page.locator('#toc a').nth(1).click();assert.match(page.url(),/#sec-/);assert.ok(await page.locator('.post-nav a').count()>0);
    const codeSlug=await page.evaluate(()=>SITE.posts.find(p=>p.body.includes('<pre>')).slug);await visit('/post.html?slug='+encodeURIComponent(codeSlug));await page.locator('.copy-code').first().click();await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('代码已复制'));
  });
  await check('Unknown article offers a working route back',async()=>{
    await visit('/post.html?slug=does-not-exist');assert.match(await page.locator('h1').textContent(),/Lost in orbit/);await page.locator('#main a[href="blog.html"]').click();await page.waitForFunction(()=>document.body.dataset.page==='blog');
  });
  await check('Full markdown document loads locally with chapter navigation',async()=>{
    await visit('/doc.html');await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);assert.ok((await page.locator('#article-body').textContent()).length>20000);assert.equal(await page.locator('#article-body script').count(),0);
  });
  await check('Writer preview sanitizes active HTML and saves/restores a draft',async()=>{
    await visit('/write.html');await page.waitForFunction(()=>document.querySelector('#pv-body').textContent.length>0);
    await page.locator('#title').fill('A small discovery');await page.locator('#category').fill('随笔');await page.locator('#summary').fill('A typography and routing regression fixture.');
    await page.locator('#body').fill('## A heading\n\nSafe preview with `code` and ${literal}.\n\n<script>window.__previewExecuted=true</script>');
    await page.locator('#draft-save').click();await page.waitForFunction(()=>document.querySelector('#pv-body h2'));
    assert.equal(await page.locator('#pv-body script').count(),0);assert.equal(await page.evaluate(()=>window.__previewExecuted),undefined);
    assert.equal(await page.evaluate(()=>Object.hasOwn(JSON.parse(localStorage.getItem('aster-draft')),'token')),false);
    await nav('about');await nav('contact');await page.locator('footer a[href="write.html"]').click();await page.waitForFunction(()=>document.querySelector('#body')?.value.includes('Safe preview'));
    assert.equal(await page.locator('#title').inputValue(),'A small discovery');
  });
  await check('Publishing composes valid source and handles success with a mocked API only',async()=>{
    const source=await readFile(new URL('../assets/js/data.js',import.meta.url),'utf8');let writes=0;
    await page.route('https://api.github.com/repos/XIAOKU2300/XIAOKU2300.github.io/contents/assets/js/data.js*',async route=>{
      if(route.request().method()==='GET')return route.fulfill({json:{content:Buffer.from(source).toString('base64'),sha:'test-original-sha'}});
      assert.equal(route.request().method(),'PUT');const request=route.request().postDataJSON();const updated=Buffer.from(request.content,'base64').toString('utf8');new Script(updated);assert.ok(updated.includes('a-small-discovery'));assert.ok(updated.includes('xw-echo-matrix-arch'));assert.equal(request.sha,'test-original-sha');writes++;await route.fulfill({json:{commit:{sha:'1234567mockcommit'}}});
    });
    await page.locator('.writer-gate summary').click();await page.locator('#token').fill('test-only-not-a-real-credential');await page.locator('#publish').click();await page.waitForFunction(()=>document.querySelector('#write-log').textContent.includes('已发布'));
    assert.equal(writes,1);assert.equal(await page.evaluate(()=>localStorage.getItem('aster-draft')),null);await nav('about');assert.equal(await page.evaluate(()=>localStorage.getItem('aster-draft')),null);
  });
  await check('Browser back restores the reading position',async()=>{
    await nav('home');await page.locator('.transmission').first().scrollIntoViewIfNeeded();const position=await page.evaluate(()=>scrollY);await page.locator('.transmission').first().click();await page.waitForFunction(()=>document.body.dataset.page==='post');await page.goBack();await page.waitForFunction(()=>document.body.dataset.page==='home');assert.ok(Math.abs((await page.evaluate(()=>scrollY))-position)<8);
  });
  await check('All redesigned routes fit a phone viewport',async()=>{
    await page.setViewportSize({width:390,height:844});
    for(const path of ['/','/blog.html','/projects.html','/about.html','/contact.html','/post.html?slug=xw-echo-matrix-arch','/doc.html','/write.html']){
      await visit(path);if(path==='/doc.html')await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);
      const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));assert.ok(dimensions.scrollWidth<=dimensions.width,path+' overflows: '+JSON.stringify(dimensions));
    }
  });
  await check('Mobile navigation supports keyboard closure and keeps links usable',async()=>{
    await page.locator('#menu-toggle').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
    await page.locator('#menu-toggle').click();await page.locator('[data-nav="blog"]').click();await page.waitForFunction(()=>document.body.dataset.page==='blog');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');
  });
  await check('Interrupted motion navigation reaches the latest destination with one canvas',async()=>{
    await page.setViewportSize({width:1440,height:1000});await page.locator('#motion-toggle').click();await page.evaluate(()=>{document.querySelector('[data-nav="projects"]').click();document.querySelector('[data-nav="contact"]').click();});await page.waitForFunction(()=>document.body.dataset.page==='contact');assert.match(await page.locator('h1').textContent(),/quiet distance/);assert.equal(await page.locator('canvas').count(),1);await page.locator('#motion-toggle').click();
  });
  await check('Five sections select distinct geometric sculptures and correct captions',async()=>{
    const captions={home:'首页',blog:'文章',projects:'项目',about:'关于',contact:'联系'};
    for(const chapter of Object.keys(captions)){
      await nav(chapter);assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),chapter);assert.match(await page.locator('.sculpture-subtitle').textContent(),new RegExp(captions[chapter]));assert.equal(await page.locator('#visual-world').getAttribute('data-phase'),'settled');
    }
  });
  await check('A navigation animates the sculpture and interruptions settle at the latest section',async()=>{
    await motion(true);
    try{
      await page.evaluate(()=>{window.__morphPhases=[];const host=document.querySelector('#visual-world');window.__morphObserver=new MutationObserver(()=>window.__morphPhases.push(host.dataset.phase));window.__morphObserver.observe(host,{attributes:true,attributeFilter:['data-phase']});document.querySelector('[data-nav="projects"]').click();});
      await page.waitForFunction(()=>document.body.dataset.page==='projects'&&document.querySelector('#visual-world').dataset.phase==='settled');
      const phases=await page.evaluate(()=>window.__morphPhases);assert.ok(phases.includes('transforming'));assert.ok(phases.includes('settled'));
      await page.evaluate(()=>{document.querySelector('[data-nav="blog"]').click();document.querySelector('[data-nav="about"]').click();document.querySelector('[data-nav="home"]').click();});
      await page.waitForFunction(()=>document.body.dataset.page==='home'&&document.querySelector('#visual-world').dataset.phase==='settled');
      assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),'home');assert.equal(await page.locator('canvas').count(),1);
    }finally{await motion(false);await page.evaluate(()=>window.__morphObserver?.disconnect());}
  });
  await check('Twenty-four bilingual phrases rotate without repetition or clipped italics',async()=>{
    await motion(false);await page.evaluate(()=>sessionStorage.removeItem('aster-quote-deck'));await visit('/');await page.evaluate(()=>document.fonts.ready);
    const ids=new Set();
    for(let i=0;i<24;i++){
      const id=await page.locator('.hero-title').getAttribute('data-quote-id');assert.ok(!ids.has(id),'Repeated phrase '+id);ids.add(id);
      assert.ok((await page.locator('.hero-chinese').textContent()).length>5);
      const metrics=await page.locator('.hero-title').evaluate(title=>({width:title.clientWidth,ink:[...title.querySelectorAll('.quote-ink')].map(e=>e.offsetWidth),overflow:[...title.querySelectorAll('.line')].map(e=>getComputedStyle(e).overflowY)}));
      assert.ok(metrics.ink.every(width=>width<=metrics.width+1),'Headline exceeds available width');assert.ok(metrics.overflow.every(x=>x==='visible'),'Headline mask can clip italic glyphs');
      if(i<23)await page.locator('#quote-next').click();
    }
    const before=await page.locator('.hero-title').getAttribute('data-quote-id');await nav('blog');await nav('home');assert.notEqual(await page.locator('.hero-title').getAttribute('data-quote-id'),before);
  });
  await check('Every phrase fits narrow screens and a full chapter sculpture remains visible',async()=>{
    await motion(false);await page.setViewportSize({width:320,height:844});
    for(let i=0;i<24;i++){
      await page.locator('#quote-next').click();const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,ink:[...document.querySelectorAll('.quote-ink')].map(e=>e.getBoundingClientRect().right)}));
      assert.ok(metrics.scroll<=metrics.width,'Phrase causes horizontal overflow');assert.ok(metrics.ink.every(x=>x<=metrics.width-12),'Phrase extends into the edge');
    }
    await page.setViewportSize({width:390,height:844});await page.locator('#menu-toggle').click();await nav('projects');
    const box=await page.locator('.sculpture-caption').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);assert.ok(box.y>250&&box.y+box.height<844);
  });
  await check('No uncaught runtime errors',async()=>assert.deepEqual(errors,[]));
  console.log(JSON.stringify({passed,failed:failures.length}));
  if(failures.length)process.exitCode=1;
}finally{await browser.close();}
