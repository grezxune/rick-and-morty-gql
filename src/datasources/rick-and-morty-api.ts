import { z } from 'zod';

const isPresentString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const RestCharacterRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  originName: z.string().optional().nullable(),
  statusName: z.string().optional().nullable(),
  episodeCount: z.number().optional().nullable(),
  traits: z.array(z.string()).optional().nullable(),
});

const RawCharacterSchema = z.object({ id: z.number(), name: z.string(), status: z.string().optional().nullable(), species: z.string().optional().nullable(), type: z.string().optional().nullable(), origin: z.object({ name: z.string().optional().nullable() }).optional().nullable(), episode: z.array(z.string()).optional().nullable() });
const toRecord = (character: z.infer<typeof RawCharacterSchema>): RestCharacterRecord => ({ id: String(character.id), name: character.name, originName: character.origin?.name, statusName: character.status, episodeCount: character.episode?.length, traits: [character.status, character.species, character.type].filter(isPresentString) });
const parseOne = (body: unknown): RestCharacterRecord => toRecord(RawCharacterSchema.parse(body));

export type RestCharacterRecord = z.infer<typeof RestCharacterRecordSchema>;

export interface RickAndMortyApiContract {
  getCharacterById(id: string): Promise<RestCharacterRecord | null>;
}

export class UpstreamServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UpstreamServiceError';
  }
}

export class RickAndMortyApi implements RickAndMortyApiContract {
  constructor(private readonly baseUrl: string) {}

  async getCharacterById(id: string): Promise<RestCharacterRecord | null> {
    return this.fetchOne(`/character/${encodeURIComponent(id)}`, { allowNotFound: true });
  }

  private async fetchOne(path: string, options: { allowNotFound?: boolean } = {}): Promise<RestCharacterRecord | null> {
    const response = await fetch(`${this.baseUrl}${path}`);

    if (response.status === 404 && options.allowNotFound) {
      return null;
    }

    if (!response.ok) {
      throw new UpstreamServiceError(`Rick and Morty API request failed with status ${response.status}`);
    }

    const body: unknown = await response.json();
    return parseOne(body);
  }
}
