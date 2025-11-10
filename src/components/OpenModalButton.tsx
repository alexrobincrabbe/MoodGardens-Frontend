import { useModal } from "../contexts";

type OpenModalButtonProps = {
  className: string;
};

export function OpenModalButton({ className }: OpenModalButtonProps) {
  const { setIsModalOpen } = useModal();
  return (
    <span className={className}>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-peach-cream hover:bg-beige-cream border-coral flex h-20 w-20 items-center justify-center rounded-full border-4 px-4 py-2 text-6xl font-bold hover:border-5"
      >
        ?
      </button>
    </span>
  );
}
