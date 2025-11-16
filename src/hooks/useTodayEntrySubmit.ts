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
                // ✅ backend computes dayKey from timezone + rollover
                await upsertEntry({
                    variables: { text: vals.text },
                });

                // for DAY we now let the backend decide periodKey as well
                const res = await requestGenerateGarden({
                    variables: { period: "DAY", periodKey: "dummy"},
                    // if your GraphQL schema still requires periodKey,
                    // keep `periodKey: "dummy"` – backend ignores it for DAY.
                });
                console.log("requestGenerateGarden result:", res.data);

                const newId = res.data?.requestGenerateGarden?.id ?? null;
                if (!newId) {
                    setStatusText("Could not start garden job (no id returned).");
                    return;
                }

                setStatusText("Generating your mood garden…");

                resetForm();
                await refetchFeed();
            } catch (err: any) {
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

        },
        [upsertEntry, requestGenerateGarden, resetForm, refetchFeed]
    );

    return { onSubmit, statusText };
}
