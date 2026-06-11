export type UserConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type UserConnection = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: UserConnectionStatus;
  createdAt: string;
  updatedAt: string;
};

export type NetworkingProfile = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ENTREPRENEUR' | 'MENTOR' | 'INVESTOR';
  bio: string | null;
  city: string | null;
  specialty: string | null;
  linkedin: string | null;
  profileImage: string | null;
};

export type ConnectedProfile = {
  connectionId: string;
  status: UserConnectionStatus;
  connectedAt: string;
  profile: NetworkingProfile;
};

export type NetworkingResult = {
  connections: UserConnection[];
  connected: ConnectedProfile[];
  recommendations: NetworkingProfile[];
};
