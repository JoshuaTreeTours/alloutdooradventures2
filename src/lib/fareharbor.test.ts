import { describe, expect, it } from "vitest";

import { getFareharborItemFromUrl } from "./fareharbor";

describe("getFareharborItemFromUrl", () => {
  it("parses company and item from standard path variants", () => {
    expect(
      getFareharborItemFromUrl(
        "https://fareharbor.com/embeds/book/red-jeep/items/34897/"
      )
    ).toEqual({
      companyShortname: "red-jeep",
      itemId: "34897",
    });

    expect(
      getFareharborItemFromUrl("https://fareharbor.com/red-jeep/items/34897")
    ).toEqual({
      companyShortname: "red-jeep",
      itemId: "34897",
    });
  });
});
