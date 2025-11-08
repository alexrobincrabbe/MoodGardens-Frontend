import { useModal } from "../contexts"

type OpenModalButtonProps = {
    className: string
}

export function OpenModalButton ({className}:OpenModalButtonProps){
    const {setIsModalOpen} = useModal()
    return(
        <button
        onClick={() => setIsModalOpen(true)}
        className={ `${className} flex items-center justify-center text-plant-green bg-emerald-50 font-bold text-6xl border-4 text-charcoal-black hover:bg-emerald-100 h-20 w-20 rounded-full px-4 py-2`}
      >
        ?
      </button>
    )
}