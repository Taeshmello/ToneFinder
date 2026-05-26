interface SignalChainViewProps {
  chain: string[]
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 flex-shrink-0">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function SignalChainView({ chain }: SignalChainViewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">시그널 체인</h3>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium flex-shrink-0">
          🎸
        </div>
        {chain.map((item, i) => {
          const isLast = i === chain.length - 1
          return (
            <div key={i} className="flex items-center gap-2">
              <ArrowIcon />
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0 ${
                  isLast
                    ? 'bg-slate-700 text-white'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
