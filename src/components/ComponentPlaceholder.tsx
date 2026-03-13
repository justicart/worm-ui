type ComponentPlaceholderProps = {
  title: string
  category?: string
}

export function ComponentPlaceholder({ title, category = 'Component' }: ComponentPlaceholderProps) {
  return (
    <>
      <header className="hero-card">
        <div>
          <p className="eyebrow">{category}</p>
          <h2>{title}</h2>
        </div>
        <p className="hero-card__copy">
          This route is reserved in the catalog. The component demo will land here once it is
          implemented.
        </p>
      </header>

      <section className="demo-grid demo-grid--single">
        <article className="panel panel--placeholder">
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Status</p>
              <h3>Queued</h3>
            </div>
          </div>
          <p className="placeholder-copy">
            The navigation is now route-driven, so every component can have its own dedicated demo
            page, docs, and usage examples without changing the shell structure.
          </p>
        </article>
      </section>
    </>
  )
}
