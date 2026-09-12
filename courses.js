// courses.js - Complete Multi-Track Curriculum & Multimodal Prep Center
// MAYAVUE 6-Stage End-to-End VR Certification Platform

const COURSES = [
  {
    id: 'solar-pv',
    courseCode: 'SOLAR-PV-01',
    title: 'Solar Rooftop Installation & High Voltage DC Commissioning',
    category: 'Renewable Energy',
    standard: 'NABCEP / OSHA 1910 / NFPA 70E Aligned',
    description: 'Comprehensive hands-on curriculum spanning mechanical racking, high-voltage DC stringing, combiner box safe isolation, blown fuse diagnostics, and utility inverter hookup.',
    totalModules: 5,
    totalTopics: 15,
    estimatedHours: 40,
    enrolled: true,
    progressPct: 80,
    modules: [
      {
        id: 'module_01',
        code: 'SOLAR-ROOF-01',
        moduleNumber: 1,
        title: 'Site Feasibility & Structural Racking Assembly',
        summary: 'Solar irradiance calculations, structural roof load assessments, flashing waterproofing, and Unistrut aluminum rail leveling.',
        status: 'completed',
        progress: 100,
        badge: 'CERTIFIED',
        simulationConfig: {
          simulationId: 'module_01',
          code: 'SOLAR-ROOF-01',
          title: 'Site Feasibility & Structural Racking Assembly',
          envType: 'racking_lab',
          name: 'Rooftop Structural Racking & Sun Angle Irradiance Lab',
          standard: 'OSHA 1926.502 / NABCEP PV Associate',
          telemetry: {
            p1: { label: 'Tilt Angle', value: '25.0° OPTIMAL' },
            p2: { label: 'Irradiance', value: '880 W/m²' },
            p3: { label: 'Azimuth', value: '180° TRUE S' },
            p4: { label: 'Roof Load', value: '18.5 kg/m² OK' }
          },
          steps: [
            '1. ROOF INSPECT: Verify structural rafter integrity and load bearing capacity.',
            '2. AZIMUTH ALIGN: Use magnetic compass to locate 180° True South solar window.',
            '3. INCLINOMETER: Set racking L-feet to 25.0° optimal latitude tilt angle.',
            '4. PYRANOMETER: Measure real-time rooftop solar irradiance (>800 W/m²).',
            '5. UNISTRUT RAILS: Fasten aerospace aluminum rails with torque wrench to 14 N*m.',
            '6. WATERPROOF SEAL: Inspect EPDM rubber flashing boots against rain penetration.'
          ],
          telemetryLog: {
            azimuth_deg: 180,
            tilt_angle: '25.0°',
            irradiance: '880 W/m²',
            structural_load_status: 'CONFIRMED PASS'
          }
        },
        topics: [
          {
            id: 'site_feasibility_01',
            title: 'Roof Azimuth, Shadow Shading & Tilt Angle Optimization',
            durationMinutes: 45,
            status: 'completed',
            bestScore: 98.0,
            syllabus: {
              overview: 'Calculate optimal annual solar irradiation using pyranometer data, solar path finders, and seasonal tilt angle compensation (25° latitude standard).',
              sld: 'SOLAR RADIATION INCIDENT -> ROOF SURFACE ANGLE (25°) -> TRUE SOUTH ALIGNMENT',
              ratings: [
                { parameter: 'Target Azimuth', value: '180° (True South ± 15°)' },
                { parameter: 'Ideal Tilt Angle', value: '25° to 30° Optimal' },
                { parameter: 'Annual Solar Window', value: '09:00 to 16:00 Solar Time' },
                { parameter: 'Minimum Shading Factor', value: '< 3% Inter-row Loss' }
              ],
              tools: [
                'Solar Path Finder / Digital Inclinometer',
                'Laser Distance Measurer (±1.5mm)',
                'Roof Surface Anemometer',
                'Hard Hat, UV Eye Protection, Steel-Toe Boots'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'Course Orientation & Site Safety' },
              { time: '02:40', title: 'Solar Path & Tilt Measurement' },
              { time: '06:15', title: 'Roof Truss Structural Verification' },
              { time: '11:30', title: 'Review & Hands-on Assessment' }
            ],
            explodedViewType: 'racking'
          }
        ]
      },
      {
        id: 'module_02',
        code: 'SOLAR-MOUNT-02',
        moduleNumber: 2,
        title: 'PV Panel Mounting & End/Mid-Clamp Mechanical Torquing',
        summary: 'Safe handling of monocrystalline bifacial PV modules, thermal expansion spacing, and calibrated clamp torquing.',
        status: 'completed',
        progress: 100,
        badge: 'CERTIFIED',
        simulationConfig: {
          simulationId: 'module_02',
          code: 'SOLAR-MOUNT-02',
          title: 'PV Panel Mounting & End/Mid-Clamp Mechanical Torquing',
          envType: 'panel_mount',
          name: 'Bifacial PV Panel Mounting & Calibrated Clamp Torquing Station',
          standard: 'UL 2703 / NEC 690.43 Grounding Standard',
          telemetry: {
            p1: { label: 'Mid-Clamp Torque', value: '15.5 N*m' },
            p2: { label: 'End-Clamp Torque', value: '14.0 N*m' },
            p3: { label: 'Thermal Gap', value: '20 mm NOMINAL' },
            p4: { label: 'Ground Bond', value: '0.04 Ω PASS' }
          },
          steps: [
            '1. PANEL LIFT: Hoist 550W bifacial monocrystalline panel onto aluminum rails.',
            '2. WEEB CLIPS: Seat serrated WEEB bonding washer between rail and module frame.',
            '3. THERMAL GAP: Gauge 20mm uniform thermal expansion space between modules.',
            '4. MID-CLAMPS: Position stainless steel mid-clamp channel and finger-tighten.',
            '5. TORQUE WRENCH: Torque 6mm hex bolt with calibrated wrench until 15.5 N*m click.',
            '6. BONDING TEST: Verify <0.1Ω continuity to ground rail with digital micro-ohmmeter.'
          ],
          telemetryLog: {
            panel_type: '550W Bifacial PERC',
            mid_clamp_torque: '15.5 N*m',
            end_clamp_torque: '14.0 N*m',
            ground_bond_resistance: '0.04 Ohm'
          }
        },
        topics: [
          {
            id: 'pv_panel_mounting_02',
            title: 'Mid-Clamp & End-Clamp Torquing & Grounding Bonding',
            durationMinutes: 50,
            status: 'completed',
            bestScore: 95.5,
            syllabus: {
              overview: 'Fasten monocrystalline panels using stainless steel mid-clamps, verify 20mm thermal spacing gaps, and ground frames using serrated WEEB grounding clips.',
              sld: 'PV MODULE FRAME -> WEEB BONDING CLIP -> ANODIZED ALUMINUM RAIL -> #6 AWG BARE COPPER GROUND',
              ratings: [
                { parameter: 'End-Clamp Torque', value: '14.0 N*m ± 0.5' },
                { parameter: 'Mid-Clamp Torque', value: '15.5 N*m ± 0.5' },
                { parameter: 'Grounding Lug Torque', value: '4.0 N*m' },
                { parameter: 'Thermal Gap Between Panels', value: '20.0 mm Nominal' }
              ],
              tools: [
                'Calibrated 1/4" Torque Wrench (5-25 N*m)',
                '6mm Hex Ball-End Driver Bit',
                'Ground Resistance Tester (Megger)',
                'Class 0 Insulated Gloves (1000V rated)'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'Module Unpacking & Edge Protection' },
              { time: '03:10', title: 'WEEB Grounding Clip Placement' },
              { time: '07:45', title: 'Clamp Torquing Calibration' },
              { time: '12:00', title: 'Inspection Checklist' }
            ],
            explodedViewType: 'panel_clamp'
          }
        ]
      },
      {
        id: 'module_03',
        code: 'SOLAR-DC-03',
        moduleNumber: 3,
        title: 'DC Cabling, MC4 Crimping & String Wiring',
        summary: 'Photovoltaic DC cable sizing, MC4 male/female connector assembly, pull testing, and polarity mapping.',
        status: 'completed',
        progress: 100,
        badge: 'CERTIFIED',
        simulationConfig: {
          simulationId: 'module_03',
          code: 'SOLAR-DC-03',
          title: 'DC Cabling, MC4 Crimping & String Wiring',
          envType: 'dc_cabling',
          name: 'DC String Cabling, Wire Stripping & MC4 Connector Crimp Lab',
          standard: 'IEC 62852 / NEC 690.31 Photovoltaic Wiring',
          telemetry: {
            p1: { label: 'Cable Sizing', value: '6mm² (10 AWG)' },
            p2: { label: 'Strip Depth', value: '7.5 mm' },
            p3: { label: 'Pull Retention', value: '345 N PASS' },
            p4: { label: 'Contact Res.', value: '0.18 mΩ' }
          },
          steps: [
            '1. STRIP CABLE: Strip 7.5mm of outer insulation from 6mm² PV1-F solar cable.',
            '2. INSPECT STRANDS: Ensure zero sheared copper strands and uniform tinned conductor.',
            '3. PIN INSERT: Slide silver-plated contact pin onto stripped copper core.',
            '4. RATCHET CRIMP: Compress pin with Rennsteig crimper until full ratchet release.',
            '5. HOUSING SNAP: Push crimped pin into IP68 MC4 body until audible lock click.',
            '6. PULL-TEST RIG: Clamp connector and confirm retention exceeds 310 N threshold.'
          ],
          telemetryLog: {
            cable_spec: '6mm2 PV1-F UV',
            strip_depth_mm: 7.5,
            pull_force_n: 345,
            contact_mOhm: 0.18
          }
        },
        topics: [
          {
            id: 'dc_cabling_mc4_03',
            title: 'MC4 Pin Crimping, Moisture Seals & Polarity Verification',
            durationMinutes: 55,
            status: 'completed',
            bestScore: 96.0,
            syllabus: {
              overview: 'Strip 4mm² / 6mm² PV1-F solar cable, apply ratchet crimp to silver-plated contact pins, insert into IP68 MC4 housings until click, and verify positive/negative home run polarity.',
              sld: 'STRING (+) -> MC4 FEMALE PIN -> HOMERUN DC CABLE (RED 6mm²) -> COMBINER BOX DC DISCONNECT',
              ratings: [
                { parameter: 'Cable Spec', value: '6mm² (10 AWG) PV1-F UV-Resistant' },
                { parameter: 'Max String Voltage', value: '1000V DC (IEC 62852)' },
                { parameter: 'Contact Resistance', value: '< 0.25 mOhm' },
                { parameter: 'Pull-Off Retention Force', value: '> 310 N' }
              ],
              tools: [
                'PV Solar Cable Stripper (2.5 - 6mm²)',
                'Rennsteig / MC4 Multi-Contact Ratchet Crimper',
                'MC4 Assembly Disconnect Spanners',
                'Digital Multimeter (1000V CAT III)'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'Cable Stripping Depth Guide' },
              { time: '02:50', title: 'Ratchet Crimp Verification' },
              { time: '06:30', title: 'Housing Insertion & Gland Torquing' },
              { time: '10:15', title: 'String Continuity & Open Circuit Voc Check' }
            ],
            explodedViewType: 'mc4_connector'
          }
        ]
      },
      {
        id: 'module_04',
        code: 'SOLAR-BOX-01',
        moduleNumber: 4,
        title: 'Combiner Box, DC Isolator & Battery Troubleshooting',
        summary: 'NFPA 70E safe isolation, Fluke 87V CAT IV voltage testing, blown 15A fuse extraction, and 48V LiFePO4 battery commissioning.',
        status: 'active',
        progress: 85,
        badge: 'IN PROGRESS',
        simulationConfig: {
          simulationId: 'solar_troubleshooting_04',
          code: 'SOLAR-BOX-01',
          title: 'Combiner Box, DC Isolator & Battery Troubleshooting',
          envType: 'combiner_box',
          name: 'Substation Combiner Box Safe Isolation & LiFePO4 Battery Lab',
          standard: 'NFPA 70E / OSHA 1910.303 Safe Work Practices',
          telemetry: {
            p1: { label: 'Roof PV Voc', value: '480.0 V' },
            p2: { label: 'Irradiance', value: '880 W/m²' },
            p3: { label: 'Bus Voltage', value: '480.0 V' },
            p4: { label: 'Battery Bay', value: '48V LiFePO4' }
          },
          steps: [
            '1. MAIN GATE: Open security fence interlock gate to access enclosure.',
            '2. SAFE ISOLATION: Rotate 1000V DC rotary disconnect switch to safe OFF position.',
            '3. PROBE VOLTAGE: Probe high-voltage bus with Fluke 87V to confirm 0.0V de-energized.',
            '4. FIX CIRCUIT: Extract blown 15A fuse with insulated puller and seat replacement.',
            '5. TOOL BOX: Retrieve calibrated torque driver and confirm busbar fasteners.',
            '6. NEW BATTERY: Torque 48V LiFePO4 battery terminal lugs to calibrated 15 N*m.'
          ],
          telemetryLog: {
            voc_probed: '480.0V DC',
            isolated_bus_voltage: '0.0V DC',
            fuse_continuity: 'FUSE 3 REPLACED PASS',
            battery_bus: '48V LiFePO4 BUS CONNECTED 15 N*m'
          }
        },
        topics: [
          {
            id: 'solar_troubleshooting_04',
            title: 'DC Combiner Box Isolation, Blown Fuse Replacement & Battery Installation',
            durationMinutes: 60,
            status: 'active',
            bestScore: 99.2,
            syllabus: {
              overview: 'Execute OSHA & NFPA 70E safe isolation procedure on a live 480V DC solar array combiner box. Diagnose string open-circuit voltage, rotate the high-voltage disconnect switch, safely extract and replace blown 15A DC fuses, and safely commission the 48V LiFePO4 battery subsystem without electrical arc flash.',
              sld: 'PV STRINGS (480V Voc) -> 15A gPV FUSES -> 1000V DC ROTARY ISOLATOR -> SURGE ARRESTER (SPD) -> LAB 48V LiFePO4 BATTERY BUS',
              ratings: [
                { parameter: 'Rooftop Array Open-Circuit Voltage', value: '480.0 V DC (Under 880 W/m² irradiance)' },
                { parameter: 'Fuse Rating', value: '15A, 1000V DC, 10x38mm gPV Midget' },
                { parameter: 'DC Isolator Switch', value: '4-Pole, 1000V DC / 32A Rated' },
                { parameter: 'Battery Storage Bank', value: '48V DC 100Ah LiFePO4 Module' },
                { parameter: 'Maximum Arc Flash Boundary', value: '1.2 meters (Category 2 PPE Required)' }
              ],
              tools: [
                'NFPA 70E Arc Flash Safety Station (Hard Hat, Visor, 1000V Insulated Gloves)',
                'Fluke 87V CAT IV Industrial Digital Multimeter (1000V rated leads)',
                'Insulated Fuse Puller Tool (VDE 1000V Certified)',
                'Spare 15A 1000V DC Cylindrical Fuses',
                'Calibrated 15 N*m Insulated Terminal Torque Wrench'
              ],
              remedialTheory: {
                safety_isolation: {
                  title: 'NFPA 70E Arc Flash Hazard & Zero-Energy Safe Isolation Protocol',
                  badge: 'MANDATORY REMEDIAL // SAFETY BENCHMARK <90%',
                  standard: 'OSHA 1910.333 / NFPA 70E Article 120',
                  keyTakeaways: [
                    'Always verify zero energy (0.0V DC) with CAT IV 1000V rated Fluke 87V probes BEFORE touching any busbar or fuse clips.',
                    'Don Category 2 Arc Flash Visor (8 cal/cm²) and Class 0 1000V Insulated Gloves with leather outer protectors prior to opening the live DC enclosure.',
                    'Confirm rotary DC isolator has completed a mechanical 90-degree positive-break rotation into the locked-out position.'
                  ],
                  criticalRules: [
                    'NEVER pull a fuse while energized under load—doing so produces a plasma arc flash capable of causing severe thermal burns.',
                    'Always test multimeter on a known live voltage source both before and after confirming zero energy (Live-Dead-Live rule).'
                  ],
                  videoChapterIndex: 0
                },
                diagnostics: {
                  title: 'High-Voltage DC Diagnostics & Blown 1000V gPV Fuse Extraction',
                  badge: 'MANDATORY REMEDIAL // DIAGNOSTICS BENCHMARK <80%',
                  standard: 'IEC 60269-6 / UL 248-19 Photovoltaic Fuses',
                  keyTakeaways: [
                    'Open-circuit string voltage (Voc) under 880 W/m² irradiance should read approximately 480V DC on healthy strings.',
                    'A reading of 0.0V downstream of a fuse while upstream reads 480V indicates an open-circuit blown fuse.',
                    'Always use a VDE-certified 1000V insulated fuse extractor tool rather than fingers or uninsulated pliers.'
                  ],
                  criticalRules: [
                    'Inspect the replacement fuse rating: Must be 15A 1000V DC 10x38mm gPV type; never use an automotive or AC fuse.',
                    'Torque battery terminal lugs and busbar fasteners strictly to calibrated 15 N·m to avoid high-resistance thermal hotspots.'
                  ],
                  videoChapterIndex: 3
                }
              }
            },
            videoChapters: [

              { time: '00:00', title: 'Arc Flash Hazard Review & NFPA 70E Donning' },
              { time: '02:15', title: 'Multimeter Probing of 480V DC Rooftop Strings' },
              { time: '05:40', title: 'Rotary DC Isolator Safe De-energization' },
              { time: '08:20', title: 'Fuse Continuity Testing & Safe Extraction' },
              { time: '11:00', title: '48V LiFePO4 Battery Busbar Connection & Torque' }
            ],
            explodedViewType: 'combiner_box'
          }
        ]
      },
      {
        id: 'module_05',
        code: 'SOLAR-GRID-05',
        moduleNumber: 5,
        title: '3-Phase Inverter Commissioning & Grid Interconnection',
        summary: 'String inverter DC/AC parameter setup, anti-islanding relay testing, utility net metering synchronization, and rapid shutdown compliance.',
        status: 'locked',
        progress: 0,
        badge: 'LOCKED',
        simulationConfig: {
          simulationId: 'module_05',
          code: 'SOLAR-GRID-05',
          title: '3-Phase Inverter Commissioning & Grid Interconnection',
          envType: 'inverter_room',
          name: 'Commercial 3-Phase Utility Inverter Commissioning Lab',
          standard: 'IEEE 1547-2018 / UL 1741-SB Grid Interconnection',
          telemetry: {
            p1: { label: 'AC Grid Voltage', value: '480V 3-Phase Wye' },
            p2: { label: 'Grid Frequency', value: '60.02 Hz' },
            p3: { label: 'Phase Rotation', value: 'L1-L2-L3 CW PASS' },
            p4: { label: 'Anti-Islanding', value: '1.4s (< 2.0s)' }
          },
          steps: [
            '1. PHASE ROTATION: Connect rotation meter to L1/L2/L3 to verify clockwise rotation.',
            '2. AC DISCONNECT: Measure 480V AC phase-to-phase and 277V phase-to-neutral.',
            '3. DC MPPT INPUT: Check DC string polarity and open-circuit voltage before switch on.',
            '4. INVERTER BOOT: Close main AC breaker and energize inverter digital LCD display.',
            '5. GRID SYNC: Confirm frequency synchronization (59.3 - 60.5 Hz operating window).',
            '6. ANTI-ISLANDING: Trigger simulated utility trip and verify shutdown under 2.0s.'
          ],
          telemetryLog: {
            ac_voltage_ll: '480.2V AC',
            grid_frequency: '60.02 Hz',
            phase_sequence: 'CW L1-L2-L3 PASS',
            anti_islanding_trip_time: '1.42 sec'
          }
        },
        topics: [
          {
            id: 'inverter_commissioning_05',
            title: 'Grid Sync, Anti-Islanding Protection & Rapid Shutdown',
            durationMinutes: 65,
            status: 'locked',
            bestScore: 0,
            syllabus: {
              overview: 'Verify 480V 3-phase phase rotation (L1, L2, L3), set inverter grid code parameters, test anti-islanding trip times (< 2.0 sec), and initiate rapid shutdown actuator test.',
              sld: 'COMBINER DC OUT -> INVERTER MPPT -> AC DISCONNECT -> 480V/277V 3-PHASE UTILITY GRID',
              ratings: [
                { parameter: 'Nominal AC Voltage', value: '480V L-L / 277V L-N 3-Phase Wye' },
                { parameter: 'Grid Frequency Tolerance', value: '59.3 Hz - 60.5 Hz' },
                { parameter: 'Rapid Shutdown Limit', value: '< 30V within 30 seconds' },
                { parameter: 'THD (Total Harmonic Distortion)', value: '< 3.0% at Rated Power' }
              ],
              tools: [
                'Fluke 1587 FC Insulation Multimeter',
                'Phase Rotation Meter (CAT IV 600V)',
                'Calibrated AC/DC Current Clamp Meter',
                'NFPA 70E Arc Flash Kit'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'Inverter Enclosure Inspection' },
              { time: '03:15', title: 'Phase Rotation Verification' },
              { time: '07:30', title: 'Grid Code Parameter Setup' },
              { time: '12:00', title: 'Anti-Islanding Trip Testing' }
            ],
            explodedViewType: 'inverter'
          }
        ]
      }
    ]
  },
  {
    id: 'substation-troubleshooting',
    courseCode: '3PHASE-SUB-02',
    title: 'Electrical Sub-Station & 3-Phase Grid Safe Isolation',
    category: 'High Voltage Utility',
    standard: 'IEEE 1584 / OSHA 1910.269 High Voltage Compliant',
    description: 'Master high-voltage substation switching, 3-phase SF6 gas circuit breaker safe isolation, grounding cluster attachment, and Lockout/Tagout (LOTO) protocols.',
    totalModules: 4,
    totalTopics: 12,
    estimatedHours: 35,
    enrolled: true,
    progressPct: 45,
    modules: [
      {
        id: 'sub_mod_01',
        code: 'SUB-LOTO-01',
        moduleNumber: 1,
        title: 'OSHA 1910.269 Substation Entry & Arc Flash Hazard Analysis',
        summary: 'Incident energy calculations (cal/cm²), boundary flagging, and 40 cal/cm² arc flash suit donning.',
        status: 'completed',
        progress: 100,
        badge: 'CERTIFIED',
        simulationConfig: {
          simulationId: 'sub_mod_01',
          code: 'SUB-LOTO-01',
          title: 'OSHA 1910.269 Substation Entry & Arc Flash Hazard Analysis',
          envType: 'substation_yard',
          name: '13.8kV Utility Substation Yard & Arc Flash Perimeter Lab',
          standard: 'OSHA 1910.269 / IEEE 1584 Arc Flash Standard',
          telemetry: {
            p1: { label: 'Nominal Bus', value: '13.8 kV AC' },
            p2: { label: 'Available Fault', value: '25 kA RMS' },
            p3: { label: 'Arc Boundary', value: '4.2 meters' },
            p4: { label: 'PPE Level', value: 'Cat 4 (40 cal)' }
          },
          steps: [
            '1. PERIMETER INSPECT: Walk substation fence line and verify earth ground bonding.',
            '2. INTERLOCK KEY: Retrieve trapped-key interlock from master control station.',
            '3. DON PPE: Suit up in 40 cal/cm² arc flash suit, hood with blower, and Class 4 gloves.',
            '4. ARC BOUNDARY: Deploy 4.2-meter perimeter warning tape and flashing beacon.',
            '5. HOT STICK PREP: Inspect 8ft fiberglass shotgun hot stick for cracks or flash tracking.',
            '6. VOLTAGE DETECTOR: Probe 13.8kV busbar with non-contact wand; verify silence.'
          ],
          telemetryLog: {
            substation_voltage: '13.8kV AC',
            arc_energy_cal_cm2: 38.5,
            boundary_clearance_m: 4.2,
            zero_energy_verified: 'ABSENCE OF VOLTAGE CONFIRMED'
          }
        },
        topics: [
          {
            id: 'sub_entry_01',
            title: 'Substation Gate Interlock & High Voltage PPE Protocol',
            durationMinutes: 40,
            status: 'completed',
            bestScore: 97.5,
            syllabus: {
              overview: 'Perform substation perimeter inspection, verify dual ground grid bonding, and don 40 cal/cm² arc flash PPE.',
              sld: '13.8kV FEEDER -> GANTRY DISCONNECT -> SF6 BREAKER -> STEP-DOWN TRANSFORMER',
              ratings: [
                { parameter: 'Nominal Bus Voltage', value: '13,800 V AC 3-Phase' },
                { parameter: 'Available Fault Current', value: '25 kA Sym RMS' },
                { parameter: 'Arc Flash Boundary', value: '4.2 meters' },
                { parameter: 'Required PPE Category', value: 'Category 4 (40 cal/cm²)' }
              ],
              tools: [
                '40 cal/cm² Arc Flash Suit & Hood with Air System',
                'Class 4 Insulated Rubber Gloves (36,000V rated)',
                'Fiberglass Hot Stick (Shotgun Stick 8ft)',
                'Non-Contact High Voltage Detector (1kV - 132kV)'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'Substation Entry Protocols' },
              { time: '03:20', title: 'Arc Flash Boundary Mapping' },
              { time: '07:10', title: 'Hot Stick Inspection & Corona Testing' }
            ],
            explodedViewType: 'substation_bay'
          }
        ]
      },
      {
        id: 'sub_mod_02',
        code: 'SUB-SW-02',
        moduleNumber: 2,
        title: 'SF6 Circuit Breaker De-energization & Visible Air-Gap Isolation',
        summary: 'Manual spring charge release, remote trip actuator verification, and gang-operated air disconnect blade opening.',
        status: 'active',
        progress: 50,
        badge: 'IN PROGRESS',
        simulationConfig: {
          simulationId: 'sub_mod_02',
          code: 'SUB-SW-02',
          title: 'SF6 Circuit Breaker De-energization & Visible Air-Gap Isolation',
          envType: 'sf6_switchgear',
          name: 'SF6 Gas Circuit Breaker & 3-Phase Gang Air Disconnect Lab',
          standard: 'IEEE C37.04 / NFPA 70E Article 120 LOTO',
          telemetry: {
            p1: { label: 'SF6 Gas Pressure', value: '0.62 MPa OK' },
            p2: { label: 'Breaker Status', value: 'TRIPPED / OPEN' },
            p3: { label: 'Air-Gap Blades', value: '450 mm OPEN' },
            p4: { label: 'LOTO Lock', value: 'SECURED HASP' }
          },
          steps: [
            '1. SF6 GAUGE: Inspect breaker gas density gauge to ensure needle is in green zone (>0.55 MPa).',
            '2. TRIP BREAKER: Depress mechanical manual trip button; confirm semaphore shows OPEN.',
            '3. CHARGE RELEASE: Release spring energy mechanism to prevent inadvertent reclosure.',
            '4. CRANK GANG SWITCH: Insert operating handle and crank 3-phase air disconnect open.',
            '5. VISUAL AIR-GAP: Visually inspect all 3 phases for 450mm visible air gap clearance.',
            '6. LOTO PADLOCK: Apply red Master Lock hasp, padlock, and danger tag to handle.'
          ],
          telemetryLog: {
            sf6_pressure_mpa: 0.62,
            breaker_semaphore: 'GREEN OPEN',
            air_gap_mm: 450,
            loto_tag_id: 'LOTO-SUB-7702'
          }
        },
        topics: [
          {
            id: 'sub_breaker_isolation_02',
            title: '3-Phase Gang Switch Disconnect & LOTO Hasps',
            durationMinutes: 50,
            status: 'active',
            bestScore: 92.0,
            syllabus: {
              overview: 'Trip 13.8kV SF6 breaker, visually confirm semaphore open status, crank open gang-operated air break disconnect, and padlock LOTO hasps.',
              sld: 'AIR BREAK DISCONNECT [OPEN] -> SF6 BREAKER [TRIPPED] -> GROUNDING CLUSTER [APPLIED]',
              ratings: [
                { parameter: 'Continuous Current', value: '1200 A' },
                { parameter: 'SF6 Gas Pressure', value: '0.6 MPa Nominal' },
                { parameter: 'Air Gap Clearance', value: '450 mm Minimum' }
              ],
              tools: [
                'Rotary Operating Handle Lever',
                'Safety Padlocks & Danger Tags (Master Lock 410)',
                'Insulated High Voltage Probes',
                'Calibrated Grounding Ball Stud Wrench'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'SF6 Gas Pressure Verification' },
              { time: '04:00', title: 'Gang Disconnect Mechanical Opening' },
              { time: '08:30', title: 'LOTO Lock Placement' }
            ],
            explodedViewType: 'air_disconnect'
          }
        ]
      }
    ]
  },
  {
    id: 'bess-storage',
    courseCode: 'BESS-COMM-03',
    title: 'Commercial LiFePO4 Battery Energy Storage Systems (BESS)',
    category: 'Energy Storage & Safety',
    standard: 'NFPA 855 / UL 9540 Energy Storage Standards',
    description: 'Safe rack integration of high-voltage Lithium Iron Phosphate storage, Battery Management System (BMS) balancing, thermal runaway mitigation, and rapid emergency stop commissioning.',
    totalModules: 3,
    totalTopics: 9,
    estimatedHours: 25,
    enrolled: true,
    progressPct: 20,
    modules: [
      {
        id: 'bess_mod_01',
        code: 'BESS-CELL-01',
        moduleNumber: 1,
        title: 'LiFePO4 Chemistry, Thermal Runaway & Deflagration Safety',
        summary: 'Cell voltage balancing (3.2V nominal), temperature limits, aerosol fire suppression interlocks, and deflagration venting.',
        status: 'active',
        progress: 60,
        badge: 'IN PROGRESS',
        simulationConfig: {
          simulationId: 'bess_mod_01',
          code: 'BESS-CELL-01',
          title: 'LiFePO4 Chemistry, Thermal Runaway & Deflagration Safety',
          envType: 'bess_container',
          name: 'Commercial 16S LiFePO4 BESS Rack Assembly & BMS Balancing Lab',
          standard: 'NFPA 855 / UL 9540 Energy Storage Safety Standard',
          telemetry: {
            p1: { label: 'String Voltage', value: '51.2 V DC' },
            p2: { label: 'Max Delta-V', value: '12 mV PASS' },
            p3: { label: 'Rack Temp', value: '23.4 °C NOMINAL' },
            p4: { label: 'Busbar Torque', value: '12.0 N*m' }
          },
          steps: [
            '1. CELL HEALTH: Measure 16 individual LiFePO4 cells to verify delta-V < 25mV.',
            '2. TRAY RACKING: Slide 16S tray into 19-inch steel cabinet and engage locking pins.',
            '3. FLEX BUSBARS: Install nickel-plated copper flexible busbars across cell terminals.',
            '4. TORQUE FASTENERS: Torque terminal bolts to calibrated 12.0 N*m with insulated wrench.',
            '5. BMS HARNESS: Plug in multichannel voltage sensing harness and CAN communication.',
            '6. EXHAUST VENT: Inspect deflagration burst disk and aerosol fire extinguisher head.'
          ],
          telemetryLog: {
            battery_chemistry: '16S LiFePO4 (51.2V 100Ah)',
            cell_delta_v_mv: 12,
            busbar_torque_nm: 12.0,
            thermal_status: '23.4C STABLE NO RUNAWAY'
          }
        },
        topics: [
          {
            id: 'bess_cells_01',
            title: 'Cell Delta-V Diagnosis, BMS Balancing & Rack Assembly',
            durationMinutes: 45,
            status: 'active',
            bestScore: 94.0,
            syllabus: {
              overview: 'Assemble 16S 48V battery modules, connect copper flex busbars with calibrated 12 N*m torque, and connect BMS communication harness.',
              sld: '16S LiFePO4 CELLS (51.2V DC) -> BMS CONTACTOR -> 200A CLASS T FUSE -> MAIN BESS DC BUS',
              ratings: [
                { parameter: 'Nominal Rack Voltage', value: '51.2 V DC (16 x 3.2V)' },
                { parameter: 'Maximum Charge Voltage', value: '57.6 V DC (3.60V/cell)' },
                { parameter: 'Max Permissible Delta-V', value: '< 25 mV between cells' },
                { parameter: 'Busbar Torque', value: '12.0 N*m ± 0.5' }
              ],
              tools: [
                'Insulated Torque Wrench (1000V rated)',
                'Cell Internal Resistance Meter',
                'Thermal Imaging Camera (FLIR)',
                'Fire-resistant LiFePO4 Handling Gloves'
              ]
            },
            videoChapters: [
              { time: '00:00', title: 'LiFePO4 Cell Handling & Polarity Check' },
              { time: '03:45', title: 'Copper Busbar Torquing' },
              { time: '08:20', title: 'BMS Harness CAN/RS485 Connection' }
            ],
            explodedViewType: 'battery_rack'
          }
        ]
      }
    ]
  }
];

module.exports = {
  COURSES,

  getAllCourses() {
    return COURSES;
  },

  getCourse(courseId) {
    return COURSES.find(c => c.id === courseId || c.courseCode === courseId);
  },

  getTopic(topicId) {
    for (const course of COURSES) {
      for (const mod of course.modules) {
        const topic = mod.topics.find(t => t.id === topicId);
        if (topic) {
          return {
            ...topic,
            courseId: course.id,
            courseTitle: course.title,
            courseCode: course.courseCode,
            moduleId: mod.id,
            moduleCode: mod.code,
            moduleNumber: mod.moduleNumber,
            moduleTitle: mod.title,
            simulationConfig: mod.simulationConfig
          };
        }
      }
    }
    return null;
  },

  getModuleOrTopic(identifier) {
    if (!identifier) return null;
    const clean = String(identifier).toLowerCase().replace(/[-_]/g, '');

    for (const course of COURSES) {
      for (const mod of course.modules) {
        const modMatch = (
          mod.id === identifier ||
          mod.code === identifier ||
          mod.id.replace(/[-_]/g, '').toLowerCase() === clean ||
          mod.code.replace(/[-_]/g, '').toLowerCase() === clean
        );
        const topicMatch = mod.topics.find(t => (
          t.id === identifier ||
          t.id.replace(/[-_]/g, '').toLowerCase() === clean
        ));

        if (modMatch || topicMatch) {
          const topic = topicMatch || mod.topics[0];
          return {
            ...topic,
            courseId: course.id,
            courseTitle: course.title,
            courseCode: course.courseCode,
            moduleId: mod.id,
            moduleCode: mod.code,
            moduleNumber: mod.moduleNumber,
            moduleTitle: mod.title,
            simulationConfig: mod.simulationConfig
          };
        }
      }
    }
    return null;
  }
};
