import { type AppContext } from '../../context.js';
import { type CharacterLookupResult, type CharacterModel, type CharacterStatus } from './character.types.js';

interface CharacterQueryArgs {
  id: string;
}

interface CharacterCollectionQueryArgs {
  status: CharacterStatus;
  limit?: number | null;
}

const normalizeCharacterId = (id: string): string => id.trim();

const isValidCharacterId = (id: string): boolean => /^\d+$/.test(id) && Number(id) > 0;

export const characterResolvers = {
  Query: {
    character: async (_parent: unknown, arguments_: CharacterQueryArgs, _context: AppContext): Promise<CharacterLookupResult> => {
      const normalizedId = normalizeCharacterId(arguments_.id);

      if (!isValidCharacterId(normalizedId)) {
        return {
          character: null,
          error: {
            code: 'INVALID_INPUT',
            message: 'TODO: return a clearer invalid-input message',
          },
        };
      }

      // TODO:
      // - fetch the character from the datasource
      // - return NOT_FOUND when the datasource returns null
      // - return UPSTREAM_ERROR when the REST API is unavailable
      // - return the mapped character on success
      throw new Error('TODO: implement Query.character');
    },

    charactersByStatus: async (_parent: unknown, _arguments: CharacterCollectionQueryArgs, _context: AppContext): Promise<CharacterModel[]> => {
      // TODO:
      // - fetch characters for the requested status
      // - map each DTO into the GraphQL model
      // - sort by name
      // - apply limit after sorting
      // - treat negative limits as 0
      throw new Error('TODO: implement Query.charactersByStatus');
    },
  },

  Character: {
    summary: (_character: CharacterModel): string => {
      // TODO:
      // - derive a readable summary from the mapped CharacterModel
      // - include name, id, status, metric, and detail/fallback
      throw new Error('TODO: implement Character.summary');
    },
  },
};
