import React, { useEffect, useRef } from 'react';
import { useAppState } from '../AppStateContext';
import * as THREE from 'three';

export default function CarbonSinkTab() {
  const { state, boostDacFans, regenerateFilter } = useAppState();
  const { co2Captured, fanSpeed, filterSat, boostActive, boostTimeLeft, points } = state;

  const containerRef = useRef(null);
  const stateRef = useRef({ fanSpeed, boostActive });

  // Update ref to keep loop values fresh without rebuilding scene
  useEffect(() => {
    stateRef.current = { fanSpeed, boostActive };
  }, [fanSpeed, boostActive]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = 240;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00FF87, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 0.8, 15);
    pointLight.position.set(-4, -2, 3);
    scene.add(pointLight);

    // Track objects for disposal
    const geometries = [];
    const materials = [];

    const trackGeom = (g) => { geometries.push(g); return g; };
    const trackMat = (m) => { materials.push(m); return m; };

    // 3. Reactor Frame / Chassis
    const frameGeom = trackGeom(new THREE.BoxGeometry(6.2, 2.6, 0.4));
    const frameMat = trackMat(new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
      flatShading: true
    }));
    const frameMesh = new THREE.Mesh(frameGeom, frameMat);
    scene.add(frameMesh);

    // Vents / Intakes
    const ventGeom = trackGeom(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 24));
    const ventMat = trackMat(new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1
    }));

    const ventPositions = [-2.0, 0.0, 2.0];
    const fans = [];

    ventPositions.forEach((posX) => {
      // Create Vent Cylinder
      const vent = new THREE.Mesh(ventGeom, ventMat);
      vent.rotation.x = Math.PI / 2;
      vent.position.set(posX, 0, 0.15);
      scene.add(vent);

      // Create Fan Assembly
      const fanGroup = new THREE.Group();
      fanGroup.position.set(posX, 0, 0.22);
      scene.add(fanGroup);

      // Hub
      const hubGeom = trackGeom(new THREE.SphereGeometry(0.18, 16, 16));
      const hubMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 }));
      const hub = new THREE.Mesh(hubGeom, hubMat);
      fanGroup.add(hub);

      // Blades (3 blades per fan)
      const bladeGeom = trackGeom(new THREE.BoxGeometry(0.08, 0.72, 0.02));
      const bladeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 }));

      for (let i = 0; i < 3; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.z = (i * 120) * Math.PI / 180;
        
        const blade = new THREE.Mesh(bladeGeom, bladeMat);
        blade.position.y = 0.35;
        blade.rotation.y = 0.4; // Pitch angle
        
        pivot.add(blade);
        fanGroup.add(pivot);
      }

      fans.push(fanGroup);
    });

    // 4. Floating CO2 Suction Particles
    const particles = [];
    const particleCount = 35;
    const pGeom = trackGeom(new THREE.SphereGeometry(0.04, 8, 8));
    const pMat = trackMat(new THREE.MeshBasicMaterial({
      color: 0x00FF87,
      transparent: true,
      opacity: 0.75
    }));

    for (let i = 0; i < particleCount; i++) {
      const pMesh = new THREE.Mesh(pGeom, pMat);
      // Distribute particles in front of the vents
      const posX = (Math.random() - 0.5) * 6.5;
      const posY = (Math.random() - 0.5) * 2.5;
      const posZ = 1.0 + Math.random() * 4.0;
      pMesh.position.set(posX, posY, posZ);
      
      scene.add(pMesh);
      particles.push(pMesh);
    }

    // 5. Animation Loop
    let animationFrameId;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Get current speed from state ref
      const currentRPM = stateRef.current.fanSpeed;
      const rotationDelta = (currentRPM * Math.PI * 2) / (60 * 60); // rad per frame

      // Rotate fans
      fans.forEach((fan) => {
        fan.rotation.z += rotationDelta;
      });

      // Animate particles (suction effect)
      const particleSpeed = (currentRPM / 120) * 0.035;

      particles.forEach((p) => {
        p.position.z -= particleSpeed;

        // Pull particles slightly towards the nearest vent in X/Y
        let nearestVentX = 0;
        let minDist = 999;
        ventPositions.forEach(vx => {
          const d = Math.abs(p.position.x - vx);
          if (d < minDist) {
            minDist = d;
            nearestVentX = vx;
          }
        });
        p.position.x += (nearestVentX - p.position.x) * 0.02;
        p.position.y += (0 - p.position.y) * 0.02;

        // Reset particle if it enters the intake (z <= 0.2)
        if (p.position.z <= 0.22) {
          p.position.x = (Math.random() - 0.5) * 6.5;
          p.position.y = (Math.random() - 0.5) * 2.5;
          p.position.z = 3.5 + Math.random() * 2.5;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup / Disposal on Unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose meshes
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="sink-layout">
      <div className="sink-grid">
        {/* Left column: Direct Air Capture 3D Portal Visualizer */}
        <div className="sink-card visualization-panel glass-panel">
          <div className="card-header-row">
            <h3 className="panel-title">Personal Air Capture Module</h3>
            <span className="live-badge">● Live Extraction</span>
          </div>

          <div ref={containerRef} className="threejs-sink-canvas" style={{ position: 'relative', width: '100%', height: '240px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid var(--border-glass)' }} />
          
          <div className="visualizer-hud">
            <div className="hud-pill">
              <span className="hud-label">Turbulence Speed</span>
              <span className="hud-val text-neon">{fanSpeed} RPM</span>
            </div>
            <div className="hud-pill">
              <span className="hud-label">Boost Status</span>
              <span className="hud-val" style={{ color: boostActive ? '#00FF87' : 'rgba(255,255,255,0.4)' }}>
                {boostActive ? `Active (${boostTimeLeft}s)` : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Action Controls & Accumulators */}
        <div className="sink-card controls-panel glass-panel">
          <h3 className="panel-title">Extraction Metrics</h3>
          <p className="panel-description">Breathe clean air. Sustainable habits logged in the Actions Log boost the baseline extraction RPM automatically.</p>

          <div className="accumulator-box">
            <span className="accumulator-label">Atmospheric CO₂ Extracted</span>
            <div className="accumulator-number-row">
              <span className="acc-number text-neon" id="co2-captured-val">{co2Captured.toFixed(3)}</span>
              <span className="acc-unit">grams</span>
            </div>
          </div>

          <div className="saturation-meter-group">
            <div className="meter-header">
              <span>Filter Adsorbent Saturation</span>
              <span id="filter-sat-val">{filterSat}%</span>
            </div>
            <div className="meter-track">
              <div 
                className="meter-fill" 
                style={{ 
                  width: `${filterSat}%`, 
                  background: filterSat >= 90 ? '#ef4444' : filterSat >= 70 ? '#f59e0b' : '#00FF87' 
                }} 
              />
            </div>
            {filterSat >= 100 && (
              <p className="meter-warning text-error">Warning: Saturated filter! Carbon capture speed reduced. Please regenerate filter.</p>
            )}
          </div>

          <div className="button-group">
            <button 
              className={`btn btn-primary boost-btn ${boostActive ? 'active' : ''}`}
              onClick={boostDacFans}
              disabled={boostActive || points < 50}
              type="button"
            >
              {boostActive ? `Boost Active (${boostTimeLeft}s)` : `Boost Fans (Cost: 50 pts)`}
            </button>

            <button 
              className="btn btn-secondary regenerate-btn"
              onClick={regenerateFilter}
              disabled={filterSat === 0}
              type="button"
            >
              Regenerate Filter
            </button>
          </div>

          <p className="controls-footer-help">Sponsoring offsets and logging habits accumulates points. Spend 50 EcoPoints to trigger a 10s boost to 600 RPM.</p>
        </div>
      </div>
    </div>
  );
}
