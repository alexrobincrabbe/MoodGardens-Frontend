import { useState, type ReactNode } from "react";
import { shareNative, shareFacebook, shareX, copyLink } from "../utils";
import toast from "react-hot-toast";

export function ShareMenu({ url, text }: { url: string; text: string }) {
      const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeLater = () => setTimeout(() => setOpen(false), 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-emerald-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Share ▾
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-full mb-2 z-20 w-44 rounded-md border bg-white shadow-lg animate-fadeIn"
        >
          <ShareMenuButton
            onClick={async () => {
              await shareNative(url, text);
              closeLater();
            }}
          >
            Share (native)
          </ShareMenuButton>

          <ShareMenuButton
            onClick={() => {
              shareFacebook(url, text);
              closeLater();
            }}
          >
            Share to Facebook
          </ShareMenuButton>

          <ShareMenuButton
            onClick={() => {
              shareX(url, text);
              closeLater();
            }}
          >
            Share to X
          </ShareMenuButton>

          <ShareMenuButton
            onClick={async () => {
              const ok = await copyLink(url);
              setCopied(ok);
              handleCopy()
              closeLater();
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </ShareMenuButton>
        </div>
      )}
    </div>
  );
}


type ShareMenuButtonProps = {
  children: ReactNode;
  onClick: () => void | Promise<void>;
};

function ShareMenuButton({ children, onClick }: ShareMenuButtonProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
