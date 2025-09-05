import { gql } from "@apollo/client";

export const Me = gql`
  query Me {
    me {
      id
      email
      createdAt
    }
  }
`;

export const Register = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      user {
        id
        email
        createdAt
      }
    }
  }
`;

export const Login = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        createdAt
      }
    }
  }
`;

export const Logout = gql`
  mutation Logout {
    logout
  }
`;
