"use client";

const strings = [
  { name: "E", frequency: 329.63 },
  { name: "B", frequency: 246.94 },
  { name: "G", frequency: 196.0 },
  { name: "D", frequency: 146.83 },
  { name: "A", frequency: 110.0 },
  { name: "E", frequency: 82.41 },
];

const frets = [0, 1, 2, 3, 4, 5, 7, 9, 12];

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

  gain.gain.setValueAtTime(0.18, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 1);
}

export default function GuitarNeck() {
  return (
    <div className="rounded-3xl border border-amber-900/50 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-950 p-5 shadow-2xl">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-amber-200">
          Playable Guitar Neck
        </h3>
        <p className="mt-2 text-sm text-amber-100/70">
          弦とフレットをクリックすると音が鳴ります。
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] space-y-3">
          {strings.map((string, stringIndex) => (
            <div
              key={`${string.name}-${stringIndex}`}
              className="flex items-center gap-2"
            >
              <span className="w-6 text-xs font-bold text-amber-100">
                {string.name}
              </span>

              <div className="grid flex-1 grid-cols-9 overflow-hidden rounded-lg border border-amber-700/40 bg-black/30">
                {frets.map((fret) => (
                  <button
                    key={fret}
                    type="button"
                    onClick={() => playNote(string.frequency, fret)}
                    className="relative h-10 border-r border-amber-500/40 transition hover:bg-cyan-400/30"
                    title={`${string.name} string / fret ${fret}`}
                  >
                    <span className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200/70" />
                    <span className="relative z-10 text-[10px] text-slate-300">
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