/**
 * Audio Alert Utility using Web Audio API
 * Generates discrete, authentic ATC tones for STCA conflicts and emergencies.
 */

let audioCtx: AudioContext | null = null;
let lastAlertTime = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a discrete ATC Short Term Conflict Alert (STCA) tone
 * @param level 'caution' (single discrete beep) or 'warning' (dual alternating alert tone)
 */
export function playStcaAlertSound(level: 'caution' | 'warning' = 'warning') {
  const now = Date.now();
  // Rate-limit: at most one tone sequence every 4.5 seconds to avoid audio clutter
  if (now - lastAlertTime < 4500) {
    return;
  }
  lastAlertTime = now;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (level === 'warning') {
      // Dual-tone urgent alert: 880Hz -> 1200Hz -> 880Hz -> 1200Hz
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1174, t + 0.12);
      osc.frequency.setValueAtTime(880, t + 0.24);
      osc.frequency.setValueAtTime(1174, t + 0.36);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gain.gain.setValueAtTime(0.18, t + 0.46);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.52);

      osc.start(t);
      osc.stop(t + 0.54);
    } else {
      // Caution alert: single subtle chime (700Hz with soft decay)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.start(t);
      osc.stop(t + 0.3);
    }
  } catch (e) {
    // Graceful fallback if user hasn't interacted or browser blocks audio
  }
}
