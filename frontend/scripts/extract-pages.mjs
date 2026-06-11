import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', 'src');
const lines = fs.readFileSync(path.join(root, 'pages', 'AppPage.tsx'), 'utf8').split(/\r?\n/);

const controllerSource = fs.readFileSync(
  path.join(root, 'modules', 'app-shell', 'application', 'use-app-controller.tsx'),
  'utf8',
);
const controllerKeys = [...controllerSource.matchAll(/^\s{4}([a-zA-Z_][a-zA-Z0-9_]*),$/gm)].map((m) => m[1]);

const tabMarkers = [
  { key: "activeTab === 'analytics'", module: 'analytics', name: 'AnalyticsPage' },
  { key: "activeTab === 'usuarios'", module: 'users', name: 'UsersAdminPage' },
  { key: "activeTab === 'chat'", module: 'chat', name: 'ChatPage' },
  { key: "activeTab === 'notificações'", module: 'notifications', name: 'NotificationsPage' },
  { key: "activeTab === 'dashboard'", module: 'dashboard', name: 'DashboardPage' },
  { key: "activeTab === 'mentorias'", module: 'mentorships', name: 'MentorshipsPage' },
  { key: "activeTab === 'eventos'", module: 'events', name: 'EventsPage' },
  { key: "activeTab === 'conexões'", module: 'networking', name: 'NetworkingPage' },
  { key: "activeTab === 'startups'", module: 'startups', name: 'StartupsPage' },
];

function findLineIndex(predicate, from = 0) {
  for (let i = from; i < lines.length; i++) {
    if (predicate(lines[i])) return i;
  }
  return -1;
}

const tabAnimateStart = findLineIndex((l) => l.includes('<AnimatePresence mode="wait">'));

for (let m = 0; m < tabMarkers.length; m++) {
  const marker = tabMarkers[m];
  const start = findLineIndex((l) => l.includes(marker.key), tabAnimateStart);
  const nextStart =
    m + 1 < tabMarkers.length
      ? findLineIndex((l) => l.includes(tabMarkers[m + 1].key), start + 1)
      : findLineIndex((l) => l.trim() === '</AnimatePresence>', start + 1);

  let block = lines.slice(start, nextStart).join('\n');
  block = block.replace(/\{activeTab === '[^']+' && \(/, '').replace(/\)\}\s*$/, '').trim();

  const usedKeys = controllerKeys.filter((key) => new RegExp(`\\b${key}\\b`).test(block));
  const destructure = usedKeys.length ? `const { ${usedKeys.join(', ')} } = useAppControllerContext();` : 'useAppControllerContext();';

  const imports = new Set([
    "import { motion, AnimatePresence } from 'motion/react';",
    "import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';",
    "import { cn } from '../../../shared/lib/cn';",
    "import { ChartFrame } from '../../../shared/components/chart-frame';",
    "import { MetricCard } from '../../../shared/components/metric-card';",
    "import { StatItem } from '../../../shared/components/stat-item';",
    "import { formatDate, formatTime, getShortId } from '../../../shared/utils/date.utils';",
    "import { getMentorshipUserName } from '../../../shared/utils/chat.utils';",
    "import { MENTORSHIP_STATUS_LABELS, MENTORSHIP_STATUS_STYLES } from '../../mentorships/domain/mentorship.constants';",
    "import type { AppTab } from '../../../shared/types/app.types';",
  ]);

  if (block.includes('AreaChart') || block.includes('PieChart')) {
    imports.add("import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';");
  }
  if (block.includes('from \'lucide-react\'')) {
    // lucide icons are referenced as components in JSX
  }
  const lucideIcons = [
    'Search', 'Edit2', 'LogOut', 'Bell', 'Settings', 'Apple', 'Rocket', 'Users', 'Calendar', 'Network',
    'CheckCircle2', 'ArrowLeft', 'ArrowRight', 'Briefcase', 'MapPin', 'Trash2', 'MessageSquare',
  ].filter((icon) => block.includes(`<${icon}`) || block.includes(`${icon} className`));
  if (lucideIcons.length) {
    imports.add(`import { ${lucideIcons.join(', ')} } from 'lucide-react';`);
  }

  const pageContent = `${[...imports].join('\n')}

export function ${marker.name}() {
  ${destructure}

  return (
${block}
  );
}
`;

  const fileName = marker.name.replace(/Page$/, '-page').replace(/([A-Z])/g, (m, p, i) => (i ? '-' : '') + m.toLowerCase()) + '.tsx';
  const normalizedName = marker.name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/Page$/, '-page')
    .toLowerCase() + '.tsx';

  const pagePath = path.join(root, 'modules', marker.module, 'presentation', 'pages', normalizedName);
  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(pagePath, pageContent);
  console.log('Wrote', pagePath);
}

// Home page
const homeStart = findLineIndex((l) => l.includes("if (view === 'home')"));
const authReturnStart = findLineIndex(
  (l) => l.trim().startsWith('return (') && l.includes('min-h-screen flex flex-col'),
  homeStart + 1,
);
let homeBlock = lines.slice(homeStart + 2, authReturnStart).join('\n');
homeBlock = homeBlock.replace(/^\s*return \(/, '').replace(/\);\s*$/, '').trim();
const homeKeys = controllerKeys.filter((key) => new RegExp(`\\b${key}\\b`).test(homeBlock));

fs.writeFileSync(
  path.join(root, 'modules', 'auth', 'presentation', 'pages', 'home-page.tsx'),
  `import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, LayoutDashboard, Network, Users } from 'lucide-react';
import { AreaChart, Area } from 'recharts';
import { useAppControllerContext } from '../../../app-shell/application/use-app-controller';
import { CHART_DATA, HOME_FEATURES, HOME_STATS, INITIAL_CONNECTIONS } from '../../../shared/constants/marketing.constants';
import { ChartFrame } from '../../../shared/components/chart-frame';
import { MetricCard } from '../../../shared/components/metric-card';

export function HomePage() {
  const { ${homeKeys.join(', ')} } = useAppControllerContext();

  return (
${homeBlock}
  );
}
`,
);

console.log('Done extracting pages');
