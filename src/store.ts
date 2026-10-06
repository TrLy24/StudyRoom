import { create } from 'zustand';
import { User } from './types';

type State = {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAppStore = create<State>((set) => ({
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
}));