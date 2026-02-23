import { describe, expect, it } from "vitest";

import { extractFilestackImagesFromHtml } from "./extractFilestackImagesFromHtml";

describe("extractFilestackImagesFromHtml", () => {
  it("keeps order and deduplicates filestack image URLs", () => {
    const html = `
      <img src="https://cdn.filestackcontent.com/AAA111" />
      <img src="https://cdn.filestackcontent.com/BBB222" />
      <img src="https://cdn.filestackcontent.com/AAA111" />
      <img src="https://cdn.filestackcontent.com/CCC333" />
    `;

    expect(extractFilestackImagesFromHtml(html)).toEqual([
      "https://cdn.filestackcontent.com/AAA111",
      "https://cdn.filestackcontent.com/BBB222",
      "https://cdn.filestackcontent.com/CCC333",
    ]);
  });

  it("caps matches at the provided max", () => {
    const html = `
      https://cdn.filestackcontent.com/A1
      https://cdn.filestackcontent.com/B2
      https://cdn.filestackcontent.com/C3
    `;

    expect(extractFilestackImagesFromHtml(html, 2)).toEqual([
      "https://cdn.filestackcontent.com/A1",
      "https://cdn.filestackcontent.com/B2",
    ]);
  });
});
