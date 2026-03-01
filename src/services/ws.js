/**
 * WebSocket client for real-time data from the PoolTool 2026 backend.
 * Replaces Firebase RTDB listeners with WS channel subscriptions.
 *
 * Usage:
 *   import { wsClient } from "@/services/ws";
 *   wsClient.subscribe("pools", {}, (data) => { ... });
 *   wsClient.unsubscribe("pools");
 */

function resolveWsUrl() {
  if (process.env.VUE_APP_WS_URL) return process.env.VUE_APP_WS_URL;
  if (typeof window !== "undefined") {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.hostname}:3004/ws`;
  }
  return "ws://localhost:3004/ws";
}
const WS_URL = resolveWsUrl();

class PoolToolWS {
  constructor() {
    this._ws = null;
    this._listeners = {};
    this._queue = [];
    this._connected = false;
    this._reconnectTimer = null;
    this._pongTimer = null;
  }

  connect() {
    if (this._ws && this._ws.readyState <= 1) return;

    this._ws = new WebSocket(WS_URL);

    this._ws.onopen = () => {
      this._connected = true;
      this._queue.forEach((msg) => this._ws.send(msg));
      this._queue = [];
    };

    this._ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "ping") {
          this._ws.send(JSON.stringify({ action: "pong" }));
          return;
        }
        const channel = msg.channel;
        if (channel && this._listeners[channel]) {
          let data = msg.data;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (_) {
              // keep as string
            }
          }
          this._listeners[channel](data);
        }
      } catch (_) {
        // ignore parse errors
      }
    };

    this._ws.onclose = () => {
      this._connected = false;
      this._scheduleReconnect();
    };

    this._ws.onerror = () => {
      this._connected = false;
    };
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      this.connect();
      // Re-subscribe after reconnect
      setTimeout(() => {
        Object.keys(this._listeners).forEach((channel) => {
          const params = this._listenerParams?.[channel] || {};
          this._send({
            action: "subscribe",
            channel,
            params,
          });
        });
      }, 500);
    }, 3000);
  }

  _send(obj) {
    const msg = JSON.stringify(obj);
    if (this._connected && this._ws && this._ws.readyState === 1) {
      this._ws.send(msg);
    } else {
      this._queue.push(msg);
    }
  }

  subscribe(channel, params, callback) {
    this._listeners[channel] = callback;
    if (!this._listenerParams) this._listenerParams = {};
    this._listenerParams[channel] = params || {};
    this._send({ action: "subscribe", channel, params: params || {} });
  }

  unsubscribe(channel) {
    delete this._listeners[channel];
    if (this._listenerParams) delete this._listenerParams[channel];
    this._send({ action: "unsubscribe", channel });
  }

  disconnect() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
    this._connected = false;
  }

  get isConnected() {
    return this._connected;
  }
}

export const wsClient = new PoolToolWS();
