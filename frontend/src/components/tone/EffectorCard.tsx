import KnobControl from './KnobControl'
import type { EffectorSetting } from '../../types/tone'

interface EffectorCardProps {
  effector: EffectorSetting
}

interface EffectorType {
  label: string
  color: string
  badgeBg: string
  badgeText: string
}

function inferEffectorType(name: string): EffectorType {
  const n = name.toLowerCase()
  if (n.includes('ds-1') || n.includes('distortion') || n.includes('big muff'))
    return { label: 'Distortion', color: '#ef4444', badgeBg: 'bg-red-100', badgeText: 'text-red-700' }
  if (n.includes('ts-9') || n.includes('tube screamer') || n.includes('overdrive'))
    return { label: 'Overdrive', color: '#f97316', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' }
  if (n.includes('fuzz'))
    return { label: 'Fuzz', color: '#a855f7', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' }
  if (n.includes('dd-') || n.includes('delay'))
    return { label: 'Delay', color: '#3b82f6', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' }
  if (n.includes('phase') || n.includes('flanger') || n.includes('chorus') || n.includes('modulation'))
    return { label: 'Modulation', color: '#8b5cf6', badgeBg: 'bg-violet-100', badgeText: 'text-violet-700' }
  if (n.includes('rv-') || n.includes('reverb'))
    return { label: 'Reverb', color: '#14b8a6', badgeBg: 'bg-teal-100', badgeText: 'text-teal-700' }
  return { label: 'Effect', color: '#64748b', badgeBg: 'bg-slate-100', badgeText: 'text-slate-600' }
}

export default function EffectorCard({ effector }: EffectorCardProps) {
  const type = inferEffectorType(effector.name)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-800">{effector.name}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type.badgeBg} ${type.badgeText}`}>
          {type.label}
        </span>
      </div>
      <div className="flex gap-6 justify-center flex-wrap">
        {effector.knobs.map(knob => (
          <KnobControl
            key={knob.name}
            value={knob.value}
            label={knob.name}
            color={type.color}
          />
        ))}
      </div>
    </div>
  )
}
