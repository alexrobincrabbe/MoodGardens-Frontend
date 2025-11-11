import { useMemo } from "react";
import type { Garden } from "../../types";

type useMakeCalendarGardensProps = {
    data?: {
        gardensByMonth?: Garden[];
    };
};

export function useMakeCalendarGardens({ data }: useMakeCalendarGardensProps) {
    const previewsList = useMemo(() => {
        const list = data?.gardensByMonth ?? [];
        return Object.fromEntries(list.map((g: any) => [g.periodKey, g]));
    }, [data]);
    return previewsList;
}
