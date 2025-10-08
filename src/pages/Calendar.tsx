import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { MyGardensByMonth, EntryByDay } from "../graphql";
import { periodKeyFor, isoDayKey, gardenThumb, gardenLarge } from "../utils";
import {
  AdvancedImage,
  responsive,
  lazyload,
  placeholder,
} from "@cloudinary/react";
import { useAuth } from "../auth/context";
import { gardenDownloadUrl, gardenShareUrl } from "../utils";
import {
  shareNative,
  shareFacebook,
  shareX,
  copyLink,
  downloadImage,
} from "../utils";

type GardenCell = {
  publicId?: string | null;
  imageUrl?: string | null;
  summary?: string | null;
  status?: string | null;
};

type Selected = {
  dayKey: string;
  publicId: string;
  summary?: string | null;
  shareUrl?: string | null; // <-- add this
};

export default function Calendar() {
  const thisMonth = new Date().toLocaleString("default", { month: "long" });
  const [selectedMonth, setSelectedMonth] = useState<string>(thisMonth);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "long" })
  );
  const monthIndex = months.findIndex((m) => m === selectedMonth);
  const year = 2025;

  const daysInMonth = useMemo(
    () => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
    [year, monthIndex]
  );
  const firstOfMonthUTC = useMemo(
    () => new Date(Date.UTC(year, monthIndex, 1)),
    [year, monthIndex]
  );
  const leadingBlanks = useMemo(() => {
    const sun0 = firstOfMonthUTC.getUTCDay();
    return (sun0 + 6) % 7; // Mon-first
  }, [firstOfMonthUTC]);

  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [leadingBlanks, daysInMonth]);

  // Data
  const monthKey = useMemo(
    () => periodKeyFor("MONTH", new Date(Date.UTC(year, monthIndex, 1))),
    [year, monthIndex]
  );
  const { data, loading, error } = useQuery(MyGardensByMonth, {
    variables: { monthKey },
  });

  const byDay = useMemo(() => {
    const list = data?.myGardensByMonth ?? [];
    return Object.fromEntries(list.map((g: any) => [g.periodKey, g]));
  }, [data]);

  const [selected, setSelected] = useState<Selected | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-2 py-2 sm:px-4 sm:py-4">
      {/* Month selector */}
      <div className="mb-2 sm:mb-3">
        {isEditing ? (
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setIsEditing(false);
            }}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-left text-base font-semibold sm:text-lg"
            title="Click to change month"
          >
            {selectedMonth} {year}
          </button>
        )}
      </div>

      {/* Weekday header (Mon–Sun) */}
      <div className="mb-1 grid grid-cols-7 gap-px text-center text-[10px] font-medium text-gray-600 sm:mb-2 sm:gap-2 sm:text-xs">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="p-1">
            {d}
          </div>
        ))}
      </div>

      {/* Loading / error */}
      {loading && (
        <div className="mb-2 text-[11px] text-gray-500">Loading gardens…</div>
      )}
      {error && (
        <div className="mb-2 text-[11px] text-red-600">Failed to load.</div>
      )}

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px sm:gap-2 md:gap-3">
        {cells.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`blank-${idx}`}
                className="min-h-16 rounded border border-gray-100 bg-gray-50 sm:min-h-24"
              />
            );
          }

          const dUTC = new Date(Date.UTC(year, monthIndex, day));
          const key = isoDayKey(dUTC);
          const g = byDay[key] as GardenCell | undefined;

          return (
            <div
              className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-1 sm:gap-2 sm:p-2"
              key={key}
            >
              <div className="text-[10px] text-gray-500">{day}</div>

              {/* Square image slot */}
              <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-50">
                {g?.publicId ? (
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Selected garden:", g);

                      setSelected({
                        dayKey: key,
                        publicId: g.publicId!,
                        summary: g.summary,
                        shareUrl: (g as any)?.shareUrl ?? null,
                      });
                    }}
                    className="absolute inset-0"
                    aria-label={`Open garden preview for ${key}`}
                    title="Open preview"
                  >
                    <AdvancedImage
                      key={g.publicId}
                      cldImg={gardenThumb(g.publicId!)}
                      plugins={[
                        lazyload(),
                        responsive({ steps: [160, 220, 300, 420, 560, 720] }),
                        placeholder({ mode: "blur" }),
                      ]}
                      alt={g.summary ?? "Garden preview"}
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Modal */}
      {selected && (
        <PreviewModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* =================== Modal =================== */

function PreviewModal({
  selected,
  onClose,
}: {
  selected: Selected;
  onClose: () => void;
}) {
  const { isAuthed } = useAuth(); // <-- if you need auth for the diary entry
  const [imgReady, setImgReady] = useState(false);

  const {
    data,
    loading: entryLoading,
    error: entryError,
  } = useQuery(EntryByDay, {
    variables: { dayKey: selected.dayKey },
    fetchPolicy: "network-only", // always fetch the latest text
    skip: !isAuthed, // don't call if not signed in
  });

  const entryText: string | null = data?.entryByDay?.text ?? null;

  useEffect(() => {
    setImgReady(false);
  }, [selected.publicId]); // reset when a new day opens

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">
              Garden — {selected.dayKey}
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
            <div className="relative">
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
                className="w-full rounded-lg"
                onLoad={() => setImgReady(true)}
              />
              {!imgReady && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm">
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

            {/* Diary entry */}
            <div className="flex min-h-[200px] flex-col">
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
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
            <button
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
            </button>

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

function ShareMenu({ url, text }: { url: string; text: string }) {
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
