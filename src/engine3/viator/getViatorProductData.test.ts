import { describe, expect, it } from "vitest";

import { parseViatorHtml } from "./getViatorProductData";

describe("parseViatorHtml", () => {
  it("extracts price and rating from JSON-LD shape", () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Palm Springs Indian Canyons Bike and Hike",
              "offers": {
                "@type": "Offer",
                "price": "179",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.7",
                "reviewCount": "86"
              }
            }
          </script>
        </head>
        <body></body>
      </html>
    `;

    const parsed = parseViatorHtml(
      html,
      "https://www.viator.com/tours/Palm-Springs/Palm-Springs-Indian-Canyons-Bike-and-Hike/d648-3351P15",
      "3351P15"
    );

    expect(parsed.priceFrom).toBe("179");
    expect(parsed.priceCurrency).toBe("USD");
    expect(parsed.rating).toBe(4.7);
    expect(parsed.reviewCount).toBe(86);
  });

  it("falls back to embedded JSON blobs when JSON-LD is absent", () => {
    const html = `
      <html>
        <head>
          <script>
            window.__NEXT_DATA__ = {
              "productCode": "3351P15",
              "summary": {
                "fromPrice": "USD 189",
                "currencyCode": "USD"
              },
              "aggregateRating": {
                "ratingValue": "4.6",
                "reviewCount": "91"
              }
            };
          </script>
        </head>
        <body></body>
      </html>
    `;

    const parsed = parseViatorHtml(
      html,
      "https://www.viator.com/tours/Palm-Springs/Palm-Springs-Indian-Canyons-Bike-and-Hike/d648-3351P15",
      "3351P15"
    );

    expect(parsed.priceFrom).toBe("USD 189");
    expect(parsed.priceCurrency).toBe("USD");
    expect(parsed.rating).toBe(4.6);
    expect(parsed.reviewCount).toBe(91);
  });
});
