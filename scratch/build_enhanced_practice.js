// scratch/build_enhanced_practice.js
// Complete implementation of dramatic visual feedback & 3D transformations for all 8 modules

const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, '..', 'equipment_models.js');
let modelsContent = fs.readFileSync(modelsPath, 'utf8');

// Find where ModuleEquipmentBuilder starts
const startMarker = '  const ModuleEquipmentBuilder = {';
const startIndex = modelsContent.indexOf(startMarker);
if (startIndex === -1) {
  throw new Error('ModuleEquipmentBuilder not found in equipment_models.js');
}

// Find where ModuleEquipmentBuilder ends
const endMarker = 'return {\n    ExplodedViewBuilder,\n    ModuleEquipmentBuilder\n  };';
const endIndex = modelsContent.indexOf(endMarker);
if (endIndex === -1) {
  throw new Error('End marker not found in equipment_models.js');
}

// Prefix before ModuleEquipmentBuilder
const prefix = modelsContent.substring(0, startIndex);
// Suffix after ModuleEquipmentBuilder
const suffix = modelsContent.substring(endIndex);

// Generate new enhanced ModuleEquipmentBuilder
const newBuilderCode = `  // 3D In-World Holographic Procedure Badge & Target Reticle Builder
  function createStepHoloBadge(stepNum, title, subtext, status, THREE) {
    const isCompleted = (status === 'COMPLETED');
    const badgeGroup = new THREE.Group();

    let canvas = null;
    let ctx = null;
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 140;
      ctx = canvas.getContext('2d');
    }

    const redraw = (doneTitle, doneSubtext, doneStatus) => {
      if (!ctx) return;
      const isDone = (doneStatus === 'COMPLETED');
      ctx.fillStyle = isDone ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, 512, 140);
      ctx.strokeStyle = isDone ? '#10b981' : '#38bdf8';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 506, 134);

      ctx.fillStyle = isDone ? '#10b981' : '#0284c7';
      ctx.fillRect(3, 3, 506, 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isDone ? '✓ STEP VERIFIED // COMPLIANT' : '▶ ACTION REQUIRED // TARGET', 256, 21);

      ctx.fillStyle = isDone ? '#34d399' : '#ffffff';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(\`\${stepNum}. \${doneTitle || title}\`, 256, 74);

      ctx.fillStyle = isDone ? '#a7f3d0' : '#38bdf8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(doneSubtext || subtext, 256, 114);
    };

    redraw(title, subtext, status);

    let tex = null;
    if (canvas && THREE.CanvasTexture) {
      tex = new THREE.CanvasTexture(canvas);
    }
    const badgeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.20), badgeMat);
    badgeGroup.add(badgeMesh);

    const ringMat = new THREE.MeshBasicMaterial({
      color: isCompleted ? 0x10b981 : 0x00e5ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.10, 0.14, 24), ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.15;
    badgeGroup.add(ringMesh);

    badgeGroup.badgeMesh = badgeMesh;
    badgeGroup.ringMesh = ringMesh;
    badgeGroup.setCompleted = function(doneTitle, doneSubtext) {
      redraw(doneTitle, doneSubtext, 'COMPLETED');
      if (tex) tex.needsUpdate = true;
      if (ringMat.color && ringMat.color.setHex) ringMat.color.setHex(0x10b981);
    };

    return badgeGroup;
  }

  const ModuleEquipmentBuilder = {
    build(moduleCode, parentGroup, THREE, soundEngine, appInstance) {
      // Clear previous equipment safely
      while (parentGroup.children.length > 0) {
        const obj = parentGroup.children[0];
        parentGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      }

      const interactiveObjects = [];
      const stepInteractiveMap = {};
      let defaultCameraPos = new THREE.Vector3(0, 1.4, 2.4);
      let defaultControlsTarget = new THREE.Vector3(0, 1.0, -0.4);

      const code = String(moduleCode || '').toUpperCase();
      const snd = soundEngine || (appInstance ? appInstance.sound : null);

      function attachStepBadge(stepNum, title, subtext, targetPos, parent) {
        const badge = createStepHoloBadge(stepNum, title, subtext, 'ACTIVE', THREE);
        badge.name = `step_badge_${stepNum}`;
        if (badge.position && badge.position.copy) {
          badge.position.copy(targetPos);
        } else if (badge.position && badge.position.set) {
          badge.position.set(targetPos.x || 0, targetPos.y || 0, targetPos.z || 0);
        }
        badge.position.y = (badge.position.y || 0) + 0.45;
        parent.add(badge);
        interactiveObjects.push(badge);
        return badge;
      }

      // ---------------------------------------------------------------------
      // 1. SOLAR-ROOF-01: Rooftop Structural Racking & Sun Angle Irradiance Lab
      // ---------------------------------------------------------------------
      if (code.includes('ROOF') || (code.includes('01') && !code.includes('LOTO') && !code.includes('BOX') && !code.includes('CELL'))) {
        defaultCameraPos.set(0, 1.8, 1.4);
        defaultControlsTarget.set(0, 1.0, -0.4);

        const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 2.8), roofMat);
        roofDeck.position.set(0, 0.7, -0.6);
        parentGroup.add(roofDeck);

        const rafterMarkerGroup = new THREE.Group();
        rafterMarkerGroup.position.set(0, 0.78, -0.6);
        const rafterScanBox = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.02, 2.4),
          new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.2, wireframe: true })
        );
        const rafterLabelTex = createTextCanvasTexture('RAFTER LOAD: PENDING SCAN', '#0f172a', '#94a3b8', 380, 64, 'bold 16px monospace');
        const rafterLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.15), new THREE.MeshBasicMaterial({ map: rafterLabelTex }));
        rafterLabel.rotation.x = -Math.PI / 2;
        rafterLabel.position.set(0, 0.02, 0.8);
        rafterMarkerGroup.add(rafterScanBox, rafterLabel);
        rafterMarkerGroup.name = 'rafter_inspection_marker';
        parentGroup.add(rafterMarkerGroup);
        interactiveObjects.push(rafterMarkerGroup);

        const rafterPins = [];
        [-1.2, -0.4, 0.4, 1.2].forEach(rx => {
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
          pin.position.set(rx, 0.14, 0);
          pin.visible = false;
          rafterMarkerGroup.add(pin);
          rafterPins.push(pin);
        });

        const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const border1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.06), yellowLineMat);
        border1.rotation.x = -Math.PI / 2;
        border1.position.set(0, 0.78, 0.6);
        parentGroup.add(border1);

        const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
        const rackGroup = new THREE.Group();
        rackGroup.position.set(0, 0.84, -0.6);
        rackGroup.rotation.x = 0.0; // Flat initial state!

        [-0.45, 0.45].forEach(z => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 0.05), railMat);
          rail.position.set(0, 0, z);
          rackGroup.add(rail);
        });

        const boltWashers = [];
        [-1.0, 1.0].forEach(x => {
          [-0.45, 0.45].forEach(z => {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), railMat);
            foot.position.set(x, -0.06, z);
            const wRing = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.05, 16), new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }));
            wRing.rotation.x = -Math.PI / 2;
            wRing.position.set(x, 0.04, z);
            rackGroup.add(foot, wRing);
            boltWashers.push(wRing);
          });
        });
        rackGroup.name = 'unistrut_rails_rack';
        parentGroup.add(rackGroup);
        interactiveObjects.push(rackGroup);

        const compassGroup = new THREE.Group();
        compassGroup.position.set(-0.8, 0.82, 0.2);
        const compassCase = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 32), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }));
        const compassBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.026, 32), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        const needleGroup = new THREE.Group();
        const needleN = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.07, 4), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
        needleN.rotation.x = Math.PI / 2;
        needleN.position.z = -0.035;
        const needleS = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.07, 4), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
        needleS.rotation.x = -Math.PI / 2;
        needleS.position.z = 0.035;
        needleGroup.add(needleN, needleS);
        needleGroup.position.y = 0.016;
        needleGroup.rotation.y = 0.8;
        compassGroup.add(compassCase, compassBezel, needleGroup);

        const southBeam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 2.0, 8),
          new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.0 })
        );
        southBeam.rotation.x = Math.PI / 2;
        southBeam.position.set(0, 0.02, 1.0);
        compassGroup.add(southBeam);

        compassGroup.name = 'magnetic_compass';
        parentGroup.add(compassGroup);
        interactiveObjects.push(compassGroup);

        const incGroup = new THREE.Group();
        incGroup.position.set(-0.85, 0.95, -0.4);
        const incDial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
        incDial.rotation.x = Math.PI / 2;
        const incTex = createTextCanvasTexture('TILT: 0.0°', '#0f172a', '#94a3b8', 256, 64, 'bold 22px monospace');
        const incLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.05), new THREE.MeshBasicMaterial({ map: incTex }));
        incLabel.position.z = 0.012;
        incDial.add(incLabel);
        incGroup.add(incDial);
        incGroup.name = 'inclinometer_gauge';
        parentGroup.add(incGroup);
        interactiveObjects.push(incGroup);

        const pyrGroup = new THREE.Group();
        pyrGroup.position.set(0.9, 0.85, 0.2);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        for (let i = 0; i < 3; i++) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), legMat);
          const angle = (i * Math.PI * 2) / 3;
          leg.position.set(Math.cos(angle) * 0.12, 0.18, Math.sin(angle) * 0.12);
          leg.rotation.z = Math.cos(angle) * 0.3;
          leg.rotation.x = Math.sin(angle) * 0.3;
          pyrGroup.add(leg);
        }
        const pyrBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        pyrBase.position.y = 0.4;
        const pyrDome = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.95, opacity: 0.4, transparent: true }));
        pyrDome.position.y = 0.425;
        const pyrLcdTex = createTextCanvasTexture('--- W/m²', '#0284c7', '#94a3b8', 256, 64, 'bold 24px monospace');
        const meterLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: pyrLcdTex }));
        meterLcd.position.set(0, 0.32, 0.08);
        meterLcd.rotation.x = -0.3;
        pyrGroup.add(pyrBase, pyrDome, meterLcd);
        pyrGroup.name = 'pyranometer_sensor';
        parentGroup.add(pyrGroup);
        interactiveObjects.push(pyrGroup);

        const beamGeo = new THREE.CylinderGeometry(0.02, 0.35, 2.5, 16);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.05 });
        const sunBeam = new THREE.Mesh(beamGeo, beamMat);
        sunBeam.position.set(0.9, 1.8, 0.2);
        parentGroup.add(sunBeam);

        const twGroup = new THREE.Group();
        twGroup.position.set(0.3, 0.82, 0.3);
        const twShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.32, 16), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 }));
        twShaft.rotation.z = Math.PI / 2;
        const twHead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.05), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        twHead.position.x = 0.16;
        twGroup.add(twShaft, twHead);
        twGroup.name = 'unistrut_torque_wrench';
        parentGroup.add(twGroup);
        interactiveObjects.push(twGroup);

        const bootGroup = new THREE.Group();
        bootGroup.position.set(-0.5, 0.95, 0.4);
        const bootCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 }));
        const bootFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.01, 16), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }));
        bootCone.position.y = 0.05;
        const bootWarningRing = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.18, 24), new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide }));
        bootWarningRing.rotation.x = -Math.PI / 2;
        bootWarningRing.position.y = 0.005;
        bootGroup.add(bootCone, bootFlange, bootWarningRing);
        bootGroup.name = 'flashing_boot_seal';
        parentGroup.add(bootGroup);
        interactiveObjects.push(bootGroup);

        const b1 = attachStepBadge(1, 'ROOF INSPECT', 'Check rafter load capacity', new THREE.Vector3(0, 0.85, -0.6), parentGroup);
        const b2 = attachStepBadge(2, 'AZIMUTH ALIGN', 'Rotate to 180° True South', new THREE.Vector3(-0.8, 0.85, 0.2), parentGroup);
        const b3 = attachStepBadge(3, 'INCLINOMETER TILT', 'Set rack to 25.0° optimal tilt', new THREE.Vector3(-0.85, 0.98, -0.4), parentGroup);
        const b4 = attachStepBadge(4, 'PYRANOMETER READ', 'Measure solar flux (>800 W/m²)', new THREE.Vector3(0.9, 1.3, 0.2), parentGroup);
        const b5 = attachStepBadge(5, 'UNISTRUT TORQUE', 'Torque rail bolts to 14.0 N*m', new THREE.Vector3(0.1, 0.95, -0.5), parentGroup);
        const b6 = attachStepBadge(6, 'WATERPROOF SEAL', 'Seat EPDM flashing boots', new THREE.Vector3(-0.5, 0.95, 0.4), parentGroup);

        stepInteractiveMap[1] = {
          name: 'rafter_inspection_marker',
          title: 'ROOF INSPECTION',
          actionLabel: 'EXECUTE: 1. ROOF INSPECT',
          instructionEn: 'Verify structural rafter integrity and roof load capacity.',
          instructionHi: 'राफ़्टर भार वहन क्षमता और रूफ ट्रस संरचनात्मक अखंडता का निरीक्षण करें।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0, 0.8, -0.6), offset: new THREE.Vector3(0, 0.9, 1.4) },
          telemetryUpdates: { p4: { label: 'Roof Load', value: '18.5 kg/m² PASS' } },
          execute: (app) => {
            if (snd && snd.playScanTone) snd.playScanTone();
            else if (snd && snd.playProbeBeep) snd.playProbeBeep();
            rafterScanBox.material.color.setHex(0x00ff88);
            rafterScanBox.material.opacity = 0.85;
            rafterPins.forEach(p => { p.visible = true; });
            b1.setCompleted('ROOF INSPECTION', '18.5 kg/m² PASS (OSHA 1926.502)');
            return 'Structural rafter integrity confirmed at 18.5 kg/m² roof load.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'magnetic_compass',
          title: 'AZIMUTH ALIGNMENT',
          actionLabel: 'EXECUTE: 2. ALIGN AZIMUTH',
          instructionEn: 'Use magnetic compass to locate 180° True South solar noon window.',
          instructionHi: 'चुंबकीय कम्पास को 180° दक्षिण दिशा में संरेखित करें।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(-0.8, 0.82, 0.2), offset: new THREE.Vector3(0, 0.45, 0.65) },
          telemetryUpdates: { p3: { label: 'Azimuth', value: '180° TRUE SOUTH' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            needleGroup.rotation.y = Math.PI;
            southBeam.material.opacity = 0.85;
            b2.setCompleted('AZIMUTH ALIGN', '180° TRUE SOUTH LOCKED');
            return 'Magnetic compass aligned to 180° True South azimuth.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'inclinometer_gauge',
          title: 'INCLINOMETER TILT',
          actionLabel: 'EXECUTE: 3. SET 25° TILT',
          instructionEn: 'Set racking L-feet to 25.0° optimal latitude tilt angle.',
          instructionHi: 'रैकिंग संरचना को 25.0° कोण पर झुकाएं।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(-0.5, 0.95, -0.5), offset: new THREE.Vector3(0, 0.5, 1.2) },
          telemetryUpdates: { p1: { label: 'Tilt Angle', value: '25.0° OPTIMAL' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            rackGroup.rotation.x = 0.436;
            incDial.material.color.setHex(0x10b981);
            b3.setCompleted('25.0° TILT', 'OPTIMAL LATITUDE ANGLE');
            return 'Racking tilted to 25.0° optimal solar incidence angle.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'pyranometer_sensor',
          title: 'PYRANOMETER READING',
          actionLabel: 'EXECUTE: 4. READ IRRADIANCE',
          instructionEn: 'Measure real-time rooftop solar irradiance (>800 W/m²).',
          instructionHi: 'क्लास ए पायरानोमीटर से सोलर विकिरण को मापें।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0.9, 1.0, 0.2), offset: new THREE.Vector3(0, 0.4, 0.7) },
          telemetryUpdates: { p2: { label: 'Irradiance', value: '885 W/m² PEAK' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            pyrDome.material.color.setHex(0xfde047);
            pyrDome.material.opacity = 0.9;
            sunBeam.material.opacity = 0.6;
            b4.setCompleted('PYRANOMETER', '885 W/m² PEAK FLUX');
            return 'Pyranometer calibrated: 885 W/m² incident solar flux.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'unistrut_torque_wrench',
          title: 'UNISTRUT TORQUING',
          actionLabel: 'EXECUTE: 5. TORQUE RAILS',
          instructionEn: 'Fasten aerospace aluminum rails with torque wrench to 14.0 N·m.',
          instructionHi: 'एल्यूमीनियम रेल बोल्ट को 14.0 N*m टॉर्क पर कसें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0.1, 0.95, -0.5), offset: new THREE.Vector3(0, 0.4, 0.8) },
          telemetryUpdates: { p1: { label: 'Rail Torque', value: '14.0 N*m PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
            twGroup.position.set(0, 0.95, -0.6);
            twGroup.rotation.y += Math.PI / 2;
            boltWashers.forEach(w => { w.material.color.setHex(0x10b981); });
            b5.setCompleted('UNISTRUT TORQUE', '14.0 N·m SPEC OK');
            return 'Unistrut rails torqued to 14.0 N·m specification.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'flashing_boot_seal',
          title: 'WATERPROOF SEAL',
          actionLabel: 'EXECUTE: 6. SEAL FLASHING',
          instructionEn: 'Inspect EPDM rubber flashing boots against rain penetration.',
          instructionHi: 'ईपीडीएम फ्लैशिंग बूट और वॉटरप्रूफ सील लगाएं।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(-0.5, 0.8, 0.4), offset: new THREE.Vector3(0, 0.4, 0.6) },
          telemetryUpdates: { p4: { label: 'Waterproof Seal', value: '100% SEALED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            bootGroup.position.set(-0.5, 0.78, 0.4);
            bootWarningRing.material.color.setHex(0x10b981);
            b6.setCompleted('WATERPROOF SEAL', '100% EPDM BEAD SEALED');
            return 'EPDM rubber flashing boots seated with 100% waterproof seal.';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 2. SOLAR-MOUNT-02: PV Panel Mounting & Torquing Station
      // ---------------------------------------------------------------------
      else if (code.includes('MOUNT') || (code.includes('02') && !code.includes('SW'))) {
        defaultCameraPos.set(0, 1.5, 1.2);
        defaultControlsTarget.set(0, 0.95, -0.4);

        const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.4), benchMat);
        bench.position.set(0, 0.72, -0.5);
        parentGroup.add(bench);

        const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
        [-0.35, 0.35].forEach(z => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.045, 0.045), railMat);
          rail.position.set(0, 0.80, -0.5 + z);
          parentGroup.add(rail);
        });

        // Dual 550W Bifacial PV Panels (STARTS HOISTED IN AIR AT Y = 1.45m!)
        const panelGroup = new THREE.Group();
        const pvTex = createSolarWaferTexture();
        const pvMat = new THREE.MeshStandardMaterial({ map: pvTex, roughness: 0.3, metalness: 0.6 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 });

        const p1 = new THREE.Group();
        const frame1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 1.2), frameMat);
        const wafer1 = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 1.16), pvMat);
        wafer1.position.y = 0.01;
        p1.add(frame1, wafer1);
        p1.position.set(-0.54, 1.45, -0.5); // Hoisted in air!
        p1.rotation.z = 0.08;

        const p2 = new THREE.Group();
        const frame2 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 1.2), frameMat);
        const wafer2 = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 1.16), pvMat);
        wafer2.position.y = 0.01;
        p2.add(frame2, wafer2);
        p2.position.set(0.54, 1.45, -0.5); // Hoisted in air!
        p2.rotation.z = -0.08;

        panelGroup.add(p1, p2);
        panelGroup.name = 'bifacial_pv_panel';
        parentGroup.add(panelGroup);
        interactiveObjects.push(panelGroup);

        const weebGroup = new THREE.Group();
        weebGroup.position.set(0, 0.82, -0.2);
        const weebPlate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.01, 0.06), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98 }));
        weebGroup.add(weebPlate);
        weebGroup.name = 'weeb_grounding_clip';
        parentGroup.add(weebGroup);
        interactiveObjects.push(weebGroup);

        const spacerGroup = new THREE.Group();
        spacerGroup.position.set(0, 0.85, -0.5);
        const spacer = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 }));
        spacerGroup.add(spacer);
        spacerGroup.name = 'thermal_gap_spacer';
        parentGroup.add(spacerGroup);
        interactiveObjects.push(spacerGroup);

        const clampGroup = new THREE.Group();
        clampGroup.position.y = 0.35; // Hovers initially
        const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
        [-0.35, 0.35].forEach(z => {
          const midClamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), clampMat);
          midClamp.position.set(0, 0.87, -0.5 + z);
          clampGroup.add(midClamp);
        });
        clampGroup.name = 'mid_clamp';
        parentGroup.add(clampGroup);
        interactiveObjects.push(clampGroup);

        const wrenchGroup = new THREE.Group();
        wrenchGroup.position.set(0.65, 0.80, -0.2);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 16), handleMat);
        shaft.rotation.z = Math.PI / 2;
        const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.06), headMat);
        head.position.x = 0.18;
        const twLcdTex = createTextCanvasTexture('0.0 N*m', '#0f172a', '#ef4444', 256, 64, 'bold 22px monospace');
        const twLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshBasicMaterial({ map: twLcdTex }));
        twLcd.rotation.x = -Math.PI / 2;
        twLcd.position.set(0, 0.015, 0);
        wrenchGroup.add(shaft, head, twLcd);
        wrenchGroup.name = 'torque_wrench';
        parentGroup.add(wrenchGroup);
        interactiveObjects.push(wrenchGroup);

        const testerGroup = new THREE.Group();
        testerGroup.position.set(-0.85, 0.80, -0.2);
        const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
        const tScreenTex = createTextCanvasTexture('--- Ω', '#0f172a', '#94a3b8', 256, 64, 'bold 22px monospace');
        const tScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: tScreenTex }));
        tScreen.rotation.x = -Math.PI / 2;
        tScreen.position.y = 0.032;
        testerGroup.add(tBody, tScreen);
        testerGroup.name = 'micro_ohmmeter';
        parentGroup.add(testerGroup);
        interactiveObjects.push(testerGroup);

        const b1 = attachStepBadge(1, 'PANEL LIFT', 'Lower 550W panels into rail channel', new THREE.Vector3(0, 1.5, -0.5), parentGroup);
        const b2 = attachStepBadge(2, 'WEEB CLIPS', 'Insert WEEB grounding clips', new THREE.Vector3(0, 0.9, -0.2), parentGroup);
        const b3 = attachStepBadge(3, 'THERMAL GAP', 'Set 20mm expansion spacer', new THREE.Vector3(0, 0.95, -0.5), parentGroup);
        const b4 = attachStepBadge(4, 'MID-CLAMPS', 'Seat anodized clamp channels', new THREE.Vector3(0, 1.0, -0.5), parentGroup);
        const b5 = attachStepBadge(5, 'TORQUE WRENCH', 'Torque bolts to 15.5 N*m', new THREE.Vector3(0.2, 0.95, -0.3), parentGroup);
        const b6 = attachStepBadge(6, 'GROUND BOND', 'Measure frame continuity (<0.10 Ω)', new THREE.Vector3(-0.6, 0.95, -0.3), parentGroup);

        stepInteractiveMap[1] = {
          name: 'bifacial_pv_panel',
          title: 'PANEL LIFT & SEAT',
          actionLabel: 'EXECUTE: 1. SEAT PANELS',
          instructionEn: 'Position dual 550W bifacial monocrystalline PV panels on racking.',
          instructionHi: 'रैकिंग रेल पर दोनों 550W पीवी पैनलों को बैठाएं।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0, 0.9, -0.5), offset: new THREE.Vector3(0, 0.7, 1.3) },
          telemetryUpdates: { p1: { label: 'Panels', value: '2x 550W SEATED' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            p1.position.set(-0.54, 0.84, -0.5); // Lower flush to rails
            p1.rotation.z = 0;
            p2.position.set(0.54, 0.84, -0.5);
            p2.rotation.z = 0;
            b1.setCompleted('PANEL LIFT', '2x 550W FLUSH SEATED');
            return 'Dual 550W bifacial PV panels positioned flush onto rails.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'weeb_grounding_clip',
          title: 'WEEB CLIPS',
          actionLabel: 'EXECUTE: 2. INSERT WEEB CLIPS',
          instructionEn: 'Seat serrated grounding washer between rail and panel frame.',
          instructionHi: 'फ्रेम के नीचे स्टेनलेस स्टील डब्ल्यूईईबी 9.5 ग्राउंडिंग क्लिप लगाएं।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0, 0.85, -0.35), offset: new THREE.Vector3(0, 0.35, 0.55) },
          telemetryUpdates: { p4: { label: 'Ground Bond', value: 'WEEB 9.5 INSERTED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            weebGroup.position.set(0, 0.83, -0.35); // Slots under panel
            b2.setCompleted('WEEB CLIPS', 'ANODIZED LAYER PENETRATED');
            return 'WEEB 9.5 clip seated. Serrated teeth penetrate anodized layer.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'thermal_gap_spacer',
          title: 'THERMAL GAP',
          actionLabel: 'EXECUTE: 3. CHECK 20mm GAP',
          instructionEn: 'Measure 20mm uniform thermal expansion gap between panels.',
          instructionHi: 'मॉड्यूल के बीच 20 मिमी थर्मल विस्तार अंतर मापें।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0, 0.9, -0.5), offset: new THREE.Vector3(0, 0.4, 0.8) },
          telemetryUpdates: { p3: { label: 'Thermal Gap', value: '20 mm NOMINAL' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            p1.position.x = -0.53;
            p2.position.x = 0.53;
            spacer.material.color.setHex(0x10b981);
            spacer.material.opacity = 0.85;
            b3.setCompleted('THERMAL GAP', '20.0 mm NOMINAL CALIBRATED');
            return 'Thermal expansion gap verified at 20.0 mm nominal.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'mid_clamp',
          title: 'MID-CLAMPS',
          actionLabel: 'EXECUTE: 4. DROP MID-CLAMPS',
          instructionEn: 'Drop anodized aluminum mid-clamp into Unistrut channel.',
          instructionHi: 'यूनिस्ट्रट चैनल में एनोडाइज्ड एल्यूमीनियम मिड-क्लैंप डालें।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0, 0.9, -0.5), offset: new THREE.Vector3(0, 0.35, 0.7) },
          telemetryUpdates: { p2: { label: 'End Torque', value: 'CLAMPS POSITIONED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            clampGroup.position.y = 0; // Drops flush into rail channel
            b4.setCompleted('MID-CLAMPS', 'CHANNELS SEATED & LOCKED');
            return 'Anodized aluminum mid-clamps seated into channel.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'torque_wrench',
          title: 'TORQUE WRENCH',
          actionLabel: 'EXECUTE: 5. TORQUE CLAMPS',
          instructionEn: 'Torque clamp hex bolt to 15.5 N·m calibrated setting.',
          instructionHi: 'क्लैंप हेक्स बोल्ट को 15.5 N*m टॉर्क पर कसें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0, 0.9, -0.4), offset: new THREE.Vector3(0, 0.35, 0.65) },
          telemetryUpdates: { p1: { label: 'Clamp Torque', value: '15.5 N*m PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playProbeBeep) snd.playProbeBeep();
            wrenchGroup.position.set(0, 0.90, -0.35);
            wrenchGroup.rotation.z += Math.PI / 2;
            b5.setCompleted('TORQUE WRENCH', '15.5 N*m CALIBRATED PASS');
            return 'Mid-clamp hex bolts torqued to 15.5 N·m calibrated setting.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'micro_ohmmeter',
          title: 'BONDING CHECK',
          actionLabel: 'EXECUTE: 6. TEST GROUND BOND',
          instructionEn: 'Measure frame-to-rail continuity with micro-ohmmeter (<0.10 Ω).',
          instructionHi: 'माइक्रो-ओहममीटर से फ्रेम-टू-रेल निरंतरता मापें (<0.10 Ω)।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(-0.4, 0.85, -0.3), offset: new THREE.Vector3(0, 0.35, 0.65) },
          telemetryUpdates: { p4: { label: 'Ground Bond', value: '0.04 Ω PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            testerGroup.position.set(-0.5, 0.84, -0.2);
            b6.setCompleted('GROUND BOND', '0.04 Ω PASS (<0.10 Ω UL 2703)');
            return 'Grounding resistance verified at 0.04 Ω (well below 0.10 Ω limit).';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 3. SOLAR-DC-03: DC Cabling, MC4 Crimping & String Wiring
      // ---------------------------------------------------------------------
      else if (code.includes('DC') || code.includes('03')) {
        defaultCameraPos.set(0, 1.3, 1.0);
        defaultControlsTarget.set(0, 0.85, -0.4);

        const benchMat = new THREE.MeshStandardMaterial({ color: 0x1d3d63, roughness: 0.65 });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), benchMat);
        bench.position.set(0, 0.74, -0.5);
        parentGroup.add(bench);

        const spoolMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        const redCableMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
        const blackCableMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });

        [-0.6, -0.35].forEach((x, i) => {
          const spGroup = new THREE.Group();
          const flange1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 24), spoolMat);
          const flange2 = flange1.clone();
          flange2.position.y = 0.16;
          const core = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 24), i === 0 ? redCableMat : blackCableMat);
          core.position.y = 0.08;
          spGroup.add(flange1, flange2, core);
          spGroup.position.set(x, 0.78, -0.65);
          parentGroup.add(spGroup);
        });

        // Step 1: Cable sample (STARTS SOLID RED ALL THE WAY TO TIP - COPPER HIDDEN!)
        const cableSample = new THREE.Group();
        cableSample.position.set(-0.05, 0.80, -0.4);
        const cSheath = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.32, 16), redCableMat);
        cSheath.rotation.z = Math.PI / 2;
        const cCopper = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 }));
        cCopper.rotation.z = Math.PI / 2;
        cCopper.position.x = 0.16;
        cCopper.visible = false; // Hidden before strip!
        cableSample.add(cSheath, cCopper);
        cableSample.name = 'pv_cable_sample';
        parentGroup.add(cableSample);
        interactiveObjects.push(cableSample);

        const strandInspectGroup = new THREE.Group();
        strandInspectGroup.position.set(0.12, 0.80, -0.4);
        const strandBox = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.035, 16), new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide }));
        strandInspectGroup.add(strandBox);
        strandInspectGroup.name = 'wire_strands_inspection';
        parentGroup.add(strandInspectGroup);
        interactiveObjects.push(strandInspectGroup);

        const pinGroup = new THREE.Group();
        pinGroup.position.set(0.28, 0.80, -0.4); // On bench initially
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 }));
        pin.rotation.z = Math.PI / 2;
        pinGroup.add(pin);
        pinGroup.name = 'mc4_gold_pin';
        parentGroup.add(pinGroup);
        interactiveObjects.push(pinGroup);

        const crimpGroup = new THREE.Group();
        crimpGroup.position.set(0.35, 0.81, -0.2); // Beside on bench
        const jawMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.25 });
        const gripMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
        const cJaws = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.05), jawMat);
        const cGrip1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.025), gripMat);
        cGrip1.position.set(-0.12, 0.04, 0);
        const cGrip2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.025), gripMat);
        cGrip2.position.set(-0.12, -0.04, 0);
        crimpGroup.add(cJaws, cGrip1, cGrip2);
        crimpGroup.name = 'ratchet_crimper';
        parentGroup.add(crimpGroup);
        interactiveObjects.push(crimpGroup);

        const mc4Group = new THREE.Group();
        mc4Group.position.set(0.48, 0.80, -0.4); // Open on bench
        const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        housing.rotation.z = Math.PI / 2;
        mc4Group.add(housing);
        mc4Group.name = 'mc4_housing';
        parentGroup.add(mc4Group);
        interactiveObjects.push(mc4Group);

        const pullRig = new THREE.Group();
        pullRig.position.set(0.65, 0.81, -0.4);
        const rBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.16), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        const rClamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        rClamp.position.set(-0.08, 0.04, 0);
        const rGaugeTex = createTextCanvasTexture('--- N', '#0f172a', '#94a3b8', 256, 64, 'bold 22px monospace');
        const rGauge = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.04), new THREE.MeshBasicMaterial({ map: rGaugeTex }));
        rGauge.rotation.x = -Math.PI / 2;
        rGauge.position.set(0.04, 0.032, 0);
        pullRig.add(rBase, rClamp, rGauge);
        pullRig.name = 'pull_test_rig';
        parentGroup.add(pullRig);
        interactiveObjects.push(pullRig);

        const b1 = attachStepBadge(1, 'STRIP CABLE', 'Strip 7.5mm outer insulation', new THREE.Vector3(0, 0.95, -0.4), parentGroup);
        const b2 = attachStepBadge(2, 'INSPECT STRANDS', 'Verify 56/56 copper strands', new THREE.Vector3(0.12, 0.95, -0.4), parentGroup);
        const b3 = attachStepBadge(3, 'INSERT PIN', 'Seat gold pin onto copper core', new THREE.Vector3(0.25, 0.95, -0.4), parentGroup);
        const b4 = attachStepBadge(4, 'RATCHET CRIMP', 'Execute full-cycle pressure crimp', new THREE.Vector3(0.35, 0.95, -0.2), parentGroup);
        const b5 = attachStepBadge(5, 'SNAP HOUSING', 'Push pin into IP68 gland', new THREE.Vector3(0.45, 0.95, -0.4), parentGroup);
        const b6 = attachStepBadge(6, 'PULL TEST', 'Test 345 N tensile retention', new THREE.Vector3(0.65, 0.95, -0.4), parentGroup);

        stepInteractiveMap[1] = {
          name: 'pv_cable_sample',
          title: 'STRIP CABLE',
          actionLabel: 'EXECUTE: 1. STRIP CABLE',
          instructionEn: 'Strip 7.5mm outer cross-linked insulation from 6mm² PV wire.',
          instructionHi: '6mm² PV वायर से 7.5 मिमी इन्सुलेशन स्ट्रिप करें।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0.0, 0.82, -0.4), offset: new THREE.Vector3(0, 0.25, 0.45) },
          telemetryUpdates: { p2: { label: 'Strip Depth', value: '7.5 mm CONFIRMED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            cSheath.scale.set(0.85, 1, 1);
            cSheath.position.x = -0.03;
            cCopper.visible = true; // Exposes copper multi-strands!
            b1.setCompleted('STRIP CABLE', '7.5mm STRIPPED CLEANLY');
            return 'Stripped 7.5mm cross-linked jacket cleanly.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'wire_strands_inspection',
          title: 'WIRE STRANDS',
          actionLabel: 'EXECUTE: 2. INSPECT STRANDS',
          instructionEn: 'Inspect tinned copper multi-strands for nicking or breakage.',
          instructionHi: '56 टिनयुक्त तांबे के तारों की अखंडता का निरीक्षण करें।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0.12, 0.82, -0.4), offset: new THREE.Vector3(0, 0.2, 0.35) },
          telemetryUpdates: { p1: { label: 'Cable Sizing', value: '6mm² (56/56 INTACT)' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            strandBox.material.color.setHex(0x10b981);
            b2.setCompleted('STRANDS OK', '56/56 INTACT // ZERO SPLAY');
            return 'Conductor multi-strands inspected: 56/56 intact, zero fractures.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'mc4_gold_pin',
          title: 'INSERT PIN',
          actionLabel: 'EXECUTE: 3. INSERT PIN',
          instructionEn: 'Insert conductor into gold-plated male/female MC4 contact pin.',
          instructionHi: 'कंडक्टर को गोल्ड-प्लेटेड MC4 कॉन्टैक्ट पिन में डालें।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0.15, 0.82, -0.4), offset: new THREE.Vector3(0, 0.2, 0.35) },
          telemetryUpdates: { p4: { label: 'Contact Res', value: '0.18 mΩ SEATED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            pinGroup.position.set(0.12, 0.80, -0.4); // Slides flush over copper
            b3.setCompleted('INSERT PIN', 'GOLD PIN SEATED FLUSH');
            return 'Conductor core inserted into gold MC4 terminal pin.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'ratchet_crimper',
          title: 'RATCHET CRIMP',
          actionLabel: 'EXECUTE: 4. RATCHET CRIMP',
          instructionEn: 'Execute full cycle crimp with calibrated Rennsteig tool.',
          instructionHi: 'कैलिब्रेटेड रैचेट टूल से फुल-साइकिल क्रिम्पिंग करें।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0.15, 0.83, -0.35), offset: new THREE.Vector3(0, 0.25, 0.45) },
          telemetryUpdates: { p1: { label: 'Crimp Quality', value: 'UL 486A PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
            crimpGroup.position.set(0.12, 0.81, -0.4); // Clamps over pin
            b4.setCompleted('RATCHET CRIMP', 'CERTIFIED B-CRIMP (UL 486A)');
            return 'Full-cycle ratchet crimp executed. B-crimp indent certified.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'mc4_housing',
          title: 'ASSEMBLE HOUSING',
          actionLabel: 'EXECUTE: 5. SNAP HOUSING',
          instructionEn: 'Push contact into IP68 gland until audible metallic click.',
          instructionHi: 'पिन को IP68 हाउसिंग में तब तक धकेलें जब तक क्लिक न हो।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0.2, 0.82, -0.4), offset: new THREE.Vector3(0, 0.25, 0.4) },
          telemetryUpdates: { p2: { label: 'IP68 Gland', value: 'LOCKED CLICK' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            mc4Group.position.set(0.14, 0.80, -0.4); // Snaps over pin
            b5.setCompleted('SNAP HOUSING', 'IP68 HOUSING LOCKED CLICK');
            return 'Contact pushed into housing gland. Retention barb locked.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'pull_test_rig',
          title: 'PULL-TEST RIG',
          actionLabel: 'EXECUTE: 6. TEST PULL RIG',
          instructionEn: 'Clamp cable into 360 N digital tensile pull-tester to verify retention.',
          instructionHi: 'केबल को 360 N पुल-टेस्ट रिग में क्लैंप करके रीटेनशन सत्यापित करें।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(0.35, 0.83, -0.4), offset: new THREE.Vector3(0, 0.3, 0.55) },
          telemetryUpdates: { p3: { label: 'Pull Retention', value: '345 N PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            pullRig.position.set(0.35, 0.81, -0.4);
            b6.setCompleted('PULL TEST', '345 N PASS (>310 N SPEC)');
            return 'Tensile pull retention tested at 345 N (exceeds 310 N requirement).';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 4. SOLAR-BOX-01: Combiner Box Safe Isolation & Battery Lab (Original)
      // ---------------------------------------------------------------------
      else if (code.includes('BOX') || code.includes('04')) {
        defaultCameraPos.set(0, 1.25, 0.65);
        defaultControlsTarget.set(0, 0.95, -0.65);

        const appRef = appInstance || (typeof window !== 'undefined' ? window.app : null);
        if (appRef && appRef.env) {
          if (appRef.env.workbenchGroup) appRef.env.workbenchGroup.visible = true;
          if (appRef.env.combinerBox) appRef.env.combinerBox.visible = true;
          if (appRef.env.batteryRack) appRef.env.batteryRack.visible = true;
          if (appRef.env.interactiveObjects && appRef.env.interactiveObjects.length > 0) {
            interactiveObjects.push(...appRef.env.interactiveObjects);
          }
        }
        if (interactiveObjects.length === 0) {
          ['gate_keypad', 'rotary_isolator', 'probe_red', 'fuse_cartridge', 'toolbox_lid', 'battery_unit'].forEach(name => {
            const placeholder = new THREE.Group();
            placeholder.name = name;
            interactiveObjects.push(placeholder);
          });
        }

        const b1 = attachStepBadge(1, 'MAIN GATE', 'Biometric keypad access', new THREE.Vector3(0.8, 1.4, 1.7), parentGroup);
        const b2 = attachStepBadge(2, 'ISOLATE SWITCH', 'Rotate DC switch to 0V', new THREE.Vector3(-0.15, 1.2, -0.65), parentGroup);
        const b3 = attachStepBadge(3, 'PROBE VOLTAGE', 'Confirm 0.00V zero potential', new THREE.Vector3(0.05, 1.2, -0.65), parentGroup);
        const b4 = attachStepBadge(4, 'REPLACE FUSE', 'Seat fresh 15A 1000V fuse', new THREE.Vector3(0.0, 1.1, -0.65), parentGroup);
        const b5 = attachStepBadge(5, 'OPEN TOOLBOX', 'Retrieve torque driver', new THREE.Vector3(0.45, 1.1, -0.5), parentGroup);
        const b6 = attachStepBadge(6, 'CONNECT BATTERY', 'Dock 48V battery pack', new THREE.Vector3(-0.6, 1.1, -0.6), parentGroup);

        stepInteractiveMap[1] = {
          name: 'gate_keypad',
          title: 'MAIN GATE',
          actionLabel: 'EXECUTE: 1. OPEN GATE',
          instructionEn: 'Scan biometric authorization card or access security keypad.',
          instructionHi: 'सुरक्षा कीपैड का उपयोग करें या कहें "जार्विस, गेट खोलो"।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0, 1.2, 1.8), offset: new THREE.Vector3(0, 0.2, 1.0) },
          telemetryUpdates: { p4: { label: 'Facility Access', value: 'PERIMETER CLEARED' } },
          execute: (app) => {
            if (app && app.animateOpenGateAndEnter) app.animateOpenGateAndEnter();
            b1.setCompleted('MAIN GATE', 'PERIMETER CLEARED');
            return 'Facility perimeter gate opened.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'rotary_isolator',
          title: 'SAFE ISOLATION',
          actionLabel: 'EXECUTE: 2. ISOLATE SWITCH',
          instructionEn: 'Rotate DC isolator switch 90° to OFF.',
          instructionHi: 'कंबाइनर बॉक्स का ढक्कन खोलें और डीसी आइसोलेटर स्विच घुमाएं।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0, 1.0, -0.65), offset: new THREE.Vector3(0, 0.2, 0.65) },
          telemetryUpdates: { p3: { label: 'Bus Voltage', value: '0.00 V (ISOLATED)' } },
          execute: (app) => {
            if (app && app.animateRotarySwitch) app.animateRotarySwitch();
            b2.setCompleted('SAFE ISOLATION', 'DC ROTARY SWITCH 0V');
            return 'DC rotary isolator switched to OFF.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'probe_red',
          title: 'PROBE VOLTAGE',
          actionLabel: 'EXECUTE: 3. PROBE VOLTAGE',
          instructionEn: 'Probe high-voltage terminals to confirm zero energy (<50V).',
          instructionHi: 'शून्य विभव की पुष्टि के लिए मल्टीमीटर प्रोब्स लगाएं।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0, 1.0, -0.65), offset: new THREE.Vector3(0, 0.2, 0.6) },
          telemetryUpdates: { p3: { label: 'Bus Voltage', value: '0.00 V VERIFIED' } },
          execute: (app) => {
            if (app && app.handleProbingInteraction) app.handleProbingInteraction();
            b3.setCompleted('PROBE VOLTAGE', '0.00 V ZERO ENERGY CONFIRMED');
            return 'Multimeter verified zero potential (0.00V).';
          }
        };

        stepInteractiveMap[4] = {
          name: 'fuse_cartridge',
          title: 'REPLACE FUSE',
          actionLabel: 'EXECUTE: 4. REPLACE FUSE',
          instructionEn: 'Extract blown fuse #3 & insert fresh 15A gPV fuse.',
          instructionHi: 'खराब फ्यूज को निकालें और नया 15A फ्यूज लगाएं।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0, 1.0, -0.65), offset: new THREE.Vector3(0, 0.15, 0.5) },
          telemetryUpdates: { p1: { label: 'Roof PV (Voc)', value: '480.0 V (FUSE OK)' } },
          execute: (app) => {
            if (app && app.animateCorrectCircuit) app.animateCorrectCircuit();
            b4.setCompleted('REPLACE FUSE', '15A 1000V gPV SEATED');
            return 'Blown fuse #3 replaced with 15A cartridge.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'toolbox_lid',
          title: 'TOOL BOX',
          actionLabel: 'EXECUTE: 5. OPEN TOOLBOX',
          instructionEn: 'Retrieve insulated torque driver and mounting brackets.',
          instructionHi: 'इंसुलेटेड टॉर्क टूल निकालने के लिए टूलबॉक्स खोलें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0.45, 0.9, -0.5), offset: new THREE.Vector3(0, 0.3, 0.6) },
          telemetryUpdates: { p4: { label: 'Battery Bay', value: 'READY FOR PACK' } },
          execute: (app) => {
            if (app && app.animateOpenToolbox) app.animateOpenToolbox();
            b5.setCompleted('TOOL BOX', 'INSULATED DRIVER RETRIEVED');
            return 'Toolbox opened. Insulated torque tools retrieved.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'battery_unit',
          title: 'CONNECT BATTERY',
          actionLabel: 'EXECUTE: 6. DOCK BATTERY',
          instructionEn: 'Slide 48V LiFePO4 battery module into rack and lock connector.',
          instructionHi: '48V बैटरी पैक को रैक में लगाएं और कनेक्टर लॉक करें।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(-0.6, 0.8, -0.6), offset: new THREE.Vector3(0, 0.3, 0.8) },
          telemetryUpdates: { p4: { label: 'Battery Bay', value: 'ONLINE // 51.2V' } },
          execute: (app) => {
            if (app && app.animateInstallBattery) app.animateInstallBattery();
            b6.setCompleted('CONNECT BATTERY', '48V PACK DOCKED ONLINE');
            return '48V battery pack installed and connected.';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 5. SOLAR-GRID-05: 3-Phase Inverter Commissioning & Grid Interconnection
      // ---------------------------------------------------------------------
      else if (code.includes('GRID') || code.includes('05') || code.includes('INVERTER')) {
        defaultCameraPos.set(0, 1.4, 1.4);
        defaultControlsTarget.set(0, 1.2, -0.8);

        const invGroup = new THREE.Group();
        invGroup.position.set(0, 1.35, -0.8);
        const invBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.24), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 }));
        const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.83, 0.05), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
        heatsink.position.z = -0.13;
        invGroup.add(invBody, heatsink);

        // Starts completely dark (OFF)!
        const lcdTex = createTextCanvasTexture('SYSTEM STANDBY', '#0284c7', '#ffffff', 256, 128, 'bold 18px monospace');
        const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.16), new THREE.MeshBasicMaterial({ map: lcdTex }));
        lcd.position.set(0, 0.22, 0.125);
        invGroup.add(lcd);

        const mpptSwGroup = new THREE.Group();
        mpptSwGroup.position.set(0, -0.28, 0.13);
        const swKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        swKnob.rotation.x = Math.PI / 2;
        mpptSwGroup.add(swKnob);
        invGroup.add(mpptSwGroup);
        mpptSwGroup.name = 'mppt_dc_switch';
        interactiveObjects.push(mpptSwGroup);

        invGroup.name = 'commercial_inverter';
        parentGroup.add(invGroup);
        interactiveObjects.push(invGroup);

        const acSwGroup = new THREE.Group();
        acSwGroup.position.set(0.55, 1.35, -0.78);
        const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.16), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 }));
        const leverGroup = new THREE.Group();
        const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8 }));
        lever.position.y = 0.12;
        leverGroup.add(lever);
        leverGroup.position.set(0.18, 0, 0);
        leverGroup.rotation.z = 0.6; // Starts OFF (open)!
        acSwGroup.add(swBox, leverGroup);
        acSwGroup.name = 'ac_disconnect_switch';
        parentGroup.add(acSwGroup);
        interactiveObjects.push(acSwGroup);

        const rotGroup = new THREE.Group();
        rotGroup.position.set(0.55, 0.95, -0.65);
        const rotBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 }));
        const rotLcdTex = createTextCanvasTexture('--- CW', '#0f172a', '#94a3b8', 256, 64, 'bold 18px monospace');
        const rotLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06), new THREE.MeshBasicMaterial({ map: rotLcdTex }));
        rotLcd.position.z = 0.022;
        rotGroup.add(rotBody, rotLcd);
        rotGroup.name = 'fluke_phase_rotation_meter';
        parentGroup.add(rotGroup);
        interactiveObjects.push(rotGroup);

        const syncGroup = new THREE.Group();
        syncGroup.position.set(0, 0.92, -0.75);
        const syncContactor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.10), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        const syncLed = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        syncLed.position.set(0, 0.04, 0.055);
        syncGroup.add(syncContactor, syncLed);
        syncGroup.name = 'grid_sync_relay';
        parentGroup.add(syncGroup);
        interactiveObjects.push(syncGroup);

        const btnGroup = new THREE.Group();
        btnGroup.position.set(-0.55, 1.35, -0.78);
        const btnBox = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        const btnPush = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        btnPush.rotation.x = Math.PI / 2;
        btnPush.position.z = 0.045;
        btnGroup.add(btnBox, btnPush);
        btnGroup.name = 'anti_islanding_test_button';
        parentGroup.add(btnGroup);
        interactiveObjects.push(btnGroup);

        const b1 = attachStepBadge(1, 'PHASE ROTATION', 'Fluke 9040 sequence check', new THREE.Vector3(0.55, 1.15, -0.65), parentGroup);
        const b2 = attachStepBadge(2, 'AC DISCONNECT', 'Close 480V knife disconnect', new THREE.Vector3(0.55, 1.65, -0.78), parentGroup);
        const b3 = attachStepBadge(3, 'MPPT DC INPUT', 'Rotate DC rotary switch to ON', new THREE.Vector3(0, 1.1, -0.7), parentGroup);
        const b4 = attachStepBadge(4, 'BOOT INVERTER', 'Initialize DSP/MCU controller', new THREE.Vector3(0, 1.75, -0.7), parentGroup);
        const b5 = attachStepBadge(5, 'GRID SYNC RELAY', '60.0 Hz phase-lock loop sync', new THREE.Vector3(0, 1.1, -0.75), parentGroup);
        const b6 = attachStepBadge(6, 'ANTI-ISLANDING', 'Trip test (<2.0s disconnect)', new THREE.Vector3(-0.55, 1.65, -0.78), parentGroup);

        stepInteractiveMap[1] = {
          name: 'fluke_phase_rotation_meter',
          title: 'PHASE ROTATION',
          actionLabel: 'EXECUTE: 1. ROTATION CHECK',
          instructionEn: 'Confirm clockwise phase sequence (L1-L2-L3) with Fluke 9040.',
          instructionHi: 'फ्लूक 9040 से क्लॉकवाइज़ फेज़ रोटेशन (L1-L2-L3) सत्यापित करें।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0.55, 0.95, -0.65), offset: new THREE.Vector3(0, 0.25, 0.5) },
          telemetryUpdates: { p3: { label: 'Phase Sequence', value: 'L1-L2-L3 CW PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            rotLcd.material.color.setHex(0x10b981);
            b1.setCompleted('PHASE ROTATION', 'L1-L2-L3 CW PASS');
            return 'Fluke 9040: Phase rotation sequence verified Clockwise (L1-L2-L3).';
          }
        };

        stepInteractiveMap[2] = {
          name: 'ac_disconnect_switch',
          title: 'AC DISCONNECT',
          actionLabel: 'EXECUTE: 2. CLOSE AC SWITCH',
          instructionEn: 'Throw 480V 3-phase AC knife switch handle to energized position.',
          instructionHi: '480V 3-फेज एसी डिस्कनेक्ट स्विच का हैंडल चालू करें।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0.55, 1.35, -0.78), offset: new THREE.Vector3(0, 0.25, 0.6) },
          telemetryUpdates: { p1: { label: 'Grid Voltage', value: '480.0 V 3-PHASE' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            leverGroup.rotation.z = -0.6; // Handle snaps down to ON!
            b2.setCompleted('AC DISCONNECT', '480V 3-PHASE ENERGIZED');
            return '480V 3-Phase AC disconnect closed. Line energized.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'mppt_dc_switch',
          title: 'MPPT ENGAGE',
          actionLabel: 'EXECUTE: 3. ENGAGE MPPT',
          instructionEn: 'Rotate DC MPPT string isolator knob 90° to connect PV array.',
          instructionHi: 'पीवी ऐरे जोड़ने के लिए डीसी एमपीपीटी स्विच घुमाएं।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0, 1.15, -0.7), offset: new THREE.Vector3(0, 0.25, 0.6) },
          telemetryUpdates: { p1: { label: 'DC Voltage', value: '620.0 V MPPT' } },
          execute: (app) => {
            if (snd && snd.playRotaryClick) snd.playRotaryClick();
            swKnob.rotation.z = Math.PI / 2;
            b3.setCompleted('MPPT DC INPUT', '620V DC STRINGS ACTIVE');
            return 'MPPT DC isolator engaged. 620V array voltage connected.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'commercial_inverter',
          title: 'INVERTER BOOT',
          actionLabel: 'EXECUTE: 4. BOOT INVERTER',
          instructionEn: 'Observe inverter DSP/MCU boot sequence and frequency sync (60.02 Hz).',
          instructionHi: 'इन्वर्टर डीएसपी/एमसीयू बूट क्रम और ग्रिड फ्रीक्वेंसी की पुष्टि करें।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0, 1.45, -0.7), offset: new THREE.Vector3(0, 0.2, 0.6) },
          telemetryUpdates: { p2: { label: 'Grid Freq', value: '60.02 Hz // 49.8 kW' } },
          execute: (app) => {
            if (snd && snd.playSuccessChime) snd.playSuccessChime();
            lcd.material.color.setHex(0x38bdf8);
            b4.setCompleted('INVERTER BOOT', '49.8 kW // 60.02 Hz ACTIVE');
            return 'Inverter DSP/MCU booted. Operating at 49.8 kW / 60.02 Hz.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'grid_sync_relay',
          title: 'GRID SYNC',
          actionLabel: 'EXECUTE: 5. SYNC GRID RELAY',
          instructionEn: 'Trigger automatic 60.0 Hz phase-lock grid synchronization relay.',
          instructionHi: 'स्वचालित 60.0 Hz ग्रिड सिंक्रोनाइज़ेशन रिले को सक्रिय करें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0, 1.45, -0.7), offset: new THREE.Vector3(0, 0.3, 0.9) },
          telemetryUpdates: { p3: { label: 'Phase Lock', value: 'SYNCED // 60.00 Hz' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            syncLed.material.color.setHex(0x00ff88);
            b5.setCompleted('GRID SYNC', 'PHASE-LOCK RELAY CLOSED');
            return 'Phase-lock loop synchronized. Grid interconnection relay closed.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'anti_islanding_test_button',
          title: 'ANTI-ISLANDING',
          actionLabel: 'EXECUTE: 6. TEST OUTAGE TRIP',
          instructionEn: 'Trigger simulated utility trip and verify shutdown under 2.0s.',
          instructionHi: 'ग्रिड आउटेज सिम्युलेट करें और 2.0s के भीतर शटडाउन सत्यापित करें।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(0, 1.45, -0.7), offset: new THREE.Vector3(0, 0.25, 0.6) },
          telemetryUpdates: { p4: { label: 'Anti-Islanding', value: '1.4s (<2.0s PASS)' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            btnPush.position.z = 0.02;
            b6.setCompleted('ANTI-ISLANDING', 'TRIP PASS: 1.4s (<2.0s IEEE 1547)');
            return 'Anti-islanding disconnect verified at 1.4s (IEEE 1547 compliant).';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 6. SUB-LOTO-01: 13.8kV Utility Substation Yard & Arc Flash Perimeter
      // ---------------------------------------------------------------------
      else if (code.includes('LOTO') || code.includes('SUB_MOD_01') || code.includes('SUB-LOTO')) {
        defaultCameraPos.set(0, 1.8, 2.0);
        defaultControlsTarget.set(0, 1.3, -0.6);

        const gravelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), gravelMat);
        ground.rotation.x = -Math.PI / 2;
        parentGroup.add(ground);

        const circleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.18, 64), circleMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        ring.name = 'arc_flash_boundary_ring';
        parentGroup.add(ring);
        interactiveObjects.push(ring);

        const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.25 });
        const gantry = new THREE.Group();
        gantry.position.set(0, 0, -1.8);

        [-1.2, 1.2].forEach(x => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.8, 0.14), steelMat);
          col.position.set(x, 1.9, 0);
          gantry.add(col);
        });
        const beam = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 0.18), steelMat);
        beam.position.set(0, 3.6, 0);
        gantry.add(beam);

        const insMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2 });
        [-0.7, 0, 0.7].forEach(x => {
          for (let k = 0; k < 3; k++) {
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.06, 16), insMat);
            disc.position.set(x, 3.35 - k * 0.08, 0);
            gantry.add(disc);
          }
        });
        parentGroup.add(gantry);

        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, wireframe: true });
        const fenceL = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), fenceMat);
        fenceL.position.set(-1.8, 1.1, 0.4);
        const fenceR = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.2), fenceMat);
        fenceR.position.set(1.8, 1.1, 0.4);

        const gateDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), fenceMat);
        gateDoor.position.set(0, 1.1, 0.4);
        parentGroup.add(fenceL, fenceR, gateDoor);

        const signMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.35), signMat);
        sign.position.set(-1.2, 1.6, 0.42);
        sign.name = 'substation_perimeter_signs';
        parentGroup.add(sign);
        interactiveObjects.push(sign);

        const kirkGroup = new THREE.Group();
        kirkGroup.position.set(0.55, 1.2, 0.45);
        const kirkBox = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
        const key = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        key.rotation.z = Math.PI / 2;
        key.position.set(0.04, 0, 0);
        kirkGroup.add(kirkBox, key);
        kirkGroup.name = 'kirk_key_interlock';
        parentGroup.add(kirkGroup);
        interactiveObjects.push(kirkGroup);

        const ppeVisor = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 16, 16, 0, Math.PI, 0, Math.PI / 2),
          new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.9, opacity: 0.0, transparent: true })
        );
        ppeVisor.position.set(0, 1.4, 0.8);
        parentGroup.add(ppeVisor);

        const stickGroup = new THREE.Group();
        stickGroup.position.set(0.65, 0.8, 0.1);
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }));
        stick.rotation.z = 0.2;
        stickGroup.add(stick);
        stickGroup.name = 'hot_stick_tool';
        parentGroup.add(stickGroup);
        interactiveObjects.push(stickGroup);

        const detGroup = new THREE.Group();
        detGroup.position.set(0.5, 0.8, 0.1);
        const det = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.05), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        detGroup.add(det);
        detGroup.name = 'proximity_voltage_detector';
        parentGroup.add(detGroup);
        interactiveObjects.push(detGroup);

        const b1 = attachStepBadge(1, 'PERIMETER INSPECT', 'Inspect warning signs & fencing', new THREE.Vector3(-1.2, 1.8, 0.42), parentGroup);
        const b2 = attachStepBadge(2, 'INTERLOCK KEY', 'Turn Kirk key to open gate', new THREE.Vector3(0.55, 1.45, 0.45), parentGroup);
        const b3 = attachStepBadge(3, 'DON PPE CAT 4', 'Equip 40 cal arc flash suit', new THREE.Vector3(0, 1.6, 0.8), parentGroup);
        const b4 = attachStepBadge(4, 'ARC BOUNDARY', 'Demarcate 4.2m Category 4 perimeter', new THREE.Vector3(0, 0.8, -1.8), parentGroup);
        const b5 = attachStepBadge(5, 'HOT STICK PREP', 'Extend 8ft fiberglass stick', new THREE.Vector3(0.65, 1.6, 0.1), parentGroup);
        const b6 = attachStepBadge(6, 'VOLTAGE TEST', 'Proximity detector (<50V safe)', new THREE.Vector3(0.5, 1.2, 0.1), parentGroup);

        stepInteractiveMap[1] = {
          name: 'substation_perimeter_signs',
          title: 'PERIMETER INSPECT',
          actionLabel: 'EXECUTE: 1. INSPECT SIGNS',
          instructionEn: 'Inspect perimeter warning placards and fence grounding integrity.',
          instructionHi: 'सबस्टेशन परिधि चेतावनी संकेतों और अर्थिंग का निरीक्षण करें।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0, 1.3, 0.0), offset: new THREE.Vector3(0, 0.5, 2.0) },
          telemetryUpdates: { p4: { label: 'Perimeter', value: 'GROUNDED PASS' } },
          execute: (app) => {
            if (snd && snd.playScanTone) snd.playScanTone();
            sign.material.color.setHex(0x10b981);
            b1.setCompleted('PERIMETER INSPECT', 'WARNINGS & GROUNDING VERIFIED');
            return 'Substation perimeter hazard placards verified. Fencing bonded.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'kirk_key_interlock',
          title: 'KIRK INTERLOCK',
          actionLabel: 'EXECUTE: 2. OPERATE INTERLOCK',
          instructionEn: 'Turn Kirk trapped key interlock to mechanical unlock gate.',
          instructionHi: 'किर्क ट्रैप्ड की इंटरलॉक घुमाकर गेट अनलॉक करें।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0, 1.2, 0.4), offset: new THREE.Vector3(0, 0.3, 1.0) },
          telemetryUpdates: { p3: { label: 'Trapped Key', value: 'KEY EXTRACTED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            key.rotation.x = Math.PI / 2;
            gateDoor.position.x = -1.0; // Gate swings open!
            b2.setCompleted('KIRK INTERLOCK', 'GATE UNLOCKED & OPEN');
            return 'Kirk key rotated 90°. Gate interlock bolt retracted.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'arc_flash_boundary_ring',
          title: 'DON CAT 4 PPE',
          actionLabel: 'EXECUTE: 3. EQUIP CAT 4 PPE',
          instructionEn: 'Don full 40 cal/cm² arc flash suit, hood with air supply, and gloves.',
          instructionHi: '40 cal/cm² आर्क फ्लैश सूट और सुरक्षा उपकरण पहनें।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0, 1.3, -0.4), offset: new THREE.Vector3(0, 0.3, 1.2) },
          telemetryUpdates: { p4: { label: 'PPE Rating', value: '40 cal/cm² ACTIVE' } },
          execute: (app) => {
            if (snd && snd.playAirHiss) snd.playAirHiss();
            ppeVisor.material.opacity = 0.55; // Protective visor activates!
            b3.setCompleted('DON CAT 4 PPE', '40 cal/cm² SUIT & VISOR ACTIVE');
            return 'Category 4 PPE donned: 40 cal/cm² suit, hood, and Class 4 gloves.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'arc_flash_boundary_ring',
          title: 'ARC BOUNDARY',
          actionLabel: 'EXECUTE: 4. DEMARCATE LINE',
          instructionEn: 'Demarcate 4.2-meter Category 4 arc flash boundary zone.',
          instructionHi: '4.2 मीटर आर्क फ्लैश बाउंड्री लाइन स्थापित करें।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0, 0.8, -1.8), offset: new THREE.Vector3(0, 1.8, 2.8) },
          telemetryUpdates: { p3: { label: 'Arc Boundary', value: '4.2 METERS PASS' } },
          execute: (app) => {
            if (snd && snd.playScanTone) snd.playScanTone();
            ring.material.color.setHex(0x10b981);
            b4.setCompleted('ARC BOUNDARY', '4.2m BOUNDARY CONFIRMED');
            return '4.2-meter Category 4 arc flash boundary demarcated.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'hot_stick_tool',
          title: 'HOT STICK PREP',
          actionLabel: 'EXECUTE: 5. EXTEND STICK',
          instructionEn: 'Inspect and extend 8ft fiberglass insulating hot stick.',
          instructionHi: '8ft फाइबरग्लास इंसुलेटेड हॉट स्टिक का निरीक्षण करें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0.4, 1.6, -1.2), offset: new THREE.Vector3(0, 0.4, 1.4) },
          telemetryUpdates: { p1: { label: 'Hot Stick', value: '8ft RATED (100kV/ft)' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            stick.scale.set(1, 1.4, 1);
            stickGroup.position.set(0, 2.2, -1.2);
            b5.setCompleted('HOT STICK', '8ft FIBERGLASS EXTENDED');
            return '8-foot high-voltage hot stick extended and locked.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'proximity_voltage_detector',
          title: 'PROXIMITY TEST',
          actionLabel: 'EXECUTE: 6. TEST VOLTAGE',
          instructionEn: 'Probe 13.8kV busbar with non-contact proximity detector.',
          instructionHi: 'नॉन-कॉन्टैक्ट डिटेक्टर से 13.8kV बसबार का शून्य विभव जांचें।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(0, 2.8, -1.8), offset: new THREE.Vector3(0, -0.3, 1.8) },
          telemetryUpdates: { p1: { label: '13.8kV Bus', value: '0.00 V (DE-ENERGIZED)' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            det.material.color.setHex(0x10b981);
            detGroup.position.set(0, 3.2, -1.8);
            b6.setCompleted('VOLTAGE TEST', '13.8kV BUS 0.00V SAFE (<50V)');
            return 'Non-contact test confirmed: 13.8kV bus de-energized (<50V).';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 7. SUB-SW-02: SF6 Circuit Breaker & Gang Air Disconnect
      // ---------------------------------------------------------------------
      else if (code.includes('SW') || code.includes('SUB_MOD_02') || code.includes('AIR')) {
        defaultCameraPos.set(0, 1.6, 1.6);
        defaultControlsTarget.set(0, 1.2, -0.6);

        const tankMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.95, 24), tankMat);
        tank.position.set(0, 1.2, -0.6);
        parentGroup.add(tank);

        const gaugeGroup = new THREE.Group();
        gaugeGroup.position.set(-0.35, 1.35, -0.6);
        const gDial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        gDial.rotation.z = Math.PI / 2;
        const gTex = createTextCanvasTexture('0.62 MPa', '#0f172a', '#10b981', 256, 64, 'bold 22px monospace');
        const gLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.05), new THREE.MeshBasicMaterial({ map: gTex }));
        gLabel.rotation.y = -Math.PI / 2;
        gLabel.position.x = -0.012;
        gaugeGroup.add(gDial, gLabel);
        gaugeGroup.name = 'sf6_gas_density_gauge';
        parentGroup.add(gaugeGroup);
        interactiveObjects.push(gaugeGroup);

        const tripBtnGroup = new THREE.Group();
        tripBtnGroup.position.set(0, 1.35, -0.27);
        const tripBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        tripBtn.rotation.x = Math.PI / 2;
        tripBtnGroup.add(tripBtn);
        tripBtnGroup.name = 'breaker_trip_pushbutton';
        parentGroup.add(tripBtnGroup);
        interactiveObjects.push(tripBtnGroup);

        const springFlag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        springFlag.position.set(0.12, 1.35, -0.27);
        springFlag.name = 'spring_discharge_indicator';
        parentGroup.add(springFlag);
        interactiveObjects.push(springFlag);

        const handleGroup = new THREE.Group();
        handleGroup.position.set(0.38, 0.95, -0.6);
        const hPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        handleGroup.add(hPipe);
        handleGroup.name = 'gang_operating_handle';
        parentGroup.add(handleGroup);
        interactiveObjects.push(handleGroup);

        const bladeGroup = new THREE.Group();
        bladeGroup.position.set(0, 2.0, -0.6);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 });
        [-0.4, 0, 0.4].forEach(x => {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.015), bladeMat);
          blade.position.set(x, 0.22, 0);
          bladeGroup.add(blade);
        });
        bladeGroup.name = 'air_disconnect_blades';
        parentGroup.add(bladeGroup);
        interactiveObjects.push(bladeGroup);

        const lotoHasp = new THREE.Group();
        lotoHasp.position.set(0.5, 0.8, -0.2); // Sits on bench initially
        const haspBody = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        lotoHasp.add(haspBody);
        lotoHasp.name = 'loto_padlock_hasp';
        parentGroup.add(lotoHasp);
        interactiveObjects.push(lotoHasp);

        const b1 = attachStepBadge(1, 'SF6 GAUGE', 'Inspect 0.62 MPa nominal pressure', new THREE.Vector3(-0.35, 1.5, -0.6), parentGroup);
        const b2 = attachStepBadge(2, 'TRIP BREAKER', 'Depress mechanical trip button', new THREE.Vector3(0, 1.5, -0.27), parentGroup);
        const b3 = attachStepBadge(3, 'DISCHARGE SPRING', 'Verify zero stored energy', new THREE.Vector3(0.12, 1.5, -0.27), parentGroup);
        const b4 = attachStepBadge(4, 'CRANK HANDLE', 'Rotate gang operating pipe', new THREE.Vector3(0.38, 1.3, -0.6), parentGroup);
        const b5 = attachStepBadge(5, '450mm AIR GAP', 'Visual inspection of open blades', new THREE.Vector3(0, 2.4, -0.6), parentGroup);
        const b6 = attachStepBadge(6, 'LOTO PADLOCK', 'Lock red hasp & danger tag', new THREE.Vector3(0.38, 1.1, -0.6), parentGroup);

        stepInteractiveMap[1] = {
          name: 'sf6_gas_density_gauge',
          title: 'SF6 GAUGE',
          actionLabel: 'EXECUTE: 1. INSPECT SF6',
          instructionEn: 'Confirm SF6 gas density in nominal green band (0.62 MPa).',
          instructionHi: 'एसएफ6 गैस डेंसिटी सामान्य ग्रीन बैंड (0.62 MPa) में जांचें।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(-0.35, 1.35, -0.6), offset: new THREE.Vector3(-0.4, 0.2, 0.5) },
          telemetryUpdates: { p1: { label: 'SF6 Gas Pressure', value: '0.62 MPa PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            b1.setCompleted('SF6 GAUGE', '0.62 MPa NOMINAL PASS');
            return 'SF6 density verified: 0.62 MPa nominal operating zone.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'breaker_trip_pushbutton',
          title: 'TRIP BREAKER',
          actionLabel: 'EXECUTE: 2. TRIP BREAKER',
          instructionEn: 'Depress mechanical red TRIP pushbutton to open contacts.',
          instructionHi: 'कॉन्टैक्ट्स खोलने के लिए लाल ट्रिप बटन दबाएं।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0, 1.35, -0.27), offset: new THREE.Vector3(0, 0.25, 0.6) },
          telemetryUpdates: { p2: { label: 'Breaker Status', value: 'TRIPPED / OPEN' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            tripBtn.position.z = -0.01;
            b2.setCompleted('TRIP BREAKER', 'SF6 CONTACTS OPEN');
            return 'SF6 circuit breaker mechanically tripped. Contacts OPEN.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'spring_discharge_indicator',
          title: 'SPRING DISCHARGE',
          actionLabel: 'EXECUTE: 3. CHECK SPRING',
          instructionEn: 'Verify closing spring discharge flag indicates DISCHARGED.',
          instructionHi: 'स्प्रिंग डिस्चार्ज इंडिकेटर की स्थिति सत्यापित करें।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0.12, 1.35, -0.27), offset: new THREE.Vector3(0, 0.2, 0.5) },
          telemetryUpdates: { p2: { label: 'Mechanism Spring', value: 'DISCHARGED ZERO' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            springFlag.material.color.setHex(0x10b981);
            b3.setCompleted('SPRING STATUS', 'STORED ENERGY DISCHARGED');
            return 'Operating spring discharged. Zero stored mechanical energy.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'gang_operating_handle',
          title: 'CRANK GANG SWITCH',
          actionLabel: 'EXECUTE: 4. CRANK HANDLE',
          instructionEn: 'Rotate gang disconnect operating pipe handle to pivot blades.',
          instructionHi: '3-फेज डिस्कनेक्ट ऑपरेटिंग हैंडल को घुमाएं।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0.38, 0.95, -0.6), offset: new THREE.Vector3(0, 0.3, 0.7) },
          telemetryUpdates: { p3: { label: 'Operating Handle', value: '90° CRANKED' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            handleGroup.rotation.z = Math.PI / 2;
            b4.setCompleted('CRANK HANDLE', '90° MECHANICAL CRANK OK');
            return 'Gang disconnect operating pipe cranked 90°. Blades rotated.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'air_disconnect_blades',
          title: 'AIR-GAP INSPECTION',
          actionLabel: 'EXECUTE: 5. INSPECT AIR GAP',
          instructionEn: 'Visually verify full 450mm physical air gap on all 3 phases.',
          instructionHi: 'तीनों चरणों पर 450 मिमी का दृश्यमान एयर-गैप सत्यापित करें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0, 2.0, -0.6), offset: new THREE.Vector3(0, 0.2, 1.2) },
          telemetryUpdates: { p3: { label: 'Air-Gap Distance', value: '450 mm OPEN PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            bladeGroup.rotation.x = Math.PI / 2; // Blades swing 90 degrees open!
            b5.setCompleted('AIR GAP', '450mm AIR GAP CONFIRMED');
            return 'Visible 450mm open air-gap confirmed on phases A, B, and C.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'loto_padlock_hasp',
          title: 'LOTO PADLOCK',
          actionLabel: 'EXECUTE: 6. LOCK LOTO HASP',
          instructionEn: 'Attach OSHA red lockout hasp, danger tag, and padlock to handle.',
          instructionHi: 'ऑपरेटिंग हैंडल पर लाल लोटो हैस्प, टैग और ताला लगाएं।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(0.38, 0.95, -0.6), offset: new THREE.Vector3(0, 0.25, 0.6) },
          telemetryUpdates: { p4: { label: 'LOTO Status', value: 'LOCKED & TAGGED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            lotoHasp.position.set(0.38, 0.95, -0.6); // Locks onto handle
            b6.setCompleted('LOTO PADLOCK', 'OSHA RED HASP & TAG SECURED');
            return 'OSHA red LOTO hasp, padlock, and danger tag secured.';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 8. BESS-CELL-01: 16S LiFePO4 BESS Battery Energy Storage Rack
      // ---------------------------------------------------------------------
      else if (code.includes('BESS') || code.includes('CELL') || code.includes('RACK')) {
        defaultCameraPos.set(0, 1.4, 1.4);
        defaultControlsTarget.set(0, 1.1, -0.4);

        const rackCabinet = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 1.6, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
        );
        rackCabinet.position.set(0, 1.0, -0.5);
        parentGroup.add(rackCabinet);

        const tray = new THREE.Group();
        tray.position.set(0, 1.1, 0.25); // Starts slid out!
        const trayBase = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        tray.add(trayBase);

        const cellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.4 });
        const cellLeds = [];
        const caps = [];

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const cell = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.12), cellMat);
            const x = -0.24 + c * 0.16;
            const z = -0.21 + r * 0.14;
            cell.position.set(x, 0.11, z);

            const cLed = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), new THREE.MeshBasicMaterial({ color: 0x475569 }));
            cLed.position.set(x, 0.21, z);
            cellLeds.push(cLed);

            const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
            cap1.position.set(x - 0.03, 0.35, z); // Hovering high before torque!
            caps.push(cap1);

            tray.add(cell, cLed, cap1);
          }
        }
        tray.name = 'battery_tray_chassis';
        parentGroup.add(tray);
        interactiveObjects.push(tray);

        const busbarMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 });
        const busbarGroup = new THREE.Group();
        busbarGroup.position.y = 0.45; // Hovering high initially!
        for (let b = 0; b < 15; b++) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.02), busbarMat);
          bar.position.set(-0.24 + (b % 4) * 0.16, 0.22, -0.21 + Math.floor(b / 4) * 0.14);
          busbarGroup.add(bar);
        }
        tray.add(busbarGroup);

        const bmsBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        bmsBox.position.set(0.42, 1.1, -0.4);
        bmsBox.name = 'bms_controller';
        parentGroup.add(bmsBox);
        interactiveObjects.push(bmsBox);

        const ventPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        ventPipe.position.set(0, 1.7, -0.5);
        ventPipe.name = 'exhaust_relief_vent';
        parentGroup.add(ventPipe);
        interactiveObjects.push(ventPipe);

        const b1 = attachStepBadge(1, 'CELL HEALTH QC', 'Check 16-cell voltages (ΔV < 20mV)', new THREE.Vector3(0, 1.35, 0.25), parentGroup);
        const b2 = attachStepBadge(2, 'RACK TRAY', 'Slide 16S tray into 19" bay', new THREE.Vector3(0, 1.45, -0.3), parentGroup);
        const b3 = attachStepBadge(3, 'FLEX BUSBARS', 'Bolt 15x copper interconnects', new THREE.Vector3(0, 1.4, -0.4), parentGroup);
        const b4 = attachStepBadge(4, 'TORQUE FASTENERS', '12 N*m + 32 orange caps', new THREE.Vector3(0, 1.35, -0.4), parentGroup);
        const b5 = attachStepBadge(5, 'BMS HARNESS', 'Plug 16-pin voltage harness', new THREE.Vector3(0.42, 1.3, -0.4), parentGroup);
        const b6 = attachStepBadge(6, 'EXHAUST RELIEF', 'Verify burst disc & ducting', new THREE.Vector3(0, 1.95, -0.5), parentGroup);

        stepInteractiveMap[1] = {
          name: 'battery_tray_chassis',
          title: 'CELL HEALTH QC',
          actionLabel: 'EXECUTE: 1. QC 16 CELLS',
          instructionEn: 'Perform individual cell voltage health test across all 16 cells (ΔV < 20mV).',
          instructionHi: 'सभी 16 सेलों के वोल्टेज और संतुलन का परीक्षण करें (ΔV < 20mV)।',
          badgeMesh: b1,
          cameraFocus: { target: new THREE.Vector3(0, 0.95, -0.4), offset: new THREE.Vector3(0, 0.35, 0.7) },
          telemetryUpdates: { p2: { label: 'Cell Delta-V', value: '4 mV BALANCED' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            cellLeds.forEach(l => { l.material.color.setHex(0x10b981); });
            b1.setCompleted('CELL HEALTH QC', '16 CELLS BALANCED: ΔV = 4mV');
            return '16 LiFePO4 cells verified. Delta-V = 4mV (well under 20mV limit).';
          }
        };

        stepInteractiveMap[2] = {
          name: 'battery_tray_chassis',
          title: 'RACK TRAY',
          actionLabel: 'EXECUTE: 2. SLIDE TRAY',
          instructionEn: 'Slide 16S battery tray chassis into 19-inch steel server rack cabinet.',
          instructionHi: '16S बैटरी ट्रे को 19-इंच स्टील रैक कैबिनेट में स्लाइड करें।',
          badgeMesh: b2,
          cameraFocus: { target: new THREE.Vector3(0, 1.1, -0.5), offset: new THREE.Vector3(0, 0.4, 0.9) },
          telemetryUpdates: { p4: { label: 'Rack Mount', value: 'LATCHED IN BAY' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            tray.position.set(0, 1.1, -0.4); // Slides flush into cabinet!
            b2.setCompleted('RACK TRAY', '16S CHASSIS LATCHED IN BAY');
            return '16S battery tray slid into 19-inch rack and latched.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'battery_tray_chassis',
          title: 'FLEX BUSBARS',
          actionLabel: 'EXECUTE: 3. BOLT BUSBARS',
          instructionEn: 'Fasten 15 flexible nickel-plated multi-layer copper interconnects in series.',
          instructionHi: '15 लचीले तांबे के बसबारों को सीरीज में जोड़ें।',
          badgeMesh: b3,
          cameraFocus: { target: new THREE.Vector3(0, 1.1, -0.4), offset: new THREE.Vector3(0, 0.35, 0.7) },
          telemetryUpdates: { p1: { label: 'Busbar Link', value: '15x INTERCONNECTS' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            busbarGroup.position.y = 0; // Drops flush onto terminals
            b3.setCompleted('FLEX BUSBARS', '15x COPPER BUSBARS SECURED');
            return '15 flexible series busbars bolted across cell terminals.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'battery_tray_chassis',
          title: 'TORQUE FASTENERS',
          actionLabel: 'EXECUTE: 4. TORQUE & CAPS',
          instructionEn: 'Torque M6 flange nuts to 12.0 N·m and seat 32 orange insulating terminal caps.',
          instructionHi: 'टर्मिनल नट्स को 12.0 N*m पर कसें और नारंगी इंसुलेटिंग कैप लगाएं।',
          badgeMesh: b4,
          cameraFocus: { target: new THREE.Vector3(0, 1.1, -0.4), offset: new THREE.Vector3(0, 0.35, 0.7) },
          telemetryUpdates: { p4: { label: 'Busbar Torque', value: '12.0 N*m // 32 CAPS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            caps.forEach(c => { c.position.y = 0.22; }); // Caps lock down over studs
            b4.setCompleted('TORQUE FASTENERS', '12.0 N*m + 32 ORANGE CAPS');
            return 'M6 flange nuts torqued to 12.0 N·m. 32 orange caps locked.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'bms_controller',
          title: 'BMS HARNESS',
          actionLabel: 'EXECUTE: 5. PLUG BMS HARNESS',
          instructionEn: 'Plug 16-pin voltage sensing harness into master digital BMS controller.',
          instructionHi: '16-पिन वोल्टेज सेंसिंग हार्नेस को डिजिटल बीएमएस कंट्रोलर में प्लग करें।',
          badgeMesh: b5,
          cameraFocus: { target: new THREE.Vector3(0.4, 1.1, -0.4), offset: new THREE.Vector3(0, 0.3, 0.6) },
          telemetryUpdates: { p1: { label: 'Pack Voltage', value: '51.24 V DC' } },
          execute: (app) => {
            if (snd && snd.playSuccessChime) snd.playSuccessChime();
            bmsBox.material.color.setHex(0x10b981);
            b5.setCompleted('BMS HARNESS', '16-PIN PLUGGED // 51.24V ACTIVE');
            return '16-pin BMS voltage sensing harness plugged. Pack energized at 51.24V.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'exhaust_relief_vent',
          title: 'EXHAUST RELIEF',
          actionLabel: 'EXECUTE: 6. CHECK EXHAUST VENT',
          instructionEn: 'Inspect deflagration burst disc and active thermal extraction ducting.',
          instructionHi: 'डिफ्लैग्रेशन बर्स्ट डिस्क और थर्मल डक्टिंग का निरीक्षण करें।',
          badgeMesh: b6,
          cameraFocus: { target: new THREE.Vector3(0, 1.7, -0.5), offset: new THREE.Vector3(0, 0.3, 0.9) },
          telemetryUpdates: { p3: { label: 'Rack Temp', value: '23.4 °C NOMINAL' } },
          execute: (app) => {
            if (snd && snd.playAirHiss) snd.playAirHiss();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
            ventPipe.material.color.setHex(0x10b981);
            b6.setCompleted('EXHAUST RELIEF', 'DEFLAGRATION DISC CERTIFIED');
            return 'Deflagration burst disc and thermal ducting verified.';
          }
        };
      }

      return {
        interactiveObjects,
        stepInteractiveMap,
        defaultCameraPos,
        defaultControlsTarget
      };
    }
  };
`;

const updatedModelsContent = prefix + newBuilderCode + '\n' + suffix;
fs.writeFileSync(modelsPath, updatedModelsContent, 'utf8');
console.log('Successfully upgraded equipment_models.js with high-fidelity visual practice processes!');
