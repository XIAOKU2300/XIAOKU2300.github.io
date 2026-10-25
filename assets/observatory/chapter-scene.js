import * as THREE from './vendor/three.module.js';
import {CHAPTERS,PIECES,chapterFor,createShape,createRibbonGeometry,createEngraving,createCentrelines,anchorPoint} from './sculptures.js';
import {createHud} from './hud.js';
import {createCosmos} from './cosmos.js';
import {createOverlay} from './overlay.js';

const yieldToPage=()=>new Promise(resolve=>setTimeout(resolve,0));

// Each chapter's instrument is annotated with the categories of content it
// carries, pinned to real points on the ribbons so the labels move with the
// sculpture instead of floating in unrelated screen space.
const HUD_ANCHORS={
  home:[{i:0,label:'SYSTEMS',sub:'NAS / DOCKER'},{i:4,label:'SOUND',sub:'HI-FI / FIELD'},{i:9,t:.62,label:'POLAR AXIS',sub:'CORE 00'}],
  blog:[{i:0,label:'NOTES',sub:'FIELD LOG'},{i:5,label:'LEDGER',sub:'BY DATE'},{i:1,label:'PINNED',sub:'EDGE / GOLD'}],
  projects:[{i:0,label:'SOFTWARE',sub:'BUILD / SHIP'},{i:4,label:'SERVICES',sub:'NAS / NET'},{i:7,label:'HARDWARE',sub:'SOUND / HW'}],
  about:[{i:0,label:'TOOLKIT',sub:'DAILY USE'},{i:4,label:'WAYPOINTS',sub:'SINCE 2020'},{i:8,label:'MEMO',sub:'A TRACE'}],
  contact:[{i:0,label:'EMAIL',sub:'WRITE FIRST'},{i:4,label:'GITHUB',sub:'XIAOKU2300'},{i:8,label:'QQ',sub:'SAY HELLO'}],
};
const HUD_LINES={
  home:['OBJECTS 10','RINGS 03','SIGNAL NOMINAL'],
  blog:['NOTES','BY DATE','SIGNAL NOMINAL'],
  projects:['PROJECTS','ACTIVE','SIGNAL NOMINAL'],
  about:['WAYPOINTS','SINCE 2020','SIGNAL NOMINAL'],
  contact:['CHANNELS','AWAITING REPLY','SIGNAL NOMINAL'],
};
// Each chapter runs the same instrument at a slightly different temperature:
// exposure, polish and reflectivity drift by a few percent, so moving between
// sections reads as one machine changing mode rather than five separate scenes.
const ACCENTS={
  home:{exposure:1.08,polish:.78,metal:.86,key:'#f2ebdc',rim:'#b3d4ce'},
  blog:{exposure:1.04,polish:.70,metal:.79,key:'#f6e7cf',rim:'#9ec2cb'},
  projects:{exposure:1.12,polish:.87,metal:.91,key:'#e9f4ee',rim:'#84cfc0'},
  about:{exposure:1.06,polish:.74,metal:.84,key:'#f1e3ec',rim:'#c2b6d6'},
  contact:{exposure:1.10,polish:.81,metal:.88,key:'#e3eef6',rim:'#7cb6d8'},
};
const INTERACTIVE='a,button,input,textarea,select,summary,[data-copy],[role=button],.article-body,.transmission,.facts,.term';

export async function createObservatory(host,{paused=false}={}) {
  let page=document.body.dataset.page||'home',chapter=chapterFor(page),stopped=paused;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default'});}
  catch{host.dataset.renderer='fallback';return {setPage(next){host.dataset.chapter=chapterFor(next);host.dataset.reading=String(['post','doc','write'].includes(next));},setPaused(){},setHud(){}};}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  // The overlay pass draws into the same buffer after the scene, so clearing is
  // done by hand instead of by the renderer.
  renderer.autoClear=false;
  renderer.setClearColor(0x080f14,0);renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,80);camera.position.z=10;
  const root=new THREE.Group();scene.add(root);
  let width=innerWidth,height=innerHeight,dpr=1,raf=0,last=0,elapsed=0,lost=false,ready=false;
  let pointerX=0,pointerY=0,frames=0,slowFrames=0,transition=null,revision=0,hudClock=0,chapterIndex=0,qualityStep=0,cosmosFrozen=false;
  let layout={x:0,y:0,scale:1,px:0,py:0};
  let sweepClock=0,apertures=[1,1,1,1],surgePulse=0,veilFrame=0;
  const rootTarget=new THREE.Quaternion(),idleRotation=new THREE.Quaternion(),idleEuler=new THREE.Euler(),targetRotation=new THREE.Quaternion(),identity=new THREE.Quaternion(),signalPosition=new THREE.Vector3(),projected=new THREE.Vector3();
  const accentKey=new THREE.Color(),accentRim=new THREE.Color();
  const spinWorld=new THREE.Quaternion(),spinEuler=new THREE.Euler();
  let spinYaw=0,spinPitch=0,yawVelocity=0,pitchVelocity=0,zoom=1,zoomTarget=1;
  let dragging=false,dragX=0,dragY=0,dragMoved=0,focusX=0,focusY=0,recentering=false,scrollRecentered=false;
  let pinchStart=0,pinchZoomStart=1;
  const pointers=new Map();
  const focusRect=new THREE.Vector4(0,0,0,0);let focusAmount=.55;
  const reading=()=>['post','doc','write'].includes(page);
  const mobile=()=>innerWidth<=760;
  const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const activity=value=>{if(host.dataset.activity!==value)host.dataset.activity=value;};
  const shapes=new Map(),pendingShapes=new Map();
  async function prepareShape(key){
    if(shapes.has(key))return shapes.get(key);
    if(pendingShapes.has(key))return pendingShapes.get(key);
    const pending=(async()=>{
      const shape=[];
      for(let i=0;i<PIECES;i++){await yieldToPage();shape.push(createShape(key,i));}
      shapes.set(key,shape);pendingShapes.delete(key);return shape;
    })();
    pendingShapes.set(key,pending);return pending;
  }
  await yieldToPage();

  // Broad, low-resolution studio reflections give smooth highlights without
  // image downloads, high-frequency surface noise, or glass transmission passes.
  const studio=new THREE.Scene();studio.background=new THREE.Color('#182c30');
  for(const [color,intensity,size,position] of [
    ['#eef0e8',2.8,[5,9],[-4,5,5]],['#b8d8cd',1.8,[2.4,8],[5,2,3]],
    ['#d5bd91',2.0,[6,1.4],[0,-4,3]],['#8eafb6',1.5,[3,7],[-2,1,-5]],
  ]){
    const box=new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));
    box.position.set(...position);box.lookAt(0,0,0);studio.add(box);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.08,.1,40,{size:128});scene.environment=environment.texture;
  studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#d2e6dc','#13202c',1.45));
  const key=new THREE.DirectionalLight('#f2ebdc',2.8);key.position.set(-3,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#b3d4ce',1.8);rim.position.set(4,0,-3);scene.add(rim);
  // The ribbons are the same surface the engraving is drawn on, so every solid
  // material is pushed back a fraction of a depth unit. The lines then win the
  // depth test cleanly instead of tearing through the faces they belong to.
  const faceOffset={polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1};
  const porcelain=new THREE.MeshPhysicalMaterial({color:'#9fbab0',metalness:.12,roughness:.34,clearcoat:.55,clearcoatRoughness:.28,envMapIntensity:.78,...faceOffset});
  const brass=new THREE.MeshStandardMaterial({color:'#bda77b',metalness:.86,roughness:.31,envMapIntensity:.78,...faceOffset});
  const pearl=new THREE.MeshPhysicalMaterial({color:'#c1d3c8',metalness:.20,roughness:.29,clearcoat:.65,clearcoatRoughness:.24,envMapIntensity:.75,...faceOffset});
  const graphite=new THREE.MeshPhysicalMaterial({color:'#466f68',metalness:.48,roughness:.32,clearcoat:.35,envMapIntensity:.80,...faceOffset});
  await prepareShape(chapter);
  const pieces=[];
  for(let i=0;i<PIECES;i++){
    const geometry=createRibbonGeometry(shapes.get(chapter)[i]);
    const material=i===1||i===8?brass:i===2||i===7?pearl:i===5?graphite:porcelain;
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;
    const line=new THREE.LineSegments(createEngraving(geometry,i),new THREE.LineBasicMaterial({color:i===1||i===8?'#ddc89e':'#c2d7cd',transparent:true,opacity:i===5?.20:.10,depthWrite:false}));line.frustumCulled=false;mesh.add(line);root.add(mesh);pieces.push(mesh);
    if(i%2===1)await yieldToPage();
  }
  const signal=new THREE.Mesh(new THREE.IcosahedronGeometry(.048,1),brass);root.add(signal);
  const signalTarget={home:[0,0,0],blog:[0,-.05,.25],projects:[1.43,1.43,1.43],about:[0,0,.18],contact:[-1.48,0,.15]};
  // The reticle: a fine orbit ring plus graduated ticks, read as a physical
  // measuring dial behind the sculpture rather than a decorative circle. It
  // never writes depth, so where it crosses a ribbon it can only overlay.
  const fineOrbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:256},(_,i)=>{const a=i/256*Math.PI*2;return new THREE.Vector3(Math.cos(a)*2.50,Math.sin(a)*2.50,0);})),new THREE.LineBasicMaterial({color:'#bba777',transparent:true,opacity:.12,depthWrite:false}));
  const tickPoints=[];
  for(let i=0;i<72;i++){const a=i/72*Math.PI*2,long=i%6===0,r0=2.50,r1=2.50+(long?.17:.07);tickPoints.push(new THREE.Vector3(Math.cos(a)*r0,Math.sin(a)*r0,0),new THREE.Vector3(Math.cos(a)*r1,Math.sin(a)*r1,0));}
  const ticks=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tickPoints),new THREE.LineBasicMaterial({color:'#c7ae7c',transparent:true,opacity:.14,depthWrite:false}));
  const reticle=new THREE.Group();reticle.rotation.set(.9,.3,.3);reticle.add(fineOrbit,ticks);root.add(reticle);
  // Standby atoms for the lattice: tilted orbits of particles that keep circling
  // the frame, each orbit a different metal, so projects reads as something
  // still under construction rather than a finished object sitting still. They
  // live under `root`, so they orbit with the model when it is turned.
  const atoms=new THREE.Group();root.add(atoms);
  const atomOrbits=[
    {radius:1.58,tilt:[1.12,.30,-.20],speed:.46,color:'#8fd0c2',size:.050,count:2},
    {radius:1.96,tilt:[-.56,.62,.24],speed:-.32,color:'#c7ae7c',size:.042,count:2},
    {radius:2.30,tilt:[.40,-.36,.10],speed:.22,color:'#b9cfe0',size:.036,count:1},
  ].map((spec,o)=>{
    const holder=new THREE.Group();holder.rotation.set(...spec.tilt);atoms.add(holder);
    const ring=new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({length:96},(_,k)=>{const a=k/96*Math.PI*2;return new THREE.Vector3(Math.cos(a)*spec.radius,Math.sin(a)*spec.radius,0);})),
      new THREE.LineBasicMaterial({color:spec.color,transparent:true,opacity:0,depthWrite:false})
    );
    ring.frustumCulled=false;holder.add(ring);
    const bodies=[];
    for(let k=0;k<spec.count;k++){
      const body=new THREE.Mesh(new THREE.IcosahedronGeometry(spec.size,0),new THREE.MeshBasicMaterial({color:spec.color,transparent:true,opacity:0,depthWrite:false}));
      body.frustumCulled=false;holder.add(body);bodies.push(body);
    }
    return {...spec,holder,ring,bodies,angle:o*1.7};
  });
  // Dashed schematics of each ribbon's centreline. During the opening sequence
  // the guides draw themselves first and the solid ribbons converge onto them.
  const guides=[];
  function buildGuides(key){
    if(guides.length)return;
    for(const points of createCentrelines(key,120)){
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:'#a8c7be',transparent:true,opacity:0,dashSize:.045,gapSize:.05}));
      line.computeLineDistances();line.frustumCulled=false;line.visible=false;root.add(line);guides.push(line);
    }
  }
  // The universe the instrument hangs inside, and the full-viewport pass that
  // draws over everything in the same canvas.
  const cosmos=createCosmos({mobile:mobile()});
  scene.add(cosmos.group);
  const overlay=createOverlay();
  const caption=document.createElement('div');caption.className='sculpture-caption';
  caption.innerHTML='<span class="sculpture-index"></span><div><span class="sculpture-name"></span><span class="sculpture-subtitle"></span></div><i></i>';host.appendChild(caption);
  const hud=createHud(host);
  let hudLines=HUD_LINES[chapter]||[];
  function setCaption(){
    const item=CHAPTERS[chapter];caption.querySelector('.sculpture-index').textContent=item.number;
    caption.querySelector('.sculpture-name').textContent=item.name;caption.querySelector('.sculpture-subtitle').textContent=item.label;
    host.dataset.chapter=chapter;host.dataset.reading=String(reading());
    chapterIndex=Math.max(0,Object.keys(CHAPTERS).indexOf(chapter));
    overlay.setChapter(chapterIndex);
    hud.setChapter(item,hudLines);
  }
  function measure(){
    width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();
    const vh=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*10,vw=vh*camera.aspect;
    const head=document.querySelector('.page-head');let centreX,centreY,scale;
    if(page==='home'){
      centreX=mobile()?width*.53:width*.755;centreY=mobile()?Math.min(height*.67,585):height*.455;
      scale=mobile()?vw/5.5:Math.min(vw/12.1,1.08);
    }else if(mobile()&&!reading()&&head){
      centreX=width*.53;centreY=head.getBoundingClientRect().bottom+scrollY-175;scale=Math.min(vw/7.1,.60);
    }else{centreX=width*.79;centreY=Math.min(310,height*.37);scale=Math.min(vw/15.8,.77);}
    layout={x:(centreX/width-.5)*vw,y:(.5-centreY/height)*vh,scale,px:centreX,py:centreY};
    rootTarget.setFromEuler(new THREE.Euler(...CHAPTERS[chapter].rotation));
    host.style.setProperty('--scene-x',centreX+'px');host.style.setProperty('--scene-y',centreY+'px');
    caption.style.left=(mobile()?24:Math.max(width*.635,centreX-180))+'px';
    const radiusPixels=2.35*scale*height/vh;
    caption.style.top=(page==='home'?Math.min(height-110,centreY+radiusPixels+24):centreY+(mobile()?133:195))+'px';
    // The text column the overlay pass must thin out over, in uv space. The
    // headline and the article body stay legible without a separate scrim.
    const focusEl=page==='home'?document.querySelector('.hero-intro'):reading()?document.querySelector('.article-body'):document.querySelector('.page-head');
    focusAmount=page==='home'?.58:reading()?.30:.45;
    if(focusEl){
      const rect=focusEl.getBoundingClientRect();
      focusRect.set((rect.left+rect.width/2)/width,1-(rect.top+rect.height/2)/height,Math.max(.06,rect.width/2/width),Math.max(.06,rect.height/2/height));
    }else focusRect.set(0,0,0,0);
  }
  function resize(){
    dpr=Math.min(devicePixelRatio||1,mobile()?1.5:1.8);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);
    cosmos.setDpr(dpr);overlay.setSize(innerWidth,innerHeight);
    measure();if(ready){draw(0,performance.now());restart();}
  }
  function hideGuides(){for(const line of guides){line.visible=false;line.material.opacity=0;}}
  function settle(){
    const shape=shapes.get(chapter);if(!shape)return;
    for(let i=0;i<PIECES;i++){
      const mesh=pieces[i];mesh.geometry.attributes.position.array.set(shape[i].positions);mesh.geometry.attributes.normal.array.set(shape[i].normals);
      mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.attributes.normal.needsUpdate=true;mesh.position.set(0,0,0);mesh.quaternion.identity();
    }
    transition=null;host.dataset.phase='settled';host.style.setProperty('--morph',0);hideGuides();
  }
  // The opening: every ribbon starts scattered, scaled up, and tumbled, then
  // falls into its place in the instrument while the dashed guides draw and fade.
  function startGenesis(){
    const shape=shapes.get(chapter);if(!shape)return;
    buildGuides(chapter);
    for(const line of guides){line.visible=true;line.material.opacity=0;}
    const from=[];
    for(let i=0;i<PIECES;i++){
      const dest=shape[i].positions,scatter=new Float32Array(dest.length),spread=1.55+(i%3)*.24;
      for(let j=0;j<dest.length;j++)scatter[j]=dest[j]*spread;
      const dx=Math.cos(i*2.11),dy=Math.sin(i*1.73),dz=Math.sin(i*1.31)*.6,length=Math.hypot(dx,dy,dz)||1,push=2.0+(i%4)*.36;
      from.push({positions:scatter,normals:new Float32Array(shape[i].normals),offset:new THREE.Vector3(dx/length*push,dy/length*push,dz/length*push),rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.7,i*1.1,i*.5))});
    }
    transition={start:performance.now(),duration:1900,mode:'genesis',from};
    host.dataset.phase='forming';activity('transition');restart();
  }
  function transform(now){
    if(!transition)return 0;
    const genesis=transition.mode==='genesis';
    const progress=THREE.MathUtils.clamp((now-transition.start)/transition.duration,0,1);
    for(let i=0;i<PIECES;i++){
      const p=genesis?progress:THREE.MathUtils.clamp((progress-i*.016)/(1-(PIECES-1)*.016),0,1);
      const u=genesis?1-Math.pow(1-p,3):smooth(.06,.94,p),burst=genesis?0:Math.sin(Math.PI*p);
      const mesh=pieces[i],source=transition.from[i],dest=shapes.get(chapter)[i],pos=mesh.geometry.attributes.position,norm=mesh.geometry.attributes.normal;
      for(let j=0;j<pos.array.length;j++){pos.array[j]=source.positions[j]+(dest.positions[j]-source.positions[j])*u;norm.array[j]=source.normals[j]+(dest.normals[j]-source.normals[j])*u;}
      pos.needsUpdate=true;norm.needsUpdate=true;const a=i/PIECES*Math.PI*2;
      mesh.position.set(source.offset.x*(1-u)+(genesis?0:Math.cos(a)*burst*.22),source.offset.y*(1-u)+(genesis?0:Math.sin(a)*burst*.22),source.offset.z*(1-u)+(genesis?0:Math.sin(i*1.71)*burst*.24));
      mesh.quaternion.copy(source.rotation).slerp(identity,u);
      if(!genesis){mesh.rotateY(burst*(i%2?1:-1)*.20);mesh.rotateZ(burst*.065*Math.sin(a));}
    }
    if(genesis){
      const opacity=.55*THREE.MathUtils.clamp(progress/.34,0,1)*(1-THREE.MathUtils.clamp((progress-.60)/.36,0,1));
      for(const line of guides)line.material.opacity=opacity;
      host.style.setProperty('--morph',0);
      if(progress===1)settle();return 0;
    }
    host.style.setProperty('--morph',Math.sin(progress*Math.PI).toFixed(3));
    if(progress===1)settle();return Math.sin(progress*Math.PI);
  }
  function project(vec){
    projected.copy(vec);root.localToWorld(projected);projected.project(camera);
    return {x:(projected.x*.5+.5)*width,y:(.5-projected.y*.5)*height,visible:projected.z<1};
  }
  // --- the loader mask ---------------------------------------------------
  // The loading veil is the sculpture's own outline. It opens from a point,
  // arrives at exactly the silhouette the instrument settles into as the
  // ribbons finish forming, holds for a beat, and then keeps opening until it
  // has swallowed the page — so the model itself performs the transition into
  // the site.
  //
  // The outline is fitted to every vertex of every ribbon's *surface*, not to
  // the centrelines, and it is emitted as one closed Catmull-Rom curve, so the
  // edge is a smooth curve rather than a comb of chords. It is built once and
  // then animated by scaling it about the instrument's own centre, which is
  // also the origin the overlay aperture opens from, so the mask and the ring
  // can never disagree.
  const SVGNS='http://www.w3.org/2000/svg';
  let veil=null;
  function veilRadii(){
    const shape=shapes.get(chapter);if(!shape)return null;
    const savedPosition=root.position.clone(),savedQuaternion=root.quaternion.clone(),savedScale=root.scale.clone();
    root.position.set(layout.x,layout.y,0);root.quaternion.copy(rootTarget);root.scale.setScalar(layout.scale);
    root.updateMatrixWorld(true);camera.updateMatrixWorld();
    const cx=layout.px,cy=layout.py,K=128,radii=new Float32Array(K);
    for(const piece of shape){
      const positions=piece.positions;
      for(let j=0;j<positions.length;j+=3){
        projected.set(positions[j],positions[j+1],positions[j+2]);
        root.localToWorld(projected);projected.project(camera);
        if(projected.z>=1)continue;
        const x=(projected.x*.5+.5)*width,y=(.5-projected.y*.5)*height,dx=x-cx,dy=y-cy;
        let index=Math.round(Math.atan2(dy,dx)/(Math.PI*2)*K)%K;if(index<0)index+=K;
        const distance=Math.hypot(dx,dy);
        if(distance>radii[index])radii[index]=distance;
      }
    }
    root.position.copy(savedPosition);root.quaternion.copy(savedQuaternion);root.scale.copy(savedScale);root.updateMatrixWorld(true);
    let peak=0;
    for(let i=0;i<K;i++)if(radii[i]>peak)peak=radii[i];
    if(peak<12)return null;
    // Fill the angles no vertex landed in, interpolating between the two
    // neighbours that did, so the outline closes instead of spiking.
    for(let i=0;i<K;i++){
      if(radii[i]>=1)continue;
      let back=1,forward=1;
      while(back<K&&radii[(i-back+K)%K]<1)back++;
      while(forward<K&&radii[(i+forward)%K]<1)forward++;
      const a=radii[(i-back+K)%K],b=radii[(i+forward)%K];
      radii[i]=a+(b-a)*(back/(back+forward));
    }
    // A short circular average takes the last of the ribbon edges out; the
    // result is then scaled back up so the outline still reaches exactly as far
    // as the model does, and the curve below is interpolating, so every peak of
    // the fitted outline survives.
    const smoothed=new Float32Array(K);let smoothedPeak=0;
    for(let i=0;i<K;i++){let sum=0;for(let k=-2;k<=2;k++)sum+=radii[(i+k+K)%K];smoothed[i]=sum/5;if(smoothed[i]>smoothedPeak)smoothedPeak=smoothed[i];}
    const lift=smoothedPeak>0?peak/smoothedPeak*1.02:1;
    for(let i=0;i<K;i++)smoothed[i]*=lift;
    return smoothed;
  }
  // One closed Catmull-Rom curve through the fitted radii, emitted as cubic
  // segments in centre-relative pixels so the whole outline can be animated by
  // a single transform.
  function veilPath(radii){
    const K=radii.length,round=value=>Math.round(value*100)/100;
    const at=i=>{const a=i/K*Math.PI*2,r=radii[((i%K)+K)%K];return [Math.cos(a)*r,Math.sin(a)*r];};
    const first=at(0),parts=['M'+round(first[0])+' '+round(first[1])];
    for(let i=0;i<K;i++){
      const p1=at(i),p2=at(i+1),p0=at(i-1),p3=at(i+2);
      parts.push('C'+round(p1[0]+(p2[0]-p0[0])/6)+' '+round(p1[1]+(p2[1]-p0[1])/6)
        +' '+round(p2[0]-(p3[0]-p1[0])/6)+' '+round(p2[1]-(p3[1]-p1[1])/6)
        +' '+round(p2[0])+' '+round(p2[1]));
    }
    return parts.join(' ')+'Z';
  }
  function playVeil(){
    const radii=veilRadii();if(!radii)return;
    if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const cx=layout.px,cy=layout.py;
    let peak=0;for(const r of radii)if(r>peak)peak=r;
    // How far the outline has to travel before it has passed every corner.
    const cover=Math.hypot(Math.max(cx,width-cx),Math.max(cy,height-cy))/peak*1.08;
    const id='veil'+Math.random().toString(36).slice(2,8);
    const svg=document.createElementNS(SVGNS,'svg');
    svg.setAttribute('class','load-veil');svg.setAttribute('aria-hidden','true');
    svg.setAttribute('viewBox','0 0 '+width+' '+height);svg.setAttribute('width',width);svg.setAttribute('height',height);
    // The sheet is a soft-edged mask: a white field with the sculpture's
    // outline cut out of it and blurred, so the page is revealed through a
    // feathered hole instead of a hard-edged stencil.
    svg.innerHTML='<defs>'
      +'<radialGradient id="'+id+'f" cx="50%" cy="46%" r="74%"><stop offset="0" stop-color="#0d1a22"/><stop offset="1" stop-color="#070c10"/></radialGradient>'
      +'<filter id="'+id+'b" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>'
      +'<mask id="'+id+'m" maskUnits="userSpaceOnUse" x="-300" y="-300" width="'+(width+600)+'" height="'+(height+600)+'">'
      +'<rect x="-300" y="-300" width="'+(width+600)+'" height="'+(height+600)+'" fill="#fff"/>'
      +'<path id="'+id+'p" fill="#000" filter="url(#'+id+'b)" d="'+veilPath(radii)+'"/></mask>'
      +'</defs>'
      +'<rect x="0" y="0" width="'+width+'" height="'+height+'" fill="url(#'+id+'f)" mask="url(#'+id+'m)"/>';
    document.body.appendChild(svg);veil=svg;
    const hole=svg.querySelector('#'+id+'p');
    const open=1700,hold=340,swallow=850,fade=640,start=performance.now();
    const step=now=>{
      const e=now-start;
      let scale,opacity=1;
      if(e<open){const u=e/open;scale=.02+(1-Math.pow(1-u,2.2))*.98;}
      else if(e<open+hold)scale=1;
      else{
        const u=Math.min(1,(e-open-hold)/swallow);
        scale=1+(cover-1)*(u*u*(3-2*u));
        opacity=1-Math.min(1,Math.max(0,(e-open-hold-swallow+fade)/fade));
      }
      hole.setAttribute('transform','translate('+cx+' '+cy+') scale('+scale.toFixed(4)+')');
      svg.style.opacity=String(opacity);
      if(e<open+hold+swallow)veilFrame=requestAnimationFrame(step);else stopVeil();
    };
    veilFrame=requestAnimationFrame(step);
  }
  function stopVeil(){
    if(veilFrame){cancelAnimationFrame(veilFrame);veilFrame=0;}
    if(veil){veil.remove();veil=null;}
  }
  // Each trigger pushes a new wave into a four-slot ring buffer instead of
  // resetting one ring, so a pulse fired while another is still opening simply
  // overlaps it — no snap back to the centre, no hitch.
  function fireAperture(){apertures[3]=apertures[2];apertures[2]=apertures[1];apertures[1]=apertures[0];apertures[0]=0;surgePulse=1;}
  // Bring the instrument back to its default heading and size. The easing
  // carries the pose home rather than jumping, and a wave marks the moment.
  // Touching the scene hands control straight back to the visitor.
  function recenter(fire=true){if(stopped||reading())return;recentering=true;yawVelocity=pitchVelocity=0;if(fire)fireAperture();restart();}
  function draw(dt,now){
    const easing=dt?1-Math.exp(-dt*5):1,morph=transform(now),t=elapsed,step=dt||0;
    const pixelScroll=mobile()&&page!=='home'&&!reading()?scrollY:0;
    caption.style.translate='0 '+(-pixelScroll)+'px';
    const vh=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*10;
    // A click that never became a drag nudges the sculpture toward the pressed
    // point; the offset decays on its own so the instrument always drifts back
    // to its measured place.
    focusX*=Math.pow(.16,step);focusY*=Math.pow(.16,step);
    zoom=THREE.MathUtils.lerp(zoom,zoomTarget,easing*.6);
    root.position.x=THREE.MathUtils.lerp(root.position.x,layout.x+pointerX*(mobile()?.03:.085)+focusX,easing);
    root.position.y=THREE.MathUtils.lerp(root.position.y,layout.y+pixelScroll/height*vh+Math.sin(t*.48)*.055-pointerY*.05+focusY,easing);
    root.scale.setScalar(THREE.MathUtils.lerp(root.scale.x,layout.scale*zoom*(1+Math.sin(t*.38)*.005),easing));
    const strength=chapter==='projects'?1:chapter==='blog'?.75:.9;
    idleEuler.set(Math.sin(t*.25)*.065*strength,Math.sin(t*.21)*.13*strength,Math.sin(t*.18)*.037);
    idleRotation.setFromEuler(idleEuler);
    // Coming home: after a route change or a scroll away from the top, the pose
    // and the zoom ease back to neutral instead of snapping.
    if(recentering&&!dragging){
      const home=1-Math.pow(.10,step);
      spinYaw+=-spinYaw*home;spinPitch+=-spinPitch*home;zoomTarget+=(1-zoomTarget)*home;
      if(Math.abs(spinYaw)<2e-3&&Math.abs(spinPitch)<2e-3&&Math.abs(zoomTarget-1)<2e-3){spinYaw=0;spinPitch=0;zoomTarget=1;recentering=false;}
    }
    // Dragging turns the sculpture on two axes: yaw about the camera's own up
    // axis and pitch about its right axis, so the gesture always means the same
    // thing however the chapter is oriented. Each axis keeps its own inertia.
    if(!dragging&&(yawVelocity||pitchVelocity)){
      spinYaw+=yawVelocity;spinPitch=THREE.MathUtils.clamp(spinPitch+pitchVelocity,-1.15,1.15);
      const decay=Math.pow(.02,step);yawVelocity*=decay;pitchVelocity*=decay;
      if(Math.abs(yawVelocity)<1e-4)yawVelocity=0;if(Math.abs(pitchVelocity)<1e-4)pitchVelocity=0;
    }
    spinWorld.setFromEuler(spinEuler.set(spinPitch,spinYaw,0,'YXZ'));
    targetRotation.copy(spinWorld).multiply(rootTarget).multiply(idleRotation);root.quaternion.slerp(targetRotation,easing);
    camera.position.z=THREE.MathUtils.lerp(camera.position.z,10+morph*.48,easing);
    signalPosition.set(...signalTarget[chapter]);signal.position.lerp(signalPosition,easing);signal.rotation.y=t*.20;
    const forming=host.dataset.phase==='forming';
    fineOrbit.material.opacity=(chapter==='home'?.12:chapter==='about'?.065:.012)+(forming?.10:0);
    ticks.material.opacity=(chapter==='home'?.16:chapter==='about'?.10:.045)+(forming?.22:0);
    reticle.rotation.z=.3+t*.018;
    if(!transition&&host.dataset.phase==='settled')pieces.forEach((mesh,i)=>{
      mesh.position.set(0,0,0);mesh.quaternion.identity();
      if(chapter==='home'){mesh.position.z=Math.sin(t*.46-i*.25)*.014;mesh.rotation.z=Math.sin(t*.32-i*.16)*.009;}
      else if(chapter==='blog'){mesh.rotation.y=Math.sin(t*.42-i*.22)*.017;mesh.position.z=Math.sin(t*.42-i*.22)*.009;}
      else if(chapter==='about'){mesh.rotation.z=Math.sin(t*.50-i*.35)*.019;mesh.position.z=Math.sin(t*.50-i*.35)*.022;}
      else if(chapter==='projects'){mesh.rotation.y=Math.sin(t*.38-i*.21)*.021;mesh.position.y=Math.sin(t*.46-i*.29)*.013;}
      else if(chapter==='contact')mesh.position.x=Math.sin(t*.64-i*.33)*.028;
    });
    const atomOn=chapter==='projects'&&!transition&&host.dataset.phase==='settled'?1:0;
    for(const orbit of atomOrbits){
      orbit.ring.material.opacity=THREE.MathUtils.lerp(orbit.ring.material.opacity,atomOn*.14,easing*.5);
      orbit.angle+=step*orbit.speed;
      for(let k=0;k<orbit.bodies.length;k++){
        const body=orbit.bodies[k],a=orbit.angle+k*Math.PI*2/orbit.bodies.length;
        body.material.opacity=THREE.MathUtils.lerp(body.material.opacity,atomOn*.9,easing*.5);
        body.position.set(Math.cos(a)*orbit.radius,Math.sin(a)*orbit.radius,0);
      }
    }
    key.intensity=2.8+Math.sin(t*.36+.5)*.08+morph*.16;
    const accent=ACCENTS[chapter]||ACCENTS.home;
    // Each chapter runs its own light temperature, so no two sections share the
    // same colour cast.
    key.color.lerp(accentKey.set(accent.key),easing*.25);
    rim.color.lerp(accentRim.set(accent.rim),easing*.25);
    renderer.toneMappingExposure=THREE.MathUtils.lerp(renderer.toneMappingExposure,accent.exposure,easing*.4);
    brass.metalness=THREE.MathUtils.lerp(brass.metalness,accent.metal,easing*.4);
    porcelain.envMapIntensity=THREE.MathUtils.lerp(porcelain.envMapIntensity,accent.polish,easing*.4);
    // One sweep crosses the page every cycle, dragging a brightening of the
    // deep field with it; a click fires its own surge.
    sweepClock=(sweepClock+step)%11.5;
    const sweepPhase=sweepClock/2.8;
    const sweep=sweepPhase<1?-0.18+sweepPhase*1.36:-1;
    surgePulse=Math.max(0,surgePulse-step*.8);
    const surge=Math.max(Math.exp(-Math.pow((sweepClock-1.4)/.9,2))*.55,surgePulse);
    for(let i=0;i<4;i++)apertures[i]=Math.min(1,apertures[i]+step/1.05);
    cosmos.update(t,cosmosFrozen?0:step,surge);
    overlay.uniforms.uTime.value=t;
    overlay.uniforms.uSweep.value=sweep;
    overlay.uniforms.uAperture.value.set(apertures[0],apertures[1],apertures[2],apertures[3]);
    overlay.uniforms.uApertureOrigin.value.set(layout.px/width,1-layout.py/height);
    overlay.uniforms.uFocusRect.value.copy(focusRect);
    overlay.uniforms.uFocusAmount.value=focusAmount;
    overlay.uniforms.uIntensity.value=(forming?1.25:.95)*(mobile()?.70:1);
    renderer.clear();
    renderer.render(scene,camera);
    renderer.render(overlay.scene,overlay.camera);
    if(!reading()&&now-hudClock>52){
      hudClock=now;
      const defs=HUD_ANCHORS[chapter]||[];
      hud.update(defs.map(def=>({...def,pos:anchorPoint(chapter,def.i,def.t??.5)})),project,host.dataset.phase||'settled',width,elapsed);
    }
  }
  function loop(now){
    raf=0;
    if(stopped||lost||document.hidden){activity(stopped?'paused':lost?'fallback':'hidden');return;}
    const head=document.querySelector('.page-head'),limit=page==='home'?height*1.3:head?head.offsetHeight:height;
    if(reading()||(!transition&&scrollY>limit)){activity(reading()?'reading':'offscreen');return;}
    const interval=1000/(mobile()?30:45);
    if(last&&now-last<interval-1){raf=requestAnimationFrame(loop);return;}
    const dt=last?Math.min((now-last)/1000,.10):interval/1000;last=now;elapsed+=dt;draw(dt,now);
    activity(transition?'transition':'idle');
    if(dt>.05)slowFrames++;frames++;
    if(frames===120){
      // The ladder steps down one grade at a time so a machine that cannot hold
      // the frame rate loses the cheapest detail first: the fine grid, reticles
      // and telemetry drop out, then the pixel density halves, and only if it is
      // still struggling does the apparatus stop turning. The sculpture itself
      // never stops.
      if(slowFrames>80){
        if(qualityStep<1){qualityStep=1;overlay.uniforms.uQuality.value=1;host.dataset.quality='reduced';}
        else if(qualityStep<2&&dpr>1.25){qualityStep=2;dpr=1.25;renderer.setPixelRatio(dpr);cosmos.setDpr(dpr);host.dataset.quality='balanced';}
        else if(qualityStep<3){qualityStep=3;cosmosFrozen=true;host.dataset.quality='minimal';}
      }
      frames=slowFrames=0;
    }
    raf=requestAnimationFrame(loop);
  }
  // Reading routes keep the loop deliberately parked, so restarting has to
  // refuse there too — a scroll, a font swap or a restored context must never
  // wake it back up.
  function restart(){if(ready&&!raf&&!stopped&&!lost&&!document.hidden&&!reading()){last=0;raf=requestAnimationFrame(loop);}}
  function beginTransition(){
    transition={start:performance.now(),duration:1850,from:pieces.map(mesh=>({positions:new Float32Array(mesh.geometry.attributes.position.array),normals:new Float32Array(mesh.geometry.attributes.normal.array),offset:mesh.position.clone(),rotation:mesh.quaternion.clone()}))};
    host.dataset.phase='transforming';hideGuides();fireAperture();stopVeil();
    if(stopped||reading()){settle();draw(0,performance.now());activity(stopped?'paused':'reading');}else restart();
  }
  function setPage(next,{replay=false}={}){
    const nextChapter=chapterFor(next),changed=nextChapter!==chapter;page=next;chapter=nextChapter;scrollRecentered=false;setCaption();
    const wasX=layout.x,wasY=layout.y,wasScale=layout.scale;measure();
    const moved=wasX!==layout.x||wasY!==layout.y||wasScale!==layout.scale;
    const repaint=changed||replay||!shapes.has(chapter);
    if(repaint){
      const ticket=++revision;transition=null;
      if(shapes.has(chapter))beginTransition();
      else{host.dataset.phase='preparing';prepareShape(chapter).then(()=>{if(ticket===revision)beginTransition();});}
    }
    // Arriving from a page the visitor had turned by hand: ease the instrument
    // back to its default heading and size as the new chapter settles.
    if(changed)recenter(false);
    // A parked route is painted once when it is entered. The router calls in
    // again after its exit animation with the same page; unless the sculpture
    // actually moved, that call must not paint a second frame, because a
    // reading route is meant to be completely still.
    if(stopped||reading()){if(!repaint&&!moved)return;if(shapes.has(chapter))settle();draw(0,performance.now());activity(stopped?'paused':'reading');}else restart();
  }
  function setHud(lines){
    hudLines=Array.isArray(lines)?lines:hudLines;
    hud.setChapter(CHAPTERS[chapter],hudLines);
  }
  setCaption();host.dataset.phase='settled';resize();
  await yieldToPage();await renderer.compileAsync(scene,camera);await renderer.compileAsync(overlay.scene,overlay.camera);ready=true;
  host.dataset.renderer='webgl';document.documentElement.classList.add('webgl-ready');
  if(stopped||reading()){host.dataset.phase='settled';draw(0,performance.now());activity(stopped?'paused':'reading');}
  else{startGenesis();playVeil();}
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{
    // Leaving the top of the homepage settles the instrument back to neutral.
    if(page==='home'){if(scrollY>140&&!scrollRecentered){scrollRecentered=true;recenter(true);}else if(scrollY<60)scrollRecentered=false;}
    if(reading())return;
    if(stopped&&mobile()&&page!=='home')draw(0,performance.now());else restart();
  },{passive:true});
  const overUi=target=>target instanceof Element&&target.closest(INTERACTIVE);
  // Turning the instrument: horizontal motion is yaw about the camera's up
  // axis, vertical motion is pitch about its right axis. Both are clamped and
  // both carry inertia on release.
  const orbit=(dx,dy)=>{
    recentering=false;
    spinYaw+=dx*.0055;spinPitch=THREE.MathUtils.clamp(spinPitch+dy*.0040,-1.15,1.15);
    yawVelocity=THREE.MathUtils.clamp(dx*.0050,-.20,.20);
    pitchVelocity=THREE.MathUtils.clamp(dy*.0036,-.16,.16);
  };
  const pinchDistance=()=>{const p=[...pointers.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);};
  addEventListener('pointerdown',e=>{
    if(stopped||overUi(e.target))return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){pinchStart=pinchDistance();pinchZoomStart=zoomTarget;dragging=false;return;}
    if(pointers.size>2)return;
    if(e.pointerType!=='touch'&&e.button!==0)return;
    dragging=true;dragX=e.clientX;dragY=e.clientY;dragMoved=0;yawVelocity=pitchVelocity=0;recentering=false;
  },{passive:true});
  addEventListener('pointermove',e=>{
    if(e.pointerType!=='touch'){pointerX=e.clientX/width*2-1;pointerY=e.clientY/height*2-1;}
    if(stopped)return;
    if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size>=2){
      const d=pinchDistance();
      if(pinchStart>0&&d>0){recentering=false;zoomTarget=THREE.MathUtils.clamp(pinchZoomStart*pinchStart/d,.62,1.9);}
      return;
    }
    if(!dragging)return;
    const dx=e.clientX-dragX,dy=e.clientY-dragY;dragX=e.clientX;dragY=e.clientY;dragMoved+=Math.abs(dx)+Math.abs(dy);
    orbit(dx,dy);
  },{passive:true});
  const endDrag=e=>{
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinchStart=0;
    // A press that never became a drag is a click: answer it with a full-page
    // aperture pulse and a small lean toward the point that was pressed.
    if(dragging&&dragMoved<8&&!overUi(e.target)){
      fireAperture();
      focusX=THREE.MathUtils.clamp((e.clientX/width-.5)*.16,-.14,.14);
      focusY=THREE.MathUtils.clamp((.5-e.clientY/height)*.16,-.14,.14);
    }
    dragging=false;
  };
  addEventListener('pointerup',endDrag,{passive:true});
  addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);if(pointers.size<2)pinchStart=0;dragging=false;},{passive:true});
  // A wheel near the sculpture zooms the instrument; a wheel over the copy is
  // left alone so the page still scrolls normally.
  addEventListener('wheel',e=>{
    if(stopped||overUi(e.target))return;
    const near=Math.hypot(e.clientX-layout.px,e.clientY-layout.py)<Math.max(240,width*.24);
    if(!near)return;
    e.preventDefault();
    recentering=false;zoomTarget=THREE.MathUtils.clamp(zoomTarget*(1-Math.sign(e.deltaY)*.09),.62,1.9);
  },{passive:false});
  // Two fingers on a touch screen are a pinch, never a scroll.
  addEventListener('touchmove',e=>{if(!stopped&&e.touches.length>=2)e.preventDefault();},{passive:false});
  document.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;stopVeil();activity('hidden');}else restart();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;stopVeil();document.documentElement.classList.remove('webgl-ready');host.dataset.renderer='fallback';host.dataset.loadState='fallback';activity('fallback');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;draw(0,performance.now());document.documentElement.classList.add('webgl-ready');host.dataset.renderer='webgl';host.dataset.loadState='ready';restart();});
  // A late font swap re-measures the scene, but it must never paint a frame on
  // a reading route, where the loop is deliberately parked.
  const fontsReady=()=>{measure();if(!reading()&&!stopped&&!lost&&!document.hidden)draw(0,performance.now());restart();};document.fonts?.ready.then(fontsReady);document.fonts?.addEventListener('loadingdone',fontsReady);
  const warm=async()=>{for(const k of Object.keys(CHAPTERS)){if(document.hidden)return;await prepareShape(k);}};
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:2500});else setTimeout(warm,800);
  return {setPage,setHud,setPaused(value){stopped=value;if(value){cancelAnimationFrame(raf);raf=0;pointerX=pointerY=0;yawVelocity=pitchVelocity=0;focusX=focusY=0;pointers.clear();pinchStart=0;recentering=false;stopVeil();if(shapes.has(chapter))settle();draw(0,performance.now());activity('paused');}else restart();}};
}
