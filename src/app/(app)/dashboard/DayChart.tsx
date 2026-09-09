import { areaChartPaths, fmtCount } from "@/lib/dashboardMetrics";

interface DayChartProps {
  values: number[];
  labels: string[];
}

const W = 600, H = 128;
const PL = 38, PR = 8, PT = 10, PB = 26;

export function DayChart({ values, labels }: DayChartProps) {
  const max = Math.max(...values, 1);
  const { line, area, pts } = areaChartPaths(values, W, H, PL, PR, PT, PB);
  const n = values.length;

  const labelIndices = [0, 6, 13, 20, n - 1];
  const yGridPcts = [1, 0.5, 0];
  const plotH = H - PT - PB;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sk-chart-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {yGridPcts.map((pct, i) => {
        const y = PT + (1 - pct) * plotH;
        return (
          <line
            key={i}
            x1={PL}
            y1={y}
            x2={W - PR}
            y2={y}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={pct === 0 ? undefined : "3,3"}
          />
        );
      })}

      {/* Y-axis labels */}
      {yGridPcts.map((pct, i) => {
        const val = Math.round(pct * max);
        const y = PT + (1 - pct) * plotH;
        return (
          <text
            key={i}
            x={PL - 5}
            y={y + 4}
            textAnchor="end"
            fontSize="9"
            fill="var(--faint)"
            fontFamily="ui-monospace, monospace"
          >
            {fmtCount(val)}
          </text>
        );
      })}

      {/* Area fill */}
      <path d={area} fill="url(#sk-chart-grad)" />

      {/* Line */}
      <path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Today endpoint dot */}
      <circle cx={pts[n - 1].x} cy={pts[n - 1].y} r="3.5" fill="var(--accent)" />
      <circle cx={pts[n - 1].x} cy={pts[n - 1].y} r="6" fill="#22c55e" fillOpacity="0.15" />

      {/* X-axis labels */}
      {labelIndices.map((idx) => (
        <text
          key={idx}
          x={pts[idx].x}
          y={H - 4}
          textAnchor={idx === n - 1 ? "end" : idx === 0 ? "start" : "middle"}
          fontSize="9"
          fill="var(--faint)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {labels[idx]}
        </text>
      ))}
    </svg>
  );
}
