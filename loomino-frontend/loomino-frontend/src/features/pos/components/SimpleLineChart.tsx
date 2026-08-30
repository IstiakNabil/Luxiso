interface Point {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: Point[];
  currencySymbol?: string;
  /** Show every Nth x-axis label, to avoid crowding on 30-day charts. */
  labelStride?: number;
}

const WIDTH = 900;
const HEIGHT = 260;
const PAD_LEFT = 56;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;

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

function SimpleLineChart({ data, currencySymbol = "", labelStride }: SimpleLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-[13px] text-[#A8A2C9]">
        No data yet
      </div>
    );
  }

  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD_LEFT + stepX * i;
    const y = PAD_TOP + plotHeight - (d.value / max) * plotHeight;
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const stride = labelStride ?? Math.max(1, Math.ceil(data.length / 10));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-[260px] w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Sales trend chart"
    >
      {gridLines.map((g) => {
        const y = PAD_TOP + plotHeight * (1 - g);
        return (
          <g key={g}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={y}
              y2={y}
              stroke="#EDEBFA"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#A8A2C9">
              {currencySymbol}
              {formatCompact(max * g)}
            </text>
          </g>
        );
      })}

      <path d={path} fill="none" stroke="#7C6AE8" strokeWidth={2} />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#7C6AE8">
          <title>
            {p.label}: {currencySymbol}
            {p.value.toLocaleString()}
          </title>
        </circle>
      ))}

      {points.map((p, i) =>
        i % stride === 0 || i === points.length - 1 ? (
          <text
            key={i}
            x={p.x}
            y={HEIGHT - 12}
            textAnchor="middle"
            fontSize={10}
            fill="#A8A2C9"
          >
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export default SimpleLineChart;
