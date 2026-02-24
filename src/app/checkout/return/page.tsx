"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";
import { getCart, clearCart } from "@/lib/cart";

function ReturnInner() {
  const sp = useSearchParams();
  const [msg, setMsg] = useState("Finalizing checkout…");

  useEffect(() => {
    (async () => {
      const basket = sp.get("basket");

      if (!basket) {
        setMsg("Missing basket ident. Try checkout again.");
        return;
      }

      const cart = getCart();
      if (cart.length === 0) {
        setMsg("Cart is empty. Go back and add items again.");
        return;
      }

      try {
        setMsg("Adding items to your Tebex basket…");

        // After login, add packages
        for (const it of cart) {
          await tebexPost(`/baskets/${basket}/packages`, {
            package_id: String(it.package_id),
            quantity: it.quantity,
          });
        }

        setMsg("Redirecting to payment…");

        // Fetch basket checkout link
        const basketResp = await tebexGet(`/accounts/${TEBEX_TOKEN}/baskets/${basket}`);
        const checkoutUrl =
          basketResp?.data?.links?.checkout ?? basketResp?.links?.checkout;

        if (!checkoutUrl) {
          setMsg("Checkout URL not found on basket.");
          return;
        }

        clearCart();
        window.location.href = checkoutUrl;
      } catch (e: any) {
        setMsg(e?.message ?? "Failed to continue to checkout.");
      }
    })();
  }, [sp]);

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Checkout</h1>
      <p>{msg}</p>
    </main>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
          <h1>Checkout</h1>
          <p>Loading…</p>
        </main>
      }
    >
      <ReturnInner />
    </Suspense>
  );
}