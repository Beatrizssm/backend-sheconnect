import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { ReportUserModal } from '../../../profile/presentation/components/report-user-modal';
import { cn } from '../../../../shared/lib/cn';
import { ChartFrame } from '../../../../shared/components/chart-frame';
import { MetricCard } from '../../../../shared/components/metric-card';
import { StatItem } from '../../../../shared/components/stat-item';
import { formatDate, formatTime, getShortId } from '../../../../shared/utils/date.utils';
import { getMentorshipUserName } from '../../../../shared/utils/chat.utils';
import { MENTORSHIP_STATUS_LABELS, MENTORSHIP_STATUS_STYLES } from '../../../mentorships/domain/mentorship.constants';
import type { AppTab } from '../../../../shared/types/app.types';
import { Search, Settings, ArrowLeft, Briefcase, MapPin, Flag } from 'lucide-react';

export function NetworkingPage() {
  const { setActiveTab, connectionMode, setConnectionMode, selectedConnection, setSelectedConnection, startups, connections, connectionsError, role, handleConnect } = useAppControllerContext();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFeedback, setReportFeedback] = useState('');

  return (
<motion.div 
                  key="conexões"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {connectionMode === 'list' ? (
                      <motion.div key="conn_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Conexões</h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-auto">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input placeholder="Buscar conexões..." className="w-full sm:w-auto pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors">
                              <Settings className="w-4 h-4" /> Filtro
                            </button>
                          </div>
                        </div>

                        {(connectionsError || reportFeedback) && (
                          <div
                            className={cn(
                              'rounded-2xl px-5 py-4 text-sm font-bold border',
                              connectionsError
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100',
                            )}
                          >
                            {connectionsError || reportFeedback}
                          </div>
                        )}

                        <div className="bg-white rounded-[32px] border border-outline-variant/30 shadow-sm overflow-hidden">
                          <div className="divide-y divide-outline-variant/10">
                            {connections.map((conn) => (
                              <div 
                                key={conn.id} 
                                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-surface-container-low/30 transition-colors cursor-pointer group"
                                onClick={() => { setSelectedConnection(conn); setConnectionMode('profile'); }}
                              >
                                <img src={conn.avatar} alt={conn.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/5 group-hover:ring-primary/20 transition-all" />
                                <div className="flex-grow min-w-0 w-full sm:w-auto">
                                  <h3 className="font-bold text-on-surface">{conn.name}</h3>
                                  <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{conn.role} • {conn.specialty}</p>
                                  <p className="text-[10px] text-on-surface-variant font-medium opacity-50">Conectado em {conn.connectedAt}</p>
                                </div>
                                {conn.connectedAt === 'Recomendação' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleConnect(conn);
                                    }}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-xs uppercase tracking-widest"
                                  >
                                    Conectar
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTab('chat');
                                    }}
                                    className="w-full sm:w-auto px-6 py-2.5 border border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 transition-all text-xs uppercase tracking-widest"
                                  >
                                    Mensagem
                                  </button>
                                )}
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
                          <div className="p-6 sm:p-10 flex flex-col items-center text-center">
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

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mb-10">
                              <StatItem label="Mentorias" value={selectedConnection?.stats.mentorias.toString() || '0'} />
                              <StatItem label="Conexões" value={selectedConnection?.stats.conexões.toString() || '0'} />
                              <StatItem label="Startups" value={selectedConnection?.stats.startups.toString() || '0'} />
                              <StatItem label="Eventos" value={selectedConnection?.stats.eventos.toString() || '0'} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                              <button onClick={() => selectedConnection && void handleConnect(selectedConnection)} className="py-4 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest">
                                Conectar
                              </button>
                              <button 
                                onClick={() => setActiveTab('chat')}
                                className="py-4 border border-outline-variant text-on-surface-variant font-black rounded-2xl hover:bg-surface-container-low transition-all text-xs uppercase tracking-widest"
                              >
                                Mensagem
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setReportOpen(true)}
                              className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
                            >
                              <Flag className="w-4 h-4" />
                              Denunciar perfil
                            </button>
                          </div>
                          
                          <div className="px-6 sm:px-10 pb-6 sm:pb-10">
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

                  {selectedConnection?.sourceUserId && (
                    <ReportUserModal
                      open={reportOpen}
                      userId={selectedConnection.sourceUserId}
                      userName={selectedConnection.name}
                      onClose={() => setReportOpen(false)}
                      onSuccess={(message) => setReportFeedback(message)}
                    />
                  )}
                </motion.div>
  );
}
