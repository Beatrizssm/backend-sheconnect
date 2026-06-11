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
import { Search, Edit2, LogOut } from 'lucide-react';
import { AdminTrustPanel } from '../components/admin-trust-panel';

export function UsersAdminPage() {
  const { dashboard, adminUsersList } = useAppControllerContext();

  return (
<motion.div 
                  key="usuarios"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AdminTrustPanel />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                          {adminUsersList.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm font-semibold text-on-surface-variant/60">
                                {dashboard ? 'Nenhum usuário cadastrado.' : 'Carregando usuários...'}
                              </td>
                            </tr>
                          )}
                          {adminUsersList.map((user) => (
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
  );
}
