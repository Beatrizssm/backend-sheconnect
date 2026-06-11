export function rolePieColor(role: string) {
  const colors: Record<string, string> = {
    ENTREPRENEUR: '#6063ee',
    MENTOR: '#8b5cf6',
    INVESTOR: '#181445',
    ADMIN: '#f59e0b',
  };

  return colors[role] ?? '#94a3b8';
}

export function rolePieLabel(role: string) {
  const labels: Record<string, string> = {
    ENTREPRENEUR: 'Empreendedoras',
    MENTOR: 'Mentoras',
    INVESTOR: 'Investidoras',
    ADMIN: 'Administradoras',
  };

  return labels[role] ?? role;
}
