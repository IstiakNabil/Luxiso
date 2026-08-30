interface Bar {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: Bar[];
  currencySymbol?: string;
}

const WIDTH = 900;
const HEIGHT = 280;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 40;

function niceMax(value: number) {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const rounded = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return rounded * magnitude;
}

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `${value}`;
}

/** Same hand-rolled-SVG approach as SimpleLineChart — no new charting dependency for one bar chart. */
function SimpleBarChart({ data, currencySymbol = "" }: SimpleBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-[13px] text-[#A8A2C9]">
        No data yet
      </div>
    );
  }

  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = plotWidth / data.length;
  const barWidth = Math.min(64, slot * 0.5);

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-[280px] w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Bar chart"
    >
      {gridLines.map((g) => {
        const y = PAD_TOP + plotHeight * (1 - g);
        return (
          <g key={g}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} stroke="#EDEBFA" strokeWidth={1} />
            <text x={PAD_LEFT - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#A8A2C9">
              {currencySymbol}
              {formatCompact(max * g)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barHeight = (d.value / max) * plotHeight;
        const x = PAD_LEFT + slot * i + (slot - barWidth) / 2;
        const y = PAD_TOP + plotHeight - barHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill="#7C6AE8">
              <title>
                {d.label}: {currencySymbol}
                {d.value.toLocaleString()}
              </title>
            </rect>
            <text
              x={x + barWidth / 2}
              y={HEIGHT - 16}
              textAnchor="middle"
              fontSize={10}
              fill="#726C8C"
            >
              {d.label.length > 14 ? `${d.label.slice(0, 13)}…` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default SimpleBarChart;
