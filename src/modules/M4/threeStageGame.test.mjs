import assert from 'node:assert/strict'
import test from 'node:test'
import { pickEvents, localizeThreatEvent, evaluateResult, resolveInitialGameStatus } from './gameData.js'
import { MATERIAL_COMPONENTS, MATERIAL_BY_COMPONENT, calculateMaterialBuildMetrics } from '../../data/materials.js'

function play(choices, initial = resolveInitialGameStatus(null, 0)) {
  const status = { ...initial }
  pickEvents().forEach((event, index) => {
    const option = event.options[choices[index]]
    for (const [metric, delta] of [['armor', 'armorDelta'], ['fuel', 'fuelDelta'], ['missionProgress', 'missionDelta']]) {
      status[metric] = Math.max(0, Math.min(100, status[metric] + option[delta]))
    }
  })
  return { ...status, disposalPlanned: choices[2] !== 2 }
}

test('all 27 decision paths remain bounded and delaying disposal never succeeds', () => {
  const outcomes = new Set()
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    const status = play([a, b, c])
    for (const metric of ['armor', 'fuel', 'missionProgress']) assert.ok(status[metric] >= 0 && status[metric] <= 100)
    const result = evaluateResult(status)
    outcomes.add(result)
    if (c === 2) assert.equal(result, 'failure')
  }
  assert.equal(outcomes.size, 2)
  assert.equal(evaluateResult(play([0, 0, 0])), 'success')
  assert.equal(evaluateResult(play([0, 0, 1])), 'success')
  assert.equal(evaluateResult(play([2, 2, 0])), 'success')
  assert.equal(evaluateResult(play([2, 2, 0], { fuel: 100, armor: 75, missionProgress: 0 })), 'failure')
})

test('safe route remains achievable for all 81 material builds at baseline damage', () => {
  let builds = [{}]
  for (const part of MATERIAL_COMPONENTS) builds = builds.flatMap((build) => Object.keys(MATERIAL_BY_COMPONENT[part]).map((choice) => ({ ...build, [part]: choice })))
  for (const build of builds) {
    const base = resolveInitialGameStatus(null, 0)
    const metrics = calculateMaterialBuildMetrics(build, base)
    assert.equal(evaluateResult(play([0, 0, 0], { ...base, fuel: metrics.fuel, armor: metrics.armor })), 'success', JSON.stringify(build))
  }
})

test('English translation retains three complete choices and identical consequences', () => {
  const events = pickEvents()
  assert.equal(events.length, 3)
  for (const event of events) {
    const english = localizeThreatEvent(event, 'en')
    assert.equal(english.options.length, 3)
    assert.doesNotMatch(english.title + english.description + english.realRef, /[\u4e00-\u9fff]/)
    english.options.forEach((option, index) => {
      assert.doesNotMatch(option.label + option.subtext + option.techNote, /[\u4e00-\u9fff]/)
      for (const key of ['fuelDelta', 'armorDelta', 'missionDelta', 'outcome']) assert.equal(option[key], event.options[index][key])
    })
  }
})

test('each completion requirement is enforced independently', () => {
  const good = { armor: 25, fuel: 18, missionProgress: 60, disposalPlanned: true }
  assert.equal(evaluateResult(good), 'success')
  for (const [key, value] of [['armor', 24], ['fuel', 17], ['missionProgress', 59], ['disposalPlanned', false]]) {
    assert.equal(evaluateResult({ ...good, [key]: value }), 'failure')
  }
})
