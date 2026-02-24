import { describe, expect, it } from "vitest";

import { extractFilestackImagesFromHtml } from "./extractFilestackImagesFromHtml";

describe("extractFilestackImagesFromHtml", () => {
  it("keeps valid Filestack URLs, including transformed URLs with handles", () => {
    const html = `
      <img src="https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa" />
      <img src="https://cdn.filestackcontent.com/resize=width:1400/aBcDeFgHiJkLmNoP9" />
      <img src="http://cdn.filestackcontent.com/fit=max,w:1200/ZyXwVuTsRqPoNmLkJ8" />
      <img src="https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa" />
    `;

    expect(extractFilestackImagesFromHtml(html)).toEqual([
      "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
      "https://cdn.filestackcontent.com/aBcDeFgHiJkLmNoP9",
      "https://cdn.filestackcontent.com/ZyXwVuTsRqPoNmLkJ8",
    ]);
  });

  it("rejects bare resize token URLs and other junk", () => {
    const html = `
      <img src="https://cdn.filestackcontent.com/resize" />
      <img src="https://cdn.filestackcontent.com/resize," />
      <img src="https://cdn.filestackcontent.com/resize=width:1400/resize" />
      <img src="https://cdn.filestackcontent.com/ABC123" />
      <img src="https://cdn.filestackcontent.com/validHandleABCDE12" />
    `;

    const images = extractFilestackImagesFromHtml(html);
    expect(images).toEqual([
      "https://cdn.filestackcontent.com/validHandleABCDE12",
    ]);
    expect(images).not.toContain("https://cdn.filestackcontent.com/resize");
  });

  it("caps results using max", () => {
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
