import { NavLink, Outlet } from 'react-router-dom'
import { componentGroups } from '../data/catalog'

export function AppShell() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__intro">
          <p className="eyebrow">Design System</p>
          <h1>Signal UI</h1>
          <p className="sidebar__copy">
            Monochrome foundations with deliberate accent color and tactile motion.
          </p>
        </div>

        <nav aria-label="Component catalog">
          {componentGroups.map((group) => (
            <section className="nav-group" key={group.name}>
              <p className="nav-group__label">{group.name}</p>
              <ul className="nav-list">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      className={({ isActive }) =>
                        isActive
                          ? 'nav-item nav-item--active'
                          : item.status === 'soon'
                            ? 'nav-item nav-item--pending'
                            : 'nav-item'
                      }
                      to={item.path}
                    >
                      {item.name}
                      {item.status === 'soon' ? (
                        <span className="nav-item__meta">Soon</span>
                      ) : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
