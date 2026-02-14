const TOKEN = import.meta.env.VITE_TEBEX_TOKEN;
const HEADLESS_URL = "https://headless.tebex.io/api";

export async function getTebexCatalog() {
  try {
    const response = await fetch(`${HEADLESS_URL}/accounts/${TOKEN}/categories?includePackages=1`);
    const json = await response.json();
    return json.data || [];
  } catch { return []; }
}

export const getLoginUrl = () => {
  const returnUrl = `${window.location.origin}/auth/callback`;
  return `https://checkout.tebex.io/accounts/auth?public_token=${TOKEN}&return_url=${returnUrl}`;
};

export async function getTebexUser(sessionToken: string) {
  try {
    const response = await fetch(`${HEADLESS_URL}/accounts/player`, {
      headers: {
        'X-Tebex-Token': TOKEN,
        'X-Tebex-Session': sessionToken,
      }
    });
    const json = await response.json();
    return json.data || null;
  } catch { return null; }
}

export async function createCheckout(packageIds: (number | string)[]) {
  try {
    const sessionToken = localStorage.getItem("tebex_token");
    const basketRes = await fetch(`${HEADLESS_URL}/accounts/${TOKEN}/baskets`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(sessionToken && { "X-Tebex-Session": sessionToken }) 
      },
      body: JSON.stringify({
        complete_url: `${window.location.origin}/success`,
        cancel_url: window.location.href,
      }),
    });
    const { data: basket } = await basketRes.json();

    for (const id of packageIds) {
      await fetch(`${HEADLESS_URL}/accounts/${TOKEN}/baskets/${basket.ident}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: Number(id), quantity: 1 }),
      });
    }
    return `https://checkout.tebex.io/checkout/${basket.ident}`;
  } catch { return null; }
}