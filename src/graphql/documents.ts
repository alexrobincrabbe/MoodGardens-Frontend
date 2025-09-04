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
      summary
      period
      periodKey
      progress
      updatedAt
    }
  }
`;
