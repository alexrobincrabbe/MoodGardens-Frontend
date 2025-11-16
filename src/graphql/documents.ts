import { gql } from "@apollo/client";

export const CreateDiaryEntry = gql`
  mutation CreateDiaryEntry($text: String!) {
    createDiaryEntry(text: $text) {
      id
      createdAt
    }
  }
`;

export const GetDiaryEntry = gql`
  query DiaryEntry($dayKey: String!) {
    diaryEntry(dayKey: $dayKey) {
      id
      dayKey
      text
      createdAt
    }
  }
`;

export const PaginatedDiaryEntries = gql`
  query PaginatedDiaryEntries($limit: Int!, $offset: Int!) {
    paginatedDiaryEntries(limit: $limit, offset: $offset) {
      id
      text
      dayKey
      createdAt
      garden {
        id
        status
        imageUrl
        publicId
        shareUrl
        progress
        periodKey
        updatedAt
      }
    }
  }
`;

export const RequestGenerateGarden = gql`
  mutation RequestGenerateGarden($period: GardenPeriod!, $periodKey: String) {
    requestGenerateGarden(period: $period, periodKey: $periodKey) {
      id
      status
      period
      periodKey
      imageUrl
      publicId
      shareUrl
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
      publicId
      shareUrl
      summary
      period
      periodKey
      progress
      updatedAt
    }
  }
`;

export const GardensByMonth = gql`
  query GardensByMonth($monthKey: String!) {
    gardensByMonth(monthKey: $monthKey) {
      id
      period
      periodKey
      status
      imageUrl
      publicId
      summary
      progress
      shareUrl
      updatedAt
    }
  }
`;

export const TodayMetaQuery = gql`
  query TodayMeta {
    currentDiaryDayKey
  }
`;


export const UpdateUserSettings = gql`
  mutation UpdateUserSettings($timezone: String!, $dayRolloverHour: Int!) {
    updateUserSettings(timezone: $timezone, dayRolloverHour: $dayRolloverHour) {
      id
      timezone
      dayRolloverHour
    }
  }
`;