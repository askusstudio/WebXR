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
function generateSocraticAiFeedback({ moduleCode, troubleshootPct, safetyPct, toolUsePct, safetyAlerts, durationMinutes, telemetryLog = {} }) {
  const strengths = [];
  const improvements = [];
  const recommendations = [];

  // Evaluate Troubleshooting & Logic
  if (troubleshootPct >= 95) {
    strengths.push('Exceptional systematic diagnosis: accurately probed 480V DC Voc and identified open-circuit fuse within benchmark time.');
  } else if (troubleshootPct >= 80) {
    strengths.push('Competent electrical isolation workflow; successfully diagnosed fault condition with minor circuit tracing hesitation.');
  } else {
    improvements.push('Circuit diagnosis sequence showed multiple redundant probe measurements prior to identifying blown fuse.');
  }

  // Evaluate Safety Compliance
  if (safetyPct === 100 && (safetyAlerts === 0 || !safetyAlerts)) {
    strengths.push('Flawless NFPA 70E Arc Flash compliance: 1000V insulating gloves and face shield donned prior to high-voltage enclosure penetration.');
  } else {
    improvements.push(`Logged ${safetyAlerts || 1} safety violation warning(s): ensure zero-voltage bus verification before touching fuse extraction bracket.`);
    recommendations.push('Review Module 03: NFPA 70E Arc Flash Boundary and CAT IV Multimeter Probing Procedure.');
  }

  // Evaluate Tool Technique & Torquing
  if (toolUsePct >= 90) {
    strengths.push('Precision tool handling: Fluke 87V CAT IV probes placed on isolated terminals with exact 15 N*m calibrated torque confirmation on 48V battery bus.');
  } else {
    improvements.push('Torque wrench technique requires calibration: verify tactile click confirmation on M8 terminal hardware.');
    recommendations.push('Practice calibrated torque tool calibration in 3D Animated Circuit media lab.');
  }

  // Next Step Recommendation
  if (troubleshootPct >= 90 && safetyPct >= 95) {
    recommendations.push('Eligible for Advanced Track: 3PHASE-SUB-02 (High Voltage Substation & 3-Phase Grid Safe Isolation).');
  } else {
    recommendations.push('Repeat practice scenario focusing on tactile LOTO isolation sequence.');
  }

  return {
    evaluator: 'MAYAVUE Socratic AI Engine v2.4 (Grounded in NFPA 70E & OSHA 1910)',
    overallGrade: troubleshootPct >= 90 && safetyPct >= 90 ? 'DISTINCTION' : troubleshootPct >= 75 ? 'PASS' : 'RETAKE_RECOMMENDED',
    strengths,
    improvements,
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

seedInitialData();

// --- 6. Exported Database Operations ---

module.exports = {
  DEFAULT_CANDIDATE_ID,

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

    // Update user profile metrics
    if (user) {
      const newHours = Number((user.practice_hours + durationMinutes / 60).toFixed(2));
      const newSolved = user.solved_faults + 1;
      const newRating = Number(((user.safety_rating * 0.9) + (safetyPct / 20) * 0.1).toFixed(2));

      db.prepare(`
        UPDATE user_profiles
        SET practice_hours = ?,
            solved_faults = ?,
            safety_rating = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(newHours, newSolved, newRating, userId);
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
      aiFeedback,
      qrPayload,
      tamperHash,
      previousRecordHash: prevHash,
      timestamp
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
  }
};
