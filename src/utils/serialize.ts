import "dotenv/config";

export default function serialize(url: string): string {
  const idlixURL = process.env.IDLIX_URL ?? "";
  // validate url
  if (!url) return "";
  if (!url.startsWith(idlixURL)) return "";
  if (url.includes("?")) return "";

  url = url.replace(idlixURL, "");
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url;
}
