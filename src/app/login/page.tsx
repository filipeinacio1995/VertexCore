"use client";

import { useEffect, useState } from "react";
import { SITE_URL, TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";

export default function LoginPage() {
  const [msg, setMsg] = useState("Preparing login…");

  useEffect(() => {
    (async () => {
      try {
        const returnTo =
          new URLSearchParams(window.location.search).get("returnTo") || "/";

        // Create basket for auth
        const basket = await tebexPost(`/accounts/${TEBEX_TOKEN}/baskets`, {
          complete_url: `${SITE_URL}/auth/return?returnTo=${encodeURIComponent(returnTo)}`,
          cancel_url: `${SITE_URL}${returnTo}`,
          complete_auto_redirect: true,
        });

        const ident = basket?.data?.ident ?? basket?.ident;
        if (!ident) throw new Error("No basket ident returned.");

        setMsg("Redirecting to login provider…");

        const authReturnUrl = `${SITE_URL}/auth/return?basket=${encodeURIComponent(
          ident
        )}&returnTo=${encodeURIComponent(returnTo)}`;

        const auth = await tebexGet(
          `/accounts/${TEBEX_TOKEN}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(authReturnUrl)}`
        );

        const providers = auth?.data ?? auth;
        if (!Array.isArray(providers) || providers.length === 0) {
          throw new Error("No auth providers returned. Check Tebex store auth settings.");
        }

        // Prefer FiveM/Cfx provider if present
        const cfx = providers.find((p: any) => {
          const n = String(p?.name || "").toLowerCase();
          return n.includes("fivem") || n.includes("cfx");
        });

        const url = (cfx?.url ?? providers[0].url) as string | undefined;
        if (!url) throw new Error("No auth URL returned.");

        window.location.assign(url);
      } catch (e: any) {
        setMsg(e?.message ?? "Login failed.");
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Login</h1>
      <p>{msg}</p>
    </main>
  );
}