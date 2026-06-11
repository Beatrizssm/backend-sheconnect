import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../../shared/infrastructure/api/client';
import type { ApiRole, AppTab, AuthView, StartupMode } from '../../../shared/types/app.types';
import { EMPTY_STARTUP_FORM } from '../domain/startup.constants';
import type { Startup, StartupPayload } from '../domain/startup.types';

type StartupFormState = StartupPayload;
import { startupsService } from '../infrastructure/api/startups.api';

type UseStartupsOptions = {
  activeTab: AppTab;
  view: AuthView;
  isDemoMode: boolean;
  authUser: { id: string; role: ApiRole };
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
};

export function useStartups({
  activeTab,
  view,
  isDemoMode,
  authUser,
  isSubmitting,
  setIsSubmitting,
}: UseStartupsOptions) {
  const [startupMode, setStartupMode] = useState<StartupMode>('list');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [startupForm, setStartupForm] = useState<StartupFormState>(EMPTY_STARTUP_FORM);
  const [startupFilters, setStartupFilters] = useState({ search: '', category: '', stage: '' });
  const [isLoadingStartups, setIsLoadingStartups] = useState(false);
  const [startupError, setStartupError] = useState('');
  const [startupSuccess, setStartupSuccess] = useState('');
  const [startupMeta, setStartupMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  const canCreateStartup = authUser.role === 'ENTREPRENEUR';

  const canManageStartup = useCallback(
    (startup: Startup) => {
      return authUser.role === 'ADMIN' || (authUser.role === 'ENTREPRENEUR' && startup.founderId === authUser.id);
    },
    [authUser.id, authUser.role],
  );

  const loadStartups = useCallback(async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingStartups(true);
    setStartupError('');

    try {
      const result = await startupsService.getStartups({
        ...startupFilters,
        page: 1,
        limit: startupMeta.limit,
      });
      setStartups(result.data);
      setStartupMeta(result.meta);
    } catch (error) {
      setStartupError(getApiErrorMessage(error));
    } finally {
      setIsLoadingStartups(false);
    }
  }, [isDemoMode, startupFilters, startupMeta.limit]);

  useEffect(() => {
    if (activeTab !== 'startups' || view !== 'app' || isDemoMode) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadStartups();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, view, isDemoMode, loadStartups]);

  const handleStartupFieldChange = (field: keyof StartupFormState, value: string) => {
    setStartupForm((current) => ({ ...current, [field]: value }));
  };

  const resetStartupForm = useCallback(() => {
    setStartupForm(EMPTY_STARTUP_FORM);
    setSelectedStartup(null);
  }, []);

  const openCreateStartup = () => {
    resetStartupForm();
    setStartupMode('create');
    setStartupError('');
    setStartupSuccess('');
  };

  const openEditStartup = (startup: Startup) => {
    setSelectedStartup(startup);
    setStartupForm({
      name: startup.name,
      description: startup.description,
      category: startup.category,
      stage: startup.stage,
      website: startup.website ?? '',
      linkedin: startup.linkedin ?? '',
      instagram: startup.instagram ?? '',
      pitch: startup.pitch ?? '',
    });
    setStartupMode('edit');
    setStartupError('');
    setStartupSuccess('');
  };

  const handleSaveStartup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      setStartupError('Crie sua conta para salvar startups reais.');
      return;
    }

    setIsSubmitting(true);
    setStartupError('');
    setStartupSuccess('');

    try {
      if (startupMode === 'edit' && selectedStartup) {
        await startupsService.updateStartup(selectedStartup.id, startupForm);
        setStartupSuccess('Startup atualizada com sucesso.');
      } else {
        await startupsService.createStartup(startupForm);
        setStartupSuccess('Startup criada com sucesso.');
      }

      setStartupMode('list');
      resetStartupForm();
      await loadStartups();
    } catch (error) {
      setStartupError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStartup = async (startup: Startup) => {
    if (isDemoMode) {
      setStartupError('Crie sua conta para gerenciar startups reais.');
      return;
    }

    if (!window.confirm(`Deseja excluir a startup ${startup.name}?`)) {
      return;
    }

    setStartupError('');
    setStartupSuccess('');

    try {
      await startupsService.deleteStartup(startup.id);
      setStartupSuccess('Startup excluída com sucesso.');
      await loadStartups();
    } catch (error) {
      setStartupError(getApiErrorMessage(error));
    }
  };

  const seedDemoStartups = useCallback((demoStartups: Startup[]) => {
    setStartups(demoStartups);
    setStartupMeta({ page: 1, limit: 12, total: demoStartups.length, totalPages: 1 });
    setStartupError('');
  }, []);

  const resetStartups = useCallback(() => {
    setStartups([]);
    setStartupMeta({ page: 1, limit: 12, total: 0, totalPages: 0 });
    setStartupMode('list');
    resetStartupForm();
    setStartupError('');
    setStartupSuccess('');
  }, [resetStartupForm]);

  return {
    startupMode,
    setStartupMode,
    startups,
    setStartups,
    selectedStartup,
    setSelectedStartup,
    startupForm,
    setStartupForm,
    startupFilters,
    setStartupFilters,
    isLoadingStartups,
    startupError,
    setStartupError,
    startupSuccess,
    startupMeta,
    canCreateStartup,
    canManageStartup,
    isSubmitting,
    loadStartups,
    handleStartupFieldChange,
    resetStartupForm,
    openCreateStartup,
    openEditStartup,
    handleSaveStartup,
    handleDeleteStartup,
    seedDemoStartups,
    resetStartups,
  };
}
