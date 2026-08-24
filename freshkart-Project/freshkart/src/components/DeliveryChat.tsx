"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Phone,
  MapPin,
  Package,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { connectSocket, getSocket } from "@/lib/socket";

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

interface DeliveryChatProps {
  orderId: string;
  deliveryBoyId: string;
  customerName: string;
  customerPhone?: string;
}

export default function DeliveryChat({
  orderId,
  deliveryBoyId,
  customerName,
  customerPhone,
}: DeliveryChatProps) {
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessageItem[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Create or resolve existing chat room for this order
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

  // Load message history for room
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

  // Initial setup
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

  // Real-time Socket.IO Listeners
  useEffect(() => {
    if (!chatRoomId || !deliveryBoyId) return;

    const socket = connectSocket(deliveryBoyId);

    // Join the order's chat room
    socket.emit("join-room", chatRoomId);

    const handleNewMessage = (incomingMsg: any) => {
      if (!incomingMsg || !incomingMsg._id) return;
      if (String(incomingMsg.chatRoomId) !== String(chatRoomId)) return;

      setMessages((prev) => {
        // Prevent duplicates
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
  }, [chatRoomId, deliveryBoyId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || !chatRoomId || sending) return;

    try {
      setSending(true);
      setError(null);

      const response = await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatRoomId,
          content: trimmed,
          sender: "deliveryBoy",
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      if (data.data && data.data._id) {
        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === String(data.data._id))) {
            return prev;
          }
          return [...prev, data.data];
        });
      }

      setMessageText("");
    } catch (err: any) {
      console.error("❌ Send message error:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <Loader2 className="animate-spin text-emerald-600" size={20} />
          Connecting to customer chat...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <User size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">{customerName}</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <Sparkles size={10} className="text-emerald-500" /> Customer
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">Order Chat Channel</p>
          </div>
        </div>

        {customerPhone && (
          <a
            href={`tel:${customerPhone}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            title="Call Customer"
          >
            <Phone size={16} />
          </a>
        )}
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MESSAGES FEED */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <MessageSquare size={22} />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Direct Customer Chat</h4>
            <p className="max-w-xs text-xs text-slate-500 leading-relaxed">
              Send a message to update the customer regarding their grocery delivery.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const isDeliveryBoy = item.sender === "deliveryBoy";

            return (
              <div
                key={item._id}
                className={`flex ${isDeliveryBoy ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                    isDeliveryBoy
                      ? "rounded-br-xs bg-emerald-600 text-white shadow-sm"
                      : "rounded-bl-xs bg-white text-slate-900 border border-slate-200/80 shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{item.content}</p>
                  <p
                    className={`mt-1 text-[9px] font-medium text-right ${
                      isDeliveryBoy ? "text-emerald-100" : "text-slate-400"
                    }`}
                  >
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div className="border-t border-slate-100 bg-white p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to customer..."
            disabled={!chatRoomId || sending}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs outline-none transition focus:border-emerald-500 focus:bg-white disabled:bg-slate-100"
          />

          <button
            onClick={sendMessage}
            disabled={!messageText.trim() || !chatRoomId || sending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
            aria-label="Send message"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}