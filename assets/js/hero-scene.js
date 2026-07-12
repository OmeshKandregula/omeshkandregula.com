import * as THREE from 'three';

const canvas = document.getElementById('hero-canvas');
if (canvas) initHeroScene(canvas);

function initHeroScene(canvas) {
  const heroSection = canvas.closest('section');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 30);

  const isMobile = window.innerWidth < 768;
  const segments = isMobile ? 64 : 150;
  const size = 13;

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(999, 999) },
    uMouseStrength: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    extensions: { derivatives: true },
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uMouseStrength;
      varying float vElevation;
      varying vec2 vPos;
      varying float vDist;

      void main() {
        vec3 pos = position;

        float wave = sin(pos.x * 0.55 + uTime * 0.45) * 0.14
                   + sin(pos.y * 0.5 - uTime * 0.35) * 0.14
                   + sin((pos.x + pos.y) * 0.3 + uTime * 0.25) * 0.09;

        float d = distance(pos.xy, uMouse);
        float ripple = exp(-d * d * 0.3) * sin(d * 2.6 - uTime * 2.2) * 0.85 * uMouseStrength;

        float elevation = wave + ripple;
        pos.z += elevation;

        vElevation = elevation;
        vPos = pos.xy;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vDist = -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vElevation;
      varying vec2 vPos;
      varying float vDist;

      float gridFactor(vec2 coord, float cell) {
        vec2 c = coord / cell;
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        float line = min(g.x, g.y);
        return 1.0 - clamp(line, 0.0, 1.0);
      }

      void main() {
        float line = gridFactor(vPos, 0.42);

        vec3 base = vec3(0.34, 0.36, 0.4);
        vec3 accent = vec3(0.08, 0.78, 0.55);
        vec3 color = mix(base, accent, clamp(vElevation * 2.4, 0.0, 1.0));

        float fog = smoothstep(9.5, 3.0, vDist);
        float radial = 1.0 - smoothstep(4.2, 7.5, length(vPos));

        gl_FragColor = vec4(color, line * fog * radial * 0.8);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -1.05;
  mesh.position.set(1.4, -1.15, -2.2);
  scene.add(mesh);

  camera.position.set(0, 0.35, 3.1);
  camera.lookAt(1.0, -0.6, -2.0);

  function resize() {
    const rect = heroSection.getBoundingClientRect();
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const raycaster = new THREE.Raycaster();
  const ndcMouse = new THREE.Vector2(999, 999);
  const targetLocal = new THREE.Vector2(999, 999);
  const currentLocal = new THREE.Vector2(999, 999);
  let mouseStrengthTarget = 0;

  window.addEventListener('pointermove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
      mouseStrengthTarget = 0;
      return;
    }
    ndcMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndcMouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseStrengthTarget = 1;
  }, { passive: true });

  heroSection.addEventListener('pointerleave', () => { mouseStrengthTarget = 0; });

  let isVisible = true;
  const observer = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; }, { threshold: 0 });
  observer.observe(heroSection);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();

  const clock = new THREE.Clock();

  function renderFrame() {
    uniforms.uTime.value = clock.getElapsedTime();

    raycaster.setFromCamera(ndcMouse, camera);
    const hit = raycaster.intersectObject(mesh)[0];
    if (hit) {
      const local = mesh.worldToLocal(hit.point.clone());
      targetLocal.set(local.x, local.y);
    }
    currentLocal.lerp(targetLocal, 0.08);
    uniforms.uMouse.value.copy(currentLocal);
    uniforms.uMouseStrength.value += (mouseStrengthTarget - uniforms.uMouseStrength.value) * 0.05;

    renderer.render(scene, camera);
  }

  if (prefersReducedMotion) {
    renderFrame();
    return;
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible || document.hidden) return;
    renderFrame();
  }
  animate();
}
