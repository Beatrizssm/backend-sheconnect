import { AnimatePresence } from 'motion/react';
import { useAppControllerContext } from '../../application/use-app-controller';
import { AnalyticsPage } from '../../../analytics/presentation/pages/analytics-page';
import { UsersAdminPage } from '../../../users/presentation/pages/users-admin-page';
import { ChatPage } from '../../../chat/presentation/pages/chat-page';
import { NotificationsPage } from '../../../notifications/presentation/pages/notifications-page';
import { DashboardPage } from '../../../dashboard/presentation/pages/dashboard-page';
import { MentorshipsPage } from '../../../mentorships/presentation/pages/mentorships-page';
import { EventsPage } from '../../../events/presentation/pages/events-page';
import { NetworkingPage } from '../../../networking/presentation/pages/networking-page';
import { StartupsPage } from '../../../startups/presentation/pages/startups-page';

export function AppTabContent() {
  const { activeTab } = useAppControllerContext();

  return (
    <AnimatePresence mode="wait">
      {activeTab === 'analytics' && <AnalyticsPage key="analytics" />}
      {activeTab === 'usuarios' && <UsersAdminPage key="usuarios" />}
      {activeTab === 'chat' && <ChatPage key="chat" />}
      {activeTab === 'notificações' && <NotificationsPage key="notificações" />}
      {activeTab === 'dashboard' && <DashboardPage key="dashboard" />}
      {activeTab === 'mentorias' && <MentorshipsPage key="mentorias" />}
      {activeTab === 'eventos' && <EventsPage key="eventos" />}
      {activeTab === 'conexões' && <NetworkingPage key="conexões" />}
      {activeTab === 'startups' && <StartupsPage key="startups" />}
    </AnimatePresence>
  );
}
