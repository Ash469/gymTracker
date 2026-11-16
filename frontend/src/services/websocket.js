/**
 * FormFit WebSocket Service for Real-Time Pose Tracking & Telemetry
 */

export const ConnectionStatus = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR'
};

class FormFitWebSocketService {
  constructor() {
    this.ws = null;
    this.status = ConnectionStatus.DISCONNECTED;
    this.reconnectTimer = null;
    this.listeners = new Set();
    this.statusListeners = new Set();
    this.summaryCallbacks = [];
    
    // Default WS URL: env variable, or localhost:8000 fallback
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
  }

  getWsUrl() {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In dev mode with Vite on port 5173, point directly to ML engine on port 8000
    if (window.location.port === '5173') {
      return `${protocol}//${window.location.hostname}:8000`;
    }
    return `${protocol}//${window.location.host}/ws`;
  }

  connect(customUrl) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const url = customUrl || this.getWsUrl();
    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.setStatus(ConnectionStatus.CONNECTED);
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'telemetry') {
            this.notifyTelemetry(data);
          } else if (data.type === 'summary') {
            this.summaryCallbacks.forEach(cb => cb(data.summary));
            this.summaryCallbacks = [];
          } else if (data.type === 'exercise_selected') {
            // Handled
          }
        } catch (err) {
          console.error('[FormFit WS] Error parsing message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[FormFit WS] Connection error:', err);
        this.setStatus(ConnectionStatus.ERROR);
      };

      this.ws.onclose = () => {
        this.setStatus(ConnectionStatus.DISCONNECTED);
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error('[FormFit WS] Exception creating WebSocket:', err);
      this.setStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      console.log('[FormFit WS] Attempting automatic reconnection...');
      this.connect();
    }, 3000);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus(ConnectionStatus.DISCONNECTED);
  }

  setStatus(status) {
    this.status = status;
    this.statusListeners.forEach(cb => cb(status));
  }

  onTelemetry(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => this.statusListeners.delete(callback);
  }

  notifyTelemetry(data) {
    this.listeners.forEach(cb => cb(data));
  }

  sendFrame(base64Image) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'frame',
        image: base64Image
      }));
    }
  }

  selectExercise(exerciseId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'select_exercise',
        exercise_id: exerciseId
      }));
    }
  }

  resetCounter() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'reset'
      }));
    }
  }

  requestSummary(callback) {
    if (callback) {
      this.summaryCallbacks.push(callback);
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'get_summary'
      }));
    }
  }
}

export const wsService = new FormFitWebSocketService();
