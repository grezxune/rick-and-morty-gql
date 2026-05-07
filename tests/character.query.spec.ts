import { describe, expect, it, vi } from 'vitest';
import { type AppContext } from '../src/context.js';
import { type RestCharacterRecord, UpstreamServiceError } from '../src/datasources/rick-and-morty-api.js';
import { type CharacterStatus } from '../src/modules/character/character.types.js';
import { createServer } from '../src/server.js';

const lookupQuery = /* GraphQL */ `
  query Lookup($id: ID!) {
    character(id: $id) {
      character {
        id
        name
        detail
        tags
        summary
      }
      error {
        code
        message
      }
    }
  }
`;

const collectionQuery = /* GraphQL */ `
  query Collection($status: CharacterStatus!, $limit: Int) {
    charactersByStatus(status: $status, limit: $limit) {
      id
      name
    }
  }
`;

const primary: RestCharacterRecord = { id: '1', name: 'Rick Sanchez', originName: 'Earth (C-137)', statusName: 'Alive', episodeCount: 2, traits: ['Human', 'Alive'] };
const second: RestCharacterRecord = { id: '2', name: 'Morty Smith', originName: 'Earth', statusName: 'Alive', episodeCount: 1, traits: ['Human'] };
const third: RestCharacterRecord = { id: '4', name: 'Beth Smith', originName: 'Earth', statusName: 'Alive', episodeCount: 1, traits: ['Human'] };

const createMockContext = () => {
  const getCharacterById = vi.fn(async (_id: string) => null as RestCharacterRecord | null);
  const getCharactersByStatus = vi.fn(async (_status: CharacterStatus) => [] as RestCharacterRecord[]);

  const context: AppContext = {
    dataSources: {
      rickAndMortyApi: {
        getCharacterById,
        getCharactersByStatus,
      },
    },
  };

  return { context, getCharacterById, getCharactersByStatus };
};

const executeSingle = async (query: string, variables: Record<string, unknown>, contextValue: AppContext) => {
  const server = createServer();

  try {
    const response = await server.executeOperation({ query, variables }, { contextValue });

    if (response.body.kind !== 'single') {
      throw new Error('Expected a single GraphQL result.');
    }

    return response.body.singleResult;
  } finally {
    await server.stop();
  }
};

describe('character queries', () => {
  it('returns a mapped character and computed summary for a valid id', async () => {
    const { context, getCharacterById } = createMockContext();
    getCharacterById.mockResolvedValue(primary);

    const result = await executeSingle(lookupQuery, { id: ' 1 ' }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      character: {
        character: {
          id: '1',
          name: 'Rick Sanchez',
          detail: 'Earth (C-137)',
          tags: ['Alive', 'Human'],
          summary: 'Rick Sanchez (1) is a character in ALIVE. Detail: Earth (C-137). Episode count: 2.',
        },
        error: null,
      },
    });
    expect(getCharacterById).toHaveBeenCalledWith('1');
  });

  it('returns INVALID_INPUT and skips the datasource when the id is malformed', async () => {
    const { context, getCharacterById } = createMockContext();

    const result = await executeSingle(lookupQuery, { id: 'rick' }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      character: {
        character: null,
        error: {
          code: 'INVALID_INPUT',
          message: 'Character id must be a positive integer.',
        },
      },
    });
    expect(getCharacterById).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when the datasource cannot find a character', async () => {
    const { context, getCharacterById } = createMockContext();
    getCharacterById.mockResolvedValue(null);

    const result = await executeSingle(lookupQuery, { id: '999999' }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      character: {
        character: null,
        error: {
          code: 'NOT_FOUND',
          message: 'No character found for id "999999".',
        },
      },
    });
  });

  it('returns UPSTREAM_ERROR when the datasource throws an upstream failure', async () => {
    const { context, getCharacterById } = createMockContext();
    getCharacterById.mockRejectedValue(new UpstreamServiceError('boom'));

    const result = await executeSingle(lookupQuery, { id: ' 1 ' }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      character: {
        character: null,
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Rick and Morty API is currently unavailable.',
        },
      },
    });
  });

  it('sorts characters by name before applying the limit', async () => {
    const { context, getCharactersByStatus } = createMockContext();
    getCharactersByStatus.mockResolvedValue([second, primary, third]);

    const result = await executeSingle(collectionQuery, { status: 'ALIVE', limit: 2 }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      charactersByStatus: [
        {
          id: '4',
          name: 'Beth Smith',
        },
        {
          id: '2',
          name: 'Morty Smith',
        },
      ],
    });
  });

  it('treats a negative limit as zero', async () => {
    const { context, getCharactersByStatus } = createMockContext();
    getCharactersByStatus.mockResolvedValue([second, primary, third]);

    const result = await executeSingle(collectionQuery, { status: 'ALIVE', limit: -3 }, context);

    expect(result.errors).toBeUndefined();
    expect(result.data).toEqual({
      charactersByStatus: [],
    });
  });
});
