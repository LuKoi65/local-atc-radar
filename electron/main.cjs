const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const http = require('http');
const { pathToFileURL } = require('url');

// Enforce single instance lock: prevent duplicate sessions
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let win = null;
let appPort = 3001;

// Helper to check if server is responding to health check
function checkServerHealthy(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait until server is healthy or max retries reached
async function waitForServer(port, maxRetries = 40, delayMs = 100) {
  for (let i = 0; i < maxRetries; i++) {
    const ready = await checkServerHealthy(port);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function startBackendServer() {
  const alreadyRunning = await checkServerHealthy(3001);
  if (alreadyRunning) {
    console.log('[Electron] Server is already running on port 3001.');
    appPort = 3001;
    return true;
  }

  try {
    process.env.PORT = '3001';
    const serverScript = path.join(__dirname, '../server/server.js');
    console.log('[Electron] Starting in-process backend server from:', serverScript);
    // Use pathToFileURL to ensure absolute path resolution regardless of working directory
    await import(pathToFileURL(serverScript).href);
    console.log('[Electron] Imported server script, waiting for port 3001 to respond...');
    const healthy = await waitForServer(3001, 40, 100);
    if (healthy) {
      console.log('[Electron] Backend proxy server verified healthy on port 3001.');
    } else {
      console.warn('[Electron] Backend server started but health check timed out.');
    }
    appPort = 3001;
    return healthy;
  } catch (err) {
    console.error('[Electron] Error starting in-process server:', err);
    return false;
  }
}

function loadWithRetry(browserWin, url, retries = 5) {
  browserWin.loadURL(url).catch((err) => {
    console.warn(`[Electron] Failed to load ${url}: ${err.message}. Retries left: ${retries}`);
    if (retries > 0) {
      setTimeout(() => loadWithRetry(browserWin, url, retries - 1), 500);
    }
  });
}

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false, // Don't show until maximized
    backgroundColor: '#0a0f14',
    title: 'Local ATC Radar',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Remove default menu bar for authentic radar scope feel
  win.setMenuBarVisibility(false);

  // Delegate external links to user's system default browser (FlightAware, ADSBx, Flightradar24, etc.)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('http://127.0.0.1:') || url.startsWith('http://localhost:');
    if (!isLocal && (url.startsWith('http:') || url.startsWith('https:'))) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Always open in maximized window
  win.maximize();
  win.show();

  const devUrl = 'http://localhost:5173';
  const prodUrl = `http://127.0.0.1:${appPort}`;

  if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (!app.isPackaged) {
    // In local development: check if Vite dev server on 5173 is reachable
    const req = http.get(devUrl, (res) => {
      if (res.statusCode === 200) {
        win.loadURL(devUrl);
      } else {
        loadWithRetry(win, prodUrl);
      }
    });
    req.on('error', () => {
      loadWithRetry(win, prodUrl);
    });
    req.setTimeout(300, () => {
      req.destroy();
      loadWithRetry(win, prodUrl);
    });
  } else {
    // In packaged desktop application: ALWAYS load the internal production server
    loadWithRetry(win, prodUrl);
  }

  win.on('closed', () => {
    win = null;
  });
}

// When a second instance tries to launch, focus the existing window instead of creating a second session
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(async () => {
  // Grant geolocation and device permissions
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'geolocation') {
        return callback(true);
      }
      callback(true);
    });
  }

  await startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
