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
import { Bell } from 'lucide-react';

export function NotificationsPage() {
  const { startups, notifications, isLoadingNotifications, notificationError, handleMarkAllNotificationsRead, handleMarkNotificationRead, handleDeleteNotification } = useAppControllerContext();

  return (
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
  );
}
