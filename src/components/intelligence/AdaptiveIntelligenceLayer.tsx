import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Cpu, Maximize2 } from 'lucide-react';
import { AdaptiveStudioModal } from './AdaptiveStudioModal';

interface AdaptiveIntelligenceLayerProps {
  className?: string;
  onExpand?: () => void;
}

// Pre-allocate reusable scratch objects outside the animation loop to ensure Zero Garbage Collection
const _scratchVec3 = new THREE.Vector3();
const _scratchColor = new THREE.Color();

export const AdaptiveIntelligenceLayer: React.FC<AdaptiveIntelligenceLayerProps> = ({
  className = '',
  onExpand,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [webGlAvailable, setWebGlAvailable] = useState<boolean>(true);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check WebGL availability
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return Boolean(
          window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    };

    if (!checkWebGL()) {
      setWebGlAvailable(false);
      return;
    }

    const container = canvasMountRef.current;
    if (!container) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 340;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x101110, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 2. RoomEnvironment with PMREMGenerator for realistic PBR metal reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio PBR Lighting Rig: Warm Key Light + Cool Fill
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x141613, 1.2);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaed, 2.4);
    dirLight1.position.set(5, 7, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-6, -4, -3);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0xc8ff45, 1.8, 15);
    rimLight.position.set(0, 4, 3);
    scene.add(rimLight);

    // 4. Contact Shadow Plane Grounding
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.6;
    scene.add(shadowMesh);

    // 5. COMPOSITE 3-12 PART PROCEDURAL MODEL
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Part 1: Primary Central Light-Colored Sphere (Silky PBR)
    const centralSphereGeo = new THREE.SphereGeometry(1.25, 48, 48);
    const centralSphereMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f0,
      roughness: 0.22,
      metalness: 0.12,
    });
    const centralSphere = new THREE.Mesh(centralSphereGeo, centralSphereMat);
    coreGroup.add(centralSphere);

    // Part 2: Inner Polyhedral Core
    const innerCoreGeo = new THREE.DodecahedronGeometry(0.7, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xc8ff45,
      roughness: 0.15,
      metalness: 0.85,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCore);

    // Part 3: Equator Gimbal Ring (Gold Beveled Torus)
    const ringGeo = new THREE.TorusGeometry(1.55, 0.038, 16, 64);
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xe0b84c,
      roughness: 0.18,
      metalness: 0.95,
    });
    const haloRing = new THREE.Mesh(ringGeo, goldRingMat);
    haloRing.rotation.x = Math.PI / 2.3;
    coreGroup.add(haloRing);

    // Part 4: Polar Meridian Gimbal Ring (Titanium Torus)
    const meridianRingGeo = new THREE.TorusGeometry(1.85, 0.032, 16, 64);
    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x5a6358,
      roughness: 0.45,
      metalness: 0.8,
    });
    const meridianRing = new THREE.Mesh(meridianRingGeo, titaniumMat);
    meridianRing.rotation.y = Math.PI / 3;
    coreGroup.add(meridianRing);

    // Part 5 & 6: Thin Gold Geometric Wireframes (Icosahedron & Dodecahedron)
    const icosahedronGeo = new THREE.IcosahedronGeometry(2.35, 0);
    const goldWireMat = new THREE.LineBasicMaterial({
      color: 0xe0b84c,
      linewidth: 1,
      transparent: true,
      opacity: 0.75,
    });
    const icosahedronWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(icosahedronGeo),
      goldWireMat
    );
    coreGroup.add(icosahedronWire);

    const dodecahedronGeo = new THREE.DodecahedronGeometry(1.95, 0);
    const subtleWireMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
    });
    const dodecahedronWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(dodecahedronGeo),
      subtleWireMat
    );
    coreGroup.add(dodecahedronWire);

    // Part 7: Vertices Nodes on Wireframe (tiny gold/lime beads)
    const nodeSphereGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeSphereMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.15,
    });
    const posAttribute = icosahedronGeo.getAttribute('position');
    const nodeGroup = new THREE.Group();
    for (let i = 0; i < posAttribute.count; i++) {
      const vx = posAttribute.getX(i);
      const vy = posAttribute.getY(i);
      const vz = posAttribute.getZ(i);
      const bead = new THREE.Mesh(nodeSphereGeo, nodeSphereMat);
      bead.position.set(vx, vy, vz);
      nodeGroup.add(bead);
    }
    coreGroup.add(nodeGroup);

    // Parts 8-12: Orbiting Blue, Gold, and Lime Satellites
    const orbitersGroup = new THREE.Group();
    scene.add(orbitersGroup);

    interface SatelliteConfig {
      radius: number;
      speed: number;
      inclination: number;
      size: number;
      color: number;
      mesh: THREE.Mesh;
      phase: number;
    }

    const satellites: SatelliteConfig[] = [];
    const orbiterConfigs = [
      { radius: 2.85, speed: 0.85, inclination: 0.35, size: 0.16, color: 0x38bdf8 },
      { radius: 3.35, speed: -0.65, inclination: -0.6, size: 0.13, color: 0xe0b84c },
      { radius: 3.85, speed: 0.48, inclination: 1.15, size: 0.18, color: 0x2563eb },
      { radius: 2.6, speed: -1.1, inclination: -0.85, size: 0.11, color: 0xc8ff45 },
      { radius: 4.2, speed: 0.35, inclination: 0.4, size: 0.14, color: 0xf59e0b },
    ];

    orbiterConfigs.forEach((cfg, idx) => {
      const satGeo = new THREE.SphereGeometry(cfg.size, 24, 24);
      const satMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.2,
        metalness: 0.7,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      orbitersGroup.add(satMesh);

      satellites.push({
        radius: cfg.radius,
        speed: cfg.speed,
        inclination: cfg.inclination,
        size: cfg.size,
        color: cfg.color,
        mesh: satMesh,
        phase: (idx * Math.PI * 2) / orbiterConfigs.length,
      });

      // Orbital track line for depth
      const trackPoints: THREE.Vector3[] = [];
      const segments = 64;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        const x = Math.cos(theta) * cfg.radius;
        const z = Math.sin(theta) * cfg.radius;
        trackPoints.push(new THREE.Vector3(x, 0, z));
      }
      const trackGeo = new THREE.BufferGeometry().setFromPoints(trackPoints);
      const trackMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.14,
      });
      const trackLine = new THREE.Line(trackGeo, trackMat);
      trackLine.rotation.x = cfg.inclination;
      orbitersGroup.add(trackLine);
    });

    // Connecting dynamic lines from satellites to central core
    const maxLines = satellites.length;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    satellites.forEach((sat, i) => {
      _scratchColor.setHex(sat.color);
      lineColors[i * 6] = 0.9;
      lineColors[i * 6 + 1] = 0.9;
      lineColors[i * 6 + 2] = 0.9;
      lineColors[i * 6 + 3] = _scratchColor.r;
      lineColors[i * 6 + 4] = _scratchColor.g;
      lineColors[i * 6 + 5] = _scratchColor.b;
    });

    const dynamicLinesGeo = new THREE.BufferGeometry();
    dynamicLinesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    dynamicLinesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const dynamicLinesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
    });
    const dynamicLines = new THREE.LineSegments(dynamicLinesGeo, dynamicLinesMat);
    scene.add(dynamicLines);

    // 6. Mouse Parallax & Exponential Damping
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = y * 0.35;
    };

    container.addEventListener('mousemove', handlePointerMove);

    // 7. Viewport Observer
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 8. 60FPS Lossless Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const speedMultiplier = prefersReducedMotion ? 0.15 : 1.0;

      // Continuous 3D rotation of geometric wireframe & gimbals
      coreGroup.rotation.x = elapsed * 0.22 * speedMultiplier;
      coreGroup.rotation.y = elapsed * 0.32 * speedMultiplier;
      coreGroup.rotation.z = elapsed * 0.12 * speedMultiplier;

      innerCore.rotation.x = elapsed * 0.45 * speedMultiplier;
      innerCore.rotation.y = elapsed * 0.7 * speedMultiplier;

      // Subtle floating motion of central core
      centralSphere.position.y = Math.sin(elapsed * 1.6 * speedMultiplier) * 0.08;
      centralSphere.position.x = Math.cos(elapsed * 1.2 * speedMultiplier) * 0.04;

      // Exponential damping on mouse parallax
      const dampingFactor = 1 - Math.exp(-6 * delta);
      currentRotX += (targetRotX - currentRotX) * dampingFactor;
      currentRotY += (targetRotY - currentRotY) * dampingFactor;
      scene.rotation.y = currentRotY;
      scene.rotation.x = currentRotX;

      // Orbiting satellites
      const positions = dynamicLinesGeo.attributes.position.array as Float32Array;

      satellites.forEach((sat, i) => {
        const angle = elapsed * sat.speed * speedMultiplier + sat.phase;
        const x = Math.cos(angle) * sat.radius;
        const z = Math.sin(angle) * sat.radius;

        const inclinedY = z * Math.sin(sat.inclination);
        const inclinedZ = z * Math.cos(sat.inclination);

        sat.mesh.position.set(x, inclinedY, inclinedZ);

        positions[i * 6] = centralSphere.position.x;
        positions[i * 6 + 1] = centralSphere.position.y;
        positions[i * 6 + 2] = centralSphere.position.z;
        positions[i * 6 + 3] = x;
        positions[i * 6 + 4] = inclinedY;
        positions[i * 6 + 5] = inclinedZ;
      });

      dynamicLinesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      observer.disconnect();

      centralSphereGeo.dispose();
      centralSphereMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      ringGeo.dispose();
      goldRingMat.dispose();
      meridianRingGeo.dispose();
      titaniumMat.dispose();
      icosahedronGeo.dispose();
      goldWireMat.dispose();
      dodecahedronGeo.dispose();
      subtleWireMat.dispose();
      nodeSphereGeo.dispose();
      nodeSphereMat.dispose();
      dynamicLinesGeo.dispose();
      dynamicLinesMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative flex flex-col rounded-2xl border border-[#2C302A] bg-[#101110] overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#C8FF45]/40 group ${className}`}
      >
        {/* Visual Canvas Area */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#141613] via-[#101110] to-[#0d0e0d]">
          {webGlAvailable ? (
            <div
              ref={canvasMountRef}
              aria-label="3D Animated Adaptive Intelligence Layer displaying rotating wireframe and orbiting nodes"
              role="img"
              className="w-full h-full cursor-grab active:cursor-grabbing"
            />
          ) : (
            /* Graceful Fallback if WebGL is unavailable */
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="relative h-32 w-32 rounded-full border-2 border-dashed border-[#e0b84c] flex items-center justify-center animate-spin duration-[20s]">
                <div className="h-16 w-16 rounded-full bg-[#f5f5f0] shadow-lg shadow-[#c8ff45]/20 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full bg-[#c8ff45]" />
                </div>
                <div className="absolute top-0 right-2 h-4 w-4 rounded-full bg-[#38bdf8]" />
                <div className="absolute bottom-2 left-2 h-3 w-3 rounded-full bg-[#e0b84c]" />
              </div>
              <p className="text-xs font-mono text-[#C5C8C1]">
                Adaptive Intelligence Layer (Static Fallback Mode)
              </p>
            </div>
          )}

          {/* Ambient background glow behind sphere */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial from-[#c8ff45]/5 via-transparent to-transparent opacity-60"
          />

          {/* Top-Right Badges: Live 3D Indicator & Interactive Studio Launcher */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => {
                if (onExpand) onExpand();
                setIsStudioOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-md border border-[#2C302A] bg-[#101110]/90 px-2.5 py-1 text-[11px] font-mono text-[#C5C8C1] hover:text-[#C8FF45] hover:border-[#C8FF45]/50 transition-colors cursor-pointer group"
              title="Open full interactive 3D studio"
            >
              <Maximize2 className="h-3.5 w-3.5 text-[#C8FF45]" />
              <span>INTERACTIVE 3D</span>
            </button>
            <div className="flex items-center gap-1.5 rounded-md border border-[#2C302A] bg-[#101110]/80 px-2.5 py-1 text-[11px] font-mono text-[#C5C8C1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8ff45]" />
              <span>PBR</span>
            </div>
          </div>
        </div>

        {/* Required Bottom Caption Bar */}
        <div className="border-t border-[#2C302A] bg-[#191B18] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg border border-[#2C302A] bg-[#101110] text-[#c8ff45] shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-[#F5F5F0]">
                  ADAPTIVE INTELLIGENCE LAYER
                </span>
                <span className="text-[10px] font-mono text-[#c8ff45]">[CORE]</span>
              </div>
              <p className="text-xs text-[#C5C8C1] leading-relaxed">
                Thoughtful design, intelligent systems, and creative execution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed 3D Viewport Studio Modal */}
      <AdaptiveStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </>
  );
};
