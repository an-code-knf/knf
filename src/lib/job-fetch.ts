import { isIP } from "node:net";

export interface JobMeta {
  company: string | null;
  role: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  remote: boolean | null;
  descriptionSnippet: string | null;
}

export interface JobFetchResult {
  ok: boolean;
  meta?: JobMeta;
  error?: string;
}

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 2_000_000;
const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1"]);

// Blocks obvious SSRF targets (loopback/private/link-local IP literals and
// "localhost"). Does not resolve DNS to check where a hostname actually
// points, so it doesn't stop DNS-rebinding — acceptable for a best-effort
// "read a public job posting" feature, not a hard security boundary.
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTNAMES.has(h)) return true;
  const version = isIP(h);
  if (version === 4) {
    const [a, b] = h.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  if (version === 6) {
    return h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd");
  }
  return false;
}

export async function fetchJobPosting(rawUrl: string): Promise<JobFetchResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only http/https URLs are supported." };
  }
  if (isBlockedHost(url.hostname)) {
    return { ok: false, error: "That host can't be fetched." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NorthstarBot/1.0)",
        Accept: "text/html",
      },
    });
  } catch {
    return { ok: false, error: "Couldn't reach that page — it may be down, or blocking automated requests." };
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    return { ok: false, error: `That page responded with ${res.status}.` };
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return { ok: false, error: "That doesn't look like a web page." };
  }

  const html = await readCapped(res, MAX_BYTES);
  return { ok: true, meta: parseHtml(html) };
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return res.text();

  const decoder = new TextDecoder();
  let html = "";
  let received = 0;
  while (received < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  reader.cancel().catch(() => {});
  return html;
}

function parseHtml(html: string): JobMeta {
  for (const block of extractJsonLd(html)) {
    const jobPosting = findJobPosting(block);
    if (jobPosting) return metaFromJobPosting(jobPosting);
  }
  return metaFromMetaTags(html);
}

function extractJsonLd(html: string): unknown[] {
  const results: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    try {
      results.push(JSON.parse(match[1].trim()));
    } catch {
      // malformed JSON-LD block — skip it
    }
  }
  return results;
}

function findJobPosting(node: unknown): Record<string, unknown> | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const type = obj["@type"];
    const types = Array.isArray(type) ? type : [type];
    if (types.includes("JobPosting")) return obj;
    if (obj["@graph"]) return findJobPosting(obj["@graph"]);
  }
  return null;
}

function metaFromJobPosting(jp: Record<string, unknown>): JobMeta {
  const title = typeof jp.title === "string" ? jp.title : null;
  const org = jp.hiringOrganization as Record<string, unknown> | undefined;
  const company = org && typeof org.name === "string" ? org.name : null;
  const jobLocation = jp.jobLocation as Record<string, unknown> | undefined;
  const address = jobLocation?.address as Record<string, unknown> | undefined;
  const location = address && typeof address.addressLocality === "string" ? address.addressLocality : null;
  const remote = typeof jp.jobLocationType === "string" ? jp.jobLocationType.toUpperCase().includes("TELECOMMUTE") : null;

  let salaryMin: number | null = null;
  let salaryMax: number | null = null;
  let currency: string | null = null;
  const baseSalary = jp.baseSalary as Record<string, unknown> | undefined;
  if (baseSalary) {
    currency = typeof baseSalary.currency === "string" ? baseSalary.currency : null;
    const value = baseSalary.value as Record<string, unknown> | undefined;
    if (value) {
      salaryMin = typeof value.minValue === "number" ? value.minValue : typeof value.value === "number" ? value.value : null;
      salaryMax = typeof value.maxValue === "number" ? value.maxValue : salaryMin;
    }
  }

  const description = typeof jp.description === "string" ? stripHtml(jp.description).slice(0, 400) : null;

  return { company, role: title, location, salaryMin, salaryMax, currency, remote, descriptionSnippet: description };
}

function metaFromMetaTags(html: string): JobMeta {
  const title = matchTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const ogSiteName = matchMeta(html, "og:site_name");
  const ogTitle = matchMeta(html, "og:title");
  return {
    company: ogSiteName,
    role: ogTitle ?? title,
    location: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    remote: null,
    descriptionSnippet: null,
  };
}

function matchTag(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : null;
}

function matchMeta(html: string, property: string): string | null {
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i");
  const m1 = html.match(re1);
  if (m1) return decodeEntities(m1[1].trim());
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i");
  const m2 = html.match(re2);
  return m2 ? decodeEntities(m2[1].trim()) : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
