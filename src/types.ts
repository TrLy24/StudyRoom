export type Room = {
  id: string;
  name: string;
  building: string;
  seats: number;
  emoji: string;
  image: string;
};

export type Booking = {
  id: string;
  roomId: string;
  date: string;
  slot: string;
  userId: string;
  createdAt: number;
  notificationId?: string | null;
};

export type User = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: 'guest' | 'google';
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  RoomDetail: { roomId: string };
};