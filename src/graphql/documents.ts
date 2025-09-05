import { gql } from "@apollo/client";

export const UpsertEntry = gql`
  mutation UpsertEntry($text: String!, $songUrl: String, $dayKey: String!) {
    upsertEntry(text: $text, songUrl: $songUrl, dayKey: $dayKey) {
      id
      dayKey
      mood {
        valence
        arousal
        tags
      }
      createdAt
    }
  }
`;

export const RequestGarden = gql`
  mutation RequestGarden($period: GardenPeriod!, $periodKey: String!) {
    requestGarden(period: $period, periodKey: $periodKey) {
      id
      status
      period
      periodKey
      imageUrl
      shareUrl    # <-- NEW
      progress
      updatedAt
    }
  }
`;

export const GetGarden = gql`
  query GetGarden($period: GardenPeriod!, $periodKey: String!) {
    garden(period: $period, periodKey: $periodKey) {
      id
      status
      imageUrl
      shareUrl    # <-- NEW
      summary
      period
      periodKey
      progress
      updatedAt
    }
  }
`;

/** Entries feed for infinite scroll (newest first) */
export const MyEntries = gql`
  query MyEntries($limit: Int!, $offset: Int!) {
    myEntries(limit: $limit, offset: $offset) {
      id
      text
      dayKey
      createdAt
      garden {
        id
        status
        imageUrl
        shareUrl    # <-- NEW
        progress
        periodKey
        updatedAt
      }
    }
  }
`;

/** Check if an entry exists for a given dayKey (e.g., today's) */
export const EntryByDay = gql`
  query EntryByDay($dayKey: String!) {
    entryByDay(dayKey: $dayKey) {
      id
      dayKey
      createdAt
    }
  }
`;
