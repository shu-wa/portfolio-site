"use client";

const strings = [
    { name: "E", frequency: 329.63 },
    { name: "B", frequency: 246.94 },
    { name: "G", frequency: 196.0 },
    { name: "D", frequency: 146.83 },
    { name: "A", frequency: 110.0 },
    { name: "E", frequency: 82.41 },
];

const frets = Array.from({ length: 13 }, (_, index) => index);

function makeDistortionCurve(amount: number) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] =
      ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

function playGuitarNote(baseFrequency: number, fret: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();

  const oscillator = audioContext.createOscillator();
  const subOscillator = audioContext.createOscillator();
  const distortion = audioContext.createWaveShaper();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  const frequency = baseFrequency * Math.pow(2, fret / 12);

  oscillator.type = "sawtooth";
  oscillator.frequency.value = frequency;

  subOscillator.type = "square";
  subOscillator.frequency.value = frequency / 2;

  distortion.curve = makeDistortionCurve(260);
  distortion.oversample = "4x";

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, audioContext.currentTime);
  filter.Q.setValueAtTime(7, audioContext.currentTime);

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.0);

  oscillator.connect(distortion);
  subOscillator.connect(distortion);
  distortion.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  subOscillator.start();

  oscillator.stop(audioContext.currentTime + 1.0);
  subOscillator.stop(audioContext.currentTime + 1.0);
}

export default function MobileGuitarNeck() {
  return (
    <div className="w-full rounded-2xl border border-amber-900/60 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-950 p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black tracking-[0.3em] text-amber-200">
          GUITAR
        </p>
        <p className="text-[10px] text-amber-100/70">
          distorted / scroll →
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px] space-y-1">
          {strings.map((string, stringIndex) => (
            <div
              key={`${string.name}-${stringIndex}`}
              className="flex items-center gap-2"
            >
              <span className="w-4 text-[10px] font-black text-amber-100">
                {string.name}
              </span>

              <div className="grid flex-1 grid-cols-13 overflow-hidden rounded-md border border-amber-700/40 bg-black/30">
                {frets.map((fret) => (
                  <button
                    key={`${string.name}-${stringIndex}-${fret}`}
                    type="button"
                    onClick={() => playGuitarNote(string.frequency, fret)}
                    className="relative h-7 border-r border-amber-500/40 transition hover:bg-cyan-400/30 active:bg-cyan-300/50"
                    title={`${string.name} string / fret ${fret}`}
                  >
                    <span className="absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-slate-200/70" />
                    <span className="relative z-10 text-[9px] font-bold text-slate-300">
                      {fret}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}