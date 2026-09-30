import * as THREE from './vendor/three.module.js';
import {CHAPTERS,PIECES,chapterFor,createShape,createRibbonGeometry,createEngraving} from './sculptures.js';

const yieldToPage=()=>new Promise(resolve=>setTimeout(resolve,0));

export async function createObservatory(host,{paused=false}={}) {
  let page=document.body.dataset.page||'home',chapter=chapterFor(page),stopped=paused;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'default'});}
  catch{host.dataset.renderer='fallback';return {setPage(next){host.dataset.chapter=chapterFor(next);host.dataset.reading=String(['post','doc','write'].includes(next));},setPaused(){}};}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  renderer.setClearColor(0x080f14,0);renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,80);camera.position.z=10;
  const root=new THREE.Group();scene.add(root);
  let width=innerWidth,height=innerHeight,dpr=1,raf=0,last=0,elapsed=0,lost=false,ready=false;
  let pointerX=0,pointerY=0,frames=0,slowFrames=0,transition=null,revision=0;
  let layout={x:0,y:0,scale:1};
  const rootTarget=new THREE.Quaternion(),idleRotation=new THREE.Quaternion(),idleEuler=new THREE.Euler(),targetRotation=new THREE.Quaternion(),identity=new THREE.Quaternion(),signalPosition=new THREE.Vector3();
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
  const porcelain=new THREE.MeshPhysicalMaterial({color:'#9fbab0',metalness:.12,roughness:.34,clearcoat:.55,clearcoatRoughness:.28,envMapIntensity:.78});
  const brass=new THREE.MeshStandardMaterial({color:'#bda77b',metalness:.86,roughness:.31,envMapIntensity:.78});
  const pearl=new THREE.MeshPhysicalMaterial({color:'#c1d3c8',metalness:.20,roughness:.29,clearcoat:.65,clearcoatRoughness:.24,envMapIntensity:.75});
  const graphite=new THREE.MeshPhysicalMaterial({color:'#466f68',metalness:.48,roughness:.32,clearcoat:.35,envMapIntensity:.80});
  await prepareShape(chapter);
  const pieces=[];
  for(let i=0;i<PIECES;i++){
    const geometry=createRibbonGeometry(shapes.get(chapter)[i]);
    const material=i===1||i===8?brass:i===2||i===7?pearl:i===5?graphite:porcelain;
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;
    const line=new THREE.LineSegments(createEngraving(geometry,i),new THREE.LineBasicMaterial({color:i===1||i===8?'#ddc89e':'#c2d7cd',transparent:true,opacity:i===5?.20:.10}));line.frustumCulled=false;mesh.add(line);root.add(mesh);pieces.push(mesh);
    if(i%2===1)await yieldToPage();
  }
  const signal=new THREE.Mesh(new THREE.IcosahedronGeometry(.048,1),brass);root.add(signal);
  const signalTarget={home:[0,0,0],blog:[0,-.05,.25],projects:[1.43,1.43,1.43],about:[0,0,.18],contact:[-1.48,0,.15]};
  const fineOrbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:256},(_,i)=>{const a=i/256*Math.PI*2;return new THREE.Vector3(Math.cos(a)*2.50,Math.sin(a)*2.50,0);})),new THREE.LineBasicMaterial({color:'#bba777',transparent:true,opacity:.12}));
  fineOrbit.rotation.set(.9,.3,.3);root.add(fineOrbit);
  let seed=2300;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const starPositions=[],starSizes=[],starPhases=[];
  for(let i=0;i<(mobile()?260:480);i++){starPositions.push((random()-.5)*42,(random()-.5)*28,-2-random()*26);starSizes.push(.7+random()*1.1);starPhases.push(random()*6.28);}
  const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));starsGeometry.setAttribute('aSize',new THREE.Float32BufferAttribute(starSizes,1));starsGeometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(starPhases,1));
  const starsMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uDpr:{value:1}},vertexShader:'attribute float aSize;attribute float aPhase;uniform float uTime;uniform float uDpr;varying float vAlpha;void main(){vec3 p=position;p.x+=sin(uTime*.025+aPhase)*.08;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uDpr*min(1.5,10./-mv.z);vAlpha=(.20+.09*sin(uTime*.22+aPhase))*min(1.,16./-mv.z);}',fragmentShader:'varying float vAlpha;void main(){float a=smoothstep(.5,.04,length(gl_PointCoord-.5))*vAlpha;gl_FragColor=vec4(.70,.82,.79,a);}'});
  scene.add(new THREE.Points(starsGeometry,starsMaterial));
  const caption=document.createElement('div');caption.className='sculpture-caption';
  caption.innerHTML='<span class="sculpture-index"></span><div><span class="sculpture-name"></span><span class="sculpture-subtitle"></span></div><i></i>';host.appendChild(caption);
  function setCaption(){
    const item=CHAPTERS[chapter];caption.querySelector('.sculpture-index').textContent=item.number;
    caption.querySelector('.sculpture-name').textContent=item.name;caption.querySelector('.sculpture-subtitle').textContent=item.label;
    host.dataset.chapter=chapter;host.dataset.reading=String(reading());
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
    layout={x:(centreX/width-.5)*vw,y:(.5-centreY/height)*vh,scale};
    rootTarget.setFromEuler(new THREE.Euler(...CHAPTERS[chapter].rotation));
    host.style.setProperty('--scene-x',centreX+'px');host.style.setProperty('--scene-y',centreY+'px');
    caption.style.left=(mobile()?24:Math.max(width*.635,centreX-180))+'px';
    const radiusPixels=2.35*scale*height/vh;
    caption.style.top=(page==='home'?Math.min(height-110,centreY+radiusPixels+24):centreY+(mobile()?133:195))+'px';
  }
  function resize(){
    dpr=Math.min(devicePixelRatio||1,mobile()?1.5:1.8);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);starsMaterial.uniforms.uDpr.value=dpr;
    measure();if(ready){draw(0,performance.now());restart();}
  }
  function settle(){
    const shape=shapes.get(chapter);if(!shape)return;
    for(let i=0;i<PIECES;i++){
      const mesh=pieces[i];mesh.geometry.attributes.position.array.set(shape[i].positions);mesh.geometry.attributes.normal.array.set(shape[i].normals);
      mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.attributes.normal.needsUpdate=true;mesh.position.set(0,0,0);mesh.quaternion.identity();
    }
    transition=null;host.dataset.phase='settled';host.style.setProperty('--morph',0);
  }
  function transform(now){
    if(!transition)return 0;
    const progress=THREE.MathUtils.clamp((now-transition.start)/transition.duration,0,1);
    for(let i=0;i<PIECES;i++){
      const p=THREE.MathUtils.clamp((progress-i*.016)/(1-(PIECES-1)*.016),0,1),u=smooth(.06,.94,p),burst=Math.sin(Math.PI*p);
      const mesh=pieces[i],source=transition.from[i],dest=shapes.get(chapter)[i],pos=mesh.geometry.attributes.position,norm=mesh.geometry.attributes.normal;
      for(let j=0;j<pos.array.length;j++){pos.array[j]=source.positions[j]+(dest.positions[j]-source.positions[j])*u;norm.array[j]=source.normals[j]+(dest.normals[j]-source.normals[j])*u;}
      pos.needsUpdate=true;norm.needsUpdate=true;const a=i/PIECES*Math.PI*2;
      mesh.position.set(source.offset.x*(1-u)+Math.cos(a)*burst*.22,source.offset.y*(1-u)+Math.sin(a)*burst*.22,source.offset.z*(1-u)+Math.sin(i*1.71)*burst*.24);
      mesh.quaternion.copy(source.rotation).slerp(identity,u);mesh.rotateY(burst*(i%2?1:-1)*.20);mesh.rotateZ(burst*.065*Math.sin(a));
    }
    host.style.setProperty('--morph',Math.sin(progress*Math.PI).toFixed(3));
    if(progress===1)settle();return Math.sin(progress*Math.PI);
  }
  function draw(dt,now){
    const easing=dt?1-Math.exp(-dt*5):1,morph=transform(now),t=elapsed;
    const pixelScroll=mobile()&&page!=='home'&&!reading()?scrollY:0;
    caption.style.translate='0 '+(-pixelScroll)+'px';
    const vh=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*10;
    root.position.x=THREE.MathUtils.lerp(root.position.x,layout.x+pointerX*(mobile()?.02:.065),easing);
    root.position.y=THREE.MathUtils.lerp(root.position.y,layout.y+pixelScroll/height*vh+Math.sin(t*.48)*.055-pointerY*.035,easing);
    root.scale.setScalar(THREE.MathUtils.lerp(root.scale.x,layout.scale*(1+Math.sin(t*.38)*.005),easing));
    const strength=chapter==='projects'?1:chapter==='blog'?.75:.9;
    idleEuler.set(Math.sin(t*.25)*.065*strength,Math.sin(t*.21)*.13*strength,Math.sin(t*.18)*.037);
    idleRotation.setFromEuler(idleEuler);targetRotation.copy(rootTarget).multiply(idleRotation);root.quaternion.slerp(targetRotation,easing);
    camera.position.z=THREE.MathUtils.lerp(camera.position.z,10+morph*.48,easing);
    signalPosition.set(...signalTarget[chapter]);signal.position.lerp(signalPosition,easing);signal.rotation.y=t*.20;
    fineOrbit.material.opacity=chapter==='home'?.12:chapter==='about'?.065:.012;fineOrbit.rotation.z=.3+t*.018;
    if(!transition&&host.dataset.phase==='settled')pieces.forEach((mesh,i)=>{
      mesh.position.set(0,0,0);mesh.quaternion.identity();
      if(chapter==='home'){mesh.position.z=Math.sin(t*.46-i*.25)*.014;mesh.rotation.z=Math.sin(t*.32-i*.16)*.009;}
      else if(chapter==='blog'){mesh.rotation.y=Math.sin(t*.42-i*.22)*.017;mesh.position.z=Math.sin(t*.42-i*.22)*.009;}
      else if(chapter==='about'){mesh.rotation.z=Math.sin(t*.50-i*.35)*.019;mesh.position.z=Math.sin(t*.50-i*.35)*.022;}
      else if(chapter==='contact')mesh.position.x=Math.sin(t*.64-i*.33)*.028;
    });
    key.intensity=2.8+Math.sin(t*.36+.5)*.08+morph*.16;
    starsMaterial.uniforms.uTime.value=t;renderer.render(scene,camera);
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
    if(frames===120){if(slowFrames>80&&dpr>1.25){dpr=1.25;renderer.setPixelRatio(dpr);starsMaterial.uniforms.uDpr.value=dpr;host.dataset.quality='balanced';}frames=slowFrames=0;}
    raf=requestAnimationFrame(loop);
  }
  function restart(){if(ready&&!raf&&!stopped&&!lost&&!document.hidden){last=0;raf=requestAnimationFrame(loop);}}
  function beginTransition(){
    transition={start:performance.now(),duration:1850,from:pieces.map(mesh=>({positions:new Float32Array(mesh.geometry.attributes.position.array),normals:new Float32Array(mesh.geometry.attributes.normal.array),offset:mesh.position.clone(),rotation:mesh.quaternion.clone()}))};
    host.dataset.phase='transforming';
    if(stopped||reading()){settle();draw(0,performance.now());activity(stopped?'paused':'reading');}else restart();
  }
  function setPage(next,{replay=false}={}){
    const nextChapter=chapterFor(next),changed=nextChapter!==chapter;page=next;chapter=nextChapter;setCaption();measure();
    if(changed||replay||!shapes.has(chapter)){
      const ticket=++revision;transition=null;
      if(shapes.has(chapter))beginTransition();
      else{host.dataset.phase='preparing';prepareShape(chapter).then(()=>{if(ticket===revision)beginTransition();});}
    }
    if(stopped||reading()){if(shapes.has(chapter))settle();draw(0,performance.now());activity(stopped?'paused':'reading');}else restart();
  }
  setCaption();host.dataset.phase='settled';resize();
  await yieldToPage();await renderer.compileAsync(scene,camera);ready=true;draw(0,performance.now());
  host.dataset.renderer='webgl';document.documentElement.classList.add('webgl-ready');
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{if(stopped&&mobile()&&page!=='home')draw(0,performance.now());else restart();},{passive:true});
  addEventListener('pointermove',e=>{if(stopped||e.pointerType==='touch')return;pointerX=e.clientX/width*2-1;pointerY=e.clientY/height*2-1;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;activity('hidden');}else restart();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;document.documentElement.classList.remove('webgl-ready');host.dataset.renderer='fallback';host.dataset.loadState='fallback';activity('fallback');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;draw(0,performance.now());document.documentElement.classList.add('webgl-ready');host.dataset.renderer='webgl';host.dataset.loadState='ready';restart();});
  const fontsReady=()=>{measure();draw(0,performance.now());restart();};document.fonts?.ready.then(fontsReady);document.fonts?.addEventListener('loadingdone',fontsReady);
  const warm=async()=>{for(const key of Object.keys(CHAPTERS)){if(document.hidden)return;await prepareShape(key);}};
  if('requestIdleCallback' in window)requestIdleCallback(warm,{timeout:2500});else setTimeout(warm,800);
  return {setPage,setPaused(value){stopped=value;if(value){cancelAnimationFrame(raf);raf=0;pointerX=pointerY=0;if(shapes.has(chapter))settle();draw(0,performance.now());activity('paused');}else restart();}};
}
