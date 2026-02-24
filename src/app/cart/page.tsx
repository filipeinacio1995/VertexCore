"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartItem, clearCart, getCart, removeFromCart } from "@/lib/cart";
import { SITE_URL, TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [authProviders, setAuthProviders] = useState<{ name: string; url: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [basketIdent, setBasketIdent] = useState<string | null>(null);

  useEffect(() => setItems(getCart()), []);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  async function startCheckout() {
    setError(null);
    setAuthProviders(null);
    setBasketIdent(null);

    if (items.length === 0) {
      setError("Cart is empty.");
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
      setBasketIdent(ident);

      // 2) IMPORTANT: Login first (auth) BEFORE adding packages
      // We’ll add packages on the return page after the user logs in.
      const returnUrl = `${SITE_URL}/checkout/return?basket=${encodeURIComponent(ident)}`;

      const auth = await tebexGet(
        `/accounts/${TEBEX_TOKEN}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(returnUrl)}`
      );

      const providers = auth?.data ?? auth;
      if (!Array.isArray(providers) || providers.length === 0) {
        throw new Error("No auth providers returned. Check your Tebex store auth settings.");
      }

      setAuthProviders(providers);
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
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
                cursor: "pointer",
                fontWeight: 900,
                opacity: busy ? 0.7 : 1,
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

          {basketIdent && (
            <div style={{ marginTop: 10, opacity: 0.75 }}>
              Basket: {basketIdent}
            </div>
          )}

          {error && (
            <p style={{ color: "crimson", marginTop: 12, whiteSpace: "pre-wrap" }}>
              {error}
            </p>
          )}

          {authProviders && (
            <section style={{ marginTop: 18 }}>
              <h2 style={{ marginBottom: 6 }}>Login first</h2>
              <p style={{ marginTop: 0, opacity: 0.85 }}>
                Tebex requires login before adding packages. Choose a provider:
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {authProviders.map((p) => (
                  <a
                    key={p.url}
                    href={p.url}
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px 12px",
                      borderRadius: 12,
                      textDecoration: "none",
                      fontWeight: 800,
                    }}
                  >
                    Continue with {p.name}
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}