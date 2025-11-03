import { ShareMenu } from "../components/ShareMenu";
import { AdvancedImage } from "@cloudinary/react";
import { lazyload, responsive, placeholder } from "@cloudinary/react";
import {
  gardenThumb,
  gardenDownloadUrl,
  gardenShareUrl,
  downloadImage,
} from "../utils";

type Garden = {
  status: "PENDING" | "READY" | "FAILED";
  progress?: number | null;
  publicId: string;
  periodKey: string;
  shareUrl?: string | null;
};

type props = {
  garden?: Garden | null;
  day: string;
};

export function GardenFeedItem({ garden, day }: props) {
  if (!garden) {
    return null;
  } 
  return (
    <div className="mt-2">
      <p className="text-xs text-gray-600">
        Garden status: <span className="font-medium">{garden.status}</span>
      </p>

      {garden.status !== "READY" && typeof garden.progress === "number" && (
        <div className="mt-1">
          <div className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
            <span>Growing…</span>
            <span>{Math.round(garden.progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
              style={{ width: `${Math.round(garden.progress)}%` }}
            />
          </div>
        </div>
      )}

      {garden?.publicId && garden.status === "READY" && (
        <div className="mt-2">
          <AdvancedImage
            key={garden.publicId}
            cldImg={gardenThumb(garden.publicId)}
            plugins={[
              lazyload(),
              responsive({ steps: [256, 384, 512, 640, 768, 1024] }),
              placeholder({ mode: "blur" }),
            ]}
            alt={`Garden for ${garden.periodKey}`}
            decoding="async"
            className="mt-2 w-full rounded-md"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() =>
                downloadImage(
                  gardenDownloadUrl(
                    garden.publicId,
                    `mood-garden-${garden.periodKey}.png`
                  ),
                  `mood-garden-${garden.periodKey}.png`
                )
              }
            >
              Download
            </button>
            <ShareMenu
              url={garden.shareUrl ?? gardenShareUrl(garden.publicId)}
              text={`My Mood Garden for ${day} 🌱 #MoodGardens`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
