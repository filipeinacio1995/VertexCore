export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const HEADLESS = "https://headless.tebex.io/api";
  const STORE = process.env.TEBEX_WEBSTORE_IDENTIFIER;

  if (!STORE) {
    return res.status(500).json({ error: "Missing TEBEX_WEBSTORE_IDENTIFIER" });
  }

  try {
    const { basketIdent, cart, sessionToken } = req.body || {};

    if (!basketIdent) return res.status(400).json({ error: "Missing basketIdent" });
    if (!sessionToken) return res.status(400).json({ error: "Missing sessionToken" });
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Fetch basket to get username_id
    const basketRes = await fetch(
      `${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}`,
      { headers: { "X-Tebex-Session": sessionToken } }
    );

    const basketJson = await basketRes.json();
    const usernameId = basketJson?.data?.username_id;

    if (!usernameId) {
      return res.status(400).json({
        error: "Not authenticated with Tebex yet",
        details: basketJson,
      });
    }

    // Add packages
    for (const item of cart) {
      const addRes = await fetch(
        `${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}/packages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tebex-Session": sessionToken,
          },
          body: JSON.stringify({
            package_id: String(item.package_id),
            quantity: Number(item.quantity || 1),
            variable_data: { username_id: String(usernameId) },
          }),
        }
      );

      if (!addRes.ok) {
        const err = await addRes.text();
        return res.status(502).json({ error: "Add package failed", details: err });
      }
    }

    // Final checkout URL
    return res.status(200).json({
      checkoutUrl: `https://pay.tebex.io/${basketIdent}`,
    });
  } catch (e: any) {
    return res.status(500).json({
      error: "Server error",
      details: String(e?.message || e),
    });
  }
}
