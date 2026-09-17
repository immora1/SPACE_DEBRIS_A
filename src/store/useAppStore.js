import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Remove obsolete queued requests and personal story sessions from this origin.
if (typeof window !== 'undefined') {
  try {
    window.sessionStorage.removeItem('space-debris-story-session')
    window.sessionStorage.removeItem('space-debris-story-queue')
  } catch { /* Storage may be unavailable in private browser contexts. */ }
}

const initialState = {
  language: 'zh',
  satellite: null,
  materials: { frame: null, solar: null, insulation: null, propulsion: null },
  mission: null,
  clickedHistoryEvents: [],
  damageLevel: 0,
  gameResult: null,
  debrisGenerated: [],
  preTest: null,
  postTest: null,
  currentModule: 'm1',
  unlockedModules: ['m1'],
  completedModules: [],
  scrollLocked: false,
}

const persistKeys = [
  'language',
  'satellite',
  'materials',
  'mission',
  'clickedHistoryEvents',
  'damageLevel',
  'gameResult',
  'debrisGenerated',
  'preTest',
  'postTest',
]

const useAppStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setLanguage: (language) => set({ language: language === 'en' ? 'en' : 'zh' }),
      setSatellite: (satellite) => set({ satellite }),
      setMaterialPart: (key, value) => set((state) => ({
        materials: { ...state.materials, [key]: value },
      })),
      setMission: (mission) => set({ mission }),
      setClickedHistoryEvents: (clickedHistoryEvents) => set({ clickedHistoryEvents }),
      setDamageLevel: (damageLevel) => set({ damageLevel }),
      setGameResult: (gameResult) => set({ gameResult }),
      setDebrisGenerated: (debrisGenerated) => set({ debrisGenerated }),
      setPreTest: (preTest) => set({ preTest }),
      setPostTest: (postTest) => set({ postTest }),
      setCurrentModule: (currentModule) => set({ currentModule }),
      setScrollLocked: (scrollLocked) => set({ scrollLocked }),

      unlockModule: (id) => set((state) => ({
        unlockedModules: state.unlockedModules.includes(id)
          ? state.unlockedModules
          : [...state.unlockedModules, id],
      })),
      completeModule: (id) => set((state) => ({
        completedModules: state.completedModules.includes(id)
          ? state.completedModules
          : [...state.completedModules, id],
      })),
      markModuleComplete: (id) => get().completeModule(id),
      reset: () => set((state) => ({ ...initialState, language: state.language })),
    }),
    {
      name: 'space-debris-state',
      version: 5,
      migrate: (state) => Object.fromEntries(persistKeys.filter((key) => key in state).map((key) => [key, state[key]])),
      merge: (saved, current) => ({ ...current, ...Object.fromEntries(persistKeys.filter((key) => key in (saved || {})).map((key) => [key, saved[key]])) }),
      partialize: (state) => Object.fromEntries(persistKeys.map((key) => [key, state[key]])),
    },
  ),
)

export default useAppStore
