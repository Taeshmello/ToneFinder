import KnobControl from './KnobControl'
import type { ToneCharacteristics } from '../../types/tone'

const TONE_TYPE_LABELS: Record<string, string> = {
  clean: '클린', crunch: '크런치', overdrive: '오버드라이브',
  distortion: '디스토션', fuzz: '퍼즈',
}

const TONE_TYPE_COLORS: Record<string, string> = {
  clean: 'bg-sky-100 text-sky-700',
  crunch: 'bg-amber-100 text-amber-700',
  overdrive: 'bg-orange-100 text-orange-700',
  distortion: 'bg-red-100 text-red-700',
  fuzz: 'bg-purple-100 text-purple-700',
}

export default function ToneCharCard({ tc }: { tc: ToneCharacteristics }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">톤 특성</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TONE_TYPE_COLORS[tc.type] ?? 'bg-slate-100 text-slate-700'}`}>
          {TONE_TYPE_LABELS[tc.type] ?? tc.type}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{tc.description}</p>
      <div className="flex justify-around pt-1">
        <KnobControl value={tc.brightness} label="밝기" color="#14b8a6" />
        <KnobControl value={tc.warmth} label="따뜻함" color="#14b8a6" />
        <KnobControl value={tc.gain} label="게인" color="#14b8a6" />
      </div>
    </div>
  )
}
