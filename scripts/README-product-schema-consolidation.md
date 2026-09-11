# Product schema consolidation guard

The production build may temporarily create a separate `product-structured-data-route-repair` JSON-LD block while repairing a tour route. Before final auditing, `consolidate-product-structured-data.mjs` promotes that repaired graph into the primary `structured-data` block and removes the temporary repair block.

`audit-product-schema-uniqueness.mjs` then requires every sitemap-listed tour product page to contain exactly one canonical `Product` node and no surviving route-repair JSON-LD block.

This prevents Google from merging duplicate Product identities and reporting duplicate properties such as `brand`.
