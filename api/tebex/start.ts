// api/tebex/start.ts

async function readJsonOrText(r: Response) {
  const text = await r.text();
  try {
    return { json: JSON.parse(text), text: null };
  } catch {
    return { json: null, text };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const HEADLESS = "https://headless.tebex.io/api";

  // ✅ Headless "accounts/{...}" uses PUBLIC TOKEN (w59w-...)
  const ACCOUNT = process.env.TEBEX_PUBLIC_TOKEN || process.env.TEBEX_HEADLESS_TOKEN;
  const SITE_URL = process.env.SITE_URL;

  if (!ACCOUNT) {
    return res.status(500).json({ error: "Missing TEBEX_PUBLIC_TOKEN (or TEBEX_HEADLESS_TOKEN)" });
  }
  if (!SITE_URL) {
    return res.status(500).json({ error: "Missing SITE_URL" });
  }

  try {
    // We accept cart but don't need it in start (we add packages in finalize after auth)
    const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];

    // 1) Create basket
    const basketRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        complete_url: `${SITE_URL}/success`,
        cancel_url: `${SITE_URL}/store`,
        // optional debug
        custom: { cart },
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
    const authRes = await fetch(
      `${HEADLESS}/accounts/${ACCOUNT}/baskets/${basketIdent}/auth?returnUrl=${returnUrl}`
    );

    const authBody = await readJsonOrText(authRes);

    if (!authRes.ok) {
      return res.status(502).json({
        error: "Auth provider fetch failed",
        details: authBody.json ?? authBody.text,
      });
    }

    const providers = authBody.json?.data || [];

    const pickUrl = (p: any) =>
      p?.url ||
      p?.redirect_url ||
      p?.href ||
      p?.link ||
      p?.links?.redirect ||
      p?.links?.url ||
      null;

    const pickProvider = (needle: string) =>
      providers.find((p: any) => String(p?.provider || "").toLowerCase().includes(needle));

    const cfx = pickProvider("cfx");
    const discord = pickProvider("discord");
    const first = providers[0];

    const authUrl = pickUrl(cfx) || pickUrl(discord) || pickUrl(first);

    if (!authUrl) {
      return res.status(502).json({
        error: "No authUrl returned",
        details: providers, // show exactly what Tebex gave us
      });
    }

    // ✅ Return providers too so you can inspect it in DevTools if needed
    return res.status(200).json({ basketIdent, authUrl, providers });
  } catch (e: any) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}