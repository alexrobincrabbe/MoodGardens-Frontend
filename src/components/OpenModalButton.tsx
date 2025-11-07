import { useModal } from "../contexts"

export function OpenModalButton (){
    const {setIsModalOpen} = useModal()
    return(
        <button
        onClick={() => setIsModalOpen(true)}
        className="bg-pastel-aqua text-charcoal-black hover:bg-eucalyptus h-10 w-10 rounded-full px-4 py-2"
      >
        ?
      </button>
    )
}