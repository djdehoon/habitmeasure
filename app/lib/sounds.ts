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

export const playPauseSound = () => {
  playBeep(420, 220);
};

export const playFinishSound = () => {
  playBeep(800, 200);
  setTimeout(() => playBeep(1000, 200), 250);
};
