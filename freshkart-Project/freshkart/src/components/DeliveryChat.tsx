"use client";

import React, { useEffect, useState } from "react";
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
import { useOrderChat, IMessageItem } from "@/hooks/useOrderChat";

export type { IMessageItem };

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
  const [messageText, setMessageText] = useState("");

  const {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    messagesEndRef,
    scrollToBottom,
  } = useOrderChat({
    orderId,
    currentUserId: deliveryBoyId,
    senderRole: "deliveryBoy",
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const success = await sendMessage(messageText);
    if (success) {
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <User size={19} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Chat with Customer ({customerName})
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5" /> Active Order
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Order #{orderId.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        {customerPhone && (
          <a
            href={`tel:${customerPhone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200/60 dark:border-emerald-800 text-xs font-semibold transition-all shadow-sm"
          >
            <Phone size={13} />
            <span className="hidden sm:inline">Call Customer</span>
          </a>
        )}
      </div>

      {/* CHAT MESSAGES BODY */}
      <div className="flex h-80 flex-col overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 size={16} className="animate-spin text-emerald-500" />
            <span>Loading message thread...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No messages yet
            </p>
            <p className="text-[11px] max-w-xs text-slate-500">
              Send a message to update the customer on arrival times, entrance access, or delivery status.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "deliveryBoy";
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-br-xs font-medium"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 px-1 mt-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Just now"}
                </span>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message to customer..."
            disabled={loading || sending}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:bg-slate-950 disabled:opacity-50"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!messageText.trim() || loading || sending}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label="Send Message"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Send size={15} className="stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}