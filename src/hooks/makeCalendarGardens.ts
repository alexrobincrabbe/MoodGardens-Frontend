import { useMemo } from "react";
import type { Garden } from "../types";

type useMakeCalendarGardensProps = {
    data?: {
        myGardensByMonth?: Garden[];
    };
};

export function useMakeCalendarGardens({ data }: useMakeCalendarGardensProps) {
    const previewsList = useMemo(() => {
        const list = data?.myGardensByMonth ?? [];
        return Object.fromEntries(list.map((g: any) => [g.periodKey, g]));
    }, [data]);
    return previewsList;
}
