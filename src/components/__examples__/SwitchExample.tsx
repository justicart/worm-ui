import { useState } from 'react'
import { Switch } from '../Switch'

export function SwitchExample() {
  const [enabled, setEnabled] = useState(false)

  return (
    <>
      <header className="hero-card">
        <div>
          <p className="eyebrow">Inputs / Switch</p>
          <h2>Contour Switch</h2>
        </div>
        <p className="hero-card__copy">
          A boolean switch derived from the range contour language, with the same moving bulge and
          a thumb that travels from left to right.
        </p>
      </header>

      <section className="demo-grid">
        <article className="panel panel--showcase">
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Live Demo</p>
              <h3>Default</h3>
            </div>
          </div>

          <div className="toggle-showcase-grid">
            <div className="toggle-variant">
              <span className="toggle-variant__label">Interactive</span>
              <div className="toggle-stage">
                <Switch
                  ariaLabel="Contour switch demo"
                  checked={enabled}
                  label="Notifications"
                  onChange={setEnabled}
                />
              </div>
            </div>

            <div className="toggle-variant">
              <span className="toggle-variant__label">Disabled</span>
              <div className="toggle-stage">
                <Switch
                  ariaLabel="Disabled contour switch demo"
                  defaultChecked={false}
                  disabled
                  label="Notifications"
                />
              </div>
            </div>
          </div>

          <div className="spec-grid">
            <div>
              <span className="spec-grid__label">Semantics</span>
              <p>Uses a native checkbox with `role="switch"` and real labels for boolean state.</p>
            </div>
            <div>
              <span className="spec-grid__label">Behavior</span>
              <p>Clicks and keyboard activation animate the thumb and contour together, while disabled locks the state.</p>
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
            <code>{`// Controlled
const [enabled, setEnabled] = useState(true)

<Switch
  ariaLabel="Contour switch demo"
  label="Notifications"
  checked={enabled}
  onChange={setEnabled}
/>

// Uncontrolled
<Switch
  ariaLabel="Uncontrolled contour switch demo"
  label="Notifications"
  defaultChecked={false}
/>`}</code>
          </pre>
        </article>
      </section>
    </>
  )
}
