import { gql } from "@apollo/client";

export const User = gql`
  query User {
    user {
      id
      email
      displayName
      createdAt
      timezone
      dayRolloverHour
      notifyWeeklyGarden
      notifyMonthlyGarden
      notifyYearlyGarden
    }
  }
`;

export const Register = gql`
  mutation Register($email: String!, $password: String!, $displayName: String!) {
    register(email: $email, password: $password, displayName: $displayName) {
       user { id }
    }
  }
`;

export const Login = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
       user { id }
    }
  }
`;

export const Logout = gql`
  mutation Logout {
    logout
  }
`;

export const UpdateDisplayName = gql`
  mutation UpdateDisplayName($displayName: String!) {
    updateDisplayName(displayName: $displayName) {
      id
      email
      createdAt
      displayName
    }
  }
`;