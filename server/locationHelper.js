import { execFile } from 'child_process';

let cachedLocation = null;
let lastFetchTime = 0;

const PS_SCRIPT = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  Add-Type -AssemblyName System.Device -ErrorAction Stop
  $watcher = New-Object System.Device.Location.GeoCoordinateWatcher([System.Device.Location.GeoPositionAccuracy]::High)
  $watcher.Start()
  $count = 0
  while ($watcher.Status -ne [System.Device.Location.GeoPositionStatus]::Ready -and $count -lt 25) {
    Start-Sleep -Milliseconds 100
    $count++
  }
  $pos = $watcher.Position
  $watcher.Stop()
  if (-not $pos.Location.IsUnknown) {
    [PSCustomObject]@{
      lat = [double]$pos.Location.Latitude
      lon = [double]$pos.Location.Longitude
      accuracy = [double]$pos.Location.HorizontalAccuracy
      source = "windows_gps"
    } | ConvertTo-Json -Compress
  } else {
    Write-Output "UNKNOWN"
  }
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}
`;

function getWindowsLocation() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve(null);
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', PS_SCRIPT],
      { timeout: 4000 },
      (err, stdout) => {
        if (err || !stdout) return resolve(null);
        const trimmed = stdout.trim();
        if (trimmed.startsWith('{')) {
          try {
            const data = JSON.parse(trimmed);
            if (data.lat && data.lon) {
              return resolve({
                lat: data.lat,
                lon: data.lon,
                accuracyMeters: data.accuracy || 150,
                source: 'windows_native_gps',
              });
            }
          } catch (e) {}
        }
        resolve(null);
      }
    );
  });
}

async function getIpLocation() {
  try {
    const res = await fetch('http://ip-api.com/json/?fields=status,message,lat,lon,city,country');
    const data = await res.json();
    if (data.status === 'success' && data.lat && data.lon) {
      return {
        lat: data.lat,
        lon: data.lon,
        accuracyMeters: 5000,
        city: data.city,
        source: 'ip_lookup',
      };
    }
  } catch (err) {
    console.warn('[Location] IP fallback error:', err.message);
  }
  return null;
}

export async function resolveCurrentLocation() {
  const now = Date.now();
  if (cachedLocation && now - lastFetchTime < 30000) {
    return cachedLocation;
  }

  // 1. Try Windows Native Location API
  const winLoc = await getWindowsLocation();
  if (winLoc) {
    cachedLocation = winLoc;
    lastFetchTime = now;
    return winLoc;
  }

  // 2. Fallback to IP Geolocation
  const ipLoc = await getIpLocation();
  if (ipLoc) {
    cachedLocation = ipLoc;
    lastFetchTime = now;
    return ipLoc;
  }

  return null;
}
