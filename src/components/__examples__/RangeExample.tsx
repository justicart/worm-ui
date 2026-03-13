import { useState } from 'react'
import { Range } from '../Range'

export function RangeExample() {
  const [defaultValue, setDefaultValue] = useState(56)
  const [steppedValue, setSteppedValue] = useState(0.4)
  const [inputValue, setInputValue] = useState(56)
  const disabledValue = 72
  const decimalDataset = Array.from({ length: 11 }, (_, index) => index / 10)
  const dataset = Array.from({ length: 11 }, (_, index) => index * 10)

  return (
    <>
      <header className="hero-card">
        <div>
          <p className="eyebrow">Inputs / Range</p>
          <h2>Contour Range</h2>
        </div>
        <p className="hero-card__copy">
          A horizontal range control inspired by a tensioned line. The active handle picks up color only
          during focus and drag, keeping the resting state restrained.
        </p>
      </header>

      <section className="demo-grid">
        <article className="panel panel--showcase">
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Live Demo</p>
              <h3>Variants</h3>
            </div>
            <output className="value-pill" aria-live="polite">
              {inputValue}
            </output>
          </div>

          <div className="slider-showcase-grid">
            <div className="slider-variant">
              <span className="slider-variant__label">Default, 0-100</span>
              <div className="slider-stage">
                <Range
                  ariaLabel="Contour range demo without manual input"
                  label="Volume"
                  max={100}
                  min={0}
                  onChange={setDefaultValue}
                  value={defaultValue}
                />
              </div>
            </div>

            <div className="slider-variant">
              <span className="slider-variant__label">Step With Ticks, 0-1</span>
              <div className="slider-stage">
                <Range
                  ariaLabel="Contour stepped range demo"
                  dataset={decimalDataset}
                  label="Volume"
                  max={1}
                  min={0}
                  onChange={setSteppedValue}
                  step={0.1}
                  value={steppedValue}
                />
              </div>
            </div>

            <div className="slider-variant">
              <span className="slider-variant__label">Input With Ticks, 0-100</span>
              <div className="slider-stage">
                <Range
                  ariaLabel="Contour range demo"
                  dataset={dataset}
                  label="Volume"
                  max={100}
                  min={0}
                  onChange={setInputValue}
                  showInput
                  value={inputValue}
                />
              </div>
            </div>

            <div className="slider-variant">
              <span className="slider-variant__label">Input With Ticks, Disabled</span>
              <div className="slider-stage">
                <Range
                  ariaLabel="Disabled contour range demo"
                  dataset={dataset}
                  disabled
                  label="Volume"
                  max={100}
                  min={0}
                  showInput
                  value={disabledValue}
                />
              </div>
            </div>
          </div>

          <div className="spec-grid">
            <div>
              <span className="spec-grid__label">Keyboard</span>
              <p>Arrow keys use the configured step, Shift and Page keys jump by a larger range-aware amount, and Home/End jump to bounds.</p>
            </div>
            <div>
              <span className="spec-grid__label">Behavior</span>
              <p>Track clicks animate, dragging stays direct, and disabled state locks track and input.</p>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Usage</p>
              <h3>React</h3>
            </div>
          </div>

          <pre className="code-block">
            <code>{`const tickDataset = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const decimalTickDataset = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

<Range
  ariaLabel="Default contour range"
  label="Volume"
  min={0}
  max={100}
  value={56}
  onChange={setValue}
/>

<Range
  ariaLabel="Stepped contour range"
  dataset={decimalTickDataset}
  label="Volume"
  min={0}
  max={1}
  step={0.1}
  value={0.4}
  onChange={setStepValue}
/>

<Range
  ariaLabel="Contour range with input"
  dataset={tickDataset}
  label="Volume"
  min={0}
  max={100}
  showInput
  value={56}
  onChange={setInputValue}
/>

<Range
  ariaLabel="Disabled contour range with input"
  dataset={tickDataset}
  label="Volume"
  min={0}
  max={100}
  showInput
  value={72}
  disabled
/>`}</code>
          </pre>
        </article>
      </section>
    </>
  )
}
