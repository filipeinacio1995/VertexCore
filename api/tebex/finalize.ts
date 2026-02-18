import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const HEADLESS = "https://headless.tebex.io/api";
  const STORE = process.env.TEBEX_WEBSTORE_IDENTIFIER;

  try {
    const { basketIdent, cart, sessionToken } = req.body;

    // Fetch basket to get the internal username_id
    const basketRes = await fetch(`${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}`, {
      headers: { "X-Tebex-Session": sessionToken }
    });
    const basketJson = await basketRes.json();
    const usernameId = basketJson?.data?.username_id;

    if (!usernameId) return res.status(401).json({ error: "User not authenticated with Tebex" });

    // Add ALL packages simultaneously
    await Promise.all(cart.map((item: any) => 
      fetch(`${HEADLESS}/accounts/${STORE}/baskets/${basketIdent}/packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tebex-Session": sessionToken,
        },
        body: JSON.stringify({
          package_id: String(item.package_id),
          quantity: 1,
          variable_data: { username_id: String(usernameId) },
        }),
      })
    ));

    return res.status(200).json({ checkoutUrl: `https://pay.tebex.io/${basketIdent}` });
  } catch (e: any) {
    return res.status(500).json({ error: "Finalize failed", details: e.message });
  }
}