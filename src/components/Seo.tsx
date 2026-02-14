import { DEFAULT_SEO } from "../utils/seo";

type SeoProps = {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: string | null;
  robots?: string;
  googlebot?: string;
};

export default function Seo({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  url,
  type = DEFAULT_SEO.type,
  image = DEFAULT_SEO.image,
  robots = "index,follow,max-image-preview:large",
  googlebot = "index,follow,max-image-preview:large",
}: SeoProps) {
  void title;
  void description;
  void url;
  void type;
  void image;
  void robots;
  void googlebot;

  return null;
}
