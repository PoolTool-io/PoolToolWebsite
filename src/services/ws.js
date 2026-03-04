/**
 * WebSocket client for real-time data from the PoolTool 2026 backend.
 * Implements docs/FRONTEND_API_SPEC.md §3. WS URL hardcoded to 34.209.51.89:3004.
 */

const WS_DEBUG = typeof process !== "undefined" && process.env.NODE_ENV === "development";

function isWsDebug() {
  if (WS_DEBUG) return true;
  if (typeof window !== "undefined" && window.__POOLTOOL_WS_DEBUG__) return true;
  return false;
}

const API_HOST = "34.209.51.89:3004";
const WS_URL = `ws://${API_HOST}/ws`;

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

    const wsUrl = WS_URL;
    if (typeof console !== "undefined") {
      console.log("[PoolTool WS] Connecting to", wsUrl);
    }
    this._ws = new WebSocket(wsUrl);

    this._ws.onopen = () => {
      this._connected = true;
      if (typeof console !== "undefined") console.log("[PoolTool WS] Connected");
      this._queue.forEach((msg) => this._ws.send(msg));
      this._queue = [];
    };

    this._ws.onmessage = (event) => {
      const raw = event.data;
      const parse = (text) => {
        try {
          const msg = JSON.parse(text);
          // §3.3: Server sends type = ping | snapshot | update | error
          if (msg.type === "ping") {
            this._ws.send(JSON.stringify({ action: "pong" }));
            return;
          }
          if (msg.type === "error") {
            if (typeof console !== "undefined") console.warn("[PoolTool WS] error", msg.msg || msg);
            return;
          }
          // Only snapshot and update carry channel + data (§3.3)
          if (msg.type !== "snapshot" && msg.type !== "update") return;

          const channel = msg.channel;
          let data = msg.data;
          if (data === undefined) return;
          if (typeof data === "string") {
            try {
              data = JSON.parse(data);
            } catch (_) {
              // keep as string
            }
          }
          if (isWsDebug() && typeof console !== "undefined") {
            const hasListener = channel && !!this._listeners[channel];
            console.log("[PoolTool WS] message", {
              type: msg.type,
              channel: channel || "(no channel)",
              hasListener,
            });
          }
          if (channel && this._listeners[channel]) {
            this._listeners[channel](data);
          } else if (channel && isWsDebug() && typeof console !== "undefined") {
            console.warn("[PoolTool WS] no listener for channel:", channel);
          }
        } catch (_) {
          if (typeof console !== "undefined") console.warn("[PoolTool WS] Parse error", _);
        }
      };
      if (typeof raw === "string") {
        parse(raw);
      } else if (raw && typeof raw.text === "function") {
        raw.text().then(parse);
      }
    };

    this._ws.onclose = () => {
      this._connected = false;
      if (typeof console !== "undefined") console.log("[PoolTool WS] Closed, reconnecting in 3s");
      this._scheduleReconnect();
    };

    this._ws.onerror = () => {
      this._connected = false;
      if (typeof console !== "undefined") console.warn("[PoolTool WS] Error");
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
    if (isWsDebug() && typeof console !== "undefined") {
      console.log("[PoolTool WS] subscribe", channel, params || {});
    }
  }

  unsubscribe(channel) {
    const params = this._listenerParams?.[channel];
    delete this._listeners[channel];
    if (this._listenerParams) delete this._listenerParams[channel];
    // §3.2: params optional but must match subscribe; send when we had params
    this._send(params != null ? { action: "unsubscribe", channel, params } : { action: "unsubscribe", channel });
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
