import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrySchema, type EntryForm } from "../../validation";
import { useTodayEntrySubmit } from "../../hooks";
import { useAuthPanel } from "../../contexts";
import { GenericButton } from "../Common/GenericButton";

type TodayEntryFormProps = {
  refetchFeed: () => Promise<any>;
};

export function TodayEntryForm({ refetchFeed }: TodayEntryFormProps) {
  const { user } = useAuthPanel();
  const {
    register,
    handleSubmit,
    formState,
    reset: resetForm,
    setValue,
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      text: "",
      gardenType: "CLASSIC",
    },
  });

  const { errors, isSubmitting } = formState;
  const { onSubmit, statusText } = useTodayEntrySubmit({
    resetForm,
    refetchFeed,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center space-y-2"
    >
      <div className="w-full">
        <label className="block text-sm">
          What’s on your mind {user?.displayName ?? ""}?
        </label>

        {/* RHF field for gardenType */}
        <input type="hidden" {...register("gardenType")} />

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

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
        <GenericButton
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue("gardenType", "CLASSIC")}
        >
          {isSubmitting ? "Generating…" : "Generate Garden"}
        </GenericButton>

        <GenericButton
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue("gardenType", "UNDERWATER")}
        >
          {isSubmitting ? "Generating…" : "Generate Underwater Garden"}
        </GenericButton>

        <GenericButton
          type="submit"
          disabled={isSubmitting}
          onClick={() => setValue("gardenType", "GALAXY")}
        >
          {isSubmitting ? "Generating…" : "Generate Mood Galaxy"}
        </GenericButton>
      </div>

      {statusText && (
        <p className="mt-2 text-sm text-gray-600">{statusText}</p>
      )}
    </form>
  );
}

