export const characterTypeDefs = /* GraphQL */ `
  enum CharacterLookupErrorCode {
    INVALID_INPUT
    NOT_FOUND
    UPSTREAM_ERROR
  }

  type CharacterLookupError {
    code: CharacterLookupErrorCode!
    message: String!
  }

  type Character {
    id: ID!
    name: String!
    detail: String
    tags: [String!]!
    summary: String!
  }

  type CharacterLookupResult {
    character: Character
    error: CharacterLookupError
  }

  extend type Query {
    character(id: ID!): CharacterLookupResult!
  }
`;
