// EKKLESIA P2P Rehearsal Synchronization Engine
// Permite que cualquier dispositivo funcione como Director o Músico vía QR/PIN

export interface RehearsalSessionState {
  sessionId: string;
  pin: string;
  directorName: string;
  songId?: number;
  songTitle?: string;
  songIndex: number;
  songCount?: number;
  chosenKey?: string;
  tempo?: number;
  activeSection?: string | null;
  cueType?: 'section' | 'dynamic' | 'alert';
  cueMessage?: string | null;
  timestamp: number;
  connectedMusiciansCount?: number;
  setlistItems?: any[];
}

export type RehearsalRole = 'solo' | 'director' | 'musician';

const BROADCAST_CHANNEL_NAME = 'ekklesia_stage_sync_v2';
const STORAGE_SYNC_KEY = 'ekklesia_p2p_stage_state';

class P2PSyncEngine {
  private broadcastChannel: BroadcastChannel | null = null;
  private currentRole: RehearsalRole = 'solo';
  private currentSession: RehearsalSessionState | null = null;
  private listeners: ((state: RehearsalSessionState) => void)[] = [];
  private pollInterval: any = null;
  private directorHost: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          this.broadcastChannel.onmessage = (event) => {
            if (event.data && typeof event.data === 'object') {
              this.handleIncomingState(event.data);
            }
          };
        }
      } catch (e) {
        console.warn('BroadcastChannel no soportado, usando StorageEvent:', e);
      }

      // Escuchar eventos de Storage para sincronización entre ventanas o WebViews
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_SYNC_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.handleIncomingState(parsed);
          } catch (err) {}
        }
      });
    }
  }

  // Obtener la IP Wi-Fi local para el código QR y conexión de la banda
  public getLocalDirectorIp(): string {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.getLocalIp) {
      try {
        const ip = (window as any).AndroidBridge.getLocalIp();
        if (ip && ip !== '127.0.0.1') return ip;
      } catch (e) {}
    }
    return typeof window !== 'undefined' && window.location.hostname !== 'appassets.androidplatform.net'
      ? window.location.hostname
      : '192.168.1.100';
  }

  public setDirectorHost(host: string): void {
    this.directorHost = host.trim();
  }

  public getDirectorHost(): string {
    return this.directorHost;
  }

  // Generar un PIN aleatorio de 4 dígitos para emparejamiento rápido
  public generatePin(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Iniciar una sala de ensayo como Director
  public startDirectorSession(directorName: string = 'Director de Alabanza', initialSetlist?: any[]): RehearsalSessionState {
    const pin = this.generatePin();
    const sessionId = `EKK-${pin}-${Date.now().toString().slice(-4)}`;

    const initialState: RehearsalSessionState = {
      sessionId,
      pin,
      directorName,
      songIndex: 0,
      timestamp: Date.now(),
      connectedMusiciansCount: 1,
      setlistItems: initialSetlist || []
    };

    this.currentRole = 'director';
    this.currentSession = initialState;

    // Iniciar servidor local embebido si estamos en la APK Android
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.startDirectorServer) {
      try {
        (window as any).AndroidBridge.startDirectorServer();
      } catch (e) {}
    }

    this.broadcastState(initialState);
    return initialState;
  }

  // Unirse a una sala como Músico mediante PIN o IP de la tablet del Director
  public joinSession(pinOrSessionId: string, host?: string): void {
    this.currentRole = 'musician';
    const clean = pinOrSessionId.trim().toUpperCase();

    if (host) {
      this.directorHost = host;
    } else if (clean.includes('.') || clean.includes(':')) {
      this.directorHost = clean;
    }

    // Notificar unión al canal
    const joinPayload = {
      action: 'MUSICIAN_JOINED',
      target: clean,
      timestamp: Date.now()
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(joinPayload);
    }

    // Iniciar sondeo de respaldo con el servidor local o la tablet del Director
    this.startFallbackPolling();
  }

  // Salir de la sesión y volver a modo Solo
  public leaveSession(): void {
    this.currentRole = 'solo';
    this.currentSession = null;
    this.directorHost = '';
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // Transmitir un cambio desde el Director a todos los músicos
  public broadcastAction(update: Partial<RehearsalSessionState>): void {
    if (this.currentRole !== 'director' && this.currentRole !== 'solo') return;

    const updatedState: RehearsalSessionState = {
      ...(this.currentSession || {
        sessionId: 'LOCAL',
        pin: '0000',
        directorName: 'Director Local',
        songIndex: 0,
        timestamp: Date.now()
      }),
      ...update,
      timestamp: Date.now()
    };

    this.currentSession = updatedState;
    this.broadcastState(updatedState);

    // Notificar al servidor embebido de Android para atender a las tablets de los músicos
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.broadcastLiveState) {
      try {
        (window as any).AndroidBridge.broadcastLiveState(JSON.stringify(updatedState));
      } catch (e) {}
    }

    // Intentar también sincronizar con /api/live-sync por si hay clientes web conectados
    if (typeof window !== 'undefined') {
      fetch('/api/live-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: updatedState.songId,
          songTitle: updatedState.songTitle,
          songIndex: updatedState.songIndex,
          activeSection: updatedState.activeSection,
          cueType: updatedState.cueType || 'section',
          cueMessage: updatedState.cueMessage,
          directorName: updatedState.directorName
        })
      }).catch(() => {});
    }
  }

  private broadcastState(state: RehearsalSessionState): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(state));
    } catch (e) {}

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(state);
      } catch (e) {}
    }

    this.notifyListeners(state);
  }

  private handleIncomingState(state: any): void {
    if (!state || typeof state !== 'object') return;

    if (state.action === 'MUSICIAN_JOINED' && this.currentRole === 'director' && this.currentSession) {
      const updated: RehearsalSessionState = {
        ...this.currentSession,
        connectedMusiciansCount: (this.currentSession.connectedMusiciansCount || 1) + 1,
        timestamp: Date.now()
      };
      this.currentSession = updated;
      this.broadcastState(updated);
      return;
    }

    if (state.sessionId && state.timestamp) {
      if (this.currentRole === 'musician') {
        this.currentSession = state;
        this.notifyListeners(state);
      }
    }
  }

  private startFallbackPolling(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(async () => {
      if (this.currentRole !== 'musician') return;
      try {
        const targetUrl = this.directorHost
          ? (this.directorHost.startsWith('http') ? `${this.directorHost}/api/live-sync` : `http://${this.directorHost.includes(':') ? this.directorHost : `${this.directorHost}:8080`}/api/live-sync`)
          : '/api/live-sync';
        const res = await fetch(targetUrl, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.state) {
          const s = data.state;
          if (s.timestamp && (!this.currentSession || s.timestamp > this.currentSession.timestamp)) {
            const mappedState: RehearsalSessionState = {
              sessionId: 'API-SESSION',
              pin: '0000',
              directorName: s.directorName || 'Director',
              songId: s.songId,
              songTitle: s.songTitle,
              songIndex: s.songIndex || 0,
              activeSection: s.activeSection,
              cueType: s.cueType,
              cueMessage: s.cueMessage,
              timestamp: s.timestamp
            };
            this.handleIncomingState(mappedState);
          }
        }
      } catch (e) {}
    }, 1200);
  }

  public subscribe(listener: (state: RehearsalSessionState) => void): () => void {
    this.listeners.push(listener);
    if (this.currentSession) {
      listener(this.currentSession);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(state: RehearsalSessionState): void {
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (e) {
        console.error('Error notificando listener P2P:', e);
      }
    });
  }

  public getRole(): RehearsalRole {
    return this.currentRole;
  }

  public getSession(): RehearsalSessionState | null {
    return this.currentSession;
  }
}

// Instancia singleton compartida
let engineInstance: P2PSyncEngine | null = null;

export function getP2PSyncEngine(): P2PSyncEngine {
  if (!engineInstance) {
    engineInstance = new P2PSyncEngine();
  }
  return engineInstance;
}
