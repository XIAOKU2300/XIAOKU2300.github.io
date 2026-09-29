import {marked} from './vendor/marked.js';

export function initWriter({SITE,copy,clean,readStore,saveStore}) {
  const $=s=>document.querySelector(s), F={};
  ['title','slug','category','date','readTime','tags','summary','body','token'].forEach(k=>F[k]=$('#'+k));
  if(!F.body)return ()=>{};
  let fmt='md',timer,disposed=false,published=false,publishing=false;
  const log=(text,kind='')=>{if(disposed)return;$('#write-log').textContent=text;$('#write-log').className='write-log '+kind;};
  const gate=text=>{$('#gate-log').textContent=text;};
  F.token.value=readStore('aster-gh-token')||'';
  $('#token-save').onclick=()=>gate(saveStore('aster-gh-token',F.token.value.trim())?'已记住在本机浏览器':'浏览器暂时无法保存');
  $('#token-forget').onclick=()=>{try{localStorage.removeItem('aster-gh-token');F.token.value='';gate('已清除本机记录');}catch{gate('浏览器暂时无法清除');}};
  try{const draft=JSON.parse(readStore('aster-draft')||'null');if(draft){Object.keys(F).forEach(k=>{if(k!=='token'&&typeof draft[k]==='string')F[k].value=draft[k];});fmt=draft.fmt==='html'?'html':'md';if(F.slug.value)F.slug.dataset.touched='1';}}catch{}
  if(!F.date.value)F.date.value=new Date().toLocaleDateString('sv-SE');
  const html=()=>fmt==='md'?marked.parse(F.body.value):F.body.value;
  const minutes=()=>Math.max(1,Number(F.readTime.value)||Math.ceil(F.body.value.replace(/<[^>]+>/g,'').length/400));
  const draftRecord=()=>{const d={fmt};Object.keys(F).forEach(k=>{if(k!=='token')d[k]=F[k].value;});return JSON.stringify(d);};
  const draft=()=>{
    const saved=saveStore('aster-draft',draftRecord());
    if(!saved)log('保存失败，请复制文章片段留存。','err');
    else if(!publishing)log('草稿已保存到本机。','ok');
    return saved;
  };
  const flushDraft=()=>{clearTimeout(timer);if(!published)draft();};
  const onVisibility=()=>{if(document.hidden)flushDraft();};
  addEventListener('pagehide',flushDraft);
  document.addEventListener('visibilitychange',onVisibility);
  const preview=()=>{if(disposed)return;$('#pv-title').textContent=F.title.value||'尚未命名的发现';$('#pv-cat').textContent=F.category.value||'分类';$('#pv-date').textContent=F.date.value;$('#pv-read').textContent=minutes()+' MIN READ';$('#pv-body').innerHTML=clean(html())||'<p class="muted">落下第一行字，故事便有了形状。</p>';};
  const sync=()=>document.querySelectorAll('[data-fmt]').forEach(b=>{const on=b.dataset.fmt===fmt;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('[data-fmt]').forEach(b=>b.onclick=()=>{published=false;fmt=b.dataset.fmt;sync();preview();draft();});
  F.title.addEventListener('input',()=>{if(!F.slug.dataset.touched)F.slug.value=F.title.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64);});
  F.slug.addEventListener('input',()=>F.slug.dataset.touched='1');
  $('#form').addEventListener('input',()=>{published=false;clearTimeout(timer);timer=setTimeout(()=>{preview();draft();},180);});
  $('#draft-save').onclick=()=>{published=false;clearTimeout(timer);preview();draft();};
  const q=s=>JSON.stringify(String(s));
  const tpl=s=>'`'+String(s).replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${')+'`';
  const snippet=()=>`    {\n      slug: ${q(F.slug.value.trim())},\n      title: ${q(F.title.value.trim())},\n      category: ${q(F.category.value.trim())},\n      date: ${q(F.date.value)},\n      readTime: ${minutes()},\n      summary: ${q(F.summary.value.trim())},\n      tags: [${F.tags.value.split(/[,，]/).map(t=>t.trim()).filter(Boolean).map(q).join(', ')}],\n      body: ${tpl('\n'+html().trim()+'\n')}\n    },\n`;
  $('#copy-snippet').onclick=async()=>log(await copy(snippet())?'文章片段已复制，可粘贴到 data.js 的 posts 数组中。':'复制失败，请检查浏览器的剪贴板权限。');
  const abort=new AbortController();
  $('#form').addEventListener('submit',async e=>{
    e.preventDefault();if(publishing)return;if(!F.body.value.trim())return log('请先写一点正文。','err');
    const token=F.token.value.trim();if(!token){$('.writer-gate').open=true;F.token.focus();return log('发布前请填写 GitHub Token。','err');}
    clearTimeout(timer);draft();const snapshot=draftRecord(),slug=F.slug.value.trim();const record=snippet();const title=F.title.value.trim();
    if(SITE.posts.some(p=>p.slug===slug))return log('这个网址标识已存在，请换一个。','err');
    const button=$('#publish');button.disabled=true;publishing=true;
    const api='https://api.github.com/repos/XIAOKU2300/XIAOKU2300.github.io/contents/assets/js/data.js';
    const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'};
    try{
      log('正在读取仓库…');const response=await fetch(api+'?ref=main',{headers,signal:abort.signal});
      if(!response.ok)throw new Error(response.status===401||response.status===403?'请检查 Token 的有效期与仓库写入权限。':'读取仓库失败（'+response.status+'）。');
      const meta=await response.json();const bytes=Uint8Array.from(atob(meta.content.replace(/\s/g,'')),c=>c.charCodeAt(0));let source=new TextDecoder().decode(bytes);
      const escaped=slug.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');if(new RegExp('slug\\s*:\\s*["\']'+escaped+'["\']').test(source))throw new Error('远程仓库中已有这个网址标识，请换一个。');
      const match=/\bposts\s*:\s*\[\s*\n/.exec(source);if(!match)throw new Error('文章数据结构已变化，请先复制片段，手动检查。');
      const position=match.index+match[0].length;source=source.slice(0,position)+record+source.slice(position);
      const encoded=new TextEncoder().encode(source);let binary='';for(let i=0;i<encoded.length;i+=8192)binary+=String.fromCharCode(...encoded.subarray(i,i+8192));
      log('正在提交文章…');const result=await fetch(api,{method:'PUT',headers,signal:abort.signal,body:JSON.stringify({message:'post: '+title,content:btoa(binary),sha:meta.sha,branch:'main'})});
      if(!result.ok)throw new Error(result.status===409?'仓库刚刚有了新提交，请重试。':'提交失败（'+result.status+'）。');
      const commit=await result.json();if(disposed)return;
      clearTimeout(timer);published=draftRecord()===snapshot;
      // Clear only the version that was published, never newer edits or another tab's draft.
      if(published){try{if(readStore('aster-draft')===snapshot)localStorage.removeItem('aster-draft');}catch{}}
      const saved=published||draft();
      log('已发布 '+commit.commit.sha.slice(0,7)+'，等待 GitHub Pages 更新。'+(published?'':saved?'后续修改仍保留为草稿。':'后续修改保存失败，请复制文章片段留存。'),saved?'ok':'err');
    }catch(error){
      if(error.name!=='AbortError'&&!disposed){
        clearTimeout(timer);const saved=draft();const message=error.message&&error.message.startsWith('Failed')?'网络连接失败。':error.message;
        log(message+(saved?'草稿仍保存在本机。':'保存失败，请复制文章片段留存。'),'err');
      }
    }
    finally{publishing=false;if(!disposed)button.disabled=false;}
  });
  sync();preview();
  return ()=>{disposed=true;flushDraft();removeEventListener('pagehide',flushDraft);document.removeEventListener('visibilitychange',onVisibility);abort.abort();};
}
