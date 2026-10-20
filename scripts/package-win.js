import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import child_process from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Version 0.4 organized in dedicated release directory
const releaseVersion = 'v0.4';
const releaseDir = path.join(rootDir, 'release', releaseVersion);
const appOutDir = path.join(releaseDir, 'Local-ATC-Radar-win-x64');
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');

console.log(`[Packaging] Starting Windows Portable Desktop package build for Local ATC Radar (${releaseVersion})...`);

// Ensure dist/ exists
if (!fs.existsSync(path.join(rootDir, 'dist', 'index.html'))) {
  console.error('[Packaging] Error: dist/index.html not found. Run npm run build first.');
  process.exit(1);
}

// Clean and prepare release directory for this version
if (fs.existsSync(appOutDir)) {
  console.log('[Packaging] Preparing build output in ' + releaseVersion + '...');
  try {
    fs.rmSync(appOutDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
  } catch (err) {
    console.warn('[Packaging] Note: Folder partially locked, overwriting existing files in place...');
  }
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
      'Local ATC Radar v0.4',
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

// Copy all required runtime dependencies from node_modules dynamically
console.log('[Packaging] Discovering all production dependencies...');
const destNodeModules = path.join(resourcesAppDir, 'node_modules');
fs.mkdirSync(destNodeModules, { recursive: true });

function getProductionDependencies() {
  const deps = new Set(['express', 'cors']);
  try {
    const output = child_process.execSync('npm list --omit=dev --all --json', { cwd: rootDir }).toString();
    const tree = JSON.parse(output);
    function walk(node) {
      if (node.dependencies) {
        for (const [name, info] of Object.entries(node.dependencies)) {
          deps.add(name);
          walk(info);
        }
      }
    }
    walk(tree);
  } catch (err) {
    console.warn('[Packaging] Failed to run npm list, using fallback:', err.message);
  }
  return Array.from(deps);
}

const prodDeps = getProductionDependencies();
console.log(`[Packaging] Bundling ${prodDeps.length} runtime dependency packages...`);

let copiedCount = 0;
for (const dep of prodDeps) {
  const srcDep = path.join(rootDir, 'node_modules', dep);
  const dstDep = path.join(destNodeModules, dep);
  if (fs.existsSync(srcDep)) {
    fs.mkdirSync(path.dirname(dstDep), { recursive: true });
    fs.cpSync(srcDep, dstDep, { recursive: true });
    copiedCount++;
  }
}
console.log(`[Packaging] Successfully bundled ${copiedCount} packages into resources/app/node_modules.`);

// 4. Create an easy shortcut launcher in release directory
const shortcutBat = `@echo off
start "" "%~dp0Local-ATC-Radar-win-x64\\Local-ATC-Radar.exe"
`;
fs.writeFileSync(path.join(releaseDir, 'Lancer-Local-ATC-Radar.bat'), shortcutBat, 'utf-8');

// 5. Generate zip archive in release directory
const zipName = `Local-ATC-Radar-${releaseVersion}-Windows.zip`;
const zipPath = path.join(releaseDir, zipName);
console.log(`[Packaging] Generating release zip archive: ${zipName}...`);
try {
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  child_process.execSync(
    `powershell -Command "Compress-Archive -Path '${appOutDir}', '${path.join(releaseDir, 'Lancer-Local-ATC-Radar.bat')}' -DestinationPath '${zipPath}'"`,
    { stdio: 'inherit' }
  );
  console.log(`[Packaging] Zip archive generated successfully: ${zipPath}`);
} catch (err) {
  console.warn('[Packaging] Could not create zip archive automatically:', err.message);
}

console.log('========================================================');
console.log(` BUILD SUCCESSFUL FOR RELEASE ${releaseVersion}!`);
console.log(` Executable folder:`);
console.log(` ${appOutDir}`);
console.log(` Standalone executable:`);
console.log(` ${targetExe}`);
console.log('========================================================');
