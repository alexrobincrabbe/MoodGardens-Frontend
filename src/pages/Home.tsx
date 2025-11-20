import { ModalProvider } from "../contexts";
import { useAuthData } from "../hooks";
import {
  AuthPanel,
  OpenModalButton,
  Modal,
  AboutMoodGardensContent,
  HomePageImages,
} from "../components";


export function Home() {
  const { user, authReady } = useAuthData();
 
  return (
    <div className="m-auto flex h-[80vh] w-fit flex-col items-center justify-center rounded-4xl bg-white md:p-10">
      <h1 className="text-plant-green mt-4 text-center text-2xl font-semibold md:hidden">
        Mood Gardens
      </h1>
      <br />
      <ModalProvider>
        <OpenModalButton className="transition-transform duration-300 hover:scale-110 mb-4 font-sans" />
        <Modal title="Welcome to Mood Gardens">
          <AboutMoodGardensContent />
        </Modal>
      </ModalProvider>
      <HomePageImages />
      {!user && authReady && <AuthPanel />}
      {!authReady && <div>Checking user...</div>}
    </div>
  );
}
