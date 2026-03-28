"use client";

import { Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useAssistantStore } from "@/stores/assistant-store";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionChatThread } from "@/types/mission-control";

export const ChatWorkspace = ({
  threads,
  unreadCount
}: {
  threads: MissionChatThread[];
  unreadCount: number;
}) => {
  const [isSending, setIsSending] = useState(false);
  const {
    activeThreadId,
    draft,
    pendingAttachments,
    seedUnreadCount,
    setActiveThreadId,
    setDraft,
    addAttachment,
    clearPendingAttachments
  } = useAssistantStore();
  const sendChatMessage = useMissionStore((state) => state.sendChatMessage);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [activeThreadId, threads]
  );

  useEffect(() => {
    seedUnreadCount(unreadCount);
  }, [seedUnreadCount, unreadCount]);

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
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
      <Panel>
        <SectionHeading
          eyebrow="Session threads"
          title="Conversations"
          description="Session-aware operator threads stay alive across route changes and retain attachments."
        />
        <div className="space-y-3">
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                thread.id === activeThread.id
                  ? "border-emerald-300/28 bg-[linear-gradient(180deg,rgba(84,255,176,0.14),rgba(255,255,255,0.04))] shadow-[0_0_24px_rgba(34,197,94,0.08)]"
                  : "border-white/8 bg-white/4 hover:border-emerald-300/30 hover:bg-white/8"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white">{thread.title}</p>
                  <p className="mt-2 text-xs text-white/50">{thread.sessionLabel}</p>
                </div>
                <StatusPill tone={thread.unreadCount > 0 ? "active" : "idle"}>
                  {thread.unreadCount} unread
                </StatusPill>
              </div>
              <p className="mt-3 text-xs text-white/38">{thread.lastMessagePreview}</p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <SectionHeading
          eyebrow="Conversation workspace"
          title={activeThread.title}
          description="Markdown, attachments, and session context stay unified with the persistent assistant overlay."
          action={<StatusPill tone="healthy">{activeThread.sessionLabel}</StatusPill>}
        />

        <div className="space-y-4">
          {activeThread.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border px-4 py-4 ${
                message.author.toLowerCase().includes("phoenix")
                  ? "border-emerald-300/16 bg-[linear-gradient(180deg,rgba(84,255,176,0.08),rgba(255,255,255,0.03))]"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-white/42">
                <span>{message.author}</span>
                <span>{message.sentAt}</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:uppercase prose-headings:tracking-[0.08em] prose-pre:bg-black/40">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
              {message.attachments?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachments.map((attachment) => (
                    <span
                      key={attachment.id}
                      className="rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs text-white/72"
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
          <div className="mt-4 flex flex-wrap gap-2">
            {pendingAttachments.map((attachment) => (
              <span
                key={attachment.id}
                className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100"
              >
                {attachment.name} · {attachment.sizeLabel}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/22 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">
              Composer state
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="healthy">{activeThread.sessionLabel}</StatusPill>
              <StatusPill tone={pendingAttachments.length > 0 ? "active" : "idle"}>
                {pendingAttachments.length} attachment{pendingAttachments.length === 1 ? "" : "s"}
              </StatusPill>
            </div>
          </div>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Continue the active thread without losing context while you move through the command center..."
            aria-label="Chat draft"
            className="min-h-32 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/34"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-white/72">
                <Paperclip className="h-3.5 w-3.5" />
                Attach
                <input
                  type="file"
                  className="hidden"
                  aria-label="Attach file to chat"
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
                onClick={clearPendingAttachments}
                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/60"
              >
                Clear attachments
              </button>
            </div>
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
      </Panel>

      <Panel>
        <SectionHeading
          eyebrow="Thread context"
          title="Linked activity"
          description="Current session, unread state, and active attachments stay visible while you operate."
        />
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Unread state</p>
            <p className="mt-2 text-sm text-white/75">{unreadCount} total messages waiting review.</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Session binding</p>
            <p className="mt-2 text-sm text-white/75">{activeThread.sessionLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-white/42">Attachment mode</p>
            <p className="mt-2 text-sm text-white/75">
              Ready for images, PDFs, markdown, and config files.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
};
