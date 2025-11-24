import { gql } from "graphql-tag";

export const USER_CREATED = gql`
  subscription UserCreated {
    userCreated {
      id
      name
      email
    }
  }
`;
export const USER_UPDATED = gql`
  subscription UserUpdated {
    userUpdated {
      id
      name
      email
      projects {
        id
        name
      }
    }
  }
`;

export const USER_DELETED = gql`
  subscription UserDeleted {
    userDeleted
  }
`;
