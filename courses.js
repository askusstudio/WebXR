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
              ]
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
            moduleTitle: mod.title
          };
        }
      }
    }
    return null;
  }
};
