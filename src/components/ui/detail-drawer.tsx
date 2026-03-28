"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type DetailDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

export const DetailDrawer = ({ isOpen, onClose, title, eyebrow, children }: DetailDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-label={title}
        className="fixed inset-y-0 right-0 z-50 w-[min(92vw,520px)] border-l border-white/10 bg-[linear-gradient(180deg,rgba(6,16,12,0.98),rgba(4,8,10,0.96))] p-6 shadow-2xl backdrop-blur-xl overflow-y-auto"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-200/65">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl uppercase tracking-[0.1em]">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/72 transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
};
