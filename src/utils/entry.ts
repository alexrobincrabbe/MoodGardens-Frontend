import { EntryByDay } from "../graphql";
import { useQuery } from "@apollo/client";
import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import { UpsertEntry, RequestGarden } from "../graphql";
import type { EntryForm } from "../validation";

export function useTodayData(skip: boolean, today: string) {
  const {
    data: todayData,
    loading: todayLoading,
    refetch: refetchToday,
  } = useQuery(EntryByDay, {
    variables: { dayKey: today }, 
    fetchPolicy: "cache-and-network",
    skip,
  });


  return { todayData, todayLoading, refetchToday };
}


type UseTodayEntrySubmitArgs = {
    today: string;
    resetForm: () => void;
    refetchFeed: () => Promise<any>;
};

export function useTodayEntrySubmit({
    today,
    resetForm,
    refetchFeed,
}: UseTodayEntrySubmitArgs) {
    const [statusText, setStatusText] = useState<string>("");

    const [upsertEntry] = useMutation(UpsertEntry);
    const [requestGarden] = useMutation(RequestGarden);

    const onSubmit = useCallback(
        async (vals: EntryForm) => {
            setStatusText("");
            try {
                await upsertEntry({
                    variables: { text: vals.text, songUrl: vals.songUrl, dayKey: today },
                });

                const res = await requestGarden({
                    variables: { period: "DAY", periodKey: today },
                });

                const newId = res.data?.requestGarden?.id ?? null;
                if (!newId) {
                    setStatusText("Could not start garden job (no id returned).");
                    return;
                }

                setStatusText("Generating your mood garden…");

                resetForm();
                await refetchFeed();
            } catch (err) {
                console.error("[Today] submit failed:", err);
                setStatusText(
                    "Something went wrong while saving or starting the garden."
                );
            }
        },
        [today, upsertEntry, requestGarden, resetForm, refetchFeed]
    );

    return { onSubmit, statusText };
}
