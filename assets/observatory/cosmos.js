import * as THREE from './vendor/three.module.js';

const TAU = Math.PI * 2;

// Everything that sits behind the sculpture: a deep field arranged as a galaxy,
// three cold nebulae, and the apparatus — enormous rings that keep turning
// whether or not anyone is watching. It shares the instrument's motion
// language: slow, exact, and slightly cold. Nothing here is interactive; it is
// the machine the sculpture hangs inside.
export function createCosmos({ mobile = false } = {}) {
  const group = new THREE.Group();

  let seed = 9137;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  // --- deep field --------------------------------------------------------
  // A disc with a bright core and a thin galactic band through it. The band is
  // warmer and denser, so the field reads as a galaxy seen at an angle rather
  // than as evenly scattered noise.
  const field = new THREE.Group();
  field.position.set(0, 0, -26);
  field.rotation.x = .18;
  const count = mobile ? 900 : 2600;
  const position = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aPhase = new Float32Array(count);
  const aWarm = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const angle = rand() * TAU, radius = Math.pow(rand(), .55) * 23;
    const band = Math.exp(-Math.pow(radius / 9, 2));
    const flat = .20 + band * .62;
    position[i * 3] = Math.cos(angle) * radius + (rand() - .5) * 1.7;
    position[i * 3 + 1] = (rand() - .5) * 20 * flat * (.35 + rand() * .9);
    position[i * 3 + 2] = Math.sin(angle) * radius + (rand() - .5) * 1.7;
    aSize[i] = .5 + Math.pow(rand(), 2.1) * 2.1;
    aPhase[i] = rand() * TAU;
    aWarm[i] = rand() < (band > .4 ? .32 : .10) ? 1 : 0;
  }
  const fieldGeometry = new THREE.BufferGeometry();
  fieldGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  fieldGeometry.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
  fieldGeometry.setAttribute('aPhase', new THREE.BufferAttribute(aPhase, 1));
  fieldGeometry.setAttribute('aWarm', new THREE.BufferAttribute(aWarm, 1));
  const fieldMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uSurge: { value: 0 } },
    vertexShader: `attribute float aSize;attribute float aPhase;attribute float aWarm;
      uniform float uTime;uniform float uDpr;uniform float uSurge;
      varying float vAlpha;varying float vWarm;
      void main(){
        vec3 p=position;
        p.y+=sin(uTime*.11+aPhase)*.20;
        p.x+=cos(uTime*.07+aPhase*.7)*.20;
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=aSize*uDpr*min(3.2,30./-mv.z)*(1.+uSurge*.45);
        vAlpha=(.28+.11*sin(uTime*.19+aPhase*1.7)+uSurge*.26)*min(1.,32./-mv.z);
        vWarm=aWarm;
      }`,
    fragmentShader: `varying float vAlpha;varying float vWarm;
      void main(){
        float d=smoothstep(.5,.02,length(gl_PointCoord-.5));
        vec3 cold=vec3(.64,.79,.77),warm=vec3(.86,.76,.55);
        gl_FragColor=vec4(mix(cold,warm,vWarm),d*max(vAlpha,0.));
      }`
  });
  const fieldPoints = new THREE.Points(fieldGeometry, fieldMaterial);
  fieldPoints.frustumCulled = false;
  field.add(fieldPoints);
  group.add(field);

  // --- nebulae -----------------------------------------------------------
  // Three wide, soft clouds. They are drawn additively and never write depth,
  // so they brighten the dark without ever competing with the sculpture.
  const nebulae = [];
  const nebulaColors = ['#6f9f9a', '#8a7f63', '#5d7f8c'];
  for (let i = 0; i < 3; i++) {
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 }, uSeed: { value: i * 1.7 },
        uColor: { value: new THREE.Color(nebulaColors[i]) },
        uStrength: { value: mobile ? .19 : .26 },
      },
      vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 uColor;uniform float uStrength;uniform float uSeed;uniform float uTime;varying vec2 vUv;
        void main(){
          vec2 p=vUv-.5;
          float fall=smoothstep(.5,.05,length(p));
          float grain=.74+.26*sin(p.x*9.+uSeed*4.+uTime*.05)*sin(p.y*11.-uSeed*3.);
          float a=fall*fall*uStrength*grain;
          gl_FragColor=vec4(uColor*a,a);
        }`
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    mesh.scale.set(64 - i * 7, 44 - i * 5, 1);
    mesh.position.set((i - 1) * 13, -2 + i * 3.4, -22 - i * 7);
    mesh.userData.base = (i - 1) * .5;
    mesh.rotation.z = mesh.userData.base;
    mesh.frustumCulled = false;
    group.add(mesh);
    nebulae.push(mesh);
  }

  // --- the apparatus -----------------------------------------------------
  // Five rings far larger than the sculpture, each on its own slow period and
  // its own tilt. At these radii the viewport only ever catches an arc, so the
  // rings read as part of something much bigger than the page. The outer two
  // turn so slowly that the machine never repeats itself inside a session.
  const apparatus = new THREE.Group();
  const rings = [
    { radius: 7.2, tilt: [1.16, .22, -.10], rate: .030, opacity: .22, color: '#a8c7be', angle: 0 },
    { radius: 11.4, tilt: [-.62, .48, .14], rate: -.020, opacity: .17, color: '#c7ae7c', angle: 0 },
    { radius: 15.8, tilt: [.34, -.30, .06], rate: .012, opacity: .13, color: '#8fb6b0', angle: 0 },
    { radius: 21.6, tilt: [-1.04, .14, -.22], rate: -.0068, opacity: .095, color: '#9dbdb4', angle: 0 },
    { radius: 28.4, tilt: [.66, -.52, .18], rate: .0041, opacity: .062, color: '#bfa877', angle: 0 },
  ];
  const segments = mobile ? 150 : 240;
  for (const ring of rings) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const a = i / segments * TAU;
      points.push(new THREE.Vector3(Math.cos(a) * ring.radius, Math.sin(a) * ring.radius, 0));
    }
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: ring.color, transparent: true, opacity: ring.opacity, depthWrite: false })
    );
    line.frustumCulled = false;
    line.renderOrder = -1;
    const holder = new THREE.Group();
    holder.rotation.set(ring.tilt[0], ring.tilt[1], ring.tilt[2]);
    holder.add(line);
    apparatus.add(holder);
    ring.holder = holder;
    ring.line = line;
  }
  // Graduations on two of the rings, so the apparatus reads as calibrated
  // rather than decorative. Each set turns on its own period.
  function graduations(ring, rate, count, every, longLen, shortLen, color, opacity) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const a = i / count * TAU, long = i % every === 0;
      const r0 = ring.radius, r1 = r0 + (long ? longLen : shortLen);
      points.push(new THREE.Vector3(Math.cos(a) * r0, Math.sin(a) * r0, 0));
      points.push(new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0));
    }
    const marks = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
    );
    marks.frustumCulled = false;
    marks.renderOrder = -1;
    const holder = new THREE.Group();
    holder.rotation.set(...ring.tilt);
    holder.add(marks);
    apparatus.add(holder);
    return { holder, marks, rate, opacity, angle: 0 };
  }
  const tickSets = [
    graduations(rings[1], -.020, 60, 5, .34, .13, '#c7ae7c', .15),
    graduations(rings[4], .0092, 96, 8, .52, .20, '#a8c7be', .10),
  ];
  // Satellites running the outer rings forever.
  const nodes = [2, 4].map((index, i) => {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(i ? .10 : .075, 0),
      new THREE.MeshBasicMaterial({ color: i ? '#cfe0d8' : '#e2d3ae', transparent: true, opacity: .45, depthWrite: false })
    );
    const holder = new THREE.Group();
    holder.rotation.set(...rings[index].tilt);
    holder.add(mesh);
    apparatus.add(holder);
    return { mesh, radius: rings[index].radius, angle: 1.1 + i * 2.4, speed: i ? .052 : .085, base: i ? .30 : .26, swing: i ? .16 : .20, phase: i * 2.1 };
  });
  group.add(apparatus);

  // A long event: every forty seconds the apparatus runs a little hot. It is a
  // function of the scene clock, so it stops dead whenever the loop is parked.
  const EVENT_PERIOD = 40;
  const eventGain = t => {
    const phase = (((t % EVENT_PERIOD) + EVENT_PERIOD) % EVENT_PERIOD) / EVENT_PERIOD;
    const d = (phase - .5) * 6.4;
    return Math.exp(-d * d);
  };

  function update(t, dt, surge) {
    const step = dt || 0;
    const drive = Math.max(surge || 0, eventGain(t));
    fieldMaterial.uniforms.uTime.value = t;
    fieldMaterial.uniforms.uSurge.value = drive;
    field.rotation.y = t * .0032;
    field.rotation.z = Math.sin(t * .05) * .02;
    for (let i = 0; i < nebulae.length; i++) {
      const cloud = nebulae[i];
      cloud.material.uniforms.uTime.value = t;
      cloud.rotation.z = cloud.userData.base + (i % 2 ? 1 : -1) * t * .006;
    }
    // The rings accelerate through the event instead of jumping, so the surge
    // reads as the machine spinning up rather than as a brightness flicker.
    const rush = 1 + drive * 4.5;
    for (const ring of rings) {
      ring.angle += step * ring.rate * rush;
      ring.holder.rotation.z = ring.angle;
      ring.line.material.opacity = ring.opacity * (1 + drive * .85);
    }
    for (const set of tickSets) {
      set.angle += step * set.rate * rush;
      set.holder.rotation.z = set.angle;
      set.marks.material.opacity = set.opacity * (1 + drive * .7);
    }
    for (const node of nodes) {
      node.angle += step * node.speed * (1 + drive * 3);
      node.mesh.position.set(Math.cos(node.angle) * node.radius, Math.sin(node.angle) * node.radius, 0);
      node.mesh.rotation.set(node.angle * 2.2, node.angle * 1.4, 0);
      node.mesh.material.opacity = (node.base + node.swing * Math.sin(t * .8 + node.phase)) * (1 + drive * .7);
    }
  }

  return {
    group,
    update,
    setDpr(value) { fieldMaterial.uniforms.uDpr.value = value; },
  };
}
