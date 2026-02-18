import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HEADLESS = "https://headless.tebex.io/api";
  const STORE = process.env.TEBEX_WEBSTORE_IDENTIFIER;
  const SITE_URL = process.env.SITE_URL;

  if (!STORE || !SITE_URL) {
    return res.status(500).json({ error: "Environment variables not configured" });
  }

  try {
    // 1) Create basket
    const basketRes = await fetch(`${HEADLESS}/accounts/${STORE}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${SITE_URL}/success`,
        cancel_url: `${SITE_URL}/store`,
      }),
    });

    const basketJson = await basketRes.json();
    const basketIdent = basketJson?.data?.ident;

    if (!basketIdent) return res.status(502).json({ error: "Basket failed", details: basketJson });

    // 2) Get auth URL
    const returnUrl = encodeURIComponent(`${SITE_URL}/auth/callback`);
    const authRes = await fetch(
      `${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}/auth?returnUrl=${returnUrl}`
    );

    const authJson = await authRes.json();
    const authUrl = authJson?.data?.[0]?.url;

    if (!authUrl) return res.status(502).json({ error: "No auth URL", details: authJson });

    return res.status(200).json({ basketIdent, authUrl });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}