import { useQuery } from "@apollo/client";
import { User } from "../graphql/auth";
import {AccountDetails, AuthPanel} from "../components";


export function Home() {
  const { data: userData } = useQuery(User, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const user = userData?.user ?? null;
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Grow a picture from your day</h1>
      <p className="text-sm text-neutral-600">
        Mood Gardens turns your feelings into symbolic little worlds -
        reflective spaces that mirror your inner self. Each garden is like a
        page from your soul journal, capturing your emotions and the shape of
        each day. They are moments to hold onto, pauses in time, saved for you
        to return to whenever you need them.
      </p>
      <p className="text-sm text-neutral-600">
        Your journal entries belong only to you - completely private and unseen
        by anyone else. If you’d like to share a Mood Garden picture with
        friends (no writing will be shown, your words are always yours alone)
        simply tap the share button and choose who and where.
      </p>
      <p className="text-sm text-neutral-600">
        Your email stays safe and private, used only to help you recover your
        account if you ever need - like a spare key kept under a plant pot.
      </p>
      <div className="mt-4">
        <AuthPanel />
      </div>
      {user && (
        <div className="mt-4">
          <AccountDetails />
        </div>
      )}
    </section>
  );
}
