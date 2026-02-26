//scr/lib/tebex.ts
export const TEBEX_TOKEN = process.env.NEXT_PUBLIC_TEBEX_TOKEN!;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

const BASE = "https://headless.tebex.io/api";

export async function tebexGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Tebex GET failed: ${res.status} ${txt}`);
  }

  return res.json();
}

export async function tebexPost(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Tebex POST failed: ${res.status} ${txt}`);
  }

  return res.json();
}