import { gql } from "@apollo/client";


export const RequestGenerateGarden = gql`
  mutation RequestGenerateGarden($period: GardenPeriod!, $periodKey: String, $gardenType:String) {
    requestGenerateGarden(period: $period, periodKey: $periodKey, gardenType: $gardenType) {
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

export const RegenerateGarden = gql`
  mutation RegenerateGarden($gardenId: String!) {
    regenerateGarden(gardenId: $gardenId) {
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
      shortTheme
      summary
      period
      periodKey
      progress
      updatedAt
      version
    }
  }
`;

export const GetGardensByPeriod = gql`
    query GetGardensByPeriod($period:GardenPeriod!){
      gardensByPeriod(period: $period){
        id
        status
        imageUrl
        publicId
        shareUrl
        shortTheme
        summary
        period
        periodKey
        progress
        updatedAt
        }
    }
`

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
      shortTheme
      progress
      shareUrl
      updatedAt
      version
    }
  }
`;