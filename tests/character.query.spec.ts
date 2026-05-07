import { describe, expect, it, vi } from 'vitest';
import { type AppContext } from '../src/context.js';
import { type RestCharacterRecord, UpstreamServiceError } from '../src/datasources/rick-and-morty-api.js';
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


const primary: RestCharacterRecord = { id: '1', name: 'Rick Sanchez', originName: 'Earth (C-137)', statusName: 'Alive', episodeCount: 2, traits: ['Human', 'Alive'] };

const createMockContext = () => {
  const getCharacterById = vi.fn(async (_id: string) => null as RestCharacterRecord | null);

  const context: AppContext = {
    dataSources: {
      rickAndMortyApi: {
        getCharacterById,
      },
    },
  };

  return { context, getCharacterById };
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
});
