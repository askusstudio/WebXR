// server.js - REST API & WebXR SPA Server
// MAYAVUE 6-Stage End-to-End VR Certification Platform

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const db = require('./db.js');
const courses = require('./courses.js');


const PORT = 8080;
const DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2 * 1024 * 1024) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// In-memory remote glitch injection queue
let activeInjectedGlitches = [];

// =========================================================================
// NATIVE RFC 6455 WEBSOCKET TELEMETRY STREAM (10 Hz ZERO-DEPENDENCY ENGINE)
// =========================================================================
const wsClients = new Set();

function decodeWsFrame(buffer) {
  if (buffer.length < 2) return null;
  const secondByte = buffer[1];
  const isMasked = (secondByte & 0x80) === 0x80;
  let payloadLength = secondByte & 0x7f;
  let offset = 2;
  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }
  let mask = null;
  if (isMasked) {
    if (buffer.length < offset + 4) return null;
    mask = buffer.subarray(offset, offset + 4);
    offset += 4;
  }
  if (buffer.length < offset + payloadLength) return null;
  const data = Buffer.from(buffer.subarray(offset, offset + payloadLength));
  if (isMasked && mask) {
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] ^ mask[i % 4];
    }
  }
  return data.toString('utf8');
}

function encodeWsTextFrame(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.from([0x81, len]);
  } else if (len <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function broadcastWsMessage(data) {
  const frame = encodeWsTextFrame(typeof data === 'string' ? data : JSON.stringify(data));
  for (const client of wsClients) {
    try {
      if (!client.destroyed) client.write(frame);
    } catch (_) {}
  }
}

const server = http.createServer(async (req, res) => {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ==========================================
  // STAGE 1: ONBOARDING & AUTH REST APIS
  // ==========================================

  // POST /api/auth/register (Create new profile with auto MVSTU### generation)
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.fullName || !payload.email) {
        return sendJson(res, 400, { error: 'fullName and email are required' });
      }
      const newProfile = db.registerUserProfile(payload);
      return sendJson(res, 201, { success: true, profile: newProfile });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // GET /api/candidates (Candidate directory / role switcher)
  if (req.method === 'GET' && pathname === '/api/candidates') {
    const list = db.listCandidates();
    return sendJson(res, 200, { candidates: list });
  }

  // GET /api/candidate/:id (Candidate profile by UUID or MVSTU ID)
  const candidateMatch = pathname.match(/^\/api\/candidate\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && candidateMatch) {
    const id = candidateMatch[1];
    const profile = db.getUserProfile(id);
    if (!profile) {
      return sendJson(res, 404, { error: 'Candidate profile not found' });
    }
    return sendJson(res, 200, { profile });
  }

  // Fallback: GET /api/candidate/current
  if (req.method === 'GET' && (pathname === '/api/candidate/current' || pathname === '/api/candidate/default')) {
    const profile = db.getUserProfile(db.DEFAULT_CANDIDATE_ID);
    return sendJson(res, 200, { profile, candidate: profile });
  }

  // ==========================================
  // STAGE 2 & 3: CURRICULUM & THEORY LAB APIS
  // ==========================================

  // GET /api/courses
  if (req.method === 'GET' && (pathname === '/api/courses' || pathname === '/api/courses/solar-installation')) {
    const all = courses.getAllCourses();
    const primary = courses.getCourse('solar-pv') || all[0];
    return sendJson(res, 200, { courses: all, ...primary });
  }

  // GET /api/courses/:courseId/theory/:moduleId or /api/courses/solar-installation/:topicId
  const topicMatch = pathname.match(/^\/api\/courses\/([a-zA-Z0-9_-]+)\/(?:theory\/)?([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && topicMatch) {
    const topicId = topicMatch[2];
    const topic = courses.getTopic(topicId);
    if (!topic) {
      return sendJson(res, 404, { error: 'Topic not found' });
    }
    return sendJson(res, 200, topic);
  }

  // ==========================================
  // STAGE 4: SIMULATION & TELEMETRY APIS
  // ==========================================

  // GET /api/simulation/module/:moduleId (Retrieve specific module VR simulation config)
  const simModuleMatch = pathname.match(/^\/api\/simulation\/(?:module\/)?([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && simModuleMatch) {
    const modId = simModuleMatch[1];
    const mod = courses.getModuleOrTopic(modId);
    if (!mod) {
      return sendJson(res, 404, { error: 'Simulation module not found' });
    }
    return sendJson(res, 200, { success: true, module: mod });
  }

  // POST /api/simulation/session-commit (Commit simulation with Socratic AI & tamper-proof hash)
  if (req.method === 'POST' && (pathname === '/api/simulation/session-commit' || pathname === '/api/simulation/commit')) {
    try {
      const payload = await parseJsonBody(req);
      const result = db.commitSimulationSession({
        userId: payload.userId || db.DEFAULT_CANDIDATE_ID,
        moduleCode: payload.moduleCode || payload.topicId || 'SOLAR-BOX-01',
        durationMinutes: payload.durationMinutes || (payload.activeDurationSeconds ? payload.activeDurationSeconds / 60 : 3.0),
        troubleshootPct: payload.troubleshootPct || payload.accuracyScore || 98.0,
        safetyPct: payload.safetyPct || (payload.safetyViolationsCount === 0 ? 100.0 : 80.0),
        toolUsePct: payload.toolUsePct || 95.0,
        safetyAlerts: payload.safetyAlerts || payload.safetyViolationsCount || 0,
        telemetryLog: payload.telemetryLog || payload.telemetryData || {}
      });
      return sendJson(res, 200, result);
    } catch (err) {
      console.error('Commit session error:', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // POST /api/telemetry/packet (10 Hz Live Telemetry Stream Ingestion)
  if (req.method === 'POST' && pathname === '/api/telemetry/packet') {
    try {
      const packet = await parseJsonBody(req);
      broadcastWsMessage({
        type: 'TELEMETRY_PACKET',
        packet,
        timestamp: new Date().toISOString()
      });
      return sendJson(res, 200, { success: true, received: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ==========================================
  // STAGE 5: DUAL-VIEW TELEMETRY, FLEET & RECRUITER TALENT POOL
  // ==========================================

  // GET /api/recruiter/leaderboard (Stage 5 Recruiter Talent Pool)
  if (req.method === 'GET' && (pathname === '/api/recruiter/leaderboard' || pathname === '/api/leaderboard')) {
    const leaderboard = db.getRecruiterLeaderboard();
    return sendJson(res, 200, { success: true, leaderboard });
  }

  // GET /api/admin/fleet (Master Admin / Instructor Console)

  if (req.method === 'GET' && pathname === '/api/admin/fleet') {
    const fleet = db.getFleetStatus();
    return sendJson(res, 200, {
      ...fleet,
      activeInjectedGlitches
    });
  }

  // POST /api/admin/inject-fault (Remote Fault Injection by Proctor)
  if (req.method === 'POST' && pathname === '/api/admin/inject-fault') {
    try {
      const payload = await parseJsonBody(req);
      const glitch = {
        id: 'GLITCH-' + Date.now(),
        faultType: payload.faultType || 'BLOWN_1000V_FUSE',
        targetTrainee: payload.targetTrainee || 'MVSTU001',
        severity: payload.severity || 'HIGH',
        injectedAt: new Date().toISOString(),
        status: 'ACTIVE'
      };
      activeInjectedGlitches.unshift(glitch);
      if (activeInjectedGlitches.length > 10) activeInjectedGlitches.pop();

      return sendJson(res, 200, {
        success: true,
        message: `Glitch [${glitch.faultType}] injected into trainee ${glitch.targetTrainee}`,
        glitch
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ==========================================
  // STAGE 6: SMART SCORECARD & CERTIFICATION
  // ==========================================

  // GET /api/certificate/:sessionId (Smart Scorecard Passport & Socratic AI)
  const certMatch = pathname.match(/^\/api\/certificate\/([a-zA-Z0-9_-]+)$/) || pathname.match(/^\/api\/sessions\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && certMatch) {
    const sessionId = certMatch[1];
    const session = db.getSessionById(sessionId);
    if (!session) {
      return sendJson(res, 404, { error: 'Session record not found' });
    }
    const verification = db.verifySessionTamperHash(sessionId);
    return sendJson(res, 200, {
      session,
      verification,
      tamperProofCertified: verification.valid
    });
  }

  // GET /api/verify/:sessionId (Public Recruiter / Employer Verification)
  const verifyMatch = pathname.match(/^\/api\/verify\/([a-zA-Z0-9_-]+)$/);
  if (req.method === 'GET' && verifyMatch) {
    const sessionId = verifyMatch[1];
    const session = db.getSessionById(sessionId);
    if (!session) {
      return sendJson(res, 404, { error: 'Invalid or non-existent credential identifier' });
    }
    const verification = db.verifySessionTamperHash(sessionId);
    return sendJson(res, 200, {
      status: 'VERIFIED',
      candidateName: session.full_name,
      verificationId: session.verification_id,
      moduleCode: session.module_code,
      scorecard: {
        troubleshootPct: session.troubleshoot_pct,
        safetyPct: session.safety_pct,
        toolUsePct: session.tool_use_pct,
        grade: session.ai_feedback?.overallGrade || 'DISTINCTION'
      },
      tamperHash: session.tamper_hash,
      chainValid: verification.valid,
      issuedAt: session.created_at
    });
  }

  // Ledger verification: GET /api/ledger/verify
  if (req.method === 'GET' && pathname === '/api/ledger/verify') {
    const defaultSessionId = '8a8c5cff-d47e-4adf-a5fd-ea8ebfe380b6';
    const v = db.verifySessionTamperHash(defaultSessionId);
    return sendJson(res, 200, {
      chainLength: 1,
      allValid: v.valid,
      checks: [v]
    });
  }

  // ==========================================
  // STATIC FILE SERVING & SPA FALLBACK ROUTER
  // ==========================================

  let filePath = path.join(DIR, pathname === '/' ? 'index.html' : pathname);

  // Check if requested file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // SPA Route Fallback: serve index.html for client-side routing
  const indexPath = path.join(DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    fs.createReadStream(indexPath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

// RFC 6455 WebSocket Upgrade Handler
server.on('upgrade', (req, socket, head) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (parsedUrl.pathname === '/api/telemetry/ws' || parsedUrl.pathname === '/ws') {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }
    const acceptHash = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptHash}`
    ];
    socket.write(headers.join('\r\n') + '\r\n\r\n');
    wsClients.add(socket);

    // Send initial handshake confirmation
    const welcome = encodeWsTextFrame(JSON.stringify({
      type: 'STREAM_CONNECTED',
      rate: '10Hz',
      serverTime: new Date().toISOString()
    }));
    socket.write(welcome);

    socket.on('data', chunk => {
      const text = decodeWsFrame(chunk);
      if (text) {
        try {
          const packet = JSON.parse(text);
          broadcastWsMessage({
            type: 'TELEMETRY_PACKET',
            packet,
            timestamp: new Date().toISOString()
          });
        } catch (_) {}
      }
    });

    socket.on('close', () => wsClients.delete(socket));
    socket.on('error', () => wsClients.delete(socket));
  } else {
    socket.destroy();
  }
});

server.listen(PORT, '0.0.0.0', () => {

  const nets = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log('====================================================');
  console.log('  MAYAVUE // 6-Stage End-to-End Certification Server');
  console.log('====================================================');
  console.log('  > Stage 1 (Onboarding):  http://localhost:' + PORT + '/#/auth/onboarding');
  console.log('  > Stage 2 (Learner Hub):  http://localhost:' + PORT + '/#/dashboard');
  console.log('  > Stage 3 (Theory Lab):   http://localhost:' + PORT + '/#/course/solar-pv/theory/solar_troubleshooting_04');
  console.log('  > Stage 4 (VR Simulator): http://localhost:' + PORT + '/#/simulate/solar_troubleshooting_04');
  console.log('  > Stage 5 (Fleet Admin):  http://localhost:' + PORT + '/#/admin/live');
  console.log('  > Stage 6 (Scorecard):    http://localhost:' + PORT + '/#/certificate/8a8c5cff-d47e-4adf-a5fd-ea8ebfe380b6');
  console.log('  > Headset Network:        http://' + localIp + ':' + PORT);
  console.log('====================================================');
});
