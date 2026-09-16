/**
 * A THOUSAND WINDS — Master Script
 * Literary & Philosophical Digital Experience
 * Model Attribution: 【模型：Gemini3.8-flash-high】
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. COLOR SCHEMES & ELEMENT PALETTES
     ========================================================================== */
  const ELEMENT_CONFIG = {
    prologue: {
      accent: '#c9933e',
      accentSoft: 'rgba(201, 147, 62, 0.15)',
      windFactor: 1.0,
      soundMood: 'prologue'
    },
    winds: {
      accent: '#568ea6',
      accentSoft: 'rgba(86, 142, 166, 0.18)',
      windFactor: 2.8,
      soundMood: 'winds'
    },
    snow: {
      accent: '#7da4c7',
      accentSoft: 'rgba(125, 164, 199, 0.18)',
      windFactor: 0.8,
      soundMood: 'snow'
    },
    grain: {
      accent: '#df9e38',
      accentSoft: 'rgba(223, 158, 56, 0.18)',
      windFactor: 1.2,
      soundMood: 'grain'
    },
    rain: {
      accent: '#597387',
      accentSoft: 'rgba(89, 115, 135, 0.18)',
      windFactor: 1.4,
      soundMood: 'rain'
    },
    birds: {
      accent: '#8c7aa9',
      accentSoft: 'rgba(140, 122, 169, 0.18)',
      windFactor: 1.6,
      soundMood: 'birds'
    },
    stars: {
      accent: '#d4af37',
      accentSoft: 'rgba(212, 175, 55, 0.18)',
      windFactor: 0.5,
      soundMood: 'stars'
    },
    epilogue: {
      accent: '#bfa15f',
      accentSoft: 'rgba(191, 161, 95, 0.2)',
      windFactor: 1.2,
      soundMood: 'epilogue'
    }
  };

  /* ==========================================================================
     2. ATMOSPHERE CANVAS ENGINE (MULTI-PHYSICS SIMULATION)
     ========================================================================== */
  class AtmosphereEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.scene = 'prologue';
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Mouse & Pointer Tracking
      this.pointer = {
        x: this.width * 0.5,
        y: this.height * 0.5,
        prevX: this.width * 0.5,
        prevY: this.height * 0.5,
        vx: 0,
        vy: 0,
        active: false,
        lastActiveTime: 0
      };

      // Particle Systems
      this.particles = [];
      this.boids = [];
      this.chaff = [];
      this.stars = [];
      this.ripples = [];
      this.dissolvedThoughts = [];

      this.time = 0;
      this.initDimensions();
      this.initBoids();
      this.initStars();
      this.initParticles();
      this.bindEvents();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    initDimensions() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.resetTransform();
      this.ctx.scale(this.dpr, this.dpr);
    }

    initParticles() {
      this.particles = [];
      const count = Math.min(180, Math.floor(this.width * 0.12));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          radius: Math.random() * 2.2 + 0.8,
          alpha: Math.random() * 0.6 + 0.2,
          seed: Math.random() * 100,
          length: Math.random() * 18 + 6,
          sparkle: Math.random() * 10
        });
      }

      // Wheat grain stalks (for grain scene)
      this.stalks = [];
      const stalkCount = Math.floor(this.width / 24);
      for (let i = 0; i < stalkCount; i++) {
        this.stalks.push({
          x: i * 24 + (Math.random() * 10 - 5),
          baseY: this.height,
          height: Math.random() * 140 + 100,
          angleOffset: Math.random() * Math.PI * 2,
          swayAmp: Math.random() * 15 + 10
        });
      }
    }

    initBoids() {
      this.boids = [];
      const boidCount = 42;
      for (let i = 0; i < boidCount; i++) {
        this.boids.push({
          x: this.width * 0.5 + (Math.random() - 0.5) * 300,
          y: this.height * 0.45 + (Math.random() - 0.5) * 200,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: Math.random() * 2.5 + 3,
          wingPhase: Math.random() * Math.PI * 2,
          wingSpeed: Math.random() * 0.15 + 0.2
        });
      }
    }

    initStars() {
      this.stars = [];
      const starCount = Math.min(220, Math.floor(this.width * 0.16));
      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 1.6 + 0.4,
          baseAlpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.04 + 0.01,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.initDimensions();
        this.initParticles();
        this.initStars();
      }, { passive: true });

      const onPointerMove = (x, y) => {
        this.pointer.vx = x - this.pointer.x;
        this.pointer.vy = y - this.pointer.y;
        this.pointer.prevX = this.pointer.x;
        this.pointer.prevY = this.pointer.y;
        this.pointer.x = x;
        this.pointer.y = y;
        this.pointer.active = true;
        this.pointer.lastActiveTime = performance.now();

        // Update wind vector display if winds section is active
        const windVecEl = document.getElementById('windVelocityVal');
        if (windVecEl && this.scene === 'winds') {
          const speed = Math.min(24, Math.sqrt(this.pointer.vx ** 2 + this.pointer.vy ** 2) * 0.8 + 4.2).toFixed(1);
          const dir = this.pointer.vx >= 0 ? 'ENE' : 'WNW';
          windVecEl.textContent = `${speed} m/s · ${dir}`;
        }
      };

      window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      window.addEventListener('click', (e) => {
        // Spawn ripple on click
        this.spawnRipple(e.clientX, e.clientY);
      }, { passive: true });
    }

    spawnRipple(x, y) {
      this.ripples.push({
        x: x,
        y: y,
        radius: 4,
        maxRadius: Math.random() * 40 + 50,
        alpha: 0.6,
        growth: Math.random() * 1.5 + 1.2
      });
    }

    injectThoughtParticles(text) {
      const centerX = this.width * 0.5;
      const centerY = this.height * 0.7;
      const count = Math.min(100, text.length * 5 + 40);

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        this.dissolvedThoughts.push({
          x: centerX + (Math.random() - 0.5) * 160,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed + (Math.random() * 2 + 1), // bias upward/rightward
          vy: Math.sin(angle) * speed - (Math.random() * 3 + 2),
          radius: Math.random() * 2.2 + 1.2,
          color: Math.random() > 0.4 ? '#f59e0b' : '#ffffff',
          alpha: 1.0,
          life: 1.0,
          decay: Math.random() * 0.008 + 0.004
        });
      }
    }

    setScene(sceneName) {
      if (this.scene === sceneName) return;
      this.scene = sceneName;
    }

    animate() {
      this.time += 0.016;
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render based on current scene state
      switch (this.scene) {
        case 'prologue':
          this.renderPrologue();
          break;
        case 'winds':
          this.renderWinds();
          break;
        case 'snow':
          this.renderSnow();
          break;
        case 'grain':
          this.renderGrain();
          break;
        case 'rain':
          this.renderRain();
          break;
        case 'birds':
          this.renderBirds();
          break;
        case 'stars':
          this.renderStars();
          break;
        case 'epilogue':
        default:
          this.renderEpilogue();
          break;
      }

      // Render Ripples (interactive water pulses)
      this.renderRipples();

      // Render Dissolved Thought Particles (if any)
      this.renderDissolvedThoughts();

      requestAnimationFrame(this.animate);
    }

    /* ---------------- Prologue: Stone Dust & Mist ---------------- */
    renderPrologue() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const dustColor = isDark ? 'rgba(230, 220, 200,' : 'rgba(70, 65, 55,';

      for (let p of this.particles) {
        // Slow gentle smoke/dust drift
        const flowAngle = Math.sin(p.seed + this.time * 0.4) * 0.8;
        p.x += Math.cos(flowAngle) * 0.5 + 0.2;
        p.y += Math.sin(flowAngle) * 0.3 - 0.25;

        // Wrap around
        if (p.x > this.width + 20) p.x = -20;
        if (p.x < -20) p.x = this.width + 20;
        if (p.y < -20) p.y = this.height + 20;
        if (p.y > this.height + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `${dustColor} ${p.alpha * 0.35})`;
        ctx.fill();
      }
    }

    /* ---------------- Winds: Vector Stream Flow Lines ---------------- */
    renderWinds() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const windColor = isDark ? 'rgba(160, 210, 235,' : 'rgba(86, 142, 166,';

      // Mouse gust disturbance
      const mx = this.pointer.x;
      const my = this.pointer.y;
      const hasPointer = this.pointer.active && (performance.now() - this.pointer.lastActiveTime < 1200);

      for (let p of this.particles) {
        // Curving fluid flow
        const noiseVal = Math.sin(p.x * 0.003 + this.time * 0.8) + Math.cos(p.y * 0.003 + this.time * 0.5);
        let speed = 2.4 + Math.sin(p.seed) * 1.2;

        p.vx = Math.cos(noiseVal * 1.5) * speed + 1.8;
        p.vy = Math.sin(noiseVal * 1.5) * (speed * 0.4);

        // React to pointer
        if (hasPointer) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && dist > 1) {
            const force = (1 - dist / 180) * 4.0;
            p.vx += (this.pointer.vx * 0.3 + dx / dist * 3) * force;
            p.vy += (this.pointer.vy * 0.3 + dy / dist * 2) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x > this.width + 50) p.x = -50;
        if (p.y > this.height + 50) p.y = -50;
        if (p.y < -50) p.y = this.height + 50;

        // Draw flowing wind streak
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 4, p.y - p.vy * 4);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `${windColor} ${p.alpha * 0.55})`;
        ctx.lineWidth = p.radius * 0.85;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    /* ---------------- Snow: Diamond Prismatic Glints ---------------- */
    renderSnow() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const snowColor = isDark ? 'rgba(240, 246, 255,' : 'rgba(100, 130, 160,';

      for (let p of this.particles) {
        // Slow falling snow
        p.y += 0.8 + Math.sin(p.seed + this.time) * 0.3;
        p.x += Math.sin(this.time * 0.5 + p.seed) * 0.6;

        if (p.y > this.height + 10) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${snowColor} ${p.alpha * 0.5})`;
        ctx.fill();

        // Check for diamond glint sparkle
        const glintTrigger = Math.sin(this.time * 2.5 + p.sparkle);
        if (glintTrigger > 0.82) {
          const sparkSize = (glintTrigger - 0.82) * 35;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(90, 140, 180, 0.7)';
          ctx.lineWidth = 1;
          // Draw 4-point diamond cross
          ctx.beginPath();
          ctx.moveTo(-sparkSize, 0);
          ctx.lineTo(sparkSize, 0);
          ctx.moveTo(0, -sparkSize);
          ctx.lineTo(0, sparkSize);
          ctx.stroke();

          // Central glow dot
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    /* ---------------- Grain: Golden Wheat Field & Pollen ---------------- */
    renderGrain() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const wheatColor = isDark ? 'rgba(223, 158, 56, 0.25)' : 'rgba(200, 140, 45, 0.3)';
      const pollenColor = isDark ? 'rgba(250, 204, 21,' : 'rgba(217, 119, 6,';

      // 1. Render swaying stalks at the bottom
      if (this.stalks) {
        ctx.save();
        ctx.strokeStyle = wheatColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        for (let stalk of this.stalks) {
          const sway = Math.sin(this.time * 1.4 + stalk.angleOffset) * stalk.swayAmp;
          const tipX = stalk.x + sway;
          const tipY = stalk.baseY - stalk.height;
          const cpX = stalk.x + sway * 0.4;
          const cpY = stalk.baseY - stalk.height * 0.5;

          ctx.beginPath();
          ctx.moveTo(stalk.x, stalk.baseY);
          ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
          ctx.stroke();

          // Draw small wheat ear grains at tip
          ctx.fillStyle = isDark ? 'rgba(245, 180, 70, 0.35)' : 'rgba(180, 120, 30, 0.35)';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2. Render rising golden pollen/chaff
      for (let p of this.particles) {
        p.y -= 0.6 + Math.sin(p.seed + this.time) * 0.2;
        p.x += Math.sin(this.time * 0.7 + p.seed) * 0.8 + 0.3;

        if (p.y < -20) {
          p.y = this.height + 10;
          p.x = Math.random() * this.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `${pollenColor} ${p.alpha * 0.55})`;
        ctx.fill();
      }
    }

    /* ---------------- Rain: Autumn Rain Streaks & Impact Ripples ---------------- */
    renderRain() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const rainColor = isDark ? 'rgba(160, 190, 210, 0.45)' : 'rgba(89, 115, 135, 0.4)';

      for (let p of this.particles) {
        p.y += 9.0 + (p.radius * 2);
        p.x += 1.8; // Angled gentle autumn rain

        if (p.y > this.height) {
          // Occasionally spawn a ground ripple
          if (Math.random() < 0.15) {
            this.spawnRipple(p.x, this.height - Math.random() * 40);
          }
          p.y = -30;
          p.x = Math.random() * (this.width + 100) - 50;
        }

        ctx.beginPath();
        ctx.moveTo(p.x - 2, p.y - p.length);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = rainColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    /* ---------------- Birds: Reynolds Boids Murmuration ---------------- */
    renderBirds() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const birdColor = isDark ? 'rgba(215, 205, 235, 0.85)' : 'rgba(60, 50, 75, 0.8)';

      const orbitCenterX = this.width * 0.5;
      const orbitCenterY = this.height * 0.42;

      for (let b of this.boids) {
        // Orbital pull toward center of circled flight
        const toCenterX = orbitCenterX - b.x;
        const toCenterY = orbitCenterY - b.y;
        const distToCenter = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);

        // Tangential circling acceleration
        const tangentX = -toCenterY / (distToCenter + 1);
        const tangentY = toCenterX / (distToCenter + 1);

        b.vx += tangentX * 0.08 + (toCenterX / distToCenter) * 0.03;
        b.vy += tangentY * 0.08 + (toCenterY / distToCenter) * 0.03;

        // Pointer avoidance/attraction
        if (this.pointer.active) {
          const pdx = b.x - this.pointer.x;
          const pdy = b.y - this.pointer.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pDist < 160 && pDist > 1) {
            b.vx += (pdx / pDist) * 0.4;
            b.vy += (pdy / pDist) * 0.4;
          }
        }

        // Speed clamping
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const maxSpeed = 3.5;
        const minSpeed = 1.5;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        } else if (speed < minSpeed) {
          b.vx = (b.vx / speed) * minSpeed;
          b.vy = (b.vy / speed) * minSpeed;
        }

        b.x += b.vx;
        b.y += b.vy;
        b.wingPhase += b.wingSpeed;

        // Heading angle
        const heading = Math.atan2(b.vy, b.vx);
        const wingFlap = Math.sin(b.wingPhase) * 4;

        // Draw bird glyph (V-wing minimalist)
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(heading);
        ctx.strokeStyle = birdColor;
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // Left wing tip to beak to right wing tip
        ctx.moveTo(-b.size * 1.4, -b.size * 0.8 + wingFlap);
        ctx.lineTo(b.size * 0.8, 0);
        ctx.lineTo(-b.size * 1.4, b.size * 0.8 - wingFlap);
        ctx.stroke();

        ctx.restore();
      }
    }

    /* ---------------- Stars: Constellations & Stellar Field ---------------- */
    renderStars() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const starFill = isDark ? 'rgba(255, 245, 210,' : 'rgba(80, 85, 110,';
      const lineStroke = isDark ? 'rgba(212, 175, 55,' : 'rgba(90, 100, 140,';

      const mx = this.pointer.x;
      const my = this.pointer.y;

      // Draw interactive constellation linkages
      for (let i = 0; i < this.stars.length; i++) {
        const s1 = this.stars[i];
        for (let j = i + 1; j < this.stars.length; j++) {
          const s2 = this.stars[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            // Check distance to mouse
            const dMouse = Math.sqrt((s1.x - mx) ** 2 + (s1.y - my) ** 2);
            const lineAlpha = (1 - dist / 85) * (dMouse < 160 ? 0.35 : 0.08);

            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `${lineStroke} ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw star nodes
      for (let s of this.stars) {
        const twinkle = Math.sin(this.time * s.twinkleSpeed * 60 + s.phase);
        const alpha = Math.max(0.1, s.baseAlpha + twinkle * 0.3);

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${starFill} ${alpha})`;
        ctx.fill();
      }
    }

    /* ---------------- Epilogue: Cosmic Mandala Spiral ---------------- */
    renderEpilogue() {
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const spiralColor = isDark ? 'rgba(212, 175, 55,' : 'rgba(160, 120, 50,';

      const centerX = this.width * 0.5;
      const centerY = this.height * 0.45;

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const angle = i * 0.15 + this.time * 0.2;
        const radius = (i * 2.8 + (this.time * 20) % 300);

        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * (radius * 0.6);

        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `${spiralColor} ${p.alpha * 0.4})`;
        ctx.fill();
      }
    }

    /* ---------------- Surface Ripples ---------------- */
    renderRipples() {
      if (this.ripples.length === 0) return;
      const ctx = this.ctx;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const rippleStroke = isDark ? 'rgba(140, 180, 210,' : 'rgba(89, 115, 135,';

      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.growth;
        r.alpha -= 0.012;

        if (r.alpha <= 0 || r.radius > r.maxRadius) {
          this.ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${rippleStroke} ${r.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    /* ---------------- Dissolved Thought Particles ---------------- */
    renderDissolvedThoughts() {
      if (this.dissolvedThoughts.length === 0) return;
      const ctx = this.ctx;

      for (let i = this.dissolvedThoughts.length - 1; i >= 0; i--) {
        const p = this.dissolvedThoughts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.dissolvedThoughts.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.85;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  /* ==========================================================================
     3. GENERATIVE SOUNDSCAPE ENGINE (WEB AUDIO API)
     Zero External Dependencies · 100% Client Polyphonic Synthesis
     ========================================================================== */
  class SoundscapeEngine {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.masterGain = null;
      this.windFilter = null;
      this.chimeTimer = null;
      this.activeMood = 'prologue';
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWindGenerator();
      this.setupDronePad();
    }

    setupWindGenerator() {
      // Create 2-second pink noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Resonant bandpass filter to shape wind frequency
      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      // Low frequency oscillator (LFO) to modulate wind swell
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(this.windFilter.frequency);
      lfo.start();

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

      noiseSource.connect(this.windFilter);
      this.windFilter.connect(windGain);
      windGain.connect(this.masterGain);

      noiseSource.start();
    }

    setupDronePad() {
      // Ethereal chord pad: A2 (110Hz), E3 (164.8Hz), A3 (220Hz)
      const chordFreqs = [110, 164.81, 220];
      chordFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(340, this.ctx.currentTime);

        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.045, this.ctx.currentTime);

        osc.connect(padFilter);
        padFilter.connect(padGain);
        padGain.connect(this.masterGain);
        osc.start();
      });
    }

    triggerCrystalBell() {
      if (!this.ctx || !this.isPlaying) return;
      // High delicate pentatonic chime: E5 (659.2), G#5 (830.6), B5 (987.7), C#6 (1108.7), E6 (1318.5)
      const pentatonic = [659.25, 830.61, 987.77, 1108.73, 1318.51];
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const bellGain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      bellGain.gain.setValueAtTime(0.0001, now);
      bellGain.gain.linearRampToValueAtTime(0.06, now + 0.04);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(bellGain);
      bellGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.0);
    }

    startChimeLoop() {
      const scheduleNext = () => {
        if (!this.isPlaying) return;
        const delay = Math.random() * 4500 + 3500;
        this.chimeTimer = setTimeout(() => {
          this.triggerCrystalBell();
          scheduleNext();
        }, delay);
      };
      scheduleNext();
    }

    toggle() {
      this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (this.isPlaying) {
        // Fade out
        const now = this.ctx.currentTime;
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        this.isPlaying = false;
        clearTimeout(this.chimeTimer);
      } else {
        // Fade in
        const now = this.ctx.currentTime;
        this.masterGain.gain.linearRampToValueAtTime(0.35, now + 1.6);
        this.isPlaying = true;
        this.startChimeLoop();
      }
      return this.isPlaying;
    }
  }

  /* ==========================================================================
     4. BREATH MEDITATION CONTROLLER
     ========================================================================== */
  class BreathController {
    constructor() {
      this.overlay = document.getElementById('breathGuideOverlay');
      this.orbWrap = document.querySelector('.breath-orb-wrap');
      this.phaseText = document.getElementById('breathPhaseText');
      this.quoteText = document.getElementById('breathQuoteText');
      this.closeBtn = document.getElementById('closeBreathBtn');
      this.active = false;
      this.timer = null;

      this.phases = [
        { name: '吸气 · 迎向千风', duration: 4000, cls: 'inhale', quote: '“我是吹拂世间的千缕风，随你入肺腑。”' },
        { name: '持气 · 感受光芒', duration: 4000, cls: 'hold', quote: '“万千碎钻微光，皆在心室沉静。”' },
        { name: '呼气 · 归还大地', duration: 6000, cls: 'exhale', quote: '“将哀痛化作温润秋雨，滋养沉睡之壤。”' },
        { name: '驻留 · 万象一如', duration: 2000, cls: 'pause', quote: '“天地与我并生，而万物与我为一。”' }
      ];
      this.currentPhaseIdx = 0;

      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.stop());
      }
    }

    start() {
      if (!this.overlay) return;
      this.active = true;
      this.overlay.classList.remove('hidden');
      this.currentPhaseIdx = 0;
      this.runCycle();
    }

    stop() {
      this.active = false;
      clearTimeout(this.timer);
      if (this.overlay) {
        this.overlay.classList.add('hidden');
      }
      const breathBtn = document.getElementById('breathToggle');
      if (breathBtn) {
        breathBtn.setAttribute('aria-pressed', 'false');
        breathBtn.classList.remove('active');
      }
    }

    runCycle() {
      if (!this.active) return;
      const p = this.phases[this.currentPhaseIdx];

      if (this.phaseText) this.phaseText.textContent = p.name;
      if (this.quoteText) this.quoteText.textContent = p.quote;

      if (this.orbWrap) {
        this.orbWrap.className = `breath-orb-wrap ${p.cls}`;
      }

      this.timer = setTimeout(() => {
        if (!this.active) return;
        this.currentPhaseIdx = (this.currentPhaseIdx + 1) % this.phases.length;
        this.runCycle();
      }, p.duration);
    }
  }

  /* ==========================================================================
     5. MAIN ORCHESTRATION & DOM INTERACTIONS
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Canvas Physics
    const engine = new AtmosphereEngine('atmosphereCanvas');

    // 2. Initialize Soundscape
    const soundscape = new SoundscapeEngine();
    const audioBtn = document.getElementById('audioToggle');
    const audioLabel = document.getElementById('audioLabel');
    const audioWaveform = document.getElementById('audioWaveform');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isPlaying = soundscape.toggle();
        audioBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        audioBtn.classList.toggle('active', isPlaying);
        if (audioLabel) audioLabel.textContent = isPlaying ? '天籁流转' : '天籁静默';
        if (audioWaveform) audioWaveform.classList.toggle('playing', isPlaying);
      });
    }

    // 3. Initialize Breath Guide
    const breathController = new BreathController();
    const breathBtn = document.getElementById('breathToggle');
    if (breathBtn) {
      breathBtn.addEventListener('click', () => {
        if (breathController.active) {
          breathController.stop();
        } else {
          breathController.start();
          breathBtn.setAttribute('aria-pressed', 'true');
          breathBtn.classList.add('active');
        }
      });
    }

    // 4. Illumination Switcher (Light / Dark Mode)
    const illumBtn = document.getElementById('illuminationToggle');
    const illumLabel = document.getElementById('illuminationLabel');
    if (illumBtn) {
      illumBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (illumLabel) illumLabel.textContent = nextTheme === 'dark' ? '夜观' : '晨光';
      });
    }

    // 5. Stanza Constellation Navigation & Intersection Observer
    const navButtons = document.querySelectorAll('.nav-elem-btn');
    const sections = document.querySelectorAll('.stanza-section');

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px',
      threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const scene = entry.target.dataset.scene || entry.target.id;
          engine.setScene(scene);

          // Update active navigation pill
          navButtons.forEach((btn) => {
            const match = btn.dataset.element === scene;
            btn.classList.toggle('active', match);
          });

          // Morph CSS accent variables
          const cfg = ELEMENT_CONFIG[scene] || ELEMENT_CONFIG.prologue;
          document.documentElement.style.setProperty('--current-accent', cfg.accent);
          document.documentElement.style.setProperty('--current-accent-soft', cfg.accentSoft);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => sectionObserver.observe(sec));

    // Nav button click handler
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.element;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // 6. Interactive Crystal Plate (Snow Stanza)
    const crystalPlate = document.getElementById('crystalPlate');
    if (crystalPlate) {
      crystalPlate.addEventListener('mouseenter', () => {
        soundscape.triggerCrystalBell();
      });
      crystalPlate.addEventListener('click', (e) => {
        soundscape.triggerCrystalBell();
        engine.spawnRipple(e.clientX, e.clientY);
      });
    }

    // 7. Interactive Rain Ripple Sensor (Rain Stanza)
    const rainSensor = document.getElementById('rainRippleSensor');
    if (rainSensor) {
      rainSensor.addEventListener('click', (e) => {
        const rect = rainSensor.getBoundingClientRect();
        engine.spawnRipple(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
      });
    }

    // 8. Interactive Thought Crucible ("寄意长风")
    const thoughtForm = document.getElementById('thoughtForm');
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const releaseBtn = document.getElementById('releaseThoughtBtn');

    if (thoughtInput && charCount) {
      thoughtInput.addEventListener('input', () => {
        charCount.textContent = thoughtInput.value.length;
      });
    }

    if (thoughtForm && releaseBtn && thoughtInput) {
      thoughtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = thoughtInput.value.trim();
        if (!text) {
          thoughtInput.focus();
          return;
        }

        // Dissolve into particles on canvas
        engine.injectThoughtParticles(text);
        soundscape.triggerCrystalBell();

        // Button feedback
        const originalHtml = releaseBtn.innerHTML;
        releaseBtn.innerHTML = '<span>✦ 思念已入微风，融归万象</span>';
        releaseBtn.style.background = '#c9933e';
        thoughtInput.value = '';
        if (charCount) charCount.textContent = '0';

        setTimeout(() => {
          releaseBtn.innerHTML = originalHtml;
          releaseBtn.style.background = '';
        }, 3200);
      });
    }

    // 9. Echo Nodes & Card Modal ("飘荡在气流中的无名回响")
    const echoNodes = document.querySelectorAll('.echo-node');
    const echoCardModal = document.getElementById('echoCardModal');
    const echoCardContent = document.getElementById('echoCardContent');
    const closeEchoCard = document.getElementById('closeEchoCard');

    echoNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const thought = node.dataset.echo;
        if (echoCardContent && echoCardModal) {
          echoCardContent.textContent = thought;
          echoCardModal.classList.remove('hidden');
          soundscape.triggerCrystalBell();
        }
      });
    });

    if (closeEchoCard && echoCardModal) {
      closeEchoCard.addEventListener('click', () => {
        echoCardModal.classList.add('hidden');
      });
    }
  });

})();
