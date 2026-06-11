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
import { Search, Edit2, Rocket, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

export function StartupsPage() {
  const { startupMode, setStartupMode, startups, isSubmitting, startupForm, startupFilters, setStartupFilters, isLoadingStartups, startupError, startupSuccess, startupMeta, canCreateStartup, canManageStartup, handleStartupFieldChange, resetStartupForm, openCreateStartup, openEditStartup, handleSaveStartup, handleDeleteStartup } = useAppControllerContext();

  return (
<motion.div 
                  key="startups"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full font-sans"
                >
                  <AnimatePresence mode="wait">
                    {startupMode === 'list' ? (
                      <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
  );
}
