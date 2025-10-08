// apps/web/src/utils/share.ts
export const openPopup = (url: string) => {
  const w = 700, h = 600;
  const dl = (window.screenLeft ?? window.screenX ?? 0) as number;
  const dt = (window.screenTop ?? window.screenY ?? 0) as number;
  const width = (window.innerWidth ?? document.documentElement.clientWidth ?? screen.width) as number;
  const height = (window.innerHeight ?? document.documentElement.clientHeight ?? screen.height) as number;
  const left = dl + Math.max(0, (width - w) / 2);
  const top = dt + Math.max(0, (height - h) / 2);
  window.open(url, "_blank", `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`);
};

export const shareNative = async (url: string, text: string, title = "Mood Gardens") => {
  const anyNav = navigator as any;
  if (anyNav.share) {
    try {
      await anyNav.share({ title, text, url });
      return;
    } catch {
      /* fall through to web intents */
    }
  }
  // Fallback: X intent
  openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
};

export const shareFacebook = (url: string, text?: string) => {
  openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}${
    text ? `&quote=${encodeURIComponent(text)}` : ""}`);
};

export const shareX = (url: string, text?: string) => {
  openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${
    text ? `&text=${encodeURIComponent(text)}` : ""}`);
};

export const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
};
