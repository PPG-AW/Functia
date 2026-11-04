/** Efek konfeti/bintang saat siswa menjawab benar atau menyelesaikan misi. */
export async function fireConfetti(level: "small" | "big" = "small") {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const { default: confetti } = await import("canvas-confetti");
  const colors = ["#2f6bff", "#38bdf8", "#14b8a6", "#fbbf24", "#fb7185", "#a78bfa"];

  if (level === "small") {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 },
      colors,
      scalar: 0.9,
      disableForReducedMotion: true,
    });
    return;
  }

  const duration = 1600;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({
    particleCount: 160,
    spread: 100,
    origin: { y: 0.55 },
    colors,
    shapes: ["circle", "square"],
    scalar: 1.1,
  });
}
