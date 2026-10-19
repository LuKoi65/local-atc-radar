import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const releaseDir = path.join(rootDir, 'release');
const appOutDir = path.join(releaseDir, 'Local-ATC-Radar-win-x64');
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');

console.log('[Packaging] Starting Windows Portable Desktop package build for Local ATC Radar...');

// Ensure dist/ exists
if (!fs.existsSync(path.join(rootDir, 'dist', 'index.html'))) {
  console.error('[Packaging] Error: dist/index.html not found. Run npm run build first.');
  process.exit(1);
}

// Clean previous build outputs
const oldOutDir = path.join(releaseDir, 'ATC-Radar-Simulator-win-x64');
if (fs.existsSync(oldOutDir)) {
  fs.rmSync(oldOutDir, { recursive: true, force: true });
}
if (fs.existsSync(appOutDir)) {
  console.log('[Packaging] Removing previous build output...');
  fs.rmSync(appOutDir, { recursive: true, force: true });
}
fs.mkdirSync(appOutDir, { recursive: true });

// 1. Copy entire electron/dist to appOutDir
console.log('[Packaging] Copying Electron runtime binaries...');
fs.cpSync(electronDist, appOutDir, { recursive: true });

// 2. Rename electron.exe to Local-ATC-Radar.exe
const originalExe = path.join(appOutDir, 'electron.exe');
const targetExe = path.join(appOutDir, 'Local-ATC-Radar.exe');
if (fs.existsSync(originalExe)) {
  fs.renameSync(originalExe, targetExe);
  console.log('[Packaging] Created standalone executable: Local-ATC-Radar.exe');
}

// Embed application icon into executable if rcedit is present
const rceditPath = path.join(rootDir, 'node_modules', 'electron-winstaller', 'vendor', 'rcedit.exe');
const iconIcoPath = path.join(rootDir, 'electron', 'icon.ico');
if (fs.existsSync(rceditPath) && fs.existsSync(iconIcoPath)) {
  try {
    console.log('[Packaging] Embedding custom green radar icon into executable...');
    child_process.execFileSync(rceditPath, [
      targetExe,
      '--set-icon',
      iconIcoPath,
      '--set-version-string',
      'FileDescription',
      'Local ATC Radar',
      '--set-version-string',
      'ProductName',
      'Local ATC Radar',
    ]);
    console.log('[Packaging] Executable icon successfully applied!');
  } catch (err) {
    console.warn('[Packaging] rcedit warning:', err.message);
  }
}

// 3. Prepare resources/app
const resourcesAppDir = path.join(appOutDir, 'resources', 'app');
fs.mkdirSync(resourcesAppDir, { recursive: true });

// Copy package.json
console.log('[Packaging] Copying package manifest and server code...');
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(resourcesAppDir, 'package.json'));

// Copy electron/
fs.cpSync(path.join(rootDir, 'electron'), path.join(resourcesAppDir, 'electron'), { recursive: true });

// Copy server/
fs.cpSync(path.join(rootDir, 'server'), path.join(resourcesAppDir, 'server'), { recursive: true });

// Copy dist/
console.log('[Packaging] Copying compiled frontend bundle (dist)...');
fs.cpSync(path.join(rootDir, 'dist'), path.join(resourcesAppDir, 'dist'), { recursive: true });

// Copy required runtime dependencies from node_modules (express, cors, and their deps)
console.log('[Packaging] Bundling backend dependencies (express, cors)...');
const destNodeModules = path.join(resourcesAppDir, 'node_modules');
fs.mkdirSync(destNodeModules, { recursive: true });

const requiredDeps = [
  'express',
  'cors',
  'accepts',
  'array-flatten',
  'body-parser',
  'bytes',
  'content-disposition',
  'content-type',
  'cookie',
  'cookie-signature',
  'debug',
  'depd',
  'destroy',
  'ee-first',
  'encodeurl',
  'escape-html',
  'etag',
  'finalhandler',
  'forwarded',
  'fresh',
  'http-errors',
  'inherits',
  'ipaddr.js',
  'media-typer',
  'merge-descriptors',
  'methods',
  'mime',
  'mime-db',
  'mime-types',
  'ms',
  'negotiator',
  'on-finished',
  'parseurl',
  'path-to-regexp',
  'proxy-addr',
  'qs',
  'range-parser',
  'raw-body',
  'safe-buffer',
  'safer-buffer',
  'send',
  'serve-static',
  'setprototypeof',
  'statuses',
  'toidentifier',
  'type-is',
  'unpipe',
  'utils-merge',
  'vary',
  'object-assign'
];

for (const dep of requiredDeps) {
  const srcDep = path.join(rootDir, 'node_modules', dep);
  const dstDep = path.join(destNodeModules, dep);
  if (fs.existsSync(srcDep)) {
    fs.cpSync(srcDep, dstDep, { recursive: true });
  }
}

// 4. Create an easy shortcut launcher in release directory
const shortcutBat = `@echo off
start "" "%~dp0Local-ATC-Radar-win-x64\\Local-ATC-Radar.exe"
`;
fs.writeFileSync(path.join(releaseDir, 'Lancer-Local-ATC-Radar.bat'), shortcutBat, 'utf-8');

// Remove obsolete launcher if present
const oldBat = path.join(releaseDir, 'Lancer-ATC-Radar.bat');
if (fs.existsSync(oldBat)) {
  fs.unlinkSync(oldBat);
}

console.log('========================================================');
console.log(' BUILD SUCCESSFUL!');
console.log(` Executable created at:`);
console.log(` ${targetExe}`);
console.log('========================================================');
