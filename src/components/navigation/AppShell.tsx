import { BookOpen, Dumbbell, Map, RotateCcw, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/map', label: 'Mapa', icon: Map },
  { to: '/training', label: 'Treino', icon: Dumbbell },
  { to: '/codex', label: 'Codex', icon: BookOpen },
  { to: '/review', label: 'Revisão', icon: RotateCcw },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/map" className="brand" aria-label="Geometria RPG — mapa">
          <span className="brand__mark">G</span>
          <span>
            <strong>Geometria RPG</strong>
            <small>Academia Euclidiana</small>
          </span>
        </NavLink>
        <div className="topbar__status">
          <ShieldCheck size={15} /> Progresso local
        </div>
      </header>

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
