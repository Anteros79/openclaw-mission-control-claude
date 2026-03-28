"use client";

import Image from "next/image";
import { Activity, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { useAssistantStore } from "@/stores/assistant-store";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionChatThread } from "@/types/mission-control";

type AssistantDockProps = {
  threads: MissionChatThread[];
  unreadCount: number;
};

export const AssistantDock = ({ threads, unreadCount }: AssistantDockProps) => {
  const [isSending, setIsSending] = useState(false);
  const {
    activeThreadId,
    draft,
    isOpen,
    pendingAttachments,
    unreadCount: persistedUnreadCount,
    addAttachment,
    clearPendingAttachments,
    close,
    seedUnreadCount,
    syncUnreadCount,
    setActiveThreadId,
    setDraft,
    toggleOpen
  } = useAssistantStore();
  const sendChatMessage = useMissionStore((state) => state.sendChatMessage);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [activeThreadId, threads]
  );

  useEffect(() => {
    seedUnreadCount(unreadCount);
    syncUnreadCount(unreadCount);
  }, [seedUnreadCount, syncUnreadCount, unreadCount]);

  const handleSend = async () => {
    if (!activeThread || isSending || (!draft.trim() && pendingAttachments.length === 0)) {
      return;
    }

    setIsSending(true);

    try {
      await sendChatMessage({
        threadId: activeThread.id,
        content: draft,
        attachments: pendingAttachments
      });
      setDraft("");
      clearPendingAttachments();
    } finally {
      setIsSending(false);
    }
  };

  if (!activeThread) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-4 z-50 w-[min(92vw,448px)] lg:bottom-8 lg:right-8">
          <Panel className="border-emerald-300/20 bg-[linear-gradient(180deg,rgba(6,16,12,0.96),rgba(4,8,10,0.92))] p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative mt-0.5 shrink-0 overflow-hidden rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-1 shadow-[0_0_24px_rgba(34,197,94,0.16)]">
                    <Image
                      src="/brand/phoenixclaw.png"
                      alt="PhoenixClaw Assistant"
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                      Persistent assistant
                    </p>
                    <h3 className="mt-2 truncate font-[family-name:var(--font-display)] text-xl uppercase tracking-[0.08em]">
                      {activeThread.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusPill tone="healthy">{activeThread.sessionLabel}</StatusPill>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-white/50">
                        <Activity className="h-3 w-3 text-emerald-200/80" />
                        Live context
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-100">
                    {persistedUnreadCount} unread
                  </span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close assistant"
                    className="rounded-full border border-white/10 p-2 text-white/72 transition hover:border-white/20 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-b border-white/10 px-5 py-4 lg:grid-cols-[160px_minmax(0,1fr)]">
              <div className="space-y-2">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      thread.id === activeThread.id
                        ? "border-emerald-300/28 bg-[linear-gradient(180deg,rgba(84,255,176,0.14),rgba(255,255,255,0.04))] shadow-[0_0_24px_rgba(34,197,94,0.1)]"
                        : "border-white/8 bg-white/4 hover:border-emerald-300/30 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-white">{thread.title}</span>
                      <StatusPill tone={thread.unreadCount > 0 ? "active" : "idle"}>
                        {thread.unreadCount} unread
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-xs text-white/48">{thread.sessionLabel}</p>
                    <p className="mt-1 text-xs text-white/35">{thread.lastMessagePreview}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                  {activeThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        message.author.toLowerCase().includes("phoenix")
                          ? "border-emerald-300/16 bg-[linear-gradient(180deg,rgba(84,255,176,0.08),rgba(255,255,255,0.03))]"
                          : "border-white/8 bg-white/4"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.24em] text-white/45">
                        <span>{message.author}</span>
                        <span>{message.sentAt}</span>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:uppercase prose-headings:tracking-[0.08em] prose-pre:bg-black/40">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                      {message.attachments?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((attachment) => (
                            <span
                              key={attachment.id}
                              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70"
                            >
                              {attachment.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {pendingAttachments.length ? (
                  <div className="flex flex-wrap gap-2">
                    {pendingAttachments.map((attachment) => (
                      <span
                        key={attachment.id}
                        className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
                      >
                        {attachment.name} · {attachment.sizeLabel}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={clearPendingAttachments}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60"
                    >
                      Clear
                    </button>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/8 bg-black/28 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">
                      Draft channel
                    </p>
                    <StatusPill tone="healthy">Session-aware</StatusPill>
                  </div>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type to keep the thread context alive across navigation..."
                    aria-label="Assistant draft"
                    className="min-h-28 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/72">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach
                      <input
                        type="file"
                        className="hidden"
                        aria-label="Attach file to assistant"
                        onChange={(event) => {
                          const file = event.target.files?.[0];

                          if (file) {
                            addAttachment(file);
                            event.target.value = "";
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSend();
                      }}
                      disabled={isSending || (!draft.trim() && pendingAttachments.length === 0)}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-300/12 px-4 py-2 text-xs uppercase tracking-[0.24em] text-emerald-100"
                    >
                      {isSending ? "Sending" : "Send"}
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Assistant"
        onClick={toggleOpen}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-emerald-300/45 bg-[linear-gradient(135deg,rgba(84,255,176,0.18),rgba(255,255,255,0.06))] px-4 py-3 text-sm text-white shadow-[0_0_48px_rgba(34,197,94,0.22)] backdrop-blur-xl transition hover:border-emerald-200/60 hover:bg-emerald-300/20 lg:bottom-8 lg:right-8"
      >
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-emerald-300/25 bg-black/30">
          <Image
            src="/brand/phoenixclaw.png"
            alt="Phoenix Assistant"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(84,255,176,0.8)]" />
        </span>
        <div className="text-left">
          <p className="text-sm text-white">Phoenix Assistant</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-100/65">
            Persistent overlay
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-emerald-200">
          {persistedUnreadCount}
        </span>
      </button>
    </>
  );
};
