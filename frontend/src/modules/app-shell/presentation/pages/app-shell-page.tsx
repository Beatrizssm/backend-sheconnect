import { useState } from 'react';

import { Bell, LogOut, Menu, Search, X } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { AUTH_TOKEN_STORAGE_KEY } from '../../../../shared/infrastructure/api/client';

import { cn } from '../../../../shared/lib/cn';

import type { AppTab } from '../../../../shared/types/app.types';

import { useAppControllerContext } from '../../application/use-app-controller';

import { AppTabContent } from '../components/app-tab-content';



export function AppShellPage() {

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {

    isDemoMode,

    exitDemoMode,

    toastNotification,

    currentMenuItems,

    activeTab,

    setActiveTab,

    unreadChatCount,

    unreadNotificationsCount,

    setView,

    displayProfile,

    isAdmin,

    setIsAdmin,

  } = useAppControllerContext();



  const handleTabChange = (tab: AppTab) => {

    setActiveTab(tab);

    setMobileMenuOpen(false);

  };



  const handleLogout = () => {

    if (isDemoMode) {

      exitDemoMode();

      return;

    }



    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

    setView('login');

    setMobileMenuOpen(false);

  };



  return (

    <div className={cn('flex h-screen bg-surface overflow-hidden', isDemoMode && 'pt-10')}>

      {isDemoMode && (

        <div className="fixed top-0 left-0 right-0 z-[110] flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-amber-500 px-4 py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-white shadow-lg">

          <span>Modo demonstração — dados fictícios</span>

          <button

            type="button"

            onClick={exitDemoMode}

            className="rounded-full bg-white/20 px-3 py-1 hover:bg-white/30 transition-colors"

          >

            Sair da demo

          </button>

        </div>

      )}

      {toastNotification && (

        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:w-80 z-[100] rounded-3xl bg-white border border-outline-variant/30 shadow-2xl p-4 sm:p-5">

          <div className="flex gap-3">

            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">

              <Bell className="w-5 h-5" />

            </div>

            <div className="min-w-0">

              <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Novo aviso</p>

              <h3 className="text-sm font-black text-on-surface">{toastNotification.title}</h3>

              <p className="text-xs font-semibold text-on-surface-variant/70 mt-1">{toastNotification.message}</p>

            </div>

          </div>

        </div>

      )}



      {mobileMenuOpen && (

        <button

          type="button"

          aria-label="Fechar menu"

          className="fixed inset-0 z-40 bg-black/50 lg:hidden"

          onClick={() => setMobileMenuOpen(false)}

        />

      )}



      <aside

        className={cn(

          'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-gradient-to-b from-[#181445] to-[#2d2a5b] text-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',

          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',

        )}

      >

        <div className="p-4 sm:p-6 flex items-center justify-between lg:block">

          <button

            type="button"

            onClick={() => {

              setMobileMenuOpen(false);

              if (isDemoMode) {

                exitDemoMode();

                return;

              }

              setView('home');

            }}

            aria-label="Voltar para a página principal"

            className="rounded-2xl transition-transform hover:scale-105 active:scale-95"

          >

            <img

              src="/logo-sheconnect.png"

              alt="SheConnect Logo"

              className="h-16 sm:h-20 w-auto rounded-2xl bg-white p-2 shadow-lg"

            />

          </button>

          <button

            type="button"

            onClick={() => setMobileMenuOpen(false)}

            aria-label="Fechar menu"

            className="p-2 rounded-xl hover:bg-white/10 lg:hidden"

          >

            <X className="w-5 h-5" />

          </button>

        </div>



        <nav className="flex-grow px-4 pb-4 overflow-y-auto space-y-1">

          {currentMenuItems.map((item) => {

            const Icon = item.icon;

            const isActive = activeTab === item.id;

            return (

              <button

                key={item.id}

                onClick={() => handleTabChange(item.id as AppTab)}

                className={cn(

                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group',

                  isActive ? 'bg-[#6063ee] text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/10',

                )}

              >

                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80')} />

                {item.label}

                {item.id === 'chat' && unreadChatCount > 0 && (

                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center">

                    {unreadChatCount}

                  </span>

                )}

                {item.id === 'notificações' && unreadNotificationsCount > 0 && (

                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center">

                    {unreadNotificationsCount}

                  </span>

                )}

              </button>

            );

          })}

        </nav>



        <div className="p-4 border-t border-white/10">

          <button

            onClick={handleLogout}

            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"

          >

            <LogOut className="w-5 h-5 text-white/40" />

            {isDemoMode ? 'Sair da demo' : 'Sair'}

          </button>

        </div>

      </aside>



      <main className="flex-grow flex flex-col min-w-0 w-full">

        <header className="h-16 lg:h-20 bg-white border-b border-outline-variant/30 px-4 md:px-6 lg:px-8 flex items-center gap-3 lg:gap-4 justify-between shrink-0">

          <button

            type="button"

            onClick={() => setMobileMenuOpen(true)}

            aria-label="Abrir menu"

            className="p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant lg:hidden shrink-0"

          >

            <Menu className="w-5 h-5" />

          </button>



          <div className="flex-grow min-w-0 max-w-xl hidden md:block">

            <div className="relative group">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />

              <input

                type="text"

                placeholder="Buscar startups, mentoras..."

                className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"

              />

            </div>

          </div>



          <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto md:ml-0">

            <button

              onClick={() => setActiveTab('notificações')}

              className="p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant relative transition-colors"

              aria-label="Notificações"

            >

              <Bell className="w-5 h-5" />

              {unreadNotificationsCount > 0 && (

                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center border-2 border-white">

                  {unreadNotificationsCount}

                </span>

              )}

            </button>

            {!isDemoMode && (

              <div className="flex items-center gap-2">

                <button

                  type="button"

                  onClick={() => navigate('/profile')}

                  className="flex items-center gap-2 sm:gap-3 p-1 sm:pl-3 rounded-full hover:bg-surface-container-low transition-colors group"

                  title="Meu perfil"

                >

                  <div className="text-right hidden sm:block font-sans">

                    <p className="text-sm font-bold text-on-surface leading-tight truncate max-w-[120px] lg:max-w-none">

                      {displayProfile.name}

                    </p>

                    <p className="text-[11px] text-on-surface-variant font-medium">{displayProfile.roleLabel}</p>

                  </div>

                  <img

                    src={displayProfile.avatar}

                    alt="Avatar"

                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-outline-variant/20"

                  />

                </button>

                <button

                  type="button"

                  onClick={() => {

                    setIsAdmin(!isAdmin);

                    setActiveTab(isAdmin ? 'dashboard' : 'analytics');

                  }}

                  className="hidden lg:inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary"

                >

                  {isAdmin ? 'Admin' : 'Usuária'}

                </button>

              </div>

            )}

            {isDemoMode && (

              <div className="flex items-center gap-2 sm:gap-3 p-1 sm:pl-3">

                <div className="text-right hidden sm:block font-sans">

                  <p className="text-sm font-bold text-on-surface leading-tight truncate max-w-[120px] lg:max-w-none">

                    {displayProfile.name}

                  </p>

                  <p className="text-[11px] text-on-surface-variant font-medium">{displayProfile.roleLabel}</p>

                </div>

                <img

                  src={displayProfile.avatar}

                  alt="Avatar"

                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-outline-variant/20"

                />

              </div>

            )}

          </div>

        </header>



        <div className="flex-grow overflow-y-auto bg-[#F9F8FF]">

          <AppTabContent />

        </div>

      </main>

    </div>

  );

}

