import { RickAndMortyApi, type RickAndMortyApiContract } from './datasources/rick-and-morty-api.js';

export interface AppContext {
  dataSources: {
    rickAndMortyApi: RickAndMortyApiContract;
  };
}

export const createContext = (): AppContext => ({
  dataSources: {
    rickAndMortyApi: new RickAndMortyApi(),
  },
});
