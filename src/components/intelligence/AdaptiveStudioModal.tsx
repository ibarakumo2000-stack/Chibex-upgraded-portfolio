import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { X, Sliders, Eye, RotateCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface AdaptiveStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pre-allocate scratch math objects outside animation loop for Zero GC
const _vec3_A = new THREE.Vector3();
const _vec3_B = new THREE.Vector3();
const _colorA = new THREE.Color();

export const AdaptiveStudioModal: React.FC<AdaptiveStudioModalProps> = ({ isOpen, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [explodedRatio, setExplodedRatio] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [currentFinish, setCurrentFinish] = useState<'gold' | 'cyber' | 'platinum'>('gold');
  const [activeCameraView, setActiveCameraView] = useState<'perspective' | 'front' | 'top'>('perspective');

  // Mutable refs to pass UI state smoothly into the 60fps render loop
  const explodedRef = useRef(0);
  explodedRef.current = explodedRatio;
  const speedRef = useRef(1);
  speedRef.current = rotationSpeed;
  const finishRef = useRef<'gold' | 'cyber' | 'platinum'>('gold');
  finishRef.current = currentFinish;

  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0f0e);
    scene.fog = new THREE.FogExp2(0x0e0f0e, 0.038);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. RoomEnvironment & PMREMGenerator for realistic PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. OrbitControls with smooth exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 20;
    controls.minDistance = 3.5;
    controls.maxPolarAngle = Math.PI / 1.7; // Prevent going beneath ground shadow
    controls.target.set(0, 0.4, 0);

    // 4. Studio PBR Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x141613, 1.4);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(6, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xc8ff45, 2.0, 15);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    // 5. Procedural Texture Generator for micro-facet surface
    const createProceduralFacetTexture = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0ea';
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = '#d4d8ce';
        ctx.lineWidth = 1.5;
        const step = 32;
        for (let x = 0; x <= size; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, size);
          ctx.stroke();
        }
        for (let y = 0; y <= size; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y);
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };

    const facetTexture = createProceduralFacetTexture();

    // 6. Contact Shadow Plane Grounding (Grounded at y = -2.1)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.1;
    scene.add(shadowMesh);

    // 7. COMPOSITE 3-12 PART PROCEDURAL MODEL
    const rootAssembly = new THREE.Group();
    rootAssembly.position.y = 0.3;
    scene.add(rootAssembly);

    // Part 1: Primary Core Sphere (Silky PBR)
    const coreSphereGeo = new THREE.SphereGeometry(1.22, 64, 64);
    const coreSphereMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.22,
      metalness: 0.14,
      map: facetTexture,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreSphereMat);
    coreSphere.castShadow = true;
    coreSphere.receiveShadow = true;
    rootAssembly.add(coreSphere);

    // Part 2: Inner Transmissive Core Sphere (Lime Core)
    const innerCrystalGeo = new THREE.IcosahedronGeometry(0.75, 1);
    const innerCrystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8ff45,
      roughness: 0.1,
      metalness: 0.85,
      transmission: 0.4,
      ior: 1.6,
    });
    const innerCrystal = new THREE.Mesh(innerCrystalGeo, innerCrystalMat);
    rootAssembly.add(innerCrystal);

    // Part 3: Equatorial Gimbal Ring (Gold/Anisotropic)
    const gimbalEquatorGeo = new THREE.TorusGeometry(1.72, 0.048, 24, 96);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe0b84c,
      roughness: 0.18,
      metalness: 0.95,
    });
    const gimbalEquator = new THREE.Mesh(gimbalEquatorGeo, goldMat);
    gimbalEquator.rotation.x = Math.PI / 2;
    rootAssembly.add(gimbalEquator);

    // Part 4: Orthogonal Meridian Gimbal Ring (Titanium/Cobalt)
    const gimbalMeridianGeo = new THREE.TorusGeometry(2.05, 0.042, 24, 96);
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x5a6358,
      roughness: 0.42,
      metalness: 0.85,
    });
    const gimbalMeridian = new THREE.Mesh(gimbalMeridianGeo, titaniumMat);
    rootAssembly.add(gimbalMeridian);

    // Part 5: Polar Sensor Struts (TubeGeometry / Cylinder)
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.8, 16);
    const strutMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.25,
      metalness: 0.9,
    });
    const polarStrut = new THREE.Mesh(strutGeo, strutMat);
    rootAssembly.add(polarStrut);

    // Part 6 & 7: Geodesic Wireframe Cages (Icosahedron & Dodecahedron)
    const icosaGeo = new THREE.IcosahedronGeometry(2.45, 0);
    const wireMatA = new THREE.LineBasicMaterial({
      color: 0xe0b84c,
      transparent: true,
      opacity: 0.75,
    });
    const wireCageA = new THREE.LineSegments(new THREE.WireframeGeometry(icosaGeo), wireMatA);
    rootAssembly.add(wireCageA);

    const dodecaGeo = new THREE.DodecahedronGeometry(2.85, 0);
    const wireMatB = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const wireCageB = new THREE.LineSegments(new THREE.WireframeGeometry(dodecaGeo), wireMatB);
    rootAssembly.add(wireCageB);

    // Part 8: Beacon Nodes on Vertices
    const beadGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const beadMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff45,
      metalness: 0.9,
      roughness: 0.1,
    });
    const beadGroup = new THREE.Group();
    const posAttr = icosaGeo.getAttribute('position');
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const b = new THREE.Mesh(beadGeo, beadMat);
      b.position.set(vx, vy, vz);
      beadGroup.add(b);
    }
    rootAssembly.add(beadGroup);

    // Parts 9-12: Orbiting Satellites with custom inclinations
    const satellitesGroup = new THREE.Group();
    rootAssembly.add(satellitesGroup);

    interface SatNode {
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      inclination: number;
      phase: number;
      baseRadius: number;
    }

    const satNodes: SatNode[] = [];
    const satConfigs = [
      { baseRadius: 3.2, speed: 0.8, inc: 0.35, color: 0x38bdf8, size: 0.17 },
      { baseRadius: 3.7, speed: -0.6, inc: -0.5, color: 0xe0b84c, size: 0.14 },
      { baseRadius: 4.2, speed: 0.45, inc: 1.1, color: 0x2563eb, size: 0.19 },
      { baseRadius: 4.8, speed: -0.9, inc: -0.8, color: 0xc8ff45, size: 0.12 },
    ];

    satConfigs.forEach((cfg, idx) => {
      const geo = new THREE.SphereGeometry(cfg.size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.2,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      satellitesGroup.add(mesh);

      satNodes.push({
        mesh,
        radius: cfg.baseRadius,
        baseRadius: cfg.baseRadius,
        speed: cfg.speed,
        inclination: cfg.inc,
        phase: (idx * Math.PI * 2) / satConfigs.length,
      });
    });

    // 8. 60FPS Lossless Animation Loop with Exponential Damping
    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const speed = speedRef.current;
      const exploded = explodedRef.current;

      // Update Controls
      controls.update();

      // Continuous 3D rotation of assembly
      rootAssembly.rotation.y += 0.25 * delta * speed;
      wireCageA.rotation.x = elapsed * 0.18 * speed;
      wireCageA.rotation.z = elapsed * 0.12 * speed;
      wireCageB.rotation.y = -elapsed * 0.22 * speed;
      innerCrystal.rotation.x = elapsed * 0.4 * speed;
      innerCrystal.rotation.y = elapsed * 0.6 * speed;

      // Exploded View Separation interpolation
      // Scale outer wireframes and gimbals outwards based on exploded slider
      const scaleMultiplier = 1 + exploded * 0.75;
      wireCageA.scale.setScalar(scaleMultiplier);
      wireCageB.scale.setScalar(1 + exploded * 1.1);
      beadGroup.scale.setScalar(scaleMultiplier);
      gimbalEquator.scale.setScalar(1 + exploded * 0.4);
      gimbalMeridian.scale.setScalar(1 + exploded * 0.6);

      // Satellite orbits
      satNodes.forEach((node) => {
        const rad = node.baseRadius * (1 + exploded * 0.6);
        const theta = elapsed * node.speed * speed + node.phase;
        const x = Math.cos(theta) * rad;
        const z = Math.sin(theta) * rad;
        const y = z * Math.sin(node.inclination);
        node.mesh.position.set(x, y, z * Math.cos(node.inclination));
      });

      // Update materials based on selected finish theme
      const finish = finishRef.current;
      if (finish === 'cyber') {
        goldMat.color.setHex(0xc8ff45);
        wireMatA.color.setHex(0xc8ff45);
        coreSphereMat.color.setHex(0x181a17);
        coreSphereMat.roughness = 0.35;
        coreSphereMat.metalness = 0.75;
      } else if (finish === 'platinum') {
        goldMat.color.setHex(0xe5e7eb);
        wireMatA.color.setHex(0x38bdf8);
        coreSphereMat.color.setHex(0xf3f4f6);
        coreSphereMat.roughness = 0.15;
        coreSphereMat.metalness = 0.85;
      } else {
        goldMat.color.setHex(0xe0b84c);
        wireMatA.color.setHex(0xe0b84c);
        coreSphereMat.color.setHex(0xf5f5f0);
        coreSphereMat.roughness = 0.22;
        coreSphereMat.metalness = 0.14;
      }

      renderer.render(scene, camera);
    };

    render();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      facetTexture.dispose();
      shadowTexture.dispose();
      coreSphereGeo.dispose();
      coreSphereMat.dispose();
      innerCrystalGeo.dispose();
      innerCrystalMat.dispose();
      gimbalEquatorGeo.dispose();
      gimbalMeridianGeo.dispose();
      goldMat.dispose();
      titaniumMat.dispose();
      strutGeo.dispose();
      strutMat.dispose();
      icosaGeo.dispose();
      wireMatA.dispose();
      dodecaGeo.dispose();
      wireMatB.dispose();
      beadGeo.dispose();
      beadMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e0f0e] text-[#F5F5F0] overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-[#141613]/90 border border-[#2C302A] px-3.5 py-1.5 rounded-xl">
          <span className="h-2 w-2 rounded-full bg-[#c8ff45]" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#F5F5F0]">
            ADAPTIVE INTELLIGENCE 3D STUDIO
          </span>
          <span className="text-[10px] font-mono text-[#8A8E85]">| 60 FPS PBR</span>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#2C302A] bg-[#141613]/90 text-[#C5C8C1] hover:text-[#F5F5F0] hover:border-[#C8FF45] transition-colors"
          aria-label="Close 3D Studio"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main 100% Unobstructed 3D Viewport */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Scene Viewport"
      />

      {/* Pinned Bottom Control Dock (<= 15% Viewport footprint, solid/rgba surfaces, no backdrop-filter over WebGL) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[820px] transition-all duration-300">
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded-t-lg border-t border-x border-[#2C302A] bg-[#141613] text-[#C5C8C1] hover:text-[#c8ff45] hover:border-[#c8ff45]/40 transition-colors shadow-lg"
          >
            {controlsCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show Controls (Zen Mode)</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Unified Bottom Dock */}
        {!controlsCollapsed && (
          <div className="rounded-2xl border border-[#2C302A] bg-[#141613] p-4 shadow-2xl space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
              
              {/* Control 1: Exploded View Separation Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] text-[#8A8E85]">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-[#c8ff45]" />
                    <span>LAYER EXPLODED VIEW</span>
                  </span>
                  <span className="text-[#F5F5F0] font-bold">{Math.round(explodedRatio * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedRatio}
                  onChange={(e) => setExplodedRatio(parseFloat(e.target.value))}
                  className="w-full accent-[#c8ff45] cursor-pointer h-1.5 rounded-lg bg-[#222521]"
                />
              </div>

              {/* Control 2: Procedural Finish Swatches */}
              <div className="space-y-1.5">
                <div className="font-mono text-[11px] text-[#8A8E85] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                  <span>MATERIAL FINISH</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentFinish('gold')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-all ${
                      currentFinish === 'gold'
                        ? 'border-[#e0b84c] bg-[#e0b84c]/20 text-[#e0b84c] font-bold'
                        : 'border-[#2C302A] bg-[#191B18] text-[#8A8E85] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Gold & Opal
                  </button>
                  <button
                    onClick={() => setCurrentFinish('cyber')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-all ${
                      currentFinish === 'cyber'
                        ? 'border-[#c8ff45] bg-[#c8ff45]/20 text-[#c8ff45] font-bold'
                        : 'border-[#2C302A] bg-[#191B18] text-[#8A8E85] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Cyber Lime
                  </button>
                  <button
                    onClick={() => setCurrentFinish('platinum')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-all ${
                      currentFinish === 'platinum'
                        ? 'border-[#38bdf8] bg-[#38bdf8]/20 text-[#38bdf8] font-bold'
                        : 'border-[#2C302A] bg-[#191B18] text-[#8A8E85] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Platinum
                  </button>
                </div>
              </div>

              {/* Control 3: Speed Multiplier */}
              <div className="space-y-1.5">
                <div className="font-mono text-[11px] text-[#8A8E85] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="h-3.5 w-3.5 text-[#e0b84c]" />
                    <span>ROTATION VELOCITY</span>
                  </span>
                  <span className="text-[#F5F5F0] font-bold">{rotationSpeed}x</span>
                </div>
                <div className="flex gap-1.5">
                  {[0, 0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setRotationSpeed(spd)}
                      className={`flex-1 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
                        rotationSpeed === spd
                          ? 'border-[#c8ff45] bg-[#c8ff45]/15 text-[#c8ff45] font-bold'
                          : 'border-[#2C302A] bg-[#191B18] text-[#8A8E85] hover:text-[#F5F5F0]'
                      }`}
                    >
                      {spd === 0 ? 'Pause' : `${spd}x`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2C302A] flex items-center justify-between text-[11px] text-[#8A8E85]">
              <span>Drag to rotate 3D camera • Scroll to zoom • Right-click to pan</span>
              <span className="font-mono text-[#c8ff45]">ROOM ENVIRONMENT PBR ACTIVE</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
