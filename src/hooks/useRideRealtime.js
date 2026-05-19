import { useEffect, useRef, useState } from "react";

import { buildRideSocketUrl } from "../api/rides";
import { useAuthStore } from "../store/authStore";

const RECONNECT_DELAY_MS = 3000;
const KEEPALIVE_INTERVAL_MS = 25000;
const TERMINAL_CLOSE_CODES = new Set([1000, 1001, 4400, 4401, 4403]);

const connections = new Map();
let subscriberSequence = 0;

const getConnectionKey = ({ token, rideId, admin }) => `${admin ? "admin" : `ride:${rideId}`}:${token}`;

const notifyState = (entry, nextState) => {
  if (entry.state === nextState) return;
  entry.state = nextState;
  entry.stateListeners.forEach((listener) => listener(nextState));
};

const clearReconnectTimer = (entry) => {
  if (entry.reconnectTimer) {
    window.clearTimeout(entry.reconnectTimer);
    entry.reconnectTimer = null;
  }
};

const clearKeepaliveTimer = (entry) => {
  if (entry.keepaliveTimer) {
    window.clearInterval(entry.keepaliveTimer);
    entry.keepaliveTimer = null;
  }
};

const cleanupEntry = (key, entry) => {
  clearReconnectTimer(entry);
  clearKeepaliveTimer(entry);
  const socket = entry.socket;
  entry.socket = null;
  if (socket && socket.readyState < WebSocket.CLOSING) {
    socket.close(1000, "cleanup");
  }
  connections.delete(key);
};

const scheduleReconnect = (key, entry) => {
  if (!entry.shouldReconnect || entry.reconnectTimer || entry.subscribers.size === 0) {
    return;
  }
  notifyState(entry, "reconnecting");
  entry.reconnectTimer = window.setTimeout(() => {
    entry.reconnectTimer = null;
    connectSocket(key, entry);
  }, RECONNECT_DELAY_MS);
};

const startKeepalive = (entry) => {
  clearKeepaliveTimer(entry);
  entry.keepaliveTimer = window.setInterval(() => {
    if (!entry.socket || entry.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    try {
      entry.socket.send(JSON.stringify({ type: "ping", ts: Date.now() }));
    } catch (_error) {
      // The close handler will handle cleanup and reconnect if needed.
    }
  }, KEEPALIVE_INTERVAL_MS);
};

const connectSocket = (key, entry) => {
  if (!entry.shouldReconnect || entry.socket || entry.subscribers.size === 0) {
    return;
  }

  notifyState(entry, "connecting");
  const socket = new WebSocket(buildRideSocketUrl({ token: entry.token, rideId: entry.admin ? null : entry.rideId }));
  entry.socket = socket;

  socket.onopen = () => {
    if (entry.socket !== socket) {
      socket.close(1000, "stale");
      return;
    }
    notifyState(entry, "connected");
    startKeepalive(entry);
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload?.type === "pong" || payload?.event === "socket.pong") {
        return;
      }
      entry.subscribers.forEach(({ onMessageRef }) => {
        onMessageRef.current?.(payload);
      });
    } catch (error) {
      console.error("Invalid ride socket payload", error);
    }
  };

  socket.onerror = () => {
    if (entry.socket === socket) {
      notifyState(entry, "error");
    }
  };

  socket.onclose = (event) => {
    if (entry.socket === socket) {
      entry.socket = null;
    }
    clearKeepaliveTimer(entry);
    if (!entry.shouldReconnect || entry.subscribers.size === 0) {
      notifyState(entry, "closed");
      return;
    }
    if (TERMINAL_CLOSE_CODES.has(event.code)) {
      notifyState(entry, "closed");
      return;
    }
    scheduleReconnect(key, entry);
  };
};

const subscribeToConnection = ({ token, rideId, admin, onMessageRef, onStateChange }) => {
  const key = getConnectionKey({ token, rideId, admin });
  let entry = connections.get(key);

  if (!entry) {
    entry = {
      key,
      token,
      rideId,
      admin,
      socket: null,
      state: "idle",
      reconnectTimer: null,
      keepaliveTimer: null,
      shouldReconnect: true,
      subscribers: new Map(),
      stateListeners: new Set(),
    };
    connections.set(key, entry);
  }

  entry.shouldReconnect = true;
  entry.stateListeners.add(onStateChange);

  const subscriberId = ++subscriberSequence;
  entry.subscribers.set(subscriberId, { onMessageRef });
  onStateChange(entry.state);
  connectSocket(key, entry);

  return () => {
    const currentEntry = connections.get(key);
    if (!currentEntry) return;

    currentEntry.subscribers.delete(subscriberId);
    currentEntry.stateListeners.delete(onStateChange);

    if (currentEntry.subscribers.size === 0) {
      currentEntry.shouldReconnect = false;
      cleanupEntry(key, currentEntry);
      return;
    }

    if (currentEntry.socket == null && currentEntry.shouldReconnect) {
      scheduleReconnect(key, currentEntry);
    }
  };
};

export const useRideRealtime = ({ rideId, enabled = true, admin = false, onRideEvent }) => {
  const token = useAuthStore((state) => state.token);
  const [connectionState, setConnectionState] = useState("idle");
  const onRideEventRef = useRef(onRideEvent);

  useEffect(() => {
    onRideEventRef.current = onRideEvent;
  }, [onRideEvent]);

  useEffect(() => {
    if (!enabled || !token || (!rideId && !admin)) {
      setConnectionState("idle");
      return undefined;
    }

    return subscribeToConnection({
      token,
      rideId,
      admin,
      onMessageRef: onRideEventRef,
      onStateChange: setConnectionState,
    });
  }, [admin, enabled, rideId, token]);

  return { connectionState };
};
