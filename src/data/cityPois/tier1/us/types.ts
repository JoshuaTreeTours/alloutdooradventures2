export type Tier1UsCityPoi = {
  id: string;
  name: string;
  citySlug: string;
  state: string;
  lat: number;
  lng: number;
  categories: string[];
  description: string;
  website?: string;
};
