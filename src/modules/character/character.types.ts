export const statusValues = ['ALIVE', 'DEAD', 'UNKNOWN'] as const;

export type CharacterStatus = (typeof statusValues)[number];

export interface CharacterModel {
  id: string;
  name: string;
  detail: string | null;
  status: CharacterStatus | null;
  metric: number;
  tags: string[];
}

export type CharacterLookupErrorCode = 'INVALID_INPUT' | 'NOT_FOUND' | 'UPSTREAM_ERROR';

export interface CharacterLookupError {
  code: CharacterLookupErrorCode;
  message: string;
}

export interface CharacterLookupResult {
  character: CharacterModel | null;
  error: CharacterLookupError | null;
}
