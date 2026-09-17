import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile, readdir } from 'node:fs/promises'
import { MATERIAL_COMPONENTS, MATERIAL_BY_COMPONENT, calculateMaterialBuildMetrics } from './data/materials.js'
import { MISSION_OPTIONS } from './data/missions.js'
import { pickEvents, resolveInitialGameStatus, resolveMissionEnvironment, evaluateResult } from './modules/M4/gameData.js'

test('all material combinations produce bounded local game metrics without a server', () => {
  let combinations = [{}]
  for (const part of MATERIAL_COMPONENTS) {
    combinations = combinations.flatMap((selection) => Object.keys(MATERIAL_BY_COMPONENT[part])
      .map((option) => ({ ...selection, [part]: option })))
  }
  assert.equal(combinations.length, 81)
  for (const selection of combinations) {
    const metrics = calculateMaterialBuildMetrics(selection, resolveInitialGameStatus(null, 40))
    assert.ok(metrics.fuel >= 0 && metrics.fuel <= 100)
    assert.ok(metrics.armor >= 0 && metrics.armor <= 100)
    assert.equal(Object.keys(metrics.reentry_profiles).length, 4)
  }
})

test('each mission supplies six playable local events and an evaluable result', () => {
  for (const mission of MISSION_OPTIONS) {
    assert.equal(resolveMissionEnvironment(mission).missionId, mission.mission_id)
    const events = pickEvents(0, [], 6, mission)
    assert.equal(events.length, 6)
    let status = resolveInitialGameStatus(null, 0)
    for (const event of events) {
      const option = event.options.find((item) => item.outcome === 'correct')
      assert.ok(option)
      for (const [metric, delta] of [['armor', 'armorDelta'], ['fuel', 'fuelDelta'], ['missionProgress', 'missionDelta']]) {
        status[metric] = Math.max(0, Math.min(100, status[metric] + (option[delta] || 0)))
      }
    }
    assert.ok(['success', 'failure'].includes(evaluateResult({ ...status, totalRounds: 6 })))
  }
})

test('legacy storage drops personal information and AI state while retaining game choices', async () => {
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
  globalThis.window = { localStorage: globalThis.localStorage, sessionStorage: globalThis.localStorage }
  const { default: useAppStore } = await import('./store/useAppStore.js')
  const options = useAppStore.persist.getOptions()
  const legacy = { language: 'en', materials: { frame: 'titanium' }, user: { name: 'TEST', city: 'TEST' }, storyId: 'old', storyChapters: { opening: 'old AI text' }, publicGameState: {}, aiTimeline: [] }
  const migrated = options.migrate(legacy)
  assert.deepEqual(migrated, { language: 'en', materials: { frame: 'titanium' } })
  const merged = options.merge(legacy, useAppStore.getState())
  for (const key of ['user', 'storyId', 'storyChapters', 'publicGameState', 'aiTimeline']) {
    assert.equal(key in merged, false)
    assert.equal(key in options.partialize(merged), false)
  }
})

test('runtime source has no AI transport or personal input fields', async () => {
  const entries = await readdir(new URL('.', import.meta.url), { recursive: true, withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('._') || !/\.(jsx|js)$/.test(entry.name)) continue
    const source = await readFile(`${entry.parentPath}/${entry.name}`, 'utf8')
    assert.doesNotMatch(source, /services\/ai|functions\/_story|\/api\/(?:stories|gpt|test-gpt)|api\.openai\.com|AIStoryRail|IdentityDossier/, entry.name)
    assert.doesNotMatch(source, /<textarea\b|<input[^>]*type=["'](?:text|email|date|datetime-local)["']/, entry.name)
  }
})
