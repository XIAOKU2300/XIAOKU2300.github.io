import * as THREE from './vendor/three.module.js';

export const CHAPTERS = Object.freeze({
  home: { number: '00', name: 'The orbit', label: '首页 · 万象', rotation: [.57, -.40, -.30] },
  blog: { number: '01', name: 'Unfolding stories', label: '文章 · 篇章', rotation: [.24, -.46, -.13] },
  projects: { number: '02', name: 'Thought into form', label: '项目 · 构筑', rotation: [.42, -.57, -.16] },
  about: { number: '03', name: 'A star of my own', label: '关于 · 星芒', rotation: [.40, -.28, .08] },
  contact: { number: '04', name: 'Across the distance', label: '联系 · 回响', rotation: [.18, -.30, -.12] },
});
export const chapterFor = page => CHAPTERS[page] ? page : 'blog';
export const PIECES = 10;
const SEGMENTS = 88, PROFILE = 16;
const ringVertices = (SEGMENTS + 1) * PROFILE;
const VERTICES = ringVertices + 2;
const TAU = Math.PI * 2;
const normalize = v => { const length = Math.hypot(...v) || 1; return v.map(x => x / length); };
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const gold = i => i === 1 || i === 8;

function centre(chapter,i,t) {
  if (chapter === 'home') {
    const angle = -.15 + i * .084 + t * (4.80 - Math.abs(i - 4.5) * .025);
    const radius = .92 + i * .142 + Math.sin(t * Math.PI) * .025;
    return [Math.cos(angle)*radius, Math.sin(angle)*radius*(.93+.035*Math.sin(i*.4)), (i-4.5)*.085 + Math.sin(angle*1.5+i*.20)*.24];
  }
  if (chapter === 'blog') {
    const side = i < 5 ? -1 : 1, layer = i % 5;
    if (gold(i)) return [side*(1.22+layer*.07), -1.40+t*2.8, .10+layer*.08+Math.sin(t*Math.PI)*.16];
    return [side*(.65+layer*.070), -1.45+t*2.90+layer*.042, (4-layer)*.105 + Math.sin(t*Math.PI)*.26];
  }
  if (chapter === 'projects') {
    if(i===9)return [-1.14+t*2.28,-1.14+t*2.28,-1.14+t*2.28];
    const axis=i%3, layer=Math.floor(i/3), a=.035+t*(TAU-.07);
    const superellipse=v=>Math.sign(v)*Math.pow(Math.abs(v),.43);
    const x=superellipse(Math.cos(a))*1.43,y=superellipse(Math.sin(a))*1.43,depth=(layer-1)*.79;
    return axis===0?[x,y,depth]:axis===1?[depth,x,y]:[y,depth,x];
  }
  if (chapter === 'about') {
    const a=i/PIECES*TAU+.25+Math.sin(t*Math.PI)*.22+t*.23;
    const r=.19+t*1.94;
    return [Math.cos(a)*r,Math.sin(a)*r,Math.sin(t*Math.PI)*.58+Math.cos(i/PIECES*TAU)*.16];
  }
  if(i===9)return [-1.42+t*2.45,Math.sin(t*TAU)*.13, .15];
  const a=-1.21+t*2.42, r=.65+i*.19;
  return [-1.35+r*Math.cos(a)+i*.075,r*Math.sin(a),(i-4)*.065+Math.sin(a)*.08];
}

function section(chapter,i,t,tangent) {
  let guide=[0,0,1],width=.10,thickness=.045,twist=0;
  if(chapter==='home') { width=gold(i)?.032:.095+Math.sin(t*Math.PI)*.055; thickness=gold(i)?.036:.056; twist=Math.sin(t*TAU+i*.24)*.38+(i-4.5)*.035; }
  if(chapter==='blog') { width=gold(i)?.035:1.10+Math.sin(t*Math.PI)*.18; thickness=gold(i)?.025:.026; guide=[i<5?.48:-.48,0,1]; twist=(t-.5)*.1; }
  if(chapter==='projects') { width=gold(i)?.053:.095; thickness=.066; guide=i===9?[0,0,1]:i%3===0?[0,0,1]:i%3===1?[1,0,0]:[0,1,0]; }
  if(chapter==='about') { width=gold(i)?(.035+Math.sin(t*Math.PI)*.055):(.027+Math.pow(Math.sin(t*Math.PI),.85)*.40);thickness=.038;twist=.35+t*.7; }
  if(chapter==='contact') { width=i===9?.033:gold(i)?.026:.075;thickness=.035;twist=Math.sin(t*Math.PI)*.18; }
  const w=normalize(cross(tangent,guide));
  const normal=normalize(cross(w,tangent));
  return {width,thickness,w:w.map((x,k)=>x*Math.cos(twist)+normal[k]*Math.sin(twist)),n:normal.map((x,k)=>x*Math.cos(twist)-w[k]*Math.sin(twist))};
}

function indexBuffer() {
  const indices=[];
  for(let s=0;s<SEGMENTS;s++)for(let j=0;j<PROFILE;j++){
    const a=s*PROFILE+j,b=s*PROFILE+(j+1)%PROFILE,c=a+PROFILE,d=b+PROFILE;
    indices.push(a,c,b,b,c,d);
  }
  for(let j=0;j<PROFILE;j++){
    indices.push(ringVertices,(j+1)%PROFILE,j);
    indices.push(ringVertices+1,SEGMENTS*PROFILE+j,SEGMENTS*PROFILE+(j+1)%PROFILE);
  }
  return indices;
}
const indices=indexBuffer();

// The same bevelled ribbon topology is used in all five sculptures.
// Matching vertices let a page become an orbit, a beam, a petal, then a wave.
export function createShape(chapter,i) {
  const positions=new Float32Array(VERTICES*3),uvs=new Float32Array(VERTICES*2);
  for(let s=0;s<=SEGMENTS;s++){
    const t=s/SEGMENTS,c=centre(chapter,i,t);
    const before=centre(chapter,i,Math.max(0,t-.001)),after=centre(chapter,i,Math.min(1,t+.001));
    const tangent=normalize(after.map((v,k)=>v-before[k]));
    const {width,thickness,w,n}=section(chapter,i,t,tangent);
    const radius=Math.min(thickness*.44,width*.22);
    for(let j=0;j<PROFILE;j++){
      const corner=Math.floor(j/4),angle=corner*Math.PI/2+(j%4)/3*Math.PI/2;
      const sx=corner===0||corner===3?1:-1,sy=corner<2?1:-1;
      const px=sx*(width*.5-radius)+Math.cos(angle)*radius;
      const py=sy*(thickness*.5-radius)+Math.sin(angle)*radius;
      const offset=(s*PROFILE+j)*3;
      for(let k=0;k<3;k++)positions[offset+k]=c[k]+w[k]*px+n[k]*py;
      uvs[(s*PROFILE+j)*2]=j/PROFILE;uvs[(s*PROFILE+j)*2+1]=t;
    }
  }
  positions.set(centre(chapter,i,0),ringVertices*3);positions.set(centre(chapter,i,1),(ringVertices+1)*3);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();
  const normals=new Float32Array(geometry.getAttribute('normal').array);geometry.dispose();
  return {positions,normals,uvs};
}

export function createRibbonGeometry(shape) {
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(shape.positions),3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(shape.normals),3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv',new THREE.BufferAttribute(shape.uvs,2));geometry.setIndex(indices);
  // The sculpture changes shape, so don't retain a bounding sphere from one pose.
  geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
  return geometry;
}

export function createEngraving(geometry,i) {
  const lines=new THREE.BufferGeometry();lines.setAttribute('position',geometry.getAttribute('position'));
  const edges=[];
  for(let s=0;s<SEGMENTS;s++){
    edges.push(s*PROFILE+3,(s+1)*PROFILE+3);
    if(i===0||i===9)edges.push(s*PROFILE+7,(s+1)*PROFILE+7);
    if((i===0||i===3||i===5||i===6)&&s%5===0&&s>12&&s<76)edges.push(s*PROFILE+3,s*PROFILE+7);
  }
  lines.setIndex(edges);lines.boundingSphere=new THREE.Sphere(new THREE.Vector3(),5);
  return lines;
}
