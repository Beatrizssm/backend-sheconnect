export function formatDate(value?: string | null) {
  if (!value) {
    return 'Sem data definida';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTime(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) {
    return 'agora';
  }

  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}

export function getShortId(id: string) {
  return id.slice(0, 8);
}
