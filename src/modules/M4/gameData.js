import { getMission } from '../../data/missions.js'

export const THREAT_TYPES = {
  DEBRIS_APPROACH: 'debris_approach',
  SOLAR_STORM: 'solar_storm',
  ORBITAL_DECAY: 'orbital_decay',
  CASCADE_FRAGMENT: 'cascade_fragment',
  FUEL_LEAK: 'fuel_leak',
}

function missionOrbitProfile(missionState) {
  if (missionState?.orbit_profile) return missionState.orbit_profile
  const configured = getMission(missionState?.mission_id || missionState?.action_id)
  return configured?.orbit_profile || null
}

export function resolveMissionEnvironment(missionState, satellite = {}) {
  const configured = getMission(missionState?.mission_id || missionState?.action_id)
  const profile = missionOrbitProfile(missionState)

  if (profile) {
    return {
      missionId: missionState?.mission_id || configured?.mission_id || null,
      missionLabel: missionState?.label || configured?.label || '卫星任务',
      missionLabelEn: missionState?.label_en || configured?.label_en || 'Satellite Mission',
      missionEffect: missionState?.mission_effect || configured?.mission_effect || profile.environment,
      missionEffectEn: missionState?.mission_effect_en || configured?.mission_effect_en || profile.environment_en,
      orbitProfileId: profile.profile_id,
      orbitFamily: profile.orbit_family,
      orbitLabel: profile.label,
      orbitLabelEn: profile.label_en,
      altitudeKm: profile.altitude_km,
      altitudeLabel: profile.altitude_label,
      altitudeLabelEn: profile.altitude_label_en,
      inclinationDeg: profile.inclination_deg,
      eventWeightBias: { ...(profile.event_weight_bias || {}) },
    }
  }

  const parsedAltitude = Number(satellite?.altitudeKm)
  const altitudeKm = Number.isFinite(parsedAltitude) ? parsedAltitude : 836
  const parsedInclination = Number(satellite?.inclination)
  const inclinationDeg = Number.isFinite(parsedInclination) ? parsedInclination : 98.7
  const orbitFamily = altitudeKm >= 30000 ? 'GEO' : altitudeKm >= 2000 ? 'MEO' : 'LEO'
  const fallbackLabels = {
    LEO: ['低地球轨道（LEO）', 'Low Earth Orbit (LEO)'],
    MEO: ['中地球轨道（MEO）', 'Medium Earth Orbit (MEO)'],
    GEO: ['地球静止轨道（GEO）', 'Geostationary Orbit (GEO)'],
  }
  const [orbitLabel, orbitLabelEn] = fallbackLabels[orbitFamily]

  return {
    missionId: null,
    missionLabel: '卫星任务',
    missionLabelEn: 'Satellite Mission',
    missionEffect: '进入既定轨道环境执行任务。',
    missionEffectEn: 'Operates in the assigned orbital environment.',
    orbitProfileId: `legacy_${orbitFamily.toLowerCase()}`,
    orbitFamily,
    orbitLabel,
    orbitLabelEn,
    altitudeKm,
    altitudeLabel: `约 ${altitudeKm.toLocaleString('en-US')} km`,
    altitudeLabelEn: `Approx. ${altitudeKm.toLocaleString('en-US')} km`,
    inclinationDeg,
    eventWeightBias: {},
  }
}

export const THREAT_EVENTS = [
  {
    "id": "debris_close",
    "type": "debris_approach",
    "title": "交会预警：何时行动？",
    "description": "第 1 月，一块已追踪碎片将在 6 小时后接近卫星。连续两轮测量仍超过本任务的风险阈值；下一次更新要等 4 小时，而可靠的机动窗口将在 3 小时后关闭。此时卫星正执行一段无法补拍的观测任务。你必须在数据完整性与避险余量之间作出决定。",
    "realRef": "决策依据：先比较信息更新时间与机动截止时间。护甲无法替代轨道规避；下列资源变化仅为教学模拟，不代表真实概率。",
    "options": [
      {
        "id": "avoidance_burn",
        "label": "中断观测，提前规避",
        "subtext": "现在执行小幅机动并复核新轨道。损失部分观测数据，但为后续校正留出时间。",
        "outcome": "correct",
        "armorDelta": 0,
        "fuelDelta": -16,
        "missionDelta": 24,
        "techNote": "提前行动保住了机动窗口。模拟中未发生撞击，但观测中断使本阶段只完成 24 点任务进度。后续仍需持续跟踪，不能把一次机动视为永久安全。"
      },
      {
        "id": "wait_tracking",
        "label": "保留观测，等下一轮定轨",
        "subtext": "争取更可靠的数据后再应对，但更新晚于可靠机动窗口；届时只能紧急处置。",
        "outcome": "partial",
        "armorDelta": -10,
        "fuelDelta": -26,
        "missionDelta": 32,
        "techNote": "新的定轨结果仍有风险，紧急修正消耗了更多燃料；模拟中一处外部部件受损。等待信息并非总是错误，但必须先确认等待不会耗尽处置时间。"
      },
      {
        "id": "hold_course",
        "label": "保持计划，依靠现有防护",
        "subtext": "完整保留本轮观测和燃料，但接受持续超阈值的交会风险。",
        "outcome": "wrong",
        "armorDelta": -38,
        "fuelDelta": 0,
        "missionDelta": 38,
        "techNote": "本次模拟中碎片损伤了防护结构。你保住了数据与燃料，却降低了后续容错能力；任务收益不能抵消已确认的交会风险。"
      }
    ]
  },
  {
    "id": "cascade_fragment",
    "type": "cascade_fragment",
    "title": "连续危机：有限资源先保什么？",
    "description": "第 6 月，新一轮碎片预警到来，同时推进剂压力出现异常下降。备用管路可以隔离故障，但需要暂时关闭观测载荷；不处理故障就连续点火可能扩大泄漏。上一关剩下的燃料和护甲将直接影响你能承受的代价。",
    "realRef": "决策依据：先控制故障，再确定必要机动。任务可以暂时降级，但推进与控制能力还必须支撑末期处置。",
    "options": [
      {
        "id": "isolate_valve",
        "label": "隔离故障，再执行必要规避",
        "subtext": "暂停载荷、切换备用管路，再进行一次校核后的规避。观测覆盖下降，燃料损失可控。",
        "outcome": "correct",
        "armorDelta": 0,
        "fuelDelta": -18,
        "missionDelta": 24,
        "techNote": "故障隔离阻止了进一步泄漏，随后只执行必要机动。本阶段进度较少，但护甲和剩余燃料得以保存；安全运行有时意味着主动降低服务水平。"
      },
      {
        "id": "emergency_burn",
        "label": "先连续规避，随后检修",
        "subtext": "优先完成观测并立即机动，争取数据连续性；让异常推进系统承担更高负荷。",
        "outcome": "partial",
        "armorDelta": -12,
        "fuelDelta": -34,
        "missionDelta": 34,
        "techNote": "避开了主要预警，但故障期间的连续点火扩大了燃料损失和设备负担。短期数据更多，留给任务末期的选择却更少。"
      },
      {
        "id": "shield_only",
        "label": "停用推进，维持载荷工作",
        "subtext": "避免点火带来的泄漏加剧，暂时保住燃料；不执行规避，仅调整姿态并依靠防护。",
        "outcome": "wrong",
        "armorDelta": -36,
        "fuelDelta": -8,
        "missionDelta": 38,
        "techNote": "关闭推进减少了泄漏，却没有消除交会风险。模拟中的外部撞击继续消耗护甲；调整姿态与防护层不能替代对已追踪危险目标的规避。"
      }
    ]
  },
  {
    "id": "end_of_life",
    "type": "orbital_decay",
    "title": "最后的预算：完成任务，也负责善后",
    "description": "第 12 月，地面团队仍希望增加一轮观测，但每次延长运行都要消耗姿控燃料。现在可以结束服务、先缩减任务再退出，或者把资源投入延寿。请结合当前燃料与护甲作决定：本模拟要求处置准备后至少保留 18 点燃料、25 点护甲，并获得 60 点任务进度。",
    "realRef": "末期安排：低轨任务准备离轨；高轨任务准备离开工作轨道。这里扣除的是处置准备成本，剩余燃料用于后续演示中的退出操作。",
    "options": [
      {
        "id": "controlled_disposal",
        "label": "结束服务，锁定处置储备",
        "subtext": "停止新增观测，完成数据下传、轨道复核与退出准备，将剩余燃料专用于善后。",
        "outcome": "correct",
        "armorDelta": 0,
        "fuelDelta": -12,
        "missionDelta": 24,
        "techNote": "结束服务避免了继续透支资源。是否成功仍取决于前两关留下的状态；做出负责任的末期选择，不能凭空恢复此前损失的燃料和护甲。"
      },
      {
        "id": "graveyard_plan",
        "label": "缩减最后一轮任务，再退出",
        "subtext": "只保留优先级最高的观测并安排退出。获得更多数据，但准备后仍须满足资源储备线。",
        "outcome": "partial",
        "armorDelta": -4,
        "fuelDelta": -22,
        "missionDelta": 32,
        "techNote": "折中方案增加了数据收益，也压缩了善后余量。如果当前资源充足，这条路线仍可成功；如果早期消耗过多，就应该更早结束服务。"
      },
      {
        "id": "extend_mission",
        "label": "延长服务，推迟退出安排",
        "subtext": "将剩余预算用于额外观测，不为本轮任务落实退出计划。眼前收益最高，长期风险留下。",
        "outcome": "wrong",
        "armorDelta": -12,
        "fuelDelta": -32,
        "missionDelta": 40,
        "techNote": "额外数据不等于完整成功。即使燃料和护甲仍有剩余，没有落实退出计划也不满足本任务的成功条件；失效后再处置通常会更困难。"
      }
    ]
  }
]

const THREAT_EVENT_EN = {
  "debris_close": {
    "title": "Conjunction warning: when to act?",
    "description": "Month 1: a tracked fragment will approach in six hours. Two tracking updates still exceed this mission’s risk threshold. New measurements arrive in four hours, but the reliable maneuver window closes in three. An observation that cannot be repeated is under way. Balance data continuity against time to respond.",
    "realRef": "Decision context: compare the next tracking update with the maneuver deadline. Armor does not replace avoidance. Resource changes below are teaching simulations, not real probabilities.",
    "options": {
      "avoidance_burn": [
        "Interrupt observations and maneuver",
        "Make a small maneuver now and verify the new trajectory. Lose some observations while retaining time for corrections.",
        "Acting early preserves the maneuver window. No impact occurs in this simulation, but interrupted observations limit this stage to 24 progress points. Tracking must continue after the burn."
      ],
      "wait_tracking": [
        "Finish observing and wait for tracking",
        "Obtain better tracking data, but only after the reliable maneuver window closes. A late response will be more costly.",
        "The update still indicates risk. A late correction uses more fuel and an external component is damaged in this simulation. Waiting can be useful only when enough response time remains."
      ],
      "hold_course": [
        "Stay on schedule and rely on shielding",
        "Keep this observation and save fuel while accepting the unresolved conjunction risk.",
        "In this simulation a fragment damages protective structures. You retain data and fuel but lose resilience for the next event. Mission output does not cancel a confirmed conjunction risk."
      ]
    }
  },
  "cascade_fragment": {
    "title": "Compounding hazards: what comes first?",
    "description": "Month 6: another debris warning arrives as propellant pressure starts falling. A backup line can isolate the fault, but observations must pause. Repeated burns before isolation may worsen the leak. Fuel and armor remaining from the first decision determine your margin.",
    "realRef": "Decision context: contain the fault before scheduling essential maneuvers. Temporarily reduced service can preserve propulsion and control for end-of-life disposal.",
    "options": {
      "isolate_valve": [
        "Isolate the fault, then avoid the threat",
        "Pause the payload, switch to the backup line, then perform one verified maneuver. Reduce coverage while containing fuel loss.",
        "Isolation stops further leakage before the essential burn. Progress is lower, but armor and remaining fuel are preserved. Safe operation sometimes requires reduced service."
      ],
      "emergency_burn": [
        "Maneuver repeatedly before repairs",
        "Prioritize continuous data and maneuver immediately, placing extra load on the faulty propulsion system.",
        "The main conjunction is avoided, but repeated burns during the fault increase fuel loss and equipment strain. More data now leaves fewer choices at mission end."
      ],
      "shield_only": [
        "Disable propulsion and keep observing",
        "Avoid burn-related leakage and retain fuel for now. Change attitude and rely on protection without orbital avoidance.",
        "Disabling propulsion limits leakage but leaves the conjunction unresolved. Simulated impacts further reduce armor. Attitude changes and shielding do not replace avoidance of a tracked hazard."
      ]
    }
  },
  "end_of_life": {
    "title": "The final budget: finish responsibly",
    "description": "Month 12: the ground team requests one more observation cycle, but continued attitude control consumes fuel. End service now, reduce the final campaign, or extend operations. In this simulation, success requires a disposal plan, at least 18 fuel and 25 armor after preparation, and 60 mission progress.",
    "realRef": "End-of-life planning: prepare to leave the operational orbit. Deductions here cover preparation; remaining fuel is reserved for the subsequent disposal demonstration.",
    "options": {
      "controlled_disposal": [
        "End service and reserve disposal resources",
        "Stop new observations, downlink data, verify the orbit, and prepare disposal. Reserve remaining fuel for leaving service.",
        "Ending service avoids further resource depletion. Success still depends on earlier decisions: responsible planning cannot restore fuel or armor already lost."
      ],
      "graveyard_plan": [
        "Reduce the final campaign, then withdraw",
        "Keep only the highest-priority observations and schedule disposal. Gain more data, provided the remaining reserve meets the requirement.",
        "This compromise gains data while narrowing the disposal margin. It can succeed with sufficient resources; heavy earlier losses make prompt retirement the better choice."
      ],
      "extend_mission": [
        "Extend service and postpone disposal",
        "Spend the remaining operational budget on extra observations without committing to disposal. Maximize immediate output and leave long-term risk unresolved.",
        "Extra data alone is not success. Even with fuel and armor remaining, the missing disposal plan fails this mission’s objective. Disposal becomes harder after loss of control."
      ]
    }
  }
}

export function localizeThreatEvent(event, language = 'zh') {
  if (!event || language !== 'en') return event
  const translation = THREAT_EVENT_EN[event.id]
  if (!translation) return event

  return {
    ...event,
    title: translation.title,
    description: translation.description,
    realRef: event.disposalContextEn || translation.realRef,
    options: event.options.map((item) => {
      const optionTranslation = translation.options[item.id]
      if (!optionTranslation) return item
      return {
        ...item,
        label: optionTranslation[0],
        subtext: optionTranslation[1],
        techNote: optionTranslation[2],
      }
    }),
  }
}

export function pickEvents(_damageLevel = 0, _clickedEvents = [], count = 3, missionState = null) {
  const orbitFamily = missionOrbitProfile(missionState)?.orbit_family || 'LEO'
  return THREAT_EVENTS.slice(0, Math.min(count, 3)).map((event) => event.id !== 'end_of_life' ? event : {
    ...event,
    realRef: orbitFamily === 'GEO'
      ? '末期安排：本任务在地球静止轨道，应准备转入适当的弃置轨道并钝化。此处扣除准备成本，保留的燃料用于后续退出。'
      : orbitFamily === 'MEO'
        ? '末期安排：本任务在中轨，应依据轨道寿命与运行区安排合适的处置轨道并钝化。此处扣除准备成本，保留燃料用于退出。'
        : '末期安排：本任务在低轨，应准备离轨并降低长期遗留风险。此处扣除准备成本，保留的燃料用于后续退出。',
    disposalContextEn: orbitFamily === 'GEO'
      ? 'GEO mission: prepare a suitable graveyard orbit and passivation. Costs cover preparation; reserve fuel for the later transfer.'
      : orbitFamily === 'MEO'
        ? 'MEO mission: choose an appropriate disposal orbit based on orbital lifetime and operational regions, then passivate. Reserve fuel for the transfer.'
        : 'LEO mission: prepare deorbit to reduce long-term orbital residue. Costs cover preparation; reserve fuel for the later maneuver.',
  })
}

export function calcInitialArmor(damageLevel = 0) {
  const value = 100 - Number(damageLevel || 0) * 0.7
  return Math.max(45, Math.min(100, Math.round(value)))
}

export function resolveInitialGameStatus(technicalMetrics, damageLevel = 0) {
  if (
    Number.isFinite(technicalMetrics?.fuel)
    && Number.isFinite(technicalMetrics?.armor)
    && Number.isFinite(technicalMetrics?.mission_progress)
  ) {
    return {
      fuel: technicalMetrics.fuel,
      armor: technicalMetrics.armor,
      missionProgress: technicalMetrics.mission_progress,
    }
  }

  return {
    fuel: 100,
    armor: calcInitialArmor(damageLevel),
    missionProgress: 0,
  }
}

export function evaluateResult({ armor, fuel, missionProgress, disposalPlanned = true }) {
  return disposalPlanned && armor >= 25 && fuel >= 18 && missionProgress >= 60 ? 'success' : 'failure'
}
