import { toast } from "react-hot-toast";


export const downloadImage = async (url: string, filename: string) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(blobUrl);

    toast.success("Image downloaded");
    
  } catch (e) {
    console.error("Download failed:", e);
    toast.error("Download failed");
  }
};
