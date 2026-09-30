import assert from 'node:assert/strict';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.BASE_URL||'http://127.0.0.1:4173';
const artifacts=await mkdtemp(join(tmpdir(),'aster-scene-'));
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-zygote']});
let passed=0,failed=0;
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve;});return {promise,release};};
async function check(name,fn,options={}){
  const context=await browser.newContext({viewport:{width:1440,height:1000},...options});
  await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{await fn(page,context);assert.deepEqual(errors,[]);passed++;console.log('PASS '+name);}
  catch(error){failed++;console.log('FAIL '+name+': '+error.stack);}
  finally{await context.close();}
}
const ready=page=>page.waitForFunction(()=>document.querySelector('#visual-world').dataset.loadState==='ready');
const settled=page=>page.waitForFunction(()=>document.querySelector('#visual-world').dataset.phase==='settled');
const activity=(page,value)=>page.waitForFunction(expected=>document.querySelector('#visual-world').dataset.activity===expected,value);
const fonts=async page=>{await page.waitForFunction(()=>document.querySelector('link[href$="fonts.css"]').media==='all');await page.evaluate(()=>document.fonts.ready);};
const nav=async(page,chapter)=>{await page.evaluate(name=>document.querySelector('[data-nav="'+name+'"]').click(),chapter);await page.waitForFunction(name=>document.body.dataset.page===name,chapter);};
const sample=page=>page.evaluate(()=>({draws:window.__gpu.draws,matrices:[...window.__gpu.matrices.values()]}));
async function probe(context){
  await context.addInitScript(()=>{
    window.__gpu={draws:0,matrices:new Map()};
    const prototype=WebGL2RenderingContext.prototype;
    const get=prototype.getUniformLocation,upload=prototype.uniformMatrix4fv,draw=prototype.drawElements,names=new WeakMap();
    prototype.getUniformLocation=function(program,name){const location=get.call(this,program,name);if(location)names.set(location,name);return location;};
    prototype.uniformMatrix4fv=function(location,transpose,value,...rest){if(names.get(location)==='modelViewMatrix')window.__gpu.matrices.set(location,Array.from(value));return upload.call(this,location,transpose,value,...rest);};
    prototype.drawElements=function(...args){window.__gpu.draws++;return draw.apply(this,args);};
  });
}
try{
  await check('Slow fonts and scene downloads never block reading or navigation',async(page)=>{
    const scene=gate(),font=gate();
    await page.route('**/scene.bundle.js*',async route=>{await scene.promise;await route.continue();});
    await page.route('**/fonts.css',async route=>{await font.promise;await route.continue();});
    try{
      await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.locator('.hero-title').waitFor();
      assert.equal(await page.locator('#quote-next').count(),0);
      assert.equal(await page.locator('#visual-world').getAttribute('data-load-state'),'loading');
      assert.equal(await page.locator('#visual-world').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
      await page.waitForTimeout(1300);await page.screenshot({path:join(artifacts,'loading-desktop.png')});
      await nav(page,'blog');await page.locator('#archive-search').fill('Docker');assert.equal(await page.locator('.transmission').count(),1);
      await nav(page,'projects');await nav(page,'contact');await page.locator('#motion-toggle').click();
      scene.release();font.release();await ready(page);await fonts(page);await settled(page);
      assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),'contact');await activity(page,'paused');
      assert.equal(await page.locator('canvas').count(),1);
    }finally{scene.release();font.release();}
  });
  await check('Late fonts refit the current mobile quote without changing it',async(page)=>{
    const font=gate();await page.route('**/fonts.css',async route=>{await font.promise;await route.continue();});
    try{
      await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.locator('.hero-title').waitFor();
      const quote=await page.locator('.hero-title').getAttribute('data-quote-id');
      await page.screenshot({path:join(artifacts,'loading-mobile.png')});font.release();await fonts(page);
      await page.waitForFunction(()=>{const title=document.querySelector('.hero-title');return [...title.querySelectorAll('.quote-ink')].every(el=>el.offsetWidth<=title.clientWidth);});
      assert.equal(await page.locator('.hero-title').getAttribute('data-quote-id'),quote);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
      await ready(page);await activity(page,'paused');
      const states=await page.locator('.world-fallback i').evaluateAll(items=>items.map(el=>getComputedStyle(el).animationName));assert.ok(states.every(name=>name==='none'));
    }finally{font.release();}
  },{viewport:{width:320,height:844},reducedMotion:'reduce'});
  await check('A failed scene download leaves a quiet fallback and usable links',async(page)=>{
    await page.route('**/scene.bundle.js*',route=>route.abort());await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#visual-world').dataset.loadState==='fallback');
    assert.equal(await page.locator('.world-fallback i').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await nav(page,'blog');await page.locator('#archive-search').fill('Docker');assert.equal(await page.locator('.transmission').count(),1);
  });
  await check('Unavailable WebGL preserves the interface without a permanent loader',async(page,context)=>{
    await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args);};});
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#visual-world').dataset.loadState==='fallback');
    await nav(page,'about');assert.equal(await page.locator('.inventory-entry').count(),4);
  });
  await check('All five settled sculptures keep moving; pause, reading and offscreen modes stop rendering',async(page,context)=>{
    await probe(context);await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await ready(page);await fonts(page);
    for(const chapter of ['home','blog','projects','about','contact']){
      await nav(page,chapter);await settled(page);await activity(page,'idle');
      const before=await sample(page);await page.waitForTimeout(1100);const after=await sample(page);
      assert.ok(after.draws>before.draws,chapter+' stopped drawing');assert.notDeepEqual(after.matrices,before.matrices,chapter+' has no geometric movement');
      await page.locator('#motion-toggle').click();await activity(page,'paused');await page.waitForTimeout(200);
      const paused=await sample(page);await page.waitForTimeout(350);assert.deepEqual(await sample(page),paused,chapter+' renders while paused');
      await page.screenshot({path:join(artifacts,chapter+'.png')});await page.locator('#motion-toggle').click();
    }
    await nav(page,'home');await settled(page);await page.evaluate(()=>scrollTo({top:2000,behavior:'instant'}));await activity(page,'offscreen');
    const offscreen=await sample(page);await page.waitForTimeout(350);assert.deepEqual(await sample(page),offscreen);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await activity(page,'idle');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await activity(page,'hidden');
    const hidden=await sample(page);await page.waitForTimeout(350);assert.deepEqual(await sample(page),hidden);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});await activity(page,'idle');
    await nav(page,'blog');await page.locator('.transmission').first().click();await activity(page,'reading');await page.waitForTimeout(400);
    const reading=await sample(page);await page.waitForTimeout(350);assert.deepEqual(await sample(page),reading);
    await page.setViewportSize({width:390,height:844});await nav(page,'home');await settled(page);await fonts(page);await page.screenshot({path:join(artifacts,'home-mobile.png')});
  });
  await check('Navigation and motion changes during scene construction use the latest state',async(page,context)=>{
    await context.addInitScript(()=>{
      const observer=new MutationObserver(()=>{
        if(!document.querySelector('#visual-world canvas'))return;
        observer.disconnect();document.querySelector('[data-nav="projects"]').click();document.querySelector('[data-nav="contact"]').click();document.querySelector('#motion-toggle').click();
      });
      observer.observe(document,{childList:true,subtree:true});
    });
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await ready(page);await settled(page);await activity(page,'idle');
    assert.equal(await page.locator('body').getAttribute('data-page'),'contact');assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),'contact');assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('canvas').count(),1);
  },{reducedMotion:'reduce'});
  await check('An unusually slow scene becomes quiet and can still finish loading',async(page)=>{
    const scene=gate();await page.route('**/scene.bundle.js*',async route=>{await scene.promise;await route.continue();});
    try{
      await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#visual-world').dataset.loadState==='fallback');
      assert.equal(await page.locator('.world-fallback i').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
      await nav(page,'about');scene.release();await ready(page);await settled(page);assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),'about');
    }finally{scene.release();}
  });
  await check('A lost WebGL context falls back and can restore its single canvas',async(page)=>{
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});await ready(page);
    await page.evaluate(()=>{window.__contextLoss=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');window.__contextLoss.loseContext();});
    await page.waitForFunction(()=>document.querySelector('#visual-world').dataset.loadState==='fallback');
    await nav(page,'projects');await page.waitForTimeout(300);await page.evaluate(()=>window.__contextLoss.restoreContext());await ready(page);await settled(page);await activity(page,'idle');
    assert.equal(await page.locator('canvas').count(),1);assert.equal(await page.locator('#visual-world').getAttribute('data-chapter'),'projects');
  });
  console.log(JSON.stringify({passed,failed,artifacts}));if(failed)process.exitCode=1;
}finally{await browser.close();}
