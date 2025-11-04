import { GardenFeedItem, TodayEntryForm, LoadMoreTrigger, TodayGardenPreview  } from "../components";
import {useAuthData, useEntriesFeed} from "../hooks";
import { isoDayKey, formatDayKey } from "../utils";
import type { Garden } from "../types";

export function Today() {
  const { user, authed, authReady } = useAuthData();
  const today = isoDayKey();
  const {
    items,
    hasMore,
    loadingMore,
    loadMore,
    refetchFeed,
    initialError,
    initialLoading,
  } = useEntriesFeed({ authed });
  const isTodayLogged = items.some((e) => e.dayKey === today);

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Today</h1>
        <p className="text-sm text-gray-500">
          Write about your day. We’ll grow a “day garden.”
        </p>
      </header>

      {!authReady && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
          Checking session…
        </div>
      )}

      {!authed && authReady && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Please sign in to log entries and see your gardens.
        </div>
      )}

      {authed && !initialLoading && !isTodayLogged && (
        <TodayEntryForm user={user} refetchFeed={refetchFeed} />
      )}

      {authed && isTodayLogged && (
        <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
          You’ve already logged an entry for today
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your entries</h2>

        {!authed && authReady && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Sign in to see your saved entries and gardens.
          </div>
        )}

        {authed && initialLoading && (
          <p className="text-sm text-gray-500">Loading entries…</p>
        )}
        {authed && !initialLoading && items.length === 0 && !initialError && (
          <p className="text-sm text-gray-500">No entries yet.</p>
        )}

        <GardensFeed items={items} today={today} />
        {hasMore && (
          <LoadMoreTrigger
            onVisible={loadMore}
            loading={loadingMore}
            hasMore={hasMore}
          />
        )}
      </section>
    </div>
  );
}

type FeedItem = {
  id: string;
  dayKey: string;
  text: string;
  garden: Garden;
};

type GardensFeedProps = {
    items: FeedItem[],
    today: string,
}

function GardensFeed ({items, today}:GardensFeedProps){
    return(
        <>
        {items.map((e) => {
          const isTodayEntry = e.dayKey === today;
          return (
            <article key={e.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDayKey(e.dayKey)}</span>
              </div>
              <p className="mt-1 text-sm">{e.text}</p>
              {isTodayEntry ? (
                <div className="mt-2">
                  <TodayGardenPreview periodKey={today} />
                </div>
              ) : (
                <GardenFeedItem garden={e.garden} day={e.dayKey} />
              )}
            </article>
          );
        })}
        </>
    )
}