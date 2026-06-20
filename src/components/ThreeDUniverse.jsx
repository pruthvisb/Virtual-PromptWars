import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAppState, actionsDatabase } from '../AppStateContext';

export default function ThreeDUniverse({ activeTab }) {
  const { state, toggleAction } = useAppState();
  const { currentCarbon, completedActions, dailyBudget, fanSpeed } = state;

  const canvasRef = useRef(null);
  const stateRef = useRef({ activeTab, currentCarbon, completedActions, dailyBudget, fanSpeed });

  // Update ref to keep loop values fresh without rebuilding scene
  useEffect(() => {
    stateRef.current = { activeTab, currentCarbon, completedActions, dailyBudget, fanSpeed };
  }, [activeTab, currentCarbon, completedActions, dailyBudget, fanSpeed]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06090f, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);
    const currentLookAt = new THREE.Vector3(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(5, 10, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.5, 20);
    cyanLight.position.set(-10, 4, -10); // near quiz terminal
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 1.5, 20);
    violetLight.position.set(-15, 2, 15); // near AI coach hologram
    scene.add(violetLight);

    const greenLight = new THREE.PointLight(0x00FF87, 1.5, 15);
    greenLight.position.set(0, -10, 0); // near DAC vents
    scene.add(greenLight);

    // Track objects for disposal
    const geometries = [];
    const materials = [];
    const trackGeom = (g) => { geometries.push(g); return g; };
    const trackMat = (m) => { materials.push(m); return m; };

    // Standard Materials
    const healthyColor = currentCarbon <= dailyBudget;
    const oceanMat = trackMat(new THREE.MeshStandardMaterial({
      color: healthyColor ? 0x0c4a6e : 0x3b3534,
      roughness: 0.2,
      metalness: 0.1,
      flatShading: true
    }));
    const landMat = trackMat(new THREE.MeshStandardMaterial({
      color: healthyColor ? 0x059669 : 0x78716c,
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true
    }));
    const leavesMat = trackMat(new THREE.MeshStandardMaterial({
      color: healthyColor ? 0x10b981 : 0xb45309,
      roughness: 0.9,
      flatShading: true
    }));
    const metalMat = trackMat(new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.2
    }));

    // =========================================================================
    // 1. THE 3D PLANET (Dashboard Sub-Deck) - Placed at (0, 0, 0)
    // =========================================================================
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Ocean Core
    const oceanMesh = new THREE.Mesh(trackGeom(new THREE.SphereGeometry(2.2, 32, 32)), oceanMat);
    oceanMesh.receiveShadow = true;
    planetGroup.add(oceanMesh);

    // Continents / Land Patches
    const patches = [
      { lat: 0, lon: 0, r: 1.3 },
      { lat: 0.4, lon: 0.8, r: 1.1 },
      { lat: -0.5, lon: -0.6, r: 1.2 },
      { lat: 0.8, lon: -1.2, r: 0.9 },
      { lat: -0.8, lon: 0.9, r: 1.0 },
      { lat: 0.3, lon: -2.0, r: 1.2 }
    ];
    patches.forEach(p => {
      const capMesh = new THREE.Mesh(trackGeom(new THREE.SphereGeometry(2.22, 16, 16, 0, p.r * 0.4, 0, p.r * 0.4)), landMat);
      const dummy = new THREE.Object3D();
      dummy.rotateY(p.lon);
      dummy.rotateX(p.lat);
      capMesh.rotation.copy(dummy.rotation);
      planetGroup.add(capMesh);
    });

    // Environment Assets (Trees)
    const treeCoords = [
      { lat: 0.1, lon: 1.1 }, { lat: -0.2, lon: 0.3 }, { lat: 0.5, lon: -0.2 },
      { lat: -0.6, lon: -1.0 }, { lat: 0.3, lon: -1.5 }, { lat: -0.1, lon: -2.0 }
    ];
    treeCoords.forEach(coord => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.03, 0.05, 0.2, 5)), trackMat(new THREE.MeshStandardMaterial({ color: 0x78350f })));
      trunk.position.y = 0.1;
      tree.add(trunk);

      const leaves = new THREE.Mesh(trackGeom(new THREE.ConeGeometry(0.12, 0.32, 5)), leavesMat);
      leaves.position.y = 0.3;
      tree.add(leaves);

      const r = 2.22;
      const phi = (90 - coord.lat * 45) * Math.PI / 180;
      const theta = (coord.lon * 45) * Math.PI / 180;
      tree.position.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta));
      const upVec = tree.position.clone().normalize();
      tree.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec));
      planetGroup.add(tree);
    });

    // Wind Turbines
    const turbines = [];
    const turbineCoords = [{ lat: 0.6, lon: -1.0 }, { lat: -0.5, lon: 1.5 }];
    turbineCoords.forEach(coord => {
      const turbine = new THREE.Group();
      const pole = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.03, 0.05, 0.8, 6)), metalMat);
      pole.position.y = 0.4;
      turbine.add(pole);

      const rotor = new THREE.Group();
      rotor.position.y = 0.8;
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(0.03, 0.35, 0.015)), leavesMat);
        blade.position.y = 0.18;
        const pivot = new THREE.Group();
        pivot.rotation.z = (i * 120) * Math.PI / 180;
        pivot.add(blade);
        rotor.add(pivot);
      }
      turbine.add(rotor);
      turbines.push(rotor);

      const r = 2.22;
      const phi = (90 - coord.lat * 45) * Math.PI / 180;
      const theta = (coord.lon * 45) * Math.PI / 180;
      turbine.position.set(r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.cos(theta));
      const upVec = turbine.position.clone().normalize();
      turbine.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec));
      planetGroup.add(turbine);
    });

    // Landmarks
    const landmarks = {};
    const quests = {};
    const landmarkConfigs = [
      { id: 'townhouse', name: 'Home Energy', lat: 0.2, lon: 0.4, color: 0x3b82f6 },
      { id: 'cafe', name: 'Cafe Diet', lat: -0.4, lon: 0.8, color: 0x10b981 },
      { id: 'station', name: 'Transit Station', lat: 0.8, lon: -0.6, color: 0x06b6d4 },
      { id: 'market', name: 'Market Goods', lat: -0.8, lon: -0.2, color: 0xf59e0b },
      { id: 'datacenter', name: 'Cloud Data Center', lat: 0.5, lon: 1.9, color: 0xec4899 },
      { id: 'bank', name: 'EcoBank Finance', lat: -0.3, lon: -1.2, color: 0x3b82f6 },
      { id: 'recycle', name: 'Recycling Depot', lat: 0.1, lon: -0.5, color: 0x10b981 }
    ];

    landmarkConfigs.forEach(conf => {
      const group = new THREE.Group();
      const baseMesh = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(0.5, 0.25, 0.5)), trackMat(new THREE.MeshStandardMaterial({ color: 0xe5e7eb, flatShading: true })));
      group.add(baseMesh);

      if (conf.id === 'townhouse') {
        const roof = new THREE.Mesh(trackGeom(new THREE.ConeGeometry(0.4, 0.35, 4)), trackMat(new THREE.MeshStandardMaterial({ color: conf.color })));
        roof.position.y = 0.3;
        roof.rotation.y = Math.PI / 4;
        group.add(roof);
      } else if (conf.id === 'cafe') {
        const awning = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(0.55, 0.08, 0.55)), trackMat(new THREE.MeshStandardMaterial({ color: 0xef4444 })));
        awning.position.y = 0.16;
        group.add(awning);
      } else {
        const top = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.2, 0.25, 0.3, 6)), trackMat(new THREE.MeshStandardMaterial({ color: conf.color })));
        top.position.y = 0.25;
        group.add(top);
      }

      // Bouncing Quest Indicator Cones
      const arrow = new THREE.Mesh(trackGeom(new THREE.ConeGeometry(0.12, 0.24, 4)), trackMat(new THREE.MeshBasicMaterial({ color: 0xf59e0b })));
      arrow.rotation.x = Math.PI;
      arrow.position.y = 0.9;
      group.add(arrow);
      arrow.visible = false;
      quests[conf.id] = arrow;

      const r = 2.22;
      const phi = (90 - conf.lat * 45) * Math.PI / 180;
      const theta = (conf.lon * 45) * Math.PI / 180;
      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);
      group.position.set(x, y, z);
      const upVec = new THREE.Vector3(x, y, z).normalize();
      group.quaternion.copy(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec));
      planetGroup.add(group);

      landmarks[conf.id] = { group, config: conf, upVector: upVec };
    });

    // Courier Sprite Setup
    const courierCanvas = document.createElement('canvas');
    courierCanvas.width = 128;
    courierCanvas.height = 128;
    const courierCtx = courierCanvas.getContext('2d');
    const courierTexture = new THREE.CanvasTexture(courierCanvas);
    const spriteMat = trackMat(new THREE.SpriteMaterial({ map: courierTexture }));
    const courierSprite = new THREE.Sprite(spriteMat);
    courierSprite.scale.set(0.65, 0.65, 1.0);
    courierSprite.position.set(0, 2.45, 0); // Positioned above the planet core
    scene.add(courierSprite);

    const drawCourierFrame = (walkFrame, direction) => {
      courierCtx.clearRect(0, 0, 128, 128);
      const legOffset = Math.sin(walkFrame * 0.5) * 6;
      const bodyBob = Math.abs(Math.sin(walkFrame * 0.5)) * 3;

      courierCtx.save();
      if (direction < 0) {
        courierCtx.translate(128, 0);
        courierCtx.scale(-1, 1);
      }
      courierCtx.fillStyle = '#78350f'; // Boots
      courierCtx.fillRect(52, 86 + legOffset, 8, 14);
      courierCtx.fillRect(68, 86 - legOffset, 8, 14);
      courierCtx.fillStyle = '#8b5cf6'; // Jacket
      courierCtx.beginPath();
      if (courierCtx.roundRect) courierCtx.roundRect(46, 52 - bodyBob, 36, 36, 8);
      else courierCtx.rect(46, 52 - bodyBob, 36, 36);
      courierCtx.fill();
      courierCtx.fillStyle = '#f59e0b'; // Bag
      courierCtx.fillRect(42, 64 - bodyBob, 12, 16);
      courierCtx.strokeStyle = '#d97706';
      courierCtx.lineWidth = 4;
      courierCtx.beginPath();
      courierCtx.moveTo(76, 52 - bodyBob);
      courierCtx.lineTo(46, 72 - bodyBob);
      courierCtx.stroke();
      courierCtx.fillStyle = '#fed7aa'; // Head
      courierCtx.beginPath();
      courierCtx.arc(64, 40 - bodyBob, 14, 0, Math.PI * 2);
      courierCtx.fill();
      courierCtx.fillStyle = '#1e293b'; // Eye
      courierCtx.fillRect(66, 36 - bodyBob, 3, 4);
      courierCtx.fillStyle = '#10b981'; // Cap
      courierCtx.beginPath();
      courierCtx.arc(64, 30 - bodyBob, 15, Math.PI, 0);
      courierCtx.fill();
      courierCtx.fillRect(64, 28 - bodyBob, 12, 4);
      courierCtx.restore();
      courierTexture.needsUpdate = true;
    };
    drawCourierFrame(0, 1);

    // Pulsing Space Portal Ring behind Planet
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 0, -1.0);
    scene.add(portalGroup);

    const portalMesh1 = new THREE.Mesh(trackGeom(new THREE.TorusGeometry(3.0, 0.05, 8, 48)), trackMat(new THREE.MeshBasicMaterial({
      color: healthyColor ? 0x00FF87 : 0xff3e3e,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    })));
    const portalMesh2 = new THREE.Mesh(trackGeom(new THREE.TorusGeometry(2.8, 0.02, 6, 32)), trackMat(new THREE.MeshBasicMaterial({
      color: healthyColor ? 0x06b6d4 : 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })));
    portalGroup.add(portalMesh1);
    portalGroup.add(portalMesh2);


    // =========================================================================
    // 2. THE DATA TERMINAL CONSOLE (Quiz Sub-Deck) - Placed at (-10, 2, -10)
    // =========================================================================
    const quizGroup = new THREE.Group();
    quizGroup.position.set(-10, 2, -10);
    scene.add(quizGroup);

    const desk = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(4, 1.2, 2.2)), metalMat);
    desk.position.y = -0.6;
    quizGroup.add(desk);

    const monitor = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(2.4, 1.5, 0.15)), trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })));
    monitor.position.set(0, 0.6, -0.4);
    monitor.rotation.x = -0.15;
    quizGroup.add(monitor);

    const screenMat = trackMat(new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    }));
    const screen = new THREE.Mesh(trackGeom(new THREE.PlaneGeometry(2.2, 1.3)), screenMat);
    screen.position.set(0, 0.6, -0.32);
    screen.rotation.x = -0.15;
    quizGroup.add(screen);


    // =========================================================================
    // 3. THE QUEST CLIPBOARD (Actions Sub-Deck) - Placed at (10, -2, -10)
    // =========================================================================
    const actionsGroup = new THREE.Group();
    actionsGroup.position.set(10, -2, -10);
    scene.add(actionsGroup);

    const stand = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(0.12, 0.18, 1.8, 12)), metalMat);
    stand.position.y = -0.5;
    actionsGroup.add(stand);

    const board = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(2.8, 2.0, 0.08)), trackMat(new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1
    })));
    board.position.y = 0.5;
    board.rotation.x = -0.1;
    actionsGroup.add(board);

    const indicatorGeom = trackGeom(new THREE.BoxGeometry(0.2, 0.2, 0.1));
    const indicatorMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x00FF87 }));
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const ind = new THREE.Mesh(indicatorGeom, col % 2 === 0 ? indicatorMat : trackMat(new THREE.MeshBasicMaterial({ color: 0x475569 })));
        ind.position.set(-0.9 + col * 0.6, 0.8 - row * 0.4, 0.06);
        actionsGroup.add(ind);
      }
    }


    // =========================================================================
    // 4. THE COACH HOLOGRAM PROJECTOR (AI Coach Sub-Deck) - Placed at (-15, 0, 15)
    // =========================================================================
    const coachGroup = new THREE.Group();
    coachGroup.position.set(-15, 0, 15);
    scene.add(coachGroup);

    const emitter = new THREE.Mesh(trackGeom(new THREE.CylinderGeometry(1.2, 1.4, 0.3, 24)), metalMat);
    emitter.position.y = -0.15;
    coachGroup.add(emitter);

    const beamGeom = trackGeom(new THREE.ConeGeometry(1.0, 3.2, 24, 1, true));
    const beamMat = trackMat(new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    }));
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.position.y = 1.45;
    coachGroup.add(beam);

    const beamParticles = [];
    const bpGeom = trackGeom(new THREE.SphereGeometry(0.03, 4, 4));
    const bpMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.6 }));
    for (let i = 0; i < 15; i++) {
      const bp = new THREE.Mesh(bpGeom, bpMat);
      bp.position.set((Math.random() - 0.5) * 0.8, Math.random() * 2.8, (Math.random() - 0.5) * 0.8);
      coachGroup.add(bp);
      beamParticles.push(bp);
    }


    // =========================================================================
    // 5. THE POLICY FORESIGHT GRID (Sandbox Sub-Deck) - Placed at (15, 3, 10)
    // =========================================================================
    const sandboxGroup = new THREE.Group();
    sandboxGroup.position.set(15, 3, 10);
    scene.add(sandboxGroup);

    const cabinet = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(1.5, 3.5, 1.5)), trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 })));
    cabinet.position.set(0, 0, 0);
    sandboxGroup.add(cabinet);

    const ledGeom = trackGeom(new THREE.BoxGeometry(0.12, 0.08, 0.08));
    const ledOnMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x00FF87 }));
    const ledOffMat = trackMat(new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    for (let yPos = 1.4; yPos > -1.5; yPos -= 0.18) {
      for (let xPos = -0.5; xPos < 0.6; xPos += 0.2) {
        const led = new THREE.Mesh(ledGeom, Math.random() > 0.4 ? ledOnMat : ledOffMat);
        led.position.set(xPos, yPos, 0.76);
        sandboxGroup.add(led);
      }
    }


    // =========================================================================
    // 6. THE DAC EXTRACTION SYSTEM (DAC Oasis Sub-Deck) - Placed at (0, -10, -5)
    // =========================================================================
    const dacGroup = new THREE.Group();
    dacGroup.position.set(0, -10, -5);
    scene.add(dacGroup);

    const dacWall = new THREE.Mesh(trackGeom(new THREE.BoxGeometry(6.5, 2.8, 0.5)), metalMat);
    dacGroup.add(dacWall);

    const dacVentGeom = trackGeom(new THREE.CylinderGeometry(0.9, 0.9, 0.16, 24));
    const dacVentMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 }));

    const dacFans = [];
    const dacPositions = [-2.0, 0.0, 2.0];

    dacPositions.forEach(posX => {
      const vent = new THREE.Mesh(dacVentGeom, dacVentMat);
      vent.rotation.x = Math.PI / 2;
      vent.position.set(posX, 0, 0.2);
      dacGroup.add(vent);

      const fanGroup = new THREE.Group();
      fanGroup.position.set(posX, 0, 0.28);
      dacGroup.add(fanGroup);

      const dacHub = new THREE.Mesh(trackGeom(new THREE.SphereGeometry(0.18, 16, 16)), trackMat(new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 })));
      fanGroup.add(dacHub);

      const dacBladeGeom = trackGeom(new THREE.BoxGeometry(0.08, 0.75, 0.02));
      const dacBladeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 }));
      for (let i = 0; i < 3; i++) {
        const pivot = new THREE.Group();
        pivot.rotation.z = (i * 120) * Math.PI / 180;
        
        const blade = new THREE.Mesh(dacBladeGeom, dacBladeMat);
        blade.position.y = 0.36;
        blade.rotation.y = 0.45;
        
        pivot.add(blade);
        fanGroup.add(pivot);
      }
      dacFans.push(fanGroup);
    });

    const dacParticles = [];
    const dpGeom = trackGeom(new THREE.SphereGeometry(0.05, 8, 8));
    const dpMat = trackMat(new THREE.MeshBasicMaterial({
      color: 0x00FF87,
      transparent: true,
      opacity: 0.7
    }));
    for (let i = 0; i < 30; i++) {
      const pMesh = new THREE.Mesh(dpGeom, dpMat);
      pMesh.position.set(
        (Math.random() - 0.5) * 6.5,
        (Math.random() - 0.5) * 2.5,
        1.0 + Math.random() * 4.0
      );
      dacGroup.add(pMesh);
      dacParticles.push(pMesh);
    }


    // =========================================================================
    // 7. CAMERA INTERPOLATION TARGETS
    // =========================================================================
    const cameraTargets = {
      dashboard: {
        pos: new THREE.Vector3(0, 2.3, 5.8),
        look: new THREE.Vector3(0, 0.1, 0)
      },
      quiz: {
        pos: new THREE.Vector3(-10, 2.5, -7.5),
        look: new THREE.Vector3(-10, 2.0, -10.0)
      },
      actions: {
        pos: new THREE.Vector3(10, -1.5, -7.5),
        look: new THREE.Vector3(10, -2.0, -10.0)
      },
      ai: {
        pos: new THREE.Vector3(-15, 2.0, 19.5),
        look: new THREE.Vector3(-15, 1.2, 15.0)
      },
      sandbox: {
        pos: new THREE.Vector3(15, 4.0, 14.5),
        look: new THREE.Vector3(15, 3.0, 10.0)
      },
      sink: {
        pos: new THREE.Vector3(0, -10.0, 4.8),
        look: new THREE.Vector3(0, -10.0, -5.0)
      }
    };


    // =========================================================================
    // 8. INTERACTION EVENTS (Mouse planet dragging & Courier walk)
    // =========================================================================
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let walkingDirection = 0;
    let isWalking = false;
    let walkAnimTime = 0;

    const refreshQuests = () => {
      const activeState = stateRef.current;
      const uncompleted = actionsDatabase.filter(act => !activeState.completedActions.includes(act.id));
      Object.keys(quests).forEach(k => {
        quests[k].visible = false;
      });
      uncompleted.forEach(act => {
        if (quests[act.landmark]) {
          quests[act.landmark].visible = true;
        }
      });
    };
    refreshQuests();

    const spawnParticles = (pos) => {
      const particleCount = 12;
      const geom = trackGeom(new THREE.SphereGeometry(0.04, 4, 4));
      const mat = trackMat(new THREE.MeshBasicMaterial({ color: 0x00FF87 }));
      const list = [];

      for (let i = 0; i < particleCount; i++) {
        const p = new THREE.Mesh(geom, mat);
        p.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          0.3 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.3
        ));
        planetGroup.add(p);
        list.push({
          mesh: p,
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, 0.03 + Math.random() * 0.05, (Math.random() - 0.5) * 0.05),
          life: 1.0
        });
      }

      const runParticles = () => {
        let active = false;
        list.forEach(p => {
          if (p.life > 0) {
            p.mesh.position.add(p.vel);
            p.life -= 0.05;
            p.mesh.scale.set(p.life, p.life, p.life);
            active = true;
          } else if (p.mesh.parent) {
            p.mesh.parent.remove(p.mesh);
          }
        });
        if (active) requestAnimationFrame(runParticles);
      };
      runParticles();
    };

    const checkProximityToQuests = () => {
      const courierPos = new THREE.Vector3(0, 2.2, 0);
      let closestId = null;
      let closestDist = 999;

      Object.keys(landmarks).forEach(id => {
        const lmk = landmarks[id];
        const worldPos = lmk.group.position.clone().applyMatrix4(planetGroup.matrixWorld);
        const dist = worldPos.distanceTo(courierPos);

        if (dist < 0.95 && quests[id].visible) {
          if (dist < closestDist) {
            closestDist = dist;
            closestId = id;
          }
        }
      });

      // Dispatch event to overlay prompt inside CourierPlanet
      const event = new CustomEvent('courierProximity', { detail: { nearQuest: closestId !== null } });
      window.dispatchEvent(event);

      return closestId;
    };

    const attemptQuestDelivery = () => {
      const activeLandmark = checkProximityToQuests();
      if (activeLandmark) {
        const currentConfig = stateRef.current;
        const activeActions = actionsDatabase.filter(a => a.landmark === activeLandmark && !currentConfig.completedActions.includes(a.id));
        if (activeActions.length > 0) {
          const actionToLog = activeActions[0];
          spawnParticles(landmarks[activeLandmark].group.position);
          toggleAction(actionToLog.id, true);
          setTimeout(() => refreshQuests(), 100);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (stateRef.current.activeTab !== 'dashboard') return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        walkingDirection = -1;
        isWalking = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        walkingDirection = 1;
        isWalking = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        attemptQuestDelivery();
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        walkingDirection = 0;
        isWalking = false;
        drawCourierFrame(0, 1);
      }
    };

    const handleMouseDown = (e) => {
      if (stateRef.current.activeTab !== 'dashboard') return;
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging || stateRef.current.activeTab !== 'dashboard') return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;
      
      planetGroup.rotation.y += deltaX * 0.007;
      planetGroup.rotation.x += deltaY * 0.007;
      
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e) => {
      if (stateRef.current.activeTab !== 'dashboard' || e.touches.length !== 1) return;
      isDragging = true;
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchMove = (e) => {
      if (!isDragging || stateRef.current.activeTab !== 'dashboard' || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;
      
      planetGroup.rotation.y += deltaX * 0.01;
      planetGroup.rotation.x += deltaY * 0.01;
      
      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);


    // =========================================================================
    // 9. ANIMATION LOOP
    // =========================================================================
    let animationId;
    let clock = new THREE.Clock();

    const animateLoop = () => {
      animationId = requestAnimationFrame(animateLoop);

      const time = performance.now() * 0.003;
      const currentConfig = stateRef.current;

      // Ensure quest markers are updated if actions state changes
      refreshQuests();

      // Color Updates based on currentCarbon budget health
      const healthy = currentConfig.currentCarbon <= currentConfig.dailyBudget;
      oceanMat.color.setHex(healthy ? 0x0c4a6e : 0x3b3534);
      landMat.color.setHex(healthy ? 0x059669 : 0x78716c);
      leavesMat.color.setHex(healthy ? 0x10b981 : 0xb45309);
      portalMesh1.material.color.setHex(healthy ? 0x00FF87 : 0xff3e3e);
      portalMesh2.material.color.setHex(healthy ? 0x06b6d4 : 0xef4444);

      // 1. Camera Flight Lerp
      const target = cameraTargets[currentConfig.activeTab] || cameraTargets.dashboard;
      camera.position.lerp(target.pos, 0.04);
      currentLookAt.lerp(target.look, 0.04);
      camera.lookAt(currentLookAt);

      // 2. Planet auto-rotation & walking Courier Z-axis rotation
      if (currentConfig.activeTab === 'dashboard') {
        if (isWalking) {
          const rotSpeed = 0.015;
          planetGroup.rotateZ(walkingDirection * rotSpeed);
          walkAnimTime += 0.45;
          drawCourierFrame(walkAnimTime, walkingDirection);
        } else if (!isDragging) {
          planetGroup.rotation.y += 0.002;
        }
        courierSprite.visible = true;
        checkProximityToQuests();
      } else {
        planetGroup.rotation.y += 0.0005;
        courierSprite.visible = false;
      }

      // 3. Portal Ring pulsations
      if (portalMesh1 && portalMesh2) {
        portalMesh1.rotation.z = time * 0.3;
        portalMesh2.rotation.z = -time * 0.5;
        const pulse = 1.0 + Math.sin(time * 3) * 0.04;
        portalMesh1.scale.set(pulse, pulse, pulse);
        portalMesh2.scale.set(pulse * 0.98, pulse * 0.98, pulse * 0.98);
      }

      // 4. Wind Turbines spin
      if (turbines) {
        const speed = healthy ? 0.06 : 0.005;
        turbines.forEach(rotor => {
          rotor.rotation.z += speed;
        });
      }

      // 5. Quest cone bobbing
      Object.keys(quests).forEach(id => {
        const cone = quests[id];
        if (cone.visible) {
          cone.position.y = 0.9 + Math.sin(time * 3.5) * 0.08;
          cone.rotation.y += 0.02;
        }
      });

      // 6. Hologram Projector cone and particle animation
      if (currentConfig.activeTab === 'ai') {
        beam.rotation.y += 0.002;
        beamParticles.forEach((bp, index) => {
          bp.position.y += 0.01;
          bp.position.x += Math.sin(time + index) * 0.002;
          bp.position.z += Math.cos(time + index) * 0.002;
          
          if (bp.position.y > 2.8) {
            bp.position.y = 0.1;
            bp.position.x = (Math.random() - 0.5) * 0.6;
            bp.position.z = (Math.random() - 0.5) * 0.6;
          }
        });
      }

      // 7. DAC Fans & Suction Particles
      if (currentConfig.activeTab === 'sink') {
        const rotationDelta = (currentConfig.fanSpeed * Math.PI * 2) / (60 * 60);
        dacFans.forEach(fan => {
          fan.rotation.z += rotationDelta;
        });

        const pSpeed = (currentConfig.fanSpeed / 120) * 0.035;
        dacParticles.forEach(p => {
          p.position.z -= pSpeed;
          let nearestX = 0;
          let minDist = 999;
          dacPositions.forEach(vx => {
            const d = Math.abs(p.position.x - vx);
            if (d < minDist) {
              minDist = d;
              nearestX = vx;
            }
          });
          p.position.x += (nearestX - p.position.x) * 0.02;
          p.position.y += (0 - p.position.y) * 0.02;

          if (p.position.z <= 0.28) {
            p.position.x = (Math.random() - 0.5) * 6.5;
            p.position.y = (Math.random() - 0.5) * 2.5;
            p.position.z = 3.5 + Math.random() * 2.5;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animateLoop();

    // Window Resize Handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('touchstart', handleTouchStart);
      renderer.domElement.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      className="master-threejs-bg" 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: -1, 
        pointerEvents: 'auto',
        background: '#06090f'
      }} 
    />
  );
}
