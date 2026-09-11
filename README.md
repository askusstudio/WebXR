# JARVIS // WebXR Substation Safe Isolation & Battery Training Prototype

A single-file, production-ready **WebXR** interactive training simulator built with **Three.js (r168)**, HTML5, and CSS. Inspired by Tony Stark's Jarvis interface and modern software design (Linear style: pure charcoal dark mode, crisp cyan vector lines, frosted glass HUD cards).

The prototype runs seamlessly on desktop browsers (via OrbitControls, mouse dragging, WASD keyboard navigation, and voice commands) and in full immersive 6-DoF VR mode inside VR headset browsers (Meta Quest Browser, Pico Browser, Apple Vision Pro, or Chrome WebXR Emulator).

---

## Features & Architectural Highlights

| Module / Layer | Implementation | Prototype Role |
| :--- | :--- | :--- |
| **Rooftop Solar PV Array** | 6 Monocrystalline PV Modules + Weatherproof Junction Box + Orange High-Voltage Conduits | Procedural tilted solar panels (25°) above a glass skylight ceiling; provides open-circuit voltage ($V_{oc} = 480.0\text{V DC}$) under $880\text{ W/m}^2$ solar irradiance into the combiner box. |
| **Voice & Mic Engine** | Web Speech API (`SpeechRecognition`) + `getUserMedia` | Real-time hands-free speech recognition; mic audio stream drives holographic waveforms dynamically. |
| **Render Engine** | Three.js (r168) + WebXR Device API | Instant execution via standard URL without heavyweight game engine binaries. |
| **Diegetic 3D HUD** | Canvas-backed 3D texture (`THREE.CanvasTexture`) | In-world floating HUD (1.25m high) with live telemetry, voice transcripts, and animated audio waveform. |
| **Logic & State Engine** | JavaScript FSM (State Pattern) | Enforces strict 6-step OSHA LOTO & equipment service procedure. |
| **Hologram Shaders** | `THREE.AdditiveBlending` + procedural wireframes | Glowing cyan pulsing "Ghost Guides" showing exact target orientation for hands and tools. |
| **Audio & Speech** | Web Audio API + Web Speech API (`speechSynthesis`) | Socratic Jarvis mentor voice prompts, dynamic reactive waveform, and procedural SFX (hydraulics, clicks, relays, arc buzz, battery docking, camera swoosh, solar telemetry chime). |

---

## Voice Commands for Jarvis (Microphone Control)

Click the **"TALK TO JARVIS"** button on the HUD or press **`M`** (or squeeze the controller grip in VR) to activate voice listening:

| Voice Command | Action Executed by Jarvis |
| :--- | :--- |
| **"Jarvis, open the gate"** / *"open door"* / *"enter"* | Unlocks security blast door, slides gates open, and walks into the lab. |
| **"Jarvis, check solar panels"** / *"check roof voltage"* / *"inspect solar"* | Transitions camera up to the rooftop solar array and reads live open-circuit voltage ($480.0\text{V}$) and irradiance. |
| **"Jarvis, isolate circuit"** / *"turn off switch"* / *"open lid"* | Swings open combiner box lid and rotates DC isolator to 0V. |
| **"Jarvis, verify voltage"** / *"probe terminals"* / *"test voltage"* | Deploys multimeter probes to verify 0.00V potential. |
| **"Jarvis, replace fuse"** / *"fix circuit"* / *"correct circuit"* | Extracts blown cartridge fuse and inserts fresh replacement fuse. |
| **"Jarvis, open toolbox"** / *"open tool chest"* / *"get tools"* | Unlatches and opens the industrial tool box on the workbench. |
| **"Jarvis, install battery"** / *"mount battery"* / *"dock battery"* | Mounts 48V Lithium Battery Pack into Energy Storage Rack bay. |
| **"Jarvis, workbench view"** / *"return to lab"* / *"go back down"* | Smoothly glides camera back down from the roof to the workbench. |
| **"Jarvis, hide guide"** / *"close guide"* / *"show guide"* | Hides or shows the floating task guide window to clear the execution line of sight. |
| **"Jarvis, status report"** / *"telemetry"* | Jarvis speaks live status (current step, bus voltage, solar array Voc, safety score). |
| **"Jarvis, repeat instructions"** | Jarvis speaks current step instructions aloud. |
| **"Jarvis, reset"** / *"restart"* | Restores simulation to the beginning outside the main gate. |

---

## 6-Step Training Progression (FSM)

1. **Step 1: Open Main Gate & Enter Room**
   - *Objective*: Access the security keypad or speak *"Jarvis, open the gate"* to unlock the facility.
   - *Validation*: Gate doors slide open with hydraulic sound; camera glides through the entrance into the room up to the workbench.
   - *Feedback*: Hydraulic whoosh SFX, chime, Step 1 pill turns green, Jarvis introduces Step 2.

2. **Step 2: Lockout / Safe Isolation (LOTO)**
   - *Objective*: Open combiner box lid and rotate the DC Isolator Switch from "ON (480V)" to "OFF (0V)".
   - *Validation*: Knob rotates 90° clockwise; `circuitEnergized = false`.
   - *Feedback*: Heavy relay clunk SFX, status LED changes from red to green, voltage drops to 0.00V.

3. **Step 3: Voltage Verification (Probing)**
   - *Objective*: Pick up Multimeter probes and touch the red (+) and black (-) terminal contacts.
   - *Safety Interlock*: If touched before Step 2, triggers an **electric arc buzz SFX**, an **amber screen flash**, safety score deduction (-25%), and a Jarvis voice warning: *"Warning: Circuit is still energized at 480 volts! Turn the isolation switch first."*
   - *Validation*: Probes contact terminals while de-energized.
   - *Feedback*: Continuity beep, multimeter LCD stabilizes at `"0.00 V - SAFE TO TOUCH"`.

4. **Step 4: Correct the Circuit (Fuse Replacement)**
   - *Objective*: Pull the blown cartridge fuse from the DIN rail and seat the fresh replacement fuse.
   - *Validation*: Blown fuse extracted, healthy gold-capped cartridge inserted into the DIN holder.
   - *Feedback*: Mechanical snap clunk, circuit restored indicator turns green.

5. **Step 5: Access Industrial Tool Box**
   - *Objective*: Unlatch and open the heavy-duty tool chest on the workbench.
   - *Validation*: Tool box lid pivots open >90°, exposing the insulated torque tool and the new battery module.
   - *Feedback*: Metallic latch click + hinge opening sound.

6. **Step 6: Install New Battery Module**
   - *Objective*: Mount the new 48V Lithium Battery Pack into the Energy Storage Rack bay.
   - *Validation*: Battery module glides and locks into the rack slot; electrical terminals mate.
   - *Completion*: Heavy docking clunk, rack indicator turns bright green, rotating holographic completion badge appears with fanfare: *"Module Completed: System Safely Isolated and Re-energized"*.

---

## Controls

### Desktop Mode
- **Movable Task Guide**:
  - **Click & Drag** the title bar to move the guide window anywhere on screen so it never blocks the 3D execution point.
  - **Double-Click** the title bar to snap it back to the top-right default location.
  - **Minimize (`─`) Button**: Collapses the window into a sleek single-line header (`TASK GUIDE // STEP X/6`).
  - **Close (`✕`) Button** or **`H` Key**: Hides or restores the task guide window completely.
  - **"TASK GUIDE" Button**: Bottom deck button to toggle visibility.
- **Microphone**: Click **"TALK TO JARVIS"** or press **`M`** to toggle speech recognition.
- **Mouse Click & Drag**: Click or drag on the gate keypad/doors, box lid, rotary isolator switch, multimeter probes, fuse, tool box, or battery module.
- **Right Click & Drag**: Orbit / rotate the camera.
- **Scroll Wheel**: Zoom in / out.
- **WASD Keys**: Walk / pan the camera forward, backward, left, and right.
- **T or P Key**: Toggle Rooftop Solar PV Array viewpoint and inspect voltage.
- **R Key**: Reset camera to current task inspection position.
- **Spacebar**: Replay active Jarvis voice instructions.
- **"ROOFTOP ARRAY" Button**: Toggles camera between laboratory workbench and rooftop solar array.
- **"INTERACT STEP" Button**: On-screen helper button to automatically perform the active step.
- **"RESET" Button**: Restores the gate closed, camera back to entrance, tool box closed, battery in box, and combiner box back to initial state.

### WebXR (VR Headset) Mode
- **Enter VR**: Click the glowing cyan **"ENTER VR"** button at the bottom of the screen.
- **Laser Raycaster**: Each controller projects a cyan targeting beam.
- **Trigger Button**: Click to open gate, flip switches, and open latches.
- **Grip Button**: Squeeze to toggle microphone voice listening, or grab tools, probes, and batteries.
- **Haptics**: Automatic vibration pulse on compatible controllers upon interaction.

---

## How to Run

### Built-in Node Server
```bash
cd "C:\Users\anany\.gemini\antigravity\scratch\ironman-webxr-training"
node server.js
```
- Open `http://localhost:8080` in Chrome or Edge.
- For VR Headsets (Meta Quest / Pico), open the displayed Wi-Fi URL (e.g. `http://192.168.1.33:8080`).
