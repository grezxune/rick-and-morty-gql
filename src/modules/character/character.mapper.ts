import { type RestCharacterRecord } from '../../datasources/rick-and-morty-api.js';
import { type CharacterModel } from './character.types.js';

export const mapRestCharacterToCharacter = (_character: RestCharacterRecord): CharacterModel => {
  // TODO:
  // - map the Rick and Morty API DTO to the GraphQL-facing CharacterModel
  // - convert empty optional values to null where appropriate
  // - default numeric fields used by summary so output is deterministic
  // - sort tags alphabetically
  throw new Error('TODO: implement mapRestCharacterToCharacter');
};
