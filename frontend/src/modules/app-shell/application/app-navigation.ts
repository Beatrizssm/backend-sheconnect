import type { AppTab, AuthView } from '../../../shared/types/app.types';

const TAB_SLUGS: Record<AppTab, string> = {
  dashboard: 'dashboard',
  startups: 'startups',
  mentorias: 'mentorias',
  eventos: 'eventos',
  'conexões': 'conexoes',
  chat: 'chat',
  'notificações': 'notificacoes',
  usuarios: 'usuarios',
  analytics: 'analytics',
};

const SLUG_TO_TAB = Object.fromEntries(
  Object.entries(TAB_SLUGS).map(([tab, slug]) => [slug, tab as AppTab]),
) as Record<string, AppTab>;

export function tabToPath(tab: AppTab): string {
  return `/app/${TAB_SLUGS[tab]}`;
}

export function viewToPath(view: AuthView, tab: AppTab = 'dashboard'): string {
  switch (view) {
    case 'home':
      return '/';
    case 'login':
      return '/login';
    case 'signup':
      return '/signup';
    case 'forgot-password':
      return '/forgot-password';
    case 'app':
      return tabToPath(tab);
    default:
      return '/';
  }
}

export function parseAppPath(pathname: string): { view: AuthView; tab?: AppTab } {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/') {
    return { view: 'home' };
  }

  if (path === '/login') {
    return { view: 'login' };
  }

  if (path === '/signup') {
    return { view: 'signup' };
  }

  if (path === '/forgot-password') {
    return { view: 'forgot-password' };
  }

  if (path === '/app') {
    return { view: 'app', tab: 'dashboard' };
  }

  const appMatch = path.match(/^\/app\/([^/]+)$/);
  if (appMatch) {
    const tab = SLUG_TO_TAB[appMatch[1]];
    if (tab) {
      return { view: 'app', tab };
    }
  }

  return { view: 'home' };
}
