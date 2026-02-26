"use client";
// app/checkout/return/page.tsx
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";
import { getCart, clearCart } from "@/lib/cart";
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
  const [msg, setMsg] = useState("Finalizing checkout…");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

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

      const lockKey = `tebex_basket_items_added_${basket}`;
      const alreadyAdded = localStorage.getItem(lockKey) === "1";

      try {
        if (!alreadyAdded) {
          setMsg("Adding items to your Tebex basket…");

          for (const it of cart) {
            await tebexPost(`/baskets/${basket}/packages`, {
              package_id: String(it.package_id),
              quantity: it.quantity,
            });
          }

          localStorage.setItem(lockKey, "1");
        } else {
          setMsg("Items already added. Redirecting to payment…");
        }

        const basketResp = await tebexGet(`/accounts/${TEBEX_TOKEN}/baskets/${basket}`);
        extractAndSaveUser(basketResp);

        const checkoutUrl = basketResp?.data?.links?.checkout ?? basketResp?.links?.checkout;
        if (!checkoutUrl) {
          setMsg("Checkout URL not found on basket.");
          return;
        }

        clearCart();
        localStorage.removeItem("pending_checkout"); // ✅ important
        window.location.assign(checkoutUrl);
      } catch (e: any) {
        setMsg(e?.message ?? "Failed to continue to checkout.");
      }
    })();
  }, [sp]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="honeycomb scale-150">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </main>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="honeycomb scale-150">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </main>
      }
    >
      <Inner />
    </Suspense>
  );
}