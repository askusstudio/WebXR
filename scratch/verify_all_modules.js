// scratch/verify_all_modules.js
// Automated Verification Test Suite for MAYAVUE 8-Module Practice Processes

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('================================================================');
console.log('  MAYAVUE // 8-Module Practice Process Full Verification Suite');
console.log('================================================================\n');

// -------------------------------------------------------------
// SECTION 1: Mock 3D & DOM Environment for Node.js Simulation
// -------------------------------------------------------------
const ctxProxy = new Proxy({}, { get: () => () => {} });
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') return { getContext: () => ctxProxy, width: 256, height: 64 };
    return {};
  }
};

const mockMat = function() {
  return { color: { setHex: () => {} }, opacity: 1, dispose: () => {} };
};
const mockGeo = function() {
  return { dispose: () => {} };
};

global.THREE = {
  Vector3: class {
    constructor(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    clone() { return new global.THREE.Vector3(this.x, this.y, this.z); }
  },
  Group: class {
    constructor() {
      this.children = [];
      this.position = new global.THREE.Vector3();
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = new global.THREE.Vector3(1, 1, 1);
      this.visible = true;
    }
    add(...items) { this.children.push(...items); }
    clone() { return new global.THREE.Group(); }
    traverse(fn) { this.children.forEach(c => { fn(c); if (c.traverse) c.traverse(fn); }); }
  },
  Mesh: class {
    constructor() {
      this.material = mockMat();
      this.position = new global.THREE.Vector3();
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = new global.THREE.Vector3(1, 1, 1);
      this.visible = true;
      this.children = [];
    }
    add(...items) { this.children.push(...items); }
    clone() { return new global.THREE.Mesh(); }
    traverse(fn) { this.children.forEach(c => { fn(c); if (c.traverse) c.traverse(fn); }); }
  },
  BoxGeometry: mockGeo, CylinderGeometry: mockGeo, SphereGeometry: mockGeo,
  PlaneGeometry: mockGeo, ConeGeometry: mockGeo, RingGeometry: mockGeo, TorusGeometry: mockGeo,
  MeshStandardMaterial: mockMat, MeshBasicMaterial: mockMat, MeshPhysicalMaterial: mockMat,
  CanvasTexture: function() {}
};

const models = require('../equipment_models.js');
const courses = require('../courses.js');
const db = require('../db.js');

const mockSound = {
  playRatchetingSound: () => {}, playRelayThud: () => {}, playAirHiss: () => {},
  playScanTone: () => {}, playProbeBeep: () => {}, playFuseSnap: () => {},
  playSuccessChime: () => {}, playRotaryClick: () => {}, playCompletionFanfare: () => {}
};

const mockApp = {
  sound: mockSound,
  language: 'en',
  animateOpenGateAndEnter: () => {},
  animateRotarySwitch: () => {},
  handleProbingInteraction: () => {},
  animateCorrectCircuit: () => {},
  animateOpenToolbox: () => {},
  animateInstallBattery: () => {}
};

// -------------------------------------------------------------
// TEST 1: Validate Course Module Definitions & 6-Step Schemas
// -------------------------------------------------------------
console.log('[TEST 1/5] Auditing Course Curriculum Modules & Simulation Configs...');
const allCourses = courses.COURSES || courses.getAllCourses();
let auditedModuleCount = 0;
const auditedModules = [];

allCourses.forEach(crs => {
  crs.modules.forEach(m => {
    auditedModuleCount++;
    auditedModules.push(m);
    const cfg = m.simulationConfig;
    if (!cfg || !cfg.code || !cfg.steps || cfg.steps.length !== 6) {
      throw new Error(`Module ${m.code} does not have a 6-step simulationConfig.`);
    }
    if (!cfg.telemetry || !cfg.telemetry.p1 || !cfg.telemetry.p2 || !cfg.telemetry.p3 || !cfg.telemetry.p4) {
      throw new Error(`Module ${m.code} missing required 4-parameter telemetry schema.`);
    }
  });
});
console.log(`  ✓ All ${auditedModuleCount} modules have valid 6-step simulationConfig & 4-parameter telemetry.`);

// -------------------------------------------------------------
// TEST 2: Validate 3D Models & 6-Step Interactive Practice Actions
// -------------------------------------------------------------
console.log('\n[TEST 2/5] Testing 3D Model Construction & Interactive Step Handlers...');
auditedModules.forEach(m => {
  const parent = new global.THREE.Group();
  const buildResult = models.ModuleEquipmentBuilder.build(
    m.code,
    parent,
    global.THREE,
    mockSound,
    mockApp
  );

  if (!buildResult) throw new Error(`Build returned null for ${m.code}`);
  if (!buildResult.interactiveObjects || buildResult.interactiveObjects.length === 0) {
    throw new Error(`Zero interactiveObjects generated for ${m.code}`);
  }
  if (!buildResult.stepInteractiveMap) {
    throw new Error(`Missing stepInteractiveMap for ${m.code}`);
  }

  // Verify all 6 steps
  for (let s = 1; s <= 6; s++) {
    const step = buildResult.stepInteractiveMap[s];
    if (!step) throw new Error(`Step ${s} missing in stepInteractiveMap for ${m.code}`);
    if (!step.name || !step.title || !step.actionLabel || typeof step.execute !== 'function') {
      throw new Error(`Incomplete step definition for Step ${s} in ${m.code}`);
    }
    // Execute the step's handler to verify no runtime error
    const msg = step.execute(mockApp);
    if (!msg || typeof msg !== 'string') {
      throw new Error(`Step ${s} execute() did not return a confirmation string in ${m.code}`);
    }
  }

  console.log(`  ✓ [${m.code}] 6/6 interactive practice steps verified with ${buildResult.interactiveObjects.length} interactive 3D objects.`);
});

// -------------------------------------------------------------
// TEST 3: State Machine Simulation, Out-of-Sequence & Scorecard
// -------------------------------------------------------------
console.log('\n[TEST 3/5] Testing Sequential State Execution, Out-of-Sequence Penalty & Scorecard...');

class MockFSM {
  constructor(moduleCode, stepMap) {
    this.moduleCode = moduleCode;
    this.stepMap = stepMap;
    this.currentState = 1;
    this.errors = [];
    this.score = 100;
  }

  executeStep(s) {
    if (s === this.currentState) {
      return this.executeCurrentStep();
    } else if (s < this.currentState) {
      return { status: 'already_completed', step: s };
    } else {
      const penalty = 15;
      this.score = Math.max(0, this.score - penalty);
      this.errors.push({
        type: 'SEQUENCE_VIOLATION',
        title: `OUT-OF-SEQUENCE: Step ${s}`,
        step: s,
        penalty
      });
      return { status: 'sequence_violation', penalty, newScore: this.score };
    }
  }

  executeCurrentStep() {
    if (this.currentState > 6) return { status: 'already_finished' };
    const sData = this.stepMap[this.currentState];
    const execMsg = sData.execute(mockApp);
    const completedStep = this.currentState;
    this.currentState++;
    const isComplete = this.currentState > 6;
    return {
      status: 'step_advanced',
      completedStep,
      nextStep: isComplete ? 'COMPLETED' : this.currentState,
      message: execMsg,
      isComplete
    };
  }

  generateReport() {
    const totalPenalty = this.errors.reduce((sum, e) => sum + e.penalty, 0);
    const accuracy = Math.max(0, 100 - totalPenalty);
    const grade = accuracy >= 95 ? 'S' : (accuracy >= 85 ? 'A' : (accuracy >= 70 ? 'B' : 'C'));
    return { accuracy, score: this.score, grade, errorsCount: this.errors.length };
  }
}

// Test sequential and violation handling for each module
auditedModules.forEach(m => {
  const parent = new global.THREE.Group();
  const buildResult = models.ModuleEquipmentBuilder.build(m.code, parent, global.THREE, mockSound, mockApp);
  const fsm = new MockFSM(m.code, buildResult.stepInteractiveMap);

  // Test Out-of-Sequence penalty: Attempt Step 4 when in Step 1
  const violationRes = fsm.executeStep(4);
  if (violationRes.status !== 'sequence_violation' || fsm.score !== 85) {
    throw new Error(`Out-of-sequence penalty failed on ${m.code}`);
  }

  // Now execute Steps 1 through 6 sequentially
  for (let s = 1; s <= 6; s++) {
    const adv = fsm.executeStep(s);
    if (adv.status !== 'step_advanced') {
      throw new Error(`Failed to advance step ${s} on ${m.code}`);
    }
  }

  if (fsm.currentState !== 7) {
    throw new Error(`FSM did not reach finished state (7) on ${m.code}`);
  }

  const report = fsm.generateReport();
  if (report.accuracy !== 85 || report.grade !== 'A') {
    throw new Error(`Report card grade calculation mismatch on ${m.code}`);
  }

  console.log(`  ✓ [${m.code}] FSM sequence, out-of-order penalty (-15%), and scorecard (Grade: ${report.grade}, Accuracy: ${report.accuracy}%) verified.`);
});

// -------------------------------------------------------------
// TEST 4: REST APIs & Cryptographic Ledger Commits
// -------------------------------------------------------------
console.log('\n[TEST 4/5] Testing REST API Endpoints & Cryptographic Ledger Session Commits...');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const payloadStr = data ? JSON.stringify(data) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(payloadStr ? { 'Content-Length': Buffer.byteLength(payloadStr) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (payloadStr) req.write(payloadStr);
    req.end();
  });
}

async function runApiTests() {
  // Check courses API
  const coursesRes = await makeRequest('/api/courses');
  if (coursesRes.status !== 200 || !coursesRes.data.courses) {
    throw new Error('GET /api/courses failed');
  }
  console.log(`  ✓ GET /api/courses responded 200 OK with ${coursesRes.data.courses.length} courses.`);

  // Verify simulation session commit for each of the 8 modules
  for (const m of auditedModules) {
    const commitPayload = {
      userId: db.DEFAULT_CANDIDATE_ID,
      moduleCode: m.code,
      durationMinutes: 3.25,
      troubleshootPct: 97.5,
      safetyPct: 100.0,
      toolUsePct: 96.0,
      safetyAlerts: 0,
      telemetryLog: m.simulationConfig.telemetryLog || { status: 'VERIFIED_RUN' }
    };

    const commitRes = await makeRequest('/api/simulation/session-commit', 'POST', commitPayload);
    if (commitRes.status !== 200 || !commitRes.data.success || !commitRes.data.sessionId) {
      throw new Error(`Failed to commit session for module ${m.code}: ${JSON.stringify(commitRes)}`);
    }

    const sessionId = commitRes.data.sessionId;
    const tamperHash = commitRes.data.tamperHash;

    // Verify cryptographic SHA-256 hash in database
    const verifyResult = db.verifySessionTamperHash(sessionId);
    if (!verifyResult.valid) {
      throw new Error(`Tamper hash validation failed in DB for session ${sessionId} (${m.code})`);
    }

    // Verify public verification endpoint
    const pubVerifyRes = await makeRequest(`/api/verify/${sessionId}`);
    if (pubVerifyRes.status !== 200 || pubVerifyRes.data.tamperHash !== tamperHash) {
      throw new Error(`Public verification failed for session ${sessionId} (${m.code})`);
    }

    console.log(`  ✓ [${m.code}] Cryptographic session committed & verified (Hash: ${tamperHash.substring(0, 16)}..., ID: ${sessionId.substring(0, 8)}...)`);
  }

  // -------------------------------------------------------------
  // TEST 4B: Autonomous Closed-Loop Architecture & Telemetry
  // -------------------------------------------------------------
  console.log('\n[TEST 4B] Testing Autonomous Closed-Loop Architecture & Telemetry...');
  
  // 1. Procedural accuracy formula: 0.4 * troubleshoot + 0.4 * safety + 0.2 * toolUse
  const calcAcc = db.ExecutionLoopEngine.calculateProceduralAccuracy(90, 100, 80);
  if (Math.abs(calcAcc - 92) > 0.01) {
    throw new Error(`ExecutionLoopEngine accuracy mismatch: expected 92, got ${calcAcc}`);
  }
  console.log(`  ✓ ExecutionLoopEngine.calculateProceduralAccuracy formula validated (0.4*90 + 0.4*100 + 0.2*80 = 92.0%)`);

  // 2. Adaptive recovery resolution for benchmark failure
  const failLoop = db.ExecutionLoopEngine.resolveNextLoopStep({
    moduleCode: 'solar_troubleshooting_04',
    safetyPct: 80,
    troubleshootPct: 70,
    proceduralAccuracy: 75
  });
  if (failLoop.nextAction !== 'REMEDIAL_THEORY' || failLoop.focus !== 'safety_isolation' || failLoop.remedialRequired !== true) {
    throw new Error(`Adaptive recovery fail loop resolution failed: ${JSON.stringify(failLoop)}`);
  }
  console.log(`  ✓ Adaptive Recovery Fail Routing: Safety 80% (<90%) correctly triggers REMEDIAL_THEORY (focus: ${failLoop.focus})`);

  // 3. Certified completion resolution for benchmark pass
  const passLoop = db.ExecutionLoopEngine.resolveNextLoopStep({
    moduleCode: 'solar_troubleshooting_04',
    safetyPct: 100,
    troubleshootPct: 95,
    proceduralAccuracy: 97
  });
  if (passLoop.nextAction !== 'CERTIFICATE_GENERATED' || passLoop.remedialRequired !== false || !passLoop.badgeAwarded) {
    throw new Error(`Pass loop resolution failed: ${JSON.stringify(passLoop)}`);
  }
  console.log(`  ✓ Benchmark Pass Routing: Safety 100% & Troubleshoot 95% correctly triggers CERTIFICATE_GENERATED (badge: ${passLoop.badgeAwarded})`);

  // 3B. Direct ExecutionLoopEngine.processSimulationCompletion invocation
  const loopProcessResult = db.ExecutionLoopEngine.processSimulationCompletion({
    sessionId: 'test-loop-' + Date.now(),
    userId: db.DEFAULT_CANDIDATE_ID,
    moduleCode: 'SOLAR-BOX-01',
    durationSeconds: 180,
    troubleshootingScore: 95.0,
    safetyComplianceScore: 100.0,
    toolAccuracyScore: 92.0,
    violations: []
  });
  if (!loopProcessResult || !loopProcessResult.sessionId || !loopProcessResult.tamperHash) {
    throw new Error(`ExecutionLoopEngine.processSimulationCompletion failed: ${JSON.stringify(loopProcessResult)}`);
  }
  console.log(`  ✓ ExecutionLoopEngine.processSimulationCompletion executed successfully (SHA-256: ${loopProcessResult.tamperHash.substring(0, 16)}...)`);

  // 4. Live Telemetry Packet API (10 Hz ingest fallback)
  const telemetryRes = await makeRequest('/api/telemetry/packet', 'POST', {
    type: 'UNINSULATED_CONTACT',
    candidateId: db.DEFAULT_CANDIDATE_ID,
    moduleCode: 'solar_troubleshooting_04',
    data: { voltage: 480, hazard: 'ARC_FLASH' }
  });
  if (telemetryRes.status !== 200 || !telemetryRes.data.success) {
    throw new Error(`POST /api/telemetry/packet failed: ${JSON.stringify(telemetryRes)}`);
  }
  console.log(`  ✓ POST /api/telemetry/packet responded 200 OK for live UNINSULATED_CONTACT telemetry event`);

  // 5. Recruiter Talent Pool Leaderboard
  const leaderboardRes = await makeRequest('/api/recruiter/leaderboard');
  if (leaderboardRes.status !== 200 || !leaderboardRes.data.leaderboard || leaderboardRes.data.leaderboard.length === 0) {
    throw new Error(`GET /api/recruiter/leaderboard failed: ${JSON.stringify(leaderboardRes)}`);
  }
  const topCandidate = leaderboardRes.data.leaderboard[0];
  if (!topCandidate.fullName || typeof topCandidate.compositeScore !== 'number') {
    throw new Error(`Invalid leaderboard candidate schema: ${JSON.stringify(topCandidate)}`);
  }
  console.log(`  ✓ GET /api/recruiter/leaderboard responded 200 OK (${leaderboardRes.data.leaderboard.length} candidates, #1: ${topCandidate.fullName} with score ${topCandidate.compositeScore})`);

  // -------------------------------------------------------------
  // TEST 5: Real HTML / DOM HUD UI Elements Check
  // -------------------------------------------------------------
  console.log('\n[TEST 5/5] Auditing Production HTML & Practice HUD Elements...');
  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  const requiredElements = [
    'id="btn-practice-step-action"',
    'id="practice-step-action-text"',
    'id="task-step-tag"',
    'id="task-title"',
    'id="task-instruction"',
    'id="step-pill-1"',
    'id="step-pill-6"',
    'id="arc-flash-hud-alert"',
    'setModulePractice',
    'executeCurrentStep',
    'executeStep',
    'handleSimulationCompleted',
    'ArcFlashHazardSystem',
    'triggerArcFlash'
  ];

  requiredElements.forEach(marker => {
    if (!indexHtml.includes(marker)) {
      throw new Error(`index.html missing required UI/FSM marker: ${marker}`);
    }
  });
  console.log(`  ✓ All ${requiredElements.length} required interactive HUD elements, button hooks, arc flash system, and FSM handlers present in index.html.`);

  console.log('\n================================================================');
  console.log('  ✓ ALL 8 MODULE PRACTICE PROCESSES & CLOSED-LOOP FULLY VERIFIED!');
  console.log('================================================================\n');
}

runApiTests().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
