import { describe, expect, it } from 'vitest';
import { type RestCharacterRecord } from '../src/datasources/rick-and-morty-api.js';
import { mapRestCharacterToCharacter } from '../src/modules/character/character.mapper.js';

const primary: RestCharacterRecord = { id: '1', name: 'Rick Sanchez', originName: 'Earth (C-137)', statusName: 'Alive', episodeCount: 2, traits: ['Human', 'Alive'] };
const sparse: RestCharacterRecord = { id: '999', name: 'Unknown Character', originName: '', statusName: 'unknown', episodeCount: null, traits: ['unknown'] };

describe('mapRestCharacterToCharacter', () => {
  it('maps a Rick and Morty API response into the GraphQL model', () => {
    expect(mapRestCharacterToCharacter(primary)).toEqual({ id: '1', name: 'Rick Sanchez', detail: 'Earth (C-137)', status: 'ALIVE', metric: 2, tags: ['Alive', 'Human'] });
  });

  it('normalizes empty optional values, defaults metrics, and sorts tags', () => {
    expect(mapRestCharacterToCharacter(sparse)).toEqual({ id: '999', name: 'Unknown Character', detail: null, status: 'UNKNOWN', metric: 0, tags: ['unknown'] });
  });
});
