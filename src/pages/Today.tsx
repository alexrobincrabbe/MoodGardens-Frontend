import { useState, useCallback } from "react";
import {
  GardenFeedItem,
  TodayEntryForm,
  LoadMoreTrigger,
  TodayGardenPreview,
} from "../components";
import { useEntriesFeed } from "../hooks";
import { isoDayKey, formatDayKey } from "../utils";
import type { Garden } from "../types";
import { useAuthPanel } from "../contexts";

export function Today() {
  const { authed, busy } = useAuthPanel();
  const today = isoDayKey();
  const {
    items,
    hasMore,
    loadingMore,
    loadMore,
    refetchFeed,
    initialError,
    initialLoading,
  } = useEntriesFeed({ authed: authed && !busy });

  const todaysItem = items.find((e) => e.dayKey === today);
  const isTodayLogged = !!todaysItem;

  const todayGardenStatus = todaysItem?.garden?.status;
  const isTodayGardenFinished =
    todayGardenStatus === "READY" || todayGardenStatus === "FAILED";

  // 👇 local flag that gets set when TodayGardenPreview sees READY
  const [todayGardenFinishedLocally, setTodayGardenFinishedLocally] =
    useState(false);

  const handleTodayGardenReady = useCallback(() => {
    setTodayGardenFinishedLocally(true);
  }, []);

  const shouldShowAlreadyLoggedBanner =
    authed &&
    !busy &&
    isTodayLogged &&
    (isTodayGardenFinished || todayGardenFinishedLocally);

  return (
    <div className="mx-auto rounded-2xl bg-white max-w-2xl p-6 space-y-6">
      {busy && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-600">
          Checking session…
        </div>
      )}

      {!authed && !busy && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Please sign in to log entries and see your gardens.
        </div>
      )}

      {authed && !initialLoading && !isTodayLogged && (
        <TodayEntryForm refetchFeed={refetchFeed} />
      )}

      {shouldShowAlreadyLoggedBanner && (
        <div className="rounded-lg bg-gray-50 p-3 text-2xl text-center text-gray-700">
          You’ve already logged an entry for today
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-3xl">Your entries</h2>

        {!authed && !busy && (
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

        <GardensFeed
          items={items}
          today={today}
          onTodayGardenReady={handleTodayGardenReady}
        />
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
  items: FeedItem[];
  today: string;
  onTodayGardenReady: () => void;
};

function GardensFeed({ items, today, onTodayGardenReady }: GardensFeedProps) {
  return (
    <>
      {items.map((e) => {
        const isTodayEntry = e.dayKey === today;
        return (
          <article key={e.id} className="rounded-lg p-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDayKey(e.dayKey)}</span>
            </div>
            <p className="mt-1 text-sm">{e.text}</p>
            {isTodayEntry ? (
              <div className="mt-2">
                <TodayGardenPreview
                  periodKey={today}
                  onGardenReady={onTodayGardenReady}
                />
              </div>
            ) : (
              <GardenFeedItem garden={e.garden} day={e.dayKey} />
            )}
          </article>
        );
      })}
    </>
  );
}
