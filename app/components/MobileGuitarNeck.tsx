"use client";

const strings = [
  { name: "E", frequency: 329.63 },
  { name: "B", frequency: 246.94 },
  { name: "G", frequency: 196.0 },
  { name: "D", frequency: 146.83 },
  { name: "A", frequency: 110.0 },
  { name: "E", frequency: 82.41 },
];

const frets = [0, 1, 2, 3, 4, 5];

function playNote(baseFrequency: number, fret: number) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  const frequency = baseFrequency * Math.pow(2, fret / 12);

  oscillator.type = "triangle";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.13, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.8);
}

export default function MobileGuitarNeck() {
  return (
    <div className="w-full rounded-2xl border border-amber-900/60 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-950 p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold tracking-[0.3em] text-amber-200">
          GUITAR
        </p>
        <p className="text-[10px] text-amber-100/70">tap frets</p>
      </div>

      <div className="space-y-1">
        {strings.map((string, stringIndex) => (
          <div
            key={`${string.name}-${stringIndex}`}
            className="flex items-center gap-1"
          >
            <span className="w-4 text-[10px] font-bold text-amber-100">
              {string.name}
            </span>

            <div className="grid flex-1 grid-cols-6 overflow-hidden rounded-md border border-amber-700/40 bg-black/30">
              {frets.map((fret) => (
                <button
                  key={`${string.name}-${stringIndex}-${fret}`}
                  type="button"
                  onClick={() => playNote(string.frequency, fret)}
                  className="relative h-7 border-r border-amber-500/40 transition hover:bg-cyan-400/30"
                  title={`${string.name} string / fret ${fret}`}
                >
                  <span className="absolute left-0 right-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-slate-200/70" />
                  <span className="relative z-10 text-[9px] text-slate-300">
                    {fret}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}