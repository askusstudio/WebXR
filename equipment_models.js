// equipment_models.js - High-Fidelity 3D Simulation & Exploded View Builders for all 8 MAYAVUE Modules
// Modules:
// 1. SOLAR-ROOF-01 (racking)        - Rooftop Structural Racking & Sun Angle Irradiance Lab
// 2. SOLAR-MOUNT-02 (panel_clamp)   - Bifacial PV Panel Mechanical Mounting & Calibrated Clamp Torquing Station
// 3. SOLAR-DC-03 (mc4_connector)    - DC String Wiring, Cable Stripping & MC4 Connector Crimp Lab
// 4. SOLAR-BOX-01 (combiner_box)    - Substation Combiner Box Safe Isolation, Blown Fuse Replacement & Battery Lab
// 5. SOLAR-GRID-05 (inverter)       - Commercial 3-Phase Utility Inverter Commissioning & Grid Interconnection Lab
// 6. SUB-LOTO-01 (substation_bay)   - 13.8kV Utility Substation Yard, Security Gate & Arc Flash Perimeter Lab
// 7. SUB-SW-02 (air_disconnect)     - SF6 Gas Circuit Breaker De-energization & 3-Phase Gang Air Disconnect Lab
// 8. BESS-CELL-01 (battery_rack)    - Commercial 16S LiFePO4 BESS Battery Energy Storage Rack & BMS Balancing Lab

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MAYAVUE_MODELS = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Procedural texture utilities
  function createTextCanvasTexture(text, bg = '#0f172a', fg = '#38bdf8', w = 256, h = 64, font = 'bold 16px monospace') {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, w - 4, h - 4);
    ctx.fillStyle = fg;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function createSolarWaferTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep silicon blue background
    ctx.fillStyle = '#081d3d';
    ctx.fillRect(0, 0, 512, 512);

    // Grid of solar cells (6 rows x 4 cols)
    const rows = 6, cols = 4;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Cell border with chamfered corners
        ctx.fillStyle = '#0c2752';
        ctx.fillRect(x + 2, y + 2, cellW - 4, cellH - 4);

        // Fine silver finger lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 0.5;
        for (let fy = y + 4; fy < y + cellH - 4; fy += 6) {
          ctx.beginPath();
          ctx.moveTo(x + 4, fy);
          ctx.lineTo(x + cellW - 4, fy);
          ctx.stroke();
        }

        // Multi-busbars (3 vertical silver lines)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        [0.25, 0.5, 0.75].forEach(ratio => {
          ctx.beginPath();
          ctx.moveTo(x + cellW * ratio, y + 2);
          ctx.lineTo(x + cellW * ratio, y + cellH - 2);
          ctx.stroke();
        });
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // =========================================================================
  // EXPLODED VIEW BUILDERS (STAGE 3 THEORY & 3D PREP)
  // =========================================================================
  const ExplodedViewBuilder = {
    build(viewType, scene, THREE) {
      const explodeGroup = new THREE.Group();
      scene.add(explodeGroup);

      let parts = [];
      let labelText = '';

      switch (viewType) {
        // -------------------------------------------------------------
        // 1. RACKING: Rooftop Structural Racking
        // -------------------------------------------------------------
        case 'racking': {
          labelText = 'Roof Tile Sub-Base • L-Feet Aluminum Brackets • Dual Unistrut Rails • M10 Lag Screws • Class A Pyranometer';

          // Roof tile slab
          const tileMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
          const tile = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.5), tileMat);
          tile.position.set(0, -0.15, 0);
          explodeGroup.add(tile);

          // 2x L-Feet brackets
          const lMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.25 });
          const lFeet = [];
          [-0.2, 0.2].forEach(x => {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.08), lMat);
            foot.position.set(x, -0.06, 0);
            explodeGroup.add(foot);
            lFeet.push(foot);
          });

          // 2x Unistrut rails
          const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
          const rails = [];
          [-0.08, 0.08].forEach(z => {
            const r = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.04), railMat);
            r.position.set(0, 0.04, z);
            explodeGroup.add(r);
            rails.push(r);
          });

          // 4x Lag bolts
          const boltMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
          const bolts = [];
          [-0.22, -0.18, 0.18, 0.22].forEach(x => {
            const b = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.07, 12), boltMat);
            b.position.set(x, 0.12, 0);
            explodeGroup.add(b);
            bolts.push(b);
          });

          // Pyranometer sensor
          const pyrGroup = new THREE.Group();
          const pyrBase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 }));
          const pyrDome = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.9, opacity: 0.6, transparent: true }));
          pyrDome.position.y = 0.02;
          pyrGroup.add(pyrBase, pyrDome);
          pyrGroup.position.set(0, 0.18, 0.08);
          explodeGroup.add(pyrGroup);

          parts = {
            explode(factor) {
              lFeet.forEach(lf => { lf.position.y = -0.06 + factor * 0.08; });
              rails.forEach((r, i) => { r.position.y = 0.04 + factor * 0.18; r.position.z = (i === 0 ? -0.08 : 0.08) * (1 + factor * 0.5); });
              bolts.forEach(b => { b.position.y = 0.12 + factor * 0.25; });
              pyrGroup.position.y = 0.18 + factor * 0.35;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 2. PANEL_CLAMP: Bifacial PV Panel & Mounting Clamp
        // -------------------------------------------------------------
        case 'panel_clamp': {
          labelText = 'Unistrut 41x41 Support Rail • Left 550W Panel Frame • Right 550W Panel Frame • WEEB Bonding Clip • Anodized Mid-Clamp • M8 Hex-Socket Bolt';

          const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.06), railMat);
          rail.position.set(0, -0.1, 0);
          explodeGroup.add(rail);

          const pvTex = createSolarWaferTexture();
          const pvMat = new THREE.MeshStandardMaterial({ map: pvTex, roughness: 0.3, metalness: 0.6 });
          const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });

          // Left panel
          const pLeft = new THREE.Group();
          const pLBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.38), pvMat);
          const pLFrame = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.035, 0.40), frameMat);
          pLBody.position.y = 0.005;
          pLeft.add(pLFrame, pLBody);
          pLeft.position.set(-0.18, -0.02, 0);
          explodeGroup.add(pLeft);

          // Right panel
          const pRight = new THREE.Group();
          const pRBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.025, 0.38), pvMat);
          const pRFrame = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.035, 0.40), frameMat);
          pRBody.position.y = 0.005;
          pRight.add(pRFrame, pRBody);
          pRight.position.set(0.18, -0.02, 0);
          explodeGroup.add(pRight);

          // WEEB grounding clip
          const weebMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.1 });
          const weeb = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.006, 0.045), weebMat);
          weeb.position.set(0, 0.03, 0);
          explodeGroup.add(weeb);

          // Mid-clamp
          const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
          const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.05), clampMat);
          clamp.position.set(0, 0.08, 0);
          explodeGroup.add(clamp);

          // M8 Bolt
          const boltMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.1 });
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 16), boltMat);
          const boltHead = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), boltMat);
          boltHead.position.y = 0.04;
          const boltGroup = new THREE.Group();
          boltGroup.add(bolt, boltHead);
          boltGroup.position.set(0, 0.17, 0);
          explodeGroup.add(boltGroup);

          parts = {
            explode(factor) {
              pLeft.position.x = -0.18 - factor * 0.15;
              pRight.position.x = 0.18 + factor * 0.15;
              weeb.position.y = 0.03 + factor * 0.08;
              clamp.position.y = 0.08 + factor * 0.18;
              boltGroup.position.y = 0.17 + factor * 0.28;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 3. MC4_CONNECTOR: DC Cable & MC4 Crimp Assembly
        // -------------------------------------------------------------
        case 'mc4_connector': {
          labelText = 'PV1-F 6mm² Double-Insulated Cable • Tinned Multi-Strand Core • Gold-Plated MC4 Pin • Silicone Sealing Gland • IP68 Housing Body • Cable Gland Nut';

          // Cable
          const cableMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
          const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
          const cableGroup = new THREE.Group();
          const jacket = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 16), cableMat);
          jacket.rotation.z = Math.PI / 2;
          const copper = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 12), copperMat);
          copper.rotation.z = Math.PI / 2;
          copper.position.x = 0.14;
          cableGroup.add(jacket, copper);
          cableGroup.position.set(-0.25, 0, 0);
          explodeGroup.add(cableGroup);

          // Gland nut
          const nutMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
          const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.05, 16), nutMat);
          nut.rotation.z = Math.PI / 2;
          nut.position.set(-0.15, 0, 0);
          explodeGroup.add(nut);

          // Silicone grommet seal
          const sealMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
          const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 16), sealMat);
          seal.rotation.z = Math.PI / 2;
          seal.position.set(-0.07, 0, 0);
          explodeGroup.add(seal);

          // Gold-plated contact pin
          const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.15 });
          const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.07, 16), goldMat);
          pin.rotation.z = Math.PI / 2;
          pin.position.set(0.03, 0, 0);
          explodeGroup.add(pin);

          // Main MC4 connector body
          const housingMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.18, 16), housingMat);
          body.rotation.z = Math.PI / 2;
          body.position.set(0.18, 0, 0);
          explodeGroup.add(body);

          parts = {
            explode(factor) {
              cableGroup.position.x = -0.25 - factor * 0.18;
              nut.position.x = -0.15 - factor * 0.12;
              seal.position.x = -0.07 - factor * 0.06;
              pin.position.x = 0.03 + factor * 0.14;
              body.position.x = 0.18 + factor * 0.22;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 4. COMBINER_BOX: Combiner Box & Fuses (Standard)
        // -------------------------------------------------------------
        case 'combiner_box': {
          labelText = 'Slotted 35mm DIN Rail • Touch-Safe Finger-Proof Fuse Carriers • 15A 1000V DC gPV Fuses • Rotary DC Isolator Knob';

          const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
          const dinRail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.035, 0.015), railMat);
          explodeGroup.add(dinRail);

          const holderMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
          const holders = [];
          [-0.15, -0.05, 0.05, 0.15].forEach(x => {
            const h = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.055), holderMat);
            h.position.set(x, 0.03, 0.03);
            explodeGroup.add(h);
            holders.push(h);
          });

          const fuseMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.4, roughness: 0.2 });
          const capMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95 });
          const fuses = [];
          [-0.15, -0.05, 0.05, 0.15].forEach((x, i) => {
            const fg = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.038, 16), fuseMat);
            const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 16), capMat);
            cap1.position.y = 0.017;
            const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0075, 0.008, 16), capMat);
            cap2.position.y = -0.017;
            if (i === 2) {
              // Mark blown fuse with dark ring
              const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.0072, 0.0072, 0.01, 16), new THREE.MeshBasicMaterial({ color: 0x18181b }));
              fg.add(ring);
            }
            fg.add(body, cap1, cap2);
            fg.position.set(x, 0.03, 0.04);
            explodeGroup.add(fg);
            fuses.push(fg);
          });

          const switchMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
          const switchKnob = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16), switchMat);
          switchKnob.rotation.x = Math.PI / 2;
          switchKnob.position.set(0, 0.03, 0.1);
          explodeGroup.add(switchKnob);

          parts = {
            explode(factor) {
              holders.forEach(h => { h.position.z = 0.03 + factor * 0.12; });
              fuses.forEach((f, i) => {
                f.position.z = 0.04 + factor * 0.25;
                f.position.y = 0.03 + factor * (0.05 + i * 0.02);
              });
              switchKnob.position.z = 0.1 + factor * 0.35;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 5. INVERTER: Commercial 3-Phase Inverter
        // -------------------------------------------------------------
        case 'inverter': {
          labelText = 'Rear Heavy-Duty Heatsink • Power Electronics Stage • Front IP65 Enclosure • Backlit Graphic LCD Bezel • 3-Phase Rotary AC Handle';

          // Rear heatsink
          const hsMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });
          const heatsink = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.60, 0.05), hsMat);
          heatsink.position.set(0, 0, -0.08);
          explodeGroup.add(heatsink);

          // PCB Power electronics
          const pcbMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.5 });
          const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.02), pcbMat);
          explodeGroup.add(pcb);

          // Capacitors on PCB
          [-0.1, 0.1].forEach(x => {
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 }));
            cap.position.set(x, 0.12, 0.03);
            pcb.add(cap);
          });

          // Front casing
          const caseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
          const frontCase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.04), caseMat);
          frontCase.position.set(0, 0, 0.08);
          explodeGroup.add(frontCase);

          // LCD bezel
          const lcdMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
          const lcd = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.015), lcdMat);
          const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.09), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
          screen.position.z = 0.009;
          lcd.add(screen);
          lcd.position.set(0, 0.14, 0.14);
          explodeGroup.add(lcd);

          // AC Rotary switch handle
          const switchH = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
          switchH.rotation.x = Math.PI / 2;
          switchH.position.set(0.14, -0.15, 0.16);
          explodeGroup.add(switchH);

          parts = {
            explode(factor) {
              heatsink.position.z = -0.08 - factor * 0.18;
              frontCase.position.z = 0.08 + factor * 0.18;
              lcd.position.z = 0.14 + factor * 0.30;
              switchH.position.z = 0.16 + factor * 0.40;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 6. SUBSTATION_BAY: 13.8kV Substation Bay
        // -------------------------------------------------------------
        case 'substation_bay': {
          labelText = 'Galvanized Structural Lattice Gantry • 13.8kV Disc Suspension Insulators • Tubular Aluminum Busbars • High-Voltage Palm Clamps • Copper Grounding Tape';

          // Structural steel column
          const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
          const column = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), steelMat);
          column.position.set(-0.25, 0, 0);
          explodeGroup.add(column);

          // Cross arm
          const crossArm = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.04), steelMat);
          crossArm.position.set(0, 0.28, 0);
          explodeGroup.add(crossArm);

          // 3x Insulator strings
          const insMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.1 });
          const insGroup = new THREE.Group();
          [-0.18, 0, 0.18].forEach(x => {
            const ins = new THREE.Group();
            for (let i = 0; i < 4; i++) {
              const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.015, 0.015, 16), insMat);
              disc.position.y = -i * 0.025;
              ins.add(disc);
            }
            ins.position.set(x, 0.26, 0);
            insGroup.add(ins);
          });
          explodeGroup.add(insGroup);

          // 3x Busbars
          const busMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
          const busbars = [];
          [-0.18, 0, 0.18].forEach(x => {
            const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 16), busMat);
            bus.rotation.x = Math.PI / 2;
            bus.position.set(x, 0.12, 0);
            explodeGroup.add(bus);
            busbars.push(bus);
          });

          // Palm clamps
          const clampMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 });
          const clamps = [];
          [-0.18, 0, 0.18].forEach(x => {
            const c = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.03), clampMat);
            c.position.set(x, 0.12, 0.08);
            explodeGroup.add(c);
            clamps.push(c);
          });

          parts = {
            explode(factor) {
              crossArm.position.y = 0.28 + factor * 0.08;
              insGroup.position.y = factor * -0.10;
              busbars.forEach((b, i) => { b.position.y = 0.12 - factor * 0.18; });
              clamps.forEach(c => { c.position.z = 0.08 + factor * 0.22; });
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 7. AIR_DISCONNECT: SF6 Breaker & Air Disconnect
        // -------------------------------------------------------------
        case 'air_disconnect': {
          labelText = 'Galvanized Mounting Channel • Station Post Insulators • Beryllium Copper Jaws • 450mm Visible Knife Blades • OSHA Scissor Lockout Hasp';

          const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
          const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.08), baseMat);
          baseFrame.position.set(0, -0.15, 0);
          explodeGroup.add(baseFrame);

          // 3x Insulator posts
          const postMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35 });
          const posts = [];
          [-0.2, 0, 0.2].forEach(x => {
            const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.18, 16), postMat);
            p.position.set(x, -0.04, 0);
            explodeGroup.add(p);
            posts.push(p);
          });

          // 3x Copper knife blades
          const copperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95, roughness: 0.2 });
          const blades = [];
          [-0.2, 0, 0.2].forEach(x => {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.22, 0.025), copperMat);
            b.position.set(x, 0.14, 0);
            explodeGroup.add(b);
            blades.push(b);
          });

          // Operating pipe handle & LOTO hasp
          const lotoMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
          const lotoHasp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.015), lotoMat);
          lotoHasp.position.set(0.28, -0.04, 0.06);
          explodeGroup.add(lotoHasp);

          parts = {
            explode(factor) {
              posts.forEach(p => { p.position.z = factor * -0.12; });
              blades.forEach((b, i) => {
                b.rotation.x = factor * (Math.PI * 0.45);
                b.position.z = factor * 0.15;
                b.position.y = 0.14 + factor * 0.05;
              });
              lotoHasp.position.z = 0.06 + factor * 0.28;
            }
          };
          break;
        }

        // -------------------------------------------------------------
        // 8. BATTERY_RACK: 16S LiFePO4 BESS Battery Module
        // -------------------------------------------------------------
        case 'battery_rack':
        default: {
          labelText = '19-Inch Steel Rack Chassis Tray • 16x 3.2V 280Ah LiFePO4 Cells • Flexible Nickel-Copper Busbars • Orange Insulator Caps • 16S Digital BMS Controller';

          // Tray
          const trayMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.35 });
          const tray = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.46), trayMat);
          tray.position.set(0, -0.14, 0);
          explodeGroup.add(tray);

          // 8 visible cell blocks representing 16S
          const cellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.25 });
          const cells = [];
          for (let i = 0; i < 8; i++) {
            const cx = -0.26 + (i % 4) * 0.17;
            const cz = i < 4 ? -0.10 : 0.10;
            const c = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.16), cellMat);
            c.position.set(cx, -0.01, cz);
            explodeGroup.add(c);
            cells.push(c);
          }

          // Busbars
          const busMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
          const busbars = [];
          for (let i = 0; i < 4; i++) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.006, 0.02), busMat);
            b.position.set(-0.18 + i * 0.14, 0.09, 0);
            explodeGroup.add(b);
            busbars.push(b);
          }

          // Orange touch-safe terminal caps
          const capMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
          const caps = [];
          for (let i = 0; i < 6; i++) {
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.014, 16), capMat);
            cap.position.set(-0.25 + i * 0.10, 0.12, (i % 2 === 0 ? 0.04 : -0.04));
            explodeGroup.add(cap);
            caps.push(cap);
          }

          // BMS Board
          const bmsMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4 });
          const bms = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.015, 0.08), bmsMat);
          bms.position.set(0, 0.10, 0.18);
          explodeGroup.add(bms);

          parts = {
            explode(factor) {
              cells.forEach((c, i) => {
                c.position.y = -0.01 + factor * 0.04;
                c.position.x = (-0.26 + (i % 4) * 0.17) * (1 + factor * 0.15);
              });
              busbars.forEach(b => { b.position.y = 0.09 + factor * 0.16; });
              caps.forEach(cap => { cap.position.y = 0.12 + factor * 0.28; });
              bms.position.z = 0.18 + factor * 0.18;
            }
          };
          break;
        }
      }

      return { group: explodeGroup, parts, labelText };
    }
  };

  // =========================================================================
  // MODULE VR SIMULATION EQUIPMENT BUILDERS (STAGE 4 VR SIMULATOR)
  // =========================================================================
  const ModuleEquipmentBuilder = {
    build(moduleCode, parentGroup, THREE, soundEngine) {
      // Clear previous equipment
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
      let defaultCameraPos = new THREE.Vector3(0, 1.4, 2.4);
      let defaultControlsTarget = new THREE.Vector3(0, 1.0, -0.4);

      const code = String(moduleCode || '').toUpperCase();

      // ---------------------------------------------------------------------
      // 1. SOLAR-ROOF-01: Rooftop Structural Racking & Sun Angle Irradiance Lab
      // ---------------------------------------------------------------------
      if (code.includes('ROOF') || code.includes('01') && !code.includes('LOTO') && !code.includes('BOX') && !code.includes('CELL')) {
        defaultCameraPos.set(0, 1.8, 1.4);
        defaultControlsTarget.set(0, 1.0, -0.4);

        // Roof deck base platform
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 2.8), roofMat);
        roofDeck.position.set(0, 0.7, -0.6);
        parentGroup.add(roofDeck);

        // OSHA Yellow perimeter line
        const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const border1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.06), yellowLineMat);
        border1.rotation.x = -Math.PI / 2;
        border1.position.set(0, 0.78, 0.6);
        parentGroup.add(border1);

        // Dual 4.2m extruded aluminum Unistrut structural rails tilted at 25 degrees
        const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
        const rackGroup = new THREE.Group();
        rackGroup.position.set(0, 0.9, -0.6);
        rackGroup.rotation.x = 0.436; // 25 degrees tilt

        [-0.45, 0.45].forEach(z => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.05, 0.05), railMat);
          rail.position.set(0, 0, z);
          rackGroup.add(rail);
        });

        // 4x Tilted L-Feet Brackets with stainless lag bolts
        [-1.0, 1.0].forEach(x => {
          [-0.45, 0.45].forEach(z => {
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), railMat);
            foot.position.set(x, -0.06, z);
            rackGroup.add(foot);
          });
        });
        parentGroup.add(rackGroup);

        // Precision Class A Pyranometer Sensor on tripod
        const pyrGroup = new THREE.Group();
        pyrGroup.position.set(0.9, 0.85, 0.2);

        // Tripod legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        for (let i = 0; i < 3; i++) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8), legMat);
          const angle = (i * Math.PI * 2) / 3;
          leg.position.set(Math.cos(angle) * 0.12, 0.18, Math.sin(angle) * 0.12);
          leg.rotation.z = Math.cos(angle) * 0.3;
          leg.rotation.x = Math.sin(angle) * 0.3;
          pyrGroup.add(leg);
        }

        // Sensor head & quartz glass dome
        const pyrBase = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        pyrBase.position.y = 0.4;
        const pyrDome = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.95, opacity: 0.65, transparent: true }));
        pyrDome.position.y = 0.425;

        // Digital solar meter readout
        const lcdTex = createTextCanvasTexture('885 W/m²', '#0284c7', '#ffffff', 256, 64, 'bold 24px monospace');
        const meterLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: lcdTex }));
        meterLcd.position.set(0, 0.32, 0.08);
        meterLcd.rotation.x = -0.3;

        pyrGroup.add(pyrBase, pyrDome, meterLcd);
        pyrGroup.name = 'pyranometer_sensor';
        parentGroup.add(pyrGroup);
        interactiveObjects.push(pyrGroup);

        // 25° Inclinometer dial gauge
        const incGroup = new THREE.Group();
        incGroup.position.set(-0.85, 0.95, -0.4);
        const incDial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
        incDial.rotation.x = Math.PI / 2;
        const incTex = createTextCanvasTexture('TILT: 25.2°', '#0f172a', '#10b981', 256, 64, 'bold 22px monospace');
        const incLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.05), new THREE.MeshBasicMaterial({ map: incTex }));
        incLabel.position.z = 0.012;
        incDial.add(incLabel);
        incGroup.add(incDial);
        incGroup.name = 'inclinometer_gauge';
        parentGroup.add(incGroup);
        interactiveObjects.push(incGroup);

        // Sun ray beam indicator
        const beamGeo = new THREE.CylinderGeometry(0.02, 0.35, 2.5, 16);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.25 });
        const sunBeam = new THREE.Mesh(beamGeo, beamMat);
        sunBeam.position.set(0, 2.2, -0.6);
        sunBeam.rotation.x = 0.436;
        parentGroup.add(sunBeam);
      }

      // ---------------------------------------------------------------------
      // 2. SOLAR-MOUNT-02: Bifacial PV Panel Mechanical Mounting
      // ---------------------------------------------------------------------
      else if (code.includes('MOUNT') || code.includes('02') && !code.includes('SW')) {
        defaultCameraPos.set(0, 1.5, 1.2);
        defaultControlsTarget.set(0, 0.95, -0.4);

        // Test bench
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.4), benchMat);
        bench.position.set(0, 0.72, -0.5);
        parentGroup.add(bench);

        // Aluminum mounting rails
        const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
        [-0.35, 0.35].forEach(z => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.045, 0.045), railMat);
          rail.position.set(0, 0.80, -0.5 + z);
          parentGroup.add(rail);
        });

        // Two 550W Bifacial PV Panels side by side
        const pvTex = createSolarWaferTexture();
        const pvMat = new THREE.MeshStandardMaterial({ map: pvTex, roughness: 0.3, metalness: 0.6 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 });

        [-0.52, 0.52].forEach(x => {
          const pGroup = new THREE.Group();
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 1.2), frameMat);
          const wafer = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 1.16), pvMat);
          wafer.position.y = 0.01;
          pGroup.add(frame, wafer);
          pGroup.position.set(x, 0.84, -0.5);
          parentGroup.add(pGroup);
        });

        // Mid-clamps securing panels
        const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
        [-0.35, 0.35].forEach(z => {
          const midClamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), clampMat);
          midClamp.position.set(0, 0.87, -0.5 + z);
          parentGroup.add(midClamp);
        });

        // Precision Digital Torque Wrench resting on station
        const wrenchGroup = new THREE.Group();
        wrenchGroup.position.set(0.1, 0.88, -0.2);

        const handleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 16), handleMat);
        shaft.rotation.z = Math.PI / 2;

        const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.06), headMat);
        head.position.x = 0.18;

        // Digital display
        const twLcdTex = createTextCanvasTexture('15.5 N*m', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const twLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshBasicMaterial({ map: twLcdTex }));
        twLcd.rotation.x = -Math.PI / 2;
        twLcd.position.set(0, 0.015, 0);

        wrenchGroup.add(shaft, head, twLcd);
        wrenchGroup.name = 'torque_wrench';
        parentGroup.add(wrenchGroup);
        interactiveObjects.push(wrenchGroup);

        // Grounding resistance bonding tester (Megger)
        const testerGroup = new THREE.Group();
        testerGroup.position.set(-0.85, 0.80, -0.2);
        const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
        const tScreenTex = createTextCanvasTexture('0.04 Ω PASS', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const tScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: tScreenTex }));
        tScreen.rotation.x = -Math.PI / 2;
        tScreen.position.y = 0.032;
        testerGroup.add(tBody, tScreen);
        parentGroup.add(testerGroup);
      }

      // ---------------------------------------------------------------------
      // 3. SOLAR-DC-03: DC String Wiring, Stripping & MC4 Crimping Lab
      // ---------------------------------------------------------------------
      else if (code.includes('DC') || code.includes('03')) {
        defaultCameraPos.set(0, 1.3, 1.0);
        defaultControlsTarget.set(0, 0.85, -0.4);

        // Workbench
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x1d3d63, roughness: 0.65 });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.0), benchMat);
        bench.position.set(0, 0.74, -0.5);
        parentGroup.add(bench);

        // Spools of PV1-F DC Cable (Red & Black)
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

        // Prepared cable sample stripped by 7mm
        const cableSample = new THREE.Group();
        cableSample.position.set(-0.05, 0.80, -0.4);
        const cSheath = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 16), redCableMat);
        cSheath.rotation.z = Math.PI / 2;
        const cCopper = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 }));
        cCopper.rotation.z = Math.PI / 2;
        cCopper.position.x = 0.16;
        cableSample.add(cSheath, cCopper);
        parentGroup.add(cableSample);

        // Professional Rennsteig Ratchet Crimping Pliers
        const crimpGroup = new THREE.Group();
        crimpGroup.position.set(0.15, 0.81, -0.4);
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

        // MC4 connector components on bench
        const mc4Group = new THREE.Group();
        mc4Group.position.set(0.4, 0.80, -0.4);
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 }));
        pin.rotation.z = Math.PI / 2;
        const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        housing.rotation.z = Math.PI / 2;
        housing.position.x = 0.08;
        mc4Group.add(pin, housing);
        mc4Group.name = 'mc4_assembly';
        parentGroup.add(mc4Group);
        interactiveObjects.push(mc4Group);

        // Tensile Pull-Test Rig (360 N force gauge)
        const pullRig = new THREE.Group();
        pullRig.position.set(0.65, 0.81, -0.45);
        const rBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
        const rLcdTex = createTextCanvasTexture('360 N PASS', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const rLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), new THREE.MeshBasicMaterial({ map: rLcdTex }));
        rLcd.rotation.x = -Math.PI / 2;
        rLcd.position.y = 0.032;
        pullRig.add(rBase, rLcd);
        parentGroup.add(pullRig);
      }

      // ---------------------------------------------------------------------
      // 4. SOLAR-BOX-01: Combiner Box Safe Isolation & Battery Lab (Original)
      // ---------------------------------------------------------------------
      else if (code.includes('BOX') || code.includes('04')) {
        defaultCameraPos.set(0, 1.25, 0.65);
        defaultControlsTarget.set(0, 0.95, -0.65);

        // Fall back to original module equipment setup handled by EnvironmentAndEquipment
        if (window.app && window.app.env) {
          // Re-enable original combiner box & bench visibility
          if (window.app.env.workbenchGroup) window.app.env.workbenchGroup.visible = true;
          if (window.app.env.combinerBox) window.app.env.combinerBox.visible = true;
          if (window.app.env.batteryRack) window.app.env.batteryRack.visible = true;
        }
      }

      // ---------------------------------------------------------------------
      // 5. SOLAR-GRID-05: Commercial 3-Phase Inverter Commissioning
      // ---------------------------------------------------------------------
      else if (code.includes('GRID') || code.includes('05') || code.includes('INVERTER')) {
        defaultCameraPos.set(0, 1.5, 1.2);
        defaultControlsTarget.set(0, 1.25, -0.7);

        // Wall background
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.85 });
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), wallMat);
        wall.position.set(0, 1.5, -0.9);
        parentGroup.add(wall);

        // 50kW Commercial 3-Phase String Inverter Enclosure
        const invGroup = new THREE.Group();
        invGroup.position.set(-0.25, 1.35, -0.75);

        const invBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.2 });
        const invBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.24), invBodyMat);

        // Rear heatsink fins
        const hsMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
        const hs = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.98, 0.05), hsMat);
        hs.position.z = -0.13;
        invGroup.add(hs, invBody);

        // Backlit LCD graphic interface display
        const lcdTex = createTextCanvasTexture('49.8 kW // 60.0 Hz', '#0284c7', '#ffffff', 256, 64, 'bold 20px monospace');
        const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.16), new THREE.MeshBasicMaterial({ map: lcdTex }));
        lcd.position.set(0, 0.22, 0.125);
        invGroup.add(lcd);

        // MPPT DC Input Quick-connect terminals
        const termMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        for (let i = 0; i < 4; i++) {
          const t = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 16), termMat);
          t.position.set(-0.2 + i * 0.13, -0.52, 0);
          invGroup.add(t);
        }
        invGroup.name = 'commercial_inverter';
        parentGroup.add(invGroup);
        interactiveObjects.push(invGroup);

        // Exterior 480V 3-Phase AC Safety Disconnect Switch with big red lever
        const acSwGroup = new THREE.Group();
        acSwGroup.position.set(0.55, 1.35, -0.78);

        const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.16), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 }));
        // Red throw lever
        const leverGroup = new THREE.Group();
        const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8 }));
        lever.position.y = 0.12;
        leverGroup.add(lever);
        leverGroup.position.set(0.18, 0, 0);
        leverGroup.rotation.z = -0.6; // ON position
        acSwGroup.add(swBox, leverGroup);
        acSwGroup.name = 'ac_disconnect_switch';
        parentGroup.add(acSwGroup);
        interactiveObjects.push(acSwGroup);

        // Fluke 9040 Phase Rotation Indicator
        const rotGroup = new THREE.Group();
        rotGroup.position.set(0.55, 0.95, -0.65);
        const rotBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 }));
        const rotLcdTex = createTextCanvasTexture('L1-L2-L3 CW OK', '#0f172a', '#22c55e', 256, 64, 'bold 18px monospace');
        const rotLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06), new THREE.MeshBasicMaterial({ map: rotLcdTex }));
        rotLcd.position.z = 0.022;
        rotGroup.add(rotBody, rotLcd);
        parentGroup.add(rotGroup);
      }

      // ---------------------------------------------------------------------
      // 6. SUB-LOTO-01: 13.8kV Substation Yard, Security Gate & Arc Flash
      // ---------------------------------------------------------------------
      else if (code.includes('LOTO') || code.includes('SUB_MOD_01') || code.includes('SUB-LOTO')) {
        defaultCameraPos.set(0, 1.8, 2.0);
        defaultControlsTarget.set(0, 1.3, -0.6);

        // Crushed stone gravel yard ground plane
        const gravelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), gravelMat);
        ground.rotation.x = -Math.PI / 2;
        parentGroup.add(ground);

        // 4.2m Arc Flash Category 4 Demarcation Circle
        const circleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.18, 64), circleMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        parentGroup.add(ring);

        // Structural steel lattice gantry tower
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

        // 3x 13.8kV Suspension Insulator Strings & Aluminum Busbars
        const insMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.35 });
        [-0.8, 0, 0.8].forEach(x => {
          for (let i = 0; i < 5; i++) {
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.035, 16), insMat);
            disc.position.set(x, 3.4 - i * 0.06, 0);
            gantry.add(disc);
          }
          const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 }));
          bus.rotation.x = Math.PI / 2;
          bus.position.set(x, 3.0, 0);
          gantry.add(bus);
        });
        parentGroup.add(gantry);

        // Security perimeter gate with Trapped Key Interlock
        const gateGroup = new THREE.Group();
        gateGroup.position.set(0, 1.1, 0.8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        [-0.8, 0.8].forEach(x => {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 16), postMat);
          p.position.set(x, 0, 0);
          gateGroup.add(p);
        });
        const meshMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true });
        const fenceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.0, 15, 20), meshMat);
        gateGroup.add(fenceMesh);
        gateGroup.name = 'substation_security_gate';
        parentGroup.add(gateGroup);
        interactiveObjects.push(gateGroup);

        // 8ft Fiberglass High-Voltage Hot Stick
        const stickGroup = new THREE.Group();
        stickGroup.position.set(1.2, 1.2, 0.2);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }); // High-vis yellow
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.4, 16), stickMat);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.01, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        tip.position.y = 1.25;
        stickGroup.add(stick, tip);
        stickGroup.name = 'hv_hot_stick';
        parentGroup.add(stickGroup);
        interactiveObjects.push(stickGroup);
      }

      // ---------------------------------------------------------------------
      // 7. SUB-SW-02: SF6 Gas Circuit Breaker & 3-Phase Air Disconnect
      // ---------------------------------------------------------------------
      else if (code.includes('SW') || code.includes('BREAKER') || code.includes('DISCONNECT')) {
        defaultCameraPos.set(0, 1.6, 1.4);
        defaultControlsTarget.set(0, 1.15, -0.4);

        // Steel base stanchions
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 });
        const stanchion = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.6), steelMat);
        stanchion.position.set(0, 0.3, -0.5);
        parentGroup.add(stanchion);

        // SF6 Gas Circuit Breaker Tank Cylinder
        const tankGroup = new THREE.Group();
        tankGroup.position.set(-0.45, 1.1, -0.5);

        const tankMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 24), tankMat);
        tankGroup.add(tank);

        // SF6 Pressure Gauge (0.62 MPa nominal in green band)
        const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24), gaugeMat);
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(0, 0.25, 0.26);

        const gLcdTex = createTextCanvasTexture('0.62 MPa PASS', '#0f172a', '#22c55e', 256, 64, 'bold 20px monospace');
        const gLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), new THREE.MeshBasicMaterial({ map: gLcdTex }));
        gLabel.position.z = 0.018;
        gauge.add(gLabel);
        tankGroup.add(gauge);

        // Manual red TRIP pushbutton
        const tripBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        tripBtn.rotation.x = Math.PI / 2;
        tripBtn.position.set(0, -0.15, 0.25);
        tankGroup.add(tripBtn);
        tankGroup.name = 'sf6_circuit_breaker';
        parentGroup.add(tankGroup);
        interactiveObjects.push(tankGroup);

        // Visible 3-Phase Gang Air-Break Disconnect Switch (450mm air gap knife blades)
        const discGroup = new THREE.Group();
        discGroup.position.set(0.45, 1.3, -0.5);

        const insMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 });

        [-0.22, 0, 0.22].forEach(x => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.4, 16), insMat);
          post.position.set(x, 0, 0);
          discGroup.add(post);

          // Moving knife blade open at 450mm air gap
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.35, 0.04), copperMat);
          blade.position.set(x, 0.26, 0.12);
          blade.rotation.x = 0.85; // Open air gap angle
          discGroup.add(blade);
        });

        // Operating pipe handle & OSHA Lockout Hasp
        const lotoHasp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        lotoHasp.position.set(0.35, -0.3, 0.08);
        discGroup.add(lotoHasp);
        discGroup.name = 'air_disconnect_gang_switch';
        parentGroup.add(discGroup);
        interactiveObjects.push(discGroup);
      }

      // ---------------------------------------------------------------------
      // 8. BESS-CELL-01: Commercial 16S LiFePO4 BESS Battery Rack
      // ---------------------------------------------------------------------
      else if (code.includes('BESS') || code.includes('CELL')) {
        defaultCameraPos.set(0, 1.4, 1.1);
        defaultControlsTarget.set(0, 1.0, -0.35);

        // 19-inch steel rack chassis
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.6, 0.7), rackMat);
        rack.position.set(0, 0.9, -0.5);
        parentGroup.add(rack);

        // Slide-out tray
        const trayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
        const tray = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.06, 0.6), trayMat);
        tray.position.set(0, 0.85, -0.35);
        parentGroup.add(tray);

        // 16 Prismatic Blue LiFePO4 Battery Cells (3.2V 280Ah each)
        const cellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.25 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 }); // Orange safety caps
        const busMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });

        const cellsGroup = new THREE.Group();
        cellsGroup.position.set(0, 0.98, -0.35);

        for (let i = 0; i < 8; i++) {
          const cx = -0.36 + (i % 4) * 0.24;
          const cz = i < 4 ? -0.14 : 0.14;

          const cell = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.22), cellMat);
          cell.position.set(cx, 0, cz);

          // Orange terminal caps
          const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), capMat);
          cap1.position.set(cx - 0.04, 0.12, cz);
          const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), capMat);
          cap2.position.set(cx + 0.04, 0.12, cz);

          cellsGroup.add(cell, cap1, cap2);
        }
        cellsGroup.name = 'lifepo4_cell_pack';
        parentGroup.add(cellsGroup);
        interactiveObjects.push(cellsGroup);

        // Digital BMS Controller Graphic Display (Cell Delta: 4 mV)
        const bmsGroup = new THREE.Group();
        bmsGroup.position.set(0, 1.25, -0.15);

        const bmsLcdTex = createTextCanvasTexture('51.24V // ΔV = 4mV BALANCED', '#047857', '#ffffff', 320, 64, 'bold 18px monospace');
        const bmsLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.09), new THREE.MeshBasicMaterial({ map: bmsLcdTex }));
        bmsGroup.add(bmsLcd);
        bmsGroup.name = 'bms_controller';
        parentGroup.add(bmsGroup);
        interactiveObjects.push(bmsGroup);
      }

      return {
        interactiveObjects,
        defaultCameraPos,
        defaultControlsTarget
      };
    }
  };

  return {
    ExplodedViewBuilder,
    ModuleEquipmentBuilder
  };
}));
