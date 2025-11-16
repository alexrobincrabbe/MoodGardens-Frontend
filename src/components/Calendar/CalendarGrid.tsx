// CalendarGrid.tsx
import React, { memo } from "react";
import { AdvancedImage, responsive, lazyload } from "@cloudinary/react";
import { placeholder } from "@cloudinary/react";
import { isoDayKey, gardenThumb } from "../../utils";
import type { SelectedGarden } from "../../types";

type GardenCell = {
  publicId?: string | null;
  imageUrl?: string | null;
  summary?: string | null;
  status?: string | null;
};

type CalendarGridProps = {
  cells: (number | null)[];
  calendarViewGardens: Record<string, GardenCell>;
  selectedYear: number;
  monthIndex: number;
  setSelected: React.Dispatch<React.SetStateAction<SelectedGarden | null>>;
};

export const CalendarGrid = memo(function CalendarGrid({
  cells,
  calendarViewGardens,
  selectedYear,
  monthIndex,
  setSelected,
}: CalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-px sm:gap-2 md:gap-3">
      {cells.map((day, idx) => {
        if (!day) {
          return (
            <div
              key={`blank-${idx}`}
              className="rounded bg-transparent sm:min-h-24"
            />
          );
        }

        const dUTC = new Date(Date.UTC(selectedYear, monthIndex, day));
        const key = isoDayKey(dUTC);
        const g = calendarViewGardens[key] as GardenCell | undefined;

        return (
          <div
            className="relative flex flex-col gap-1 rounded border border-gray-200 bg-white sm:gap-2"
            key={key}
          >
            <div className="pointer-events-none absolute top-1/2 left-1/2 z-2 -translate-x-1/2 -translate-y-1/2 text-xs text-white md:text-xl">
              {day}
            </div>
            <div className="relative aspect-square w-full overflow-visible rounded bg-gray-50">
              {g?.publicId ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected({
                      dayKey: key,
                      publicId: g.publicId!,
                      summary: g.summary,
                      shareUrl: (g as any)?.shareUrl ?? null,
                    });
                  }}
                  className="absolute inset-0 shadow-black transition-all duration-300 hover:scale-110 hover:shadow-2xl"
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
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
