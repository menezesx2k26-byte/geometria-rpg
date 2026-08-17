import { Award, Map, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { RPGHeader } from '../rpg';
import { useProgress } from '../../state/progress';

const navItems = [
  { to: '/map', label: 'Caminho', icon: Map },
  { to: '/profile', label: 'Perfil', icon: UserRound },
  { to: '/achievements', label: 'Conquistas', icon: Award },
];

export function AppShell() {
  const { progress } = useProgress();
  return (
    <div className="app-shell">
      <RPGHeader>Nv. {progress.level} · {progress.xp} XP</RPGHeader>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav bottom-nav--three" aria-label="Navegação principal">
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
