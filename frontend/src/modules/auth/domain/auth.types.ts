export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR';
  createdAt: string;
};
