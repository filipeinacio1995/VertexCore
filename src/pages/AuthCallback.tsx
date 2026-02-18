import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getTebexUser } from "@/lib/tebex";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      const token = searchParams.get("token");
      if (!token) {
        navigate("/");
        return;
      }

      localStorage.setItem("tebex_token", token);

      const userData = await getTebexUser(token);
      if (!userData) {
        navigate("/");
        return;
      }

      setUser(userData);

      // If user came here from checkout flow, finalize basket -> redirect to payment
      const pending = localStorage.getItem("tebex_pending_checkout");
      const basketIdent = localStorage.getItem("tebex_basketIdent");
      const cartRaw = localStorage.getItem("tebex_cart");

      if (pending === "1" && basketIdent && cartRaw) {
        const cart = JSON.parse(cartRaw);

        const resp = await fetch("/api/tebex/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ basketIdent, cart, sessionToken: token }),
        });

        const data = await resp.json();
        if (resp.ok && data.checkoutUrl) {
          localStorage.setItem("tebex_pending_checkout", "0");
          window.location.href = data.checkoutUrl;
          return;
        }

        console.error("Finalize failed:", data);
        localStorage.setItem("tebex_pending_checkout", "0");
      }

      navigate("/store");
    };

    initAuth();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
      <div className="w-12 h-12 border-4 border-[#00D0FF] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground animate-pulse tracking-widest text-xs uppercase">
        Syncing Vertex Account...
      </p>
    </div>
  );
}
