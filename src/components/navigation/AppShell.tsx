import { BookOpen, Dumbbell, Map, RotateCcw } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { RPGHeader } from '../rpg';

const navItems = [
  { to: '/map', label: 'Mapa', icon: Map },
  { to: '/training', label: 'Treino', icon: Dumbbell },
  { to: '/codex', label: 'Codex', icon: BookOpen },
  { to: '/review', label: 'Revisão', icon: RotateCcw },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <RPGHeader />

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
