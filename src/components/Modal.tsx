import { type ReactNode, useEffect, useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [show, setShow] = useState(isOpen);

  // Keep it mounted while fading out
  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      // wait for transition to finish before unmounting
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!show) return null;

  const visible = isOpen;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center
                  transition-opacity duration-200
                  ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg
                    transform transition-all duration-200 ease-out
                    ${visible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>

        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {title}
          </h2>
        )}

        {children}
      </div>
    </div>
  );
}
