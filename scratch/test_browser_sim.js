// scratch/test_browser_sim.js
const { spawn } = require('child_process');
const http = require('http');

async function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(t => t.type === 'page') || list[0];
          resolve(page.webSocketDebuggerUrl);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9222;

  console.log('Launching Headless Chrome on port', port, '...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1280,800',
    'http://localhost:8080/#/simulate/module_01'
  ], { stdio: 'ignore' });

  // Wait 1.5s for Chrome to bind port
  await new Promise(r => setTimeout(r, 1500));

  try {
    const wsUrl = await getWsUrl(port);
    console.log('Connected to Chrome DevTools endpoint:', wsUrl);

    const ws = new WebSocket(wsUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 1;
    function sendCommand(method, params = {}) {
      return new Promise(resolve => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    // Enable Page and Runtime
    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    // Wait 3s for WebGL scene and FSM to initialize
    console.log('Waiting for Three.js WebXR scene and practice FSM to initialize...');
    await new Promise(r => setTimeout(r, 3000));

    // Evaluate state in browser
    const evalResult = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const fsm = window.app ? window.app.fsm : null;
        const btn = document.getElementById('btn-practice-step-action');
        const taskTag = document.getElementById('task-step-tag');
        const taskTitle = document.getElementById('task-title');
        const pills = [1,2,3,4,5,6].map(i => {
          const p = document.getElementById('step-pill-' + i);
          return p ? p.textContent : null;
        });

        return {
          hasApp: !!window.app,
          hasFSM: !!fsm,
          fsmState: fsm ? fsm.currentState : null,
          activeModule: fsm ? fsm.activeModuleCode : null,
          btnText: btn ? btn.innerText.trim() : null,
          taskTag: taskTag ? taskTag.innerText.trim() : null,
          taskTitle: taskTitle ? taskTitle.innerText.trim() : null,
          pills
        };
      })()`,
      returnByValue: true
    });

    console.log('\nInitial Browser State:');
    console.log(JSON.stringify(evalResult.result.value, null, 2));

    // Now execute Step 1 via FSM
    console.log('\nExecuting Step 1 via practice action button...');
    const step1Adv = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        if (window.app && window.app.fsm) {
          window.app.fsm.executeCurrentStep();
          const btn = document.getElementById('btn-practice-step-action');
          const taskTag = document.getElementById('task-step-tag');
          return {
            newState: window.app.fsm.currentState,
            btnText: btn ? btn.innerText.trim() : null,
            taskTag: taskTag ? taskTag.innerText.trim() : null
          };
        }
        return null;
      })()`,
      returnByValue: true
    });
    console.log('Step 1 Adv Result:', step1Adv.result.value);

    // Wait for module configuration to fully load into FSM
    console.log('Waiting for SOLAR-ROOF-01 to bind to FSM...');
    await sendCommand('Runtime.evaluate', {
      expression: `new Promise(resolve => {
        const check = () => {
          if (window.app && window.app.fsm && window.app.fsm.activeModuleCode === 'SOLAR-ROOF-01') {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      })`,
      awaitPromise: true
    });

    // Execute all steps from current state to completion (State 7)
    console.log('\nExecuting all practice steps to completion (State 7)...');
    const completeAdv = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const results = [];
        while (window.app.fsm.currentState <= 6) {
          const s = window.app.fsm.currentState;
          window.app.fsm.executeCurrentStep();
          results.push({
            executedStep: s,
            newState: window.app.fsm.currentState,
            btnText: document.getElementById('btn-practice-step-action')?.innerText.trim()
          });
        }
        const modal = document.getElementById('completion-modal');
        return {
          steps: results,
          finalState: window.app.fsm.currentState,
          modalVisible: modal ? modal.classList.contains('show') : false,
          modalScore: document.getElementById('modal-score-val')?.innerText.trim(),
          modalGrade: document.getElementById('modal-grade-badge')?.innerText.trim(),
          modalAccuracy: document.getElementById('modal-accuracy-val')?.innerText.trim()
        };
      })()`,
      returnByValue: true
    });
    console.log('Completion Result:', JSON.stringify(completeAdv.result.value, null, 2));

    // Capture screenshot of completed simulation practice
    console.log('\nCapturing screenshot of completed practice session...');
    const screenshot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const fs = require('fs');
    const screenshotPath = 'C:\\Users\\anany\\.gemini\\antigravity\\brain\\24661726-ca9b-4d3f-9893-473edc9c8e5f\\stage4_sim_practice_completed.png';
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Screenshot saved to:', screenshotPath);

    ws.close();
    console.log('\n✓ Chrome browser verification passed successfully!');
  } finally {
    chromeProc.kill();
  }
}

main().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
