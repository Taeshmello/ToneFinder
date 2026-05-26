import KnobControl from './KnobControl'
import type { AmpSettings } from '../../types/tone'

interface AmpPanelProps {
  amp: AmpSettings
  amplifier: { name: string; brand: string }
}

const AMP_KNOB_LABELS: Record<keyof AmpSettings, string> = {
  bass: 'Bass',
  middle: 'Middle',
  treble: 'Treble',
  presence: 'Presence',
  gain: 'Gain',
  master: 'Master',
}

const AMP_KNOB_ORDER: (keyof AmpSettings)[] = ['bass', 'middle', 'treble', 'presence', 'gain', 'master']

export default function AmpPanel({ amp, amplifier }: AmpPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">앰프 세팅</h3>
        <p className="text-xs text-slate-400 mt-0.5">{amplifier.brand} {amplifier.name}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {AMP_KNOB_ORDER.map(key => (
          <KnobControl
            key={key}
            value={amp[key]}
            label={AMP_KNOB_LABELS[key]}
            color="#6366f1"
          />
        ))}
      </div>
    </div>
  )
}
