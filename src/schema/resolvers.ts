import { mergeResolvers } from '@graphql-tools/merge';
import { characterResolvers } from '../modules/character/character.resolver.js';

export const resolvers = mergeResolvers([characterResolvers]);
