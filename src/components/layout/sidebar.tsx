import Link from 'next/link';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  AlertTriangle
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Proyectos', icon: FolderKanban },
  { href: '/team', label: 'Equipo', icon: Users },
  { href: '/risks', label: 'Riesgos', icon: AlertTriangle }
];

export function Sidebar() {
  return (
    <aside className="sidebar flex w-56 flex-col">
      <div className="border-brand-border flex h-14 items-center gap-2.5 border-b px-5">
        <div className="bg-brand-dark flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white">
          A
        </div>
        <div>
          <span className="text-brand-dark text-sm font-bold tracking-tight">
            Aztec Hub
          </span>
          <span className="text-brand-text-secondary block text-[10px] font-medium tracking-wider uppercase">
            Operaciones
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-brand-border border-t p-4">
        <div className="text-brand-text-muted text-xs">
          Operational Hub v1.0
        </div>
      </div>
    </aside>
  );
}
