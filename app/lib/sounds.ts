"use client";

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedContext: AudioContext | null = null;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext || (window as WebkitWindow).webkitAudioContext || null;
}

function getSharedAudioContext(): AudioContext | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContextClass();
  }
  return sharedContext;
}

/** Call from a user gesture so later effect/setTimeout beeps can play. */
export const unlockAudio = (): void => {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // ignore
  }
};

export const playBeep = (frequency: number = 800, duration: number = 500) => {
  try {
    const audioContext = getSharedAudioContext();
    if (!audioContext) return;

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  } catch {
    console.log("Audio not supported");
  }
};

export const playStartSound = () => {
  playBeep(600, 300);
};

/** Main countdown begins (after delay or immediate start). */
export const playLongStartSound = () => {
  // C5 → E5 → G5 → C6: bright, uplifting, distinct from pause/warning tones
  playBeep(523, 170);
  setTimeout(() => playBeep(659, 170), 190);
  setTimeout(() => playBeep(784, 200), 380);
  setTimeout(() => playBeep(1047, 260), 600);
};

export const playPauseSound = () => {
  playBeep(420, 220);
};

export const playFinishSound = () => {
  // Same sine / ascending style as long start, resolving higher for “done”
  playBeep(659, 180);
  setTimeout(() => playBeep(784, 180), 200);
  setTimeout(() => playBeep(1047, 220), 400);
  setTimeout(() => playBeep(1319, 280), 640);
};

export const play5MinWarningSound = () => {
  playBeep(600, 400);
};

export const play5SecWarningSound = () => {
  playBeep(700, 200);
};

/** Interval: phase switch (work↔rest) — 800 Hz + 1000 Hz, 200 ms each. */
export const playIntervalPhaseChange = () => {
  playBeep(800, 200);
  setTimeout(() => playBeep(1000, 200), 220);
};

/** Interval: session complete — triple beep (ascending). */
export const playIntervalComplete = () => {
  playBeep(600, 200);
  setTimeout(() => playBeep(800, 200), 230);
  setTimeout(() => playBeep(1000, 200), 460);
};
