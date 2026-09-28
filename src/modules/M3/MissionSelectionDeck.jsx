import { useState } from 'react'
import { CloudSun, Orbit, RadioTower, ScanLine, Telescope } from 'lucide-react'
import useI18n from '../../i18n/useI18n'
import './mission-selection-deck.css'

const MISSION_ICONS = {
  weather_monitoring: CloudSun,
  communications_relay: RadioTower,
  earth_observation: ScanLine,
  space_science_observation: Telescope,
}

function MissionCardContent({ mission }) {
  const { language, pick } = useI18n()
  const MissionIcon = MISSION_ICONS[mission.id] ?? Orbit

  return (
    <>
      <div className="m3-mission-card-heading">
        <span className="m3-mission-card-icon"><MissionIcon size={24} strokeWidth={1.35} /></span>
        <span>
          <small>{mission.label_en}</small>
          <h4>{language === 'en' ? mission.label_en : mission.label}</h4>
        </span>
      </div>

      <div className="m3-mission-card-copy">
        <span>
          <small>{pick('任务目标', 'Objective')}</small>
          <p>{pick(mission.objective, mission.objective_en)}</p>
        </span>
        <span>
          <small>{pick('如何工作', 'How it works')}</small>
          <p>{pick(mission.operation, mission.operation_en)}</p>
        </span>
      </div>

      <div className="m3-mission-card-data">
        <span>
          <small>{pick('目标轨道', 'Target orbit')}</small>
          <b>{pick(mission.orbit_profile.label, mission.orbit_profile.label_en)} · {pick(mission.orbit_profile.altitude_label, mission.orbit_profile.altitude_label_en)}</b>
        </span>
        <span><small>{pick('典型任务 / 卫星', 'Examples')}</small><b>{pick(mission.examples, mission.examples_en)}</b></span>
      </div>

      <div className="m3-mission-card-effect">
        <small>{pick('任务影响', 'Mission effect')}</small>
        <p>{pick(mission.mission_effect, mission.mission_effect_en)}</p>
      </div>
    </>
  )
}

export default function MissionSelectionDeck({ missions }) {
  const { pick } = useI18n()
  const [activeIndex, setActiveIndex] = useState(0)
  function handleTabKeyDown(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % missions.length
      : event.key === 'ArrowLeft' ? (index + missions.length - 1) % missions.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? missions.length - 1 : null
    if (next === null) return
    event.preventDefault()
    setActiveIndex(next)
    event.currentTarget.parentElement.children[next].focus()
  }


  return (
    <section className="m3-mission-deck">
      <header className="m3-mission-heading">
        <span>{pick('03 · 卫星任务', '03 · SATELLITE MISSIONS')}</span>
        <h3>{pick('卫星能做些什么？', 'What can satellites do?')}</h3>
        <p>{pick('每颗卫星都有自己的任务，而任务决定它需要去哪里、如何运行。从天气预报到通信连接，从地表变化到空间探索，了解四类典型卫星任务。', 'Every satellite is built for a specific purpose, which shapes its orbit and operation. Explore four typical missions, from weather forecasts and communications to Earth observation and space science.')}</p>
      </header>
      <div className="m3-mission-console">
        <div className="m3-mission-deck-head">
          <span><Orbit size={15} strokeWidth={1.4} /> SATELLITE MISSIONS</span>
          <span>{pick('四类典型任务', 'FOUR MISSION TYPES')}</span>
        </div>
        <div className="m3-mission-tabs" role="tablist" aria-label={pick('浏览卫星任务', 'Explore mission types')}>
          {missions.map((mission, index) => (
            <button key={mission.id} type="button" role="tab" id={'mission-tab-' + mission.id}
              aria-controls={'mission-panel-' + mission.id} aria-selected={activeIndex === index}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setActiveIndex(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>
              <small>{String(index + 1).padStart(2, '0')}</small>{pick(mission.label, mission.label_en)}
            </button>
          ))}
        </div>
        {missions.map((mission, index) => (
          <article key={mission.id} className="m3-mission-card" role="tabpanel" id={'mission-panel-' + mission.id} aria-labelledby={'mission-tab-' + mission.id} hidden={activeIndex !== index} tabIndex={0}>
            <MissionCardContent mission={mission} />
          </article>
        ))}
      </div>
    </section>
  )
}
