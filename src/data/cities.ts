import type { LocationId } from './types';
import { LOCATIONS } from './gameData';

// Cities are a purely cosmetic skin over the same six location slots: switching
// city only relabels the neighborhoods and the transport word — prices, travel,
// and every game rule are identical. New York is the default. (A future version
// could make cities play differently; this layer is deliberately thin.)

export type CityId =
  | 'new-york'
  | 'toronto'
  | 'montreal'
  | 'ottawa'
  | 'vancouver'
  | 'sydney'
  | 'london'
  | 'chicago'
  | 'miami'
  | 'hong-kong';

export interface City {
  id: CityId;
  name: string;
  /** Transit noun for the travel panel, e.g. "Subway from <neighborhood>". */
  transport: string;
  /** Six neighborhood names, aligned 1:1 to LOCATIONS order. */
  neighborhoods: string[];
}

export const CITIES: City[] = [
  {
    id: 'new-york',
    name: 'New York',
    transport: 'Subway',
    neighborhoods: ['Bronx', 'Manhattan', 'Ghetto', 'Coney Island', 'Central Park', 'Brooklyn'],
  },
  {
    id: 'toronto',
    name: 'Toronto',
    transport: 'Streetcar',
    neighborhoods: ['Downtown', 'Kensington Market', 'Scarborough', 'The Annex', 'Parkdale', 'North York'],
  },
  {
    id: 'montreal',
    name: 'Montréal',
    transport: 'Métro',
    neighborhoods: ['Le Plateau', 'Vieux-Montréal', 'Mile End', 'Hochelaga', 'Verdun', 'Outremont'],
  },
  {
    id: 'ottawa',
    name: 'Ottawa',
    transport: 'O-Train',
    neighborhoods: ['ByWard Market', 'Centretown', 'Westboro', 'Sandy Hill', 'The Glebe', 'Vanier'],
  },
  {
    id: 'vancouver',
    name: 'Vancouver',
    transport: 'SkyTrain',
    neighborhoods: ['Gastown', 'Kitsilano', 'Mount Pleasant', 'Yaletown', 'Commercial Drive', 'Downtown Eastside'],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    transport: 'Ferry',
    neighborhoods: ['Kings Cross', 'Bondi Beach', 'Manly', 'Darling Harbour', 'North Sydney', 'The Rocks'],
  },
  {
    id: 'london',
    name: 'London',
    transport: 'Tube',
    neighborhoods: ['Soho', 'Camden', 'Brixton', 'Shoreditch', 'Hackney', 'Peckham'],
  },
  {
    id: 'chicago',
    name: 'Chicago',
    transport: 'The L',
    neighborhoods: ['The Loop', 'Wicker Park', 'Englewood', 'Hyde Park', 'Pilsen', 'Lincoln Park'],
  },
  {
    id: 'miami',
    name: 'Miami',
    transport: 'Metrorail',
    neighborhoods: ['South Beach', 'Little Havana', 'Wynwood', 'Overtown', 'Brickell', 'Liberty City'],
  },
  {
    id: 'hong-kong',
    name: 'Hong Kong',
    transport: 'MTR',
    neighborhoods: ['Mong Kok', 'Central', 'Kowloon', 'Wan Chai', 'Sham Shui Po', 'Tsim Sha Tsui'],
  },
];

export const DEFAULT_CITY: CityId = 'new-york';

export const CITY_BY_ID: Record<CityId, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
) as Record<CityId, City>;

/** Slot index (0..5) of each canonical location, for mapping to neighborhoods. */
const LOCATION_INDEX: Record<LocationId, number> = Object.fromEntries(
  LOCATIONS.map((l, i) => [l.id, i]),
) as Record<LocationId, number>;

function city(id: CityId): City {
  return CITY_BY_ID[id] ?? CITY_BY_ID[DEFAULT_CITY];
}

/** Display name of a location slot in the given city. */
export function locationName(cityId: CityId, location: LocationId): string {
  return city(cityId).neighborhoods[LOCATION_INDEX[location]];
}

/** The city's transit noun ("Subway", "Métro", …). */
export function transportWord(cityId: CityId): string {
  return city(cityId).transport;
}
