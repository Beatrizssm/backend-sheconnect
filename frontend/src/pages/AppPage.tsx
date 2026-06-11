import { Routes, Route } from 'react-router-dom';
import {
  AppControllerProvider,
  useAppController,
  useAppControllerContext,
} from '../modules/app-shell/application/use-app-controller';
import { AppShellPage } from '../modules/app-shell/presentation/pages/app-shell-page';
import { AuthPages } from '../modules/auth/presentation/pages/auth-pages';
import { HomePage } from '../modules/auth/presentation/pages/home-page';
import { ProfilePage } from '../modules/profile';

function AppRouter() {
  const { view } = useAppControllerContext();

  if (view === 'app') {
    return <AppShellPage />;
  }

  if (view === 'home') {
    return <HomePage />;
  }

  if (view === 'login' || view === 'signup' || view === 'forgot-password') {
    return <AuthPages />;
  }

  return null;
}

export default function AppPage() {
  const controller = useAppController();

  return (
    <AppControllerProvider value={controller}>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<AppRouter />} />
      </Routes>
    </AppControllerProvider>
  );
}
