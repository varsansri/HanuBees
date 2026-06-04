"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Mode = "hero" | "mini";
type Listener = (text: string) => void;

interface BeeCtx {
  mode: Mode;
  setMode: (m: Mode) => void;
  /** Push text (from voice or quick input) to whatever chat is listening. */
  emit: (text: string) => void;
  /** Chat subscribes to receive emitted text. Returns an unsubscribe fn. */
  subscribe: (fn: Listener) => () => void;
}

const Ctx = createContext<BeeCtx | null>(null);

export function useBee(): BeeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBee must be used inside <BeeProvider>");
  return c;
}

export default function BeeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("mini");
  const listeners = useRef<Set<Listener>>(new Set());

  const emit = useCallback((text: string) => {
    listeners.current.forEach((fn) => fn(text));
  }, []);

  const subscribe = useCallback((fn: Listener) => {
    listeners.current.add(fn);
    return () => { listeners.current.delete(fn); };
  }, []);

  return (
    <Ctx.Provider value={{ mode, setMode, emit, subscribe }}>
      {children}
    </Ctx.Provider>
  );
}
