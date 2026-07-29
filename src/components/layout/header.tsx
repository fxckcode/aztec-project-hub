'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Proyectos',
  '/team': 'Equipo',
  '/risks': 'Riesgos'
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Project Hub';

  return (
    <header className="border-brand-border flex h-14 items-center border-b bg-white px-6 lg:px-8">
      <h1 className="text-brand-dark text-base font-bold tracking-tight">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-brand-dark flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-xs font-bold">
          OP
        </div>
      </div>
    </header>
  );
}
