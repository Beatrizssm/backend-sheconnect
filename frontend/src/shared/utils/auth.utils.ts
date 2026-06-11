import { AUTH_TOKEN_STORAGE_KEY } from '../infrastructure/api/client';
import type { ApiRole, JwtPayload, UserRole } from '../types/app.types';

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizedPayload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function roleToApiRole(role: UserRole, isAdmin: boolean): ApiRole {
  if (isAdmin) {
    return 'ADMIN';
  }

  const roleMap: Record<UserRole, ApiRole> = {
    entrepreneur: 'ENTREPRENEUR',
    mentor: 'MENTOR',
    investor: 'INVESTOR',
  };

  return roleMap[role];
}

export function apiRoleToUserRole(role: ApiRole): UserRole {
  if (role === 'MENTOR') {
    return 'mentor';
  }

  if (role === 'INVESTOR') {
    return 'investor';
  }

  return 'entrepreneur';
}

export function apiRoleLabel(role: ApiRole) {
  const labels: Record<ApiRole, string> = {
    ADMIN: 'Administradora',
    ENTREPRENEUR: 'Empreendedora',
    MENTOR: 'Mentora',
    INVESTOR: 'Investidora',
  };

  return labels[role];
}

export function mapApiRoleToUserType(role: string) {
  const labels: Record<string, string> = {
    ADMIN: 'Administradora',
    ENTREPRENEUR: 'Empreendedora',
    MENTOR: 'Mentora',
    INVESTOR: 'Investidora',
  };

  return labels[role] ?? role;
}

export function getStoredAuthUser(role: UserRole, isAdmin: boolean): { id: string; role: ApiRole } {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const payload = token ? decodeJwt(token) : null;

  return {
    id: payload?.sub ?? localStorage.getItem('sheconnect_user_id') ?? '',
    role: payload?.role ?? roleToApiRole(role, isAdmin),
  };
}

export function profileAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6063ee&color=fff`;
}

export { AUTH_TOKEN_STORAGE_KEY };
