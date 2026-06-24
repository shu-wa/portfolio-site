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

  gain.gain.setValueAtTime(0.15, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.9);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.9);
}

export default function VerticalGuitarNeck() {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-40 shrink-0 lg:block">
      <div className="flex h-full flex-col rounded-[2rem] border border-amber-900/60 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-950 p-4 shadow-2xl">
        <div className="mb-4 text-center">
          <p className="text-xs font-bold tracking-[0.3em] text-amber-200">
            GUITAR
          </p>
          <p className="mt-2 text-[10px] leading-5 text-amber-100/70">
            click strings
          </p>
        </div>

        <div className="relative flex-1 overflow-hidden rounded-2xl border border-amber-700/40 bg-black/30">
          <div className="grid h-full grid-cols-6">
            {strings.map((string, stringIndex) => (
              <div
                key={`${string.name}-${stringIndex}`}
                className="relative border-r border-amber-500/30 last:border-r-0"
              >
                <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-slate-200/70" />

                <div className="grid h-full grid-rows-9">
                  {frets.map((fret) => (
                    <button
                      key={`${string.name}-${stringIndex}-${fret}`}
                      type="button"
                      onClick={() => playNote(string.frequency, fret)}
                      className="relative border-b border-amber-600/40 transition hover:bg-cyan-400/30"
                      title={`${string.name} string / fret ${fret}`}
                    >
                      <span className="absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent transition hover:bg-cyan-300" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute left-0 right-0 top-0 grid h-full grid-rows-9">
            {frets.map((fret) => (
              <div key={fret} className="relative">
                <span className="absolute left-1 top-1 text-[9px] text-amber-100/60">
                  {fret}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}