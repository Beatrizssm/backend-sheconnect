import { motion, AnimatePresence } from 'motion/react';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { cn } from '../../../../shared/lib/cn';
import { ChartFrame } from '../../../../shared/components/chart-frame';
import { MetricCard } from '../../../../shared/components/metric-card';
import { StatItem } from '../../../../shared/components/stat-item';
import { formatDate, formatTime, getShortId } from '../../../../shared/utils/date.utils';
import { getMentorshipUserName } from '../../../../shared/utils/chat.utils';
import { MENTORSHIP_STATUS_LABELS, MENTORSHIP_STATUS_STYLES } from '../../../mentorships/domain/mentorship.constants';
import type { AppTab, MentorshipStatus } from '../../../../shared/types/app.types';
import { Search, Users, ArrowLeft } from 'lucide-react';

export function MentorshipsPage() {
  const {
    mentorshipMode,
    setMentorshipMode,
    isSubmitting,
    mentorshipForm,
    mentorshipFilters,
    setMentorshipFilters,
    isLoadingMentorships,
    isLoadingMentors,
    mentorshipError,
    mentorshipSuccess,
    canCreateMentorship,
    mentorshipPageTitle,
    mentorshipPageSubtitle,
    filteredMentorships,
    mentorshipMentorOptions,
    canAcceptOrRejectMentorship,
    canScheduleMentorship,
    canStartMentorship,
    canFinishMentorship,
    canCancelMentorship,
    resetMentorshipForm,
    openCreateMentorship,
    handleMentorshipFieldChange,
    handleConfirmSchedule,
    handleMentorshipAction,
  } = useAppControllerContext();

  return (
<motion.div 
                  key="mentorias"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {mentorshipMode === 'list' ? (
                      <motion.div key="mentor_list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{mentorshipPageTitle}</h2>
                            <p className="text-sm font-semibold text-on-surface-variant/60 mt-1">
                              {mentorshipPageSubtitle}
                            </p>
                            <p className="text-xs font-bold text-on-surface-variant/50 mt-2">
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
                                + Solicitar mentoria
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
                                  {mentorship.initialMessage && (
                                    <p className="text-xs font-semibold text-on-surface-variant/60 mt-3 max-w-3xl">
                                      <span className="font-black uppercase tracking-widest text-primary">Mensagem inicial: </span>
                                      {mentorship.initialMessage}
                                    </p>
                                  )}
                                  {mentorship.rejectionReason && (
                                    <p className="text-xs font-semibold text-red-500 mt-2 max-w-3xl">
                                      Motivo da rejeição: {mentorship.rejectionReason}
                                    </p>
                                  )}
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
                                  {canScheduleMentorship(mentorship) && (
                                    <button
                                      onClick={() => void handleMentorshipAction(mentorship, 'schedule')}
                                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                      Agendar sessão
                                    </button>
                                  )}
                                  {canStartMentorship(mentorship) && (
                                    <button
                                      onClick={() => void handleMentorshipAction(mentorship, 'start')}
                                      className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                      Iniciar
                                    </button>
                                  )}
                                  {canFinishMentorship(mentorship) && (
                                    <button
                                      onClick={() => void handleMentorshipAction(mentorship, 'finish')}
                                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                                    >
                                      Finalizar
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">Área de interesse</label>
                                <input
                                  value={mentorshipForm.mentorshipArea ?? mentorshipForm.category}
                                  onChange={(event) => {
                                    handleMentorshipFieldChange('mentorshipArea', event.target.value);
                                    handleMentorshipFieldChange('category', event.target.value);
                                  }}
                                  placeholder="Growth, Finanças, Marketing..."
                                  className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface-variant">Categoria</label>
                                <input
                                  value={mentorshipForm.category}
                                  onChange={(event) => handleMentorshipFieldChange('category', event.target.value)}
                                  placeholder="Categoria da mentoria"
                                  className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-bold text-on-surface-variant">Mensagem inicial</label>
                              <textarea
                                value={mentorshipForm.initialMessage ?? ''}
                                onChange={(event) => handleMentorshipFieldChange('initialMessage', event.target.value)}
                                placeholder="Apresente seu desafio e o que espera da mentoria..."
                                className="w-full px-5 py-4 bg-white border border-outline-variant rounded-2xl focus:border-primary outline-none transition-all font-medium h-28"
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
  );
}
