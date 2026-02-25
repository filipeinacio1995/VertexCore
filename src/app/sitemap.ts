import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://vertex-core.shop/", lastModified: now },
    { url: "https://vertex-core.shop/store", lastModified: now },
    { url: "https://vertex-core.shop/faq", lastModified: now },
  ];
}