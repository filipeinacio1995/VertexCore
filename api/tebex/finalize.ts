// api/tebex/finalize.ts

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

  // ✅ IMPORTANT: Headless "accounts/{...}" uses the PUBLIC TOKEN (w59w-...)
  const ACCOUNT = process.env.TEBEX_PUBLIC_TOKEN || process.env.TEBEX_HEADLESS_TOKEN;
  if (!ACCOUNT) {
    return res.status(500).json({ error: "Missing TEBEX_PUBLIC_TOKEN (or TEBEX_HEADLESS_TOKEN)" });
  }

  try {
    const { basketIdent, cart, sessionToken } = req.body || {};

    if (!basketIdent) return res.status(400).json({ error: "Missing basketIdent" });
    if (!sessionToken) return res.status(400).json({ error: "Missing sessionToken" });
    if (!Array.isArray(cart) || cart.length === 0) return res.status(400).json({ error: "Cart is empty" });

    // 1) Fetch basket to get username_id
    const basketRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets/${basketIdent}`, {
      headers: { "X-Tebex-Session": sessionToken },
    });

    const basketBody = await readJsonOrText(basketRes);
    if (!basketRes.ok) {
      return res.status(502).json({
        error: "Failed to fetch basket",
        details: basketBody.json ?? basketBody.text,
      });
    }

    const basketJson = basketBody.json;
    const usernameId = basketJson?.data?.username_id;

    if (!usernameId) {
      return res.status(400).json({
        error: "Not authorized yet (missing username_id). Complete Tebex auth first.",
        details: basketJson,
      });
    }

    // 2) Add packages
    for (const item of cart) {
      const packageId = item?.package_id ?? item?.id;
      const quantity = Number(item?.quantity || 1);

      if (!packageId) {
        return res.status(400).json({ error: "Cart item missing package_id", details: item });
      }

      const addRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets/${basketIdent}/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tebex-Session": sessionToken,
        },
        body: JSON.stringify({
          package_id: String(packageId),
          quantity,
          variable_data: { username_id: String(usernameId) },
        }),
      });

      const addBody = await readJsonOrText(addRes);
      if (!addRes.ok) {
        return res.status(502).json({
          error: "Add package failed",
          details: addBody.json ?? addBody.text,
        });
      }
    }

    // 3) Fetch basket again to get checkout link
    const finalRes = await fetch(`${HEADLESS}/accounts/${ACCOUNT}/baskets/${basketIdent}`, {
      headers: { "X-Tebex-Session": sessionToken },
    });

    const finalBody = await readJsonOrText(finalRes);
    if (!finalRes.ok) {
      return res.status(502).json({
        error: "Failed to fetch final basket",
        details: finalBody.json ?? finalBody.text,
      });
    }

    const finalJson = finalBody.json;
    const checkoutUrl =
      finalJson?.data?.links?.checkout ||
      finalJson?.data?.links?.payment ||
      `https://pay.tebex.io/${basketIdent}`;

    return res.status(200).json({ checkoutUrl });
  } catch (e: any) {
    return res.status(500).json({
      error: "Server error",
      details: String(e?.message || e),
    });
  }
}
