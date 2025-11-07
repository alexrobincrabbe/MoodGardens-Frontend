import { ModalProvider } from "../contexts";
import { useAuthData } from "../hooks";
import {
  AccountDetails,
  AuthPanel,
  OpenModalButton,
  Modal,
  AboutMoodGardensContent,
  HomePageImages,
} from "../components";

export function Home() {
  const { user, authReady } = useAuthData();

  return (
    <div className="m-auto flex w-fit flex-col items-center justify-center rounded-4xl bg-white md:p-10">
      <h1 className="text-soft-charcoal text-center text-2xl font-semibold">
        Mood Gardens
      </h1>
      <br />
      <ModalProvider>
        <OpenModalButton />
        <Modal title="Welcome to Mood Gardens">
          <AboutMoodGardensContent />
        </Modal>
      </ModalProvider>
      <HomePageImages />
      {!user && authReady && <AuthPanel />}
      {user && authReady && <AccountDetails />}
      {!authReady && <div>Checking user...</div>}
    </div>
  );
}
