import * as THREE from './vendor/three.module.js';
import {CHAPTERS,PIECES,chapterFor,createShape,createRibbonGeometry,createEngraving} from './sculptures.js';

export function createObservatory(host,{paused=false}={}) {
  let page=document.body.dataset.page||'home',chapter=chapterFor(page),stopped=paused;
  const caption=document.createElement('div');caption.className='sculpture-caption';
  caption.innerHTML='<span class="sculpture-index"></span><div><span class="sculpture-name"></span><span class="sculpture-subtitle"></span></div><i></i>';
  host.appendChild(caption);
  const setCaption=()=>{
    const item=CHAPTERS[chapter];caption.querySelector('.sculpture-index').textContent=item.number;
    caption.querySelector('.sculpture-name').textContent=item.name;caption.querySelector('.sculpture-subtitle').textContent=item.label;
    host.dataset.chapter=chapter;host.dataset.reading=String(['post','doc','write'].includes(page));
  };
  let renderer;
  try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}
  catch {setCaption();host.dataset.renderer='fallback';return {setPage(next){page=next;chapter=chapterFor(next);setCaption();},setPaused(){}};}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
  renderer.setClearColor(0x080f14,0);renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,80);camera.position.z=10;
  const root=new THREE.Group();scene.add(root);
  let width=innerWidth,height=innerHeight,dpr=1,raf=0,last=0,elapsed=0,lost=false;
  let pointerX=0,pointerY=0,frames=0,slowFrames=0,transition=null;
  let layout={x:0,y:0,scale:1},rootTarget=new THREE.Quaternion();
  const reading=()=>['post','doc','write'].includes(page);
  const mobile=()=>innerWidth<=760;
  const smooth=(a,b,x)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

  // Broad studio light, narrow reflection strips, and a dark side to describe thickness.
  const studio=new THREE.Scene();studio.background=new THREE.Color('#16292e');
  for(const [color,intensity,size,position] of [
    ['#eef0e8',3.3,[4,9],[-4,5,5]],['#b8d8cd',2.0,[1.8,8],[5,2,3]],
    ['#d5bd91',2.4,[6,.8],[0,-4,3]],['#8eafb6',1.7,[2,7],[-2,1,-5]],
  ]){
    const box=new THREE.Mesh(new THREE.PlaneGeometry(...size),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),side:THREE.DoubleSide}));
    box.position.set(...position);box.lookAt(0,0,0);studio.add(box);
  }
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(studio,.05,.1,40);scene.environment=environment.texture;
  studio.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#d2e6dc','#13202c',1.65));
  const key=new THREE.DirectionalLight('#f2ebdc',3.6);key.position.set(-3,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#b3d4ce',2.4);rim.position.set(4,0,-3);scene.add(rim);

  const porcelain=new THREE.MeshPhysicalMaterial({color:'#a0b8af',metalness:.16,roughness:.30,clearcoat:.65,clearcoatRoughness:.24,envMapIntensity:.80,side:THREE.DoubleSide});
  porcelain.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec2 vRibbonUV;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRibbonUV=uv;');
    shader.fragmentShader='varying vec2 vRibbonUV;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nfloat grain=fract(sin(dot(vRibbonUV*vec2(311.0,1703.0),vec2(12.9898,78.233)))*43758.5453);roughnessFactor=clamp(roughnessFactor+(grain-.5)*.065,.12,.8);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat glazeline=sin(vRibbonUV.y*520.0)*sin(vRibbonUV.y*117.0);diffuseColor.rgb*=.99+glazeline*.009;');
  };
  const brass=new THREE.MeshPhysicalMaterial({color:'#bda77b',metalness:.94,roughness:.29,anisotropy:.35,envMapIntensity:.85,side:THREE.DoubleSide});
  const crystal=new THREE.MeshPhysicalMaterial({color:'#bdd7cc',transmission:.82,thickness:.12,ior:1.35,roughness:.14,envMapIntensity:.75,attenuationColor:'#a5c8bc',attenuationDistance:1.5,side:THREE.DoubleSide});
  const graphite=new THREE.MeshPhysicalMaterial({color:'#567c76',metalness:.68,roughness:.25,clearcoat:.4,envMapIntensity:1.0,side:THREE.DoubleSide});
  const shapes=Object.fromEntries(Object.keys(CHAPTERS).map(key=>[key,Array.from({length:PIECES},(_,i)=>createShape(key,i))]));
  const pieces=Array.from({length:PIECES},(_,i)=>{
    const geometry=createRibbonGeometry(shapes[chapter][i]);
    const material=i===1||i===8?brass:i===2||i===7?crystal:i===5?graphite:porcelain;
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;
    const line=new THREE.LineSegments(createEngraving(geometry,i),new THREE.LineBasicMaterial({color:i===1||i===8?'#ecd3a1':'#bed6cb',transparent:true,opacity:i===5?.40:.17}));line.frustumCulled=false;mesh.add(line);root.add(mesh);
    return mesh;
  });
  const signal=new THREE.Mesh(new THREE.OctahedronGeometry(.063),brass);root.add(signal);
  const signalTarget={home:[0,0,0],blog:[0,-.05,.25],projects:[1.43,1.43,1.43],about:[0,0,.18],contact:[-1.48,0,.15]};
  const fineOrbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:160},(_,i)=>{const a=i/160*Math.PI*2;return new THREE.Vector3(Math.cos(a)*2.50,Math.sin(a)*2.50,0);})),new THREE.LineBasicMaterial({color:'#bba777',transparent:true,opacity:.18}));
  fineOrbit.rotation.set(.9,.3,.3);root.add(fineOrbit);

  // The distant field stays subordinate to the sculpture and has no large point sprites.
  let seed=2300;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const starPositions=[],starSizes=[],starPhases=[];
  for(let i=0;i<(mobile()?420:800);i++){starPositions.push((random()-.5)*42,(random()-.5)*28,-2-random()*26);starSizes.push(.8+random()*1.4);starPhases.push(random()*6.28);}
  const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));starsGeometry.setAttribute('aSize',new THREE.Float32BufferAttribute(starSizes,1));starsGeometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(starPhases,1));
  const starsMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uDpr:{value:1}},vertexShader:'attribute float aSize;attribute float aPhase;uniform float uTime;uniform float uDpr;varying float vAlpha;void main(){vec3 p=position;p.x+=sin(uTime*.025+aPhase)*.08;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aSize*uDpr*min(1.5,10./-mv.z);vAlpha=(.24+.12*sin(uTime*.22+aPhase))*min(1.,16./-mv.z);}',fragmentShader:'varying float vAlpha;void main(){float a=smoothstep(.5,.04,length(gl_PointCoord-.5))*vAlpha;gl_FragColor=vec4(.70,.82,.79,a);}'});
  scene.add(new THREE.Points(starsGeometry,starsMaterial));

  function measure(){
    width=innerWidth;height=innerHeight;camera.aspect=width/height;camera.updateProjectionMatrix();
    const vh=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*10,vw=vh*camera.aspect;
    const head=document.querySelector('.page-head');
    let centreX,centreY,scale;
    if(page==='home'){
      centreX=mobile()?width*.53:width*.755;centreY=mobile()?Math.min(height*.67,585):height*.455;
      scale=mobile()?vw/5.25:Math.min(vw/11.8,1.1);
    }else if(mobile()&&!reading()&&head){
      centreX=width*.53;centreY=head.getBoundingClientRect().bottom+scrollY-175;scale=Math.min(vw/7.1,.60);
    }else{
      centreX=width*.79;centreY=Math.min(310,height*.37);scale=Math.min(vw/15.8,.77);
    }
    layout={x:(centreX/width-.5)*vw,y:(.5-centreY/height)*vh,scale};
    const angles=CHAPTERS[chapter].rotation;rootTarget.setFromEuler(new THREE.Euler(...angles));
    caption.style.left=(mobile()?24:Math.max(width*.635,centreX-180))+'px';
    const radiusPixels=2.35*scale*height/vh;
    caption.style.top=(page==='home'?Math.min(height-110,centreY+radiusPixels+24):centreY+(mobile()?133:195))+'px';
  }
  function resize(){
    dpr=Math.min(devicePixelRatio||1,mobile()?1.25:1.6);renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);starsMaterial.uniforms.uDpr.value=dpr;
    measure();draw(0,performance.now());restart();
  }
  function settle(){
    for(let i=0;i<PIECES;i++){
      const mesh=pieces[i],shape=shapes[chapter][i];
      mesh.geometry.attributes.position.array.set(shape.positions);mesh.geometry.attributes.normal.array.set(shape.normals);
      mesh.geometry.attributes.position.needsUpdate=true;mesh.geometry.attributes.normal.needsUpdate=true;mesh.position.set(0,0,0);mesh.quaternion.identity();
    }
    transition=null;host.dataset.phase='settled';host.style.setProperty('--morph',0);
  }
  function transform(now){
    if(!transition)return 0;
    const progress=THREE.MathUtils.clamp((now-transition.start)/transition.duration,0,1);
    for(let i=0;i<PIECES;i++){
      const p=THREE.MathUtils.clamp((progress-i*.018)/(1-(PIECES-1)*.018),0,1),u=smooth(.08,.92,p),burst=Math.sin(Math.PI*p);
      const mesh=pieces[i],source=transition.from[i],dest=shapes[chapter][i];
      const pos=mesh.geometry.attributes.position,norm=mesh.geometry.attributes.normal;
      for(let j=0;j<pos.array.length;j++){pos.array[j]=source.positions[j]+(dest.positions[j]-source.positions[j])*u;norm.array[j]=source.normals[j]+(dest.normals[j]-source.normals[j])*u;}
      pos.needsUpdate=true;norm.needsUpdate=true;
      const a=i/PIECES*Math.PI*2;
      mesh.position.set(source.offset.x*(1-u)+Math.cos(a)*burst*.29,source.offset.y*(1-u)+Math.sin(a)*burst*.29,source.offset.z*(1-u)+Math.sin(i*1.71)*burst*.32);
      mesh.quaternion.copy(source.rotation).slerp(new THREE.Quaternion(),u);
      mesh.rotateY(burst*(i%2?1:-1)*.28);mesh.rotateZ(burst*.09*Math.sin(a));
    }
    host.style.setProperty('--morph',Math.sin(progress*Math.PI).toFixed(3));
    if(progress===1)settle();
    return Math.sin(progress*Math.PI);
  }
  function draw(dt,now){
    const easing=dt?1-Math.exp(-dt*5):1,morph=transform(now);
    const pixelScroll=mobile()&&page!=='home'&&!reading()?scrollY:0;
    caption.style.translate='0 '+(-pixelScroll)+'px';
    const vh=2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*10;
    root.position.x=THREE.MathUtils.lerp(root.position.x,layout.x+pointerX*(mobile()?.025:.075),easing);
    root.position.y=THREE.MathUtils.lerp(root.position.y,layout.y+pixelScroll/height*vh+Math.sin(elapsed*.48)*.027-pointerY*.045,easing);
    root.scale.setScalar(THREE.MathUtils.lerp(root.scale.x,layout.scale*(1+Math.sin(elapsed*.48)*.006),easing));
    const idle=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(elapsed*.09)*.033,Math.sin(elapsed*.12)*.048,Math.sin(elapsed*.10)*.022));
    root.quaternion.slerp(rootTarget.clone().multiply(idle),easing);
    camera.position.z=THREE.MathUtils.lerp(camera.position.z,10+morph*.7,easing);
    const point=signalTarget[chapter];signal.position.lerp(new THREE.Vector3(...point),easing);signal.rotation.y=elapsed*.3;
    fineOrbit.material.opacity=chapter==='home'?.16:chapter==='about'?.08:.015;
    fineOrbit.rotation.z=.3+elapsed*.012;
    if(chapter==='contact'&&!transition){pieces.forEach((mesh,i)=>{mesh.position.x=Math.sin(elapsed*.9-i*.38)*.014;});}
    key.intensity=3.6+Math.sin(elapsed*.48+.5)*.13+morph*.25;
    starsMaterial.uniforms.uTime.value=elapsed;renderer.render(scene,camera);
  }
  function loop(now){
    raf=0;if(stopped||lost||document.hidden)return;
    const head=document.querySelector('.page-head'),limit=page==='home'?height*1.3:head?head.offsetHeight:height;
    if(!transition&&(reading()||scrollY>limit))return;
    const dt=last?Math.min((now-last)/1000,.06):1/60;last=now;elapsed+=dt;draw(dt,now);
    if(dt>.027)slowFrames++;frames++;
    if(frames===180){if(slowFrames>100&&dpr>1){dpr=1;renderer.setPixelRatio(1);starsMaterial.uniforms.uDpr.value=1;host.dataset.quality='balanced';}frames=slowFrames=0;}
    if(!reading()||transition)raf=requestAnimationFrame(loop);
  }
  function restart(){if(!raf&&!stopped&&!lost&&!document.hidden){last=0;raf=requestAnimationFrame(loop);}}
  function setPage(next,{replay=false}={}){
    const nextChapter=chapterFor(next),changed=nextChapter!==chapter;
    page=next;chapter=nextChapter;setCaption();measure();
    if(changed||replay){
      host.dataset.phase=stopped?'settled':'transforming';
      transition={start:performance.now(),duration:1650,from:pieces.map(mesh=>({positions:new Float32Array(mesh.geometry.attributes.position.array),normals:new Float32Array(mesh.geometry.attributes.normal.array),offset:mesh.position.clone(),rotation:mesh.quaternion.clone()}))};
      if(stopped)settle();
    }
    if(stopped){draw(0,performance.now());}else restart();
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{if(stopped&&mobile()&&page!=='home')draw(0,performance.now());else restart();},{passive:true});
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointerX=e.clientX/width*2-1;pointerY=e.clientY/height*2-1;},{passive:true});
  document.addEventListener('pointerleave',()=>{pointerX=pointerY=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else restart();});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;document.documentElement.classList.remove('webgl-ready');host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;document.documentElement.classList.add('webgl-ready');host.dataset.renderer='webgl';draw(0,performance.now());restart();});
  document.fonts?.ready.then(()=>{measure();draw(0,performance.now());restart();});
  setCaption();host.dataset.phase='settled';resize();document.documentElement.classList.add('webgl-ready');host.dataset.renderer='webgl';
  return {setPage,replay(){setPage(page,{replay:true});},setPaused(value){stopped=value;if(value){cancelAnimationFrame(raf);raf=0;settle();draw(0,performance.now());}else restart();}};
}
