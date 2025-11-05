import { useState } from "react";
import { useQuery } from "@apollo/client";
import { User } from "../graphql/auth";
import { AccountDetails, AuthPanel, SignOutButton } from "../components";
import plants from "../assets/images/peach_pill_with_plants.svg";
import happy from "../assets/images/icon_happy.svg";
import sad from "../assets/images/icon_sad.svg";
import heart from "../assets/images/icon_heart.svg";
import { Modal } from "../components";

export function Home() {
  const { data: userData } = useQuery(User, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const user = userData?.user ?? null;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="flex justify-center items-center flex-col bg-white p-10 rounded-4xl">
      <h1 className="text-2xl text-center font-semibold text-soft-charcoal">
        Mood Gardens
      </h1>
      <br/>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full w-10 h-10 bg-pastel-aqua px-4 py-2 text-charcoal-black hover:bg-eucalyptus"
      >
       ?
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Welcome to Mood Gardens">
        <p className="text-sm text-neutral-600">
          Mood Gardens turns your feelings into symbolic little worlds -
          reflective spaces that mirror your inner self. Each garden is like a
          page from your soul journal, capturing your emotions and the shape of
          each day. They are moments to hold onto, pauses in time, saved for you
          to return to whenever you need them.
        </p>
        <p className="text-sm text-neutral-600">
          Your journal entries belong only to you - completely private and
          unseen by anyone else. If you’d like to share a Mood Garden picture
          with friends (no writing will be shown, your words are always yours
          alone) simply tap the share button and choose who and where.
        </p>
        <p className="text-sm text-neutral-600">
          Your email stays safe and private, used only to help you recover your
          account if you ever need - like a spare key kept under a plant pot.
        </p>
        <div className="mt-4 text-right">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </Modal>

      <div className="mt-4 flex flex-col items-center justify-center">
        <img src={plants} alt="images of plants" className="w-[400px]" />;
        <div className="flex items-center justify-center">
          <img src={happy} alt="" className="w-[75px] md:w-[130px]" />;
          <img src={heart} alt="" className="w-[75px]  md:w-[130px]" />;
          <img src={sad} alt="" className="w-[75px] md:w-[130px]" />;
        </div>
        
      {!user && (
        <div className="mt-4">
          <AuthPanel />
        </div>
      )}
        {user && (
          <>
            <AccountDetails />
            <SignOutButton />;
          </>
        )}
      </div>
    </section>
  );
}
