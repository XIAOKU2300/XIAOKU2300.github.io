// The instrument overlay: a thin, technical annotation layer that projects 3D
// anchors from the sculpture onto the page. It reads as a measuring device
// rather than decoration, and it never intercepts pointer events.
//
// Everything that moves here is written from `update()`, which the scene calls
// inside its own draw loop. Nothing is driven by a CSS animation, so parking
// the loop — a paused scene, a hidden tab, an offscreen sculpture, a reading
// route — freezes the whole layer exactly as it freezes the sculpture.

const pad = value => String(value).padStart(2, '0');

export function createHud(host){
  const root=document.createElement('div');
  root.className='instrument-hud';
  root.dataset.phase='forming';
  root.innerHTML='<div class="hud-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
    +'<div class="hud-rail hud-rail-left" aria-hidden="true"></div>'
    +'<div class="hud-rail hud-rail-right" aria-hidden="true"></div>'
    +'<div class="hud-numeral" aria-hidden="true"></div>'
    +'<div class="hud-callouts"></div>'
    +'<div class="hud-readout"><span class="hud-head">INSTRUMENT</span><span class="hud-index"></span><span class="hud-title"></span><div class="hud-lines"></div></div>'
    +'<div class="hud-status" aria-hidden="true"><span class="hud-clock">T+00:00:00</span><span class="hud-telemetry"></span></div>'
    +'<div class="hud-section" aria-hidden="true"></div>';
  host.appendChild(root);

  const calloutLayer=root.querySelector('.hud-callouts');
  const readout={index:root.querySelector('.hud-index'),title:root.querySelector('.hud-title'),lines:root.querySelector('.hud-lines')};
  const numeral=root.querySelector('.hud-numeral');
  const clock=root.querySelector('.hud-clock');
  const telemetry=root.querySelector('.hud-telemetry');
  const section=root.querySelector('.hud-section');
  const nodes=[];
  let lastClock='',lastTelemetry='',lastSection='';

  function ensure(count){
    while(nodes.length<count){
      const el=document.createElement('div');
      el.className='hud-callout';
      el.innerHTML='<span class="hud-dot"></span><span class="hud-leader"></span><span class="hud-text"><b></b><em></em></span>';
      calloutLayer.appendChild(el);
      nodes.push({el,dot:el.querySelector('.hud-dot'),leader:el.querySelector('.hud-leader'),label:el.querySelector('b'),sub:el.querySelector('em')});
    }
    for(let i=0;i<nodes.length;i++)nodes[i].el.hidden=i>=count;
  }

  return {
    root,
    setChapter(chapter,lines){
      readout.index.textContent=chapter.number;
      readout.title.textContent=chapter.name;
      readout.lines.innerHTML=(lines||[]).map(line=>`<span>${line}</span>`).join('');
      numeral.textContent=chapter.number;
      const name=chapter.name||'';
      if(name!==lastSection){lastSection=name;section.textContent=name;}
    },
    // `project` maps a local-space Vector3 to screen pixels. Anchors that fall
    // behind the camera are simply hidden instead of being drawn mirrored.
    // `time` is the scene clock in seconds, so the readouts stop with the loop.
    update(anchors,project,phase,width,time=0){
      if(root.dataset.phase!==phase)root.dataset.phase=phase;
      ensure(anchors.length);
      for(let i=0;i<anchors.length;i++){
        const anchor=anchors[i],point=project(anchor.pos),node=nodes[i];
        if(!point.visible){node.el.style.opacity='0';continue;}
        node.el.style.opacity='';
        node.el.style.transform='translate('+(Math.round(point.x)-4)+'px,'+Math.round(point.y)+'px)';
        node.el.classList.toggle('flip',point.x>width*.6);
        node.label.textContent=anchor.label;
        node.sub.textContent=anchor.sub||'';
      }
      const seconds=Math.max(0,Math.floor(time));
      const stamp='T+'+pad(Math.floor(seconds/3600))+':'+pad(Math.floor(seconds/60)%60)+':'+pad(seconds%60);
      if(stamp!==lastClock){lastClock=stamp;clock.textContent=stamp;}
      // A deterministic drift, not a random number: the same clock always gives
      // the same reading, so the instrument stays honest when it is parked.
      const drift=(0.5+0.5*Math.sin(time*.31))*(0.5+0.5*Math.sin(time*.07+1.1));
      const reading=(drift*1000).toFixed(1).padStart(5,'0');
      if(reading!==lastTelemetry){lastTelemetry=reading;telemetry.textContent='GAIN '+reading;}
    }
  };
}
