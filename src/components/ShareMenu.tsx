import { useState } from "react";
import {
  shareNative,
  shareFacebook,
  shareX,
  copyLink,
} from "../utils";

export function ShareMenu({ url, text }: { url: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const closeLater = () => setTimeout(() => setOpen(false), 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
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
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={async () => {
              await shareNative(url, text);
              closeLater();
            }}
          >
            Share (native)
          </button>
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              shareFacebook(url, text);
              closeLater();
            }}
          >
            Share to Facebook
          </button>
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={() => {
              shareX(url, text);
              closeLater();
            }}
          >
            Share to X
          </button>
          <button
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={async () => {
              const ok = await copyLink(url);
              setCopied(ok);
              closeLater();
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
