"use client";

import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getActiveTimer, stopTimer } from "@/lib/actions/timer";
import { Clock, Square, FilePlus2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Active = {
  id: string;
  startedAt: string | Date;
  topic?: string | null;
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

const STORAGE_POS = "prepjourney-timer-pos";

/**
 * Small draggable floating timer widget.
 * Click the time/topic → go to /timer.
 * Drag via the grip handle to reposition.
 */
export function GlobalTimerBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<Active | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // Default: top-right under the header
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_POS);
      if (raw) {
        const p = JSON.parse(raw) as { x: number; y: number };
        setPos(p);
      } else {
        setPos({
          x: Math.max(16, window.innerWidth - 280),
          y: 72, // below fixed header
        });
      }
    } catch {
      setPos({ x: 16, y: 72 });
    }
    setReady(true);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const t = await getActiveTimer();
      if (t && t.isActive) {
        setActive({
          id: t.id,
          startedAt: t.startedAt,
          topic: t.topic,
        });
      } else {
        setActive(null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh, pathname]);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const started = new Date(active.startedAt).getTime();
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  // Drag handlers
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!dragging.current) return;
      const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 200) - 8;
      const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 80) - 8;
      const x = Math.min(maxX, Math.max(8, e.clientX - offset.current.x));
      const y = Math.min(maxY, Math.max(8, e.clientY - offset.current.y));
      setPos({ x, y });
    }
    function onUp() {
      if (!dragging.current) return;
      dragging.current = false;
      setPos((p) => {
        try {
          localStorage.setItem(STORAGE_POS, JSON.stringify(p));
        } catch {
          /* ignore */
        }
        return p;
      });
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  function startDrag(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }

  function handleStopAndSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!active) return;
    startTransition(async () => {
      try {
        const result = await stopTimer(active.id);
        const topicVal = active.topic || "";
        setActive(null);
        router.refresh();
        if (result && "durationMinutes" in result) {
          const minutes = result.durationMinutes as number;
          router.push(
            `/sessions/new?duration=${minutes}&topic=${encodeURIComponent(topicVal)}&from=timer`
          );
        }
      } catch (err) {
        console.error(err);
        alert("Could not stop timer.");
      }
    });
  }

  function handleStopOnly(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!active) return;
    startTransition(async () => {
      try {
        await stopTimer(active.id);
        setActive(null);
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Don't show on the timer page itself (full controls are there)
  if (!active || !ready || pathname === "/timer") return null;

  return (
    <div
      ref={widgetRef}
      style={{ left: pos.x, top: pos.y }}
      className={cn(
        "fixed z-[60] w-[min(260px,calc(100vw-24px))]",
        "rounded-2xl border border-slate-200/80 dark:border-slate-700",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-xl",
        "select-none"
      )}
    >
      {/* Drag handle + clickable body → /timer */}
      <div className="flex items-stretch">
        <button
          type="button"
          onPointerDown={startDrag}
          className="flex items-center px-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag timer"
          title="Drag to move"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <Link
          href="/timer"
          className="flex-1 min-w-0 py-2.5 pr-2 block hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-r-2xl transition-colors"
          title="Open timer page"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {formatElapsed(elapsed)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate pl-6">
            {active.topic ? active.topic : "Study timer"} · open →
          </p>
        </Link>
      </div>

      <div className="flex gap-1 border-t border-slate-100 dark:border-slate-800 px-2 py-1.5">
        <button
          type="button"
          disabled={isPending}
          onClick={handleStopAndSave}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          {isPending ? "…" : "Save"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleStopOnly}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
        >
          <Square className="h-3 w-3" />
          Stop
        </button>
      </div>
    </div>
  );
}
