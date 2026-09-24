import React, { createContext, useContext, useState } from 'react';

export interface SentinelNotification {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'HIGH' | 'INFO' | 'SUCCESS';
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: SentinelNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<SentinelNotification, 'id' | 'timestamp' | 'read'>) => void;
  clearAll: () => void;
}

const INITIAL_NOTIFICATIONS: SentinelNotification[] = [
  {
    id: 'notif-1',
    title: 'Critical Outbound C2 Beacon',
    message: 'Cobalt strike beacon pattern detected on finance-srv-02 (ALT-1025)',
    type: 'CRITICAL',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    link: '/alerts/ALT-1025',
  },
  {
    id: 'notif-2',
    title: 'Brute Force Escalation',
    message: '47 failed SSH authentication attempts from 192.168.1.20',
    type: 'HIGH',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    read: false,
    link: '/alerts/ALT-1024',
  },
  {
    id: 'notif-3',
    title: 'Incident INC-398 Contained',
    message: 'Kubernetes worker node cordoned by Alex Vance',
    type: 'SUCCESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: true,
    link: '/incidents/INC-398',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SentinelNotification[]>(INITIAL_NOTIFICATIONS);

  // Sync real-time alerts with global notification dropdown
  React.useEffect(() => {
    const handleAlertCreated = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const alert = customEvent.detail;
      if (alert && alert.id) {
        const newNotif: SentinelNotification = {
          id: `notif-${alert.id}-${Date.now()}`,
          title: `${alert.severity} Alert: ${alert.type}`,
          message: `${alert.title} (${alert.sourceIp} → ${alert.destinationIp})`,
          type: alert.severity === 'CRITICAL' ? 'CRITICAL' : alert.severity === 'HIGH' ? 'HIGH' : 'INFO',
          timestamp: new Date().toISOString(),
          read: false,
          link: `/alerts/${alert.id}`,
        };
        setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      }
    };

    window.addEventListener('sentinel:alert:created', handleAlertCreated);
    return () => window.removeEventListener('sentinel:alert:created', handleAlertCreated);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (notif: Omit<SentinelNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SentinelNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
