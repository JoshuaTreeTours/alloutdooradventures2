/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      "haleiwa",
      "hanalei",
      "honomu",
      "kahului",
      "kailua-kona",
      "kihei",
      "waikoloa-village",
      "wailea-makena",
      "paia",
      "wailuku",
      "makawao",
      "haiku-pauwela",
      "eleele",
      "kekaha",
      "hakalau",
      "keaau",
      "waimea",
      "kaneohe",
      "kailua",
      "kaaawa",
      "waianae",
    ].map(city => ({
      source: `/guides/us/hawaii/${city}`,
      destination: "/guides/us/hawaii",
      permanent: true,
    }));
  },
};

export default nextConfig;
