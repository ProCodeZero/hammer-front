import cn from 'classnames';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/units', label: 'Units' },
    { path: '/factions', label: 'Factions' },
    { path: '/weapons', label: 'Weapons' },
    { path: '/compare', label: 'Compare' },
    { path: '/stats', label: 'Stats' },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles['logo-icon']}>⚔️</span>
          <span className={styles['logo-text']}>OpenHammer</span>
        </NavLink>

        <button
          className={styles['mobile-toggle']}
          aria-label="Toggle navigation"
          onClick={(e) => {
            const nav = e.currentTarget.nextElementSibling as HTMLElement;
            nav?.classList.toggle('open');
          }}
        >
          ☰
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(styles['nav-link'], { [styles.active]: isActive })}
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>OpenHammer Database • Data from Warhammer 40K 10th Edition</p>
        <div className={styles['footer-links']}>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.warhammer-community.com" target="_blank" rel="noopener noreferrer">
            Warhammer Community
          </a>
          <a href="/docs" target="_blank" rel="noopener noreferrer">
            API Docs
          </a>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
