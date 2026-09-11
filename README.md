# JARVIS // WebXR Substation Safe Isolation & Battery Training Prototype

A single-file, production-ready **WebXR** interactive training simulator built with **Three.js (r168)**, HTML5, and CSS. Inspired by Tony Stark's Jarvis interface and modern software design (Linear style: pure charcoal dark mode, crisp cyan vector lines, frosted glass HUD cards).

The prototype runs seamlessly on desktop browsers (via OrbitControls, mouse dragging, WASD keyboard navigation, and voice commands) and in full immersive 6-DoF VR mode inside VR headset browsers (Meta Quest Browser, Pico Browser, Apple Vision Pro, or Chrome WebXR Emulator).

---

## Features & Architectural Highlights

| Module / Layer | Implementation | Prototype Role |
| :--- | :--- | :--- |
| **Real-Life PBR & Textures** | Three.js PBR Shaders + Canvas Procedural Decals | Authentic industrial finishes: Fluke-style safety yellow DMM with NIST cert decals, Milwaukee crimson toolbox with rubber armor, RAL 7035 powder-coated combiner box, server rack with ventilation hex mesh, and 45° yellow/black OSHA hazard floor perimeter. |
| **Safety & PPE Station** | Procedural 3D Wall Station (`#fire_extinguisher`, `#eyewash_station`, `#ppe_station`) | Wall-mounted Class C CO2 fire extinguisher with pressure gauge and certification tag, emergency aerated eyewash station, and electrician PPE hooks with 1000V insulating rubber gloves and hard hat. Interactive with Jarvis voice inspection. |
| **Workbench Pegboard & Tools** | Perforated steel board + VDE 1000V insulated hand tools | Perforated pegboard mounted behind workbench with VDE certified dual-color red/yellow lineman pliers, insulated screwdrivers, and non-contact voltage detector pen. |
| **Overhead Instruments & Shelf** | Unistrut overhead shelf + Benchtop Power Analyzer | Suspended instrument rack with digital storage oscilloscope showing real-time animated voltage waveforms, harmonics, and bus telemetry. |
| **Industrial Troffer Lighting** | Suspended dual-tube fluorescent troffers | Overhead fixtures with glowing diffusers providing realistic cool-white (4500K) illumination alongside natural sunlight streaming through the skylight. |
| **Rooftop Solar PV Array** | 6 Monocrystalline PV Modules + Weatherproof Junction Box + Orange Conduits | Procedural tilted solar panels (25°) above a glass skylight ceiling; provides open-circuit voltage ($V_{oc} = 480.0\text{V DC}$) under $880\text{ W/m}^2$ solar irradiance into the combiner box. |
| **Voice & Mic Engine** | Web Speech API (`SpeechRecognition`) + `getUserMedia` | Real-time hands-free speech recognition; mic audio stream drives holographic waveforms dynamically. Includes voice inquiries for safety gear and equipment diagnostics. |
| **Render Engine** | Three.js (r168) + WebXR Device API | Instant execution via standard URL without heavyweight game engine binaries. |
| **Diegetic 3D HUD** | Canvas-backed 3D texture (`THREE.CanvasTexture`) | In-world floating HUD (1.25m high) with live telemetry, voice transcripts, and animated audio waveform. |
| **Multilingual Voice & HUD** | Web Speech API (`hi-IN` / `en-US`) + Dynamic DOM Localization | One-click language switch between English and Hindi (`EN | हिंदी`). When opted, Jarvis speaks authentic Hindi voice guidance, understands Hindi voice commands ("जार्विस गेट खोलो", "स्विच बंद करो", "वोल्टेज चेक करो", etc.), and updates Task Guide & HUD controls in real time. |
| **Logic & State Engine** | JavaScript FSM (State Pattern) | Enforces strict 6-step OSHA LOTO & equipment service procedure with bilingual audio debriefs. |
| **Hologram Shaders** | `THREE.AdditiveBlending` + procedural wireframes | Glowing cyan pulsing "Ghost Guides" showing exact target orientation for hands and tools. |
| **Audio & Speech** | Web Audio API + Web Speech API (`speechSynthesis`) | Socratic Jarvis mentor voice prompts in English and Hindi, dynamic reactive waveform, and procedural SFX (hydraulics, clicks, relays, arc buzz, battery docking, camera swoosh, solar telemetry chime). |

---

## Multilingual Support: English & हिंदी (Hindi Option)

The simulator includes a native **Hindi (हिंदी)** mode for all audio instructions, voice recognition, and HUD interface elements:

1. **How to Toggle**:
   - Click the **`EN | हिंदी`** toggle in the top Jarvis card.
   - Click the **`🌐 EN / हिंदी`** button in the bottom action bar.
   - Press **`L`** on your keyboard anytime.
   - Speak naturally: *"Jarvis, speak in Hindi"* or *"जार्विस, हिंदी में बोलो"*.

2. **Full Hindi Experience**:
   - **Jarvis Spoken Directives**: Synthesized using high-definition Hindi neural/speech synthesis voices (`hi-IN`) across all 6 training steps, safety warnings, equipment inspections, and the final Report Card audit.
   - **Hindi Voice Recognition**: Microphone listens for both Devanagari script and transliterated Hindi/Hinglish commands.
   - **Bilingual Task Guide HUD**: Task step tags (`चरण 1 / 6`), step titles (`मुख्य गेट खोलें`, `सुरक्षित अलगाव`), instructions, and progress pills (`1. मुख्य गेट`, `2. सुरक्षित अलगाव`, etc.) dynamically update into Hindi.
   - **Bilingual Action Controls**: Bottom action buttons update to `टास्क गाइड`, `रूफटॉप सोलर`, `जार्विस से बोलें`, `जार्विस दोहराएं`, `चरण निष्पादित करें`, and `रीसेट`.

---

## Voice Commands for Jarvis (Microphone Control)

Click the **"TALK TO JARVIS"** button on the HUD or press **`M`** (or squeeze the controller grip in VR) to activate voice listening:

| Voice Command (English) | Voice Command (हिंदी) | Action Executed by Jarvis |
| :--- | :--- | :--- |
| **"Jarvis, open the gate"** / *"enter"* | **"जार्विस गेट खोलो"** / *"दरवाजा खोलो"* | Unlocks security blast door, slides gates open, and walks into the lab. |
| **"Jarvis, check solar panels"** | **"जार्विस सोलर पैनल चेक करो"** / *"छत का वोल्टेज"* | Transitions camera up to the rooftop solar array and reads live $V_{oc}$ ($480.0\text{V}$) and irradiance. |
| **"Jarvis, isolate circuit"** / *"turn off switch"* | **"जार्विस स्विच बंद करो"** / *"ढक्कन खोलो"* | Swings open combiner box lid and rotates DC isolator to 0V. |
| **"Jarvis, verify voltage"** / *"probe terminals"* | **"जार्विस वोल्टेज चेक करो"** / *"प्रोब लगाओ"* | Deploys multimeter probes to verify 0.00V potential. |
| **"Jarvis, replace fuse"** / *"fix circuit"* | **"जार्विस फ्यूज बदलो"** / *"सर्किट ठीक करो"* | Extracts blown cartridge fuse and inserts fresh replacement fuse. |
| **"Jarvis, open toolbox"** / *"get tools"* | **"जार्विस टूलबॉक्स खोलो"** / *"टूल बॉक्स"* | Unlatches and opens the industrial tool box on the workbench. |
| **"Jarvis, install battery"** / *"mount battery"* | **"जार्विस बैटरी लगाओ"** / *"बैटरी पैक"* | Mounts 48V Lithium Battery Pack into Energy Storage Rack bay. |
| **"Jarvis, speak in Hindi"** / *"Hindi mode"* | **"जार्विस हिंदी में बात करो"** / *"हिंदी मोड"* | Switches language mode to Hindi with spoken confirmation. |
| **"Jarvis, speak in English"** | **"जार्विस अंग्रेजी में बोलो"** / *"इंग्लिश मोड"* | Switches language mode back to English. |
| **"Jarvis, workbench view"** / *"return to lab"* | **"जार्विस लैब में वापस जाओ"** / *"वर्कबेंच दृश्य"* | Smoothly glides camera back down from the roof to the workbench. |
| **"Jarvis, hide guide"** / *"show guide"* | **"जार्विस गाइड छुपाओ"** / *"गाइड दिखाओ"* | Hides or shows the floating task guide window to clear the line of sight. |
| **"Jarvis, check fire extinguisher"** | **"जार्विस अग्निशामक चेक करो"** | Jarvis inspects the Class C CO2 extinguisher and pressure gauge. |
| **"Jarvis, check eyewash"** | **"जार्विस आईवॉश स्टेशन"** | Jarvis verifies the emergency eyewash station nozzles and flow rate. |
| **"Jarvis, check PPE"** / *"gloves"* | **"जार्विस सुरक्षा दस्ताने"** / *"पीपीई किट"* | Jarvis reports readiness of Class 0 1000V insulating rubber gloves and helmet. |
| **"Jarvis, check tools"** / *"pliers"* | **"जार्विस इंसुलेटेड टूल्स"** / *"औजार"* | Jarvis audits the 1000V VDE insulated hand tool set on the pegboard. |
| **"Jarvis, check oscilloscope"** | **"जार्विस ऑसिलोस्कोप"** / *"पावर विश्लेषक"* | Jarvis reports digital power analyzer telemetry and DC bus ripple. |
| **"Jarvis, show report card"** | **"जार्विस रिपोर्ट कार्ड दिखाओ"** | Opens the training audit report card modal. |
| **"Jarvis, repeat instructions"** | **"जार्विस दोहराएं"** / *"फिर से बोलो"* | Jarvis speaks current step instructions aloud. |
| **"Jarvis, reset"** / *"restart"* | **"जार्विस रीसेट करो"** / *"दोबारा शुरू करो"* | Restores simulation to the beginning outside the main gate. |

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
   - *Automated Audit Trigger*: Automatically triggers the comprehensive **Training Performance Report Card & Audit** modal with spoken debrief by Jarvis.

---

## Training Performance Report Card & Audit System

Upon completing the procedure (or anytime via the **"REPORT CARD"** HUD button, clicking the 3D rotating completion hologram, or saying *"Jarvis, show report card"*), an industrial-grade performance audit certificate is presented:

### 1. Accuracy & Rating
- **Operational Accuracy**: Dynamically calculated percentage score ($100\% - \sum \text{penalties}$, minimum $0\%$).
- **Certification Letter Grade**:
  - **Grade S ($95\text{--}100\%$ flawless)**: `MASTER ELECTRICIAN // FLAWLESS COMPLIANCE` (5 Stars ★★★★★).
  - **Grade A ($85\text{--}94\%$)**: `SENIOR TECHNICIAN // PROFICIENT` (4.5 Stars ★★★★☆).
  - **Grade B ($70\text{--}84\%$)**: `FIELD APPRENTICE // SATISFACTORY` (3 Stars ★★★☆☆).
  - **Grade C ($50\text{--}69\%$)**: `JUNIOR OPERATOR // MARGINAL PASS` (2 Stars ★★☆☆☆).
  - **Grade D ($<50\%$)**: `CRITICAL BREACH // HAZARDOUS` (1 Star ★☆☆☆☆).
- **Safety Designation**: Class 0 ($1000\text{V}$) Certified, Class 1 ($7500\text{V}$) Supervised, or Unqualified.

### 2. Incident & Error Log
Detailed log tracking every safety infraction and sequence breach with exact timestamps and penalties:
- **Arc Flash Hazard ($-25\%$)**: Multimeter probes touched energized $480\text{V DC}$ terminals prior to Lockout/Tagout isolation.
- **Energized Fuse Extraction ($-25\%$)**: Attempted physical fuse cartridge manipulation while $480\text{V}$ bus potential was active.
- **Unverified Voltage Contact ($-15\%$)**: Attempted fuse servicing prior to 3-point multimeter $0.00\text{V}$ verification.
- **Premature Battery Mounting ($-15\text{--}20\%$)**: Attempted battery pack docking before upstream isolation or before retrieving insulated tools from the toolbox.
- **Unauthorized Perimeter Access ($-10\%$)**: Attempted internal equipment operation prior to security keypad verification and blast gate clearance.
- **Zero-Error Perfect Run**: Certified checkmark card: *"ZERO SAFETY INFRACTIONS LOGGED - PERFECT OSHA 1910.303 & NFPA 70E COMPLIANCE"*.

### 3. Time Taken & Pacing Benchmark
- **Elapsed Time Tracking**: Recorded in `MM:SS` format.
- **Benchmark Evaluation**: Compares total duration against the NFPA 70E standard baseline ($02:15$ / $135\text{s}$).
- **Pacing Differential**: Automatically computes and badges pace (e.g. `Target: 02:15 (-30s Faster)` or `Target: 02:15 (+15s Methodical)`).

### 4. Context-Tailored Actionable Improvements
The system dynamically analyzes the user's specific errors and injects customized recommendations:
- **LOTO First Principle**: Highlights $480\text{V DC}$ switch isolation before probe placement.
- **De-energized Work Standard**: Explains NFPA 70E live bus rules and contact shock hazards.
- **3-Point Multimeter Verification**: Emphasizes testing known live source, test circuit, re-test known source.
- **Tooling & PPE Staging**: Staging VDE-insulated $1000\text{V}$ torque drivers from the toolbox prior to heavy battery mounting.
- **Spatial Pacing**: Suggestions to streamline workbench transit if elapsed time exceeds 3 minutes.
- **Excellence Recommendations**: Dielectric glove air-testing and digital power analyzer harmonic telemetry monitoring for perfect runs.

### 5. Interactive Controls & Print / PDF Export
- **PRINT REPORT Button**: Formats the report card using custom `@media print` CSS for clean high-resolution printing or PDF export as an official training certificate.
- **EXPLORE 3D SCENE Button**: Dismisses the modal to allow free-roam inspection of the facility and components in 3D / VR.
- **PRACTICE AGAIN Button**: Fully resets the facility, timers, and telemetry for another training attempt.
- **Persistent Bottom Deck Button ("REPORT CARD")**: Re-opens the report card audit at any time.
- **Interactive 3D Hologram Badge**: Clicking the rotating green emblem in the center of the workbench re-opens the report.
- **Spoken Audio Debrief**: Jarvis announces the full grade, accuracy, time taken, and error count over the synthesized audio channel.

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

### Mobile (Phone & Touchscreen) Mode
- **85%+ Clear 3D Viewport**: Clutter-free design specifically engineered for mobile screens ($360\text{px}\text{--}430\text{px}$).
- **Ultra-Slim Top Bar**: Mini brand badge (`JARV MARK VII`), active language toggle (`[EN | हिंदी]`), and high-priority telemetry (`ELAPSED`, `BUS VOLTAGE`, `SAFETY SCORE`).
- **Collapsible Smart Task Pill**: Defaults to a compact 32px top pill (`TASK GUIDE // STEP 1/6: ... ℹ ✕`). Tap the pill or `ℹ` icon to expand detailed instructions; tap again or `✕` to collapse.
- **Single-Row Bottom Action Dock**: Glassmorphic floating dock with touch-optimized buttons (`[📋 Guide]`, `[☀️ Roof]`, `[🎤 TALK]`, `[🔊 Repeat]`, `[⚡ ACTION]`, `[🔄 Reset]`).
- **Tap vs. Drag Discrimination**: Intelligent pointer delta detection ensures 1-finger camera orbiting never triggers electrical equipment or arc flash violations accidentally.
- **Hidden Keyboard Legends**: Automatically removes desktop-specific instructions ("Press M", "WASD to Walk") on mobile touch devices.

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
