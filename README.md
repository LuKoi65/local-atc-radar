# ATC STARS & Approach Radar Simulator

A modular, authentic Air Traffic Control (ATC) Tower & Approach Radar Simulator styled after standard **STARS / Eurocontrol Mode S** terminal scopes. Built with React, TypeScript, Leaflet, Tailwind CSS, and a Node.js/Express ADS-B backend proxy. Designed to run as a web application or packaged as a native Windows desktop app via Electron.

![Scope Theme](https://img.shields.io/badge/Theme-Phosphor%20Green%20%26%20Cyan-00ff66)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Electron%20Windows-00e5ff)
![ADS-B](https://img.shields.io/badge/Format-readsb%20%2F%20ADSBexchange-ffaa00)
![Aero Info](https://img.shields.io/badge/Aeronautical-CTR%20%7C%20TMA%20%7C%20VOR%20%7C%20STARs-00e5ff)

---

## ✈️ Features

### 1. High-Legibility STARS Scope & Draggable Data Tags
- **Crisp Typography:** High-contrast `JetBrains Mono`, `Roboto Mono`, and `Inter` tabular font stack eliminating visual blur.
- **Movable / Draggable Aircraft Tags:** Click and drag any aircraft data tag on screen to deconflict overlapping traffic when aircraft fly close together. The dynamic SVG leader line stretches and tracks the aircraft target at all times. Double-click any tag to instantly reset its position.
- **Radar Scope Modes:** Pure black vector canvas or dim dark-matter geographical terrain underlay (no street labels).
- **Concentric Range Rings:** Rings at 5, 10, 15, 20, and 30 NM with azimuth degree ticks every 30° (`000°`, `030°`, `060°`, ..., `330°`).
- **Physical Runways & Approach Corridors:** Threshold coordinates, width (45m), 15 NM extended approach centerlines with 1 NM ticks and 5 NM graduation ticks, and 3.2° ILS localizer feathers.
- **Rotating Phosphor Sweep:** Authentic antenna sweep beam with decaying phosphor fade trail.

### 2. Complete Aeronautical Map Information
- **Controlled Airspaces:** Control Zones (CTR) and Terminal Control Areas (TMA) for Tarbes-Lourdes (Class D), Pau-Pyrénées (Class D), and military restricted low-altitude training corridors (LF-R 46) with floor/ceiling altitude limits (`SFC/2500 FT`, `2500 FT/FL115`, `4500 FT/FL145`).
- **Radio Navaids (VOR / DME / NDB):** VOR/DME and NDB stations (`TLP` 110.7, `PAU` 112.4, `TBO` 114.45, `TOU` 117.7, `BT` 388 kHz, `PO` 334 kHz) with Morse code identifiers, frequencies, and elevations.
- **RNAV Waypoints & Fixes:** Enroute and terminal fixes (`EBKOS`, `ARFOL`, `BEBIX`, `FOUCO`, `LURDO`, `OSQIL`, `VASIS`, `LOMRA`, etc.).
- **Standard Terminal Arrival Routes (STARs):** Arrival vectors with altitude constraints (`EBKOS 2N`, `ARFOL 2N`, `BEBIX 2P`, `VASIS 1A`, `LOMRA 1A`).
- **HUD Quick Toggles:** Instant top-bar toggles for `CTR`, `VOR`, `FIX`, and `STAR`.

### 3. ADSBexchange-style Sidebar (Traffic Table)
- **Collapsible Right Sidebar:** Full traffic table showing all tracked aircraft in the sector.
- **Country Identification:** Automatic ICAO 24-bit hex range decoder displaying country name and flag emoji (🇫🇷 France, 🇪🇸 Spain, 🇬🇧 UK, 🇩🇪 Germany, 🇺🇸 USA, 🇮🇪 Ireland, etc.).
- **Search & Filter:** Instant filter by callsign, tail registration, aircraft type, ICAO hex, or country.
- **Multi-parameter Sorting:** Sort by distance, altitude, ground speed, or callsign.

### 4. Comprehensive Tower Inspector & External Tracking Links
- **One-Click Tracking Links:**
  - 🌐 **ADSBexchange Globe:** Direct link to live 3D globe view (`globe.adsbexchange.com/?icao={hex}`)
  - ✈️ **FlightAware:** Live flight tracking, origin/destination airports, scheduled arrival times, and delays (`flightaware.com/live/flight/{flight}`)
  - 📡 **Flightradar24:** Live radar track (`flightradar24.com/{flight}`)
  - 📷 **Planespotters.net:** High-resolution photos of the specific airframe registration (`planespotters.net/search?q={reg}`)
- **Rich Telemetry:**
  - Full aircraft model and description (e.g. `Airbus A320-214`, `Boeing 737-8AS WL`)
  - Operator / Airline
  - Altitudes: Barometric, Geometric / GPS, Autopilot MCP Selected Altitude
  - Speeds: Ground Speed (GS), Indicated Airspeed (IAS), True Airspeed (TAS), Mach number (M)
  - Navigation: Track, Magnetic Heading, True Heading, Roll angle, Autopilot Modes (VNAV, LNAV, TCAS)
  - Transponder: Squawk code with emergency alerts (7700, 7600, 7500), RSSI signal strength, and message count
  - Approach Alignment: Distance to threshold, bearing from threshold, localizer angular error, and estimated time to touchdown (ETA).

### 5. Multi-Mode ADS-B Ingestion
1. **Live Free Feed (Default):** Keyless live feed polling `api.airplanes.live` / `api.adsb.lol` every 2s via local Express proxy.
2. **ADSBexchange API:** RapidAPI key and custom endpoint configuration via HUD Settings.
3. **Simulation / Demo Mode:** Built-in dynamic traffic generator simulating realistic approaching, base leg intercept, departing, GA training, and high-altitude overflights around the active airport.

---

## 🏗️ Project Structure

```
├── electron/
│   └── main.cjs                       # Windows Desktop App lifecycle (Electron)
├── server/
│   └── server.js                      # Express backend proxy (CORS, cache, live ADS-B API)
├── src/
│   ├── components/
│   │   ├── hud/                       # Tower HUD and Inspector controls
│   │   │   ├── TopBar.tsx             # Airport switcher, runway toggle, aero layers, sidebar toggle
│   │   │   ├── BottomBar.tsx          # Zulu clock, target count, cursor Lat/Lon, BRA tool
│   │   │   ├── TrafficSidebar.tsx     # ADSBexchange-style aircraft list & detailed Inspector
│   │   │   ├── CustomAirportModal.tsx # Form to define any custom ICAO, ARP, and runway
│   │   │   └── SettingsModal.tsx      # RapidAPI key & aeronautical layer options
│   │   └── radar/                     # Geospatial vector radar scope
│   │       ├── RadarScope.tsx         # Leaflet container and master scope layout
│   │       ├── RadarBackground.tsx    # Pure canvas vs Dim dark-matter terrain underlay
│   │       ├── RangeRings.tsx         # 5, 10, 15, 20, 30 NM rings with 30° azimuth ticks
│   │       ├── AeronauticalLayer.tsx  # Controlled airspaces, STARs, VORs, and RNAV waypoints
│   │       ├── RunwayCorridor.tsx     # Physical runway polygons, extended 15 NM centerlines, ILS feather
│   │       ├── AircraftLayer.tsx      # Crisp blips, 5-dot history trails, speed leaders, movable tags
│   │       ├── TagDragHandler.tsx     # Dynamic tag repositioning & leader line tracking
│   │       ├── RadarSweep.tsx         # Phosphor beam rotating sweep effect
│   │       └── MapEventsHandler.tsx   # Real-time cursor tracking and runway BRA calculations
│   ├── data/
│   │   ├── aeronautical/              # Navigation database
│   │   │   ├── airspaces.ts           # CTR, TMA, and Restricted LF-R boundaries
│   │   │   ├── navaids.ts             # VOR, DME, NDB stations with Morse code
│   │   │   ├── waypoints.ts           # RNAV fixes and terminal waypoints
│   │   │   └── stars.ts               # Standard Terminal Arrival Routes
│   │   └── airports/                  # Presets (LFBT, LFBP, LFBO) and types
│   │       ├── presets.ts
│   │       └── types.ts
│   ├── services/adsb/                 # ADS-B ingestion & traffic simulation
│   │   ├── adsbService.ts
│   │   ├── trafficGenerator.ts
│   │   └── types.ts
│   ├── store/                         # Zustand state management
│   │   ├── useAirportStore.ts
│   │   ├── useRadarSettingsStore.ts
│   │   ├── useTrafficStore.ts
│   │   └── useCursorStore.ts
│   ├── utils/
│   │   ├── aviationMath.ts            # Haversine (NM), Great Circle bearings, runway math, vectors
│   │   └── icaoCountry.ts             # ICAO 24-bit hex address country & flag decoder
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server (Web Mode)
Runs both the Express ADS-B backend proxy (`http://localhost:3001`) and the Vite client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Run as Windows Desktop App (Electron)
```bash
npm run electron:dev
```

### 4. Build for Production
```bash
npm run build
```
The compiled bundle is output to `/dist`.
