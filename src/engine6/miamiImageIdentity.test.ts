import { describe, expect, it } from 'vitest';

import { engine6ResolvedTours } from './registry';
import { buildEngine6SchemaGraph } from './schema/buildEngine6SchemaGraph';

const MIAMI_CODES = [
  '21428P2',
  '5221EVERGLADES',
  '35834P1',
  '5441BOAT',
  '3587ISLQUESS',
  '120303P9',
  '8836P1',
  '5304HAVANA',
  '51540P1',
] as const;

describe('Miami Engine6 strict image identity', () => {
  it.each(MIAMI_CODES)('enforces page/card/schema parity and product scope for %s', productCode => {
    const tour = engine6ResolvedTours.find(item => item.productCode === productCode);
    expect(tour).toBeDefined();

    expect(tour!.heroImageUrl).toBe('/images/hiking-hero.jpg');
    expect(tour!.resolvedImageUrl).toBeNull();
    expect(tour!.diagnostics.heroFallbackTriggered).toBe(true);
    expect(tour!.diagnostics.heroSourceType).toBe('approved-placeholder');
    expect(tour!.diagnostics.heroImageFieldPath).toBeNull();
    expect(tour!.diagnostics.rejectedForeignHeroCandidates).toEqual([]);

    const schema = buildEngine6SchemaGraph(tour!);
    const trip = (schema['@graph'] as Array<Record<string, unknown>>).find(
      node => node['@type'] === 'TouristTrip'
    );
    expect(trip?.image).toBe('/images/hiking-hero.jpg');
  });
});
