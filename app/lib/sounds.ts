"use client";

type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export const playBeep = (frequency: number = 800, duration: number = 500) => {
  try {
    const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
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
  playBeep(800, 200);
  setTimeout(() => playBeep(1000, 200), 250);
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
