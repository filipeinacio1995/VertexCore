async function readJsonOrText(r: Response) {
  const text = await r.text();
  try {
    return { json: JSON.parse(text), text: null };
  } catch {
    return { json: null, text };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HEADLESS = "https://headless.tebex.io/api";

  // ✅ IMPORTANT: Headless uses PUBLIC TOKEN as the account identifier (w59w-...)
  const ACCOUNT = process.env.TEBEX_PUBLIC_TOKEN || process.env.TEBEX_HEADLESS_TOKEN;
  const SITE_URL = process.env.SITE_URL;

  if (!ACCOUNT) return res.status(500).json({ error: "Missing TEBEX_PUBLIC_TOKEN (or TEBEX_HEADLESS_TOKEN)" });
  if (!SITE_URL) return res.status(500).json({ error: "Missing SITE_URL" });

  try {
    const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];

    // 1) Create basket
    const basketRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${SITE_URL}/success`,
        cancel_url: `${SITE_URL}/store`,
      }),
    });

    const basketBody = await readJsonOrText(basketRes);
    if (!basketRes.ok) {
      return res.status(502).json({
        error: "Basket creation failed",
        details: basketBody.json ?? basketBody.text,
      });
    }

    const basketIdent = basketBody.json?.data?.ident;
    if (!basketIdent) {
      return res.status(502).json({
        error: "Basket creation returned no ident",
        details: basketBody.json ?? basketBody.text,
      });
    }

    // 2) Get auth providers
    const returnUrl = encodeURIComponent(`${SITE_URL}/auth/callback`);
    const authRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets/${basketIdent}/auth?returnUrl=${returnUrl}`);

    const authBody = await readJsonOrText(authRes);
    if (!authRes.ok) {
      return res.status(502).json({
        error: "Auth provider fetch failed",
        details: authBody.json ?? authBody.text,
      });
    }

    const providers = authBody.json?.data || [];
    const cfx = providers.find((p: any) => String(p.provider || "").toLowerCase().includes("cfx"));
    const authUrl = (cfx || providers[0])?.url;

    if (!authUrl) {
      return res.status(502).json({
        error: "No authUrl returned",
        details: authBody.json ?? authBody.text,
      });
    }

    // Optional: return cart too (debug)
    return res.status(200).json({ basketIdent, authUrl });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
