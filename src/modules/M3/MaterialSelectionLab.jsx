import { GLBSatelliteModel } from '../M1/SatelliteModel'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Layers3 } from 'lucide-react'
import useI18n from '../../i18n/useI18n'
import { CanvasErrorBoundary, PARTS, PART_ACCENT } from './SceneMaterial'
import './material-selection-lab.css'

const TRADEOFF_META = {
  very_low: { label: '很低', labelEn: 'VERY LOW', level: 1 },
  low: { label: '低', labelEn: 'LOW', level: 1 },
  medium: { label: '中', labelEn: 'MEDIUM', level: 2 },
  high: { label: '高', labelEn: 'HIGH', level: 3 },
}

export default function MaterialSelectionLab() {
  const { language, pick } = useI18n()
  const [activeIndex, setActiveIndex] = useState(0)
  const [modelVisible, setModelVisible] = useState(false)
  const modelRef = useRef(null)
  const activePart = PARTS[activeIndex]
  useEffect(() => {
    const element = modelRef.current
    if (!element || !('IntersectionObserver' in window)) {
      setModelVisible(true)
      return undefined
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setModelVisible(true)
      observer.disconnect()
    }, { rootMargin: '160px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  function handleTabKeyDown(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % PARTS.length
      : event.key === 'ArrowLeft' ? (index + PARTS.length - 1) % PARTS.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? PARTS.length - 1 : null
    if (next === null) return
    event.preventDefault()
    setActiveIndex(next)
    event.currentTarget.parentElement.children[next].focus()
  }


  return (
    <section className="m3-material-lab">
      <header className="m3-material-heading">
        <span>02 · SATELLITE MATERIALS</span>
        <h3>{pick('卫星由哪些材料构成？', 'What are satellites made of?')}</h3>
        <p>{pick('不同材料会改变卫星的重量和耐受能力。了解四个主要结构的常见材料，比较它们的特点与工程取舍。', 'Different materials change the satellite’s mass and structural resilience. Explore common materials for four major components and compare their characteristics and engineering tradeoffs.')}</p>
      </header>
      <div className="m3-material-workspace">
        <aside className="m3-material-model-panel">
          <div ref={modelRef} className="m3-material-model" role="img" aria-label={pick(activePart.label, activePart.labelEn)}>
            {modelVisible && (
              <CanvasErrorBoundary fallback={<p>{pick('卫星模型暂时无法显示', 'Satellite model unavailable')}</p>}>
                <Suspense fallback={<p>{pick('正在加载卫星模型…', 'Loading satellite model…')}</p>}>
                  <GLBSatelliteModel accent={PART_ACCENT[activePart.id]} activePart={activePart.id} />
                </Suspense>
              </CanvasErrorBoundary>
            )}
          </div>
          <p>{pick(activePart.desc, activePart.descEn)}</p>
        </aside>
        <div className="m3-material-cards">
        <div className="m3-material-tabs" role="tablist" aria-label={pick('浏览卫星结构', 'Explore material types')}>
          {PARTS.map((part, index) => (
            <button key={part.id} type="button" role="tab" id={'material-tab-' + part.id}
              aria-controls={'material-panel-' + part.id} aria-selected={activeIndex === index}
              tabIndex={activeIndex === index ? 0 : -1}
              onClick={() => setActiveIndex(index)} onKeyDown={(event) => handleTabKeyDown(event, index)}>
              <small>{String(index + 1).padStart(2, '0')}</small>{pick(part.label, part.labelEn)}
            </button>
          ))}
        </div>
        {PARTS.map((part, index) => (
          <article className="m3-material-info-card" key={part.id} role="tabpanel" id={'material-panel-' + part.id} aria-labelledby={'material-tab-' + part.id} hidden={activeIndex !== index} tabIndex={0}>
            <header>
              <span className="m3-material-kicker"><Layers3 size={16} aria-hidden="true" /> {String(index + 1).padStart(2, '0')} / 04 · {part.labelEn}</span>
              <h4>{pick(part.label, part.labelEn)}</h4>
              <p>{pick(part.desc, part.descEn)}</p>
            </header>
            <div className="m3-material-list">
              {part.options.map((option) => (
                <section className="m3-material-info-item" key={option.id}>
                  <div>
                    {language === 'zh' && <small>{option.en}</small>}
                    <h5>{pick(option.label, option.en)}</h5>
                    <p>{pick(option.shortFeature ?? option.feature, option.shortFeatureEn ?? option.featureEn)}</p>
                  </div>
                  <dl>
                    <div><dt>{pick('质量负担', 'Mass burden')}</dt><dd>{pick(TRADEOFF_META[option.massBurden].label, TRADEOFF_META[option.massBurden].labelEn)}</dd></div>
                    <div><dt>{pick('结构耐受', 'Structural resilience')}</dt><dd>{pick(TRADEOFF_META[option.resilience].label, TRADEOFF_META[option.resilience].labelEn)}</dd></div>
                  </dl>
                </section>
              ))}
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  )
}
