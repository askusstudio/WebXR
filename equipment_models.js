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
  // FULLY FUNCTIONAL 6-STEP PRACTICE PROCESSES & INTERACTIVE 3D ANIMATIONS
  // =========================================================================
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

      // ---------------------------------------------------------------------
      // 1. SOLAR-ROOF-01: Rooftop Structural Racking & Sun Angle Irradiance Lab
      // ---------------------------------------------------------------------
      if (code.includes('ROOF') || (code.includes('01') && !code.includes('LOTO') && !code.includes('BOX') && !code.includes('CELL'))) {
        defaultCameraPos.set(0, 1.8, 1.4);
        defaultControlsTarget.set(0, 1.0, -0.4);

        // Roof deck base platform with TPO membrane
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 2.8), roofMat);
        roofDeck.position.set(0, 0.7, -0.6);
        parentGroup.add(roofDeck);

        // Step 1: Structural Rafter Inspection Marker
        const rafterMarkerGroup = new THREE.Group();
        rafterMarkerGroup.position.set(0, 0.78, -0.6);
        const rafterScanBox = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, 0.02, 2.4),
          new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.25, wireframe: true })
        );
        const rafterLabelTex = createTextCanvasTexture('RAFTER LOAD: 18.5 kg/m² PASS', '#0f172a', '#38bdf8', 380, 64, 'bold 16px monospace');
        const rafterLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.15), new THREE.MeshBasicMaterial({ map: rafterLabelTex }));
        rafterLabel.rotation.x = -Math.PI / 2;
        rafterLabel.position.set(0, 0.02, 0.8);
        rafterMarkerGroup.add(rafterScanBox, rafterLabel);
        rafterMarkerGroup.name = 'rafter_inspection_marker';
        parentGroup.add(rafterMarkerGroup);
        interactiveObjects.push(rafterMarkerGroup);

        // OSHA Yellow perimeter border
        const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const border1 = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.06), yellowLineMat);
        border1.rotation.x = -Math.PI / 2;
        border1.position.set(0, 0.78, 0.6);
        parentGroup.add(border1);

        // Dual extruded aluminum Unistrut structural rails (hinged for tilt adjustment)
        const railMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.95, roughness: 0.2 });
        const rackGroup = new THREE.Group();
        rackGroup.position.set(0, 0.9, -0.6);
        rackGroup.rotation.x = 0.2; // Starts slightly off-tilt for Step 3 practice

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
        rackGroup.name = 'unistrut_rails_rack';
        parentGroup.add(rackGroup);
        interactiveObjects.push(rackGroup);

        // Step 2: Precision Magnetic Compass on workbench/roof
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
        needleGroup.rotation.y = 0.8; // Initially off 180
        compassGroup.add(compassCase, compassBezel, needleGroup);
        compassGroup.name = 'magnetic_compass';
        parentGroup.add(compassGroup);
        interactiveObjects.push(compassGroup);

        // Step 3: 25° Inclinometer dial gauge on rack
        const incGroup = new THREE.Group();
        incGroup.position.set(-0.85, 0.95, -0.4);
        const incDial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 32), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
        incDial.rotation.x = Math.PI / 2;
        const incTex = createTextCanvasTexture('TILT: 25.0°', '#0f172a', '#10b981', 256, 64, 'bold 22px monospace');
        const incLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.05), new THREE.MeshBasicMaterial({ map: incTex }));
        incLabel.position.z = 0.012;
        incDial.add(incLabel);
        incGroup.add(incDial);
        incGroup.name = 'inclinometer_gauge';
        parentGroup.add(incGroup);
        interactiveObjects.push(incGroup);

        // Step 4: Precision Class A Pyranometer Sensor on tripod
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
        const pyrDome = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.95, opacity: 0.65, transparent: true }));
        pyrDome.position.y = 0.425;
        const lcdTex = createTextCanvasTexture('885 W/m²', '#0284c7', '#ffffff', 256, 64, 'bold 24px monospace');
        const meterLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: lcdTex }));
        meterLcd.position.set(0, 0.32, 0.08);
        meterLcd.rotation.x = -0.3;
        pyrGroup.add(pyrBase, pyrDome, meterLcd);
        pyrGroup.name = 'pyranometer_sensor';
        parentGroup.add(pyrGroup);
        interactiveObjects.push(pyrGroup);

        // Step 5: Calibrated Torque Wrench for Unistrut Rails
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

        // Step 6: EPDM Waterproof Flashing Boot with Lag Bolt
        const bootGroup = new THREE.Group();
        bootGroup.position.set(-0.5, 0.80, 0.4);
        const bootCone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.1, 16), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 }));
        const bootFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.01, 16), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }));
        bootCone.position.y = 0.05;
        bootGroup.add(bootCone, bootFlange);
        bootGroup.name = 'flashing_boot_seal';
        parentGroup.add(bootGroup);
        interactiveObjects.push(bootGroup);

        // Sun ray beam indicator
        const beamGeo = new THREE.CylinderGeometry(0.02, 0.35, 2.5, 16);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, opacity: 0.25 });
        const sunBeam = new THREE.Mesh(beamGeo, beamMat);
        sunBeam.position.set(0, 2.2, -0.6);
        sunBeam.rotation.x = 0.436;
        parentGroup.add(sunBeam);

        // Define the 6 sequential practice step actions
        stepInteractiveMap[1] = {
          name: 'rafter_inspection_marker',
          title: 'ROOF INSPECTION',
          actionLabel: 'EXECUTE: 1. ROOF INSPECT',
          instructionEn: 'Verify structural rafter integrity and roof load capacity.',
          instructionHi: 'राफ़्टर भार वहन क्षमता और रूफ ट्रस संरचनात्मक अखंडता का निरीक्षण करें।',
          telemetryUpdates: { p4: { label: 'Roof Load', value: '18.5 kg/m² PASS' } },
          execute: (app) => {
            if (snd && snd.playScanTone) snd.playScanTone();
            else if (snd && snd.playProbeBeep) snd.playProbeBeep();
            rafterScanBox.material.color.setHex(0x00ff88);
            rafterScanBox.material.opacity = 0.6;
            setTimeout(() => { if (rafterScanBox.material) rafterScanBox.material.opacity = 0.25; }, 800);
            return 'Structural rafter integrity confirmed at 18.5 kg/m² roof load.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'magnetic_compass',
          title: 'AZIMUTH ALIGNMENT',
          actionLabel: 'EXECUTE: 2. ALIGN AZIMUTH',
          instructionEn: 'Use magnetic compass to locate 180° True South solar noon window.',
          instructionHi: 'चुंबकीय कम्पास को 180° दक्षिण दिशा में संरेखित करें।',
          telemetryUpdates: { p3: { label: 'Azimuth', value: '180° TRUE SOUTH' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            needleGroup.rotation.y = Math.PI;
            return 'Magnetic compass aligned to 180° True South azimuth.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'inclinometer_gauge',
          title: 'INCLINOMETER TILT',
          actionLabel: 'EXECUTE: 3. SET 25° TILT',
          instructionEn: 'Set racking L-feet to 25.0° optimal latitude tilt angle.',
          instructionHi: 'रैकिंग संरचना को 25.0° कोण पर झुकाएं।',
          telemetryUpdates: { p1: { label: 'Tilt Angle', value: '25.0° OPTIMAL' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            rackGroup.rotation.x = 0.436;
            return 'Racking tilted to 25.0° optimal solar incidence angle.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'pyranometer_sensor',
          title: 'PYRANOMETER READING',
          actionLabel: 'EXECUTE: 4. READ IRRADIANCE',
          instructionEn: 'Measure real-time rooftop solar irradiance (>800 W/m²).',
          instructionHi: 'क्लास ए पायरानोमीटर से सोलर विकिरण को मापें।',
          telemetryUpdates: { p2: { label: 'Irradiance', value: '885 W/m² PEAK' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            pyrDome.material.color.setHex(0xfde047);
            sunBeam.material.opacity = 0.5;
            setTimeout(() => { if (sunBeam.material) sunBeam.material.opacity = 0.25; }, 1000);
            return 'Pyranometer calibrated: 885 W/m² incident solar flux.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'unistrut_torque_wrench',
          title: 'UNISTRUT TORQUING',
          actionLabel: 'EXECUTE: 5. TORQUE RAILS',
          instructionEn: 'Fasten aerospace aluminum rails with torque wrench to 14.0 N·m.',
          instructionHi: 'एल्यूमीनियम रेल बोल्ट को 14.0 N*m टॉर्क पर कसें।',
          telemetryUpdates: { p1: { label: 'Rail Torque', value: '14.0 N*m PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
            twGroup.position.set(0, 0.95, -0.6);
            twGroup.rotation.y += Math.PI / 3;
            return 'Unistrut rails torqued to 14.0 N·m specification.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'flashing_boot_seal',
          title: 'WATERPROOF SEAL',
          actionLabel: 'EXECUTE: 6. SEAL FLASHING',
          instructionEn: 'Inspect EPDM rubber flashing boots against rain penetration.',
          instructionHi: 'ईपीडीएम फ्लैशिंग बूट और वॉटरप्रूफ सील लगाएं।',
          telemetryUpdates: { p4: { label: 'Waterproof Seal', value: '100% SEALED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            bootGroup.position.set(-0.5, 0.78, 0.0);
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

        // Heavy Test bench
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

        // Step 1: Two 550W Bifacial PV Panels
        const panelGroup = new THREE.Group();
        const pvTex = createSolarWaferTexture();
        const pvMat = new THREE.MeshStandardMaterial({ map: pvTex, roughness: 0.3, metalness: 0.6 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 });

        const p1 = new THREE.Group();
        const frame1 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 1.2), frameMat);
        const wafer1 = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 1.16), pvMat);
        wafer1.position.y = 0.01;
        p1.add(frame1, wafer1);
        p1.position.set(-0.54, 0.88, -0.5);

        const p2 = new THREE.Group();
        const frame2 = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 1.2), frameMat);
        const wafer2 = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.02, 1.16), pvMat);
        wafer2.position.y = 0.01;
        p2.add(frame2, wafer2);
        p2.position.set(0.54, 0.88, -0.5);

        panelGroup.add(p1, p2);
        panelGroup.name = 'bifacial_pv_panel';
        parentGroup.add(panelGroup);
        interactiveObjects.push(panelGroup);

        // Step 2: WEEB 9.5 Grounding Clip
        const weebGroup = new THREE.Group();
        weebGroup.position.set(0, 0.84, -0.2);
        const weebPlate = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.008, 0.04), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98 }));
        weebGroup.add(weebPlate);
        weebGroup.name = 'weeb_grounding_clip';
        parentGroup.add(weebGroup);
        interactiveObjects.push(weebGroup);

        // Step 3: Thermal Expansion Gap Spacer (20mm)
        const spacerGroup = new THREE.Group();
        spacerGroup.position.set(0, 0.85, -0.5);
        const spacer = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 }));
        spacerGroup.add(spacer);
        spacerGroup.name = 'thermal_gap_spacer';
        parentGroup.add(spacerGroup);
        interactiveObjects.push(spacerGroup);

        // Step 4: Mid-clamps securing panels
        const clampGroup = new THREE.Group();
        const clampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
        [-0.35, 0.35].forEach(z => {
          const midClamp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.05), clampMat);
          midClamp.position.set(0, 0.87, -0.5 + z);
          clampGroup.add(midClamp);
        });
        clampGroup.name = 'mid_clamp';
        parentGroup.add(clampGroup);
        interactiveObjects.push(clampGroup);

        // Step 5: Precision Digital Torque Wrench
        const wrenchGroup = new THREE.Group();
        wrenchGroup.position.set(0.1, 0.88, -0.2);
        const handleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 16), handleMat);
        shaft.rotation.z = Math.PI / 2;
        const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.06), headMat);
        head.position.x = 0.18;
        const twLcdTex = createTextCanvasTexture('15.5 N*m', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const twLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.03), new THREE.MeshBasicMaterial({ map: twLcdTex }));
        twLcd.rotation.x = -Math.PI / 2;
        twLcd.position.set(0, 0.015, 0);
        wrenchGroup.add(shaft, head, twLcd);
        wrenchGroup.name = 'torque_wrench';
        parentGroup.add(wrenchGroup);
        interactiveObjects.push(wrenchGroup);

        // Step 6: Grounding resistance bonding tester (Micro-ohmmeter)
        const testerGroup = new THREE.Group();
        testerGroup.position.set(-0.85, 0.80, -0.2);
        const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
        const tScreenTex = createTextCanvasTexture('0.04 Ω PASS', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const tScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: tScreenTex }));
        tScreen.rotation.x = -Math.PI / 2;
        tScreen.position.y = 0.032;
        testerGroup.add(tBody, tScreen);
        testerGroup.name = 'micro_ohmmeter';
        parentGroup.add(testerGroup);
        interactiveObjects.push(testerGroup);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'bifacial_pv_panel',
          title: 'PANEL LIFT & SEAT',
          actionLabel: 'EXECUTE: 1. SEAT PANELS',
          instructionEn: 'Position dual 550W bifacial monocrystalline PV panels on racking.',
          instructionHi: 'रैकिंग रेल पर दोनों 550W पीवी पैनलों को बैठाएं।',
          telemetryUpdates: { p1: { label: 'Panels', value: '2x 550W SEATED' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            p1.position.y = 0.84;
            p2.position.y = 0.84;
            return 'Dual 550W bifacial PV panels positioned flush onto rails.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'weeb_grounding_clip',
          title: 'WEEB CLIPS',
          actionLabel: 'EXECUTE: 2. INSERT WEEB CLIPS',
          instructionEn: 'Seat serrated grounding washer between rail and panel frame.',
          instructionHi: 'फ्रेम के नीचे स्टेनलेस स्टील डब्ल्यूईईबी 9.5 ग्राउंडिंग क्लिप लगाएं।',
          telemetryUpdates: { p4: { label: 'Ground Bond', value: 'WEEB 9.5 INSERTED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            weebGroup.position.set(0, 0.83, -0.35);
            return 'WEEB 9.5 clip seated. Serrated teeth penetrate anodized layer.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'thermal_gap_spacer',
          title: 'THERMAL GAP',
          actionLabel: 'EXECUTE: 3. CHECK 20mm GAP',
          instructionEn: 'Measure 20mm uniform thermal expansion gap between panels.',
          instructionHi: 'मॉड्यूल के बीच 20 मिमी थर्मल विस्तार अंतर मापें।',
          telemetryUpdates: { p3: { label: 'Thermal Gap', value: '20 mm NOMINAL' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            p1.position.x = -0.52;
            p2.position.x = 0.52;
            spacer.material.color.setHex(0x10b981);
            return 'Thermal expansion gap verified at 20.0 mm nominal.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'mid_clamp',
          title: 'MID-CLAMPS',
          actionLabel: 'EXECUTE: 4. DROP MID-CLAMPS',
          instructionEn: 'Drop anodized aluminum mid-clamp into Unistrut channel.',
          instructionHi: 'यूनिस्ट्रट चैनल में एनोडाइज्ड एल्यूमीनियम मिड-क्लैंप डालें।',
          telemetryUpdates: { p2: { label: 'End Torque', value: 'CLAMPS POSITIONED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            clampGroup.position.y = 0;
            return 'Anodized aluminum mid-clamps seated into channel.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'torque_wrench',
          title: 'TORQUE WRENCH',
          actionLabel: 'EXECUTE: 5. TORQUE CLAMPS',
          instructionEn: 'Torque clamp hex bolt to 15.5 N·m calibrated setting.',
          instructionHi: 'क्लैंप हेक्स बोल्ट को 15.5 N*m टॉर्क पर कसें।',
          telemetryUpdates: { p1: { label: 'Clamp Torque', value: '15.5 N*m PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playProbeBeep) snd.playProbeBeep();
            wrenchGroup.position.set(0, 0.90, -0.35);
            wrenchGroup.rotation.z += Math.PI / 4;
            return 'Mid-clamp hex bolts torqued to 15.5 N·m calibrated setting.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'micro_ohmmeter',
          title: 'BONDING CHECK',
          actionLabel: 'EXECUTE: 6. TEST GROUND BOND',
          instructionEn: 'Measure frame-to-rail continuity with micro-ohmmeter (<0.10 Ω).',
          instructionHi: 'माइक्रो-ओहममीटर से फ्रेम-टू-रेल निरंतरता मापें (<0.10 Ω)।',
          telemetryUpdates: { p4: { label: 'Ground Bond', value: '0.04 Ω PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            testerGroup.position.set(-0.5, 0.84, -0.2);
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

        // Step 1: Prepared cable sample stripped by 7.5mm
        const cableSample = new THREE.Group();
        cableSample.position.set(-0.05, 0.80, -0.4);
        const cSheath = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 16), redCableMat);
        cSheath.rotation.z = Math.PI / 2;
        const cCopper = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95 }));
        cCopper.rotation.z = Math.PI / 2;
        cCopper.position.x = 0.16;
        cableSample.add(cSheath, cCopper);
        cableSample.name = 'pv_cable_sample';
        parentGroup.add(cableSample);
        interactiveObjects.push(cableSample);

        // Step 2: Strands inspection marker
        const strandInspectGroup = new THREE.Group();
        strandInspectGroup.position.set(0.12, 0.80, -0.4);
        const strandBox = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.03, 16), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        strandInspectGroup.add(strandBox);
        strandInspectGroup.name = 'wire_strands_inspection';
        parentGroup.add(strandInspectGroup);
        interactiveObjects.push(strandInspectGroup);

        // Step 3: MC4 gold contact pin
        const pinGroup = new THREE.Group();
        pinGroup.position.set(0.28, 0.80, -0.4);
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 }));
        pin.rotation.z = Math.PI / 2;
        pinGroup.add(pin);
        pinGroup.name = 'mc4_gold_pin';
        parentGroup.add(pinGroup);
        interactiveObjects.push(pinGroup);

        // Step 4: Professional Rennsteig Ratchet Crimping Pliers
        const crimpGroup = new THREE.Group();
        crimpGroup.position.set(0.15, 0.81, -0.2);
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

        // Step 5: MC4 housing components on bench
        const mc4Group = new THREE.Group();
        mc4Group.position.set(0.42, 0.80, -0.4);
        const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.10, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
        housing.rotation.z = Math.PI / 2;
        mc4Group.add(housing);
        mc4Group.name = 'mc4_housing';
        parentGroup.add(mc4Group);
        interactiveObjects.push(mc4Group);

        // Step 6: Tensile Pull-Test Rig (360 N force gauge)
        const pullRig = new THREE.Group();
        pullRig.position.set(0.65, 0.81, -0.45);
        const rBase = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
        const rLcdTex = createTextCanvasTexture('345 N PASS', '#0f172a', '#22c55e', 256, 64, 'bold 22px monospace');
        const rLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), new THREE.MeshBasicMaterial({ map: rLcdTex }));
        rLcd.rotation.x = -Math.PI / 2;
        rLcd.position.y = 0.032;
        pullRig.add(rBase, rLcd);
        pullRig.name = 'pull_test_rig';
        parentGroup.add(pullRig);
        interactiveObjects.push(pullRig);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'pv_cable_sample',
          title: 'STRIP CABLE',
          actionLabel: 'EXECUTE: 1. STRIP CABLE',
          instructionEn: 'Strip 7.5mm outer cross-linked insulation from 6mm² PV wire.',
          instructionHi: '6mm² PV वायर से 7.5 मिमी इन्सुलेशन स्ट्रिप करें।',
          telemetryUpdates: { p2: { label: 'Strip Depth', value: '7.5 mm CONFIRMED' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            cSheath.position.x = -0.04;
            return 'Stripped 7.5mm cross-linked jacket cleanly.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'wire_strands_inspection',
          title: 'WIRE STRANDS',
          actionLabel: 'EXECUTE: 2. INSPECT STRANDS',
          instructionEn: 'Inspect tinned copper multi-strands for nicking or breakage.',
          instructionHi: '56 टिनयुक्त तांबे के तारों की अखंडता का निरीक्षण करें।',
          telemetryUpdates: { p1: { label: 'Cable Sizing', value: '6mm² (56/56 INTACT)' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            cCopper.material.color.setHex(0xf59e0b);
            return 'Conductor multi-strands inspected: 56/56 intact, zero fractures.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'mc4_gold_pin',
          title: 'INSERT PIN',
          actionLabel: 'EXECUTE: 3. INSERT PIN',
          instructionEn: 'Insert conductor into gold-plated male/female MC4 contact pin.',
          instructionHi: 'कंडक्टर को गोल्ड-प्लेटेड MC4 कॉन्टैक्ट पिन में डालें।',
          telemetryUpdates: { p4: { label: 'Contact Res', value: '0.18 mΩ SEATED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            pinGroup.position.set(0.12, 0.80, -0.4);
            return 'Conductor core inserted into gold MC4 terminal pin.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'ratchet_crimper',
          title: 'RATCHET CRIMP',
          actionLabel: 'EXECUTE: 4. RATCHET CRIMP',
          instructionEn: 'Execute full cycle crimp with calibrated Rennsteig tool.',
          instructionHi: 'कैलिब्रेटेड रैचेट टूल से फुल-साइकिल क्रिम्पिंग करें।',
          telemetryUpdates: { p1: { label: 'Crimp Quality', value: 'UL 486A PASS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
            crimpGroup.position.set(0.12, 0.81, -0.4);
            return 'Full-cycle ratchet crimp executed. B-crimp indent certified.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'mc4_housing',
          title: 'ASSEMBLE HOUSING',
          actionLabel: 'EXECUTE: 5. SNAP HOUSING',
          instructionEn: 'Push contact into IP68 gland until audible metallic click.',
          instructionHi: 'पिन को IP68 हाउसिंग में तब तक धकेलें जब तक क्लिक न हो।',
          telemetryUpdates: { p2: { label: 'IP68 Gland', value: 'LOCKED CLICK' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            mc4Group.position.set(0.16, 0.80, -0.4);
            return 'Contact pushed into housing gland. Retention barb locked.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'pull_test_rig',
          title: 'PULL-TEST RIG',
          actionLabel: 'EXECUTE: 6. TEST PULL RIG',
          instructionEn: 'Clamp cable into 360 N digital tensile pull-tester to verify retention.',
          instructionHi: 'केबल को 360 N पुल-टेस्ट रिग में क्लैंप करके रीटेनशन सत्यापित करें।',
          telemetryUpdates: { p3: { label: 'Pull Retention', value: '345 N PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            pullRig.position.set(0.4, 0.81, -0.4);
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

        // Fall back to original module equipment setup handled by EnvironmentAndEquipment
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

        // Map the 6 original actions cleanly
        stepInteractiveMap[1] = {
          name: 'gate_keypad',
          title: 'MAIN GATE',
          actionLabel: 'EXECUTE: 1. OPEN GATE',
          instructionEn: 'Scan biometric authorization card or access security keypad.',
          instructionHi: 'सुरक्षा कीपैड का उपयोग करें या कहें "जार्विस, गेट खोलो"।',
          telemetryUpdates: { p4: { label: 'Facility Access', value: 'PERIMETER CLEARED' } },
          execute: (app) => {
            if (app && app.animateOpenGateAndEnter) app.animateOpenGateAndEnter();
            return 'Facility perimeter gate opened.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'rotary_isolator',
          title: 'SAFE ISOLATION',
          actionLabel: 'EXECUTE: 2. ISOLATE SWITCH',
          instructionEn: 'Rotate DC isolator switch 90° to OFF.',
          instructionHi: 'कंबाइनर बॉक्स का ढक्कन खोलें और डीसी आइसोलेटर स्विच घुमाएं।',
          telemetryUpdates: { p3: { label: 'Bus Voltage', value: '0.00 V (ISOLATED)' } },
          execute: (app) => {
            if (app && app.animateRotarySwitch) app.animateRotarySwitch();
            return 'DC rotary isolator switched to OFF.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'probe_red',
          title: 'PROBE VOLTAGE',
          actionLabel: 'EXECUTE: 3. PROBE VOLTAGE',
          instructionEn: 'Probe high-voltage terminals to confirm zero energy (<50V).',
          instructionHi: 'शून्य विभव की पुष्टि के लिए मल्टीमीटर प्रोब्स लगाएं।',
          telemetryUpdates: { p3: { label: 'Bus Voltage', value: '0.00 V VERIFIED' } },
          execute: (app) => {
            if (app && app.handleProbingInteraction) app.handleProbingInteraction();
            return 'Multimeter verified zero potential (0.00V).';
          }
        };

        stepInteractiveMap[4] = {
          name: 'fuse_cartridge',
          title: 'REPLACE FUSE',
          actionLabel: 'EXECUTE: 4. REPLACE FUSE',
          instructionEn: 'Extract blown fuse #3 & insert fresh 15A gPV fuse.',
          instructionHi: 'खराब फ्यूज को निकालें और नया 15A फ्यूज लगाएं।',
          telemetryUpdates: { p1: { label: 'Roof PV (Voc)', value: '480.0 V (FUSE OK)' } },
          execute: (app) => {
            if (app && app.animateCorrectCircuit) app.animateCorrectCircuit();
            return 'Blown fuse #3 replaced with 15A cartridge.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'toolbox_lid',
          title: 'TOOL BOX',
          actionLabel: 'EXECUTE: 5. OPEN TOOLBOX',
          instructionEn: 'Retrieve insulated torque driver and mounting brackets.',
          instructionHi: 'इंसुलेटेड टॉर्क टूल निकालने के लिए टूलबॉक्स खोलें।',
          telemetryUpdates: { p4: { label: 'Battery Bay', value: 'READY FOR PACK' } },
          execute: (app) => {
            if (app && app.animateOpenToolbox) app.animateOpenToolbox();
            return 'Toolbox opened. Insulated torque tools retrieved.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'battery_module',
          title: 'CONNECT BATTERY',
          actionLabel: 'EXECUTE: 6. INSTALL BATTERY',
          instructionEn: 'Slide 48V LiFePO4 battery pack into bay and connect terminals.',
          instructionHi: 'ऊर्जा भंडारण रैक में नया 48V बैटरी पैक स्थापित करें।',
          telemetryUpdates: { p4: { label: 'Battery Bay', value: 'ONLINE // 51.2V' } },
          execute: (app) => {
            if (app && app.animateInstallBattery) app.animateInstallBattery();
            return '48V LiFePO4 battery docked and energized.';
          }
        };
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

        // Step 4 & Inverter Body: 50kW Commercial 3-Phase String Inverter Enclosure
        const invGroup = new THREE.Group();
        invGroup.position.set(-0.25, 1.35, -0.75);

        const invBodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, metalness: 0.2 });
        const invBody = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.0, 0.24), invBodyMat);
        const hsMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
        const hs = new THREE.Mesh(new THREE.BoxGeometry(0.77, 0.98, 0.05), hsMat);
        hs.position.z = -0.13;
        invGroup.add(hs, invBody);

        // Backlit LCD graphic interface display
        const lcdTex = createTextCanvasTexture('49.8 kW // 60.0 Hz', '#0284c7', '#ffffff', 256, 64, 'bold 20px monospace');
        const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.16), new THREE.MeshBasicMaterial({ map: lcdTex }));
        lcd.position.set(0, 0.22, 0.125);
        invGroup.add(lcd);

        // Step 3: MPPT DC Input Rotary Switch
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

        // Step 2: Exterior 480V 3-Phase AC Safety Disconnect Switch with big red lever
        const acSwGroup = new THREE.Group();
        acSwGroup.position.set(0.55, 1.35, -0.78);
        const swBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.16), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 }));
        const leverGroup = new THREE.Group();
        const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.8 }));
        lever.position.y = 0.12;
        leverGroup.add(lever);
        leverGroup.position.set(0.18, 0, 0);
        leverGroup.rotation.z = 0.6; // Starts OFF (open)
        acSwGroup.add(swBox, leverGroup);
        acSwGroup.name = 'ac_disconnect_switch';
        parentGroup.add(acSwGroup);
        interactiveObjects.push(acSwGroup);

        // Step 1: Fluke 9040 Phase Rotation Indicator
        const rotGroup = new THREE.Group();
        rotGroup.position.set(0.55, 0.95, -0.65);
        const rotBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.04), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 }));
        const rotLcdTex = createTextCanvasTexture('L1-L2-L3 CW OK', '#0f172a', '#22c55e', 256, 64, 'bold 18px monospace');
        const rotLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.06), new THREE.MeshBasicMaterial({ map: rotLcdTex }));
        rotLcd.position.z = 0.022;
        rotGroup.add(rotBody, rotLcd);
        rotGroup.name = 'phase_rotation_meter';
        parentGroup.add(rotGroup);
        interactiveObjects.push(rotGroup);

        // Step 5: Grid Sync Relay (inside or next to inverter)
        const syncGroup = new THREE.Group();
        syncGroup.position.set(-0.25, 0.82, -0.7);
        const syncBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        const syncLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        syncLed.position.set(0, 0.03, 0.045);
        syncGroup.add(syncBox, syncLed);
        syncGroup.name = 'grid_sync_relay';
        parentGroup.add(syncGroup);
        interactiveObjects.push(syncGroup);

        // Step 6: Anti-Islanding Trip Test Pushbutton
        const tripBtnGroup = new THREE.Group();
        tripBtnGroup.position.set(0.18, 1.15, -0.73);
        const btnCase = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        btnCase.rotation.x = Math.PI / 2;
        const btnPush = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        btnPush.rotation.x = Math.PI / 2;
        tripBtnGroup.add(btnCase, btnPush);
        tripBtnGroup.name = 'anti_islanding_test_button';
        parentGroup.add(tripBtnGroup);
        interactiveObjects.push(tripBtnGroup);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'phase_rotation_meter',
          title: 'PHASE ROTATION',
          actionLabel: 'EXECUTE: 1. ROTATION CHECK',
          instructionEn: 'Connect Fluke 9040 meter to verify clockwise L1-L2-L3 phase rotation.',
          instructionHi: 'फ्लूक 9040 मीटर से दक्षिणावर्त L1-L2-L3 फेज रोटेशन सत्यापित करें।',
          telemetryUpdates: { p3: { label: 'Phase Rotation', value: 'L1-L2-L3 CW PASS' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            return 'Phase rotation verified: Clockwise L1-L2-L3 sequence confirmed.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'ac_disconnect_switch',
          title: 'AC DISCONNECT',
          actionLabel: 'EXECUTE: 2. CLOSE AC SWITCH',
          instructionEn: 'Close 480V 3-phase heavy knife switch disconnect.',
          instructionHi: '480V 3-फेज हेवी नाइफ स्विच डिस्कनेक्ट बंद करें।',
          telemetryUpdates: { p1: { label: 'AC Grid', value: '480V CLOSED // ON' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            else if (snd && snd.playSwitchClick) snd.playSwitchClick();
            leverGroup.rotation.z = -0.6;
            return '480V 3-phase AC knife switch closed. Grid voltage supplied.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'mppt_dc_switch',
          title: 'DC MPPT INPUT',
          actionLabel: 'EXECUTE: 3. ENGAGE DC MPPT',
          instructionEn: 'Engage high-current DC disconnect switch to supply PV power to MPPT.',
          instructionHi: 'एमपीपीटी स्टेज पर पीवी ऐरे फीड करने के लिए डीसी डिस्कनेक्ट ऑन करें।',
          telemetryUpdates: { p1: { label: 'DC Input', value: 'MPPT 1 & 2 ACTIVE' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            swKnob.rotation.z = Math.PI / 2;
            return 'DC MPPT input switches engaged. Array DC power online.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'commercial_inverter',
          title: 'INVERTER BOOT',
          actionLabel: 'EXECUTE: 4. BOOT MCU',
          instructionEn: 'Power on central MCU controller and verify LCD startup self-test.',
          instructionHi: 'सेंट्रल MCU को पावर ऑन करें और LCD स्टार्टअप टेस्ट सत्यापित करें।',
          telemetryUpdates: { p2: { label: 'Grid Freq', value: '60.02 Hz NOMINAL' } },
          execute: (app) => {
            if (snd && snd.playSuccessChime) snd.playSuccessChime();
            return 'Inverter DSP/MCU booted. Operating at 49.8 kW / 60.02 Hz.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'grid_sync_relay',
          title: 'GRID SYNC',
          actionLabel: 'EXECUTE: 5. SYNC GRID RELAY',
          instructionEn: 'Trigger automatic 60.0 Hz phase-lock grid synchronization relay.',
          instructionHi: 'स्वचालित 60.0 Hz ग्रिड सिंक्रोनाइज़ेशन रिले को सक्रिय करें।',
          telemetryUpdates: { p3: { label: 'Phase Lock', value: 'SYNCED // 60.00 Hz' } },
          execute: (app) => {
            if (snd && snd.playRelayThud) snd.playRelayThud();
            else if (snd && snd.playSwitchClick) snd.playSwitchClick();
            syncLed.material.color.setHex(0x00e5ff);
            return 'Phase-lock loop synchronized. Grid interconnection relay closed.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'anti_islanding_test_button',
          title: 'ANTI-ISLANDING',
          actionLabel: 'EXECUTE: 6. TEST OUTAGE TRIP',
          instructionEn: 'Trigger simulated utility trip and verify shutdown under 2.0s.',
          instructionHi: 'ग्रिड आउटेज सिम्युलेट करें और 2.0s के भीतर शटडाउन सत्यापित करें।',
          telemetryUpdates: { p4: { label: 'Anti-Islanding', value: '1.4s (<2.0s PASS)' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            btnPush.position.z = -0.01;
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

        // Crushed stone gravel yard ground plane
        const gravelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), gravelMat);
        ground.rotation.x = -Math.PI / 2;
        parentGroup.add(ground);

        // Step 4: 4.2m Arc Flash Category 4 Demarcation Circle
        const circleMat = new THREE.MeshBasicMaterial({ color: 0xdc2626, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.18, 64), circleMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01;
        ring.name = 'arc_flash_boundary_ring';
        parentGroup.add(ring);
        interactiveObjects.push(ring);

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

        // Step 1: Security perimeter fence with warning signs
        const fenceGroup = new THREE.Group();
        fenceGroup.position.set(0, 1.1, 0.8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
        [-1.6, 1.6].forEach(x => {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 16), postMat);
          p.position.set(x, 0, 0);
          fenceGroup.add(p);
        });
        const meshMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true });
        const fenceLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0, 8, 20), meshMat);
        fenceLeft.position.set(-1.2, 0, 0);
        const fenceRight = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0, 8, 20), meshMat);
        fenceRight.position.set(1.2, 0, 0);
        const warnSign = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
        warnSign.position.set(-1.2, 0.3, 0.02);
        fenceGroup.add(fenceLeft, fenceRight, warnSign);
        fenceGroup.name = 'substation_perimeter_fence';
        parentGroup.add(fenceGroup);
        interactiveObjects.push(fenceGroup);

        // Step 2: Gate with Kirk Trapped Key Interlock
        const gateGroup = new THREE.Group();
        gateGroup.position.set(0, 1.1, 0.8);
        const gateMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0, 16, 20), meshMat);
        const kirkLock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
        kirkLock.position.set(0.7, 0, 0.03);
        gateGroup.add(gateMesh, kirkLock);
        gateGroup.name = 'substation_security_gate';
        parentGroup.add(gateGroup);
        interactiveObjects.push(gateGroup);

        // Step 3: Cat 4 PPE Station / Locker
        const ppeLocker = new THREE.Group();
        ppeLocker.position.set(-1.8, 1.0, 1.2);
        const lockerBody = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.2, 0.35), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        helmet.position.set(0, 0.45, 0.18);
        ppeLocker.add(lockerBody, helmet);
        ppeLocker.name = 'cat4_ppe_locker';
        parentGroup.add(ppeLocker);
        interactiveObjects.push(ppeLocker);

        // Step 5: 8ft Fiberglass High-Voltage Hot Stick
        const stickGroup = new THREE.Group();
        stickGroup.position.set(1.2, 1.2, 0.2);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.4, 16), stickMat);
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.01, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        tip.position.y = 1.25;
        stickGroup.add(stick, tip);
        stickGroup.name = 'hv_hot_stick';
        parentGroup.add(stickGroup);
        interactiveObjects.push(stickGroup);

        // Step 6: Non-contact proximity detector probe
        const proxGroup = new THREE.Group();
        proxGroup.position.set(0, 2.8, -1.7);
        const proxSensor = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        proxGroup.add(proxSensor);
        proxGroup.name = 'proximity_voltage_detector';
        parentGroup.add(proxGroup);
        interactiveObjects.push(proxGroup);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'substation_perimeter_fence',
          title: 'PERIMETER INSPECT',
          actionLabel: 'EXECUTE: 1. INSPECT PERIMETER',
          instructionEn: 'Inspect 2.4m security fence line and safety warning placards.',
          instructionHi: '2.4 मीटर सुरक्षा बाड़ और चेतावनी संकेतों का निरीक्षण करें।',
          telemetryUpdates: { p4: { label: 'Perimeter', value: 'SECURED PASS' } },
          execute: (app) => {
            if (snd && snd.playScanTone) snd.playScanTone();
            else if (snd && snd.playProbeBeep) snd.playProbeBeep();
            return 'Substation perimeter and warning signage inspected and verified.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'substation_security_gate',
          title: 'TRAPPED KEY',
          actionLabel: 'EXECUTE: 2. UNLOCK KIRK KEY',
          instructionEn: 'Unlock interlock gate using sequential Kirk Key safety interlock.',
          instructionHi: 'किर्क की सुरक्षा इंटरलॉक तंत्र का उपयोग करके गेट अनलॉक करें।',
          telemetryUpdates: { p4: { label: 'Kirk Key', value: 'RELEASED // OPEN' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            gateGroup.rotation.y = -Math.PI / 2;
            return 'Sequential Kirk key interlock turned. Substation gate opened.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'cat4_ppe_locker',
          title: 'PPE VERIFY',
          actionLabel: 'EXECUTE: 3. CONFIRM CAT 4 PPE',
          instructionEn: 'Confirm Category 4 (40 cal/cm²) arc flash suit and balaclava donned.',
          instructionHi: 'कैटेगरी 4 (40 cal/cm²) आर्क फ्लैश सूट और हुड की पुष्टि करें।',
          telemetryUpdates: { p4: { label: 'PPE Level', value: 'Cat 4 (40 cal) ACTIVE' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            return 'Category 4 (40 cal/cm²) suit, hood and dielectric boots verified.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'arc_flash_boundary_ring',
          title: 'ARC BOUNDARY',
          actionLabel: 'EXECUTE: 4. DEMARCATE BOUNDARY',
          instructionEn: 'Demarcate and confirm 4.2m limited approach boundary line.',
          instructionHi: '4.2 मीटर सीमित पहुंच सीमा रेखा को चिह्नित और पुष्टि करें।',
          telemetryUpdates: { p3: { label: 'Arc Boundary', value: '4.2m DEMARCATED' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            ring.material.color.setHex(0xef4444);
            return '4.2m Category 4 arc flash approach boundary established.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'hv_hot_stick',
          title: 'HOT STICK PREP',
          actionLabel: 'EXECUTE: 5. RETRIEVE HOT STICK',
          instructionEn: 'Retrieve and inspect 8ft fiberglass high-voltage hot stick.',
          instructionHi: '8-फुट फाइबरग्लास हाई-वोल्टेज हॉट स्टिक निकालें और जांचें।',
          telemetryUpdates: { p2: { label: 'Hot Stick', value: '8ft 35kV READY' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            stickGroup.position.set(0.4, 1.4, 0.2);
            stickGroup.rotation.x = -Math.PI / 4;
            return '8-foot dielectric fiberglass hot stick inspected and prepped.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'proximity_voltage_detector',
          title: 'PROXIMITY TEST',
          actionLabel: 'EXECUTE: 6. PROXIMITY TEST',
          instructionEn: 'Position non-contact sensor wand to confirm busbar field status.',
          instructionHi: 'नॉन-कॉन्टैक्ट सेंसर वैंड से बसबार डी-एनर्जाइज्ड स्थिति की पुष्टि करें।',
          telemetryUpdates: { p1: { label: 'Bus Voltage', value: '0.00 kV (ISOLATED)' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            proxSensor.material.color.setHex(0x00ff88);
            return 'Proximity wand verifies zero field on 13.8kV bus. Safe to approach.';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 7. SUB-SW-02: SF6 Circuit Breaker De-energization & Air Disconnect
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

        // Step 1: SF6 Pressure Gauge (0.62 MPa nominal in green band)
        const gaugeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 24), gaugeMat);
        gauge.rotation.x = Math.PI / 2;
        gauge.position.set(0, 0.25, 0.26);
        const gLcdTex = createTextCanvasTexture('0.62 MPa PASS', '#0f172a', '#22c55e', 256, 64, 'bold 20px monospace');
        const gLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.045), new THREE.MeshBasicMaterial({ map: gLcdTex }));
        gLabel.position.z = 0.018;
        gauge.add(gLabel);
        tankGroup.add(gauge);
        gauge.name = 'sf6_gas_gauge';
        interactiveObjects.push(gauge);

        // Step 2: Manual red TRIP pushbutton
        const tripBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        tripBtn.rotation.x = Math.PI / 2;
        tripBtn.position.set(0, -0.15, 0.25);
        tripBtn.name = 'mechanical_trip_button';
        tankGroup.add(tripBtn);
        interactiveObjects.push(tripBtn);

        // Step 3: Spring Discharge Indicator Flag
        const flagMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const springFlag = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.04), flagMat);
        springFlag.position.set(0, -0.05, 0.25);
        springFlag.name = 'spring_discharge_indicator';
        tankGroup.add(springFlag);
        interactiveObjects.push(springFlag);

        tankGroup.name = 'sf6_circuit_breaker';
        parentGroup.add(tankGroup);
        interactiveObjects.push(tankGroup);

        // Step 5: Visible 3-Phase Gang Air-Break Disconnect Switch (450mm air gap knife blades)
        const discGroup = new THREE.Group();
        discGroup.position.set(0.45, 1.3, -0.5);
        const insMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35 });
        const copperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.95 });

        const blades = [];
        [-0.22, 0, 0.22].forEach(x => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.4, 16), insMat);
          post.position.set(x, 0, 0);
          discGroup.add(post);

          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.35, 0.04), copperMat);
          blade.position.set(x, 0.26, 0.0);
          blade.rotation.x = 0;
          discGroup.add(blade);
          blades.push(blade);
        });

        // Step 4: Operating pipe handle
        const pipeGroup = new THREE.Group();
        pipeGroup.position.set(0.35, -0.2, 0.08);
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        pipeGroup.add(pipe);
        pipeGroup.name = 'gang_operating_handle';
        discGroup.add(pipeGroup);
        interactiveObjects.push(pipeGroup);

        // Step 6: OSHA Lockout Hasp & Master Lock Padlock
        const lotoHasp = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
        lotoHasp.position.set(0.35, -0.3, 0.08);
        lotoHasp.visible = false;
        lotoHasp.name = 'loto_hasp_padlock';
        discGroup.add(lotoHasp);
        interactiveObjects.push(lotoHasp);

        discGroup.name = 'air_disconnect_gang_switch';
        parentGroup.add(discGroup);
        interactiveObjects.push(discGroup);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'sf6_gas_gauge',
          title: 'SF6 GAUGE',
          actionLabel: 'EXECUTE: 1. INSPECT GAUGE',
          instructionEn: 'Inspect SF6 gas density gauge to verify nominal pressure (0.62 MPa).',
          instructionHi: 'सामान्य दबाव (0.62 MPa) सत्यापित करने के लिए SF6 गैस गेज देखें।',
          telemetryUpdates: { p1: { label: 'SF6 Gas Pressure', value: '0.62 MPa OK' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            return 'SF6 gas density verified at 0.62 MPa (optimal dielectric quenching).';
          }
        };

        stepInteractiveMap[2] = {
          name: 'mechanical_trip_button',
          title: 'TRIP BREAKER',
          actionLabel: 'EXECUTE: 2. PRESS TRIP BUTTON',
          instructionEn: 'Press mechanical red TRIP pushbutton to open circuit breaker contacts.',
          instructionHi: 'सर्किट ब्रेकर संपर्कों को खोलने के लिए मैकेनिकल लाल ट्रिप बटन दबाएं।',
          telemetryUpdates: { p2: { label: 'Breaker Status', value: 'TRIPPED / OPEN' } },
          execute: (app) => {
            if (snd && snd.playElectricArcBuzz) snd.playElectricArcBuzz();
            if (snd && snd.playRelayThud) snd.playRelayThud();
            tripBtn.position.z = 0.23;
            return 'SF6 circuit breaker tripped open. Main arc extinguished.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'spring_discharge_indicator',
          title: 'SPRING STATUS',
          actionLabel: 'EXECUTE: 3. DISCHARGE SPRING',
          instructionEn: 'Verify stored-energy closing spring status shows DISCHARGED.',
          instructionHi: 'सत्यापित करें कि क्लोजिंग स्प्रिंग स्थिति DISCHARGED दिखाती है।',
          telemetryUpdates: { p2: { label: 'Spring Status', value: 'DISCHARGED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            flagMat.color.setHex(0xf8fafc);
            return 'Stored energy mechanism confirmed fully discharged.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'gang_operating_handle',
          title: 'CRANK GANG SWITCH',
          actionLabel: 'EXECUTE: 4. CRANK HANDLE',
          instructionEn: 'Rotate manual operating pipe to open 3-phase air disconnect.',
          instructionHi: '3-फेज एयर डिस्कनेक्ट खोलने के लिए मैनुअल पाइप घुमाएं।',
          telemetryUpdates: { p3: { label: 'Operating Pipe', value: 'ROTATING OPEN' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            pipeGroup.rotation.z = Math.PI / 2;
            return 'Operating pipe cranked through 90°. Linkage engaged.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'air_disconnect_gang_switch',
          title: 'VISUAL AIR-GAP',
          actionLabel: 'EXECUTE: 5. VERIFY 450mm GAP',
          instructionEn: 'Visually inspect and verify 450mm visible air gap across all 3 phases.',
          instructionHi: 'सभी 3 फेजों पर 450 मिमी का दृश्यमान वायु अंतराल सत्यापित करें।',
          telemetryUpdates: { p3: { label: 'Air-Gap Distance', value: '450 mm OPEN PASS' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            blades.forEach(b => { b.rotation.x = 0.85; b.position.z = 0.12; });
            return '450mm physical air-gap visually confirmed across all 3 phases.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'loto_hasp_padlock',
          title: 'LOTO PADLOCK',
          actionLabel: 'EXECUTE: 6. APPLY LOTO LOCK',
          instructionEn: 'Apply red Lockout/Tagout hasp and Master Lock safety padlock to handle.',
          instructionHi: 'हैंडल पर लाल लॉकआउट/टैगआउट हैस्प और सुरक्षा पैडलॉक लगाएं।',
          telemetryUpdates: { p4: { label: 'LOTO Lock', value: 'SECURED HASP' } },
          execute: (app) => {
            if (snd && snd.playFuseSnap) snd.playFuseSnap();
            lotoHasp.visible = true;
            return 'OSHA red Lockout hasp and safety padlock secured to handle.';
          }
        };
      }

      // ---------------------------------------------------------------------
      // 8. BESS-CELL-01: 16S LiFePO4 Battery Energy Storage Rack & BMS
      // ---------------------------------------------------------------------
      else if (code.includes('BESS') || code.includes('CELL')) {
        defaultCameraPos.set(0, 1.4, 1.1);
        defaultControlsTarget.set(0, 1.0, -0.35);

        // 19-inch steel rack chassis
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 });
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.6, 0.7), rackMat);
        rack.position.set(0, 1.0, -0.6);
        parentGroup.add(rack);

        // Step 2: Slide-out battery tray chassis
        const trayGroup = new THREE.Group();
        trayGroup.position.set(0, 0.9, -0.1);
        const tray = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.28, 0.55), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
        trayGroup.add(tray);
        trayGroup.name = 'rack_chassis_tray';
        parentGroup.add(trayGroup);
        interactiveObjects.push(trayGroup);

        // Step 1: 16 Prismatics LiFePO4 cells (3.2V 280Ah each)
        const cellsGroup = new THREE.Group();
        const cellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });
        const capMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });

        const caps = [];
        for (let i = 0; i < 8; i++) {
          const cx = -0.35 + i * 0.10;
          const cz = i < 4 ? -0.14 : 0.14;

          const cell = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.22), cellMat);
          cell.position.set(cx, 0, cz);

          const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), capMat);
          cap1.position.set(cx - 0.04, 0.18, cz);
          const cap2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 16), capMat);
          cap2.position.set(cx + 0.04, 0.18, cz);

          cellsGroup.add(cell, cap1, cap2);
          caps.push(cap1, cap2);
        }
        trayGroup.add(cellsGroup);
        cellsGroup.name = 'cell_health_qc';
        interactiveObjects.push(cellsGroup);

        // Step 3: Flexible Copper Busbars
        const busbarGroup = new THREE.Group();
        const bbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
        for (let i = 0; i < 7; i++) {
          const bb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.02), bbMat);
          bb.position.set(-0.3 + i * 0.10, 0.12, 0);
          busbarGroup.add(bb);
        }
        trayGroup.add(busbarGroup);
        busbarGroup.name = 'flexible_copper_busbars';
        interactiveObjects.push(busbarGroup);

        // Step 4: Calibrated Torque Driver
        const driverGroup = new THREE.Group();
        driverGroup.position.set(0.4, 0.85, 0.2);
        const dShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        const dGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        dGrip.position.y = -0.12;
        driverGroup.add(dShaft, dGrip);
        driverGroup.name = 'terminal_torque_driver';
        parentGroup.add(driverGroup);
        interactiveObjects.push(driverGroup);

        // Step 5: Digital BMS Controller Graphic Display (Cell Delta: 4 mV)
        const bmsGroup = new THREE.Group();
        bmsGroup.position.set(0, 1.25, -0.15);
        const bmsLcdTex = createTextCanvasTexture('51.24V // ΔV = 4mV BALANCED', '#047857', '#ffffff', 320, 64, 'bold 18px monospace');
        const bmsLcd = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.09), new THREE.MeshBasicMaterial({ map: bmsLcdTex }));
        bmsGroup.add(bmsLcd);
        bmsGroup.name = 'bms_controller';
        parentGroup.add(bmsGroup);
        interactiveObjects.push(bmsGroup);

        // Step 6: Thermal Deflagration Exhaust Vent
        const ventGroup = new THREE.Group();
        ventGroup.position.set(0, 1.7, -0.6);
        const ventDuct = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 24), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
        ventGroup.add(ventDuct);
        ventGroup.name = 'exhaust_relief_vent';
        parentGroup.add(ventGroup);
        interactiveObjects.push(ventGroup);

        // Step Actions
        stepInteractiveMap[1] = {
          name: 'cell_health_qc',
          title: 'CELL HEALTH QC',
          actionLabel: 'EXECUTE: 1. QC CELL VOLTAGES',
          instructionEn: 'Inspect 16 prismatic cell terminals and measure open-circuit voltages.',
          instructionHi: '16 प्रिज्मैटिक सेल टर्मिनलों और ओपन-सर्किट वोल्टेज की जांच करें।',
          telemetryUpdates: { p2: { label: 'Max Cell Delta-V', value: '4 mV BALANCED' } },
          execute: (app) => {
            if (snd && snd.playProbeBeep) snd.playProbeBeep();
            return '16 prismatic cells inspected. Delta-V verified at 4 mV.';
          }
        };

        stepInteractiveMap[2] = {
          name: 'rack_chassis_tray',
          title: 'TRAY RACKING',
          actionLabel: 'EXECUTE: 2. INSERT TRAY',
          instructionEn: 'Slide 16S battery tray chassis into the 19-inch steel rack enclosure.',
          instructionHi: '16S बैटरी ट्रे चेसिस को 19-इंच स्टील रैक में स्लाइड करें।',
          telemetryUpdates: { p1: { label: 'Rack Position', value: 'TRAY LATCHED' } },
          execute: (app) => {
            if (snd && snd.playHydraulicGateWhoosh) snd.playHydraulicGateWhoosh();
            trayGroup.position.z = -0.35;
            return '16S battery tray chassis inserted into 19-inch rack.';
          }
        };

        stepInteractiveMap[3] = {
          name: 'flexible_copper_busbars',
          title: 'FLEX BUSBARS',
          actionLabel: 'EXECUTE: 3. BOLT BUSBARS',
          instructionEn: 'Bolt 15 flexible nickel-plated copper busbars across cells in series.',
          instructionHi: 'श्रृंखला में 15 लचीले निकल-तांबा बसबार स्थापित करें।',
          telemetryUpdates: { p3: { label: 'Series Busbars', value: '15/15 INSTALLED' } },
          execute: (app) => {
            if (snd && snd.playSwitchClick) snd.playSwitchClick();
            busbarGroup.position.y = 0;
            return '15 flexible nickel-plated copper busbars bolted in series.';
          }
        };

        stepInteractiveMap[4] = {
          name: 'terminal_torque_driver',
          title: 'TORQUE FASTENERS',
          actionLabel: 'EXECUTE: 4. TORQUE TERMINALS',
          instructionEn: 'Torque all terminal M6 flange nuts to 12.0 N·m and seat orange caps.',
          instructionHi: 'टर्मिनल नट्स को 12.0 N*m पर कसें और नारंगी इंसुलेटिंग कैप लगाएं।',
          telemetryUpdates: { p4: { label: 'Busbar Torque', value: '12.0 N*m // 32 CAPS' } },
          execute: (app) => {
            if (snd && snd.playRatchetingSound) snd.playRatchetingSound();
            caps.forEach(c => { c.position.y = 0.12; });
            return 'M6 flange nuts torqued to 12.0 N·m. 32 orange caps locked.';
          }
        };

        stepInteractiveMap[5] = {
          name: 'bms_controller',
          title: 'BMS HARNESS',
          actionLabel: 'EXECUTE: 5. PLUG BMS HARNESS',
          instructionEn: 'Plug 16-pin voltage sensing harness into master digital BMS controller.',
          instructionHi: '16-पिन वोल्टेज सेंसिंग हार्नेस को डिजिटल बीएमएस कंट्रोलर में प्लग करें।',
          telemetryUpdates: { p1: { label: 'Pack Voltage', value: '51.24 V DC' } },
          execute: (app) => {
            if (snd && snd.playSuccessChime) snd.playSuccessChime();
            return '16-pin BMS voltage sensing harness plugged. Pack energized at 51.24V.';
          }
        };

        stepInteractiveMap[6] = {
          name: 'exhaust_relief_vent',
          title: 'EXHAUST RELIEF',
          actionLabel: 'EXECUTE: 6. CHECK EXHAUST VENT',
          instructionEn: 'Inspect deflagration burst disc and active thermal extraction ducting.',
          instructionHi: 'डिफ्लैग्रेशन बर्स्ट डिस्क और थर्मल डक्टिंग का निरीक्षण करें।',
          telemetryUpdates: { p3: { label: 'Rack Temp', value: '23.4 °C NOMINAL' } },
          execute: (app) => {
            if (snd && snd.playAirHiss) snd.playAirHiss();
            else if (snd && snd.playFuseSnap) snd.playFuseSnap();
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
return {
    ExplodedViewBuilder,
    ModuleEquipmentBuilder
  };
}));
