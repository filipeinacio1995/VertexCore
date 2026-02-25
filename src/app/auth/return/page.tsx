"use client";
// app/auth/return/page.tsx
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TEBEX_TOKEN, tebexGet } from "@/lib/tebex";
import { setUser } from "@/lib/user";

function extractAndSaveUser(basketResp: any) {
  const b = basketResp?.data ?? basketResp;

  const username =
    b?.username ??
    b?.customer?.username ??
    b?.user?.username ??
    b?.auth?.username ??
    null;

  const username_id =
    b?.username_id ??
    b?.customer?.username_id ??
    b?.user?.username_id ??
    b?.auth?.username_id ??
    null;

  if (username || username_id) {
    setUser({ username: username ?? undefined, username_id: username_id ?? undefined });
  }
}

function Inner() {
  const sp = useSearchParams();
  const [msg, setMsg] = useState("Finishing login…");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const basket = sp.get("basket");
      const returnTo = sp.get("returnTo") || "/";

      try {
        if (basket) {
          const basketResp = await tebexGet(`/accounts/${TEBEX_TOKEN}/baskets/${basket}`);
          extractAndSaveUser(basketResp);
        }

        // ✅ auto-continue checkout if user tried checkout while logged out
        const pendingCheckout = localStorage.getItem("pending_checkout") === "1";
        if (pendingCheckout && basket) {
          setMsg("Continuing checkout…");
          window.location.assign(`/checkout/return?basket=${encodeURIComponent(basket)}`);
          return;
        }

        setMsg("Redirecting…");
        window.location.assign(returnTo);
      } catch (e: any) {
        setMsg(e?.message ?? "Failed to finish login.");
        window.location.assign(returnTo);
      }
    })();
  }, [sp]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Login</h1>
      <p>{msg}</p>
    </main>
  );
}

export default function AuthReturnPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <Inner />
    </Suspense>
  );
}