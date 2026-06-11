import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  BarChart3,
  LayoutDashboard,
  Rocket,
  Calendar,
  Network,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { authService, type AuthUser } from '../../auth';
import { chatService } from '../../chat';
import { dashboardService, type AdminDashboard } from '../../dashboard';
import { eventsService } from '../../events';
import { mentorshipsService } from '../../mentorships';
import { notificationsService, type Notification as ApiNotification } from '../../notifications';
import { networkingService } from '../../networking';
import { useStartups } from '../../startups';
import { api, AUTH_TOKEN_STORAGE_KEY, getApiErrorMessage } from '../../../shared/infrastructure/api/client';
import { isMobileViewport } from '../../../shared/utils/viewport.utils';
import { realtimeService } from '../../../shared/infrastructure/realtime/realtime.service';
import {
  DEMO_ACTIVE_CHAT_ID,
  DEMO_CHAT_MESSAGES,
  DEMO_CONNECTIONS,
  DEMO_CONVERSATIONS,
  DEMO_EVENTS,
  DEMO_MENTORSHIPS,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILE,
  DEMO_STARTUPS,
  DEMO_USER_ID,
} from '../../../demo/demoData';
import { CHART_DATA } from '../../../shared/constants/marketing.constants';
import {
  EMPTY_MENTORSHIP_FORM,
  canAcceptOrRejectMentorship,
  canBrowseMentors,
  canCancelMentorship,
  canCreateMentorship as canCreateMentorshipByRole,
  canFinishMentorship,
  canScheduleMentorship,
  canStartMentorship,
  canViewMentorships,
  getMentorshipPageSubtitle,
  getMentorshipPageTitle,
} from '../../mentorships';
import type {
  AdminUser,
  ApiRole,
  AppTab,
  AuthView,
  ChatMessage,
  Connection,
  ConnectionMode,
  Conversation,
  Event,
  EventMode,
  Mentor,
  Mentorship,
  MentorshipFormState,
  MentorshipMode,
  MentorshipStatus,
  UserRole,
} from '../../../shared/types/app.types';
import type { MentorshipUserSummary } from '../../mentorships';
import {
  apiRoleLabel,
  apiRoleToUserRole,
  getStoredAuthUser,
  mapApiRoleToUserType,
  profileAvatar,
  roleToApiRole,
} from '../../../shared/utils/auth.utils';
import { formatDate, formatRelativeTime, formatTime, getShortId } from '../../../shared/utils/date.utils';
import { getMentorshipUserName } from '../../../shared/utils/chat.utils';
import { rolePieColor, rolePieLabel } from '../../../shared/utils/dashboard.utils';
import { toChatMessage, toConnection, toConversation } from '../../../shared/utils/chat.utils';
import { createContext, useContext } from 'react';
import { parseAppPath, tabToPath, viewToPath } from './app-navigation';

const AppControllerContext = createContext<AppControllerValue | null>(null);

export function AppControllerProvider({
  value,
  children,
}: {
  value: AppControllerValue;
  children: React.ReactNode;
}) {
  return <AppControllerContext.Provider value={value}>{children}</AppControllerContext.Provider>;
}

export function useAppControllerContext() {
  const value = useContext(AppControllerContext);
  if (!value) {
    throw new Error('useAppControllerContext must be used within AppControllerProvider');
  }
  return value;
}

export function useAppController() {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setViewState] = useState<AuthView>('home');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTabState] = useState<AppTab>('dashboard');

  useEffect(() => {
    const parsed = parseAppPath(location.pathname);
    setViewState(parsed.view);
    if (parsed.tab) {
      setActiveTabState(parsed.tab);
    }
  }, [location.pathname]);

  const setView = useCallback(
    (next: AuthView, tabOverride?: AppTab) => {
      const tab = tabOverride ?? activeTab;
      setViewState(next);
      if (tabOverride) {
        setActiveTabState(tabOverride);
      }
      const path = viewToPath(next, tab);
      if (location.pathname !== path) {
        navigate(path);
      }
    },
    [activeTab, location.pathname, navigate],
  );

  const setActiveTab = useCallback(
    (tab: AppTab) => {
      setActiveTabState(tab);
      if (view === 'app') {
        const path = tabToPath(tab);
        if (location.pathname !== path) {
          navigate(path);
        }
      }
    },
    [location.pathname, navigate, view],
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeChatId, setActiveChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [mentorshipMode, setMentorshipMode] = useState<MentorshipMode>('list');
  const [eventMode, setEventMode] = useState<EventMode>('list');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('list');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState('');
  const [connectionsError, setConnectionsError] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(12);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorshipUserSummary[]>([]);
  const [mentorshipForm, setMentorshipForm] = useState<MentorshipFormState>(EMPTY_MENTORSHIP_FORM);
  const [mentorshipFilters, setMentorshipFilters] = useState({
    search: '',
    status: '' as MentorshipStatus | '',
    category: '',
  });
  const [isLoadingMentorships, setIsLoadingMentorships] = useState(false);
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);
  const [mentorshipError, setMentorshipError] = useState('');
  const [mentorshipSuccess, setMentorshipSuccess] = useState('');
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [toastNotification, setToastNotification] = useState<ApiNotification | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [authError, setAuthError] = useState('');
  const [chatError, setChatError] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const authUser = useMemo(() => {
    if (isDemoMode) {
      return { id: DEMO_USER_ID, role: 'ENTREPRENEUR' as ApiRole };
    }

    return getStoredAuthUser(role, isAdmin);
  }, [role, isAdmin, view, isDemoMode]);

  const startupsState = useStartups({
    activeTab,
    view,
    isDemoMode,
    authUser,
    isSubmitting,
    setIsSubmitting,
  });

  const displayProfile = isDemoMode
    ? DEMO_PROFILE
    : currentUser
      ? {
          name: currentUser.name,
          roleLabel: apiRoleLabel(currentUser.role),
          avatar: profileAvatar(currentUser.name),
        }
      : {
          name: isLoadingProfile ? 'Carregando...' : 'Usuária',
          roleLabel: isAdmin ? 'Administradora' : 'Empreendedora',
          avatar: profileAvatar('SheConnect'),
        };

  const enterDemoMode = useCallback(() => {
    realtimeService.disconnect();
    setIsDemoMode(true);
    setIsAdmin(false);
    setRole('entrepreneur');
    startupsState.seedDemoStartups(DEMO_STARTUPS);
    setConnections(DEMO_CONNECTIONS);
    setEvents(DEMO_EVENTS);
    setMentorships(DEMO_MENTORSHIPS);
    setNotifications(DEMO_NOTIFICATIONS);
    setConversations(DEMO_CONVERSATIONS.map(toConversation));
    setActiveChatId(isMobileViewport() ? '' : DEMO_ACTIVE_CHAT_ID);
    setChatMessages(DEMO_CHAT_MESSAGES.map(toChatMessage));
    setDashboard(null);
    setMentorshipError('');
    setNotificationError('');
    setChatError('');
    setEventsError('');
    setConnectionsError('');
    setView('app', 'dashboard');
  }, [setView, startupsState.seedDemoStartups]);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    startupsState.resetStartups();
    setConnections([]);
    setEvents([]);
    setMentorships([]);
    setNotifications([]);
    setConversations([]);
    setChatMessages([]);
    setActiveChatId('');
    setDashboard(null);
    setCurrentUser(null);
    realtimeService.disconnect();
    setView('home');
  }, [startupsState.resetStartups]);
  const canViewMentorshipsTab = canViewMentorships(authUser.role);
  const canCreateMentorship = canCreateMentorshipByRole(authUser.role);
  const canBrowseMentorsList = canBrowseMentors(authUser.role);
  const mentorshipPageTitle = getMentorshipPageTitle(authUser.role);
  const mentorshipPageSubtitle = getMentorshipPageSubtitle(authUser.role);
  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
  const unreadChatCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
  const activeConversation = conversations.find((conversation) => conversation.conversationId === activeChatId);
  const dashboardChartData = useMemo(() => {
    const startupGrowth = dashboard?.analytics?.startupGrowth;
    const source = startupGrowth?.length ? startupGrowth : CHART_DATA;

    return source.map((item) => ({
      name: 'month' in item && item.month ? item.month : 'name' in item && item.name ? item.name : 'Mês',
      value: 'total' in item ? item.total : item.value,
    }));
  }, [dashboard]);

  const analyticsCards = useMemo(() => {
    if (!dashboard?.kpis) {
      return [];
    }

    const kpis = dashboard.kpis;

    return [
      {
        label: 'Usuários',
        value: kpis.totalUsers.toLocaleString('pt-BR'),
        trend: `+${kpis.monthlyGrowth}% este mês`,
        color: 'text-primary',
      },
      {
        label: 'Startups cadastradas',
        value: kpis.totalStartups.toLocaleString('pt-BR'),
        trend: `${kpis.totalEntrepreneurs} empreendedoras`,
        color: 'text-secondary',
      },
      {
        label: 'Mentorias realizadas',
        value: kpis.mentorshipsCompleted.toLocaleString('pt-BR'),
        trend: `${kpis.mentorshipsPending} pendentes`,
        color: 'text-indigo-500',
      },
      {
        label: 'Eventos ativos',
        value: kpis.activeEvents.toLocaleString('pt-BR'),
        trend: `${kpis.networkingConnections} conexões`,
        color: 'text-purple-500',
      },
    ];
  }, [dashboard]);

  const pieChartData = useMemo(() => {
    const usersByRole = dashboard?.analytics?.usersByRole ?? [];
    const total = usersByRole.reduce((sum, item) => sum + item.total, 0);

    if (!total) {
      return [];
    }

    return usersByRole.map((item) => ({
      name: rolePieLabel(item.label ?? ''),
      value: Math.round((item.total / total) * 100),
      count: item.total,
      color: rolePieColor(item.label ?? ''),
    }));
  }, [dashboard]);

  const adminUsersList = useMemo<AdminUser[]>(() => {
    return (dashboard?.users ?? []).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      type: mapApiRoleToUserType(user.role),
      status: 'Ativo' as const,
    }));
  }, [dashboard]);

  const recentActivities = useMemo(() => {
    return notifications.slice(0, 3).map((notification) => ({
      id: notification.id,
      title: notification.title,
      time: formatRelativeTime(notification.createdAt),
      avatar: profileAvatar(notification.title),
    }));
  }, [notifications]);

  const participantNames = useMemo(() => {
    const names = new Map<string, string>();

    connections.forEach((connection) => names.set(connection.id, connection.name));
    mentorOptions.forEach((mentor) => names.set(mentor.id, mentor.name));
    mentorships.forEach((mentorship) => {
      if (mentorship.mentor) {
        names.set(mentorship.mentor.id, mentorship.mentor.name);
      }

      if (mentorship.entrepreneur) {
        names.set(mentorship.entrepreneur.id, mentorship.entrepreneur.name);
      }
    });
    dashboard?.users?.forEach((user) => names.set(user.id, user.name));

    return names;
  }, [connections, mentorOptions, mentorships, dashboard]);

  const pendingMentorshipsCount = useMemo(
    () =>
      mentorships.filter((mentorship) =>
        ['SOLICITADA', 'EM_ANALISE'].includes(mentorship.status),
      ).length,
    [mentorships],
  );

  const handleGoogleCredential = useCallback(async (credential?: string) => {
    if (!credential) {
      setAuthError('Não foi possível receber a credencial do Google. Tente novamente.');
      return;
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const response = await api.post<{ accessToken: string; user: { id: string; role: ApiRole } }>('/auth/google', {
        credential,
        role: roleToApiRole(role, isAdmin),
      });

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.data.accessToken);
      localStorage.setItem('sheconnect_user_id', response.data.user.id);
      setIsAdmin(response.data.user.role === 'ADMIN');
      setIsDemoMode(false);
      setRole(apiRoleToUserRole(response.data.user.role));
      setView('app');
    } catch (error) {
      setAuthError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [isAdmin, role]);

  const filteredMentorships = useMemo(() => {
    const search = mentorshipFilters.search.trim().toLowerCase();

    if (!search) {
      return mentorships;
    }

    return mentorships.filter((mentorship) => {
      const searchable = [
        mentorship.title,
        mentorship.description,
        mentorship.category,
        mentorship.status,
        mentorship.mentor?.name,
        mentorship.entrepreneur?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(search);
    });
  }, [mentorshipFilters.search, mentorships]);

  const mentorshipMentorOptions = useMemo(() => {
    const optionsById = new Map<string, MentorshipUserSummary>();

    mentorOptions.forEach((mentor) => optionsById.set(mentor.id, mentor));
    mentorships.forEach((mentorship) => {
      if (mentorship.mentor) {
        optionsById.set(mentorship.mentor.id, mentorship.mentor);
      }
    });

    return Array.from(optionsById.values());
  }, [mentorOptions, mentorships]);

  const canAcceptOrRejectMentorshipHandler = (mentorship: Mentorship) =>
    canAcceptOrRejectMentorship(authUser, mentorship);

  const canScheduleMentorshipHandler = (mentorship: Mentorship) =>
    canScheduleMentorship(authUser, mentorship);

  const canStartMentorshipHandler = (mentorship: Mentorship) =>
    canStartMentorship(authUser, mentorship);

  const canFinishMentorshipHandler = (mentorship: Mentorship) =>
    canFinishMentorship(authUser, mentorship);

  const canCancelMentorshipHandler = (mentorship: Mentorship) =>
    canCancelMentorship(authUser, mentorship);

  useEffect(() => {
    const handleUnauthorized = () => {
      setView('login');
      startupsState.setStartupError('Sua sessão expirou. Faça login novamente.');
      setMentorshipError('Sua sessão expirou. Faça login novamente.');
      setNotificationError('Sua sessão expirou. Faça login novamente.');
      setChatError('Sua sessão expirou. Faça login novamente.');
      realtimeService.disconnect();
    };

    window.addEventListener('sheconnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('sheconnect:unauthorized', handleUnauthorized);
  }, [startupsState.setStartupError]);

  useEffect(() => {
    setAuthError('');
  }, [view]);

  useEffect(() => {
    if (view !== 'login' && view !== 'signup') {
      return;
    }

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return;
    }

    let isCancelled = false;

    const renderGoogleButton = () => {
      if (isCancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => void handleGoogleCredential(response.credential),
      });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: view === 'login' ? 'signin_with' : 'signup_with',
        width: googleButtonRef.current.offsetWidth || 320,
      });
    };

    const clearGoogleButton = () => {
      googleButtonRef.current?.replaceChildren();
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        isCancelled = true;
        clearGoogleButton();
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton, { once: true });
      return () => {
        isCancelled = true;
        existingScript.removeEventListener('load', renderGoogleButton);
        clearGoogleButton();
      };
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      isCancelled = true;
      script.onload = null;
      clearGoogleButton();
    };
  }, [handleGoogleCredential, view]);

  useEffect(() => {
    if (view !== 'app' || isDemoMode) {
      realtimeService.disconnect();
      return;
    }

    const offNotification = realtimeService.on('notification:new', (notification) => {
      setNotifications((current) => [notification, ...current.filter((item) => item.id !== notification.id)]);
      setToastNotification(notification);
    });
    const offChat = realtimeService.on('chat:new-message', (message) => {
      const chatMessage = toChatMessage(message);
      setConversations((current) => {
        const existing = current.find((conversation) => conversation.conversationId === message.conversationId);
        const shouldCountAsUnread = message.receiverId === authUser.id && message.conversationId !== activeChatId;
        const nextConversation: Conversation = existing
          ? { ...existing, lastMessage: chatMessage, unreadCount: shouldCountAsUnread ? existing.unreadCount + 1 : existing.unreadCount }
          : {
              conversationId: message.conversationId,
              participantIds: [message.senderId, message.receiverId].sort() as [string, string],
              lastMessage: chatMessage,
              unreadCount: shouldCountAsUnread ? 1 : 0,
            };

        return [nextConversation, ...current.filter((conversation) => conversation.conversationId !== message.conversationId)];
      });

      if (message.conversationId === activeChatId) {
        setChatMessages((current) =>
          current.some((item) => item.id === message.id) ? current : [...current, chatMessage],
        );
      }
    });

    void loadNotifications();
    void loadConversations();

    return () => {
      offNotification();
      offChat();
    };
  }, [view, activeChatId, authUser.id, isDemoMode]);

  useEffect(() => {
    if (!toastNotification) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastNotification(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotification]);

  useEffect(() => {
    if (activeTab !== 'notificações' || view !== 'app' || isDemoMode) {
      return;
    }

    void loadNotifications();
  }, [activeTab, view, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'chat' || view !== 'app' || isDemoMode) {
      return;
    }

    void loadConversations();
  }, [activeTab, view, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'chat' || view !== 'app' || !activeChatId || isDemoMode) {
      return;
    }

    void loadMessages(activeChatId);
  }, [activeTab, view, activeChatId, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'mentorias' || view !== 'app' || isDemoMode || !canViewMentorshipsTab) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadMentorships();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, view, mentorshipFilters.status, mentorshipFilters.category, isDemoMode, canViewMentorshipsTab]);

  useEffect(() => {
    if (activeTab !== 'mentorias' || view !== 'app' || !canBrowseMentorsList || isDemoMode) {
      return;
    }

    void loadMentors();
  }, [activeTab, view, canBrowseMentorsList, isDemoMode]);

  useEffect(() => {
    if (activeTab === 'mentorias' && view === 'app' && !canViewMentorshipsTab) {
      setActiveTab('dashboard');
    }
  }, [activeTab, view, canViewMentorshipsTab]);

  useEffect(() => {
    if (view !== 'app' || isDemoMode) {
      return;
    }

    void loadCurrentUser();
  }, [view, isDemoMode]);

  useEffect(() => {
    const shouldLoadAdminDashboard =
      (activeTab === 'dashboard' || activeTab === 'analytics' || activeTab === 'usuarios') &&
      view === 'app' &&
      authUser.role === 'ADMIN' &&
      !isDemoMode;

    if (!shouldLoadAdminDashboard) {
      return;
    }

    void loadDashboard();
  }, [activeTab, view, authUser.role, isDemoMode]);

  useEffect(() => {
    if (
      activeTab !== 'dashboard' ||
      view !== 'app' ||
      isDemoMode ||
      authUser.role === 'ADMIN' ||
      !canViewMentorshipsTab
    ) {
      return;
    }

    void loadMentorships();
    void loadEvents();
    void loadConnections();
  }, [activeTab, view, authUser.role, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'eventos' || view !== 'app' || isDemoMode) {
      return;
    }

    void loadEvents();
  }, [activeTab, view, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'conexões' || view !== 'app' || isDemoMode) {
      return;
    }

    void loadConnections();
  }, [activeTab, view, isDemoMode]);

  useEffect(() => {
    if (activeTab !== 'chat' || view !== 'app' || isDemoMode) {
      return;
    }

    void loadConnections();
    if (canViewMentorshipsTab) {
      void loadMentorships();
    }
  }, [activeTab, view, isDemoMode, canViewMentorshipsTab]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    try {
      const form = new FormData(e.currentTarget);

      if (view === 'login') {
        const response = await api.post<{ accessToken: string; refreshToken?: string; user: { id: string; role: ApiRole } }>('/auth/login', {
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        });
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('sheconnect_refresh_token', response.data.refreshToken);
        }
        localStorage.setItem('sheconnect_user_id', response.data.user.id);
        setIsDemoMode(false);
        setIsAdmin(response.data.user.role === 'ADMIN');
        setRole(apiRoleToUserRole(response.data.user.role));
        setView('app');
        return;
      }

      if (view === 'signup') {
        await api.post('/auth/register', {
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
          role: roleToApiRole(role, false),
        });
        const response = await api.post<{ accessToken: string; refreshToken?: string; user: { id: string; role: ApiRole } }>('/auth/login', {
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? ''),
        });
        localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('sheconnect_refresh_token', response.data.refreshToken);
        }
        localStorage.setItem('sheconnect_user_id', response.data.user.id);
        setIsDemoMode(false);
        setIsAdmin(response.data.user.role === 'ADMIN');
        setRole(apiRoleToUserRole(response.data.user.role));
        setView('app');
        return;
      }

      if (view === 'forgot-password') {
        setView('login');
      }
    } catch (error) {
      setAuthError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMentorships = async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingMentorships(true);
    setMentorshipError('');

    try {
      const data = await mentorshipsService.getMentorships({
        status: mentorshipFilters.status,
        category: mentorshipFilters.category,
      });
      setMentorships(data);
    } catch (error) {
      setMentorshipError(getApiErrorMessage(error));
    } finally {
      setIsLoadingMentorships(false);
    }
  };

  const loadMentors = async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingMentors(true);

    try {
      const mentors = await mentorshipsService.getMentors();
      setMentorOptions(mentors);
    } catch (error) {
      setMentorshipError(getApiErrorMessage(error));
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const loadCurrentUser = async () => {
    setIsLoadingProfile(true);

    try {
      const user = await authService.getMe();
      setCurrentUser(user);
      setIsAdmin(user.role === 'ADMIN');
      setRole(apiRoleToUserRole(user.role));
      localStorage.setItem('sheconnect_user_id', user.id);
    } catch (error) {
      startupsState.setStartupError(getApiErrorMessage(error));
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadDashboard = async () => {
    if (isDemoMode) {
      return;
    }

    try {
      const data = await dashboardService.getAdminDashboard();
      setDashboard(data);
    } catch (error) {
      startupsState.setStartupError(getApiErrorMessage(error));
    }
  };

  const loadEvents = async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingEvents(true);
    setEventsError('');

    try {
      const result = await eventsService.getEvents();
      setEvents(result.data);
    } catch (error) {
      setEventsError(getApiErrorMessage(error));
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadConnections = async () => {
    if (isDemoMode) {
      return;
    }

    setConnectionsError('');

    try {
      const result = await networkingService.getMyConnections();
      const connected = (result.connected ?? []).map((item) =>
        toConnection(item.profile, {
          connectedAt: formatDate(item.connectedAt),
          isRecommendation: false,
        }),
      );
      const connectedIds = new Set(connected.map((connection) => connection.id));
      const recommendations = result.recommendations
        .filter((profile) => !connectedIds.has(profile.id))
        .map((profile) => toConnection(profile, { isRecommendation: true }));
      setConnections([...connected, ...recommendations]);
    } catch (error) {
      setConnectionsError(getApiErrorMessage(error));
    }
  };

  const handleRegisterEvent = async (event: Event) => {
    setEventsError('');

    try {
      await eventsService.register(event.id);
      await loadNotifications();
    } catch (error) {
      setEventsError(getApiErrorMessage(error));
    }
  };

  const handleConnect = async (connection: Connection) => {
    if (!connection.sourceUserId) {
      return;
    }

    setConnectionsError('');

    try {
      await networkingService.connect(connection.sourceUserId);
      await loadConnections();
    } catch (error) {
      setConnectionsError(getApiErrorMessage(error));
    }
  };

  const resetMentorshipForm = () => {
    setMentorshipForm(EMPTY_MENTORSHIP_FORM);
    setSelectedMentor(null);
  };

  const openCreateMentorship = () => {
    resetMentorshipForm();
    setMentorshipMode('schedule');
    setMentorshipError('');
    setMentorshipSuccess('');
  };

  const handleMentorshipFieldChange = (field: keyof MentorshipFormState, value: string) => {
    setMentorshipForm((current) => ({ ...current, [field]: value }));
  };

  const handleScheduleMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setMentorshipForm((current) => ({
      ...current,
      mentorId: mentor.id,
      category: mentor.specialty.replace('Especialista em ', ''),
    }));
    setMentorshipMode('schedule');
  };

  const handleConfirmSchedule = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMentorshipError('');
    setMentorshipSuccess('');

    try {
      await mentorshipsService.createMentorship(mentorshipForm);
      setMentorshipMode('list');
      resetMentorshipForm();
      setMentorshipSuccess('Mentoria solicitada com sucesso.');
      await loadMentorships();
    } catch (error) {
      setMentorshipError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMentorshipAction = async (
    mentorship: Mentorship,
    action: 'accept' | 'reject' | 'schedule' | 'start' | 'finish' | 'cancel',
    payload: { scheduledAt?: string; rejectionReason?: string } = {},
  ) => {
    if (action === 'cancel' && !window.confirm(`Deseja cancelar a mentoria ${mentorship.title}?`)) {
      return;
    }

    if (action === 'reject' && !payload.rejectionReason) {
      const rejectionReason = window.prompt('Motivo da rejeição (opcional):') ?? undefined;
      payload = { ...payload, rejectionReason };
    }

    if (action === 'schedule' && !payload.scheduledAt) {
      const scheduledAt = window.prompt('Data e hora da sessão (ISO, ex: 2026-06-15T14:00:00.000Z):');
      if (!scheduledAt) {
        return;
      }
      payload = { ...payload, scheduledAt };
    }

    setMentorshipError('');
    setMentorshipSuccess('');

    try {
      if (action === 'accept') {
        await mentorshipsService.acceptMentorship(mentorship.id, {
          scheduledAt: payload.scheduledAt,
        });
        setMentorshipSuccess('Mentoria aceita com sucesso.');
      }

      if (action === 'reject') {
        await mentorshipsService.rejectMentorship(mentorship.id, {
          rejectionReason: payload.rejectionReason,
        });
        setMentorshipSuccess('Mentoria rejeitada com sucesso.');
      }

      if (action === 'schedule' && payload.scheduledAt) {
        await mentorshipsService.scheduleMentorship(mentorship.id, payload.scheduledAt);
        setMentorshipSuccess('Sessão agendada com sucesso.');
      }

      if (action === 'start') {
        await mentorshipsService.startMentorship(mentorship.id);
        setMentorshipSuccess('Mentoria iniciada com sucesso.');
      }

      if (action === 'finish') {
        await mentorshipsService.completeMentorship(mentorship.id);
        setMentorshipSuccess('Mentoria concluída com sucesso.');
      }

      if (action === 'cancel') {
        await mentorshipsService.cancelMentorship(mentorship.id);
        setMentorshipSuccess('Mentoria cancelada com sucesso.');
      }

      await loadMentorships();
    } catch (error) {
      setMentorshipError(getApiErrorMessage(error));
    }
  };

  const loadNotifications = async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingNotifications(true);
    setNotificationError('');

    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (error) {
      setNotificationError(getApiErrorMessage(error));
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotificationError('');

    try {
      await notificationsService.markAllAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      setNotificationError(getApiErrorMessage(error));
    }
  };

  const handleMarkNotificationRead = async (notification: ApiNotification) => {
    if (notification.isRead) {
      return;
    }

    try {
      const updatedNotification = await notificationsService.markAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updatedNotification.id ? updatedNotification : item)),
      );
    } catch (error) {
      setNotificationError(getApiErrorMessage(error));
    }
  };

  const handleDeleteNotification = async (notification: ApiNotification) => {
    setNotificationError('');

    try {
      await notificationsService.deleteNotification(notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
    } catch (error) {
      setNotificationError(getApiErrorMessage(error));
    }
  };

  const loadConversations = async () => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingConversations(true);
    setChatError('');

    try {
      const data = await chatService.getConversations();
      const mappedConversations = data.map(toConversation);
      setConversations(mappedConversations);
      setActiveChatId((current) => {
        if (current) {
          return current;
        }

        if (isMobileViewport()) {
          return '';
        }

        return mappedConversations[0]?.conversationId || '';
      });
    } catch (error) {
      setChatError(getApiErrorMessage(error));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (isDemoMode) {
      return;
    }

    setIsLoadingMessages(true);
    setChatError('');

    try {
      const data = await chatService.getMessages(conversationId);
      setChatMessages(data.map(toChatMessage));
    } catch (error) {
      setChatError(getApiErrorMessage(error));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendChatMessage = async () => {
    const message = messageText.trim();
    const receiverId = activeConversation?.participantIds.find((participantId) => participantId !== authUser.id);

    if (!message || !receiverId) {
      return;
    }

    if (isDemoMode) {
      setChatError('Crie sua conta para enviar mensagens reais.');
      return;
    }

    setChatError('');

    try {
      await chatService.sendMessage(receiverId, message);
      setMessageText('');
    } catch (error) {
      setChatError(getApiErrorMessage(error));
    }
  };

  const handleSelectChat = (conversationId: string) => {
    setActiveChatId(conversationId);
    setConversations((current) =>
      current.map((conversation) =>
        conversation.conversationId === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  };

  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'mentorias', label: 'Mentorias', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'conexões', label: 'Conexões', icon: Network },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'notificações', label: 'Avisos', icon: Bell },
  ] as const;

  const menuItems = useMemo(() => {
    if (authUser.role === 'INVESTOR') {
      return baseMenuItems.filter((item) => item.id !== 'mentorias');
    }

    if (authUser.role === 'MENTOR') {
      return baseMenuItems.map((item) =>
        item.id === 'mentorias' ? { ...item, label: 'Mentorias recebidas' } : item,
      );
    }

    return [...baseMenuItems];
  }, [authUser.role]);

  const adminMenuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'mentorias', label: 'Mentorias', icon: Briefcase },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'conexões', label: 'Conexões', icon: Network },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'notificações', label: 'Avisos', icon: Bell },
  ];

  const currentMenuItems = isAdmin ? adminMenuItems : menuItems;

  return {
    view,
    setView,
    isDemoMode,
    googleButtonRef,
    activeTab,
    setActiveTab,
    isAdmin,
    setIsAdmin,
    activeChatId,
    setActiveChatId,
    messageText,
    setMessageText,
    ...startupsState,
    mentorshipMode,
    setMentorshipMode,
    eventMode,
    setEventMode,
    connectionMode,
    setConnectionMode,
    selectedMentor,
    setSelectedMentor,
    selectedEvent,
    setSelectedEvent,
    selectedConnection,
    setSelectedConnection,
    connections,
    setConnections,
    events,
    setEvents,
    dashboard,
    setDashboard,
    isLoadingEvents,
    eventsError,
    connectionsError,
    role,
    setRole,
    isSubmitting,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    mentorships,
    setMentorships,
    mentorOptions,
    mentorshipForm,
    setMentorshipForm,
    mentorshipFilters,
    setMentorshipFilters,
    isLoadingMentorships,
    isLoadingMentors,
    mentorshipError,
    mentorshipSuccess,
    notifications,
    isLoadingNotifications,
    notificationError,
    toastNotification,
    setToastNotification,
    conversations,
    chatMessages,
    isLoadingConversations,
    isLoadingMessages,
    authError,
    setAuthError,
    chatError,
    currentUser,
    isLoadingProfile,
    authUser,
    displayProfile,
    enterDemoMode,
    exitDemoMode,
    canViewMentorshipsTab,
    canCreateMentorship,
    canBrowseMentorsList,
    mentorshipPageTitle,
    mentorshipPageSubtitle,
    unreadNotificationsCount,
    unreadChatCount,
    activeConversation,
    dashboardChartData,
    analyticsCards,
    pieChartData,
    adminUsersList,
    recentActivities,
    participantNames,
    pendingMentorshipsCount,
    handleGoogleCredential,
    filteredMentorships,
    mentorshipMentorOptions,
    canAcceptOrRejectMentorship: canAcceptOrRejectMentorshipHandler,
    canScheduleMentorship: canScheduleMentorshipHandler,
    canStartMentorship: canStartMentorshipHandler,
    canFinishMentorship: canFinishMentorshipHandler,
    canCancelMentorship: canCancelMentorshipHandler,
    handleSubmit,
    loadMentorships,
    loadMentors,
    loadCurrentUser,
    loadDashboard,
    loadEvents,
    loadConnections,
    handleRegisterEvent,
    handleConnect,
    resetMentorshipForm,
    openCreateMentorship,
    handleMentorshipFieldChange,
    handleScheduleMentorship,
    handleConfirmSchedule,
    handleMentorshipAction,
    loadNotifications,
    handleMarkAllNotificationsRead,
    handleMarkNotificationRead,
    handleDeleteNotification,
    loadConversations,
    loadMessages,
    handleSendChatMessage,
    handleSelectChat,
    menuItems,
    adminMenuItems,
    currentMenuItems,
  };
}

export type AppControllerValue = ReturnType<typeof useAppController>;
