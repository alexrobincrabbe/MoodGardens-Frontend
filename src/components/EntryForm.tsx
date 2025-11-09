import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryForm } from "../validation";
import { useTodayEntrySubmit } from "../hooks";
import { isoDayKey } from "../utils";
import { useAuthPanel } from "../contexts";
import { GenericButton } from "./GenericButton";

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center items-center space-y-2">
      <div className="w-full">
        <label className="block text-sm">
          What’s on your mind {user?.displayName ?? ""}?
        </label>
        <textarea
          className="mt-1 w-full rounded-lg border p-3"
          rows={4}
          placeholder="Write about your day. We’ll grow a Mood Garden."
          {...register("text")}
        />
        {errors.text && (
          <p className="mt-1 text-sm text-red-600">{errors.text.message}</p>
        )}
      </div>

      <GenericButton
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Generating…" : "Generate Garden"}
      </GenericButton>

      {statusText && <p className="mt-2 text-sm text-gray-600">{statusText}</p>}
    </form>
  );
}
