import { mergeTypeDefs } from '@graphql-tools/merge';
import { characterTypeDefs } from '../modules/character/character.type-defs.js';

const baseTypeDefs = /* GraphQL */ `
  type Query {
    _empty: Boolean
  }
`;

export const typeDefs = mergeTypeDefs([baseTypeDefs, characterTypeDefs]);
