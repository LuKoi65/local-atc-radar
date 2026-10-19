const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

// Enforce single instance lock: prevent duplicate sessions
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

let win = null;
let appPort = 3001;

// Verify that a given port is serving the actual HTML frontend app
function checkAppReady(port, callback) {
  const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
    const isHtml = (res.headers['content-type'] || '').includes('text/html');
    if (res.statusCode === 200 && isHtml) {
      callback(true);
    } else {
      callback(false);
    }
  });
  req.on('error', () => callback(false));
  req.setTimeout(400, () => {
    req.destroy();
    callback(false);
  });
}

async function startBackendServer() {
  const alreadyRunning = await new Promise((resolve) => checkAppReady(3001, resolve));
  if (alreadyRunning) {
    console.log('[Electron] Server is already running on port 3001.');
    appPort = 3001;
    return;
  }

  try {
    process.env.PORT = '3001';
    // Import server in-process directly within Electron's Node runtime (no child process spawned)
    await import('../server/server.js');
    console.log('[Electron] Backend proxy server started in-process on port 3001.');
    appPort = 3001;
  } catch (err) {
    console.error('[Electron] Error starting in-process server:', err);
  }
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

  // Always open in maximized window
  win.maximize();
  win.show();

  const devUrl = 'http://localhost:5173';
  const prodUrl = `http://127.0.0.1:${appPort}`;

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Check if 5173 is accessible (dev mode), else load production server
    const req = http.get(devUrl, (res) => {
      if (res.statusCode === 200) {
        win.loadURL(devUrl);
      } else {
        win.loadURL(prodUrl);
      }
    });
    req.on('error', () => {
      win.loadURL(prodUrl);
    });
    req.setTimeout(300, () => {
      req.destroy();
      win.loadURL(prodUrl);
    });
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
