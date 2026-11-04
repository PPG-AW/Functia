"use client";

import type { ArrowDiagram as Diagram } from "@/lib/store/types";
import { cx } from "./ui";

const W = 640;
const LEFT_X = 16;
const LEFT_W = 234;
const RIGHT_X = 390;
const RIGHT_W = 234;
const ROW_H = 46;
const TOP = 84;
const BOX_Y = 52;

function offsets(counts: Record<number, number>, index: number, order: number) {
  const total = counts[index] ?? 1;
  return (order - (total - 1) / 2) * 9;
}

export function ArrowDiagram({
  diagram,
  animate = true,
  showVerdict = false,
  className,
}: {
  diagram: Diagram;
  animate?: boolean;
  showVerdict?: boolean;
  className?: string;
}) {
  const leftCount = diagram.left.length;
  const rightCount = diagram.right.length;
  const rows = Math.max(leftCount, rightCount, 1);
  const boxH = rows * ROW_H + 34;
  const H = BOX_Y + boxH + 16;

  const perLeft: Record<number, number> = {};
  const perRight: Record<number, number> = {};
  for (const [l, r] of diagram.arrows) {
    perLeft[l] = (perLeft[l] ?? 0) + 1;
    perRight[r] = (perRight[r] ?? 0) + 1;
  }
  const seenLeft: Record<number, number> = {};
  const seenRight: Record<number, number> = {};

  const y = (index: number) => TOP + index * ROW_H;
  const branched = new Set<number>();
  for (const [l] of diagram.arrows) if ((perLeft[l] ?? 0) > 1) branched.add(l);

  return (
    <figure className={cx("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Diagram panah dari ${diagram.leftLabel} ke ${diagram.rightLabel}`}
      >
        <defs>
          <marker id="ad-head" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#2f6bff" />
          </marker>
          <marker id="ad-head-alert" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#fb7185" />
          </marker>
        </defs>

        {/* kotak himpunan */}
        {[
          { x: LEFT_X, label: diagram.leftLabel, items: diagram.left },
          { x: RIGHT_X, label: diagram.rightLabel, items: diagram.right },
        ].map((box) => (
          <g key={box.label + box.x}>
            <rect
              x={box.x}
              y={BOX_Y}
              width={box.x === LEFT_X ? LEFT_W : RIGHT_W}
              height={boxH}
              rx={26}
              fill="white"
              stroke="#dbe4ff"
              strokeWidth={2}
            />
            <text
              x={box.x + (box.x === LEFT_X ? LEFT_W : RIGHT_W) / 2}
              y={BOX_Y - 14}
              textAnchor="middle"
              className="font-display"
              fontSize={15}
              fontWeight={800}
              fill="#1e3fbf"
            >
              {box.label}
            </text>
            <ellipse
              cx={box.x + (box.x === LEFT_X ? LEFT_W : RIGHT_W) / 2}
              cy={BOX_Y + 8}
              rx={(box.x === LEFT_X ? LEFT_W : RIGHT_W) / 2 - 8}
              ry={9}
              fill="#eef3ff"
            />
            {box.items.map((item, i) => {
              const cx = box.x + (box.x === LEFT_X ? LEFT_W : RIGHT_W) / 2;
              const isBranch = box.x === LEFT_X && branched.has(i);
              return (
                <g key={`${box.label}-${item}-${i}`}>
                  <rect
                    x={cx - 104}
                    y={y(i) - 16}
                    width={208}
                    height={32}
                    rx={16}
                    fill={isBranch ? "#ffe4e8" : "#eef3ff"}
                    stroke={isBranch ? "#fda4af" : "#c9d8ff"}
                    strokeWidth={1.6}
                  />
                  <text
                    x={cx}
                    y={y(i) + 4.5}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill={isBranch ? "#9f1239" : "#16224a"}
                  >
                    {item.length > 27 ? `${item.slice(0, 26)}…` : item}
                  </text>
                </g>
              );
            })}
          </g>
        ))}

        {/* panah relasi */}
        {diagram.arrows.map(([l, r], i) => {
          const lo = seenLeft[l] ?? 0;
          seenLeft[l] = lo + 1;
          const ro = seenRight[r] ?? 0;
          seenRight[r] = ro + 1;
          const sx = LEFT_X + LEFT_W;
          const ex = RIGHT_X;
          const sy = y(l) + offsets(perLeft, l, lo);
          const ey = y(r) + offsets(perRight, r, ro);
          const alert = branched.has(l);
          const d = `M ${sx} ${sy} C ${sx + 60} ${sy}, ${ex - 60} ${ey}, ${ex - 2} ${ey}`;
          return (
            <path
              key={`${l}-${r}-${i}`}
              d={d}
              fill="none"
              stroke={alert ? "#fb7185" : "#2f6bff"}
              strokeWidth={2.6}
              strokeLinecap="round"
              markerEnd={alert ? "url(#ad-head-alert)" : "url(#ad-head)"}
              className={animate ? "arrow-path" : undefined}
              style={animate ? { animationDelay: `${i * 130}ms` } : undefined}
              opacity={animate ? undefined : 1}
            />
          );
        })}
      </svg>

      {diagram.note ? (
        <figcaption className="mt-2 rounded-2xl bg-brand-soft/70 px-4 py-2.5 text-center text-xs font-semibold text-brand-dark sm:text-sm">
          {diagram.note}
        </figcaption>
      ) : null}

      {showVerdict && diagram.verdict ? (
        <div className="mt-3 flex justify-center">
          <span
            className={cx(
              "rounded-full px-4 py-1.5 font-display text-xs font-black uppercase tracking-wide",
              diagram.verdict === "fungsi" ? "bg-aqua-soft text-teal-700" : "bg-coral-soft text-rose-700",
            )}
          >
            {diagram.verdict === "fungsi" ? "✓ Fungsi" : "✗ Bukan Fungsi"}
          </span>
        </div>
      ) : null}
    </figure>
  );
}
