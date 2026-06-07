"use client";

import { createContext, useContext, useState } from "react";

type Ctx = { open: () => void; close: () => void; isOpen: boolean };
const ContributeCtx = createContext<Ctx>({ open() {}, close() {}, isOpen: false });

export const useContribute = () => useContext(ContributeCtx);

export default function ContributeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ContributeCtx.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }}>
      {children}
    </ContributeCtx.Provider>
  );
}
