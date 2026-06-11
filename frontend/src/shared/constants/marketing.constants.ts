import { LayoutDashboard, Network, Users } from 'lucide-react';
import type { Connection, Mentor, Startup } from '../types/app.types';

export const CHART_DATA = [
  { name: 'Jan', value: 100 },
  { name: 'Fev', value: 150 },
  { name: 'Mar', value: 240 },
  { name: 'Abr', value: 180 },
  { name: 'Mai', value: 260 },
  { name: 'Jun', value: 380 },
];

export const HOME_STATS = [
  { value: '1.2k+', label: 'mulheres conectadas' },
  { value: '350+', label: 'startups acompanhadas' },
  { value: '1k+', label: 'mentorias realizadas' },
];

export const HOME_FEATURES = [
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

export const INITIAL_STARTUPS: Startup[] = [
  { id: '1', founderId: 'demo-founder', name: 'TechGirls', category: 'Educação', description: 'Plataforma de educação tecnológica.', stage: 'Seed', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', founderId: 'demo-founder', name: 'GreenMind', category: 'Sustentabilidade', description: 'Soluções para economia circular.', stage: 'Ideação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', founderId: 'demo-founder', name: 'Vita Health', category: 'Saúde', description: 'Monitoramento remoto de pacientes.', stage: 'Validação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', founderId: 'demo-founder', name: 'Connecte', category: 'Comunicação', description: 'Rede de colaboração corporativa.', stage: 'Tração', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', founderId: 'demo-founder', name: 'DevFlow', category: 'Tecnologia', description: 'Automação de workflows de dev.', stage: 'Série A', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', founderId: 'demo-founder', name: 'AgroSmart', category: 'Agronegócio', description: 'Inteligência de solo para fazendas.', stage: 'Validação', website: null, linkedin: null, instagram: null, pitch: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const MENTORS: Mentor[] = [
  { id: '1', name: 'Ana Clara Lima', specialty: 'Especialista em Growth', experience: '10 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: '2', name: 'Juliana Silva', specialty: 'Especialista em Finanças', experience: '8 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: '3', name: 'Carla Mendes', specialty: 'Especialista em Marketing', experience: '12 anos de experiência', availability: 'Disponível esta semana', avatar: 'https://images.unsplash.com/photo-1544005313-94ff6747cae0?w=100&h=100&fit=crop' },
];

export const EVENTS_PREVIEW = [
  { id: '1', name: 'Startup Day Women 2024', date: '24 de Maio', location: 'São Paulo - SP', description: 'O maior evento de empreendedorismo feminino do Brasil.', image: 'https://images.unsplash.com/photo-1540575861501-7ad05823c23d?w=800&q=80' },
  { id: '2', name: 'Tech & Business Summit', date: '10 de Junho', location: 'Online', description: 'Inovação e tecnologia impulsionando negócios femininos.', image: 'https://images.unsplash.com/photo-1591115765373-520b7a21765b?w=800&q=80' },
  { id: '3', name: 'Investidoras Summit', date: '05 de Julho', location: 'Rio de Janeiro - RJ', description: 'Conectando startups a investidoras experientes.', image: 'https://images.unsplash.com/photo-1560523182-77443935586b?w=800&q=80' },
];

export const INITIAL_CONNECTIONS: Connection[] = [
  {
    id: '1',
    name: 'Juliana Silva',
    role: 'Mentora',
    specialty: 'Finanças',
    connectedAt: '12/05/2024',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    bio: 'Especialista em finanças corporativas e investimentos. Ajudando mulheres a estruturarem negócios sólidos e escaláveis.',
    stats: { mentorias: 48, conexões: 312, startups: 15, eventos: 22 },
    expertise: ['Finanças', 'Investimentos', 'Valuation', 'Captação'],
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
    expertise: ['Healthtech', 'Liderança', 'Product'],
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
    expertise: ['VC', 'M&A', 'Strategy'],
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
    expertise: ['Branding', 'Growth', 'Content'],
  },
];
