"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartItem, clearCart, getCart, removeFromCart } from "@/lib/cart";
import { SITE_URL, TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";
import { getUser } from "@/lib/user";
import TopBar from "@/components/Navbar";

function basketHasUser(basketResp: any) {
  const b = basketResp?.data ?? basketResp;
  return Boolean(
    b?.username ||
      b?.customer?.username ||
      b?.user?.username ||
      b?.auth?.username
  );
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setItems(getCart()), []);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  async function startCheckout() {
    setError(null);

    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }

    // If not logged in (our local "session"), force login first
    const user = getUser();
    if (!user) {
      localStorage.setItem("pending_checkout", "1");
      window.location.assign(`/login?returnTo=${encodeURIComponent("/cart")}`);
      return;
    }

    setBusy(true);
    try {
      // 1) Create basket
      const basket = await tebexPost(`/accounts/${TEBEX_TOKEN}/baskets`, {
        complete_url: `${SITE_URL}/checkout/return`,
        cancel_url: `${SITE_URL}/cart`,
        complete_auto_redirect: true,
      });

      const ident = basket?.data?.ident ?? basket?.ident;
      if (!ident) throw new Error("No basket ident returned by Tebex.");

      // 2) Check if basket already authorized (sometimes it is via cookies/session)
      const basketResp = await tebexGet(`/accounts/${TEBEX_TOKEN}/baskets/${ident}`);

      if (basketHasUser(basketResp)) {
        // Authorized → add packages now → go to checkout
        for (const it of items) {
          await tebexPost(`/baskets/${ident}/packages`, {
            package_id: String(it.package_id),
            quantity: it.quantity,
          });
        }

        const checkoutUrl =
          basketResp?.data?.links?.checkout ?? basketResp?.links?.checkout;
        if (!checkoutUrl) throw new Error("Checkout URL not found.");

        clearCart();
        window.location.assign(checkoutUrl);
        return;
      }

      // Not authorized → redirect to auth, then /checkout/return will add packages + redirect
      const returnUrl = `${SITE_URL}/checkout/return?basket=${encodeURIComponent(ident)}`;
      const auth = await tebexGet(
        `/accounts/${TEBEX_TOKEN}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(returnUrl)}`
      );

      const providers = auth?.data ?? auth;
      if (!Array.isArray(providers) || providers.length === 0) {
        throw new Error("No auth providers returned.");
      }

      const cfx = providers.find((p: any) => {
        const n = String(p?.name || "").toLowerCase();
        return n.includes("fivem") || n.includes("cfx");
      });

      window.location.assign((cfx?.url ?? providers[0].url) as string);
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  // Auto-continue checkout after login
  useEffect(() => {
    const pending = localStorage.getItem("pending_checkout") === "1";
    const user = getUser();

    if (pending && user && items.length > 0 && !busy) {
      localStorage.removeItem("pending_checkout");
      startCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  return (
    <main style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <TopBar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Cart</h1>
          <Link href="/" style={{ textDecoration: "none" }}>
            ← Shop
          </Link>
        </header>

        {items.length === 0 ? (
          <p style={{ marginTop: 16 }}>Your cart is empty.</p>
        ) : (
          <>
            <div style={{ marginTop: 16 }}>
              {items.map((it) => (
                <div
                  key={it.package_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    padding: "10px 0",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900 }}>{it.name}</div>
                    <div style={{ opacity: 0.8 }}>Qty: {it.quantity}</div>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 800 }}>
                      {(it.price * it.quantity).toFixed(2)}
                    </div>
                    <button
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        removeFromCart(it.package_id);
                        setItems(getCart());
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, fontWeight: 900 }}>
              Total: {total.toFixed(2)}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  cursor: busy ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  opacity: busy ? 0.7 : 1,
                  background: "white",
                }}
                onClick={startCheckout}
                disabled={busy}
              >
                {busy ? "Starting checkout…" : "Checkout"}
              </button>

              <button
                style={{
                  padding: "10px 14px",
                  border: "1px solid #ddd",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: "white",
                }}
                onClick={() => {
                  clearCart();
                  setItems([]);
                }}
                disabled={busy}
              >
                Clear cart
              </button>
            </div>

            {error && (
              <p style={{ color: "crimson", marginTop: 12, whiteSpace: "pre-wrap" }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}