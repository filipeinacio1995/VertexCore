"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingCart, Trash2, CreditCard, ShoppingBag, Loader2 } from "lucide-react";

import { CartItem, clearCart, getCart, removeFromCart } from "@/lib/cart";
import { SITE_URL, TEBEX_TOKEN, tebexGet, tebexPost } from "@/lib/tebex";
import { getUser } from "@/lib/user";
import { Button } from "@/components/ui/button";

function basketHasUser(basketResp: any) {
  const b = basketResp?.data ?? basketResp;
  return Boolean(b?.username || b?.customer?.username || b?.user?.username || b?.auth?.username);
}

export default function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Load cart whenever drawer opens
  useEffect(() => {
    if (isOpen) setItems(getCart());
  }, [isOpen]);

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
      onClose();
      // ✅ match old logic style; you can change returnTo to "/" if you want
      window.location.assign(`/login?returnTo=${encodeURIComponent("/")}`);
      return;
    }

    // If logged in, ensure pending flag is cleared (avoid loops)
    localStorage.removeItem("pending_checkout");

    setBusy(true);
    try {
      // 1) Create basket
      const basket = await tebexPost(`/accounts/${TEBEX_TOKEN}/baskets`, {
        complete_url: `${SITE_URL}/checkout/return`,
        cancel_url: `${SITE_URL}/`, // drawer-first
        complete_auto_redirect: true,
      });

      const ident = basket?.data?.ident ?? basket?.ident;
      if (!ident) throw new Error("No basket ident returned by Tebex.");

      // 2) Check if basket already authorized
      const basketResp = await tebexGet(`/accounts/${TEBEX_TOKEN}/baskets/${ident}`);

      if (basketHasUser(basketResp)) {
        // Authorized → add packages now → go to checkout
        for (const it of items) {
          await tebexPost(`/baskets/${ident}/packages`, {
            package_id: String(it.package_id),
            quantity: it.quantity,
          });
        }

        const checkoutUrl = basketResp?.data?.links?.checkout ?? basketResp?.links?.checkout;
        if (!checkoutUrl) throw new Error("Checkout URL not found.");

        clearCart();
        setItems([]);
        onClose();
        window.location.assign(checkoutUrl);
        return;
      }

      // Not authorized → redirect to auth, then /checkout/return will add packages + redirect
      // ✅ This matches your WORKING CartPage logic
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

      onClose();
      window.location.assign((cfx?.url ?? providers[0].url) as string);
    } catch (e: any) {
      setError(e?.message ?? "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  // ✅ Auto-continue checkout after login (same as CartPage)
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => (busy ? null : onClose())}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-4 top-4 bottom-4 w-full max-w-md bg-[#0d0d0d]/95 border border-white/10 z-[101] flex flex-col shadow-[0_0_50px_-12px_rgba(0,208,255,0.2)] rounded-[2rem] overflow-hidden"
          >
            <div className="p-8 pb-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ShoppingBag className="text-primary w-6 h-6" />
                  </div>
                  My <span className="text-primary">Stash</span>
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 ml-11">
                  {items.length} {items.length === 1 ? "Item" : "Items"} Selected
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={busy}
                className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all p-3 rounded-2xl border border-white/5 hover:rotate-90 disabled:opacity-50 disabled:hover:rotate-0"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <ShoppingCart size={64} strokeWidth={1} />
                  <p className="text-sm font-medium uppercase tracking-widest italic">
                    Your stash is empty
                  </p>
                </div>
              ) : (
                items.map((it, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    key={it.package_id}
                    className="group flex gap-4 bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-[1.5rem] border border-white/5 transition-all duration-300"
                  >
                    <div className="relative">
                      {/* optional image support */}
                      {/* @ts-ignore */}
                      {it.image ? (
                        // @ts-ignore
                        <img
                          // @ts-ignore
                          src={it.image}
                          className="w-20 h-20 rounded-2xl object-cover border border-white/10"
                          alt={it.name}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-white/90 leading-tight mb-1">
                        {it.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-primary font-black text-lg">
                          €{Number(it.price).toFixed(2)}
                        </span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                          Qty {it.quantity}
                        </span>
                        <span className="text-[10px] bg-white/5 text-white/60 px-2 py-0.5 rounded-full font-bold uppercase">
                          Line €{(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (busy) return;
                        removeFromCart(it.package_id);
                        setItems(getCart());
                      }}
                      className="self-center p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-50"
                      disabled={busy}
                      aria-label="Remove"
                      title="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 pt-4 space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground px-1">
                    <span>Subtotal</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end px-1">
                    <span className="text-sm font-bold uppercase italic">Total Amount</span>
                    <span className="text-3xl font-black text-white italic tracking-tighter">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={startCheckout}
                  disabled={busy}
                  className="w-full h-16 text-lg font-black uppercase italic tracking-[0.1em] rounded-2xl bg-primary text-black hover:bg-white transition-all duration-500 group relative overflow-hidden shadow-[0_0_30px_-5px_#00D0FF] disabled:opacity-70"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-3">
                    {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                    {busy ? "Starting..." : "Secure Checkout"}
                  </span>
                </Button>

                <button
                  onClick={() => {
                    if (busy) return;
                    clearCart();
                    setItems([]);
                  }}
                  disabled={busy}
                  className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-black uppercase tracking-widest italic transition disabled:opacity-60"
                >
                  Clear cart
                </button>

                {error && (
                  <p className="text-sm text-red-400 whitespace-pre-wrap border border-red-500/20 bg-red-500/10 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest">
                  Payments secured by <span className="text-white/50">Tebex</span>
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}