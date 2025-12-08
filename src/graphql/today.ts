import { gql } from "@apollo/client";

export const TodayMetaQuery = gql`
  query TodayMeta {
    currentDiaryDayKey
  }
`;

