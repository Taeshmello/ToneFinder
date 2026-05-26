package com.tonefinder.config

import com.tonefinder.entity.Amplifier
import com.tonefinder.entity.Effector
import com.tonefinder.repository.AmplifierRepository
import com.tonefinder.repository.EffectorRepository
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.stereotype.Component

@Component
class DataInitializer(
    private val effectorRepository: EffectorRepository,
    private val amplifierRepository: AmplifierRepository,
) : ApplicationRunner {

    override fun run(args: ApplicationArguments) {
        if (effectorRepository.count() == 0L) {
            effectorRepository.saveAll(listOf(
                Effector(name = "DS-1", brand = "Boss", type = "Distortion", knobsJson = """["Tone","Level","Dist"]"""),
                Effector(name = "Tube Screamer TS-9", brand = "Ibanez", type = "Overdrive", knobsJson = """["Drive","Tone","Level"]"""),
                Effector(name = "DD-7", brand = "Boss", type = "Delay", knobsJson = """["E.Level","F.Back","D.Time"]"""),
                Effector(name = "Big Muff Pi", brand = "Electro-Harmonix", type = "Fuzz", knobsJson = """["Volume","Tone","Sustain"]"""),
                Effector(name = "Phase 90", brand = "MXR", type = "Modulation", knobsJson = """["Speed"]"""),
                Effector(name = "RV-6", brand = "Boss", type = "Reverb", knobsJson = """["E.Level","Tone","Time"]"""),
            ))
        }
        if (amplifierRepository.count() == 0L) {
            amplifierRepository.saveAll(listOf(
                Amplifier(name = "JCM800", brand = "Marshall"),
                Amplifier(name = "Twin Reverb", brand = "Fender"),
                Amplifier(name = "Dual Rectifier", brand = "Mesa Boogie"),
            ))
        }
    }
}
