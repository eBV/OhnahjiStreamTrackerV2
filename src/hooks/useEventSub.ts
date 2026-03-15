import { useEffect, useRef, useCallback } from "react";

export type EventSubMessageType =
  | "stream.online"
  | "stream.offline"
  | "channel.update";

export interface EventSubUpdate {
  type: EventSubMessageType;
  event: {
    broadcaster_user_login?: string;
    category_name?: string;   // channel.update v2
    category_id?: string;
    title?: string;           // channel.update v2
    [key: string]: unknown;
  };
}

type UpdateHandler = (update: EventSubUpdate) => void;

const EVENTSUB_WS_URL = "wss://eventsub.wss.twitch.tv/ws";
const KEEPALIVE_TIMEOUT_MS = 35_000; // Twitch sends keepalives every ~10s; 35s = safe timeout

export function useEventSub(username: string, onUpdate: UpdateHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const keepaliveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isUnmountedRef = useRef(false);

  const resetKeepalive = useCallback(() => {
    clearTimeout(keepaliveTimerRef.current);
    keepaliveTimerRef.current = setTimeout(() => {
      // No keepalive received — reconnect
      wsRef.current?.close();
    }, KEEPALIVE_TIMEOUT_MS);
  }, []);

  const connect = useCallback(
    (url = EVENTSUB_WS_URL) => {
      if (isUnmountedRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.addEventListener("message", async (raw) => {
        let msg: {
          metadata: { message_type: string; subscription_type?: string };
          payload: {
            session?: { id: string; reconnect_url?: string };
            event?: EventSubUpdate["event"];
          };
        };
        try {
          msg = JSON.parse(raw.data as string);
        } catch {
          return;
        }

        const msgType = msg.metadata?.message_type;
        resetKeepalive();

        if (msgType === "session_welcome") {
          const sessionId = msg.payload.session?.id;
          if (sessionId) {
            // Fire-and-forget — subscribe server-side
            fetch(
              `/api/eventsub/subscribe?session_id=${encodeURIComponent(sessionId)}&username=${encodeURIComponent(username)}`
            ).catch(() => {
              // Subscription failed — EventSub degrades gracefully, polling still active
            });
          }
        }

        if (msgType === "session_reconnect") {
          const reconnectUrl = msg.payload.session?.reconnect_url;
          if (reconnectUrl) {
            ws.close();
            connect(reconnectUrl);
          }
        }

        if (msgType === "notification") {
          const subType = msg.metadata.subscription_type as EventSubMessageType;
          onUpdate({ type: subType, event: msg.payload.event ?? {} });
        }
      });

      ws.addEventListener("close", () => {
        clearTimeout(keepaliveTimerRef.current);
        if (!isUnmountedRef.current) {
          // Exponential backoff capped at 30s
          reconnectTimerRef.current = setTimeout(() => connect(), 5_000);
        }
      });

      ws.addEventListener("error", () => {
        ws.close();
      });

      resetKeepalive();
    },
    [username, onUpdate, resetKeepalive]
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    connect();
    return () => {
      isUnmountedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      clearTimeout(keepaliveTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
