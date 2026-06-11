import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', 'src');
const source = fs.readFileSync(path.join(root, 'pages', 'AppPage.tsx'), 'utf8');
const lines = source.split(/\r?\n/);

const tabMarkers = [
  { tab: 'analytics', key: "activeTab === 'analytics'", module: 'analytics' },
  { tab: 'usuarios', key: "activeTab === 'usuarios'", module: 'users' },
  { tab: 'chat', key: "activeTab === 'chat'", module: 'chat' },
  { tab: 'notificações', key: "activeTab === 'notificações'", module: 'notifications' },
  { tab: 'dashboard', key: "activeTab === 'dashboard'", module: 'dashboard' },
  { tab: 'mentorias', key: "activeTab === 'mentorias'", module: 'mentorships' },
  { tab: 'eventos', key: "activeTab === 'eventos'", module: 'events' },
  { tab: 'conexões', key: "activeTab === 'conexões'", module: 'networking' },
  { tab: 'startups', key: "activeTab === 'startups'", module: 'startups' },
];

function findLineIndex(predicate, from = 0) {
  for (let i = from; i < lines.length; i++) {
    if (predicate(lines[i], i)) return i;
  }
  return -1;
}

const appReturnStart = findLineIndex((l) => l.includes("if (view === 'app')"));
const homeReturnStart = findLineIndex((l) => l.includes("if (view === 'home')"));
const authReturnStart = findLineIndex((l) => l.trim().startsWith('return (') && l.includes('min-h-screen flex flex-col'), appReturnStart + 1);

const hookStart = findLineIndex((l) => l.includes('export default function App'));
const hookBodyStart = hookStart + 1;

const hookLines = [
  ...lines.slice(hookBodyStart, appReturnStart),
  '  return controllerValue;',
  '}',
];

const pageNameByModule = {
  analytics: 'analytics-page',
  users: 'users-admin-page',
  chat: 'chat-page',
  notifications: 'notifications-page',
  dashboard: 'dashboard-page',
  mentorships: 'mentorships-page',
  events: 'events-page',
  networking: 'networking-page',
  startups: 'startups-page',
};

const tabContentStart = findLineIndex((l) => l.includes('{/* Tab Content */}'));
const tabAnimateStart = findLineIndex((l) => l.includes('<AnimatePresence mode="wait">'), tabContentStart);

for (let m = 0; m < tabMarkers.length; m++) {
  const marker = tabMarkers[m];
  const start = findLineIndex((l) => l.includes(marker.key), tabAnimateStart);
  const nextStart =
    m + 1 < tabMarkers.length
      ? findLineIndex((l) => l.includes(tabMarkers[m + 1].key), start + 1)
      : findLineIndex((l) => l.trim() === '</AnimatePresence>', start + 1);

  let block = lines.slice(start, nextStart).join('\n');
  block = block
    .replace(/\{activeTab === '[^']+' && \(/, '')
    .replace(/\)\}\s*$/, '')
    .trim();

  const pageFile = `${pageNameByModule[marker.module]}.tsx`;
  const pagePath = path.join(root, 'modules', marker.module, 'presentation', 'pages', pageFile);

  const pageContent = `import { motion } from 'motion/react';
import { useAppController } from '../../../app-shell/application/use-app-controller';

export function ${toPascal(pageFile.replace('.tsx', ''))}() {
  const c = useAppController();
  return (
${block.replace(/^/gm, '    ')}
  );
}
`;

  fs.mkdirSync(path.dirname(pagePath), { recursive: true });
  fs.writeFileSync(pagePath, pageContent);
}

const homeBlock = lines.slice(homeReturnStart + 2, authReturnStart - 1).join('\n');
const homePath = path.join(root, 'modules', 'auth', 'presentation', 'pages', 'home-page.tsx');
fs.writeFileSync(
  homePath,
  `import { useAppController } from '../../../app-shell/application/use-app-controller';

export function HomePage() {
  const c = useAppController();
  return (
${homeBlock.replace(/^/gm, '    ').replace(/^\s+return \(/, '').replace(/\);\s*$/, '')}
  );
}
`,
);

function toPascal(name) {
  return name
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

console.log('Split complete (partial). Hook and auth pages need manual finish.');
