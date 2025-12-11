import { useCallback, useState } from "react";
import { useMutation } from "@apollo/client";
import { CreateDiaryEntry, RequestGenerateGarden } from "../graphql";
import type { EntryForm } from "../validation";

type UseTodayEntrySubmitArgs = {
    resetForm: () => void;
    refetchFeed: () => Promise<any>;
};

export function useTodayEntrySubmit({
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
                    variables: { text: vals.text },
                });
                await requestGenerateGarden({
                    variables: { period: "DAY", periodKey: "dummy", gardenType: vals.gardenType },
                });
                setStatusText("Generating your mood garden…");
                resetForm();
                await refetchFeed();
            } catch (err: any) {
                handleError(err, setStatusText)
            }
        },
        [upsertEntry, requestGenerateGarden, resetForm, refetchFeed]
    );
    return { onSubmit, statusText };
}


function handleError(err: any, setStatusText: React.Dispatch<React.SetStateAction<string>>) {
    console.error("[Today] submit failed (raw):", err);
    if (err?.graphQLErrors?.length) {
        console.error("[Today] GraphQL errors:", err.graphQLErrors);
    }
    if (err?.networkError) {
        console.error("[Today] Network error:", err.networkError);
    }

    setStatusText(
        "Something went wrong while saving or starting the garden."
    );
}