import { useMemo } from "react";
import type { Garden } from "../../types";


type userMakePreviewGalleryProps = {
    data?: {
        gardensByMonth?: Garden[];
    };
};

export function useMakePreviewGallery({ data }: userMakePreviewGalleryProps) {
    const gallery = useMemo(() => {
        const list = data?.gardensByMonth ?? [];
        return list
            .filter((g: any) => !!g.publicId)
            .sort((a: any, b: any) =>
                String(a.periodKey).localeCompare(String(b.periodKey))
            )
            .map((g: any) => ({
                dayKey: g.periodKey,
                publicId: g.publicId,
                summary: g.summary ?? null,
                shareUrl: g?.shareUrl ?? null,
            }));
    }, [data]);
    return gallery;
}
