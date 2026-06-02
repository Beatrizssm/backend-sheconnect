import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  Apple,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Rocket,
  Calendar,
  Network,
  MessageSquare,
  Bell,
  Settings,
  Search,
  LogOut,
  Edit2,
  Trash2,
  MapPin,
  Mail,
  Lock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AUTH_TOKEN_STORAGE_KEY, api, getApiErrorMessage } from '../services/api';
import { chatService, type ChatConversation as ApiChatConversation, type ChatMessage as ApiChatMessage } from '../services/chat.service';
import {
  mentorshipsService,
  type CreateMentorshipPayload,
  type Mentorship as ApiMentorship,
  type MentorshipStatus,
  type MentorshipUserSummary,
} from '../services/mentorships.service';
import { notificationsService, type Notification as ApiNotification } from '../services/notifications.service';
import { realtimeService } from '../services/realtime.service';
import { startupsService, type Startup as ApiStartup, type StartupPayload } from '../services/startups.service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UserRole = 'entrepreneur' | 'mentor' | 'investor';
type ApiRole = 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR';
type AuthView = 'home' | 'login' | 'signup' | 'forgot-password' | 'app';
type AppTab = 'dashboard' | 'startups' | 'mentorias' | 'eventos' | 'conexões' | 'chat' | 'notificações' | 'usuarios' | 'analytics';
type StartupMode = 'list' | 'create' | 'edit';
type MentorshipMode = 'list' | 'schedule';
type EventMode = 'list' | 'detail';
type ConnectionMode = 'list' | 'profile';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  conversationId: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  participantIds: [string, string];
  lastMessage: ChatMessage;
  unreadCount: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  type: string;
  status: 'Ativo' | 'Inativo';
}

interface Connection {
  id: string;
  name: string;
  role: string;
  specialty: string;
  connectedAt: string;
  avatar: string;
  bio: string;
  stats: {
    mentorias: number;
    conexões: number;
    startups: number;
    eventos: number;
  };
  expertise: string[];
}

type Startup = ApiStartup;

type StartupFormState = StartupPayload;
type Mentorship = ApiMentorship;
type MentorshipFormState = CreateMentorshipPayload;

type JwtPayload = {
  sub?: string;
  role?: ApiRole;
};

interface Mentor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  availability: string;
  avatar: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  image: string;
}

const INITIAL_STARTUPS: Startup[] = [
  { id: '1', founderId: 'demo-founder', name: 'TechGirls', category: 'Educação', description: 'Plataforma de educação tecnológica.', stage: 'Seed', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', founderId: 'demo-founder', name: 'GreenMind', category: 'Sustentabilidade', description: 'Soluções para economia circular.', stage: 'Ideação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', founderId: 'demo-founder', name: 'Vita Health', category: 'Saúde', description: 'Monitoramento remoto de pacientes.', stage: 'Validação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', founderId: 'demo-founder', name: 'Connecte', category: 'Comunicação', description: 'Rede de colaboração corporativa.', stage: 'Tração', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', founderId: 'demo-founder', name: 'DevFlow', category: 'Tecnologia', description: 'Automação de workflows de dev.', stage: 'Série A', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', founderId: 'demo-founder', name: 'AgroSmart', category: 'Agronegócio', description: 'Inteligência de solo para fazendas.', stage: 'Validação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const MENTORS: Mentor[] = [
  { id: '1', name: 'Ana Clara Lima', specialty: 'Especialista em Growth', experience: '10 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: '2', name: 'Juliana Silva', specialty: 'Especialista em Finanças', experience: '8 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: '3', name: 'Carla Mendes', specialty: 'Especialista em Marketing', experience: '12 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1544005313-94ff6747cae0?w=100&h=100&fit=crop' },
];

const EVENTS: Event[] = [
  { id: '1', name: 'Startup Day Women 2024', date: '24 de Maio', location: 'São Paulo - SP', description: 'O maior evento de empreendedorismo feminino do Brasil.', image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c23d?w=800&q=80' },
  { id: '2', name: 'Tech & Business Summit', date: '10 de Junho', location: 'Online', description: 'Inovação e tecnologia impulsionando negócios femininos.', image: 'https://images.unsplash.com/photo-1591115765373-520b7a21765b?w=800&q=80' },
  { id: '3', name: 'Investidoras Summit', date: '05 de Julho', location: 'Rio de Janeiro - RJ', description: 'Conectando startups a investidoras experientes.', image: 'https://images.unsplash.com/photo-1560523182-77443935586b?w=800&q=80' },
];

const INITIAL_CONNECTIONS: Connection[] = [
  { 
    id: '1', 
    name: 'Juliana Silva', 
    role: 'Mentora', 
    specialty: 'Finanças', 
    connectedAt: '12/05/2024', 
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    bio: 'Especialista em finanças corporativas e investimentos. Ajudando mulheres a estruturarem negócios sólidos e escaláveis.',
    stats: { mentorias: 48, conexões: 312, startups: 15, eventos: 22 },
    expertise: ['Finanças', 'Investimentos', 'Valuation', 'Captação']
  },
  { 
    id: '2', 
    name: 'Mariana Costa', 
    role: 'Empreendedora', 
    specialty: 'Saúde', 
    connectedAt: '10/05/2024', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    bio: 'Fundadora de uma healthtech focada em saúde mental. Entusiasta de tecnologia aplicada ao bem-estar.',
    stats: { mentorias: 5, conexões: 120, startups: 1, eventos: 8 },
    expertise: ['Healthtech', 'Liderança', 'Product']
  },
  { 
    id: '3', 
    name: 'Fernanda Rocha', 
    role: 'Investidora', 
    specialty: 'Venture Capital', 
    connectedAt: '08/05/2024', 
    avatar: 'https://images.unsplash.com/photo-1544005313-94ff6747cae0?w=100&h=100&fit=crop',
    bio: 'Partner em fundo de VC focado em startups fundadas por mulheres na América Latina.',
    stats: { mentorias: 30, conexões: 500, startups: 45, eventos: 12 },
    expertise: ['VC', 'M&A', 'Strategy']
  },
  { 
    id: '4', 
    name: 'Patrícia Almeida', 
    role: 'Mentora', 
    specialty: 'Marketing', 
    connectedAt: '05/05/2024', 
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    bio: 'Especialista em branding e marketing digital para startups em estágio inicial.',
    stats: { mentorias: 60, conexões: 420, startups: 8, eventos: 35 },
    expertise: ['Branding', 'Growth', 'Content']
  },
];

const CHART_DATA = [
  { name: 'Jan', value: 100 },
  { name: 'Fev', value: 150 },
  { name: 'Mar', value: 240 },
  { name: 'Abr', value: 180 },
  { name: 'Mai', value: 260 },
  { name: 'Jun', value: 380 },
];

const RECENT_ACTIVITIES = [
  { id: 1, title: 'Mentoria com Ana Clara confirmada', time: 'há 10 min', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 2, title: 'Você se conectou com Juliana Silva', time: 'há 45 min', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: 3, title: 'Inscrição confirmada no evento Startup Day', time: 'há 2 horas', avatar: 'https://images.unsplash.com/photo-1544005313-94ff6747cae0?w=100&h=100&fit=crop' },
];

const ADMIN_USERS: AdminUser[] = [
  { id: '1', name: 'Beatriz Souza', email: 'beatriz@email.com', type: 'Empreendedora', status: 'Ativo' },
  { id: '2', name: 'Juliana Silva', email: 'juliana@email.com', type: 'Mentora', status: 'Ativo' },
  { id: '3', name: 'Ana Clara Lima', email: 'ana@email.com', type: 'Mentora', status: 'Ativo' },
  { id: '4', name: 'Mariana Costa', email: 'mariana@email.com', type: 'Empreendedora', status: 'Ativo' },
  { id: '5', name: 'Fernanda Rocha', email: 'fernanda@email.com', type: 'Investidora', status: 'Inativo' },
];

const PIE_DATA = [
  { name: 'Empreendedoras', value: 62, color: '#6063ee' },
  { name: 'Mentoras', value: 26, color: '#8b5cf6' },
  { name: 'Investidoras', value: 12, color: '#181445' },
];

const ANALYTICS_CARDS = [
  { label: 'Usuários Ativos', value: '1.284', trend: '+12% este mês', color: 'text-primary' },
  { label: 'Startups Cadastradas', value: '356', trend: '+8% este mês', color: 'text-secondary' },
  { label: 'Mentorias Realizadas', value: '1.024', trend: '+15% este mês', color: 'text-indigo-500' },
  { label: 'Eventos Realizados', value: '42', trend: '+2% este mês', color: 'text-purple-500' },
];

const HOME_STATS = [
  { value: '1.2k+', label: 'mulheres conectadas' },
  { value: '350+', label: 'startups acompanhadas' },
  { value: '1k+', label: 'mentorias realizadas' },
];

const HOME_FEATURES = [
  {
    title: 'Networking estratégico',
    description: 'Conecte-se com empreendedoras, mentoras e investidoras alinhadas ao seu momento.',
    icon: Network,
  },
  {
    title: 'Mentorias sob medida',
    description: 'Encontre especialistas para validar ideias, estruturar crescimento e captar recursos.',
    icon: Users,
  },
  {
    title: 'Dashboard inteligente',
    description: 'Acompanhe conexões, eventos, mentorias e oportunidades em um só lugar.',
    icon: LayoutDashboard,
  },
];

const EMPTY_STARTUP_FORM: StartupFormState = {
  name: '',
  description: '',
  category: '',
  stage: '',
  website: '',
  linkedin: '',
  instagram: '',
  pitch: '',
};

const EMPTY_MENTORSHIP_FORM: MentorshipFormState = {
  mentorId: '',
  title: '',
  description: '',
  category: '',
};

const MENTORSHIP_STATUS_LABELS: Record<MentorshipStatus, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceita',
  REJECTED: 'Rejeitada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const MENTORSHIP_STATUS_STYLES: Record<MentorshipStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

function roleToApiRole(role: UserRole, isAdmin: boolean): ApiRole {
  if (isAdmin) {
    return 'ADMIN';
  }

  const roleMap: Record<UserRole, ApiRole> = {
    entrepreneur: 'ENTREPRENEUR',
    mentor: 'MENTOR',
    investor: 'INVESTOR',
  };

  return roleMap[role];
}

function apiRoleToUserRole(role: ApiRole): UserRole {
  if (role === 'MENTOR') {
    return 'mentor';
  }

  if (role === 'INVESTOR') {
    return 'investor';
  }

  return 'entrepreneur';
}

function getStoredAuthUser(role: UserRole, isAdmin: boolean): { id: string; role: ApiRole } {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const payload = token ? decodeJwt(token) : null;

  return {
    id: payload?.sub ?? localStorage.getItem('sheconnect_user_id') ?? '',
    role: payload?.role ?? roleToApiRole(role, isAdmin),
  };
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sem data definida';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getShortId(id: string) {
  return id.slice(0, 8);
}

function toChatMessage(message: ApiChatMessage): ChatMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    conversationId: message.conversationId,
    message: message.message,
    createdAt: message.createdAt,
  };
}

function toConversation(conversation: ApiChatConversation): Conversation {
  return {
    conversationId: conversation.conversationId,
    participantIds: conversation.participantIds,
    lastMessage: toChatMessage(conversation.lastMessage),
    unreadCount: conversation.unreadCount,
  };
}

function getMentorshipUserName(user: MentorshipUserSummary | undefined, id: string, fallback: string) {
  return user?.name ?? `${fallback} ${getShortId(id)}`;
}

export default function App() {
  const [view, setView] = useState<AuthView>('home');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeChatId, setActiveChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [startupMode, setStartupMode] = useState<StartupMode>('list');
  const [mentorshipMode, setMentorshipMode] = useState<MentorshipMode>('list');
  const [eventMode, setEventMode] = useState<EventMode>('list');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('list');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [connections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(12);
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [startupForm, setStartupForm] = useState<StartupFormState>(EMPTY_STARTUP_FORM);
  const [startupFilters, setStartupFilters] = useState({ search: '', category: '', stage: '' });
  const [isLoadingStartups, setIsLoadingStartups] = useState(false);
  const [startupError, setStartupError] = useState('');
  const [startupSuccess, setStartupSuccess] = useState('');
  const [startupMeta, setStartupMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });
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
  const authUser = useMemo(() => getStoredAuthUser(role, isAdmin), [role, isAdmin, view]);
  const canCreateStartup = authUser.role === 'ENTREPRENEUR';
  const canCreateMentorship = authUser.role === 'ENTREPRENEUR';
  const unreadNotificationsCount = notifications.filter((notification) => !notification.isRead).length;
  const unreadChatCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
  const activeConversation = conversations.find((conversation) => conversation.conversationId === activeChatId);

  const canManageStartup = (startup: Startup) => {
    return authUser.role === 'ADMIN' || (authUser.role === 'ENTREPRENEUR' && startup.founderId === authUser.id);
  };

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

  const canAcceptOrRejectMentorship = (mentorship: Mentorship) => {
    return (
      mentorship.status === 'PENDING' &&
      (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
    );
  };

  const canCompleteMentorship = (mentorship: Mentorship) => {
    return (
      mentorship.status === 'ACCEPTED' &&
      (authUser.role === 'ADMIN' || (authUser.role === 'MENTOR' && mentorship.mentorId === authUser.id))
    );
  };

  const canCancelMentorship = (mentorship: Mentorship) => {
    return (
      !['REJECTED', 'COMPLETED', 'CANCELLED'].includes(mentorship.status) &&
      (authUser.role === 'ADMIN' ||
        (authUser.role === 'ENTREPRENEUR' && mentorship.entrepreneurId === authUser.id))
    );
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      setView('login');
      setStartupError('Sua sessão expirou. Faça login novamente.');
      setMentorshipError('Sua sessão expirou. Faça login novamente.');
      setNotificationError('Sua sessão expirou. Faça login novamente.');
      setChatError('Sua sessão expirou. Faça login novamente.');
      realtimeService.disconnect();
    };

    window.addEventListener('sheconnect:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('sheconnect:unauthorized', handleUnauthorized);
  }, []);

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
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: view === 'login' ? 'signin_with' : 'signup_with',
        width: googleButtonRef.current.offsetWidth || 320,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        isCancelled = true;
      };
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');

    if (existingScript) {
      existingScript.addEventListener('load', renderGoogleButton, { once: true });
      return () => {
        isCancelled = true;
        existingScript.removeEventListener('load', renderGoogleButton);
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
    };
  }, [handleGoogleCredential, view]);

  useEffect(() => {
    if (view !== 'app') {
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
  }, [view, activeChatId, authUser.id]);

  useEffect(() => {
    if (!toastNotification) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastNotification(null), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotification]);

  useEffect(() => {
    if (activeTab !== 'notificações' || view !== 'app') {
      return;
    }

    void loadNotifications();
  }, [activeTab, view]);

  useEffect(() => {
    if (activeTab !== 'chat' || view !== 'app') {
      return;
    }

    void loadConversations();
  }, [activeTab, view]);

  useEffect(() => {
    if (activeTab !== 'chat' || view !== 'app' || !activeChatId) {
      return;
    }

    void loadMessages(activeChatId);
  }, [activeTab, view, activeChatId]);

  useEffect(() => {
    if (activeTab !== 'startups' || view !== 'app') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadStartups();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, view, startupFilters.search, startupFilters.category, startupFilters.stage]);

  useEffect(() => {
    if (activeTab !== 'mentorias' || view !== 'app') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadMentorships();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, view, mentorshipFilters.status, mentorshipFilters.category]);

  useEffect(() => {
    if (activeTab !== 'mentorias' || view !== 'app' || !canCreateMentorship) {
      return;
    }

    void loadMentors();
  }, [activeTab, view, canCreateMentorship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (view === 'forgot-password') {
        setView('login');
      } else {
        setView('app');
      }
    }, 1500);
  };

  const loadStartups = async () => {
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
  };

  const handleStartupFieldChange = (field: keyof StartupFormState, value: string) => {
    setStartupForm((current) => ({ ...current, [field]: value }));
  };

  const resetStartupForm = () => {
    setStartupForm(EMPTY_STARTUP_FORM);
    setSelectedStartup(null);
  };

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

  const loadMentorships = async () => {
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
    action: 'accept' | 'reject' | 'complete' | 'cancel',
  ) => {
    if (action === 'cancel' && !window.confirm(`Deseja cancelar a mentoria ${mentorship.title}?`)) {
      return;
    }

    setMentorshipError('');
    setMentorshipSuccess('');

    try {
      if (action === 'accept') {
        await mentorshipsService.acceptMentorship(mentorship.id);
        setMentorshipSuccess('Mentoria aceita com sucesso.');
      }

      if (action === 'reject') {
        await mentorshipsService.rejectMentorship(mentorship.id);
        setMentorshipSuccess('Mentoria rejeitada com sucesso.');
      }

      if (action === 'complete') {
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
    setIsLoadingConversations(true);
    setChatError('');

    try {
      const data = await chatService.getConversations();
      const mappedConversations = data.map(toConversation);
      setConversations(mappedConversations);
      setActiveChatId((current) => current || mappedConversations[0]?.conversationId || '');
    } catch (error) {
      setChatError(getApiErrorMessage(error));
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'mentorias', label: 'Mentorias', icon: Users },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'conexões', label: 'Conexões', icon: Network },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'notificações', label: 'Avisos', icon: Bell },
  ];

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

  if (view === 'app') {
    return (
      <div className="flex h-screen bg-surface overflow-hidden">
        {toastNotification && (
          <div className="fixed top-5 right-5 z-[100] w-80 rounded-3xl bg-white border border-outline-variant/30 shadow-2xl p-5">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Novo aviso</p>
                <h3 className="text-sm font-black text-on-surface">{toastNotification.title}</h3>
                <p className="text-xs font-semibold text-on-surface-variant/70 mt-1">{toastNotification.message}</p>
              </div>
            </div>
          </div>
        )}
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-[#181445] to-[#2d2a5b] text-white flex flex-col shrink-0">
          <div className="p-6">
            <button type="button" onClick={() => setView('home')} aria-label="Voltar para a página principal" className="rounded-2xl transition-transform hover:scale-105 active:scale-95">
              <img 
                src="/logo-sheconnect.png" 
                alt="SheConnect Logo" 
                className="h-20 w-auto rounded-2xl bg-white p-2 shadow-lg"
              />
            </button>
          </div>
          
          <nav className="flex-grow px-4 pb-4 overflow-y-auto space-y-1">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AppTab)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                    isActive 
                      ? "bg-[#6063ee] text-white shadow-lg" 
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/40 group-hover:text-white/80")} />
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
              onClick={() => {
                localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                setView('login');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <LogOut className="w-5 h-5 text-white/40" />
              Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow flex flex-col min-w-0">
          {/* Header */}
          <header className="h-20 bg-white border-b border-outline-variant/30 px-8 flex items-center justify-between shrink-0">
            <div className="flex-grow max-w-xl">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar startups, mentoras..."
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('notificações')} className="p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant relative transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => {
                  setIsAdmin(!isAdmin);
                  setActiveTab(isAdmin ? 'dashboard' : 'analytics');
                }}
                className="flex items-center gap-3 p-1 pl-3 rounded-full hover:bg-surface-container-low transition-colors group"
              >
                <div className="text-right hidden sm:block font-sans">
                  <p className="text-sm font-bold text-on-surface leading-tight">Beatriz Souza</p>
                  <p className="text-[11px] text-on-surface-variant font-medium">{isAdmin ? 'Administradora' : 'Empreendedora'}</p>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-1 ring-outline-variant/20"
                />
              </button>
            </div>
          </header>

          {/* Tab Content */}
          <div className="flex-grow overflow-y-auto bg-[#F9F8FF]">
            <AnimatePresence mode="wait">
              {activeTab === 'analytics' && (
                <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ANALYTICS_CARDS.map((card, i) => (
                      <div key={i} className="bg-white p-6 rounded-[32px] border border-outline-variant/30 shadow-sm">
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{card.label}</p>
                        <p className={cn("text-3xl font-black mb-1", card.color)}>{card.value}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">{card.trend}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-outline-variant/30 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Crescimento de Usuários</h3>
                        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Últimos 6 meses</p>
                      </div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={CHART_DATA}>
                            <defs>
                              <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6063ee" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6063ee" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#6063ee" strokeWidth={4} fillOpacity={1} fill="url(#colorAdmin)" dot={{ r: 4, fill: '#6063ee' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-outline-variant/30 shadow-sm">
                      <h3 className="text-lg font-bold mb-8">Usuários por tipo</h3>
                      <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={PIE_DATA}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {PIE_DATA.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <div className="text-center">
                              <p className="text-2xl font-black">1.284</p>
                              <p className="text-[8px] font-bold text-on-surface-variant uppercase">Total</p>
                           </div>
                        </div>
                      </div>
                      <div className="mt-8 space-y-3">
                        {PIE_DATA.map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm font-bold text-on-surface-variant">{item.name}</span>
                            </div>
                            <span className="text-sm font-black">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'usuarios' && (
                <motion.div 
                  key="usuarios"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
                    <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                      + Novo usuário
                    </button>
                  </div>

                  <div className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-outline-variant/10">
                      <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                        <input placeholder="Buscar usuários por nome ou email..." className="w-full pl-9 pr-4 py-2 text-sm font-medium border border-outline-variant/30 rounded-xl outline-none focus:border-primary transition-all" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-surface-container-low/50 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">E-mail</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {ADMIN_USERS.map((user) => (
                            <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="px-6 py-4 text-sm font-bold">{user.name}</td>
                              <td className="px-6 py-4 text-sm font-medium text-on-surface-variant/70">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-primary">{user.type}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  user.status === 'Ativo' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors ml-1"><LogOut className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 bg-surface-container-low/20 flex items-center justify-center gap-2">
                       {['1', '2', '3', '...', '10'].map(p => (
                         <button key={p} className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-all", p === '1' ? "bg-primary text-white" : "hover:bg-white")}>{p}</button>
                       ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex overflow-hidden font-sans"
                >
                  {/* Conversations Sidebar */}
                  <div className="w-80 bg-white border-r border-outline-variant/30 flex flex-col">
                    <div className="p-6 border-b border-outline-variant/10">
                      <h2 className="text-xl font-bold mb-4">Mensagens</h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                        <input placeholder="Buscar conversas..." className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all" />
                      </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                      {isLoadingConversations && (
                        <div className="p-6 text-sm font-bold text-on-surface-variant/60">Carregando conversas...</div>
                      )}
                      {!isLoadingConversations && conversations.length === 0 && (
                        <div className="p-6 text-sm font-bold text-on-surface-variant/60">
                          Nenhuma conversa ainda.
                        </div>
                      )}
                      {conversations.map((conv) => {
                        const otherUserId = conv.participantIds.find((participantId) => participantId !== authUser.id) ?? conv.participantIds[0];
                        const displayName = `Usuária ${getShortId(otherUserId)}`;

                        return (
                        <button 
                          key={conv.conversationId}
                          onClick={() => handleSelectChat(conv.conversationId)}
                          className={cn(
                            "w-full p-4 flex items-center gap-4 transition-all border-b border-outline-variant/5",
                            activeChatId === conv.conversationId ? "bg-primary/5" : "hover:bg-surface-container-low"
                          )}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">
                              {displayName.slice(0, 1)}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <div className="flex-grow text-left">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="text-sm font-bold text-on-surface">{displayName}</span>
                              <span className="text-[10px] text-on-surface-variant/60 font-medium">{formatTime(conv.lastMessage.createdAt)}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant/60 font-medium truncate w-40">{conv.lastMessage.message}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </div>
                          )}
                        </button>
                      )})}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="flex-grow flex flex-col bg-white">
                    {/* Chat Header */}
                    {activeChatId && (
                      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-black">
                            {(activeConversation?.participantIds.find((participantId) => participantId !== authUser.id) ?? 'U').slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">
                              Usuária {getShortId(activeConversation?.participantIds.find((participantId) => participantId !== authUser.id) ?? '')}
                            </h3>
                            <p className="text-xs text-green-500 font-bold">Realtime ativo</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant"><Bell className="w-5 h-5" /></button>
                          <button className="p-2.5 rounded-xl hover:bg-surface-container-low text-on-surface-variant"><Settings className="w-5 h-5" /></button>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface-container-low/20">
                      {chatError && <p className="text-sm font-bold text-red-500">{chatError}</p>}
                      {isLoadingMessages && (
                        <p className="text-sm font-bold text-on-surface-variant/60">Carregando mensagens...</p>
                      )}
                      {!isLoadingMessages && activeChatId && chatMessages.length === 0 && (
                        <p className="text-sm font-bold text-on-surface-variant/60">Nenhuma mensagem nesta conversa.</p>
                      )}
                      {!activeChatId && (
                        <p className="text-sm font-bold text-on-surface-variant/60">Selecione uma conversa para começar.</p>
                      )}
                      {chatMessages.map((msg) => {
                        const isMe = msg.senderId === authUser.id;

                        return (
                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm leading-relaxed",
                            isMe 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-white text-on-surface rounded-tl-none border border-outline-variant/10"
                          )}>
                            {msg.message}
                            <p className={cn("text-[10px] mt-1.5 font-bold opacity-60 text-right")}>{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      )})}
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-outline-variant/10">
                      <div className="bg-surface-container-low rounded-2xl p-2 flex items-center gap-2 border border-outline-variant/10 focus-within:border-primary focus-within:bg-white transition-all">
                        <input 
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              void handleSendChatMessage();
                            }
                          }}
                          placeholder="Digite sua mensagem..." 
                          disabled={!activeChatId}
                          className="flex-grow bg-transparent px-4 py-2 outline-none text-sm font-medium"
                        />
                        <button className="p-2 rounded-xl text-on-surface-variant hover:text-primary"><Apple className="w-5 h-5" /></button>
                        <button onClick={() => void handleSendChatMessage()} disabled={!activeChatId || !messageText.trim()} className="bg-primary text-white p-2.5 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40">
                          <Rocket className="w-5 h-5 rotate-45" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'notificações' && (
                <motion.div
                  key="notificações"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full font-sans"
                >
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Central de avisos</p>
                      <h2 className="text-3xl font-black tracking-tight">Avisos importantes</h2>
                      <p className="text-on-surface-variant font-semibold mt-2">
                        Aqui aparecem confirmações, convites e novidades da sua rede.
                      </p>
                    </div>
                    <button onClick={() => void handleMarkAllNotificationsRead()} className="px-5 py-3 bg-white border border-outline-variant/30 rounded-2xl text-sm font-black text-primary shadow-sm hover:bg-surface-container-low transition-all">
                      Marcar tudo como lido
                    </button>
                  </div>

                  <div className="bg-white rounded-[36px] border border-outline-variant/30 shadow-sm overflow-hidden">
                    {notificationError && (
                      <div className="p-6 text-sm font-bold text-red-500">{notificationError}</div>
                    )}
                    {isLoadingNotifications && (
                      <div className="p-6 text-sm font-bold text-on-surface-variant/60">Carregando avisos...</div>
                    )}
                    {!isLoadingNotifications && notifications.length === 0 && (
                      <div className="p-10 text-center">
                        <div className="w-14 h-14 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                          <Bell className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-on-surface">Nenhum aviso por enquanto</h3>
                        <p className="text-sm font-semibold text-on-surface-variant/60 mt-2">
                          Novidades de mentorias, eventos, startups e chat aparecerão aqui em tempo real.
                        </p>
                      </div>
                    )}
                    {notifications.map((notification) => (
                      <div key={notification.id} onClick={() => void handleMarkNotificationRead(notification)} className={cn(
                        "p-6 flex gap-5 border-b last:border-b-0 border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors cursor-pointer",
                        !notification.isRead && "bg-primary/[0.03]"
                      )}>
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                          notification.isRead ? "bg-surface-container-low text-on-surface-variant" : "bg-primary/10 text-primary"
                        )}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h3 className="font-black text-on-surface">
                              {notification.title}
                              {!notification.isRead && <span className="ml-2 text-[10px] text-secondary">NOVO</span>}
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full w-fit">
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-on-surface-variant/70 leading-relaxed">{notification.message}</p>
                          <div className="flex items-center justify-between gap-3 mt-2">
                            <p className="text-xs font-bold text-on-surface-variant/40">{formatDate(notification.createdAt)} às {formatTime(notification.createdAt)}</p>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteNotification(notification);
                              }}
                              className="text-xs font-black text-red-400 hover:text-red-600"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <div className="relative overflow-hidden rounded-[40px] bg-[#181445] text-white p-8 md:p-10 shadow-2xl shadow-primary/10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(129,39,207,0.55),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(96,99,238,0.45),_transparent_30%)]" />
                    <div className="relative z-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-end">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/70 mb-6">
                          <CheckCircle2 className="w-4 h-4 text-secondary-container" />
                          Jornada em crescimento
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Olá, Beatriz</h2>
                        <p className="text-white/60 font-semibold text-lg leading-relaxed max-w-2xl">
                          Sua rede ganhou novas conexões, mentorias e oportunidades. Veja os próximos passos para acelerar sua startup.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('mentorias')} className="rounded-3xl bg-white text-on-surface p-5 text-left hover:-translate-y-1 transition-all shadow-xl">
                          <Users className="w-6 h-6 text-primary mb-5" />
                          <p className="text-2xl font-black">3</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">mentorias pendentes</p>
                        </button>
                        <button onClick={() => setActiveTab('eventos')} className="rounded-3xl bg-white/10 border border-white/10 p-5 text-left hover:-translate-y-1 transition-all">
                          <Calendar className="w-6 h-6 text-white mb-5" />
                          <p className="text-2xl font-black">2</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/45">eventos sugeridos</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Mentorias" value="12" sublabel="agendadas" icon={<Users className="w-6 h-6 text-primary" />} trend="+3 esta semana" />
                    <MetricCard label="Conexões" value="248" sublabel="rede ativa" icon={<Network className="w-6 h-6 text-secondary" />} trend="+24 este mês" />
                    <MetricCard label="Eventos" value="8" sublabel="inscrições" icon={<Calendar className="w-6 h-6 text-indigo-500" />} trend="2 próximos" />
                    <MetricCard label="Startups" value="3" sublabel="cadastradas" icon={<Rocket className="w-6 h-6 text-purple-500" />} trend="1 em tração" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white p-6 md:p-8 rounded-[36px] border border-outline-variant/30 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Performance</p>
                          <h3 className="text-xl font-black">Crescimento da sua rede</h3>
                        </div>
                        <button className="px-4 py-2 text-xs font-black rounded-full bg-surface-container-low text-primary">Últimos 6 meses</button>
                      </div>
                      
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={CHART_DATA}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4648d4" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#4648d4" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="value" stroke="#4648d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" dot={{ r: 4, fill: '#4648d4', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[36px] border border-outline-variant/30 shadow-sm flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Agora</p>
                          <h3 className="text-xl font-black">Atividades recentes</h3>
                        </div>
                        <button onClick={() => setActiveTab('notificações')} className="text-xs font-black text-primary hover:underline">Ver tudo</button>
                      </div>
                      <div className="space-y-5 flex-grow">
                        {RECENT_ACTIVITIES.map((activity) => (
                          <div key={activity.id} className="flex gap-4 rounded-3xl bg-surface-container-low/60 p-4">
                            <img src={activity.avatar} alt="" className="w-11 h-11 rounded-2xl object-cover shadow-sm shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-on-surface leading-snug">{activity.title}</p>
                              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                      { title: 'Encontrar mentora', description: 'Receba recomendações para sua fase atual.', icon: Users, tab: 'mentorias' as AppTab },
                      { title: 'Cadastrar startup', description: 'Atualize sua vitrine para novas conexões.', icon: Rocket, tab: 'startups' as AppTab },
                      { title: 'Expandir rede', description: 'Converse com fundadoras e investidoras.', icon: Network, tab: 'conexões' as AppTab },
                    ].map((action) => {
                      const Icon = action.icon;
                      return (
                        <button key={action.title} onClick={() => setActiveTab(action.tab)} className="group bg-white rounded-[32px] border border-outline-variant/30 p-6 text-left shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-black mb-2">{action.title}</h3>
                          <p className="text-sm font-semibold text-on-surface-variant/60 leading-relaxed">{action.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'mentorias' && (
                <motion.div 
                  key="mentorias"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {mentorshipMode === 'list' ? (
                      <motion.div key="mentor_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight">Mentorias</h2>
                            <p className="text-sm font-semibold text-on-surface-variant/60 mt-1">
                              {filteredMentorships.length} mentoria{filteredMentorships.length === 1 ? '' : 's'} encontrada{filteredMentorships.length === 1 ? '' : 's'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input
                                value={mentorshipFilters.search}
                                onChange={(event) => setMentorshipFilters((current) => ({ ...current, search: event.target.value }))}
                                placeholder="Buscar mentorias..."
                                className="pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                              />
                            </div>
                            <select
                              value={mentorshipFilters.status}
                              onChange={(event) => setMentorshipFilters((current) => ({ ...current, status: event.target.value as MentorshipStatus | '' }))}
                              className="px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold outline-none focus:border-primary"
                            >
                              <option value="">Todos os status</option>
                              {Object.entries(MENTORSHIP_STATUS_LABELS).map(([status, label]) => (
                                <option key={status} value={status}>{label}</option>
                              ))}
                            </select>
                            <input
                              value={mentorshipFilters.category}
                              onChange={(event) => setMentorshipFilters((current) => ({ ...current, category: event.target.value }))}
                              placeholder="Categoria"
                              className="w-36 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold outline-none focus:border-primary"
                            />
                            {canCreateMentorship && (
                              <button
                                onClick={openCreateMentorship}
                                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                              >
                                + Nova mentoria
                              </button>
                            )}
                          </div>
                        </div>

                        {(mentorshipError || mentorshipSuccess) && (
                          <div className={cn(
                            "rounded-2xl px-5 py-4 text-sm font-bold border",
                            mentorshipError ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                          )}>
                            {mentorshipError || mentorshipSuccess}
                          </div>
                        )}

                        <div className="space-y-4">
                          {isLoadingMentorships && Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-[24px] border border-outline-variant/30 shadow-sm p-6 animate-pulse">
                              <div className="flex items-center justify-between mb-5">
                                <div className="h-6 bg-surface-container-low rounded-full w-1/3" />
                                <div className="h-7 bg-surface-container-low rounded-full w-24" />
                              </div>
                              <div className="h-4 bg-surface-container-low rounded-full w-2/3 mb-3" />
                              <div className="h-4 bg-surface-container-low rounded-full w-1/2" />
                            </div>
                          ))}

                          {!isLoadingMentorships && filteredMentorships.map((mentorship) => (
                            <div key={mentorship.id} className="bg-white rounded-[24px] border border-outline-variant/30 shadow-sm p-6 group hover:shadow-md transition-all">
                              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                      MENTORSHIP_STATUS_STYLES[mentorship.status],
                                    )}>
                                      {MENTORSHIP_STATUS_LABELS[mentorship.status]}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                                      {mentorship.category}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-bold text-on-surface mb-2">{mentorship.title}</h3>
                                  <p className="text-sm font-medium text-on-surface-variant/70 leading-relaxed max-w-3xl">{mentorship.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                  {canAcceptOrRejectMentorship(mentorship) && (
                                    <>
                                      <button
                                        onClick={() => void handleMentorshipAction(mentorship, 'accept')}
                                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                      >
                                        Aceitar
                                      </button>
                                      <button
                                        onClick={() => void handleMentorshipAction(mentorship, 'reject')}
                                        className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                      >
                                        Rejeitar
                                      </button>
                                    </>
                                  )}
                                  {canCompleteMentorship(mentorship) && (
                                    <button
                                      onClick={() => void handleMentorshipAction(mentorship, 'complete')}
                                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                      Concluir mentoria
                                    </button>
                                  )}
                                  {canCancelMentorship(mentorship) && (
                                    <button
                                      onClick={() => void handleMentorshipAction(mentorship, 'cancel')}
                                      className="px-4 py-2 bg-surface-container-low text-on-surface-variant rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                      Cancelar
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/10">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Mentora</p>
                                  <p className="text-sm font-bold text-on-surface">{getMentorshipUserName(mentorship.mentor, mentorship.mentorId, 'Mentora')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Empreendedora</p>
                                  <p className="text-sm font-bold text-on-surface">{getMentorshipUserName(mentorship.entrepreneur, mentorship.entrepreneurId, 'Empreendedora')}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Data</p>
                                  <p className="text-sm font-bold text-on-surface">{formatDate(mentorship.scheduledAt)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Criada em</p>
                                  <p className="text-sm font-bold text-on-surface">{formatDate(mentorship.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {!isLoadingMentorships && filteredMentorships.length === 0 && (
                            <div className="bg-white rounded-[32px] border border-outline-variant/30 p-10 text-center shadow-sm">
                              <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary mx-auto mb-5 flex items-center justify-center">
                                <Users className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black text-on-surface mb-2">Nenhuma mentoria encontrada</h3>
                              <p className="text-sm font-semibold text-on-surface-variant/60 max-w-md mx-auto">
                                Ajuste os filtros ou solicite uma nova mentoria para começar uma conexão com especialistas.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="schedule" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-3xl mx-auto w-full">
                        <button onClick={() => { resetMentorshipForm(); setMentorshipMode('list'); }} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
                          <ArrowLeft className="w-4 h-4" /> Voltar para mentorias
                        </button>
                        
                        <form onSubmit={handleConfirmSchedule} className="bg-white rounded-[32px] border border-outline-variant/30 shadow-xl overflow-hidden">
                          <div className="p-8 border-b border-outline-variant/10 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                              <Users className="w-8 h-8" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Nova solicitação</p>
                              <h2 className="text-2xl font-bold text-on-surface">Criar mentoria</h2>
                              <p className="text-sm font-medium text-primary">Conectada à API real da SheConnect</p>
                            </div>
                          </div>
                          
                          <div className="p-8 space-y-6 bg-surface-container-low/30">
                            {mentorshipError && (
                              <div className="rounded-2xl px-5 py-4 text-sm font-bold border bg-red-50 text-red-600 border-red-100">
                                {mentorshipError}
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Mentora</label>
                              <select
                                value={mentorshipForm.mentorId}
                                onChange={(event) => handleMentorshipFieldChange('mentorId', event.target.value)}
                                className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                required
                              >
                                <option value="">{isLoadingMentors ? 'Carregando mentoras...' : 'Selecione uma mentora'}</option>
                                {mentorshipMentorOptions.map((mentor) => (
                                  <option key={mentor.id} value={mentor.id}>{mentor.name} - {mentor.email}</option>
                                ))}
                              </select>
                              {!isLoadingMentors && mentorshipMentorOptions.length === 0 && (
                                <p className="text-xs font-semibold text-on-surface-variant/60">
                                  Nenhuma mentora disponível na API no momento.
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Título</label>
                              <input
                                value={mentorshipForm.title}
                                onChange={(event) => handleMentorshipFieldChange('title', event.target.value)}
                                placeholder="Ex: Estratégia de crescimento"
                                className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Descrição</label>
                              <textarea
                                value={mentorshipForm.description}
                                onChange={(event) => handleMentorshipFieldChange('description', event.target.value)}
                                placeholder="Descreva o desafio que você quer trabalhar com a mentora..."
                                className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium h-32"
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Categoria</label>
                              <input
                                value={mentorshipForm.category}
                                onChange={(event) => handleMentorshipFieldChange('category', event.target.value)}
                                placeholder="Growth, Finanças, Marketing..."
                                className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                required
                              />
                            </div>
                          </div>

                          <div className="p-8 bg-white flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => { resetMentorshipForm(); setMentorshipMode('list'); }}
                              className="px-8 py-4 border border-outline-variant text-on-surface-variant font-bold rounded-xl hover:bg-surface-container-low transition-all"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="submit"
                              disabled={isSubmitting}
                              className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                            >
                              {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Solicitar mentoria"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'eventos' && (
                <motion.div 
                  key="eventos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {eventMode === 'list' ? (
                      <motion.div key="event_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-3xl font-bold tracking-tight">Eventos</h2>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input placeholder="Buscar eventos..." className="pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors">
                              <Settings className="w-4 h-4" /> Filtro
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {EVENTS.map((event) => (
                            <div key={event.id} className="bg-white rounded-[24px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all">
                              <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                                <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <div className="p-8 flex-grow flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-on-surface mb-2">{event.name}</h3>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-on-surface-variant/60 mb-4 uppercase tracking-widest">
                                  <span className="text-primary">{event.date}</span>
                                  <span>•</span>
                                  <span>{event.location}</span>
                                </div>
                                <p className="text-sm text-on-surface-variant font-medium mb-6 leading-relaxed max-w-2xl">
                                  {event.description}
                                </p>
                                <div className="flex gap-4">
                                  <button 
                                    onClick={() => { setSelectedEvent(event); setEventMode('detail'); }}
                                    className="px-8 py-3 border border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all text-sm"
                                  >
                                    Ver Detalhes
                                  </button>
                                  <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all text-sm">
                                    Inscrever-se
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="event_detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto w-full">
                        <button onClick={() => setEventMode('list')} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
                          <ArrowLeft className="w-4 h-4" /> Voltar para eventos
                        </button>
                        
                        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-outline-variant/10">
                          <div className="h-64 relative">
                            <img src={selectedEvent?.image} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-8 left-8 text-white">
                              <div className="flex items-center gap-2 mb-2 p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                                <Network className="w-6 h-6" />
                              </div>
                              <h1 className="text-4xl font-black">{selectedEvent?.name}</h1>
                            </div>
                          </div>
                          
                          <div className="p-10 space-y-8">
                            <div className="flex items-center gap-8 text-sm font-bold text-on-surface-variant">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>{selectedEvent?.date} 2024 • 08:00 - 18:00</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{selectedEvent?.location}</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-on-surface font-medium leading-relaxed">
                                {selectedEvent?.description} Palestras, workshops, networking e muito mais!
                              </p>
                            </div>

                            <div className="space-y-4">
                              <h3 className="text-lg font-black uppercase tracking-widest text-on-surface">O que você vai encontrar</h3>
                              <div className="grid gap-3">
                                {[
                                  'Palestras com grandes líderes',
                                  'Workshops práticos',
                                  'Networking com mentoras e investidoras',
                                  'Oportunidades de investimento'
                                ].map((item, i) => (
                                  <div key={i} className="flex items-center gap-3">
                                    <div className="p-1 bg-green-100 rounded-full">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-semibold text-on-surface-variant">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-95 transition-all text-sm uppercase tracking-widest">
                              Inscrever-se no evento
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'conexões' && (
                <motion.div 
                  key="conexões"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {connectionMode === 'list' ? (
                      <motion.div key="conn_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-3xl font-bold tracking-tight">Conexões</h2>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input placeholder="Buscar conexões..." className="pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors">
                              <Settings className="w-4 h-4" /> Filtro
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm overflow-hidden">
                          <div className="divide-y divide-outline-variant/10">
                            {connections.map((conn) => (
                              <div 
                                key={conn.id} 
                                className="p-6 flex items-center gap-6 hover:bg-surface-container-low/30 transition-colors cursor-pointer group"
                                onClick={() => { setSelectedConnection(conn); setConnectionMode('profile'); }}
                              >
                                <img src={conn.avatar} alt={conn.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all" />
                                <div className="flex-grow">
                                  <h3 className="font-bold text-on-surface">{conn.name}</h3>
                                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{conn.role} • {conn.specialty}</p>
                                  <p className="text-[10px] text-on-surface-variant font-medium opacity-50">Conectado em {conn.connectedAt}</p>
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setActiveTab('chat'); }}
                                  className="px-6 py-2.5 border border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-xs uppercase tracking-widest"
                                >
                                  Mensagem
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="conn_profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto w-full">
                        <button onClick={() => setConnectionMode('list')} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
                          <ArrowLeft className="w-4 h-4" /> Voltar para conexões
                        </button>
                        
                        <div className="bg-white rounded-[40px] shadow-2xl border border-outline-variant/10 overflow-hidden">
                          <div className="p-10 flex flex-col items-center text-center">
                            <img src={selectedConnection?.avatar} alt={selectedConnection?.name} className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary/10 shadow-lg" />
                            <h2 className="text-3xl font-black mb-1">{selectedConnection?.name}</h2>
                            <div className="flex items-center gap-2 text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                              <Briefcase className="w-4 h-4" /> {selectedConnection?.role} • {selectedConnection?.specialty}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant opacity-60 mb-8">
                              <MapPin className="w-4 h-4" /> São Paulo, SP
                            </div>

                            <p className="text-on-surface-variant font-medium leading-relaxed mb-10 max-w-md">
                              {selectedConnection?.bio}
                            </p>

                            <div className="grid grid-cols-4 gap-4 w-full mb-10">
                              <StatItem label="Mentorias" value={selectedConnection?.stats.mentorias.toString() || '0'} />
                              <StatItem label="Conexões" value={selectedConnection?.stats.conexões.toString() || '0'} />
                              <StatItem label="Startups" value={selectedConnection?.stats.startups.toString() || '0'} />
                              <StatItem label="Eventos" value={selectedConnection?.stats.eventos.toString() || '0'} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                              <button className="py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest">
                                Conectar
                              </button>
                              <button 
                                onClick={() => setActiveTab('chat')}
                                className="py-4 border border-outline-variant text-on-surface-variant font-black rounded-2xl hover:bg-surface-container-low transition-all text-xs uppercase tracking-widest"
                              >
                                Mensagem
                              </button>
                            </div>
                          </div>
                          
                          <div className="px-10 pb-10">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-on-surface">Áreas de expertise</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedConnection?.expertise.map(exp => (
                                <span key={exp} className="px-5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface-variant">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {activeTab === 'startups' && (
                <motion.div 
                  key="startups"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {startupMode === 'list' ? (
                      <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight">Startups</h2>
                            <p className="text-sm font-semibold text-on-surface-variant/60 mt-1">
                              {startupMeta.total} startup{startupMeta.total === 1 ? '' : 's'} conectada{startupMeta.total === 1 ? '' : 's'} à SheConnect
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input
                                value={startupFilters.search}
                                onChange={(event) => setStartupFilters((current) => ({ ...current, search: event.target.value }))}
                                placeholder="Buscar startups..."
                                className="pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                              />
                            </div>
                            <input
                              value={startupFilters.category}
                              onChange={(event) => setStartupFilters((current) => ({ ...current, category: event.target.value }))}
                              placeholder="Categoria"
                              className="w-32 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                            />
                            <input
                              value={startupFilters.stage}
                              onChange={(event) => setStartupFilters((current) => ({ ...current, stage: event.target.value }))}
                              placeholder="Estágio"
                              className="w-32 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                            />
                          </div>
                        </div>

                        {(startupError || startupSuccess) && (
                          <div className={cn(
                            "rounded-2xl px-5 py-4 text-sm font-bold border",
                            startupError ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                          )}>
                            {startupError || startupSuccess}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {isLoadingStartups && Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-[32px] border border-outline-variant/30 p-6 animate-pulse">
                              <div className="w-16 h-16 rounded-2xl bg-surface-container-low mb-6" />
                              <div className="h-5 bg-surface-container-low rounded-full mb-3 w-2/3" />
                              <div className="h-3 bg-surface-container-low rounded-full mb-5 w-1/3" />
                              <div className="h-16 bg-surface-container-low rounded-2xl" />
                            </div>
                          ))}

                          {!isLoadingStartups && startups.map((startup) => (
                            <div key={startup.id} className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm hover:shadow-md transition-all p-6 group">
                              <div className="flex items-start justify-between gap-3 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <Rocket className="w-8 h-8" />
                                </div>
                                {canManageStartup(startup) && (
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => openEditStartup(startup)} className="w-9 h-9 rounded-xl border border-outline-variant/40 text-primary hover:bg-primary/5 flex items-center justify-center transition-colors" title="Editar">
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => void handleDeleteStartup(startup)} className="w-9 h-9 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors" title="Excluir">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-on-surface mb-1">{startup.name}</h3>
                              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">{startup.category}</p>
                              <p className="text-sm font-medium text-on-surface-variant/70 line-clamp-3 mb-5">{startup.description}</p>
                              <div className="inline-flex px-3 py-1 rounded-full bg-surface-container-low text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6">
                                {startup.stage}
                              </div>
                              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                                <span className="text-xs font-bold text-on-surface-variant/60">Estágio: <span className="text-on-surface">{startup.stage}</span></span>
                                <button onClick={() => openEditStartup(startup)} className="text-primary hover:translate-x-1 transition-transform" disabled={!canManageStartup(startup)}>
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {!isLoadingStartups && startups.length === 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-[32px] border border-outline-variant/30 p-10 text-center">
                              <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary mx-auto mb-5 flex items-center justify-center">
                                <Rocket className="w-8 h-8" />
                              </div>
                              <h3 className="text-xl font-black text-on-surface mb-2">Nenhuma startup encontrada</h3>
                              <p className="text-sm font-semibold text-on-surface-variant/60 max-w-md mx-auto">
                                Ajuste os filtros ou cadastre uma nova startup para começar sua vitrine na SheConnect.
                              </p>
                            </div>
                          )}

                          {canCreateStartup && (
                            <button 
                              onClick={openCreateStartup}
                              className="bg-surface-container-low border-2 border-dashed border-outline-variant rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all p-8 min-h-[260px]"
                            >
                              <span className="text-3xl">+</span>
                              <span className="text-sm font-bold">Nova Startup</span>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto w-full">
                        <button onClick={() => setStartupMode('list')} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform">
                          <ArrowLeft className="w-4 h-4" /> Voltar para lista
                        </button>
                        <div className="bg-white p-8 rounded-[32px] border border-outline-variant/30 shadow-xl">
                          <h2 className="text-2xl font-bold text-on-surface mb-8">{startupMode === 'edit' ? 'Editar Startup' : 'Nova Startup'}</h2>
                          {startupError && (
                            <div className="rounded-2xl px-5 py-4 text-sm font-bold border bg-red-50 text-red-600 border-red-100 mb-6">
                              {startupError}
                            </div>
                          )}
                          <form onSubmit={handleSaveStartup} className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Nome da startup</label>
                              <input value={startupForm.name} onChange={(event) => handleStartupFieldChange('name', event.target.value)} placeholder="Ex: TechGirls" className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium" required />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Descrição</label>
                              <textarea value={startupForm.description} onChange={(event) => handleStartupFieldChange('description', event.target.value)} placeholder="Conte um pouco sobre sua startup..." className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium h-32" required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">Área de atuação</label>
                                <select value={startupForm.category} onChange={(event) => handleStartupFieldChange('category', event.target.value)} className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium cursor-pointer" required>
                                  <option value="">Selecione</option>
                                  <option value="Educação">Educação</option>
                                  <option value="Tecnologia">Tecnologia</option>
                                  <option value="Saúde">Saúde</option>
                                  <option value="Sustentabilidade">Sustentabilidade</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">Estágio atual</label>
                                <select value={startupForm.stage} onChange={(event) => handleStartupFieldChange('stage', event.target.value)} className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium cursor-pointer" required>
                                  <option value="">Selecione</option>
                                  <option value="Ideação">Ideação</option>
                                  <option value="Validação">Validação</option>
                                  <option value="Tração">Tração</option>
                                  <option value="Seed">Seed</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Site (opcional)</label>
                              <input value={startupForm.website} onChange={(event) => handleStartupFieldChange('website', event.target.value)} placeholder="https://seudominio.com" className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">LinkedIn (opcional)</label>
                                <input value={startupForm.linkedin} onChange={(event) => handleStartupFieldChange('linkedin', event.target.value)} placeholder="https://linkedin.com/company/..." className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">Instagram (opcional)</label>
                                <input value={startupForm.instagram} onChange={(event) => handleStartupFieldChange('instagram', event.target.value)} placeholder="https://instagram.com/..." className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Pitch (opcional)</label>
                              <textarea value={startupForm.pitch} onChange={(event) => handleStartupFieldChange('pitch', event.target.value)} placeholder="Resumo do pitch para mentoras e investidoras..." className="w-full px-5 py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary outline-none transition-all font-medium h-28" />
                            </div>
                            <div className="flex gap-4 pt-4">
                              <button type="button" onClick={() => { resetStartupForm(); setStartupMode('list'); }} className="flex-grow py-4 border border-outline-variant text-on-surface-variant font-bold rounded-2xl hover:bg-surface-container-low transition-all">Cancelar</button>
                              <button type="submit" disabled={isSubmitting} className="flex-grow py-4 bg-primary text-white font-bold rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center">
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : startupMode === 'edit' ? "Atualizar Startup" : "Salvar Startup"}
                              </button>
                            </div>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-[#080625] text-white font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(129,39,207,0.35),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(96,99,238,0.28),_transparent_30%)]" />
        <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
          <button className="rounded-3xl bg-white px-5 py-3 shadow-2xl shadow-black/10" onClick={() => setView('home')}>
            <img src="/logo-sheconnect.png" alt="SheConnect Logo" className="h-16 md:h-20 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => setView('login')} className="hidden sm:inline-flex px-5 py-3 rounded-full text-sm font-bold text-white/75 hover:text-white hover:bg-white/10 transition-all">
              Entrar
            </button>
            <button onClick={() => setView('signup')} className="px-5 py-3 rounded-full bg-white text-[#181445] text-sm font-black shadow-2xl shadow-white/10 hover:scale-105 active:scale-95 transition-all">
              Criar conta
            </button>
          </div>
        </header>

        <main className="relative z-10 px-6 md:px-12 pb-16">
          <section className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center min-h-[calc(100vh-96px)] pt-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/70 backdrop-blur">
                <CheckCircle2 className="w-4 h-4 text-secondary-container" />
                Comunidade, negócios e crescimento
              </div>

              <div className="space-y-6">
                <h1 className="max-w-4xl text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
                  A rede que impulsiona mulheres empreendedoras.
                </h1>
                <p className="max-w-2xl text-lg md:text-xl text-white/62 font-semibold leading-relaxed">
                  A SheConnect conecta fundadoras, mentoras e investidoras para transformar ideias em negócios mais fortes, colaborativos e escaláveis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setView('signup')} className="group px-7 py-4 bg-primary-container text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:bg-primary transition-all flex items-center justify-center gap-2">
                  Começar agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={() => setView('app')} className="px-7 py-4 bg-white/10 border border-white/15 rounded-2xl font-black text-white hover:bg-white/15 transition-all backdrop-blur">
                  Ver dashboard demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-2xl pt-4">
                {HOME_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <p className="text-2xl md:text-3xl font-black">{stat.value}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-white/45">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-secondary/20 to-white/10 blur-3xl" />
              <div className="relative rounded-[40px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
                <div className="rounded-[32px] bg-[#f8f6ff] text-on-surface p-6 md:p-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Visão da jornada</p>
                      <h2 className="text-2xl font-black">Dashboard SheConnect</h2>
                    </div>
                    <div className="flex -space-x-3">
                      {INITIAL_CONNECTIONS.slice(0, 3).map((conn) => (
                        <img key={conn.id} src={conn.avatar} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <MetricCard label="Mentorias" value="12" sublabel="este mês" icon={<Users className="w-5 h-5 text-primary" />} trend="+18%" />
                    <MetricCard label="Conexões" value="248" sublabel="rede ativa" icon={<Network className="w-5 h-5 text-secondary" />} trend="+32" />
                  </div>

                  <div className="rounded-[28px] bg-white p-5 border border-outline-variant/20 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black">Crescimento da rede</h3>
                      <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full">+42%</span>
                    </div>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA}>
                          <defs>
                            <linearGradient id="homePreview" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6063ee" stopOpacity={0.22}/>
                              <stop offset="95%" stopColor="#6063ee" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#6063ee" strokeWidth={4} fill="url(#homePreview)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <section className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5 py-10">
            {HOME_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[32px] border border-white/10 bg-white/[0.07] p-7 backdrop-blur hover:bg-white/[0.1] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                  <p className="text-sm font-semibold text-white/55 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 h-16 bg-surface/70 backdrop-blur-md border-b border-outline-variant/30 z-50">
        <button type="button" className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')} aria-label="Voltar para a página principal">
          <img 
            src="/logo-sheconnect.png" 
            alt="SheConnect Logo" 
            className="h-12 md:h-16 w-auto object-contain"
          />
        </button>
        <div className="hidden md:flex gap-6 items-center">
          <button 
            onClick={() => setView(view === 'login' ? 'signup' : 'login')}
            className="text-primary font-bold text-sm hover:opacity-80 transition-opacity"
          >
            {view === 'login' ? 'Criar Conta' : 'Fazer Login'}
          </button>
        </div>
      </header>

      <main className="flex-grow flex pt-16 h-screen">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start p-6 md:p-12 overflow-y-auto">
          <div className="w-full max-w-form-width py-8 md:py-12">
            <AnimatePresence mode="wait">
              {view === 'signup' && (
                <motion.div key="signup" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Crie sua conta</h1>
                  <p className="text-on-surface-variant mb-10 font-bold opacity-60">É rápido e gratuito</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Nome Completo" placeholder="Seu nome completo" />
                    <Field label="Email" placeholder="nome@exemplo.com" type="email" />
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Senha" placeholder="••••••••" type="password" />
                      <Field label="Confirmar Senha" placeholder="••••••••" type="password" />
                    </div>
                    <div className="pt-4">
                      <label className="text-sm font-semibold text-on-surface-variant block mb-3">Eu sou...</label>
                      <div className="grid grid-cols-3 gap-3">
                        <RoleCardAuth isSelected={role === 'entrepreneur'} onClick={() => setRole('entrepreneur')} icon={<Briefcase className="w-6 h-6 mb-1" />} label="Empreendedora" />
                        <RoleCardAuth isSelected={role === 'mentor'} onClick={() => setRole('mentor')} icon={<Users className="w-6 h-6 mb-1" />} label="Mentora" />
                        <RoleCardAuth isSelected={role === 'investor'} onClick={() => setRole('investor')} icon={<BarChart3 className="w-6 h-6 mb-1" />} label="Investidora" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <input type="checkbox" id="terms" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" required />
                      <label htmlFor="terms" className="text-sm font-medium text-on-surface-variant cursor-pointer">Eu aceito os <a href="#" className="text-primary hover:underline font-bold">Termos e Condições</a></label>
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} label="Criar minha conta" />
                  </form>
                  <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">Já tem conta? <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">Entrar</button></p>
                </motion.div>
              )}

              {view === 'login' && (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Bem-vinda de volta</h1>
                  <p className="text-on-surface-variant mb-10 font-bold opacity-60">Acesse sua conta para continuar</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Email" placeholder="nome@exemplo.com" type="email" />
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-on-surface-variant">Senha</label>
                        <button type="button" onClick={() => setView('forgot-password')} className="text-xs text-primary font-black uppercase hover:underline">Esqueceu a senha?</button>
                      </div>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:bg-white focus:border-primary outline-none transition-all" required />
                    </div>
                    <SubmitButton isSubmitting={isSubmitting} label="Entrar Agora" />
                  </form>
                  <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">Não tem conta? <button onClick={() => setView('signup')} className="text-primary font-bold hover:underline">Cadastre-se</button></p>
                </motion.div>
              )}

              {view === 'forgot-password' && (
                <motion.div key="forgot" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <button onClick={() => setView('login')} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"><ArrowLeft className="w-4 h-4" /> Voltar</button>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight flex items-center gap-3"><Lock className="w-8 h-8 text-secondary" /> Recuperar senha</h1>
                  <p className="text-on-surface-variant mb-8 font-medium">Informe seu email para receber as instruções.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Email de Cadastro" placeholder="nome@exemplo.com" type="email" icon={<Mail className="w-4 h-4" />} />
                    <SubmitButton isSubmitting={isSubmitting} label="Enviar Instruções" />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {(view === 'login' || view === 'signup') && (
              <div className="mt-12 flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-surface px-2 text-on-surface-variant/50">Ou continue com</span></div>
                </div>
                {authError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-xs font-bold text-red-600">
                    {authError}
                  </p>
                )}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <div ref={googleButtonRef} className="flex min-h-11 justify-center" />
                ) : (
                  <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700">
                    Configure VITE_GOOGLE_CLIENT_ID para ativar o login com Google.
                  </p>
                )}
              </div>
            )}

            <footer className="mt-16 py-8 flex flex-col items-center gap-4 text-center">
              <div className="flex gap-6 whitespace-nowrap">
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">Privacidade</a>
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">Termos</a>
                <a href="#" className="text-[10px] font-black uppercase text-on-surface-variant/40 hover:text-primary transition-colors">Ajuda</a>
              </div>
              <p className="text-[10px] text-on-surface-variant/30 font-bold">© 2024 SheConnect. Criando o futuro juntas.</p>
            </footer>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-[#181445] relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#181445] via-[#4648d4] to-[#8127cf] opacity-90" />
          <div className="relative z-10 w-full max-w-lg text-center text-white">
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.6 }} className="mb-12">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_RA2YsNaof57lAW7m81AxXAtJZRs-qbB9UCOCJr4CZVp051r3AOSLBwJ9W-VO7BbGZuNoo_mnC8QXBfXCbcEOyWkB-nCZDyXqDzEeAraMJ0iogxOW9R3cFITPOmn9v-OQqewjR72-9BI16busH2Kmg8DwXw8iIqogklQ4yRMA-KYUzWzOsjF_u6t_ZIFLnAR3hKhxFMs5rvxf_H2OPY0DVx9oqluQduHolcH9XmTWYq1DyvyaVDNLuTC7w6vCCwM9_cW0tcJks9Tz" alt="Hero" className="w-80 h-80 mx-auto object-cover rounded-[48px] border-8 border-white/5 shadow-2xl" />
              </motion.div>
            </AnimatePresence>
            <h2 className="text-4xl font-black mb-6 italic tracking-tight underline decoration-secondary decoration-4 underline-offset-8">
              {view === 'login' ? 'Bem-vinda de volta à sua potência.' : 'Mulheres fortes conectam futuros.'}
            </h2>
            <p className="text-lg opacity-60 max-w-sm mx-auto font-bold">
              {view === 'login'
                ? 'Continue sua jornada, fortaleça sua rede e transforme seus próximos passos em conquista.'
                : 'Quando uma mulher cresce, ela abre caminho para muitas outras brilharem.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, sublabel, icon, trend }: { label: string, value: string, sublabel: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-white p-6 rounded-[30px] border border-outline-variant/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-default">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="p-3 rounded-2xl bg-surface-container-low w-fit">{icon}</div>
        {trend && (
          <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-on-surface tracking-tight">{value}</p>
      <p className="text-[10px] text-on-surface-variant font-bold uppercase mt-2 opacity-50">{sublabel}</p>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-on-surface">{value}</p>
    </div>
  );
}

function Field({ label, placeholder, type = "text", icon }: { label: string, placeholder: string, type?: string, icon?: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30">{icon}</div>}
        <input type={type} placeholder={placeholder} className={cn("w-full py-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold", icon ? "pl-11 pr-5" : "px-5")} required />
      </div>
    </div>
  );
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean, label: string }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="w-full mt-4 bg-primary text-white font-black py-4 rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
      {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{label} <ArrowRight className="w-4 h-4" /></>}
    </motion.button>
  );
}

function RoleCardAuth({ isSelected, onClick, icon, label }: { isSelected: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("p-4 border-2 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-1", isSelected ? 'border-primary bg-primary/5 text-primary shadow-inner' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low')}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">{label}</span>
    </button>
  );
}

function SocialButtonAuth({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 py-4 border border-outline-variant/30 rounded-2xl hover:bg-surface-container-low transition-colors font-bold text-xs uppercase tracking-widest text-on-surface-variant/60">
      {icon}
      <span>{label}</span>
    </button>
  );
}
