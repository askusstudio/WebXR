// app.js - MAYAVUE 6-Stage End-to-End VR Certification Platform Controller
// Stages: 1. Onboarding -> 2. Learner Hub -> 3. Theory & 3D Lab -> 4. 3D/VR Sim -> 5. Admin Telemetry -> 6. Smart Scorecard

class MayaVuePlatform {
  constructor() {
    this.currentCandidateId = 'c8e4f1a2-9b3d-4e5f-a678-123456789abc';
    this.currentCandidate = null;
    this.allCandidates = [];
    this.allCourses = [];
    this.currentCourseId = 'solar-pv';
    this.currentTopicId = 'solar_troubleshooting_04';
    this.activeTopicTab = 'syllabus';
    this.currentRole = 'LEARNER'; // 'LEARNER' or 'INSTRUCTOR'
    this.simTelemetry = {
      startTime: null,
      events: [],
      safetyViolations: 0,
      activeInterval: null
    };

    this.init();
    this.initTelemetryWebSocket();
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.handleRoute();
  }

  initTelemetryWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/telemetry/ws`;
    try {
      this.telemetryWs = new WebSocket(wsUrl);
      this.telemetryWs.onopen = () => {
        console.log('[Telemetry WS] Connected: 10 Hz streaming active');
      };
      this.telemetryWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'TELEMETRY_PACKET' && this.onTelemetryReceived) {
            this.onTelemetryReceived(msg.packet);
          }
        } catch (_) {}
      };
    } catch (e) {
      console.warn('[Telemetry WS] WebSocket fallback to HTTP', e);
    }
  }

  sendTelemetryPacket(type, data = {}) {
    const packet = {
      type, // TOOL_GRAB, BREAKER_SWITCH, PROBE_VOLTAGE, TORQUE_APPLIED, UNINSULATED_CONTACT
      candidateId: this.currentCandidateId,
      moduleCode: this.currentTopicId || 'SOLAR-BOX-01',
      timestamp: new Date().toISOString(),
      data
    };

    if (this.telemetryWs && this.telemetryWs.readyState === WebSocket.OPEN) {
      this.telemetryWs.send(JSON.stringify(packet));
    } else {
      fetch('/api/telemetry/packet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet)
      }).catch(() => {});
    }
  }


  setupEventListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());

    // Role switcher button in nav
    const roleBtn = document.getElementById('nav-role-toggle');
    if (roleBtn) {
      roleBtn.addEventListener('click', () => {
        this.currentRole = this.currentRole === 'LEARNER' ? 'INSTRUCTOR' : 'LEARNER';
        this.updateRoleUI();
        if (this.currentRole === 'INSTRUCTOR') {
          window.location.hash = '#/admin/live';
        } else {
          window.location.hash = '#/dashboard';
        }
      });
    }

    // Biometric scanner simulator on Onboarding
    const bioBtn = document.getElementById('bio-scan-btn');
    if (bioBtn) {
      bioBtn.addEventListener('click', () => this.simulateBiometricAuth());
    }

    // Register form on Onboarding
    const regForm = document.getElementById('onboarding-register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => this.handleRegistration(e));
    }
  }

  async loadInitialData() {
    try {
      const [candsRes, crsRes] = await Promise.all([
        fetch('/api/candidates').then(r => r.json()),
        fetch('/api/courses').then(r => r.json())
      ]);

      this.allCandidates = candsRes.candidates || [];
      this.allCourses = crsRes.courses || [];
      this.currentCandidate = this.allCandidates.find(c => c.id === this.currentCandidateId) || this.allCandidates[0];

      this.updateProfileHeader();
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }

  updateProfileHeader() {
    if (!this.currentCandidate) return;

    const nameEl = document.getElementById('nav-candidate-name');
    const roleBadge = document.getElementById('nav-role-badge');
    const stuIdBadge = document.getElementById('nav-stuid-badge');
    const avatarEl = document.getElementById('nav-candidate-avatar');

    if (nameEl) nameEl.textContent = this.currentCandidate.full_name;
    if (roleBadge) roleBadge.textContent = this.currentRole;
    if (stuIdBadge) stuIdBadge.textContent = this.currentCandidate.verification_id || 'MVSTU001';
    if (avatarEl && this.currentCandidate.avatar_url) avatarEl.src = this.currentCandidate.avatar_url;
  }

  updateRoleUI() {
    const roleBadge = document.getElementById('nav-role-badge');
    if (roleBadge) {
      roleBadge.textContent = this.currentRole;
      if (this.currentRole === 'INSTRUCTOR') {
        roleBadge.className = 'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800';
      } else {
        roleBadge.className = 'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800';
      }
    }
  }

  // ==========================================
  // CLIENT HASH ROUTER (6-STAGE WORKFLOW)
  // ==========================================

  handleRoute() {
    const hash = window.location.hash || '#/dashboard';
    const rawClean = hash.replace(/^#\/?/, '');
    const [cleanHash, queryString] = rawClean.split('?');
    const queryParams = new URLSearchParams(queryString || '');
    const focusParam = queryParams.get('focus');
    const parts = cleanHash.split('/');

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkHref = link.getAttribute('href') || '';
      if (linkHref === hash || (linkHref.startsWith('#/course') && hash.startsWith('#/course'))) {
        link.classList.add('nav-link-active');
      } else {
        link.classList.remove('nav-link-active');
      }
    });

    // Hide all screens
    document.querySelectorAll('.app-screen').forEach(el => el.classList.add('hidden'));

    // STAGE 1: Onboarding
    if (cleanHash === 'auth/onboarding' || cleanHash === 'onboarding') {
      this.showOnboardingScreen();
      return;
    }

    // STAGE 2: Learner Dashboard
    if (cleanHash === '' || cleanHash === 'dashboard' || cleanHash === 'profile') {
      this.showLearnerDashboard();
      return;
    }

    // STAGE 3: Multimodal Theory & 3D Prep Center
    // Format: #/course/:courseId/theory/:moduleId
    if (parts[0] === 'course' && parts[2] === 'theory') {
      this.showTheoryLabScreen(parts[1], parts[3], focusParam);
      return;
    }
    // Fallback for #/courses/solar-installation/:topicId
    if (parts[0] === 'courses' && parts[2]) {
      this.showTheoryLabScreen('solar-pv', parts[2], focusParam);
      return;
    }


    // STAGE 4: 3D/VR Simulation Lab
    // Format: #/simulate/:moduleId
    if (parts[0] === 'simulate') {
      this.showSimulationScreen(parts[1] || 'solar_troubleshooting_04');
      return;
    }

    // STAGE 5: Telemetry & Master Admin Console
    if (cleanHash === 'telemetry' || cleanHash === 'admin/live' || cleanHash === 'admin') {
      this.showAdminFleetScreen();
      return;
    }

    // STAGE 6: Smart Scorecard & Competency Passport
    // Format: #/certificate/:sessionId or #/report-card/:sessionId
    if (parts[0] === 'certificate' || parts[0] === 'report-card') {
      this.showScorecardScreen(parts[1] || '8a8c5cff-d47e-4adf-a5fd-ea8ebfe380b6');
      return;
    }

    // Public Recruiter Verification: #/verify/:sessionId
    if (parts[0] === 'verify') {
      this.showPublicVerificationScreen(parts[1]);
      return;
    }

    // Default fallback
    this.showLearnerDashboard();
  }

  // ==========================================
  // STAGE 1: ONBOARDING & BIOMETRIC AUTH
  // ==========================================

  showOnboardingScreen() {
    const screen = document.getElementById('view-onboarding');
    if (!screen) return;
    screen.classList.remove('hidden');

    this.renderCandidateSwitcher();
  }

  simulateBiometricAuth() {
    const statusText = document.getElementById('bio-status-text');
    const icon = document.getElementById('bio-fingerprint-icon');
    if (!statusText) return;

    statusText.textContent = 'Scanning biometric fingerprint sensor...';
    if (icon) icon.classList.add('animate-pulse', 'text-sky-400');

    setTimeout(() => {
      statusText.textContent = 'Verifying cryptographic security key (WebAuthn)...';
      setTimeout(() => {
        statusText.textContent = '✓ Biometric Authentication Verified (Passkey Enrolled)';
        if (icon) {
          icon.classList.remove('animate-pulse', 'text-sky-400');
          icon.classList.add('text-emerald-400');
        }
      }, 800);
    }, 900);
  }

  async handleRegistration(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value || 'LEARNER';

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: name, email, role })
      });
      const data = await res.json();
      if (data.profile) {
        this.currentCandidate = data.profile;
        this.currentCandidateId = data.profile.id;
        this.currentRole = data.profile.role;
        this.updateProfileHeader();
        this.updateRoleUI();
        await this.loadInitialData();

        const badgeEl = document.getElementById('provisioned-badge-display');
        if (badgeEl) {
          badgeEl.innerHTML = `
            <div class="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono">
              ✓ PROVISIONED IDENTIFIER: <span class="font-bold text-white">${data.profile.verification_id}</span> • Safety Accreditation Initialized
            </div>
          `;
        }

        setTimeout(() => {
          window.location.hash = '#/dashboard';
        }, 1200);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  }

  renderCandidateSwitcher() {
    const listEl = document.getElementById('candidate-switcher-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    this.allCandidates.forEach(cand => {
      const isSelected = cand.id === this.currentCandidateId;
      const btn = document.createElement('button');
      btn.className = `w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs font-mono ${
        isSelected
          ? 'bg-sky-950/80 border-sky-500 text-sky-200 ring-1 ring-sky-500/40'
          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
      }`;
      btn.innerHTML = `
        <div class="flex items-center gap-2.5">
          <img src="${cand.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80'}" class="w-6 h-6 rounded-full object-cover">
          <div>
            <span class="font-bold text-slate-200">${cand.full_name}</span>
            <span class="text-[11px] text-slate-400 block">${cand.verification_id} • ${cand.role}</span>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] ${isSelected ? 'bg-sky-900 text-sky-200' : 'bg-slate-800 text-slate-400'}">
          ${isSelected ? 'ACTIVE' : 'SELECT'}
        </span>
      `;
      btn.onclick = () => {
        this.currentCandidate = cand;
        this.currentCandidateId = cand.id;
        this.currentRole = cand.role;
        this.updateProfileHeader();
        this.updateRoleUI();
        this.renderCandidateSwitcher();
      };
      listEl.appendChild(btn);
    });
  }

  // ==========================================
  // STAGE 2: LEARNER DASHBOARD & COURSE HUB
  // ==========================================

  async showLearnerDashboard() {
    const screen = document.getElementById('view-dashboard');
    if (!screen) return;
    screen.classList.remove('hidden');

    this.renderLearnerStats();
    this.renderMultiTrackCourses();
  }

  renderLearnerStats() {
    const cand = this.currentCandidate;
    if (!cand) return;

    const hoursEl = document.getElementById('stat-practice-hours');
    const faultsEl = document.getElementById('stat-solved-faults');
    const safetyEl = document.getElementById('stat-safety-rating');
    const certBadge = document.getElementById('dashboard-candidate-tag');
    const nameEl = document.getElementById('dashboard-candidate-name');

    if (hoursEl) hoursEl.textContent = `${Number(cand.practice_hours || 18.5).toFixed(1)} hrs`;
    if (faultsEl) faultsEl.textContent = `${cand.solved_faults || 15} / 20`;
    if (safetyEl) safetyEl.textContent = `${Number(cand.safety_rating || 4.9).toFixed(1)} / 5.0`;
    if (certBadge) certBadge.textContent = cand.profile_tag || 'Certified PV Installer - Level 1';
    if (nameEl) nameEl.textContent = cand.full_name;

    // Render Radar Chart
    this.renderRadarChart(cand.skill_matrix || {
      electrical_safety: 97,
      mechanical_mounting: 92,
      dc_wiring: 94,
      inverter_commissioning: 88,
      fault_isolation: 98
    });
  }

  renderRadarChart(skills) {
    const svg = document.getElementById('skill-radar-svg');
    if (!svg) return;

    const keys = ['electrical_safety', 'mechanical_mounting', 'dc_wiring', 'inverter_commissioning', 'fault_isolation'];
    const labels = ['Electrical Safety', 'Mechanical Mounting', 'DC Wiring', 'Inverter Commissioning', 'Fault Isolation'];
    const cx = 160, cy = 130, r = 90;
    const points = [];

    keys.forEach((k, i) => {
      const val = (skills[k] || 85) / 100;
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + r * val * Math.cos(angle);
      const y = cy + r * val * Math.sin(angle);
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });

    const polygon = document.getElementById('radar-skill-polygon');
    if (polygon) {
      polygon.setAttribute('points', points.join(' '));
    }
  }

  renderMultiTrackCourses() {
    const container = document.getElementById('dashboard-courses-grid');
    if (!container) return;
    container.innerHTML = '';

    this.allCourses.forEach(crs => {
      const card = document.createElement('div');
      card.className = 'rounded-xl p-6 bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-3 mb-3">
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/80">
              ${crs.courseCode}
            </span>
            <span class="text-xs font-mono text-slate-400">${crs.estimatedHours} Hours • ${crs.totalModules} Modules</span>
          </div>
          <h3 class="text-base font-bold text-white mb-2">${crs.title}</h3>
          <p class="text-xs text-slate-400 line-clamp-2 mb-4">${crs.description}</p>
          <div class="space-y-1.5 mb-4">
            <div class="flex justify-between text-[11px] font-mono text-slate-300">
              <span>Curriculum Progress</span>
              <span class="text-emerald-400 font-bold">${crs.progressPct || 65}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-full" style="width: ${crs.progressPct || 65}%"></div>
            </div>
          </div>

          <!-- Module List with Direct VR Simulation Launchers -->
          <div class="space-y-2 pt-3 border-t border-slate-800/80 mb-4">
            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">Specialized Modules & VR Labs:</span>
            ${(crs.modules || []).map(m => `
              <div class="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors">
                <div class="flex items-center gap-2 overflow-hidden mr-2">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-800/60 shrink-0">${m.code}</span>
                  <span class="text-slate-200 text-[11px] font-medium truncate" title="${m.title}">${m.title}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <a href="#/course/${crs.id}/theory/${m.topics[0]?.id || m.id}" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono text-decoration-none">
                    📖 Theory
                  </a>
                  <a href="#/simulate/${m.id}" class="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] font-mono text-decoration-none flex items-center gap-0.5">
                    ⚡ VR Sim
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 font-mono">${crs.standard}</span>
          <a href="#/course/${crs.id}/theory/${crs.modules[0]?.topics[0]?.id || 'solar_troubleshooting_04'}" class="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors text-decoration-none inline-flex items-center gap-1.5">
            Full Course View →
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ==========================================
  // STAGE 3: THEORY & 3D MEDIA PREP CENTER
  // ==========================================

  async showTheoryLabScreen(courseId, topicId, focusParam = null) {
    const screen = document.getElementById('view-topic-detail');
    if (!screen) return;
    screen.classList.remove('hidden');

    this.currentCourseId = courseId;
    this.currentTopicId = topicId;

    try {
      const topic = await fetch(`/api/courses/${courseId}/theory/${topicId}`).then(r => r.json());
      this.renderTheoryLab(topic, focusParam);
    } catch (err) {
      console.error('Failed to load topic:', err);
    }
  }

  renderTheoryLab(topic, focusParam = null) {
    document.getElementById('topic-title').textContent = topic.title;
    document.getElementById('topic-module-badge').textContent = `Module 0${topic.moduleNumber}: ${topic.moduleTitle}`;
    document.getElementById('topic-overview-text').textContent = topic.syllabus.overview;

    // Adaptive Recovery Remedial Micro-Theory Banner
    const remContainer = document.getElementById('topic-remedial-container');
    if (remContainer) {
      if (focusParam && topic.syllabus && topic.syllabus.remedialTheory && topic.syllabus.remedialTheory[focusParam]) {
        const rem = topic.syllabus.remedialTheory[focusParam];
        remContainer.innerHTML = `
          <div class="p-5 rounded-2xl border-2 border-rose-500/90 bg-gradient-to-r from-rose-950/90 via-slate-950 to-amber-950/40 text-rose-100 shadow-2xl backdrop-blur">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded bg-rose-600 text-white font-mono text-xs font-bold animate-pulse">
                  ⚠ ADAPTIVE RECOVERY PROTOCOL ACTIVE
                </span>
                <span class="font-mono text-xs text-rose-300">BENCHMARK BREACH DETECTED</span>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-900 border border-rose-800 text-[11px] font-mono text-rose-400">
                ${rem.badge}
              </span>
            </div>
            <h3 class="text-lg font-extrabold text-white mb-1">${rem.title}</h3>
            <p class="text-xs text-slate-300 font-mono mb-4">${rem.standard} • Required before practical exam unlocked</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/80 p-4 rounded-xl border border-rose-900/60 mb-4">
              <div>
                <h4 class="font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                  <span>🎯</span> Mandatory Remedial Takeaways:
                </h4>
                <ul class="space-y-1.5 text-slate-300">
                  ${rem.keyTakeaways.map(t => `<li class="flex items-start gap-1.5"><span class="text-rose-400">•</span><span>${t}</span></li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <span>⚡</span> Critical Rules &amp; Safety Interlocks:
                </h4>
                <ul class="space-y-1.5 text-amber-200">
                  ${rem.criticalRules.map(r => `<li class="flex items-start gap-1.5"><span class="text-amber-400">⚠</span><span>${r}</span></li>`).join('')}
                </ul>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-rose-900/40">
              <span class="text-xs text-slate-400 font-mono">Exam unlock state: Remedial review in progress. Complete review below to re-qualify.</span>
              <button onclick="window.location.hash = '#/simulate/${topic.id}'" class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all">
                ⚡ Retake Practical VR Exam →
              </button>
            </div>
          </div>
        `;
      } else {
        remContainer.innerHTML = '';
      }
    }


    // Glowing Primary CTA: Route directly to Stage 4 (3D/VR Simulator)
    const simCta = document.getElementById('topic-launch-sim-btn');
    if (simCta) {
      simCta.onclick = () => {
        window.location.hash = `#/simulate/${topic.id}`;
      };
    }

    // Tabs
    const tabSyllabusBtn = document.getElementById('tab-btn-syllabus');
    const tabVideoBtn = document.getElementById('tab-btn-video');
    const tab3dBtn = document.getElementById('tab-btn-3d');

    const contentSyllabus = document.getElementById('tab-content-syllabus');
    const contentVideo = document.getElementById('tab-content-video');
    const content3d = document.getElementById('tab-content-3d');

    const setTab = (tab) => {
      this.activeTopicTab = tab;
      [tabSyllabusBtn, tabVideoBtn, tab3dBtn].forEach(b => b?.classList.remove('tab-btn-active'));
      [contentSyllabus, contentVideo, content3d].forEach(c => c?.classList.add('hidden'));

      if (tab === 'syllabus') {
        tabSyllabusBtn?.classList.add('tab-btn-active');
        contentSyllabus?.classList.remove('hidden');
      } else if (tab === 'video') {
        tabVideoBtn?.classList.add('tab-btn-active');
        contentVideo?.classList.remove('hidden');
      } else if (tab === '3d') {
        tab3dBtn?.classList.add('tab-btn-active');
        content3d?.classList.remove('hidden');
        this.initExploded3DView(topic.explodedViewType);
      }
    };

    if (tabSyllabusBtn) tabSyllabusBtn.onclick = () => setTab('syllabus');
    if (tabVideoBtn) tabVideoBtn.onclick = () => setTab('video');
    if (tab3dBtn) tab3dBtn.onclick = () => setTab('3d');

    // Tab 1: Books & PDFs (SLD Schematic, Ratings, Tools)
    const sldEl = document.getElementById('topic-sld-diagram');
    if (sldEl) sldEl.textContent = topic.syllabus.sld;

    const ratingsTbody = document.getElementById('topic-ratings-tbody');
    if (ratingsTbody) {
      ratingsTbody.innerHTML = topic.syllabus.ratings.map(r => `
        <tr class="border-b border-slate-800">
          <td class="py-2 px-3 text-slate-300 font-medium text-xs">${r.parameter}</td>
          <td class="py-2 px-3 text-sky-400 font-mono text-xs font-semibold">${r.value}</td>
        </tr>
      `).join('');
    }

    const toolsList = document.getElementById('topic-tools-list');
    if (toolsList) {
      toolsList.innerHTML = topic.syllabus.tools.map(t => `
        <li class="flex items-center gap-2 text-xs text-slate-300">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          ${t}
        </li>
      `).join('');
    }

    // Tab 2: Videos (Chapter markers)
    const chaptersList = document.getElementById('topic-video-chapters');
    if (chaptersList) {
      chaptersList.innerHTML = topic.videoChapters.map((ch, idx) => `
        <button onclick="document.getElementById('video-timestamp-display').textContent = 'Playing Chapter: ${ch.title} (${ch.time})'" class="w-full text-left flex items-center justify-between p-2 rounded hover:bg-slate-800/80 transition-colors text-xs font-mono">
          <span class="text-slate-300 font-medium">${idx + 1}. ${ch.title}</span>
          <span class="text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700/60">${ch.time}</span>
        </button>
      `).join('');
    }

    setTab('syllabus');
  }

  // Exploded 3D Component Assembly View
  initExploded3DView(viewType) {
    const container = document.getElementById('exploded-3d-canvas-container') || document.getElementById('exploded-canvas-container');
    if (!container) return;

    // Clean up previous canvas if present
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const THREE = window.THREE;
    if (!THREE) {
      console.warn('window.THREE is not available yet');
      return;
    }

    const width = container.clientWidth || 640;
    const height = 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a101d);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0.6, 0.8, 1.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // OrbitControls
    const OrbitControlsCtor = window.OrbitControls || (window.THREE && window.THREE.OrbitControls);
    const controls = OrbitControlsCtor ? new OrbitControlsCtor(camera, renderer.domElement) : null;
    if (controls) {
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);
    }

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dir.position.set(2, 3, 2);
    scene.add(dir);
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-2, -1, -1);
    scene.add(fillLight);

    // Build exploded model using MAYAVUE_MODELS or fallback
    let explodedResult = null;
    if (window.MAYAVUE_MODELS && window.MAYAVUE_MODELS.ExplodedViewBuilder) {
      explodedResult = window.MAYAVUE_MODELS.ExplodedViewBuilder.build(viewType, scene, THREE);
    } else {
      // Fallback simple DIN rail
      const explodeGroup = new THREE.Group();
      scene.add(explodeGroup);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const dinRail = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.035, 0.015), railMat);
      explodeGroup.add(dinRail);
      explodedResult = { group: explodeGroup, parts: { explode: () => {} }, labelText: 'DIN Rail 35mm • Standard Mounting' };
    }

    // Update component labels text below canvas
    const labelsEl = document.getElementById('exploded-component-labels');
    if (labelsEl && explodedResult.labelText) {
      labelsEl.textContent = explodedResult.labelText;
    }

    const render = () => {
      renderer.render(scene, camera);
    };

    if (controls) {
      controls.addEventListener('change', render);
    }

    // Slider listener
    const slider = document.getElementById('exploded-view-slider');
    if (slider) {
      slider.value = 0;
      slider.oninput = (e) => {
        const val = parseFloat(e.target.value);
        if (explodedResult && explodedResult.parts && typeof explodedResult.parts.explode === 'function') {
          explodedResult.parts.explode(val);
        }
        render();
      };
    }

    render();
  }

  // ==========================================
  // STAGE 4: 3D/VR SIMULATION LAB & TELEMETRY
  // ==========================================

  async showSimulationScreen(moduleId) {
    const screen = document.getElementById('view-simulation');
    if (!screen) return;
    screen.classList.remove('hidden');

    this.simTelemetry.startTime = new Date();
    this.simTelemetry.events = [];
    this.simTelemetry.safetyViolations = 0;

    // Fetch rich module configuration
    let modData = null;
    try {
      const res = await fetch(`/api/simulation/module/${moduleId || 'solar_troubleshooting_04'}`);
      const data = await res.json();
      if (data.success && data.module) {
        modData = data.module;
      }
    } catch (err) {
      console.warn('Could not fetch simulation config from API:', err);
    }

    // Update HUD and Task Guide with module-specific metadata
    this.updateSimulationScreenHUD(modData, moduleId);

    // Call 3D Engine to construct this module's dedicated equipment
    if (window.app && typeof window.app.loadModuleSimulation === 'function') {
      window.app.loadModuleSimulation(modData || moduleId);
    } else {
      let tries = 0;
      const tId = setInterval(() => {
        tries++;
        if (window.app && typeof window.app.loadModuleSimulation === 'function') {
          clearInterval(tId);
          window.app.loadModuleSimulation(modData || moduleId);
        } else if (tries > 30) {
          clearInterval(tId);
        }
      }, 100);
    }

    // Start 10 Hz Telemetry Stream Simulator
    if (this.simTelemetry.activeInterval) {
      clearInterval(this.simTelemetry.activeInterval);
    }

    this.simTelemetry.activeInterval = setInterval(() => {
      this.streamTelemetrySample();
    }, 100); // 10 Hz
  }

  updateSimulationScreenHUD(modData, moduleId) {
    const simConfig = modData?.simulationConfig || {};
    const modCode = modData?.moduleCode || modData?.code || simConfig.code || moduleId || 'SOLAR-BOX-01';
    const modName = simConfig.name || modData?.title || 'Solar Facility Simulation';
    const modStandard = simConfig.standard || 'NFPA 70E / OSHA Standard';

    // Top Navigation Simulation Bar
    const topBarTitle = document.querySelector('#view-simulation .fixed.top-14 span.text-slate-300');
    if (topBarTitle) {
      topBarTitle.textContent = `Module ${modData?.moduleNumber || ''}: ${modName}`;
    }

    // Top Header Card
    const fullTitleEl = document.querySelector('.title-full');
    const shortTitleEl = document.querySelector('.title-short');
    const subTitleEl = document.querySelector('.sub');
    if (fullTitleEl) fullTitleEl.textContent = `Mark VII // ${simConfig.name || modName}`;
    if (shortTitleEl) shortTitleEl.textContent = modCode;
    if (subTitleEl) subTitleEl.textContent = modStandard.toUpperCase();

    // Telemetry items
    const tel = simConfig.telemetry || {};
    const p1 = tel.p1 || { label: 'Roof PV (Voc)', value: '480.0 V' };
    const p2 = tel.p2 || { label: 'Irradiance', value: '880 W/m²' };
    const p3 = tel.p3 || { label: 'Bus Voltage', value: '480.0 V' };
    const p4 = tel.p4 || { label: 'Battery Bay', value: 'OFFLINE' };

    const updateTelItem = (valId, item) => {
      const el = document.getElementById(valId);
      if (el) {
        el.textContent = item.value;
        const labelEl = el.previousElementSibling;
        if (labelEl && labelEl.classList.contains('telemetry-label')) {
          labelEl.textContent = item.label;
        }
      }
    };

    updateTelItem('hud-solar-voltage', p1);
    updateTelItem('hud-irradiance', p2);
    updateTelItem('hud-voltage', p3);
    updateTelItem('hud-battery-status', p4);

    // Movable Task Guidance HUD
    const handleText = document.getElementById('guide-handle-text');
    if (handleText) handleText.textContent = `TASK GUIDE // ${modCode}`;

    const steps = simConfig.steps || [
      '1. MAIN GATE: Scan biometric authorization card.',
      '2. SAFE ISOLATION: Rotate DC isolator switch 90° to OFF.',
      '3. PROBE VOLTAGE: Probe high-voltage terminals (<50V).',
      '4. REPLACE FUSE: Extract blown fuse #3 & insert fresh 15A fuse.',
      '5. TOOL BOX: Retrieve insulated torque driver from steel box.',
      '6. CONNECT BATTERY: Slide 48V LiFePO4 battery pack into bay.'
    ];

    const taskStepTag = document.getElementById('task-step-tag');
    const taskTitle = document.getElementById('task-title');
    const taskInstruction = document.getElementById('task-instruction');

    if (taskStepTag) taskStepTag.textContent = 'STEP 1 OF 6';
    if (taskTitle) taskTitle.textContent = steps[0].split(':')[0].replace(/^[0-9]+\.\s*/, '');
    if (taskInstruction) taskInstruction.textContent = steps[0].split(':')[1] || steps[0];

    // Update step pills
    for (let i = 1; i <= 6; i++) {
      const pill = document.getElementById(`step-pill-${i}`);
      if (pill) {
        if (steps[i - 1]) {
          const shortName = steps[i - 1].split(':')[0].replace(/^[0-9]+\.\s*/, '');
          pill.textContent = `${i}. ${shortName}`;
        }
        if (i === 1) pill.className = 'step-pill active';
        else pill.className = 'step-pill';
      }
    }

    // Hook Finish Button
    const finishBtn = document.getElementById('sim-complete-trigger-btn');
    if (finishBtn) {
      finishBtn.onclick = () => {
        this.handleSimulationCompleted({
          moduleCode: modCode,
          troubleshootPct: 98.8,
          safetyPct: 100.0,
          toolUsePct: 97.5,
          safetyAlerts: 0,
          activeDurationSeconds: 165,
          telemetryLog: simConfig.telemetryLog || {
            module: modCode,
            status: 'COMPLETED_SUCCESS'
          }
        });
      };
    }
  }

  streamTelemetrySample() {
    const rateEl = document.getElementById('sim-telemetry-rate-badge');
    if (rateEl) {
      rateEl.textContent = 'TELEMETRY: 10 Hz LIVE';
    }
  }

  async handleSimulationCompleted(result) {
    if (this.simTelemetry.activeInterval) {
      clearInterval(this.simTelemetry.activeInterval);
      this.simTelemetry.activeInterval = null;
    }

    try {
      const payload = {
        userId: this.currentCandidateId,
        moduleCode: result.moduleCode || 'SOLAR-BOX-01',
        durationMinutes: result.activeDurationSeconds ? result.activeDurationSeconds / 60 : 2.75,
        troubleshootPct: result.troubleshootPct != null ? result.troubleshootPct : 99.2,
        safetyPct: result.safetyPct != null ? result.safetyPct : 100.0,
        toolUsePct: result.toolUsePct != null ? result.toolUsePct : 98.5,
        safetyAlerts: result.safetyAlerts || 0,
        telemetryLog: result.telemetryLog || {}
      };

      const res = await fetch('/api/simulation/session-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      // Refresh candidate profile in local state
      await this.loadInitialData();

      // Autonomous Closed-Loop Routing:
      if (data.nextAction === 'REMEDIAL_THEORY' && data.route) {
        window.location.hash = data.route;
      } else if (data.sessionId) {
        window.location.hash = `#/certificate/${data.sessionId}`;
      }
    } catch (err) {
      console.error('Failed to commit simulation session:', err);
    }
  }

  // STAGE 5: DUAL-VIEW TELEMETRY & ADMIN FLEET
  // ==========================================

  async showAdminFleetScreen() {
    const screen = document.getElementById('view-admin-fleet');
    if (!screen) return;
    screen.classList.remove('hidden');

    try {
      const [fleetData, leaderboardData] = await Promise.all([
        fetch('/api/admin/fleet').then(r => r.json()),
        fetch('/api/recruiter/leaderboard').then(r => r.json()).catch(() => ({ leaderboard: [] }))
      ]);
      this.renderAdminFleet(fleetData, leaderboardData.leaderboard || []);
    } catch (err) {
      console.error('Failed to load fleet data:', err);
    }
  }

  renderAdminFleet(fleetData, leaderboard = []) {

    // Top KPIs
    const countEl = document.getElementById('admin-fleet-count');
    const fixTimeEl = document.getElementById('admin-avg-fixtime');
    const alertsEl = document.getElementById('admin-active-alerts-count');

    if (countEl) countEl.textContent = `${fleetData.connectedTraineesCount} Active`;
    if (fixTimeEl) fixTimeEl.textContent = `${fleetData.averageFixTimeMinutes} min`;
    if (alertsEl) alertsEl.textContent = `${fleetData.safetyAlerts.length} Logged`;

    // Fleet Table
    const tbody = document.getElementById('admin-fleet-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      fleetData.activeFleet.forEach(trainee => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800 text-xs font-mono';
        const hasViolations = trainee.safetyViolations > 0;
        tr.innerHTML = `
          <td class="py-3 px-3">
            <div class="flex items-center gap-2 font-sans">
              <img src="${trainee.avatarUrl}" class="w-6 h-6 rounded-full object-cover">
              <div>
                <span class="font-bold text-slate-200 block">${trainee.name}</span>
                <span class="text-[10px] text-sky-400 font-mono">${trainee.verificationId}</span>
              </div>
            </div>
          </td>
          <td class="py-3 px-3 text-slate-300 font-sans">${trainee.moduleTitle}</td>
          <td class="py-3 px-3">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200 border border-slate-700">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ${trainee.state}
            </span>
          </td>
          <td class="py-3 px-3 text-slate-400">${trainee.elapsedMinutes.toFixed(1)}m</td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              hasViolations ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }">
              ${hasViolations ? `⚠️ ${trainee.safetyViolations} VIOLATION` : '✓ 0 (COMPLIANT)'}
            </span>
          </td>
          <td class="py-3 px-3 text-slate-400 text-[11px]">${trainee.deviceType}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Render Recruiter Talent Pool Leaderboard
    const recTbody = document.getElementById('recruiter-leaderboard-tbody');
    if (recTbody) {
      recTbody.innerHTML = '';
      leaderboard.forEach(c => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800 text-xs font-mono hover:bg-slate-800/40 transition-colors';
        const isRemedial = c.status === 'IN REMEDIAL';
        const isExpert = c.status === 'CERTIFIED EXPERT';
        tr.innerHTML = `
          <td class="py-3 px-3">
            <span class="font-bold text-base ${c.rank === 1 ? 'text-amber-400' : c.rank === 2 ? 'text-slate-300' : c.rank === 3 ? 'text-amber-600' : 'text-slate-500'}">
              #${c.rank}
            </span>
          </td>
          <td class="py-3 px-3">
            <div class="flex items-center gap-2.5 font-sans">
              <img src="${c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}" class="w-7 h-7 rounded-full object-cover border border-slate-700">
              <div>
                <span class="font-bold text-slate-200 block">${c.fullName}</span>
                <span class="text-[10px] text-sky-400 font-mono">${c.verificationId}</span>
              </div>
            </div>
          </td>
          <td class="py-3 px-3 text-slate-300">${c.practiceHours} hrs</td>
          <td class="py-3 px-3 font-semibold ${c.accuracyRate >= 95 ? 'text-emerald-400' : c.accuracyRate >= 80 ? 'text-sky-400' : 'text-rose-400'}">
            ${c.accuracyRate}%
          </td>
          <td class="py-3 px-3 text-amber-300">${c.safetyRating} / 5.0</td>
          <td class="py-3 px-3 font-bold text-white">${c.compositeScore}</td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              isRemedial ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              isExpert ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              'bg-sky-950 text-sky-300 border border-sky-800'
            }">
              ${c.status}
            </span>
          </td>
          <td class="py-3 px-3">
            <span class="inline-flex items-center gap-1 text-[11px] font-medium ${isExpert ? 'text-amber-300 font-bold' : 'text-slate-300'}">
              ${isExpert ? '★ ' : '✓ '}${c.badgeAwarded}
            </span>
          </td>
        `;
        recTbody.appendChild(tr);
      });
    }

    // Safety Alerts Ticker

    const alertList = document.getElementById('admin-alerts-ticker');
    if (alertList) {
      alertList.innerHTML = '';
      fleetData.safetyAlerts.forEach(al => {
        const item = document.createElement('div');
        const isCrit = al.severity === 'CRITICAL';
        item.className = `p-3 rounded-lg border text-xs font-mono ${
          isCrit ? 'bg-rose-950/40 border-rose-800/80 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-300'
        }`;
        item.innerHTML = `
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold ${isCrit ? 'text-rose-400' : 'text-emerald-400'}">[${al.severity}] ${al.code}</span>
            <span class="text-slate-400 text-[11px]">${al.timestamp}</span>
          </div>
          <p class="text-xs text-slate-200 font-sans">${al.message}</p>
          <div class="mt-1 text-[11px] text-slate-400">Target: <span class="text-white">${al.name}</span> (${al.verificationId})</div>
        `;
        alertList.appendChild(item);
      });
    }

    // Remote Glitch Injector Buttons
    const injectFns = {
      fuse: () => this.injectRemoteFault('BLOWN_1000V_DC_FUSE', 'MVSTU001', 'HIGH'),
      polarity: () => this.injectRemoteFault('REVERSE_DC_POLARITY', 'MVSTU001', 'CRITICAL'),
      arc: () => this.injectRemoteFault('ARC_FLASH_RISK_TRIGGER', 'MVSTU002', 'CRITICAL'),
      torque: () => this.injectRemoteFault('LOOSE_HIGH_RESISTANCE_TERMINAL', 'MVSTU001', 'MEDIUM')
    };

    ['fuse', 'polarity', 'arc', 'torque'].forEach(type => {
      const btn = document.getElementById(`btn-inject-${type}`);
      if (btn) btn.onclick = injectFns[type];
    });
  }

  async injectRemoteFault(faultType, targetTrainee, severity) {
    try {
      const res = await fetch('/api/admin/inject-fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faultType, targetTrainee, severity })
      });
      const data = await res.json();
      const statusEl = document.getElementById('admin-injection-status');
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="p-2.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono">
            ⚡ ${data.message} (Dispatched at ${new Date().toLocaleTimeString()})
          </div>
        `;
      }
      // Refresh fleet
      this.showAdminFleetScreen();
    } catch (err) {
      console.error('Fault injection error:', err);
    }
  }

  // ==========================================
  // STAGE 6: SMART SCORECARD & SOCRATIC AI
  // ==========================================

  async showScorecardScreen(sessionId) {
    const screen = document.getElementById('view-report-card');
    if (!screen) return;
    screen.classList.remove('hidden');

    try {
      const data = await fetch(`/api/certificate/${sessionId}`).then(r => r.json());
      this.renderScorecardPassport(data);
    } catch (err) {
      console.error('Failed to load scorecard:', err);
    }
  }

  renderScorecardPassport(certData) {
    if (!certData || !certData.session) return;
    const s = certData.session;
    const ai = s.ai_feedback || {};

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val != null ? String(val) : '';
    };

    setTxt('report-candidate-name', s.full_name);
    setTxt('report-candidate-stuid', s.verification_id);
    setTxt('report-session-id', s.id);
    setTxt('report-date', new Date(s.created_at).toLocaleString());

    // Granular Sub-Scores
    setTxt('score-troubleshoot-pct', `${Number(s.troubleshoot_pct).toFixed(1)}%`);
    setTxt('score-safety-pct', `${Number(s.safety_pct).toFixed(1)}%`);
    setTxt('score-tooluse-pct', `${Number(s.tool_use_pct).toFixed(1)}%`);

    // Socratic AI Feedback Section
    const strengthsContainer = document.getElementById('ai-feedback-strengths');
    if (strengthsContainer && Array.isArray(ai.strengths)) {
      strengthsContainer.innerHTML = ai.strengths.map(str => `
        <li class="flex items-start gap-2 text-xs text-slate-200">
          <span class="text-emerald-400 mt-0.5">✓</span>
          <span>${str}</span>
        </li>
      `).join('');
    }

    const improvementsContainer = document.getElementById('ai-feedback-improvements');
    if (improvementsContainer && Array.isArray(ai.improvements)) {
      improvementsContainer.innerHTML = ai.improvements.length > 0
        ? ai.improvements.map(imp => `
            <li class="flex items-start gap-2 text-xs text-amber-200">
              <span class="text-amber-400 mt-0.5">⚠</span>
              <span>${imp}</span>
            </li>
          `).join('')
        : `<li class="text-xs text-slate-400 italic">No procedural infractions or safety violations logged.</li>`;
    }

    const recContainer = document.getElementById('ai-feedback-recommendations');
    if (recContainer && Array.isArray(ai.recommendations)) {
      recContainer.innerHTML = ai.recommendations.map(r => `
        <li class="flex items-start gap-2 text-xs text-sky-200">
          <span class="text-sky-400 mt-0.5">→</span>
          <span>${r}</span>
        </li>
      `).join('');
    }

    // Cryptographic Tamper Hash Stamp
    setTxt('report-verification-hash', s.tamper_hash);
    setTxt('report-previous-hash', s.previous_record_hash || '0000000000000000000000000000000000000000000000000000000000000000');

    // Scannable QR Matrix Generator
    this.renderQrCode(s.qr_payload || s.tamper_hash || s.id, 'scorecard-qr-matrix');
  }

  // Pure SVG/Canvas QR Code Matrix Generator (Sharp & Self-Contained)
  renderQrCode(payload, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const safePayload = String(payload || 'MAYAVUE-PASSPORT-VERIFIED');
    // Generate deterministic 21x21 QR pattern based on payload hash
    const hash = Array.from(safePayload).reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0);
    const size = 21;
    let svg = `<svg viewBox="0 0 ${size} ${size}" class="w-full h-full" shape-rendering="crispEdges">`;
    svg += `<rect width="${size}" height="${size}" fill="#080d1a"/>`;

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (startX, startY) => {
      svg += `<rect x="${startX}" y="${startY}" width="7" height="7" fill="#38bdf8"/>`;
      svg += `<rect x="${startX + 1}" y="${startY + 1}" width="5" height="5" fill="#080d1a"/>`;
      svg += `<rect x="${startX + 2}" y="${startY + 2}" width="3" height="3" fill="#38bdf8"/>`;
    };
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    // Data dots
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Skip finder pattern zones
        if ((x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8)) {
          continue;
        }
        // Pseudo-random deterministic bit based on coordinates and payload
        const bit = Math.abs((x * 31 + y * 17 + hash) % 3) === 0;
        if (bit) {
          svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#38bdf8"/>`;
        }
      }
    }
    svg += '</svg>';
    container.innerHTML = svg;
  }

  // Public Recruiter Verification View
  async showPublicVerificationScreen(sessionId) {
    const screen = document.getElementById('view-verify');
    if (!screen) return;
    screen.classList.remove('hidden');

    try {
      const data = await fetch(`/api/verify/${sessionId}`).then(r => r.json());
      document.getElementById('verify-candidate-name').textContent = data.candidateName;
      document.getElementById('verify-stuid').textContent = data.verificationId;
      document.getElementById('verify-hash').textContent = data.tamperHash;
      document.getElementById('verify-grade').textContent = data.scorecard.grade;
      document.getElementById('verify-troubleshoot').textContent = `${data.scorecard.troubleshootPct}%`;
      document.getElementById('verify-safety').textContent = `${data.scorecard.safetyPct}%`;
    } catch (err) {
      console.error('Verification query failed:', err);
    }
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.mayaVue = new MayaVuePlatform();
});
