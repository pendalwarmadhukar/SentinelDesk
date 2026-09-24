import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { SecurityAlert, DashboardStats } from '../types';
import alertApi from '../services/alertApi';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type StreamProtocol = 'sse' | 'websocket' | 'local';
export type DesktopNotificationStatus = 'default' | 'granted' | 'denied' | 'unsupported';

interface RealtimeAlertContextType {
  connectionStatus: ConnectionStatus;
  streamProtocol: StreamProtocol;
  isLiveStreaming: boolean;
  toggleLiveStreaming: () => Promise<void>;
  latestAlert: SecurityAlert | null;
  bannerAlert: SecurityAlert | null;
  dismissBanner: () => void;
  unreadCount: number;
  clearUnreadCount: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  desktopPermission: DesktopNotificationStatus;
  desktopNotificationsEnabled: boolean;
  setDesktopNotificationsEnabled: (enabled: boolean) => void;
  requestDesktopNotificationPermission: () => Promise<DesktopNotificationStatus>;
  simulateIncomingAlert: (custom?: Partial<SecurityAlert>) => Promise<SecurityAlert>;
  subscribeToAlerts: (callback: (alert: SecurityAlert, eventType: 'alert:created' | 'alert:updated', stats?: DashboardStats) => void) => () => void;
}

const RealtimeAlertContext = createContext<RealtimeAlertContextType | undefined>(undefined);

// Web Audio API sound alert generator for critical threats
function playCriticalAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(660, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // Ignore audio permission errors
  }
}

// Browser native Notification API helper for high-priority security incidents
function sendNativeDesktopNotification(alert: SecurityAlert) {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission !== 'granted') {
      return;
    }

    const title = `🚨 [${alert.severity}] SentinelDesk: ${alert.type}`;
    const body = `${alert.title}\nSource: ${alert.sourceIp} → Dest: ${alert.destinationIp}:${alert.destinationPort}\nHost: ${alert.hostname} | User: ${alert.username}`;

    const notification = new Notification(title, {
      body,
      tag: `sentinel-alert-${alert.id}`,
      requireInteraction: alert.severity === 'CRITICAL',
      silent: false,
    });

    notification.onclick = () => {
      try {
        window.focus();
        notification.close();
        // Dispatch navigation event across the application
        window.dispatchEvent(
          new CustomEvent('sentinel:navigate', {
            detail: `/alerts/${alert.id}`,
          })
        );
      } catch (err) {
        console.warn('Notification click navigation error:', err);
      }
    };
  } catch (err) {
    console.warn('Failed to display native desktop notification:', err);
  }
}

export const RealtimeAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [streamProtocol, setStreamProtocol] = useState<StreamProtocol>('sse');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [latestAlert, setLatestAlert] = useState<SecurityAlert | null>(null);
  const [bannerAlert, setBannerAlert] = useState<SecurityAlert | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Desktop Notification API state
  const [desktopPermission, setDesktopPermission] = useState<DesktopNotificationStatus>('default');
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sentinel_desktop_notifications');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const listenersRef = useRef<Set<(alert: SecurityAlert, eventType: 'alert:created' | 'alert:updated', stats?: DashboardStats) => void>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check initial browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setDesktopPermission(Notification.permission as DesktopNotificationStatus);
    } else {
      setDesktopPermission('unsupported');
    }
  }, []);

  const setDesktopNotificationsEnabled = (enabled: boolean) => {
    setDesktopNotificationsEnabledState(enabled);
    try {
      localStorage.setItem('sentinel_desktop_notifications', JSON.stringify(enabled));
    } catch {
      // ignore
    }
  };

  const requestDesktopNotificationPermission = async (): Promise<DesktopNotificationStatus> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setDesktopPermission('unsupported');
      return 'unsupported';
    }

    try {
      // Notification.requestPermission() is standard in modern browsers
      const permission = await Notification.requestPermission();
      setDesktopPermission(permission as DesktopNotificationStatus);

      if (permission === 'granted') {
        setDesktopNotificationsEnabled(true);
        // Show test verification notification
        try {
          const testNotification = new Notification('🛡️ SentinelDesk Desktop Alerts Enabled', {
            body: 'High-priority incident notifications (CRITICAL & HIGH) are now active on your workstation.',
            tag: 'sentinel-test-notification',
          });
          setTimeout(() => testNotification.close(), 5000);
        } catch {
          // ignore
        }
      }
      return permission as DesktopNotificationStatus;
    } catch (err) {
      console.warn('Error requesting browser notification permission:', err);
      return 'denied';
    }
  };

  // Dispatch alert to all active subscribers, UI banners, audio chimes, and native desktop notifications
  const handleIncomingAlert = useCallback(
    (alert: SecurityAlert, eventType: 'alert:created' | 'alert:updated' = 'alert:created', stats?: DashboardStats) => {
      setLatestAlert(alert);

      if (eventType === 'alert:created') {
        setUnreadCount((prev) => prev + 1);

        // High-priority incidents: CRITICAL or HIGH severity
        const isHighPriority = alert.severity === 'CRITICAL' || alert.severity === 'HIGH';

        if (isHighPriority) {
          // 1. In-app prominent incident banner
          setBannerAlert(alert);

          // 2. Synthesized audio radar ping
          if (audioEnabled) {
            playCriticalAlertChime();
          }

          // 3. Browser native desktop alert notification
          if (desktopNotificationsEnabled && desktopPermission === 'granted') {
            sendNativeDesktopNotification(alert);
          }
        }
      }

      // Notify registered page components (Dashboard, Alerts page, etc.)
      listenersRef.current.forEach((listener) => {
        try {
          listener(alert, eventType, stats);
        } catch (err) {
          console.error('Error notifying alert subscriber:', err);
        }
      });
    },
    [audioEnabled, desktopNotificationsEnabled, desktopPermission]
  );

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');

    try {
      const sseUrl = '/api/alerts/stream';
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.addEventListener('init', () => {
        setConnectionStatus('connected');
        setStreamProtocol('sse');
      });

      es.addEventListener('message', (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'alert:created' && parsed.data?.alert) {
            handleIncomingAlert(parsed.data.alert, 'alert:created', parsed.data.stats);
          } else if (parsed.type === 'alert:updated' && parsed.data?.alert) {
            handleIncomingAlert(parsed.data.alert, 'alert:updated', parsed.data.stats);
          }
        } catch (err) {
          console.warn('Failed to parse SSE payload:', err);
        }
      });

      es.onopen = () => {
        setConnectionStatus('connected');
        setStreamProtocol('sse');
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        connectWebSocket();
      };
    } catch {
      connectWebSocket();
    }
  }, [handleIncomingAlert]);

  // Fallback WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/alerts`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        setStreamProtocol('websocket');
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'alert:created' && parsed.data?.alert) {
            handleIncomingAlert(parsed.data.alert, 'alert:created', parsed.data.stats);
          } else if (parsed.type === 'alert:updated' && parsed.data?.alert) {
            handleIncomingAlert(parsed.data.alert, 'alert:updated', parsed.data.stats);
          }
        } catch (err) {
          console.warn('Failed to parse WS payload:', err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('connected');
        setStreamProtocol('local');
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connectSSE();
          }, 5000);
        }
      };
    } catch {
      setConnectionStatus('connected');
      setStreamProtocol('local');
    }
  }, [handleIncomingAlert, connectSSE]);

  // Listen to window-level custom events from mock storage fallback
  useEffect(() => {
    const handleWindowAlert = (e: Event) => {
      const customEvent = e as CustomEvent<SecurityAlert>;
      if (customEvent.detail) {
        handleIncomingAlert(customEvent.detail, 'alert:created');
      }
    };

    window.addEventListener('sentinel:alert:created', handleWindowAlert);
    return () => {
      window.removeEventListener('sentinel:alert:created', handleWindowAlert);
    };
  }, [handleIncomingAlert]);

  useEffect(() => {
    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  const toggleLiveStreaming = async () => {
    const nextState = !isLiveStreaming;
    setIsLiveStreaming(nextState);
    try {
      await alertApi.toggleStream(nextState);
    } catch {
      // ignore
    }
  };

  const simulateIncomingAlert = async (custom?: Partial<SecurityAlert>): Promise<SecurityAlert> => {
    try {
      const res = await alertApi.simulateAlert(custom);
      if (res && res.data) {
        handleIncomingAlert(res.data, 'alert:created');
        return res.data;
      }
    } catch (err) {
      console.warn('simulateAlert call fallback:', err);
    }

    // Emergency local generation if network call fails
    const types = ['Brute Force', 'Suspicious Login', 'Malware Indicator', 'Privilege Escalation', 'Port Scan'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    const fallbackAlert: SecurityAlert = {
      id: `ALT-${Math.floor(1030 + Math.random() * 8970)}`,
      type: randomType,
      title: `Live Attack: ${randomType} Infiltration Detected`,
      description: 'Immediate containment priority. Real-time SIEM heuristic score exceeded 95/100.',
      severity: custom?.severity || 'CRITICAL',
      status: 'OPEN',
      sourceIp: custom?.sourceIp || `198.51.100.${Math.floor(10 + Math.random() * 200)}`,
      destinationIp: custom?.destinationIp || '10.0.4.15',
      sourcePort: custom?.sourcePort || 51234,
      destinationPort: custom?.destinationPort || 22,
      protocol: custom?.protocol || 'TCP',
      username: custom?.username || 'admin',
      hostname: custom?.hostname || 'prod-core-gw',
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      eventCount: 15,
      investigationNotes: [],
      activityTimeline: [
        {
          id: `act-${Date.now()}`,
          action: 'Alert Ingested via Real-Time SIEM Kafka Event Stream',
          user: 'Sentinel Ingestion Engine',
          timestamp: new Date().toISOString(),
        },
      ],
      relatedEvents: [],
    };
    handleIncomingAlert(fallbackAlert, 'alert:created');
    return fallbackAlert;
  };

  const dismissBanner = () => {
    setBannerAlert(null);
  };

  const clearUnreadCount = () => {
    setUnreadCount(0);
  };

  const subscribeToAlerts = (callback: (alert: SecurityAlert, eventType: 'alert:created' | 'alert:updated', stats?: DashboardStats) => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  return (
    <RealtimeAlertContext.Provider
      value={{
        connectionStatus,
        streamProtocol,
        isLiveStreaming,
        toggleLiveStreaming,
        latestAlert,
        bannerAlert,
        dismissBanner,
        unreadCount,
        clearUnreadCount,
        audioEnabled,
        setAudioEnabled,
        desktopPermission,
        desktopNotificationsEnabled,
        setDesktopNotificationsEnabled,
        requestDesktopNotificationPermission,
        simulateIncomingAlert,
        subscribeToAlerts,
      }}
    >
      {children}
    </RealtimeAlertContext.Provider>
  );
};

export const useRealtimeAlerts = () => {
  const context = useContext(RealtimeAlertContext);
  if (!context) {
    throw new Error('useRealtimeAlerts must be used within a RealtimeAlertProvider');
  }
  return context;
};
