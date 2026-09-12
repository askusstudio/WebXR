// build.js - Production Build & Asset Verification Pipeline for MAYAVUE Platform
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('====================================================');
console.log('  MAYAVUE // Production Build & Verification Pipeline');
console.log('====================================================');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

// Step 1: Syntax Validation
console.log('\n[1/4] Checking JavaScript Syntax Integrity...');
const jsFiles = ['server.js', 'db.js', 'courses.js', 'app.js', 'equipment_models.js'];
jsFiles.forEach(file => {
  const filePath = path.join(ROOT, file);
  if (fs.existsSync(filePath)) {
    execSync(`node --check "${filePath}"`);
    console.log(`  ✓ ${file}: Syntax Valid`);
  } else {
    throw new Error(`Missing required source file: ${file}`);
  }
});

// Step 2: Database & Ledger Engine Verification
console.log('\n[2/4] Verifying Database Schema & Tamper-Proof Cryptographic Ledger...');
const db = require(path.join(ROOT, 'db.js'));
const defaultSessionId = '8a8c5cff-d47e-4adf-a5fd-ea8ebfe380b6';
const testVerification = db.verifySessionTamperHash(defaultSessionId);
if (testVerification.valid) {
  console.log(`  ✓ Default Candidate Profile: ${db.DEFAULT_CANDIDATE_ID || 'c8e4f1a2-9b3d-4e5f-a678-123456789abc'}`);
  console.log(`  ✓ Genesis Session: ${defaultSessionId}`);
  console.log(`  ✓ SHA-256 Tamper Hash Valid: ${testVerification.storedHash.substring(0, 16)}...`);
} else {
  throw new Error('Ledger cryptographic chain verification failed: ' + (testVerification.error || 'hash mismatch'));
}

// Step 3: 8-Module Curriculum & Simulation Config Verification
console.log('\n[3/4] Validating 8 Modulewise Simulation & Exploded View Schemas...');
const courses = require(path.join(ROOT, 'courses.js'));
const allCourses = courses.COURSES || courses.getAllCourses();
let totalModules = 0;

allCourses.forEach(crs => {
  crs.modules.forEach(m => {
    totalModules++;
    const cfg = m.simulationConfig;
    if (!cfg || !cfg.name || !cfg.telemetry || !cfg.steps || cfg.steps.length !== 6) {
      throw new Error(`Module ${m.code} missing required 6-step simulationConfig`);
    }
    const topic = m.topics[0];
    if (!topic || !topic.explodedViewType) {
      throw new Error(`Module ${m.code} missing explodedViewType in primary topic`);
    }
    console.log(`  ✓ [${m.code}] ${m.title} -> Exploded: ${topic.explodedViewType}, Steps: 6/6`);
  });
});
console.log(`  ✓ All ${totalModules} modules passed schema audit`);

// Step 4: Production Artifact Bundling
console.log('\n[4/4] Generating Production Distribution in dist/...');
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true, force: true });
}
fs.mkdirSync(DIST, { recursive: true });

const distFiles = [
  'index.html',
  'app.js',
  'equipment_models.js',
  'courses.js',
  'README.md'
];

const manifest = {
  name: 'MAYAVUE WebXR Certification Platform',
  version: '1.0.0',
  builtAt: new Date().toISOString(),
  target: 'Production WebXR / Desktop / Headset',
  modulesCount: totalModules,
  files: {}
};

distFiles.forEach(file => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    const dest = path.join(DIST, file);
    fs.copyFileSync(src, dest);
    const content = fs.readFileSync(src);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    manifest.files[file] = {
      size: content.length,
      sha256: hash
    };
    console.log(`  + dist/${file} (${content.length} bytes)`);
  }
});

fs.writeFileSync(path.join(DIST, 'build-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('  + dist/build-manifest.json generated');

console.log('\n====================================================');
console.log('  ✓ BUILD SUCCESSFUL! All assets verified & packaged.');
console.log('====================================================\n');
