import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import { CreateDiaryEntry, RequestGenerateGarden} from "../graphql";
import type { EntryForm } from "../validation";



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

    const [upsertEntry] = useMutation(CreateDiaryEntry);
    const [requestGenerateGarden] = useMutation(RequestGenerateGarden);

    const onSubmit = useCallback(
        async (vals: EntryForm) => {
            setStatusText("");
            try {
                await upsertEntry({
                    variables: { text: vals.text, dayKey: today },
                });

                const res = await requestGenerateGarden({
                    variables: { period: "DAY", periodKey: today },
                });

                const newId = res.data?.requestGenerateGarden?.id ?? null;
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
        [today, upsertEntry, requestGenerateGarden, resetForm, refetchFeed]
    );

    return { onSubmit, statusText };
}