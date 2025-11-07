/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

function useModalController() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return { isModalOpen, setIsModalOpen };
}

type ModalController = ReturnType<typeof useModalController>;

const ModalContext = createContext<ModalController | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const controller = useModalController();
  return (
    <ModalContext.Provider value={controller}>{children}</ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
