import { motion, AnimatePresence } from 'motion/react';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { cn } from '../../../../shared/lib/cn';
import { ChartFrame } from '../../../../shared/components/chart-frame';
import { MetricCard } from '../../../../shared/components/metric-card';
import { StatItem } from '../../../../shared/components/stat-item';
import { formatDate, formatTime, getShortId } from '../../../../shared/utils/date.utils';
import { getMentorshipUserName } from '../../../../shared/utils/chat.utils';
import { MENTORSHIP_STATUS_LABELS, MENTORSHIP_STATUS_STYLES } from '../../../mentorships/domain/mentorship.constants';
import type { AppTab } from '../../../../shared/types/app.types';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Rocket, Users, Calendar, Network, CheckCircle2 } from 'lucide-react';

export function DashboardPage() {
  const { setActiveTab, connections, events, dashboard, startupMeta, mentorships, displayProfile, dashboardChartData, recentActivities, pendingMentorshipsCount } = useAppControllerContext();

  return (
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
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Olá, {displayProfile.name.split(' ')[0]}</h2>
                        <p className="text-white/60 font-semibold text-lg leading-relaxed max-w-2xl">
                          Sua rede ganhou novas conexões, mentorias e oportunidades. Veja os próximos passos para acelerar sua startup.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('mentorias')} className="rounded-3xl bg-white text-on-surface p-5 text-left hover:-translate-y-1 transition-all shadow-xl">
                          <Users className="w-6 h-6 text-primary mb-5" />
                          <p className="text-2xl font-black">{pendingMentorshipsCount}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/50">mentorias pendentes</p>
                        </button>
                        <button onClick={() => setActiveTab('eventos')} className="rounded-3xl bg-white/10 border border-white/10 p-5 text-left hover:-translate-y-1 transition-all">
                          <Calendar className="w-6 h-6 text-white mb-5" />
                          <p className="text-2xl font-black">{events.length}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/45">eventos sugeridos</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Mentorias" value={(dashboard?.kpis.mentorshipsCompleted ?? mentorships.length).toString()} sublabel="concluídas" icon={<Users className="w-6 h-6 text-primary" />} trend={`${dashboard?.kpis.mentorshipsPending ?? 0} pendentes`} />
                    <MetricCard label="Conexões" value={(dashboard?.kpis.networkingConnections ?? connections.length).toString()} sublabel="rede ativa" icon={<Network className="w-6 h-6 text-secondary" />} trend="dados reais" />
                    <MetricCard label="Eventos" value={(dashboard?.kpis.activeEvents ?? events.length).toString()} sublabel="ativos" icon={<Calendar className="w-6 h-6 text-indigo-500" />} trend="próximos" />
                    <MetricCard label="Startups" value={(dashboard?.kpis.totalStartups ?? startupMeta.total).toString()} sublabel="cadastradas" icon={<Rocket className="w-6 h-6 text-purple-500" />} trend={`${dashboard?.kpis.monthlyGrowth ?? 0}% mês`} />
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
                      
                      <ChartFrame className="h-[300px] w-full">
                        <AreaChart data={dashboardChartData}>
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
                      </ChartFrame>
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
                        {recentActivities.length === 0 && (
                          <p className="text-sm font-semibold text-on-surface-variant/60">
                            Suas notificações recentes aparecerão aqui.
                          </p>
                        )}
                        {recentActivities.map((activity) => (
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
  );
}
