// src/state/notificationStore.ts
import { create } from 'zustand';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  removeNotification: (id: number) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  addNotification: (message, type) => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  }
}));