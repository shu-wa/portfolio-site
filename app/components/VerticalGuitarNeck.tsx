"use client";

const strings = [
  { name: "E", frequency: 82.41 },
  { name: "A", frequency: 110.0 },
  { name: "D", frequency: 146.83 },
  { name: "G", frequency: 196.0 },
  { name: "B", frequency: 246.94 },
  { name: "E", frequency: 329.63 },
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
  gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.1);

  oscillator.connect(distortion);
  subOscillator.connect(distortion);
  distortion.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  subOscillator.start();

  oscillator.stop(audioContext.currentTime + 1.1);
  subOscillator.stop(audioContext.currentTime + 1.1);
}

export default function VerticalGuitarNeck() {
  return (
    <div className="h-full w-full">
      <div className="flex h-full flex-col rounded-[2rem] border border-amber-900/70 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-950 p-4 shadow-2xl">
        <div className="mb-4 text-center">
          <p className="text-xs font-black tracking-[0.35em] text-amber-200">
            Let's play GUITAR
          </p>
          <p className="mt-2 text-[10px] text-amber-100/60">
            distorted sound / 12 frets
          </p>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-amber-700/50 bg-black/25">
          <div className="absolute inset-x-0 top-0 h-3 bg-amber-100/80" />

          <div className="grid h-full grid-rows-13 pt-3">
            {frets.map((fret) => (
              <div
                key={fret}
                className="relative border-b border-amber-500/50"
              >
                <span className="absolute left-2 top-1 text-[10px] font-bold text-amber-100/70">
                  {fret}
                </span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 grid grid-cols-6 px-6 pt-3">
            {strings.map((string, stringIndex) => (
              <div
                key={`${string.name}-${stringIndex}`}
                className="relative flex justify-center"
              >
                <div className="h-full w-[2px] bg-slate-200/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />

                <div className="absolute inset-y-0 flex flex-col">
                  {frets.map((fret) => (
                    <button
                      key={`${string.name}-${stringIndex}-${fret}`}
                      type="button"
                      onClick={() => playGuitarNote(string.frequency, fret)}
                      className="group relative flex-1"
                      title={`${string.name} string / fret ${fret}`}
                    >
                      <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/0 transition group-hover:border-cyan-300 group-hover:bg-cyan-300/30" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 top-[23%] mx-auto h-4 w-4 rounded-full bg-amber-100/50" />
          <div className="pointer-events-none absolute inset-x-0 top-[46%] mx-auto h-4 w-4 rounded-full bg-amber-100/50" />
          <div className="pointer-events-none absolute inset-x-0 top-[69%] mx-auto h-4 w-4 rounded-full bg-amber-100/50" />
        </div>

        <div className="mt-3 grid grid-cols-6 text-center text-[10px] font-bold text-amber-100">
          {strings.map((string, index) => (
            <span key={`${string.name}-label-${index}`}>{string.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}