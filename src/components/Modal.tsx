import { type ReactNode, useEffect, useState } from "react";
import { useModal } from "../contexts";

type ModalProps = {
  title?: string;
  children: ReactNode;
};

export function Modal({ title, children }: ModalProps) {
  const { isModalOpen: isOpen, setIsModalOpen } = useModal();
  const onClose = () => setIsModalOpen(false);
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!show) return null;

  const visible = isOpen;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Dialog */}
      <div
        className={`relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-lg transition-all duration-200 ease-out ${visible ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 transition-colors hover:text-gray-600"
        >
          ✕
        </button>
        {title && (
          <h2 className="text-center mb-4 text-2xl">{title}</h2>
        )}

        {children}
      </div>
    </div>
  );
}
