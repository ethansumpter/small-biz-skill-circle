export function pageHead(title: string, description: string) {
  return { meta: [
    { title: `${title} — Bond` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Bond` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] };
}