import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryForm } from "../validation";
import { useTodayEntrySubmit } from "../hooks";
import { isoDayKey } from "../utils";
import { useAuthPanel } from "../contexts";

type TodayEntryFormProps = {
  refetchFeed: () => Promise<any>;
};

export function TodayEntryForm({ refetchFeed }: TodayEntryFormProps) {
  const { user } = useAuthPanel();
  const today = isoDayKey();
  const formVars = useForm<EntryForm>({ resolver: zodResolver(entrySchema) });
  const { register, handleSubmit, formState, reset: resetForm } = formVars;
  const { errors, isSubmitting } = formState;
  const { onSubmit, statusText } = useTodayEntrySubmit({
    today,
    resetForm,
    refetchFeed,
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">
          What’s on your mind {user?.displayName ?? ""}?
        </label>
        <textarea
          className="mt-1 w-full rounded-lg border p-3"
          rows={4}
          placeholder="I felt stressed about the test, but proud I finished…"
          {...register("text")}
        />
        {errors.text && (
          <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : "Save & Generate Garden"}
      </button>

      {statusText && <p className="mt-2 text-sm text-gray-600">{statusText}</p>}
    </form>
  );
}
