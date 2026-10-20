# Local ATC Radar — STARS & Approach Tower Scope

[![Theme](https://img.shields.io/badge/Theme-Phosphor%20Green%20%26%20Cyan-00ff66)](#-customizable-gui-themes--accent-colors)
[![Release](https://img.shields.io/badge/Release-v0.4.0-00e5ff)](https://github.com/)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Electron%20Windows%20x64-00e5ff)](#-running--packaging)
[![ADS-B Engine](https://img.shields.io/badge/ADS--B-Parallel%20Multi--Source%20Fusion-ffaa00)](#1-parallel-multi-source-ads-b-engine-zero-delay)
[![STCA](https://img.shields.io/badge/Safety-STCA%20%26%20Collision%20Alert-ff2244)](#2-short-term-conflict-alert-stca--proximity-engine)
[![Aero Info](https://img.shields.io/badge/Aeronautical-CTR%20%7C%20TMA%20%7C%20VOR%20%7C%20STARs-00e5ff)](#6-complete-aeronautical-database--isolated-stacking-panes)

A modular, authentic Air Traffic Control (ATC) Tower & Approach Radar Scope inspired by real-world **STARS (Standard Terminal Automation Replacement System)** and **Eurocontrol Mode S** terminal display systems. Built with **React 18**, **TypeScript**, **Leaflet**, **Tailwind CSS**, and an **Express / Node.js** live ADS-B aggregation proxy. Runs either as a lightweight web application or packaged as a standalone portable Windows desktop executable.

---

## ✈️ Key Features (v0.4.0)

### 1. Parallel Multi-Source ADS-B Engine (Zero Delay)
* **Real-Time Multi-Feed Aggregation:** Simultaneously queries and merges traffic in parallel across independent receiver networks:
  * **`opendata.adsb.fi`** (European & global open data)
  * **`api.adsb.lol`** (Independent volunteer community network)
  * **`OpenSky Network`** (High-coverage sensor network with dynamic bounding-box filtering)
* **Instant Takeoff & Low-Altitude Detection:** Eliminates coverage blindspots. Low-altitude general aviation, helicopters, and departing aircraft climbing through 500–10,000 ft (e.g. at LFBT / Tarbes-Lourdes) appear on the radar scope immediately upon departure, with zero multi-minute waiting delay.
* **Smart Deduplication & Field Fusion:** Tracks are unified by ICAO 24-bit hex address, merging the freshest GPS/barometric position, callsign, squawk, and airspeed.
* **Optional ADSBexchange Mode:** Toggle between `LIVE` free multi-source feed and dedicated `ADSBX` feed (RapidAPI key configurable in Settings).

---

### 2. Short Term Conflict Alert (STCA) & Proximity Engine
* **Predictive Collision Detection (ICAO / EUROCONTROL Standard):**
  * Evaluates pairwise horizontal and vertical separation in real time.
  * Extrapolates velocity vectors to calculate **Closest Point of Approach (CPA)** and estimated time to impact.
* **Dual Alert Severity Levels:**
  * **CAUTION (Amber):** Convergence detected (< 8 NM, < 1,500 ft, trajectory convergence < 2 min).
  * **WARNING / STCA (Flashing Red):** Loss of separation imminent (< 5 NM, < 1,000 ft).
* **Tactical Radar Representation:**
  * **1.25 Hz Digital Hardware Strobe:** Crisp square-wave flashing (`stca-warning-strobe`) on target blip, hazard reticle, and ATC data tag with zero rendering lag.
  * **Interconnecting Conflict Vector:** Dynamic dashed line linking conflicting aircraft.
  * **Midpoint Separation Badge:** Tactical badge showing real-time distance (NM) and vertical difference (FT).
  * **Bottom HUD Alert Banner:** Prominent conflict banner with an optional discrete audible ATC chime.
* **Manual Conflict Acknowledgment / Mute (`[✕]`):**
  * One-click dismissal button directly on the **Bottom Bar alert banner** or on the **Map Midpoint Badge** (`[✕]`).
  * Instantly silences the audio alarm, stops the visual flashing, and removes the alert for known controlled situations (such as formation flights or hovering rescue helicopters).

---

### 3. Tactical ATC Distance & Heading Ruler ("Règle NM")
* **Right-Click Direct Measurement:**
  * **First Right-Click:** Anchors Point A with a precision crosshair.
  * **Cursor Movement:** Draws a real-time cyan dashed measuring vector displaying:
    * Distance in Nautical Miles (**NM**)
    * Direct magnetic bearing / track (**CAP**)
    * Reciprocal heading (**Reciprocal**)
    * Estimated flight time at standard 250 kt approach speed.
  * **Second Click (Left or Right):** Locks the measurement on screen for ongoing reference.
  * **Clear Action:** Clear easily via **Escape**, the `[✕]` button on the tactical readout badge, or the bottom bar `[EFFACER]` action.

---

### 4. Radar Breadcrumbs & Phosphor History Trails
* **Authentic Phosphor Decay:** Visualizes recent aircraft positions with decaying pastilles recreating authentic CRT radar screen persistence.
* **Quick HUD Toggle:** Instantly switch history length from the bottom bar:
  * `OFF` / `1 MIN` / `3 MIN` / `TOUT`
* **Performance Throttling:** Optimized 15-second sampling buffer capped to lightweight SVG nodes maintaining solid 60 FPS under heavy traffic.
* **Full Trajectory Track:** Displays the complete session flight path for any currently selected aircraft.

---

### 5. Customizable Radar Data Tags & Smart Anti-Overlap
* **3 Declutter Levels:**
  * **Compact:** Callsign + Flight Level (`RYR19JN FL100`).
  * **Standard:** + Ground Speed (`330 kt`).
  * **Extended:** + Tail Registration, Aircraft Model, and Transponder Squawk (`SP-RKV B738 SQ:1000`).
* **Movable / Draggable Data Tags:** Click and drag any aircraft tag across the scope to eliminate visual clutter. The dynamic SVG leader line tracks the aircraft blip continuously. Double-click any tag to reset to its default offset.
* **Smart Anti-Overlap (Auto-Deconfliction):** Dynamically adjusts leader line orientation (quadrant placement) when aircraft are in close proximity.
* **High-Density Opaque Background:** Prevents underlying waypoints or runway labels from bleeding through active aircraft tags.

---

### 6. Complete Aeronautical Database & Isolated Stacking Panes
* **Strict Leaflet Stacking Architecture:** Solves layer superposition glitches using isolated Leaflet Panes:
  * `aeroPane` (`zIndex: 450`) : Static navigation infrastructure.
  * `routePane` (`zIndex: 520`) : Great-circle flight paths.
  * `userLocationPane` (`zIndex: 550`) : Local GPS / receiver station.
  * `aircraftPane` (`zIndex: 650`) : **Primary Air Traffic** (targets, tags, velocity vectors, trails). Traffic is **strictly guaranteed** to render above static waypoints.
  * `conflictPane` (`zIndex: 720`) : STCA vectors and separation badges.
  * `rulerPane` (`zIndex: 750`) : Interactive measurement ruler.
* **Controlled Airspaces (CTR / TMA / Restricted LF-R):** Precise geographic polygons with floor and ceiling limits (`SFC/2500 FT`, `2500 FT/FL115`, `4500 FT/FL145`).
* **Radio Navaids (VOR / DME / NDB):** Stations (`TLP`, `PAU`, `TBO`, `TOU`, `BT`, `PO`) with frequencies, elevations, and Morse code.
* **RNAV Fixes & STAR Procedures:** Waypoints and Standard Terminal Arrival Routes with altitude constraints (`EBKOS 2N`, `ARFOL 2N`, `BEBIX 2P`, `VASIS 1A`, `LOMRA 1A`).
* **Physical Runway Strips & Extended Centerlines:** True 45m runway polygons, 15 NM extended centerlines with 1 NM and 5 NM graduation ticks, and ILS localizer feathers.

---

### 7. ATC Event Log & Session Export (CSV / JSON)
* **Comprehensive Event History:** Timestamped logging of:
  * Transponder Emergency Squawks (**7700** Emergency, **7600** Radio Failure, **7500** Hijacking)
  * Short Term Conflict Alert (**STCA**) proximity events
* **Data Export:**
  * **CSV Export:** Structured export suitable for Microsoft Excel, LibreOffice, or data analysis.
  * **JSON Export:** Full session state export including timestamps, positions, speeds, altitudes, and aircraft types.
* **Muted Alerts Manager:** Overview of manually silenced conflict pairs with a 1-click `[RÉACTIVER LES ALERTES]` button.

---

### 8. Live Weather: METAR & TAF Integration
* Real-time METAR and TAF decoded forecasts for the active airport via AviationWeather.gov API.
* Real-time calculation of crosswind and headwind components relative to the selected runway end.
* Automatic QNH altimeter setting and Transition Level (TL) reference.

---

### 9. Customizable GUI Themes & Accent Colors
* **Two Distinct Operational Themes:**
  * **Modern Neon:** Glassmorphic translucent surfaces, subtle cyan glow, and rounded tactical badges.
  * **Classic Mechanical (Brut):** High-contrast squared borders, zero border-radius, pure black backgrounds, and CRT scanline styling.
* **Full Color Customization:** Customize Primary Green, Secondary Cyan, Amber Warning, and Muted accents independently for both themes, with a 1-click **Reset** and preset loader.

---

### 10. Tower Inspector & External Tracking Links
* **Direct 1-Click External Links:**
  * 🌐 **ADSBexchange Globe:** `globe.adsbexchange.com/?icao={hex}`
  * ✈️ **FlightAware:** `flightaware.com/live/flight/{flight}`
  * 📡 **Flightradar24:** `flightradar24.com/{flight}`
  * 📷 **Planespotters.net:** High-resolution photos of the active airframe registration.
* **Live Flight Route on Scope:** Dashed cyan/green great-circle route line connecting origin, current aircraft position, and destination airport with tactical ARR/DEP badges.

---

## 🏗️ Project Architecture

```
├── electron/
│   ├── icon.ico                       # Custom Windows application icon
│   ├── icon.png                       # High-res scope badge icon
│   └── main.cjs                       # Single-instance Electron desktop manager & in-process proxy boot
├── release/                           # Production builds
│   └── v0.4/
│       ├── Local-ATC-Radar-win-x64/   # Standalone portable directory
│       │   └── Local-ATC-Radar.exe    # Executable desktop application
│       └── Local-ATC-Radar-v0.4-Windows.zip # Packaged portable ZIP archive
├── server/
│   └── server.js                      # Multi-source parallel aggregator proxy (adsb.fi, adsb.lol, OpenSky)
├── src/
│   ├── components/
│   │   ├── hud/                       # ATC HUD & Tactical Modal Panels
│   │   │   ├── TopBar.tsx             # Airport switcher, runway selector, aero layers, theme selector
│   │   │   ├── BottomBar.tsx          # STCA alert banner [✕], Zulu clock, ruler readout, trail selector
│   │   │   ├── TrafficSidebar.tsx     # Filterable traffic list & comprehensive telemetry Inspector
│   │   │   ├── AlertLogModal.tsx      # Emergency event history & CSV/JSON export
│   │   │   ├── SettingsModal.tsx      # Theme color picker, STCA audio, rapidAPI, OpenAIP settings
│   │   │   ├── MetarWidget.tsx        # Decoded METAR & runway crosswind calculator
│   │   │   ├── TafWidget.tsx          # Aviation TAF aerodrome forecast
│   │   │   └── AltitudeFilterWidget.tsx # Dual-slider altitude bracket filter (SFC to FL600)
│   │   └── radar/                     # Geospatial Canvas & Tactical Radar Layers
│   │       ├── RadarScope.tsx         # Leaflet container & multi-layer Pane hierarchy (z-indexes)
│   │       ├── AircraftLayer.tsx      # Targets, speed vectors, draggable tags, 1.25 Hz STCA strobe
│   │       ├── ConflictAlertLayer.tsx # STCA predictive lines, midpoint badge & dismissal handler
│   │       ├── RulerLayer.tsx         # Right-click NM distance & heading measurement vector
│   │       ├── FlightRouteLayer.tsx   # Origin/destination great-circle flight trajectory
│   │       ├── AeronauticalLayer.tsx  # Airspaces (CTR/TMA), STARs, Navaids (VOR/DME/NDB), Fixes
│   │       ├── RunwayCorridor.tsx     # Physical runway polygons, extended centerlines, ILS localizer
│   │       ├── RangeRings.tsx         # 5 to 50 NM range rings & 30° azimuth degree labels
│   │       ├── TagDragHandler.tsx     # Mouse drag listener for repositioning ATC tags
│   │       └── RadarBackground.tsx    # Pure black canvas vs OSM Dark / OpenAIP chart underlay
│   ├── data/
│   │   ├── aeronautical/              # Navigation database (airspaces, navaids, waypoints, stars)
│   │   └── airports/                  # Airport presets (LFBT, LFBP, LFBO) and custom airport creator
│   ├── services/
│   │   ├── adsb/                      # Multi-feed client ingestion, processing & flight tracking
│   │   └── radar/
│   │       └── stcaService.ts         # Short Term Conflict Alert math & trajectory CPA projection
│   ├── store/                         # Zustand centralized reactive stores
│   │   ├── useAirportStore.ts
│   │   ├── useRadarSettingsStore.ts   # Layer toggles, custom colors, muted conflict IDs
│   │   ├── useTrafficStore.ts         # Active aircraft list & selection
│   │   ├── useAlertLogStore.ts        # Transponder & STCA event log
│   │   └── useRulerStore.ts           # Tactical ruler coordinates, distance, and bearing
│   ├── utils/
│   │   ├── aviationMath.ts            # Haversine, bearing, runway polygons, speed vectors
│   │   ├── audioAlert.ts              # Web Audio API discrete ATC warning chimes
│   │   ├── sessionExport.ts           # CSV and JSON session export engine
│   │   └── icaoCountry.ts             # ICAO 24-bit hex country & flag decoder
│   ├── App.tsx                        # Master 2-second ADS-B polling lifecycle & theme sync
│   └── index.css                      # Tailwind styling, custom scrollbars, and STCA strobe keyframes
├── package.json
└── vite.config.ts
```

---

## 🚀 Running & Packaging

### Prerequisites
* **Node.js** v18+ (tested on Node v20 LTS)
* **npm** v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start in Development Mode (Web Browser)
Starts both the backend aggregation server (`http://localhost:3001`) and the Vite development client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Start in Development Mode (Electron Desktop)
Runs the application inside the native Electron window with live hot-reloading:
```bash
npm run electron:dev
```

### 4. Build Production Web Bundle
```bash
npm run build
```
Outputs the minified, production-ready web application into `/dist`.

### 5. Package Standalone Windows Desktop App (`.exe` & `.zip`)
```bash
npm run pack
```
This automated packaging script performs:
1. Production TypeScript compilation and Vite bundling (`npm run build`).
2. Electron runtime binary copying with custom green radar icon embedding (`rcedit`).
3. Production dependency tree pruning.
4. Outputs the standalone portable folder and ZIP archive:
   * **Executable Folder:** `release/v0.4/Local-ATC-Radar-win-x64/Local-ATC-Radar.exe`
   * **Portable ZIP Archive:** `release/v0.4/Local-ATC-Radar-v0.4-Windows.zip`

---

## 🎮 Keyboard & Mouse Shortcuts

| Control | Action |
| :--- | :--- |
| **Right-Click** | Start / Move / Lock the **NM Distance Ruler** on the radar scope |
| **Escape** | Dismiss / clear the active ruler measurement |
| **Click & Drag Tag** | Move any aircraft ATC data tag to clear overlapping traffic |
| **Double-Click Tag** | Reset the tag position back to its default offset |
| **Left-Click on Aircraft** | Select aircraft and open the detailed Telemetry Inspector |
| **Click `[✕]` on Alert Banner** | Manually silence / acknowledge an active STCA conflict between two aircraft |
| **Click `[✕]` on Map Badge** | Mute the conflict directly from the tactical badge on the radar map |

---

## 📄 License
Private project for personal aviation simulation and air traffic monitoring. Built with open-source web technologies and community flight-tracking data feeds.
