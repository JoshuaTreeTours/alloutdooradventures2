export type WikiImageEntry = {
  url: string;
  sourcePage: string;
  author: string;
  licenseShort: string;
  licenseUrl?: string;
  attributionText: string;
  provider: "wikimedia";
};

export type WikiImageIndex = Record<string, WikiImageEntry>;
