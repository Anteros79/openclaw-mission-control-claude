"use client";

import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";

import { EntityLinkList } from "@/components/ui/entity-link-list";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { useMissionStore } from "@/stores/mission-store";
import type { MissionKanbanColumn, MissionTaskCard } from "@/types/mission-control";

const DraggableCard = ({ card, columnId }: { card: MissionTaskCard; columnId: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: {
      columnId
    }
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`rounded-[22px] border p-4 text-left shadow-[0_0_24px_rgba(0,0,0,0.18)] transition ${
        isDragging
          ? "border-emerald-300/40 bg-[linear-gradient(180deg,rgba(84,255,176,0.14),rgba(255,255,255,0.04))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] hover:border-emerald-300/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            {...listeners}
            {...attributes}
            aria-label={`Move ${card.title}`}
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/18 text-white/42 transition hover:border-emerald-300/30 hover:text-emerald-100"
          >
            <GripHorizontal className="h-4 w-4" />
          </button>
          <p className="text-sm text-white">{card.title}</p>
        </div>
        <StatusPill tone={isDragging ? "active" : "idle"}>{card.severity}</StatusPill>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-white/42">{card.owner}</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">{columnId}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {card.metadata.map((meta) => (
          <span
            key={meta}
            className="rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[11px] text-white/60"
          >
            {meta}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <EntityLinkList links={card.links} />
      </div>
    </div>
  );
};

const DroppableColumn = ({ column }: { column: MissionKanbanColumn }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id
  });

  return (
    <div
      ref={setNodeRef}
      id={column.id}
      className={`rounded-[28px] border p-4 backdrop-blur-xl ${
        isOver
          ? "border-emerald-300/40 bg-[linear-gradient(180deg,rgba(84,255,176,0.12),rgba(255,255,255,0.04))]"
          : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.18))]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-200/65">
            Column
          </p>
          <h4 className="mt-2 font-[family-name:var(--font-display)] text-xl uppercase tracking-[0.08em]">
            {column.title}
          </h4>
        </div>
        <StatusPill tone="idle">{column.cards.length}</StatusPill>
      </div>
      <div className="space-y-3 rounded-[22px] border border-white/6 bg-black/12 p-2">
        {column.cards.map((card) => (
          <DraggableCard key={card.id} card={card} columnId={column.id} />
        ))}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ columns }: { columns: MissionKanbanColumn[] }) => {
  const moveTaskCard = useMissionStore((state) => state.moveTaskCard);

  const handleDragEnd = (event: DragEndEvent) => {
    const sourceColumnId = event.active.data.current?.columnId;
    const targetColumnId = event.over?.id;

    if (!sourceColumnId || typeof targetColumnId !== "string") {
      return;
    }

    void moveTaskCard({
      cardId: String(event.active.id),
      sourceColumnId: String(sourceColumnId),
      targetColumnId
    });
  };

  return (
    <Panel>
      <SectionHeading
        eyebrow="Board control"
        title="Mission kanban"
        description="Drag cards between backlog, planned, in progress, blocked, and done. State persists while you navigate."
      />
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-5">
          {columns.map((column) => (
            <DroppableColumn key={column.id} column={column} />
          ))}
        </div>
      </DndContext>
    </Panel>
  );
};
