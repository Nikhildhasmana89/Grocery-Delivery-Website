"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { connectSocket } from "@/lib/socket";

export interface IMessageItem {
  _id: string;
  chatRoomId: string;
  userId: string;
  deliveryBoyId?: string;
  orderId?: string;
  sender: "user" | "assistant" | "deliveryBoy";
  content: string;
  createdAt: string;
}

interface UseOrderChatOptions {
  orderId: string;
  currentUserId: string;
  senderRole: "user" | "deliveryBoy";
}

export function useOrderChat({
  orderId,
  currentUserId,
  senderRole,
}: UseOrderChatOptions) {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // 1. Initialize or fetch existing chat room for order
  const initChatRoom = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.chatRoom?._id) {
        throw new Error(data.message || "Failed to initialize order chat room");
      }

      const roomId = String(data.chatRoom._id);
      setChatRoomId(roomId);
      return roomId;
    } catch (err: any) {
      console.error("❌ Init chat room error:", err);
      setError(err.message || "Unable to start order chat");
      return null;
    }
  }, [orderId]);

  // 2. Load historical chat messages
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatRoomId=${encodeURIComponent(roomId)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error("❌ Load messages error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Lifecycle setup
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      const roomId = await initChatRoom();
      if (roomId && isMounted) {
        await loadMessages(roomId);
      } else if (isMounted) {
        setLoading(false);
      }
    };

    setup();

    return () => {
      isMounted = false;
    };
  }, [initChatRoom, loadMessages]);

  // 4. Real-time Socket.IO synchronization
  useEffect(() => {
    if (!chatRoomId || !currentUserId) return;

    const socket = connectSocket(currentUserId);
    socket.emit("join-room", chatRoomId);

    const handleNewMessage = (incomingMsg: any) => {
      if (!incomingMsg || !incomingMsg._id) return;
      if (String(incomingMsg.chatRoomId) !== String(chatRoomId)) return;

      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(incomingMsg._id))) {
          return prev;
        }
        return [...prev, incomingMsg];
      });
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.emit("leave-room", chatRoomId);
    };
  }, [chatRoomId, currentUserId]);

  // 5. Send message action
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending || !chatRoomId) return false;

      setSending(true);
      setError(null);

      try {
        const payload = {
          chatRoomId,
          orderId,
          content: trimmed,
          sender: senderRole,
          [senderRole === "user" ? "userId" : "deliveryBoyId"]: currentUserId,
        };

        const response = await fetch("/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to deliver message");
        }

        if (data.data) {
          setMessages((prev) => {
            if (prev.some((m) => String(m._id) === String(data.data._id))) {
              return prev;
            }
            return [...prev, data.data];
          });
        }

        return true;
      } catch (err: any) {
        console.error("❌ Send message error:", err);
        setError(err.message || "Failed to send message. Please retry.");
        return false;
      } finally {
        setSending(false);
      }
    },
    [chatRoomId, currentUserId, orderId, senderRole, sending]
  );

  return {
    chatRoomId,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
  };
}
