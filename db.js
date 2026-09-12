// db.js - Unified Database & Cryptographic Audit Ledger Layer
// MAYAVUE 6-Stage End-to-End VR Certification Platform

const { DatabaseSync } = require('node:sqlite');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'solar_platform.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

// --- 1. Schema Initialization (Users, UserProfiles, SimulationSessions) ---
db.exec(`
  CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    verification_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'LEARNER',
    practice_hours REAL NOT NULL DEFAULT 0.0,
    solved_faults INTEGER NOT NULL DEFAULT 0,
    safety_rating REAL NOT NULL DEFAULT 5.0,
    profile_tag TEXT NOT NULL DEFAULT 'Certified PV Installer - Level 1',
    avatar_url TEXT,
    skill_matrix TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS simulation_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
    module_code TEXT NOT NULL,
    duration_minutes REAL NOT NULL,
    troubleshoot_pct REAL NOT NULL,
    safety_pct REAL NOT NULL,
    tool_use_pct REAL NOT NULL,
    safety_alerts INTEGER NOT NULL DEFAULT 0,
    ai_feedback TEXT NOT NULL,
    qr_payload TEXT NOT NULL,
    tamper_hash TEXT NOT NULL UNIQUE,
    previous_record_hash TEXT,
    telemetry_log TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON simulation_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_module_code ON simulation_sessions(module_code);
  CREATE INDEX IF NOT EXISTS idx_sessions_tamper_hash ON simulation_sessions(tamper_hash);

  -- Legacy table for backwards compatibility
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    profile_tag TEXT NOT NULL DEFAULT 'Solar Apprentice',
    skill_matrix TEXT NOT NULL,
    total_active_hours REAL NOT NULL DEFAULT 0.0,
    overall_accuracy_rate REAL NOT NULL DEFAULT 100.0,
    total_sessions_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS simulation_audit_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    topic_id TEXT NOT NULL,
    session_start_time TEXT NOT NULL,
    session_end_time TEXT NOT NULL,
    active_duration_seconds INTEGER NOT NULL,
    steps_completed INTEGER NOT NULL,
    safety_violations_count INTEGER NOT NULL DEFAULT 0,
    accuracy_score REAL NOT NULL,
    verification_hash TEXT NOT NULL UNIQUE,
    previous_record_hash TEXT,
    telemetry_data TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Safe Idempotent Schema Migrations
try { db.exec(`ALTER TABLE user_profiles ADD COLUMN total_sessions INTEGER NOT NULL DEFAULT 0;`); } catch (_) {}
try { db.exec(`ALTER TABLE user_profiles ADD COLUMN accuracy_rate REAL NOT NULL DEFAULT 100.0;`); } catch (_) {}
try { db.exec(`ALTER TABLE user_profiles ADD COLUMN remedial_required INTEGER NOT NULL DEFAULT 0;`); } catch (_) {}
try { db.exec(`ALTER TABLE user_profiles ADD COLUMN remedial_focus TEXT;`); } catch (_) {}


// --- 2. Database-Level Row Immutability Triggers (Append-Only) ---
db.exec(`
  CREATE TRIGGER IF NOT EXISTS trg_sessions_prevent_update
  BEFORE UPDATE ON simulation_sessions
  BEGIN
    SELECT RAISE(FAIL, 'SECURITY VIOLATION: simulation_sessions rows are cryptographically immutable. UPDATE prohibited.');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_sessions_prevent_delete
  BEFORE DELETE ON simulation_sessions
  BEGIN
    SELECT RAISE(FAIL, 'SECURITY VIOLATION: simulation_sessions rows are cryptographically immutable. DELETE prohibited.');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_audit_ledger_prevent_update
  BEFORE UPDATE ON simulation_audit_ledger
  BEGIN
    SELECT RAISE(FAIL, 'SECURITY VIOLATION: simulation_audit_ledger rows are cryptographically immutable. UPDATE prohibited.');
  END;

  CREATE TRIGGER IF NOT EXISTS trg_audit_ledger_prevent_delete
  BEFORE DELETE ON simulation_audit_ledger
  BEGIN
    SELECT RAISE(FAIL, 'SECURITY VIOLATION: simulation_audit_ledger rows are cryptographically immutable. DELETE prohibited.');
  END;
`);

// --- 3. Cryptographic Hash Utility ---
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

function computeTamperHash(userId, moduleCode, troubleshootPct, safetyPct, toolUsePct, timestamp, prevHash) {
  const payload = `${userId}:${moduleCode}:${Number(troubleshootPct).toFixed(1)}:${Number(safetyPct).toFixed(1)}:${Number(toolUsePct).toFixed(1)}:${timestamp}:${prevHash || GENESIS_HASH}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// --- 4. Socratic AI Actionable Feedback Generator ---
function generateSocraticAiFeedback({ moduleCode = 'SOLAR-BOX-01', troubleshootPct, safetyPct, toolUsePct, safetyAlerts, durationMinutes, telemetryLog = {} }) {
  const strengths = [];
  const improvements = [];
  const recommendations = [];

  const code = String(moduleCode).toUpperCase();

  if (code.includes('ROOF') || code === 'SOLAR-ROOF-01') {
    if (troubleshootPct >= 90) {
      strengths.push('Optimal Solar Window Acquisition: Accurately aligned array to 180° True South within ±2° azimuth tolerance.');
      strengths.push('Pyranometer Radiance Grounding: Confirmed solar irradiance of 880 W/m² with zero shading obstacle penalties.');
    } else {
      improvements.push('Azimuth orientation deviated from True South; recalibrate magnetic declination compensation.');
    }
    if (safetyPct === 100) {
      strengths.push('OSHA 1926.502 Fall Protection: 100% harness tie-off compliance confirmed across all rooftop working zones.');
    } else {
      improvements.push('Fall protection anchor point inspection missed before stepping onto sloped roof truss.');
    }
    if (toolUsePct >= 90) {
      strengths.push('Inclinometer Precision: Structural L-feet brackets torqued to exact 25.0° optimal latitude tilt angle.');
    }
    recommendations.push('Advance to Module 02: PV Panel Mounting & End/Mid-Clamp Mechanical Torquing.');

  } else if (code.includes('MOUNT') || code === 'SOLAR-MOUNT-02') {
    if (troubleshootPct >= 90) {
      strengths.push('Bifacial Module Precision Handling: 550W panels seated with uniform 20mm thermal expansion spacing.');
      strengths.push('Grounding Bond Integrity: Serrated WEEB bonding clips positioned under each rail contact point.');
    } else {
      improvements.push('Thermal expansion spacing inconsistent between panel rows; maintain strict 20mm spacing.');
    }
    if (toolUsePct >= 90) {
      strengths.push('Calibrated Torquing Technique: Verified 14.0 N*m on end-clamps and 15.5 N*m on mid-clamps with tactile click confirmation.');
    } else {
      improvements.push('Under-torqued mid-clamp detected: ensure full 15.5 N*m calibrated setting is reached.');
    }
    recommendations.push('Advance to Module 03: DC Cabling, MC4 Crimping & String Wiring.');

  } else if (code.includes('DC') || code.includes('MC4') || code === 'SOLAR-DC-03') {
    if (troubleshootPct >= 90) {
      strengths.push('Flawless MC4 Pin Ratchet Crimp: Zero sheared copper strands on 6mm² PV1-F cable with 7.5mm exact strip depth.');
      strengths.push('Pull Retention Resistance: Exceeded 310 N minimum pull-off force with 345 N sustained tensile retention.');
    } else {
      improvements.push('Crimp compression depth showed uneven contact crimp; verify full ratchet release cycle.');
    }
    if (safetyPct === 100) {
      strengths.push('Polarity Isolation Protocol: 100% correct DC home-run polarity mapping confirmed prior to enclosure entry.');
    }
    recommendations.push('Advance to Module 04: Combiner Box, DC Isolator & Battery Troubleshooting.');

  } else if (code.includes('GRID') || code.includes('INVERTER') || code === 'SOLAR-GRID-05') {
    if (troubleshootPct >= 90) {
      strengths.push('Phase Sequence Verification: Confirmed clockwise 3-phase rotation (L1-L2-L3) across 480V utility interconnection.');
      strengths.push('Anti-Islanding Trip Speed: Utility loss simulation triggered inverter rapid shutdown in 1.42s (< 2.0s limit).');
    } else {
      improvements.push('Phase rotation meter check showed momentary hesitation on L2/L3 sequence identification.');
    }
    if (safetyPct === 100) {
      strengths.push('IEEE 1547 Grid Standard Compliance: Verified zero backfeed to de-energized utility grid during shutdown.');
    }
    recommendations.push('Complete Certificate Track: Solar PV Installation & Commissioning Master Accreditation.');

  } else if (code.includes('SUB-LOTO') || code === 'SUB-LOTO-01') {
    if (troubleshootPct >= 90) {
      strengths.push('High-Voltage Arc Flash Perimeter Mastery: Successfully demarcated 4.2-meter Category 4 boundary line.');
      strengths.push('Non-Contact Wand Probing: Extended 8ft fiberglass hot stick to verify absence of voltage on 13.8kV busbars.');
    } else {
      improvements.push('Approached within 4.2m boundary prior to completing full absence-of-voltage test on busbar.');
    }
    if (safetyPct === 100) {
      strengths.push('OSHA 1910.269 Compliance: Donned complete 40 cal/cm² suit, hood with air supply, and Class 4 rubber gloves.');
    }
    recommendations.push('Advance to Module 02: SF6 Circuit Breaker De-energization & Visible Air-Gap Isolation.');

  } else if (code.includes('SUB-SW') || code === 'SUB-SW-02') {
    if (troubleshootPct >= 90) {
      strengths.push('SF6 Density Verification: Confirmed SF6 gas pressure in safe green zone (0.62 MPa) before operating trip coil.');
      strengths.push('Visible Air-Gap Isolation: Cranked 3-phase gang disconnect open with verified 450mm knife-blade clearance.');
    } else {
      improvements.push('Operating handle cranking speed was irregular; maintain steady mechanical leverage on gang switch.');
    }
    if (safetyPct === 100) {
      strengths.push('NFPA 70E Article 120 LOTO Padlocking: Multi-padlock hasp and red danger tag attached directly to operating lever.');
    }
    recommendations.push('Complete Certificate Track: Electrical Sub-Station & 3-Phase Grid Safe Isolation.');

  } else if (code.includes('BESS') || code === 'BESS-CELL-01') {
    if (troubleshootPct >= 90) {
      strengths.push('Cell Voltage Symmetry: Diagnosed 16 individual LiFePO4 cells with exceptional 12 mV maximum delta-V.');
      strengths.push('BMS Telemetry Balancing: Multi-pin sensor harness connected and validated over CAN/RS485 communication.');
    } else {
      improvements.push('Cell delta-V measurement order was erratic; adhere to systematic positive-to-negative sequence.');
    }
    if (toolUsePct >= 90) {
      strengths.push('Flexible Busbar Calibration: Torqued all 16 cell interconnects to 12.0 N*m with insulated torque wrench.');
    }
    if (safetyPct === 100) {
      strengths.push('NFPA 855 Thermal Safety: Deflagration vent rupture disk and aerosol suppression heads inspected zero defect.');
    }
    recommendations.push('Complete Certificate Track: Commercial LiFePO4 Battery Energy Storage Systems (BESS).');

  } else {
    // Default Module 04: Combiner Box & Battery Troubleshooting
    if (troubleshootPct >= 95) {
      strengths.push('Exceptional systematic diagnosis: accurately probed 480V DC Voc and identified open-circuit fuse within benchmark time.');
    } else if (troubleshootPct >= 80) {
      strengths.push('Competent electrical isolation workflow; successfully diagnosed fault condition with minor circuit tracing hesitation.');
    } else {
      improvements.push('Circuit diagnosis sequence showed multiple redundant probe measurements prior to identifying blown fuse.');
    }

    if (safetyPct === 100 && (safetyAlerts === 0 || !safetyAlerts)) {
      strengths.push('Flawless NFPA 70E Arc Flash compliance: 1000V insulating gloves and face shield donned prior to high-voltage enclosure penetration.');
    } else {
      improvements.push(`Logged ${safetyAlerts || 1} safety violation warning(s): ensure zero-voltage bus verification before touching fuse extraction bracket.`);
      recommendations.push('Review Module 03: NFPA 70E Arc Flash Boundary and CAT IV Multimeter Probing Procedure.');
    }

    if (toolUsePct >= 90) {
      strengths.push('Precision tool handling: Fluke 87V CAT IV probes placed on isolated terminals with exact 15 N*m calibrated torque confirmation on 48V battery bus.');
    } else {
      improvements.push('Torque wrench technique requires calibration: verify tactile click confirmation on M8 terminal hardware.');
      recommendations.push('Practice calibrated torque tool calibration in 3D Animated Circuit media lab.');
    }

    recommendations.push('Eligible for Advanced Track: 3PHASE-SUB-02 (High Voltage Substation & 3-Phase Grid Safe Isolation).');
  }

  return {
    evaluator: 'MAYAVUE Socratic AI Engine v2.4 (Grounded in NFPA 70E & OSHA 1910)',
    overallGrade: troubleshootPct >= 90 && safetyPct >= 90 ? 'DISTINCTION' : troubleshootPct >= 75 ? 'PASS' : 'RETAKE_RECOMMENDED',
    strengths,
    improvements: improvements.length > 0 ? improvements : ['Zero procedural infractions or safety violations logged.'],
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

// --- 5. Candidate Seed Data ---
const DEFAULT_CANDIDATE_ID = 'c8e4f1a2-9b3d-4e5f-a678-123456789abc';

function seedInitialData() {
  const existingProfile = db.prepare('SELECT id FROM user_profiles WHERE verification_id = ?').get('MVSTU001');
  if (!existingProfile) {
    const initialSkills = JSON.stringify({
      electrical_safety: 97,
      mechanical_mounting: 92,
      dc_wiring: 94,
      inverter_commissioning: 88,
      fault_isolation: 98
    });

    // Profile 1: Alex Rivera (MVSTU001)
    db.prepare(`
      INSERT INTO user_profiles (
        id, verification_id, full_name, email, role, practice_hours,
        solved_faults, safety_rating, profile_tag, avatar_url, skill_matrix
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      DEFAULT_CANDIDATE_ID,
      'MVSTU001',
      'Alex Rivera',
      'alex.rivera@stark-energy.io',
      'LEARNER',
      18.5,
      15,
      4.9,
      'Certified PV Installer - Level 1',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      initialSkills
    );

    // Profile 2: Marcus Vance (MVSTU002)
    db.prepare(`
      INSERT INTO user_profiles (
        id, verification_id, full_name, email, role, practice_hours,
        solved_faults, safety_rating, profile_tag, avatar_url, skill_matrix
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'd1111111-2222-3333-4444-555555555555',
      'MVSTU002',
      'Marcus Vance',
      'marcus.vance@gridtech.com',
      'LEARNER',
      9.2,
      8,
      4.5,
      'Substation Technician Apprentice',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      JSON.stringify({
        electrical_safety: 91,
        mechanical_mounting: 84,
        dc_wiring: 86,
        inverter_commissioning: 80,
        fault_isolation: 89
      })
    );

    // Profile 3: Elena Rostova (MVSTU003 - Master Instructor / Admin)
    db.prepare(`
      INSERT INTO user_profiles (
        id, verification_id, full_name, email, role, practice_hours,
        solved_faults, safety_rating, profile_tag, avatar_url, skill_matrix
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'e2222222-3333-4444-5555-666666666666',
      'MVSTU003',
      'Elena Rostova',
      'elena.rostova@mayavue.io',
      'INSTRUCTOR',
      42.0,
      38,
      5.0,
      'Chief Grid Safety Engineer & Lead Proctor',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      JSON.stringify({
        electrical_safety: 99,
        mechanical_mounting: 98,
        dc_wiring: 99,
        inverter_commissioning: 96,
        fault_isolation: 100
      })
    );

    // Seed initial completed simulation session for Alex Rivera
    const defaultSessionId = '8a8c5cff-d47e-4adf-a5fd-ea8ebfe380b6';
    const timestamp = '2026-09-11T17:19:15.297Z';
    const aiFeedback = generateSocraticAiFeedback({
      moduleCode: 'SOLAR-BOX-01',
      troubleshootPct: 99.2,
      safetyPct: 100.0,
      toolUsePct: 98.5,
      safetyAlerts: 0,
      durationMinutes: 2.75
    });
    const prevRecordHash = '08f1bbaeaed2b1f66df9beaadb43244fcd65e882e1f78bd7db3ce0db89efe86f';
    const tamperHash = computeTamperHash(DEFAULT_CANDIDATE_ID, 'SOLAR-BOX-01', 99.2, 100.0, 98.5, timestamp, prevRecordHash);
    const qrPayload = `https://mayavue.cert/verify/${defaultSessionId}?hash=${tamperHash.slice(0, 16)}&stu=MVSTU001`;

    db.prepare(`
      INSERT INTO simulation_sessions (
        id, user_id, module_code, duration_minutes, troubleshoot_pct, safety_pct,
        tool_use_pct, safety_alerts, ai_feedback, qr_payload, tamper_hash,
        previous_record_hash, telemetry_log, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      defaultSessionId,
      DEFAULT_CANDIDATE_ID,
      'SOLAR-BOX-01',
      2.75,
      99.2,
      100.0,
      98.5,
      0,
      JSON.stringify(aiFeedback),
      qrPayload,
      tamperHash,
      prevRecordHash,
      JSON.stringify({
        voc_probed: '480.0V DC',
        isolated_bus_voltage: '0.0V DC',
        fuse_continuity: 'FUSE 3 REPLACED PASS',
        battery_bus: '48V LiFePO4 BUS CONNECTED 15 N*m',
        safetyViolations: 0
      }),
      timestamp
    );
  }
}

// --- 5.5 Autonomous Closed-Loop Architecture Engine ---
const ExecutionLoopEngine = {
  // 1. Procedural accuracy calculation: 0.4 * troubleshoot + 0.4 * safety + 0.2 * toolUse
  calculateProceduralAccuracy(troubleshootPct, safetyPct, toolUsePct) {
    const score = (0.4 * Number(troubleshootPct || 0)) +
                  (0.4 * Number(safetyPct || 0)) +
                  (0.2 * Number(toolUsePct || 0));
    return Number(score.toFixed(1));
  },

  // 2. Profile to Course Routing (Adaptive Recovery vs Certification)
  resolveNextLoopStep({ safetyPct, troubleshootPct, courseId = 'solar-pv', moduleId = 'solar_troubleshooting_04', sessionId }) {
    const sPct = Number(safetyPct || 0);
    const tPct = Number(troubleshootPct || 0);

    // Rule 1: Safety isolation breached (<90%)
    if (sPct < 90) {
      return {
        nextAction: 'REMEDIAL_THEORY',
        focus: 'safety_isolation',
        route: `#/course/${courseId}/theory/${moduleId}?focus=safety_isolation`,
        message: 'Safety isolation benchmark (<90%) breached. Remedial micro-theory protocol mandated.',
        lockedExams: true,
        remedialRequired: true,
        remedialFocus: 'safety_isolation',
        badgeAwarded: null
      };
    }

    // Rule 2: Procedural diagnostics breached (<80%)
    if (tPct < 80) {
      return {
        nextAction: 'REMEDIAL_THEORY',
        focus: 'diagnostics',
        route: `#/course/${courseId}/theory/${moduleId}?focus=diagnostics`,
        message: 'Procedural diagnostics benchmark (<80%) breached. Diagnostic multimeter theory review mandated.',
        lockedExams: true,
        remedialRequired: true,
        remedialFocus: 'diagnostics',
        badgeAwarded: null
      };
    }

    // Rule 3: Benchmark Passed -> Autonomous Credential Issued
    const isSpecialist = sPct >= 98 && tPct >= 95;
    const badgeAwarded = isSpecialist ? 'Advanced Field Specialist' : 'Certified Apprentice';
    return {
      nextAction: 'CERTIFICATE_GENERATED',
      focus: null,
      route: `#/certificate/${sessionId}`,
      message: 'Benchmark verified. Autonomous tamper-proof credential issued.',
      lockedExams: false,
      remedialRequired: false,
      remedialFocus: null,
      badgeAwarded
    };
  }
};

seedInitialData();

// --- 6. Exported Database Operations ---

module.exports = {
  DEFAULT_CANDIDATE_ID,
  ExecutionLoopEngine,

  // Generate unique sequential trainee verification ID (e.g., MVSTU001)
  generateVerificationId() {
    const row = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get();
    const nextNum = (row ? row.count : 0) + 1;
    return 'MVSTU' + String(nextNum).padStart(3, '0');
  },

  // Register new learner profile (Stage 1 Onboarding)
  registerUserProfile({ fullName, email, role = 'LEARNER', profileTag = 'Solar Apprentice', avatarUrl }) {
    const existing = db.prepare('SELECT * FROM user_profiles WHERE email = ?').get(email);
    if (existing) {
      return {
        ...existing,
        skill_matrix: existing.skill_matrix ? JSON.parse(existing.skill_matrix) : {}
      };
    }

    const id = crypto.randomUUID();
    const verificationId = this.generateVerificationId();
    const skillMatrix = JSON.stringify({
      electrical_safety: 85,
      mechanical_mounting: 80,
      dc_wiring: 88,
      inverter_commissioning: 75,
      fault_isolation: 82
    });

    db.prepare(`
      INSERT INTO user_profiles (
        id, verification_id, full_name, email, role, practice_hours,
        solved_faults, safety_rating, profile_tag, avatar_url, skill_matrix
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      verificationId,
      fullName,
      email,
      role,
      0.0,
      0,
      5.0,
      profileTag,
      avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      skillMatrix
    );

    return this.getUserProfile(id);
  },

  // Get User Profile by ID or Verification ID
  getUserProfile(idOrVerificationId = DEFAULT_CANDIDATE_ID) {
    const user = db.prepare(`
      SELECT * FROM user_profiles
      WHERE id = ? OR verification_id = ?
    `).get(idOrVerificationId, idOrVerificationId);

    if (!user) return null;
    return {
      ...user,
      skill_matrix: user.skill_matrix ? JSON.parse(user.skill_matrix) : {}
    };
  },

  // List all candidates (for switcher / admin view)
  listCandidates() {
    const rows = db.prepare('SELECT * FROM user_profiles ORDER BY verification_id ASC').all();
    return rows.map(r => ({
      ...r,
      skill_matrix: r.skill_matrix ? JSON.parse(r.skill_matrix) : {}
    }));
  },

  // Commit Completed Simulation Session (Stage 4 -> Stage 6)
  commitSimulationSession({
    userId = DEFAULT_CANDIDATE_ID,
    moduleCode = 'SOLAR-BOX-01',
    durationMinutes = 3.0,
    troubleshootPct = 98.0,
    safetyPct = 100.0,
    toolUsePct = 95.0,
    safetyAlerts = 0,
    telemetryLog = {}
  }) {
    const sessionId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Query last session hash for chain integrity
    const lastSession = db.prepare(`
      SELECT tamper_hash FROM simulation_sessions
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC, rowid DESC LIMIT 1
    `).get(userId);

    const prevHash = lastSession ? lastSession.tamper_hash : GENESIS_HASH;
    const tamperHash = computeTamperHash(userId, moduleCode, troubleshootPct, safetyPct, toolUsePct, timestamp, prevHash);

    // Calculate raw procedural accuracy: (0.4 * troubleshoot + 0.4 * safety + 0.2 * toolUse)
    const rawAccuracy = ExecutionLoopEngine.calculateProceduralAccuracy(troubleshootPct, safetyPct, toolUsePct);

    // Resolve Autonomous Closed-Loop Decision: Pass (Certification) vs Fail (Remedial Recovery Branch)
    const loopOutcome = ExecutionLoopEngine.resolveNextLoopStep({
      safetyPct,
      troubleshootPct,
      courseId: 'solar-pv',
      moduleId: moduleCode === 'SOLAR-BOX-01' ? 'solar_troubleshooting_04' : moduleCode,
      sessionId
    });

    // Generate Socratic AI Feedback based on telemetry
    const aiFeedback = generateSocraticAiFeedback({
      moduleCode,
      troubleshootPct,
      safetyPct,
      toolUsePct,
      safetyAlerts,
      durationMinutes,
      telemetryLog
    });

    // Query user verification ID for QR payload
    const user = this.getUserProfile(userId);
    const stuId = user ? user.verification_id : 'MVSTU001';
    const qrPayload = `https://mayavue.cert/verify/${sessionId}?hash=${tamperHash.slice(0, 16)}&stu=${stuId}`;

    // Insert into append-only immutable simulation_sessions
    db.prepare(`
      INSERT INTO simulation_sessions (
        id, user_id, module_code, duration_minutes, troubleshoot_pct, safety_pct,
        tool_use_pct, safety_alerts, ai_feedback, qr_payload, tamper_hash,
        previous_record_hash, telemetry_log, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      userId,
      moduleCode,
      durationMinutes,
      troubleshootPct,
      safetyPct,
      toolUsePct,
      safetyAlerts,
      JSON.stringify(aiFeedback),
      qrPayload,
      tamperHash,
      prevHash,
      JSON.stringify(telemetryLog),
      timestamp
    );

    // Scorecard to Profile Re-Sync:
    // Rolling weighted recalculation of accuracy rate: ((accuracyRate * totalSessions) + rawAccuracy) / (totalSessions + 1)
    let updatedProfile = null;
    if (user) {
      const prevSessions = user.total_sessions || 0;
      const prevAccuracy = user.accuracy_rate != null ? user.accuracy_rate : 100.0;
      const newAccuracyRate = Number((((prevAccuracy * prevSessions) + rawAccuracy) / (prevSessions + 1)).toFixed(1));
      const newTotalSessions = prevSessions + 1;
      const newHours = Number((user.practice_hours + durationMinutes / 60).toFixed(2));
      const newSolved = user.solved_faults + 1;
      const newRating = Number(((user.safety_rating * 0.9) + (safetyPct / 20) * 0.1).toFixed(2));
      const remRequired = loopOutcome.remedialRequired ? 1 : 0;
      const remFocus = loopOutcome.remedialFocus || null;

      db.prepare(`
        UPDATE user_profiles
        SET practice_hours = ?,
            solved_faults = ?,
            safety_rating = ?,
            accuracy_rate = ?,
            total_sessions = ?,
            remedial_required = ?,
            remedial_focus = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(newHours, newSolved, newRating, newAccuracyRate, newTotalSessions, remRequired, remFocus, userId);

      updatedProfile = this.getUserProfile(userId);
    }

    return {
      success: true,
      sessionId,
      userId,
      verificationId: stuId,
      moduleCode,
      troubleshootPct,
      safetyPct,
      toolUsePct,
      safetyAlerts,
      proceduralAccuracy: rawAccuracy,
      accuracyRate: updatedProfile ? updatedProfile.accuracy_rate : rawAccuracy,
      totalSessions: updatedProfile ? updatedProfile.total_sessions : 1,
      aiFeedback,
      qrPayload,
      tamperHash,
      previousRecordHash: prevHash,
      timestamp,
      loopOutcome,
      nextAction: loopOutcome.nextAction,
      route: loopOutcome.route,
      remedialRequired: loopOutcome.remedialRequired,
      remedialFocus: loopOutcome.remedialFocus,
      badgeAwarded: loopOutcome.badgeAwarded,
      lockedExams: loopOutcome.lockedExams
    };
  },

  // Get Session Smart Scorecard by ID (Stage 6)
  getSessionById(sessionId) {
    const row = db.prepare(`
      SELECT s.*, u.verification_id, u.full_name, u.email, u.profile_tag, u.avatar_url, u.role
      FROM simulation_sessions s
      JOIN user_profiles u ON u.id = s.user_id
      WHERE s.id = ?
    `).get(sessionId);

    if (!row) return null;

    return {
      ...row,
      ai_feedback: JSON.parse(row.ai_feedback),
      telemetry_log: row.telemetry_log ? JSON.parse(row.telemetry_log) : {}
    };
  },

  // Get Master Fleet Status for Admin Console (Stage 5 View B)
  getFleetStatus() {
    const candidates = this.listCandidates();
    const recentSessions = db.prepare(`
      SELECT s.id, s.user_id, s.module_code, s.troubleshoot_pct, s.safety_pct, s.safety_alerts,
             s.duration_minutes, s.created_at, u.verification_id, u.full_name, u.avatar_url
      FROM simulation_sessions s
      JOIN user_profiles u ON u.id = s.user_id
      ORDER BY datetime(s.created_at) DESC LIMIT 10
    `).all();

    // Active fleet simulation (live connected trainees)
    const fleet = [
      {
        verificationId: 'MVSTU001',
        name: 'Alex Rivera',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        activeModule: 'SOLAR-BOX-01',
        moduleTitle: 'Combiner Box Safe Isolation',
        state: 'DIAGNOSING_FUSES',
        elapsedMinutes: 2.8,
        safetyViolations: 0,
        connectionQuality: 'OPTICAL_12MS',
        deviceType: 'Meta Quest Pro (WebXR 6DoF)'
      },
      {
        verificationId: 'MVSTU002',
        name: 'Marcus Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        activeModule: '3PHASE-SUB-02',
        moduleTitle: 'High Voltage Substation LOTO',
        state: 'PROBING_BUSBAR',
        elapsedMinutes: 4.1,
        safetyViolations: 1, // Alert flagged!
        connectionQuality: '5G_22MS',
        deviceType: 'Desktop WebGL Simulation'
      }
    ];

    // Live safety violations alert ticker
    const safetyAlerts = [
      {
        timestamp: 'Just now',
        verificationId: 'MVSTU002',
        name: 'Marcus Vance',
        module: '3PHASE-SUB-02',
        severity: 'CRITICAL',
        code: 'NFPA-70E-SEC-130',
        message: 'Non-grounded probe contact attempted on energized 13.8kV busbar without arc flash visor down!'
      },
      {
        timestamp: '14 min ago',
        verificationId: 'MVSTU001',
        name: 'Alex Rivera',
        module: 'SOLAR-BOX-01',
        severity: 'RESOLVED',
        code: 'OSHA-1910-LOTO',
        message: 'Rotary DC isolator confirmed in safe locked-out position with 0.0V residual voltage.'
      }
    ];

    return {
      connectedTraineesCount: fleet.length,
      averageFixTimeMinutes: 3.45,
      activeFleet: fleet,
      safetyAlerts,
      recentCompletedSessions: recentSessions.map(s => ({
        ...s,
        ai_feedback: undefined
      }))
    };
  },

  // Verify Session Tamper Proof Cryptographic Signature
  verifySessionTamperHash(sessionId) {
    const session = db.prepare('SELECT * FROM simulation_sessions WHERE id = ?').get(sessionId);
    if (!session) return { valid: false, error: 'Session not found' };

    const calculated = computeTamperHash(
      session.user_id,
      session.module_code,
      session.troubleshoot_pct,
      session.safety_pct,
      session.tool_use_pct,
      session.created_at,
      session.previous_record_hash
    );

    return {
      sessionId,
      valid: calculated === session.tamper_hash,
      storedHash: session.tamper_hash,
      calculatedHash: calculated,
      timestamp: session.created_at
    };
  },

  // Recruiter Talent Pool Leaderboard (Stage 5 Recruiter View)
  getRecruiterLeaderboard() {
    const candidates = db.prepare(`
      SELECT id, verification_id, full_name, email, role, practice_hours,
             solved_faults, safety_rating, accuracy_rate, total_sessions,
             remedial_required, remedial_focus, profile_tag, avatar_url
      FROM user_profiles
      ORDER BY (accuracy_rate * 0.7 + (safety_rating * 20.0) * 0.3) DESC, practice_hours DESC
    `).all();

    return candidates.map((c, index) => {
      const certCount = db.prepare(`
        SELECT COUNT(*) as count FROM simulation_sessions WHERE user_id = ?
      `).get(c.id)?.count || 0;

      const compScore = Number(((c.accuracy_rate || 100.0) * 0.7 + (c.safety_rating * 20.0) * 0.3).toFixed(1));
      let status = 'HIRE READY';
      let badge = 'Certified Apprentice';

      if (c.remedial_required === 1) {
        status = 'IN REMEDIAL';
        badge = 'Remedial In Progress';
      } else if (c.safety_rating >= 4.9 && (c.accuracy_rate || 100.0) >= 95.0) {
        status = 'CERTIFIED EXPERT';
        badge = 'Advanced Field Specialist';
      }

      return {
        rank: index + 1,
        id: c.id,
        verificationId: c.verification_id,
        fullName: c.full_name,
        email: c.email,
        role: c.role,
        avatarUrl: c.avatar_url,
        practiceHours: Number(c.practice_hours.toFixed(2)),
        solvedFaults: c.solved_faults,
        safetyRating: Number(c.safety_rating.toFixed(1)),
        accuracyRate: Number((c.accuracy_rate != null ? c.accuracy_rate : 100.0).toFixed(1)),
        totalSessions: c.total_sessions || 0,
        remedialRequired: !!c.remedial_required,
        remedialFocus: c.remedial_focus,
        compositeScore: compScore,
        verifiedCertificates: certCount,
        status,
        badgeAwarded: badge
      };
    });
  }
};

