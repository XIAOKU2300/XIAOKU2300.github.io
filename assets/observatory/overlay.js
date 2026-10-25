import * as THREE from './vendor/three.module.js';

// A full-viewport instrument pass drawn over the sculpture: a technical grid,
// a frame that agrees with the DOM chrome, rulers hugging all four edges,
// targeting reticles, a telemetry row, a radar fan, a band of light that
// crosses the whole page, and an aperture that opens from the sculpture
// outwards. It lives in the same canvas as the scene, so it belongs to the
// background layer while still covering everything.
//
// It is one additive quad — one draw call — and every effect is a uniform, so
// the whole overlay costs almost nothing and can be driven per frame. Nothing
// here runs on its own clock: all motion comes from uTime, which the scene
// advances inside its own draw loop, so pausing the loop freezes the layer.
export function createOverlay() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uIntensity: { value: .95 },
    uSweep: { value: -1 },
    // Up to four aperture waves can be in flight at once, so a fresh trigger
    // never snaps an unfinished ring back to the centre.
    uAperture: { value: new THREE.Vector4(1, 1, 1, 1) },
    uApertureOrigin: { value: new THREE.Vector2(.5, .5) },
    uChapter: { value: 0 },
    // The DOM frame (.hud-frame) as a rectangle in uv space: left, bottom,
    // right, top. The GL frame is drawn on exactly the same lines.
    uFrame: { value: new THREE.Vector4(.02, .026, .98, .888) },
    // A box in uv space, plus how strongly the pass is suppressed inside it.
    // The hero column and the article column stay legible underneath the grid.
    uFocusRect: { value: new THREE.Vector4(.28, .55, .26, .34) },
    uFocusAmount: { value: .55 },
    // 0 = full detail, 1 = the fine grid, reticles and telemetry are dropped.
    uQuality: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `precision highp float;
      uniform float uTime,uIntensity,uSweep,uChapter,uQuality,uFocusAmount;
      uniform vec4 uAperture;
      uniform vec2 uRes,uApertureOrigin;
      uniform vec4 uFrame,uFocusRect;
      varying vec2 vUv;

      // Distance to the nearest line of a grid, in cell units. Constant widths
      // keep this free of screen-space derivatives.
      float grid(vec2 uv,vec2 cells,float width){
        vec2 g=abs(fract(uv*cells)-.5);
        return 1.-smoothstep(width,width+.40,min(g.x,g.y));
      }

      // A line of the frame, restricted to the frame's own span so it cannot
      // run off across the whole viewport.
      float frameEdge(vec2 uv,vec4 f,float width){
        float inY=step(f.y-.012,uv.y)*step(uv.y,f.w+.012);
        float inX=step(f.x-.012,uv.x)*step(uv.x,f.z+.012);
        float l=(1.-smoothstep(width,width+.0014,abs(uv.x-f.x)))*inY;
        float r=(1.-smoothstep(width,width+.0014,abs(uv.x-f.z)))*inY;
        float b=(1.-smoothstep(width,width+.0014,abs(uv.y-f.y)))*inX;
        float t=(1.-smoothstep(width,width+.0014,abs(uv.y-f.w)))*inX;
        return max(max(l,r),max(b,t));
      }

      // Graduated ticks along the four edges: minor every small division, a
      // longer tick every fifth.
      float edgeRulers(vec2 uv,float aspect){
        float top=smoothstep(.968,1.,uv.y),bottom=smoothstep(.032,0.,uv.y);
        float left=smoothstep(.012,0.,uv.x),right=smoothstep(.988,1.,uv.x);
        float tx=abs(fract(uv.x*aspect*42.)-.5),ty=abs(fract(uv.y*42.)-.5);
        float minorX=1.-smoothstep(.10,.32,tx),majorX=1.-smoothstep(.10,.32,abs(fract(uv.x*aspect*8.4)-.5));
        float minorY=1.-smoothstep(.10,.32,ty),majorY=1.-smoothstep(.10,.32,abs(fract(uv.y*8.4)-.5));
        return (top+bottom)*max(minorX*.42,majorX)+(left+right)*max(minorY*.42,majorY);
      }

      // Four targeting reticles that breathe out of phase with one another.
      float reticles(vec2 uv,float aspect){
        float acc=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          vec2 p=vec2(.16+.225*fi,.30+.11*sin(fi*2.1+1.3));
          vec2 d=(uv-p)*vec2(aspect,1.);
          float r=length(d);
          float pulse=.45+.55*sin(uTime*.75+fi*1.7);
          acc+=exp(-pow((r-.052)*62.,2.))*pulse;
          acc+=exp(-pow(abs(d.x)*95.,2.))*exp(-pow(abs(d.y)*16.,2.))*.5;
          acc+=exp(-pow(abs(d.y)*95.,2.))*exp(-pow(abs(d.x)*16.,2.))*.5;
        }
        return acc;
      }

      // A row of telemetry lamps along the bottom edge that step on and off.
      float telemetry(vec2 uv,float aspect){
        float acc=0.0;
        for(int i=0;i<12;i++){
          float fi=float(i);
          vec2 p=vec2(.055+fi*.078,.048);
          vec2 d=(uv-p)*vec2(aspect,1.);
          float on=.30+.70*step(.5,fract(uTime*.34+fi*.17));
          acc+=exp(-pow(length(d)*155.,2.))*on;
        }
        return acc;
      }

      // The radar fan: six spokes turning slowly about the sculpture.
      float fan(vec2 uv,float aspect){
        vec2 d=(uv-uApertureOrigin)*vec2(aspect,1.);
        float r=length(d),a=atan(d.y,d.x);
        float s=pow(max(0.,cos((a+uTime*.20)*6.)),44.);
        return s*smoothstep(.14,1.0,r)*(1.-smoothstep(1.0,1.7,r));
      }

      void main(){
        vec2 uv=vUv;
        float aspect=uRes.x/max(uRes.y,1.);
        float detail=uQuality<.5?1.:0.;

        // The fine grid drifts; the major grid is pinned to the frame so the
        // GL layer and the DOM chrome read as one instrument.
        float fine=grid(uv+vec2(uTime*.0028,uTime*.0011),vec2(34.,22.),.030)*detail;
        float major=grid(uv,vec2(8.5,5.5),.013);
        float frame=frameEdge(uv,uFrame,.0011);
        float rulers=edgeRulers(uv,aspect);

        // The band that crosses the page. A wide halo plus a narrow core.
        float halo=exp(-pow((uv.y-uSweep)*15.,2.));
        float core=exp(-pow((uv.y-uSweep)*95.,2.));

        // Corner brackets, mirrored automatically by folding uv into the
        // nearest quadrant corner.
        vec2 c=min(uv,1.-uv);
        float hb=(1.-smoothstep(.0011,.0026,abs(c.y-.020)))*step(c.x,.105);
        float vb=(1.-smoothstep(.0011,.0026,abs(c.x-.020)))*step(c.y,.105);
        float bracket=clamp(hb+vb,0.,1.);

        // The aperture: up to four rings opening from the sculpture outwards.
        // Each slot fades as it grows, so overlapping pulses stay smooth.
        vec2 d=(uv-uApertureOrigin)*vec2(aspect,1.);
        float ar=length(d);
        float ring=0.0;
        float aw=clamp(uAperture.x,0.,1.);ring+=exp(-pow((ar-aw*2.6)*7.5,2.))*(1.-aw);
        aw=clamp(uAperture.y,0.,1.);ring+=exp(-pow((ar-aw*2.6)*7.5,2.))*(1.-aw);
        aw=clamp(uAperture.z,0.,1.);ring+=exp(-pow((ar-aw*2.6)*7.5,2.))*(1.-aw);
        aw=clamp(uAperture.w,0.,1.);ring+=exp(-pow((ar-aw*2.6)*7.5,2.))*(1.-aw);
        float glow=exp(-pow(length(d)*2.1,2.))*(.62+.38*sin(uTime*.5));

        float amount=fine*.095+major*.175+frame*.135+rulers*.105
          +halo*.115+core*.175+bracket*.150+ring*.300+glow*.085
          +(reticles(uv,aspect)*.060+telemetry(uv,aspect)*.095+fan(uv,aspect)*.055)*detail;
        float vig=smoothstep(1.30,.40,length((uv-.5)*vec2(aspect,1.)*1.55));
        amount*=uIntensity*(.40+.60*vig);

        // Keep the copy readable: the pass thins out inside the text column
        // instead of needing a separate scrim over the words.
        vec2 fd=abs(uv-uFocusRect.xy)-uFocusRect.zw;
        float textMask=1.-smoothstep(0.,.16,length(max(fd,0.)));
        amount*=1.-uFocusAmount*textMask;

        vec3 celadon=vec3(.66,.80,.76),brass=vec3(.82,.72,.50);
        float drift=.5+.5*sin(uTime*.045);
        vec3 tint=mix(celadon,brass,clamp(drift*.55+uChapter*.14,0.,.55));
        gl_FragColor=vec4(tint*amount,amount);
      }`
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  return {
    scene,
    camera,
    uniforms,
    setSize(width, height) {
      uniforms.uRes.value.set(width, height);
      // Mirror the .hud-frame inset (112px top, 26px elsewhere) in uv space.
      const mx = 26 / Math.max(width, 1), my = 26 / Math.max(height, 1);
      uniforms.uFrame.value.set(mx, my, 1 - mx, 1 - 112 / Math.max(height, 1));
    },
    setChapter(index) { uniforms.uChapter.value = index; },
  };
}
