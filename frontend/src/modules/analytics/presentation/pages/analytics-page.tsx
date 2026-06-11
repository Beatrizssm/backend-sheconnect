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

export function AnalyticsPage() {
  const { events, dashboard, dashboardChartData, analyticsCards, pieChartData } = useAppControllerContext();

  return (
<motion.div 
                  key="analytics"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>

                  {!dashboard && (
                    <p className="text-sm font-semibold text-on-surface-variant/60">Carregando métricas da plataforma...</p>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {analyticsCards.map((card, i) => (
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
                      <ChartFrame className="h-[300px]">
                        <AreaChart data={dashboardChartData}>
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
                      </ChartFrame>
                    </div>

                    <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-outline-variant/30 shadow-sm">
                      <h3 className="text-lg font-bold mb-8">Usuários por tipo</h3>
                      <div className="h-[250px] relative">
                        <ChartFrame className="h-full">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ChartFrame>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <p className="text-2xl font-black">{(dashboard?.kpis.totalUsers ?? 0).toLocaleString('pt-BR')}</p>
                            <p className="text-[8px] font-bold text-on-surface-variant uppercase">Total</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 space-y-3">
                        {pieChartData.map((item, i) => (
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
  );
}
