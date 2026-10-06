import { Room, User } from './types';

export const ROOMS: Room[] = [
  { id: 'r1', name: 'Lab A3-101', building: 'A3', seats: 30, emoji: '🖥️',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
  { id: 'r2', name: 'Lab A3-102', building: 'A3', seats: 40, emoji: '🖥️',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400' },
  { id: 'r3', name: 'Library Zone B', building: 'Main Library', seats: 50, emoji: '📚',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400' },
  { id: 'r4', name: 'Library Zone C', building: 'Main Library', seats: 12, emoji: '📚',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400' },
  { id: 'r5', name: 'Study Room B1-01', building: 'B1', seats: 8, emoji: '✏️',
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400' },
  { id: 'r6', name: 'Study Room B1-02', building: 'B1', seats: 8, emoji: '✏️',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400' },
  { id: 'r7', name: 'Meeting Room B1-10', building: 'B1', seats: 20, emoji: '🗣️',
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=400' },
  { id: 'r8', name: 'Lab A3-201', building: 'A3', seats: 60, emoji: '🖥️',
    image: 'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=400' },
];

export const BUILDINGS = ['A3', 'B1', 'Main Library'];

export const SLOTS = [
  '07:00-09:00',
  '09:00-11:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
];

export const USERS: User[] = [
  { id: 'u1', name: 'Nam (Người dùng A)', provider: 'guest' },
  { id: 'u2', name: 'Lan (Người dùng B)', provider: 'guest' },
];

export function getNextDays(n = 3): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
}

export const DATES = getNextDays(7);