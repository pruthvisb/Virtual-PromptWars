import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { actionsDatabase, carbonCoefficients } from '../AppStateContext';

export default function CourierPlanet({ currentCarbon, completedActions, dailyBudget, onQuestDeliver }) {
  const containerRef = useRef(null);
  const planetInstanceRef = useRef(null);
  const [questPrompt, setQuestPrompt] = useState(false);

  // Keep references to state values up to date so the Three.js loop can access them
  const stateRef = useRef({ currentCarbon, completedActions, dailyBudget, onQuestDeliver });
  useEffect(() => {
    stateRef.current = { currentCarbon, completedActions, dailyBudget, onQuestDeliver };
    if (planetInstanceRef.current) {
      planetInstanceRef.current.updateState(currentCarbon, completedActions);
    }
  }, [currentCarbon, completedActions, dailyBudget, onQuestDeliver]);

  useEffect(() => {
    if (!containerRef.current) return;

    class CarbonCourierPlanet {
      constructor(container, setPromptCallback) {
        this.container = container;
        this.setPromptCallback = setPromptCallback;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planetGroup = null;
        this.courierSprite = null;
        this.landmarks = {};
        this.quests = {};
        this.materials = {};
        this.disposed = false;
        
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.walkingDirection = 0; // -1 = left, 1 = right, 0 = idle
        this.isWalking = false;
        this.walkAnimTime = 0;

        // References to objects for cleanup
        this.geometries = [];
        this.materialsList = [];
        this.listeners = [];

        this.init();
      }

      init() {
        const width = this.container.clientWidth || 300;
        const height = this.container.clientHeight || 260;

        // Scene & Camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 4.5, 9.5);
        this.camera.lookAt(0, 0.4, 0);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(5, 8, 4);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Materials & Planet Setup
        this.initMaterials();
        this.planetGroup = new THREE.Group();
        this.scene.add(this.planetGroup);

        // Glowing space portal ring behind the planet
        this.portalGroup = new THREE.Group();
        this.portalGroup.position.set(0, 0, -1.5); 
        this.scene.add(this.portalGroup);

        const ringGeom1 = new THREE.TorusGeometry(4.4, 0.08, 12, 64);
        const ringGeom2 = new THREE.TorusGeometry(4.1, 0.04, 8, 48);
        this.trackGeometry(ringGeom1);
        this.trackGeometry(ringGeom2);

        const healthy = stateRef.current.currentCarbon <= stateRef.current.dailyBudget;
        this.materials.portal1 = this.trackMaterial(new THREE.MeshBasicMaterial({
          color: healthy ? 0x00FF87 : 0xff3e3e,
          wireframe: true,
          transparent: true,
          opacity: 0.65
        }));
        this.materials.portal2 = this.trackMaterial(new THREE.MeshBasicMaterial({
          color: healthy ? 0x06b6d4 : 0xef4444,
          wireframe: true,
          transparent: true,
          opacity: 0.4
        }));

        this.portalMesh1 = new THREE.Mesh(ringGeom1, this.materials.portal1);
        this.portalMesh2 = new THREE.Mesh(ringGeom2, this.materials.portal2);
        this.portalGroup.add(this.portalMesh1);
        this.portalGroup.add(this.portalMesh2);

        // Ocean Core Sphere
        const oceanGeom = new THREE.SphereGeometry(3.5, 32, 32);
        this.trackGeometry(oceanGeom);
        this.oceanMesh = new THREE.Mesh(oceanGeom, this.materials.ocean);
        this.oceanMesh.receiveShadow = true;
        this.planetGroup.add(this.oceanMesh);

        // Land continents & Assets
        this.createLandPatches();
        this.createLandmarks();
        this.createEnvironmentAssets();
        this.createCourierSprite();
        
        this.initInteractionEvents();
        this.refreshQuests();
        this.animate();
      }

      trackGeometry(geom) {
        this.geometries.push(geom);
      }

      trackMaterial(mat) {
        this.materialsList.push(mat);
        return mat;
      }

      initMaterials() {
        const healthy = stateRef.current.currentCarbon <= stateRef.current.dailyBudget;
        
        this.materials.ocean = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: healthy ? 0x0c4a6e : 0x3b3534,
          roughness: 0.2,
          metalness: 0.1,
          flatShading: true
        }));

        this.materials.land = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: healthy ? 0x059669 : 0x78716c,
          roughness: 0.8,
          metalness: 0.0,
          flatShading: true
        }));

        this.materials.trunk = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: 0x78350f,
          roughness: 0.9,
          flatShading: true
        }));

        this.materials.leaves = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: healthy ? 0x10b981 : 0xb45309,
          roughness: 0.9,
          flatShading: true
        }));

        this.materials.landmarkBase = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: 0xe5e7eb,
          roughness: 0.7,
          flatShading: true
        }));

        this.materials.metal = this.trackMaterial(new THREE.MeshStandardMaterial({
          color: 0xd1d5db,
          roughness: 0.3,
          metalness: 0.8,
          flatShading: true
        }));
      }

      createLandPatches() {
        this.landGroup = new THREE.Group();
        this.planetGroup.add(this.landGroup);

        const patches = [
          { lat: 0, lon: 0, r: 1.8 },
          { lat: 0.4, lon: 0.8, r: 1.5 },
          { lat: -0.5, lon: -0.6, r: 1.6 },
          { lat: 0.8, lon: -1.2, r: 1.2 },
          { lat: -0.8, lon: 0.9, r: 1.4 },
          { lat: 0.3, lon: -2.0, r: 1.6 },
          { lat: -0.2, lon: 2.2, r: 1.5 },
          { lat: 0.9, lon: 1.8, r: 1.0 },
          { lat: -0.9, lon: -2.3, r: 1.1 },
          { lat: 0.1, lon: -0.9, r: 1.7 }
        ];

        patches.forEach(p => {
          const capGeom = new THREE.SphereGeometry(3.52, 16, 16, 0, p.r * 0.4, 0, p.r * 0.4);
          this.trackGeometry(capGeom);
          const capMesh = new THREE.Mesh(capGeom, this.materials.land);
          
          const dummy = new THREE.Object3D();
          dummy.rotateY(p.lon);
          dummy.rotateX(p.lat);
          
          capMesh.rotation.copy(dummy.rotation);
          capMesh.position.set(0, 0, 0);
          capMesh.castShadow = true;
          capMesh.receiveShadow = true;
          this.landGroup.add(capMesh);
        });
      }

      createLandmarks() {
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

          const baseGeom = new THREE.BoxGeometry(0.8, 0.4, 0.8);
          this.trackGeometry(baseGeom);
          const baseMesh = new THREE.Mesh(baseGeom, this.materials.landmarkBase);
          baseMesh.castShadow = true;
          baseMesh.receiveShadow = true;
          group.add(baseMesh);

          if (conf.id === 'townhouse') {
            const roofGeom = new THREE.ConeGeometry(0.6, 0.5, 4);
            roofGeom.rotateY(Math.PI/4);
            this.trackGeometry(roofGeom);
            const roofMesh = new THREE.Mesh(roofGeom, this.trackMaterial(new THREE.MeshStandardMaterial({ color: conf.color, flatShading:true })));
            roofMesh.position.y = 0.45;
            roofMesh.castShadow = true;
            group.add(roofMesh);
          } else if (conf.id === 'cafe') {
            const awningGeom = new THREE.BoxGeometry(0.9, 0.1, 0.9);
            this.trackGeometry(awningGeom);
            const awningMesh = new THREE.Mesh(awningGeom, this.trackMaterial(new THREE.MeshStandardMaterial({ color: 0xef4444, flatShading:true })));
            awningMesh.position.y = 0.25;
            group.add(awningMesh);
          } else if (conf.id === 'datacenter') {
            const serverGeom = new THREE.BoxGeometry(0.5, 0.8, 0.5);
            this.trackGeometry(serverGeom);
            const serverMesh = new THREE.Mesh(serverGeom, this.trackMaterial(new THREE.MeshStandardMaterial({ color: 0x475569, metalness:0.8, roughness:0.2 })));
            serverMesh.position.y = 0.4;
            group.add(serverMesh);
          } else if (conf.id === 'bank') {
            const columnGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
            const roofGeom = new THREE.BoxGeometry(0.9, 0.15, 0.9);
            this.trackGeometry(columnGeom);
            this.trackGeometry(roofGeom);
            const roofMesh = new THREE.Mesh(roofGeom, this.materials.landmarkBase);
            roofMesh.position.y = 0.45;
            group.add(roofMesh);

            for (let i = -0.3; i <= 0.3; i += 0.3) {
              const col = new THREE.Mesh(columnGeom, this.materials.landmarkBase);
              col.position.set(i, 0.2, 0.2);
              group.add(col);
              const colBack = col.clone();
              colBack.position.z = -0.2;
              group.add(colBack);
            }
          } else {
            const topGeom = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 6);
            this.trackGeometry(topGeom);
            const topMesh = new THREE.Mesh(topGeom, this.trackMaterial(new THREE.MeshStandardMaterial({ color: conf.color, flatShading:true })));
            topMesh.position.y = 0.4;
            group.add(topMesh);
          }

          // Quest Arrow (Mail icon)
          const arrowGeom = new THREE.ConeGeometry(0.18, 0.35, 4);
          arrowGeom.rotateX(Math.PI);
          this.trackGeometry(arrowGeom);
          const arrowMat = this.trackMaterial(new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
          const arrowMesh = new THREE.Mesh(arrowGeom, arrowMat);
          arrowMesh.position.y = 1.3;
          group.add(arrowMesh);
          arrowMesh.visible = false;
          
          this.quests[conf.id] = arrowMesh;

          // Spherical placement on planet surface
          const r = 3.5;
          const phi = (90 - conf.lat * 45) * Math.PI / 180;
          const theta = (conf.lon * 45) * Math.PI / 180;

          const x = r * Math.sin(phi) * Math.sin(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.cos(theta);

          group.position.set(x, y, z);

          const upVec = new THREE.Vector3(x, y, z).normalize();
          const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
          group.quaternion.copy(alignRotation);

          this.planetGroup.add(group);
          this.landmarks[conf.id] = { group, config: conf, upVector: upVec };
        });
      }

      createEnvironmentAssets() {
        this.environmentGroup = new THREE.Group();
        this.planetGroup.add(this.environmentGroup);

        const treeCoords = [
          { lat: 0.1, lon: 1.1 }, { lat: -0.2, lon: 0.3 }, { lat: 0.5, lon: -0.2 },
          { lat: -0.6, lon: -1.0 }, { lat: 0.3, lon: -1.5 }, { lat: -0.1, lon: -2.0 },
          { lat: 0.7, lon: 2.1 }, { lat: -0.5, lon: 1.5 }, { lat: 0.8, lon: 0.5 },
          { lat: -0.3, lon: -0.7 }, { lat: 0.4, lon: -2.4 }, { lat: -0.8, lon: 0.2 },
          { lat: 0.9, lon: -1.8 }, { lat: -0.9, lon: -1.4 }, { lat: 0.2, lon: 2.8 }
        ];

        treeCoords.forEach(coord => {
          const tree = new THREE.Group();

          const trunkGeom = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 5);
          this.trackGeometry(trunkGeom);
          const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
          trunk.position.y = 0.15;
          tree.add(trunk);

          const leavesGeom = new THREE.ConeGeometry(0.2, 0.5, 5);
          this.trackGeometry(leavesGeom);
          const leaves = new THREE.Mesh(leavesGeom, this.materials.leaves);
          leaves.position.y = 0.5;
          leaves.castShadow = true;
          tree.add(leaves);

          const r = 3.52;
          const phi = (90 - coord.lat * 45) * Math.PI / 180;
          const theta = (coord.lon * 45) * Math.PI / 180;

          const x = r * Math.sin(phi) * Math.sin(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.cos(theta);

          tree.position.set(x, y, z);
          const upVec = new THREE.Vector3(x, y, z).normalize();
          const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
          tree.quaternion.copy(alignRotation);

          this.environmentGroup.add(tree);
        });

        // 2 Wind Turbines
        this.turbines = [];
        const turbineCoords = [
          { lat: 0.6, lon: -1.0 },
          { lat: -0.5, lon: 2.2 }
        ];

        turbineCoords.forEach(coord => {
          const turbine = new THREE.Group();

          const poleGeom = new THREE.CylinderGeometry(0.04, 0.07, 1.2, 6);
          this.trackGeometry(poleGeom);
          const pole = new THREE.Mesh(poleGeom, this.materials.metal);
          pole.position.y = 0.6;
          pole.castShadow = true;
          turbine.add(pole);

          const rotor = new THREE.Group();
          rotor.position.y = 1.2;
          
          const bladeGeom = new THREE.BoxGeometry(0.04, 0.5, 0.02);
          this.trackGeometry(bladeGeom);
          for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(bladeGeom, this.materials.landmarkBase);
            blade.position.y = 0.25;
            const pivot = new THREE.Group();
            pivot.rotation.z = (i * 120) * Math.PI / 180;
            pivot.add(blade);
            rotor.add(pivot);
          }
          
          turbine.add(rotor);
          this.turbines.push(rotor);

          const r = 3.52;
          const phi = (90 - coord.lat * 45) * Math.PI / 180;
          const theta = (coord.lon * 45) * Math.PI / 180;

          const x = r * Math.sin(phi) * Math.sin(theta);
          const y = r * Math.cos(phi);
          const z = r * Math.sin(phi) * Math.cos(theta);

          turbine.position.set(x, y, z);
          const upVec = new THREE.Vector3(x, y, z).normalize();
          const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
          turbine.quaternion.copy(alignRotation);

          this.environmentGroup.add(turbine);
        });
      }

      createCourierSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        this.courierCanvas = canvas;
        this.courierCtx = canvas.getContext('2d');

        this.courierTexture = new THREE.CanvasTexture(canvas);
        const spriteMat = this.trackMaterial(new THREE.SpriteMaterial({ map: this.courierTexture }));
        
        this.courierSprite = new THREE.Sprite(spriteMat);
        this.courierSprite.scale.set(0.9, 0.9, 1.0);
        this.courierSprite.position.set(0, 3.82, 0); 
        this.scene.add(this.courierSprite);

        this.drawCourierFrame(0);
      }

      drawCourierFrame(walkFrame) {
        const ctx = this.courierCtx;
        ctx.clearRect(0, 0, 128, 128);

        const legOffset = Math.sin(walkFrame * 0.5) * 6;
        const bodyBob = Math.abs(Math.sin(walkFrame * 0.5)) * 3;

        ctx.save();
        if (this.walkingDirection < 0) {
          ctx.translate(128, 0);
          ctx.scale(-1, 1);
        }

        // Legs (Brown Boots)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(52, 86 + legOffset, 8, 14);
        ctx.fillRect(68, 86 - legOffset, 8, 14);

        // Body / Jacket (Warm Violet)
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(46, 52 - bodyBob, 36, 36, 8);
        } else {
          ctx.rect(46, 52 - bodyBob, 36, 36);
        }
        ctx.fill();

        // Messenger Bag (Amber / Yellow)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(42, 64 - bodyBob, 12, 16);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(76, 52 - bodyBob);
        ctx.lineTo(46, 72 - bodyBob);
        ctx.stroke();

        // Head / Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(64, 40 - bodyBob, 14, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(66, 36 - bodyBob, 3, 4);

        // Cap (Emerald Green)
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(64, 30 - bodyBob, 15, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(64, 28 - bodyBob, 12, 4);

        ctx.restore();
        this.courierTexture.needsUpdate = true;
      }

      initInteractionEvents() {
        const handleKeyDown = (e) => {
          const activeElement = document.activeElement;
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
          }

          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.walkingDirection = -1;
            this.isWalking = true;
          } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.walkingDirection = 1;
            this.isWalking = true;
          } else if (e.key === ' ') {
            e.preventDefault();
            this.attemptDelivery();
          }
        };

        const handleKeyUp = (e) => {
          if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.walkingDirection = 0;
            this.isWalking = false;
            this.drawCourierFrame(0);
          }
        };

        const handleMouseDown = (e) => {
          this.isDragging = true;
          this.previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
          if (!this.isDragging) return;
          const deltaX = e.clientX - this.previousMousePosition.x;
          const deltaY = e.clientY - this.previousMousePosition.y;
          
          this.planetGroup.rotation.y += deltaX * 0.007;
          this.planetGroup.rotation.x += deltaY * 0.007;
          
          this.previousMousePosition = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
          this.isDragging = false;
        };

        const handleTouchStart = (e) => {
          if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        };

        const handleTouchMove = (e) => {
          if (!this.isDragging || e.touches.length !== 1) return;
          const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
          const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
          
          this.planetGroup.rotation.y += deltaX * 0.01;
          this.planetGroup.rotation.x += deltaY * 0.01;
          
          this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const handleTouchEnd = () => {
          this.isDragging = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        this.renderer.domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        
        this.renderer.domElement.addEventListener('touchstart', handleTouchStart);
        this.renderer.domElement.addEventListener('touchmove', handleTouchMove);
        this.renderer.domElement.addEventListener('touchend', handleTouchEnd);

        this.listeners.push({ target: window, name: 'keydown', fn: handleKeyDown });
        this.listeners.push({ target: window, name: 'keyup', fn: handleKeyUp });
        this.listeners.push({ target: this.renderer.domElement, name: 'mousedown', fn: handleMouseDown });
        this.listeners.push({ target: window, name: 'mousemove', fn: handleMouseMove });
        this.listeners.push({ target: window, name: 'mouseup', fn: handleMouseUp });
        this.listeners.push({ target: this.renderer.domElement, name: 'touchstart', fn: handleTouchStart });
        this.listeners.push({ target: this.renderer.domElement, name: 'touchmove', fn: handleTouchMove });
        this.listeners.push({ target: this.renderer.domElement, name: 'touchend', fn: handleTouchEnd });
      }

      onWindowResize() {
        if (!this.container || this.disposed) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }

      refreshQuests() {
        const availableActions = actionsDatabase.filter(act => !stateRef.current.completedActions.includes(act.id));
        
        Object.keys(this.quests).forEach(k => {
          this.quests[k].visible = false;
        });

        availableActions.forEach(act => {
          if (this.quests[act.landmark]) {
            this.quests[act.landmark].visible = true;
          }
        });
      }

      updateState(currentCarbon, completedActions) {
        this.refreshQuests();
        const healthy = currentCarbon <= stateRef.current.dailyBudget;
        this.materials.ocean.color.setHex(healthy ? 0x0c4a6e : 0x3b3534);
        this.materials.land.color.setHex(healthy ? 0x059669 : 0x78716c);
        this.materials.leaves.color.setHex(healthy ? 0x10b981 : 0xb45309);
        
        if (this.materials.portal1) {
          this.materials.portal1.color.setHex(healthy ? 0x00ff87 : 0xff3e3e);
        }
        if (this.materials.portal2) {
          this.materials.portal2.color.setHex(healthy ? 0x06b6d4 : 0xef4444);
        }
      }

      triggerQuest(actionId) {
        const actionObj = actionsDatabase.find(a => a.id === actionId);
        if (actionObj && this.quests[actionObj.landmark]) {
          this.quests[actionObj.landmark].visible = true;
          
          const lmk = this.landmarks[actionObj.landmark];
          if (lmk) {
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(lmk.upVector, new THREE.Vector3(0, 1, 0));
            this.planetGroup.quaternion.copy(targetQuaternion);
          }
        }
      }

      attemptDelivery() {
        const activeLandmark = this.checkProximityToQuests();
        if (activeLandmark) {
          const activeActions = actionsDatabase.filter(a => a.landmark === activeLandmark && !stateRef.current.completedActions.includes(a.id));
          if (activeActions.length > 0) {
            const actionToLog = activeActions[0];
            this.spawnDeliveryParticles(this.landmarks[activeLandmark].group.position);
            stateRef.current.onQuestDeliver(actionToLog.id);
            setTimeout(() => this.refreshQuests(), 100);
          }
        }
      }

      checkProximityToQuests() {
        if (this.disposed) return null;
        const courierPos = new THREE.Vector3(0, 3.5, 0);
        let closestLandmarkId = null;
        let closestDistance = 999.0;

        Object.keys(this.landmarks).forEach(id => {
          const lmk = this.landmarks[id];
          const worldPos = lmk.group.position.clone().applyMatrix4(this.planetGroup.matrixWorld);
          const dist = worldPos.distanceTo(courierPos);

          if (dist < 1.15 && this.quests[id].visible) {
            if (dist < closestDistance) {
              closestDistance = dist;
              closestLandmarkId = id;
            }
          }
        });

        const showPrompt = closestLandmarkId !== null;
        this.setPromptCallback(showPrompt);
        return closestLandmarkId;
      }

      spawnDeliveryParticles(position) {
        const particleCount = 15;
        const geom = new THREE.SphereGeometry(0.06, 4, 4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
        
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
          const p = new THREE.Mesh(geom, mat);
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            0.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 0.4
          );
          p.position.copy(position).add(offset);
          
          this.planetGroup.add(p);
          particles.push({
            mesh: p,
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.08, 0.05 + Math.random() * 0.08, (Math.random() - 0.5) * 0.08),
            life: 1.0
          });
        }

        const animateParticles = () => {
          if (this.disposed) {
            geom.dispose();
            mat.dispose();
            return;
          }
          let active = false;
          particles.forEach(p => {
            if (p.life > 0) {
              p.mesh.position.add(p.velocity);
              p.life -= 0.05;
              p.mesh.scale.set(p.life, p.life, p.life);
              active = true;
            } else if (p.mesh.parent) {
              p.mesh.parent.remove(p.mesh);
            }
          });
          if (active) requestAnimationFrame(animateParticles);
          else {
            geom.dispose();
            mat.dispose();
          }
        };
        animateParticles();
      }

      animate() {
        if (this.disposed) return;
        requestAnimationFrame(() => this.animate());

        if (this.isWalking && !this.isDragging) {
          const rotationSpeed = 0.015;
          this.planetGroup.rotateZ(this.walkingDirection * rotationSpeed);
          this.walkAnimTime += 0.45;
          this.drawCourierFrame(this.walkAnimTime);
        }

        const time = performance.now() * 0.003;
        
        // Animate the portal rings
        if (this.portalMesh1 && this.portalMesh2) {
          this.portalMesh1.rotation.z = time * 0.5;
          this.portalMesh2.rotation.z = -time * 0.8;
          
          // Pulse scale
          const pulse = 1.0 + Math.sin(time * 3) * 0.04;
          this.portalMesh1.scale.set(pulse, pulse, pulse);
          this.portalMesh2.scale.set(pulse * 0.98, pulse * 0.98, pulse * 0.98);
        }

        Object.keys(this.quests).forEach(id => {
          const arrow = this.quests[id];
          if (arrow.visible) {
            arrow.position.y = 1.25 + Math.sin(time * 2.5) * 0.12;
            arrow.rotation.y += 0.02;
          }
        });

        if (this.turbines) {
          const speed = stateRef.current.currentCarbon <= stateRef.current.dailyBudget ? 0.08 : 0.005;
          this.turbines.forEach(rotor => {
            rotor.rotation.z += speed;
          });
        }

        this.checkProximityToQuests();
        this.renderer.render(this.scene, this.camera);
      }

      dispose() {
        this.disposed = true;
        
        // Remove event listeners
        this.listeners.forEach(l => {
          l.target.removeEventListener(l.name, l.fn);
        });

        // Dispose geometries
        this.geometries.forEach(g => g.dispose());
        
        // Dispose materials
        this.materialsList.forEach(m => m.dispose());
        
        // Remove canvas from DOM
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
          this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        if (this.renderer) {
          this.renderer.dispose();
        }
      }
    }

    const planetGame = new CarbonCourierPlanet(containerRef.current, setQuestPrompt);
    planetInstanceRef.current = planetGame;

    const handleResize = () => {
      planetGame.onWindowResize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      planetGame.dispose();
    };
  }, []);

  return (
    <div 
      className="carbon-twin-container" 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: '260px', borderRadius: '16px', overflow: 'hidden', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-glass)' }}
    >
      {questPrompt && (
        <div 
          id="quest-prompt-overlay" 
          style={{ 
            position: 'absolute', 
            bottom: '12px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: 'rgba(16, 185, 129, 0.95)', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 'bold', 
            color: '#fff', 
            zIndex: 10, 
            animation: 'bounce 1s infinite alternate', 
            pointerEvents: 'none', 
            textShadow: '0 1px 3px rgba(0,0,0,0.3)', 
            boxShadow: '0 4px 12px rgba(16,185,129,0.35)' 
          }}
        >
          Press SPACE or Click Landmark to Deliver Quest!
        </div>
      )}
      
      <div className="progress-overlay-text" style={{ pointerEvents: 'none' }}>
        <span className="progress-num" id="dash-pulse-num">{currentCarbon}</span>
        <span className="progress-unit">kg CO₂e/day</span>
        <span className="progress-label" id="twin-label-text">
          {currentCarbon <= dailyBudget ? 'EcoSphere Healthy' : 'Fossil Overload'}
        </span>
      </div>
    </div>
  );
}
