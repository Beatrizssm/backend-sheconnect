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
import { Search, Settings, Calendar, Network, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';

export function EventsPage() {
  const { eventMode, setEventMode, selectedEvent, setSelectedEvent, events, isLoadingEvents, eventsError, handleRegisterEvent } = useAppControllerContext();

  return (
<motion.div 
                  key="eventos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {eventMode === 'list' ? (
                      <motion.div key="event_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Eventos</h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full sm:w-auto">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                              <input placeholder="Buscar eventos..." className="w-full sm:w-auto pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-medium focus:border-primary outline-none transition-all" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-sm font-bold shadow-sm hover:bg-surface-container-low transition-colors">
                              <Settings className="w-4 h-4" /> Filtro
                            </button>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {eventsError && (
                            <div className="rounded-2xl px-5 py-4 text-sm font-bold border bg-red-50 text-red-600 border-red-100">
                              {eventsError}
                            </div>
                          )}
                          {isLoadingEvents && <p className="text-sm font-bold text-on-surface-variant">Carregando eventos...</p>}
                          {!isLoadingEvents && events.map((event) => (
                            <div key={event.id} className="bg-white rounded-[24px] border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all">
                              <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1540575861501-7ad05823c23d?w=800&q=80" alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <div className="p-5 sm:p-8 flex-grow flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-on-surface mb-2">{event.title}</h3>
                                <div className="flex flex-wrap gap-4 text-sm font-bold text-on-surface-variant/60 mb-4 uppercase tracking-widest">
                                  <span className="text-primary">{new Date(event.eventDate).toLocaleDateString('pt-BR')}</span>
                                  <span>•</span>
                                  <span>{event.location ?? (event.isOnline ? 'Online' : 'A definir')}</span>
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
                                  <button onClick={() => void handleRegisterEvent(event)} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all text-sm">
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
                            <img src="https://images.unsplash.com/photo-1540575861501-7ad05823c23d?w=800&q=80" className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-8 left-8 text-white">
                              <div className="flex items-center gap-2 mb-2 p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                                <Network className="w-6 h-6" />
                              </div>
                              <h1 className="text-4xl font-black">{selectedEvent?.title}</h1>
                            </div>
                          </div>
                          
                          <div className="p-10 space-y-8">
                            <div className="flex items-center gap-8 text-sm font-bold text-on-surface-variant">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span>{selectedEvent ? new Date(selectedEvent.eventDate).toLocaleString('pt-BR') : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{selectedEvent?.location ?? (selectedEvent?.isOnline ? 'Online' : 'A definir')}</span>
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

                            <button onClick={() => selectedEvent && void handleRegisterEvent(selectedEvent)} className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl hover:opacity-95 transition-all text-sm uppercase tracking-widest">
                              Inscrever-se no evento
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
  );
}
