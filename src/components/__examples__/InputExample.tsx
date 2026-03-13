import { useState } from 'react'
import { Input } from '../Input'

export function InputExample() {
  const [name, setName] = useState('Signal')
  const [quantity, setQuantity] = useState(12)

  return (
    <>
      <header className="hero-card">
        <div>
          <p className="eyebrow">Inputs / Input</p>
          <h2>Core Input</h2>
        </div>
        <p className="hero-card__copy">
          A minimal input primitive for text and number entry, styled to match the system and
          usable as a building block for more specific fields.
        </p>
      </header>

      <section className="demo-grid">
        <article className="panel panel--showcase">
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Live Demo</p>
              <h3>Text And Number</h3>
            </div>
          </div>

          <div className="input-example-grid">
            <label className="field-card">
              <span className="field-card__label">Project Name</span>
              <Input
                ariaLabel="Project name"
                className="input-demo"
                onCommit={(nextValue) => {
                  if (typeof nextValue === 'string') {
                    setName(nextValue)
                  }
                }}
                value={name}
              />
            </label>

            <label className="field-card">
              <span className="field-card__label">Seats</span>
              <Input
                ariaLabel="Seat count"
                className="input-demo"
                max={99}
                min={1}
                onCommit={(nextValue) => {
                  if (typeof nextValue === 'number') {
                    setQuantity(nextValue)
                  }
                }}
                step={1}
                type="number"
                value={quantity}
              />
            </label>
          </div>

          <div className="spec-grid">
            <div>
              <span className="spec-grid__label">Commit</span>
              <p>Values commit on blur or Enter, and Escape restores the previous committed value.</p>
            </div>
            <div>
              <span className="spec-grid__label">Types</span>
              <p>The component defaults to text and supports numeric entry with min/max clamping.</p>
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
            <code>{`// Text input
<Input
  ariaLabel="Project name"
  value={name}
  onCommit={(nextValue) => setName(String(nextValue))}
/>

// Number input
<Input
  ariaLabel="Seat count"
  type="number"
  min={1}
  max={99}
  step={1}
  value={quantity}
  onCommit={(nextValue) => setQuantity(Number(nextValue))}
/>`}</code>
          </pre>
        </article>
      </section>
    </>
  )
}
