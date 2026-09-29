import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-zygote']});
const source=await readFile(new URL('../assets/js/data.js',import.meta.url),'utf8');
const failures=[];
let passed=0;
const frame=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function check(name,run){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  // No test can publish an article or contact an external service.
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  await context.route('**/scene.bundle.js*',route=>route.abort());
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{await run(page);assert.deepEqual(errors,[]);passed++;console.log('PASS '+name);}
  catch(error){failures.push(name);console.log('FAIL '+name+': '+error.message);}
  finally{await context.close();}
}
const visit=async(page,path)=>{await page.goto(origin+path);await page.locator('.hero-title,.page-title,.article-title').waitFor();};
const writerReady=page=>page.waitForFunction(()=>document.querySelector('#pv-body')?.textContent.length>0);
try{
  await check('Contents links and hash history preserve the current article',async page=>{
    await visit(page,'/post.html?slug=xw-echo-matrix-arch');
    await page.evaluate(()=>window.__article=document.querySelector('#article-body'));
    await page.locator('#toc a').nth(2).click();await frame(page);
    assert.equal(await page.evaluate(()=>window.__article===document.querySelector('#article-body')),true);
    await page.goBack();await frame(page);
    assert.equal(await page.evaluate(()=>window.__article===document.querySelector('#article-body')),true);
    assert.equal(new URL(page.url()).hash,'');
  });
  await check('Back to a delayed document restores the actual reading position',async page=>{
    await visit(page,'/doc.html');await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>scrollTo({top:6000,behavior:'instant'}));const position=await page.evaluate(()=>scrollY);
    await page.locator('[data-nav="contact"]').click();await page.waitForFunction(()=>document.body.dataset.page==='contact');
    let release;const pending=new Promise(resolve=>release=resolve);
    await page.route('**/assets/xw-arch.md',async route=>{await pending;await route.continue();});
    try{
      await page.goBack();await page.waitForFunction(()=>document.body.dataset.page==='doc');release();
      await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);await frame(page);
      assert.ok(Math.abs((await page.evaluate(()=>scrollY))-position)<8,'Document reading position was lost');
    }finally{release();}
  });
  await check('Hash-addressed document restores later reading position on back',async page=>{
    await visit(page,'/doc.html');await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);
    await page.locator('#toc a').nth(2).click();await frame(page);
    await page.evaluate(()=>scrollTo({top:10000,behavior:'instant'}));const position=await page.evaluate(()=>scrollY);
    await page.locator('[data-nav="about"]').click();await page.waitForFunction(()=>document.body.dataset.page==='about');
    await page.goBack();await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);await frame(page);
    assert.ok(Math.abs((await page.evaluate(()=>scrollY))-position)<8,'Hash overrode the saved reading position');
  });
  await check('Leaving the page flushes the latest draft before the debounce',async page=>{
    await visit(page,'/write.html');await writerReady(page);
    const saved=await page.evaluate(()=>{
      const body=document.querySelector('#body');body.value='The last keystroke must survive.';
      body.dispatchEvent(new Event('input',{bubbles:true}));window.dispatchEvent(new Event('pagehide'));
      return JSON.parse(localStorage.getItem('aster-draft')||'null');
    });
    assert.equal(saved?.body,'The last keystroke must survive.');
    await page.reload();await writerReady(page);
    assert.equal(await page.locator('#body').inputValue(),'The last keystroke must survive.');
  });
  await check('A successful publish preserves edits made while the request was pending',async page=>{
    await visit(page,'/write.html');await writerReady(page);
    await page.locator('#title').fill('Pending publication');await page.locator('#category').fill('Notes');await page.locator('#body').fill('Original published body.');
    await page.locator('.writer-gate summary').click();await page.locator('#token').fill('test-only-not-a-credential');
    let release;const pending=new Promise(resolve=>release=resolve);let markSent;const sent=new Promise(resolve=>markSent=resolve);
    await page.route('https://api.github.com/**',async route=>{
      if(route.request().method()==='GET')return route.fulfill({json:{content:Buffer.from(source).toString('base64'),sha:'original'}});
      markSent();await pending;await route.fulfill({json:{commit:{sha:'1234567mock'}}});
    });
    try{
      await page.locator('#publish').click();await sent;
      await page.locator('#body').fill('New unpublished thoughts.');await page.locator('#draft-save').click();release();
      await page.waitForFunction(()=>document.querySelector('#write-log').textContent.includes('已发布'));
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('aster-draft')||'null')?.body),'New unpublished thoughts.');
      await page.locator('[data-nav="about"]').click();await page.waitForFunction(()=>document.body.dataset.page==='about');
      await page.locator('footer a[href="write.html"]').click();await writerReady(page);
      assert.equal(await page.locator('#body').inputValue(),'New unpublished thoughts.');
    }finally{release();}
  });
  await check('Slow writer module loading cannot initialize a different route',async page=>{
    let release;const pending=new Promise(resolve=>release=resolve);
    await page.route('**/vendor/marked.js',async route=>{await pending;await route.continue();});
    try{
      await visit(page,'/write.html');await page.locator('[data-nav="about"]').click();
      await page.waitForFunction(()=>document.body.dataset.page==='about');release();await frame(page);
      assert.equal(await page.locator('.bio').count(),1);
      await page.locator('footer a[href="write.html"]').click();await writerReady(page);
      await page.locator('#body').fill('One active writer.');await page.locator('#draft-save').click();
      assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('aster-draft')).body),'One active writer.');
    }finally{release();}
  });
  await check('Escape outside the mobile menu does not steal keyboard focus',async page=>{
    await page.setViewportSize({width:390,height:844});
    await visit(page,'/blog.html');await page.locator('#archive-search').focus();await page.keyboard.press('Escape');
    assert.equal(await page.locator('#archive-search').evaluate(input=>input===document.activeElement),true);
  });
  await check('Mobile menu manages focus, labels, and background interactivity',async page=>{
    await page.setViewportSize({width:390,height:844});await visit(page,'/');
    await page.locator('#menu-toggle').click();
    assert.equal(await page.locator('[data-nav="home"]').evaluate(link=>link===document.activeElement),true);
    assert.equal(await page.locator('#main').evaluate(main=>main.inert),true);
    assert.match(await page.locator('#menu-toggle').getAttribute('aria-label'),/关闭/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#menu-toggle').evaluate(button=>button===document.activeElement),true);
    assert.equal(await page.locator('#main').evaluate(main=>main.inert),false);
  });
  await check('All mobile menu links remain reachable in landscape',async page=>{
    await page.setViewportSize({width:667,height:320});await visit(page,'/');await page.locator('#menu-toggle').click();
    const nav=await page.locator('#navigation').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,viewport:innerHeight,overflow:getComputedStyle(el).overflowY}));
    assert.ok(nav.bottom<=nav.viewport,'Menu extends below the locked viewport');
    assert.equal(nav.overflow,'auto');
    await page.locator('[data-nav="contact"]').click();await page.waitForFunction(()=>document.body.dataset.page==='contact');
  });
  await check('Storage failures keep the writer usable and report unsaved work',async page=>{
    await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};});
    await visit(page,'/write.html');await writerReady(page);
    await page.locator('#body').fill('Still editable when storage is full.');
    await page.waitForFunction(()=>document.querySelector('#pv-body').textContent.includes('Still editable'));
    assert.match(await page.locator('#write-log').textContent(),/保存失败/);
    await page.locator('#draft-save').click();assert.match(await page.locator('#write-log').textContent(),/保存失败/);
    await page.locator('#title').fill('Storage failure');await page.locator('#category').fill('Notes');
    await page.locator('.writer-gate summary').click();await page.locator('#token').fill('test-only-not-a-credential');
    await page.locator('#publish').click();await page.waitForFunction(()=>document.querySelector('#write-log').textContent.includes('网络连接失败'));
    const message=await page.locator('#write-log').textContent();assert.match(message,/保存失败/);assert.doesNotMatch(message,/仍保存在本机/);
  });
  await check('Long draft titles and code remain contained on narrow screens',async page=>{
    await visit(page,'/write.html');await writerReady(page);
    await page.locator('#title').fill('UnbrokenTitle'.repeat(40));
    await page.locator('#body').fill('```text\n'+('unbroken-code'.repeat(60))+'\n```');
    await page.locator('#draft-save').click();
    for(const width of [1440,768,390,320]){
      await page.setViewportSize({width,height:844});await frame(page);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Writer overflows at '+width+'px');
      const preview=await page.locator('.writer-preview').boundingBox();assert.ok(preview.x+preview.width<=width,'Preview exceeds the viewport');
    }
  });
  await check('Document load failures offer a working retry with no stale content',async page=>{
    let requests=0;
    await page.route('**/assets/xw-arch.md',route=>++requests===1?route.fulfill({status:503,body:'Unavailable'}):route.continue());
    await visit(page,'/doc.html');await page.locator('#retry-doc').waitFor();
    await page.locator('#retry-doc').click();await page.waitForFunction(()=>document.querySelectorAll('#toc a').length>=10);
    assert.equal(requests,2);assert.equal(await page.locator('#retry-doc').count(),0);
    assert.ok((await page.locator('#article-body').textContent()).length>20000);
  });
  await check('Publishing conflicts preserve the draft without automatically retrying writes',async page=>{
    await visit(page,'/write.html');await writerReady(page);
    await page.locator('#title').fill('Conflicting publication');await page.locator('#category').fill('Notes');await page.locator('#body').fill('Keep this unpublished draft.');
    await page.locator('.writer-gate summary').click();await page.locator('#token').fill('test-only-not-a-credential');
    let writes=0;
    await page.route('https://api.github.com/**',route=>{
      if(route.request().method()==='GET')return route.fulfill({json:{content:Buffer.from(source).toString('base64'),sha:'original'}});
      writes++;return route.fulfill({status:409,json:{message:'Conflict'}});
    });
    await page.locator('#publish').click();await page.waitForFunction(()=>document.querySelector('#write-log').textContent.includes('新提交'));
    assert.equal(writes,1);assert.equal(await page.locator('#publish').isEnabled(),true);
    assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('aster-draft')).body),'Keep this unpublished draft.');
  });
  console.log(JSON.stringify({passed,failed:failures.length}));
  if(failures.length)process.exitCode=1;
}finally{await browser.close();}
