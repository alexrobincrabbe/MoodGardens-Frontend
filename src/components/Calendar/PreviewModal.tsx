import { useMemo, useState, useEffect, useCallback } from "react";
import { GetDiaryEntry } from "../../graphql";
import { useQuery } from "@apollo/client";
import {
  AdvancedImage,
  responsive,
  lazyload,
  placeholder,
} from "@cloudinary/react";
import { GenericButton, ShareMenu } from "..";
import {
  gardenLarge,
  gardenDownloadUrl,
  gardenShareUrl,
  downloadImage,
  formatDayKey
} from "../../utils";
import type { SelectedGarden } from "../../types";

type PreviewModalProps = {
  selected: SelectedGarden;
  onClose: () => void;
  previewGallery: SelectedGarden[];
  onSelect: (s: SelectedGarden) => void;
};

export function PreviewModal({
  selected,
  onClose,
  previewGallery,
  onSelect,
}: PreviewModalProps) {
  const [imgReady, setImgReady] = useState(false);

  const {
    data,
    loading: entryLoading,
    error: entryError,
  } = useQuery(GetDiaryEntry, {
    variables: { dayKey: selected.dayKey },
    fetchPolicy: "network-only",
  });

  const entryText: string | null = data?.entryByDay?.text ?? null;

  useEffect(() => {
    setImgReady(false);
  }, [selected.publicId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const index = useMemo(
    () => previewGallery.findIndex((g) => g.dayKey === selected.dayKey),
    [previewGallery, selected.dayKey]
  );

  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < previewGallery.length - 1;

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    onSelect(previewGallery[index - 1]);
  }, [hasPrev, previewGallery, index, onSelect]);

  const goNext = useCallback(() => {
    if (!hasNext) return;
    onSelect(previewGallery[index + 1]);
  }, [hasNext, previewGallery, index, onSelect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 mx-2 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!hasPrev}
          aria-label="Previous day"
          className="group absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow
             hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          disabled={!hasNext}
          aria-label="Next day"
          className="group absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow
             hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">
              Mood Garden — {formatDayKey(selected.dayKey)}
            </h3>
            {selected.summary && (
              <p className="truncate text-xs text-gray-600">
                {selected.summary}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            {/* Image */}
            {/* Image */}
            <div className="relative">
              {/* Reserve space: pick a ratio (square shown here) */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <AdvancedImage
                  key={selected.publicId}
                  cldImg={gardenLarge(selected.publicId)}
                  plugins={[
                    lazyload(),
                    responsive({ steps: [480, 640, 800, 1024, 1280, 1600] }),
                    placeholder({ mode: "blur" }),
                  ]}
                  alt={`Garden for ${selected.dayKey}`}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  onLoad={() => setImgReady(true)}
                />

                {!imgReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      Loading image…
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Diary entry */}
            <div className="flex min-h-[200px] flex-col">
              <h4 className="mb-2 text-lg">
                Diary entry
              </h4>

              {entryLoading && (
                <p className="text-sm text-gray-500">Loading entry…</p>
              )}
              {entryError && (
                <p className="text-sm text-red-600">Failed to load entry.</p>
              )}
              {!entryLoading &&
                !entryError &&
                (entryText ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {entryText}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">
                    No diary entry saved for this day.
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Footer with download + share + close */}
        <div className="flex shrink-0 items-center justify-between border-t bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Download */}
            <GenericButton
              onClick={() =>
                downloadImage(
                  gardenDownloadUrl(
                    selected.publicId,
                    `mood-garden-${selected.dayKey}.png`
                  ),
                  `mood-garden-${selected.dayKey}.png`
                )
              }
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Download
            </GenericButton>

            {/* Share menu */}
            <ShareMenu
              url={selected.shareUrl ?? gardenShareUrl(selected.publicId)}
              text={`My Mood Garden for ${selected.dayKey} 🌱 #MoodGardens`}
            />
          </div>

          <button
            onClick={onClose}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
