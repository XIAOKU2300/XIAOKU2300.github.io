import assert from 'node:assert/strict';
import {CHAPTERS,PIECES,createShape,createRibbonGeometry} from '../assets/observatory/sculptures.js';

let topology;
for(const chapter of Object.keys(CHAPTERS)){
  for(let i=0;i<PIECES;i++){
    const shape=createShape(chapter,i),geometry=createRibbonGeometry(shape);
    const {positions,normals,uvs}=shape,index=geometry.index.array;
    assert.ok(positions.every(Number.isFinite));assert.ok(normals.every(Number.isFinite));assert.ok(uvs.every(Number.isFinite));
    assert.equal(positions.length,normals.length);assert.equal(uvs.length,positions.length/3*2);
    assert.ok(Math.max(...index)<positions.length/3);
    topology??=Array.from(index);assert.deepEqual(Array.from(index),topology);
    for(let v=0;v<positions.length;v+=3){
      assert.ok(Math.hypot(...positions.subarray(v,v+3))<5,'Vertex exceeds morph bounds');
      assert.ok(Math.abs(Math.hypot(...normals.subarray(v,v+3))-1)<.001,'Non-unit normal');
    }
    // Caps use their own perimeter, keeping end normals separate from the bevel.
    const profile=24,segments=168,firstCap=(segments+1)*profile,lastCap=firstCap+profile+1;
    for(const [cap,ring,next,direction] of [[firstCap,0,profile,-1],[lastCap,segments*profile,(segments-1)*profile,-1]]){
      const center=positions.subarray((cap+profile)*3,(cap+profile+1)*3);
      const nextCenter=[0,0,0];
      for(let v=0;v<profile;v++)for(let axis=0;axis<3;axis++)nextCenter[axis]+=positions[(next+v)*3+axis]/profile;
      const tangent=nextCenter.map((value,axis)=>(value-center[axis])*direction);
      const normal=normals.subarray((cap+profile)*3,(cap+profile+1)*3);
      assert.ok(normal.reduce((sum,value,axis)=>sum+value*tangent[axis],0)>0,'Inward-facing cap');
      assert.deepEqual(positions.subarray(cap*3,(cap+profile)*3),positions.subarray(ring*3,(ring+profile)*3));
    }
    assert.ok(index.length/3<8500,'Unexpected triangle budget');geometry.dispose();
  }
  console.log('PASS '+chapter+': ten finite, bounded, morph-compatible sculptures with outward caps');
}
