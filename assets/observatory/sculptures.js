import * as THREE from './vendor/three.module.js';

// Each chapter is an astronomical instrument, not a generic solid. The same
// ten ribbons always keep the same topology so every transition stays continuous.
export const CHAPTERS = Object.freeze({
  home: { number: '00', name: 'The armillary', label: '首页 · 浑天', rotation: [.57, -.40, -.30] },
  blog: { number: '01', name: 'The ledger', label: '文章 · 篇章', rotation: [.24, -.46, -.13] },
  projects: { number: '02', name: 'The lattice', label: '项目 · 构筑', rotation: [.42, -.57, -.16] },
  about: { number: '03', name: 'The compass rose', label: '关于 · 星芒', rotation: [.40, -.28, .08] },
  contact: { number: '04', name: 'The signal', label: '联系 · 回响', rotation: [.18, -.30, -.12] },
});
export const chapterFor = page => CHAPTERS[page] ? page : 'blog';
export const PIECES = 10;
const SEGMENTS = 168, CORNER_STEPS = 6, PROFILE = CORNER_STEPS * 4;
const ringVertices = (SEGMENTS + 1) * PROFILE;
const firstCap = ringVertices, lastCap = firstCap + PROFILE + 1;
const VERTICES = lastCap + PROFILE + 1;
const TAU = Math.PI * 2;
const normalize = v => { const length = Math.hypot(...v) || 1; return v.map(x => x / length); };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const gold = i => i === 1 || i === 8;

// Three armillary bands, each tilted and spun differently so the home chapter
// reads as an orrery: nested rings crossed around a polar axis.
const BANDS = [
  { tilt: 1.04, spin: .28, radius: .94, phase: 0 },
  { tilt: -.12, spin: 1.06, radius: 1.50, phase: .72 },
  { tilt: -.82, spin: 1.74, radius: 2.02, phase: 1.90 },
];
const bandAxis = band => normalize([Math.cos(band.tilt)*Math.sin(band.spin), -Math.sin(band.tilt), Math.cos(band.tilt)*Math.cos(band.spin)]);

function roundedSquare(t) {
  const extent=1.43,radius=.38,straight=2*(extent-radius),arc=Math.PI*radius/2;
  const distance=t*4*(straight+arc),side=Math.floor(distance/(straight+arc))%4,part=distance%(straight+arc);
  let x,y;
  if(part<straight){x=extent;y=-extent+radius+part;}
  else{const angle=(part-straight)/radius;x=extent-radius+Math.cos(angle)*radius;y=extent-radius+Math.sin(angle)*radius;}
  const angle=side*Math.PI/2;
  return [x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
}

function centre(chapter,i,t) {
  if (chapter === 'home') {
    // The polar axis runs through the middle of the crossed bands.
    if (i === 9) return [0, -1.95 + t * 3.9, 0];
    const band = BANDS[Math.floor(i / 3)], k = i % 3;
    const a = t * TAU * .985 + band.phase + k * .012, r = band.radius + k * .05;
    const x0 = Math.cos(a) * r, y0 = Math.sin(a) * r;
    const y1 = y0 * Math.cos(band.tilt), z1 = y0 * Math.sin(band.tilt);
    return [x0 * Math.cos(band.spin) + z1 * Math.sin(band.spin), y1, -x0 * Math.sin(band.spin) + z1 * Math.cos(band.spin)];
  }
  if (chapter === 'blog') {
    const side=i<5?-1:1,layer=i%5;
    if(gold(i))return [side*(1.23+layer*.067),-1.40+t*2.8,.10+layer*.08+Math.sin(t*Math.PI)*.13];
    return [side*(.67+layer*.076),-1.43+t*2.86+layer*.038,(4-layer)*.118+Math.sin(t*Math.PI)*.23];
  }
  if (chapter === 'projects') {
    if(i===9)return [-1.14+t*2.28,-1.14+t*2.28,-1.14+t*2.28];
    const axis=i%3,layer=Math.floor(i/3),[x,y]=roundedSquare(.003+t*.994),depth=(layer-1)*.76;
    return axis===0?[x,y,depth]:axis===1?[depth,x,y]:[y,depth,x];
  }
  if (chapter === 'about') {
    const a=i/PIECES*TAU+.25+Math.sin(t*Math.PI)*.16+t*.21,r=.23+t*1.90;
    return [Math.cos(a)*r,Math.sin(a)*r,Math.sin(t*Math.PI)*.48+Math.cos(i/PIECES*TAU)*.14];
  }
  if(i===9)return [-1.42+t*2.45,Math.sin(t*TAU)*.10,.15];
  const a=-1.21+t*2.42,r=.65+i*.19;
  return [-1.35+r*Math.cos(a)+i*.075,r*Math.sin(a),(i-4)*.065+Math.sin(a)*.07];
}

function section(chapter,i,t,tangent) {
  let guide=[0,0,1],width=.10,thickness=.045,twist=0;
  if(chapter==='home'){
    if(i===9){width=.030;thickness=.030;guide=[1,0,0];}
    else{
      const band=BANDS[Math.floor(i/3)];
      width=gold(i)?.040:.140;thickness=.050;guide=bandAxis(band);
    }
  }
  if(chapter==='blog'){width=gold(i)?.031:1.08+Math.sin(t*Math.PI)*.13;thickness=gold(i)?.025:.030;guide=[i<5?.48:-.48,0,1];twist=(t-.5)*.075;}
  if(chapter==='projects'){width=gold(i)?.044:.084;thickness=.058;guide=i===9?[0,0,1]:i%3===0?[0,0,1]:i%3===1?[1,0,0]:[0,1,0];}
  if(chapter==='about'){width=gold(i)?(.032+Math.sin(t*Math.PI)*.040):(.033+Math.pow(Math.sin(t*Math.PI),.9)*.34);thickness=.040;twist=.30+t*.61;}
  if(chapter==='contact'){width=i===9?.030:gold(i)?.026:.071;thickness=.039;twist=Math.sin(t*Math.PI)*.14;}
  const w=normalize(cross(tangent,guide)),normal=normalize(cross(w,tangent));
  return {width,thickness,w:w.map((x,k)=>x*Math.cos(twist)+normal[k]*Math.sin(twist)),n:normal.map((x,k)=>x*Math.cos(twist)-w[k]*Math.sin(twist))};
}

function indexBuffer() {
  const indices=[];
  for(let s=0;s<SEGMENTS;s++)for(let j=0;j<PROFILE;j++){
    const a=s*PROFILE+j,b=s*PROFILE+(j+1)%PROFILE,c=a+PROFILE,d=b+PROFILE;
    indices.push(a,c,b,b,c,d);
  }
  for(let j=0;j<PROFILE;j++){
    indices.push(firstCap+PROFILE,firstCap+j,firstCap+(j+1)%PROFILE);
    indices.push(lastCap+PROFILE,lastCap+(j+1)%PROFILE,lastCap+j);
  }
  return indices;
}
const indices=indexBuffer();

// Matching topology keeps every transition continuous. Separate, outward-facing
// end caps and six samples per bevel avoid pinched normals and faceted highlights.
export function createShape(chapter,i) {
  const positions=new Float32Array(VERTICES*3),uvs=new Float32Array(VERTICES*2);
  for(let s=0;s<=SEGMENTS;s++){
    const t=s/SEGMENTS,c=centre(chapter,i,t);
    const before=centre(chapter,i,Math.max(0,t-.0005)),after=centre(chapter,i,Math.min(1,t+.0005));
    const tangent=normalize(after.map((v,k)=>v-before[k]));
    const {width,thickness,w,n}=section(chapter,i,t,tangent);
    const edge=Math.min(1,Math.min(s,SEGMENTS-s)/2),taper=.83+.17*edge;
    const radius=Math.min(thickness*.46,width*.23);
    for(let j=0;j<PROFILE;j++){
      const corner=Math.floor(j/CORNER_STEPS),angle=corner*Math.PI/2+(j%CORNER_STEPS)/(CORNER_STEPS-1)*Math.PI/2;
      const sx=corner===0||corner===3?1:-1,sy=corner<2?1:-1;
      const px=(sx*(width*.5-radius)+Math.cos(angle)*radius)*taper;
      const py=(sy*(thickness*.5-radius)+Math.sin(angle)*radius)*taper;
      const offset=(s*PROFILE+j)*3;
      for(let k=0;k<3;k++)positions[offset+k]=c[k]+w[k]*px+n[k]*py;
      uvs[(s*PROFILE+j)*2]=j/PROFILE;uvs[(s*PROFILE+j)*2+1]=t;
    }
  }
  for(const [cap,ring,t] of [[firstCap,0,0],[lastCap,SEGMENTS*PROFILE,1]]){
    positions.set(positions.subarray(ring*3,(ring+PROFILE)*3),cap*3);
    positions.set(centre(chapter,i,t),(cap+PROFILE)*3);
    for(let j=0;j<=PROFILE;j++){uvs[(cap+j)*2]=j/PROFILE;uvs[(cap+j)*2+1]=t;}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const normals=new Float32Array(geometry.getAttribute('normal').array);geometry.dispose();
  return {positions,normals,uvs};
}

export function createRibbonGeometry(shape) {
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(shape.positions),3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(shape.normals),3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv',new THREE.BufferAttribute(shape.uvs,2));geometry.setIndex(indices);
  geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
  return geometry;
}

export function createEngraving(geometry,i) {
  const lines=new THREE.BufferGeometry();lines.setAttribute('position',geometry.getAttribute('position'));
  const edges=[];
  for(let s=2;s<SEGMENTS-2;s++){
    edges.push(s*PROFILE+CORNER_STEPS-1,(s+1)*PROFILE+CORNER_STEPS-1);
    if(i===0||i===9)edges.push(s*PROFILE+CORNER_STEPS*3-1,(s+1)*PROFILE+CORNER_STEPS*3-1);
  }
  lines.setIndex(edges);lines.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
  return lines;
}

// The schematic: each ribbon's centreline. The loading sequence traces these as
// dashed instrument guides before the solid ribbons settle onto them, so the
// loader and the sculpture share one geometry instead of two unrelated systems.
export function createCentrelines(chapter,samples=120) {
  const out=[];
  for(let i=0;i<PIECES;i++){
    const points=[];
    for(let s=0;s<=samples;s++){const c=centre(chapter,i,s/samples);points.push(new THREE.Vector3(c[0],c[1],c[2]));}
    out.push(points);
  }
  return out;
}

// A single sampled point on a ribbon's centreline, used as a HUD anchor so the
// callouts always track the sculpture as it morphs and idles.
export function anchorPoint(chapter,i,t=.5) {
  return new THREE.Vector3(...centre(chapter,i,t));
}
