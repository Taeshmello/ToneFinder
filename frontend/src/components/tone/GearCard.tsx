import type { ToneResult } from '../../types/tone'

export default function GearCard({ gear }: { gear: ToneResult['recommendedGear'] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">추천 기어</h3>
      <div className="text-sm flex items-center gap-2">
        <span className="text-slate-400 w-8">기타</span>
        <span className="font-medium text-slate-800">{gear.guitar}</span>
      </div>
      <div className="text-sm flex items-center gap-2">
        <span className="text-slate-400 w-8">앰프</span>
        <span className="font-medium text-slate-800">{gear.amplifier.brand} {gear.amplifier.name}</span>
      </div>
    </div>
  )
}
