import { describe, expect, it } from "vitest";

import { dedupeStructuredData } from "./dedupeStructuredData";

describe("dedupeStructuredData", () => {
  it("deduplicates graph nodes by @id and merges arrays", () => {
    const nodes = dedupeStructuredData([
      {
        "@id": "https://example.com/#org",
        "@type": "Organization",
        name: "Outdoor Adventures, Inc.",
        sameAs: ["https://facebook.com/example"],
      },
      {
        "@id": "https://example.com/#org",
        "@type": "Organization",
        telephone: "+1-855-314-8687",
        sameAs: ["https://linkedin.com/company/example"],
      },
    ]);

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      "@id": "https://example.com/#org",
      "@type": "Organization",
      name: "Outdoor Adventures, Inc.",
      telephone: "+1-855-314-8687",
      sameAs: [
        "https://facebook.com/example",
        "https://linkedin.com/company/example",
      ],
    });
  });
});
