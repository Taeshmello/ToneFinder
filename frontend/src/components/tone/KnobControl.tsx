interface KnobControlProps {
  value: number   // 0-10
  label: string
  color?: string  // stroke hex, 기본 indigo-500
}

export default function KnobControl({ value, label, color = '#6366f1' }: KnobControlProps) {
  const cx = 32, cy = 32, r = 24
  const circumference = 2 * Math.PI * r       // 150.796
  const totalArc = (270 / 360) * circumference // 113.097 (270° 범위)
  const gap = circumference - totalArc          // 37.699 (90° 갭)
  const filled = (Math.min(Math.max(value, 0), 10) / 10) * totalArc
  const START_ROTATION = 135 // SVG 기준 135° 회전 → ~7시 방향 시작

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" viewBox="0 0 64 64">
        {/* 배경 아크 (270°, 회색) */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="5"
          strokeDasharray={`${totalArc} ${gap}`}
          strokeLinecap="round"
          transform={`rotate(${START_ROTATION}, ${cx}, ${cy})`}
        />
        {/* 전경 아크 (value 비율, 색상) */}
        {value > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
            transform={`rotate(${START_ROTATION}, ${cx}, ${cy})`}
          />
        )}
        {/* 중앙 수치 */}
        <text
          x={cx} y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontWeight="600"
          fill="#1e293b"
        >
          {value}
        </text>
      </svg>
      <span className="text-xs text-slate-400 leading-none">{label}</span>
    </div>
  )
}
