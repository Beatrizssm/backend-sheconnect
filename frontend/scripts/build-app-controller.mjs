import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', 'src');
const lines = fs.readFileSync(path.join(root, 'pages', 'AppPage.tsx'), 'utf8').split(/\r?\n/);

const hookStart = lines.findIndex((l) => l.includes('export default function App'));
const appReturnStart = lines.findIndex((l) => l.includes("if (view === 'app')"));

const hookBody = lines.slice(hookStart + 1, appReturnStart);

const names = new Set();
for (const line of hookBody) {
  const constMatch = line.match(/^\s*const (\w+) =/);
  if (constMatch) names.add(constMatch[1]);
}

const returnKeys = [...names].filter((n) => !n.startsWith('timeout') && !n.startsWith('off') && n !== 'form' && n !== 'response' && n !== 'data' && n !== 'result' && n !== 'search' && n !== 'optionsById' && n !== 'searchable' && n !== 'user' && n !== 'kpis' && n !== 'total' && n !== 'source' && n !== 'startupGrowth' && n !== 'names' && n !== 'date' && n !== 'diffMinutes' && n !== 'diffHours' && n !== 'diffDays');

const header = `import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Briefcase,
  Users,
  BarChart3,
  LayoutDashboard,
  Rocket,
  Calendar,
  Network,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { authService, type AuthUser } from '../../../services/auth.service';
import { AUTH_TOKEN_STORAGE_KEY, api, getApiErrorMessage } from '../../../services/api';
import { chatService } from '../../../services/chat.service';
import { dashboardService } from '../../../services/dashboard.service';
import { eventsService } from '../../../services/events.service';
import { mentorshipsService } from '../../../services/mentorships.service';
import { notificationsService, type Notification as ApiNotification } from '../../../services/notifications.service';
import { networkingService } from '../../../services/networking.service';
import { realtimeService } from '../../../services/realtime.service';
import { startupsService } from '../../../services/startups.service';
import {
  DEMO_ACTIVE_CHAT_ID,
  DEMO_CHAT_MESSAGES,
  DEMO_CONNECTIONS,
  DEMO_CONVERSATIONS,
  DEMO_EVENTS,
  DEMO_MENTORSHIPS,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILE,
  DEMO_STARTUPS,
  DEMO_USER_ID,
} from '../../../demo/demoData';
import { CHART_DATA } from '../../../shared/constants/marketing.constants';
import { EMPTY_STARTUP_FORM } from '../../startups/domain/startup.constants';
import { EMPTY_MENTORSHIP_FORM } from '../../mentorships/domain/mentorship.constants';
import type {
  AdminUser,
  AppTab,
  AuthView,
  Connection,
  ConnectionMode,
  Event,
  EventMode,
  Mentor,
  Mentorship,
  MentorshipFormState,
  MentorshipMode,
  Startup,
  StartupFormState,
  StartupMode,
  UserRole,
} from '../../../shared/types/app.types';
import {
  apiRoleLabel,
  apiRoleToUserRole,
  getStoredAuthUser,
  mapApiRoleToUserType,
  profileAvatar,
  roleToApiRole,
} from '../../../shared/utils/auth.utils';
import { formatRelativeTime, getShortId } from '../../../shared/utils/date.utils';
import { rolePieColor, rolePieLabel } from '../../../shared/utils/dashboard.utils';
import { toChatMessage, toConnection, toConversation } from '../../../shared/utils/chat.utils';
import { createContext, useContext } from 'react';

export type AppController = ReturnType<typeof useAppController>;

const AppControllerContext = createContext<AppController | null>(null);

export function AppControllerProvider({
  value,
  children,
}: {
  value: AppController;
  children: React.ReactNode;
}) {
  return <AppControllerContext.Provider value={value}>{children}</AppControllerContext.Provider>;
}

export function useAppControllerContext() {
  const value = useContext(AppControllerContext);
  if (!value) {
    throw new Error('useAppControllerContext must be used within AppControllerProvider');
  }
  return value;
}

export function useAppController(): AppController {
`;

const footer = `
  return {
${returnKeys.map((k) => `    ${k},`).join('\n')}
  };
}
`;

const output = header + hookBody.join('\n') + footer;
fs.writeFileSync(path.join(root, 'modules', 'app-shell', 'application', 'use-app-controller.tsx'), output);
console.log('Wrote use-app-controller.tsx with', returnKeys.length, 'keys');
