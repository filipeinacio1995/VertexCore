export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HEADLESS = "https://headless.tebex.io/api";
  const STORE = process.env.TEBEX_WEBSTORE_IDENTIFIER;
  const SITE_URL = process.env.SITE_URL;

  if (!STORE) return res.status(500).json({ error: "Missing TEBEX_WEBSTORE_IDENTIFIER" });
  if (!SITE_URL) return res.status(500).json({ error: "Missing SITE_URL" });

  try {
    const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];

    // 1) Create basket
    const basketRes = await fetch(`${HEADLESS}/accounts/${STORE}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${SITE_URL}/success`,
        cancel_url: `${SITE_URL}/store`,
        custom: { cart },
      }),
    });

    const basketJson = await basketRes.json();
    const basketIdent = basketJson?.data?.ident;

    if (!basketIdent) {
      return res.status(502).json({ error: "Basket creation failed", details: basketJson });
    }

    // 2) Get auth URL (Cfx/Discord providers)
    const returnUrl = encodeURIComponent(`${SITE_URL}/auth/callback`);
    const authRes = await fetch(
      `${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}/auth?returnUrl=${returnUrl}`
    );
    const authJson = await authRes.json();

    const providers = authJson?.data || [];
    const cfx = providers.find((p: any) =>
      String(p.provider || "").toLowerCase().includes("cfx")
    );
    const authUrl = (cfx || providers[0])?.url;

    if (!authUrl) {
      return res.status(502).json({ error: "No auth URL returned", details: authJson });
    }

    return res.status(200).json({ basketIdent, authUrl });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
