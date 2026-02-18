const TOKEN = import.meta.env.VITE_TEBEX_TOKEN;
const HEADLESS_URL = "https://headless.tebex.io/api";

export async function getTebexCatalog() {
  try {
    const response = await fetch(`${HEADLESS_URL}/accounts/${TOKEN}/categories?includePackages=1`);
    const json = await response.json();
    return json.data || [];
  } catch { return []; }
}

export async function getTebexUser(sessionToken: string) {
  try {
    const response = await fetch(`${HEADLESS_URL}/accounts/player`, {
      headers: {
        'X-Tebex-Token': TOKEN,
        'X-Tebex-Session': sessionToken,
      }
    });
    const json = await response.json();
    // Tebex returns { data: { id, username, meta: { avatar } } }
    if (json.data) {
       return {
         id: json.data.id,
         username: json.data.username,
         avatar: json.data.meta?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${json.data.username}`
       };
    }
    return null;
  } catch { return null; }
}
