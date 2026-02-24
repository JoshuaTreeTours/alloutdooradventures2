import { describe, expect, it } from "vitest";

import { extractFilestackImagesFromHtml } from "./extractFilestackImagesFromHtml";

describe("extractFilestackImagesFromHtml", () => {
  it("keeps order and deduplicates valid Filestack URLs", () => {
    const html = `
      <img src="https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa" />
      <img src="https://cdn.filestackcontent.com/resize=width:1400/aBcDeFgHiJkLmNoP9" />
      <img src="https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa" />
      <img src="https://cdn.filestackcontent.com/fit=max,w:1200/ZyXwVuTsRqPoNmLkJ8" />
    `;

    expect(extractFilestackImagesFromHtml(html)).toEqual([
      "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
      "https://cdn.filestackcontent.com/aBcDeFgHiJkLmNoP9",
      "https://cdn.filestackcontent.com/ZyXwVuTsRqPoNmLkJ8",
    ]);
  });

  it("rejects junk tokens like resize, and short handles", () => {
    const html = `
      <img src="https://cdn.filestackcontent.com/resize," />
      <img src="https://cdn.filestackcontent.com/resize=width:1400/resize," />
      <img src="https://cdn.filestackcontent.com/ABC123" />
      <img src="https://cdn.filestackcontent.com/validHandleABCDE12" />
    `;

    expect(extractFilestackImagesFromHtml(html)).toEqual([
      "https://cdn.filestackcontent.com/validHandleABCDE12",
    ]);
  });

  it("caps matches at the provided max", () => {
    const html = `
      https://cdn.filestackcontent.com/AAAAABBBBBCCCCCDD
      https://cdn.filestackcontent.com/EEEEFFFFFGGGGGHHH
      https://cdn.filestackcontent.com/IIIIJJJJJKKKKKLLL
    `;

    expect(extractFilestackImagesFromHtml(html, 2)).toEqual([
      "https://cdn.filestackcontent.com/AAAAABBBBBCCCCCDD",
      "https://cdn.filestackcontent.com/EEEEFFFFFGGGGGHHH",
    ]);
  });
});
