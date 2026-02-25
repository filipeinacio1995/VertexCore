"use client";

import { useEffect, useMemo, useState } from "react";
import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";
import { addToCart } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import WhyChooseUs from "@/components/WhyChooseUs";
import StatsSection from "@/components/StatsSection";


type TebexPackage = {
  id: number;
  name: string;
  price: number;
};

type TebexCategory = {
  id: number;
  name: string;
  packages?: TebexPackage[];
};

export default function HomePage() {
  const [cats, setCats] = useState<TebexCategory[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await tebexGet(`/accounts/${TEBEX_TOKEN}/categories?includePackages=1`);
        const categories = res?.data ?? res;
        setCats(Array.isArray(categories) ? categories : []);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load listings");
      }
    })();
  }, []);

  const packageCount = useMemo(
    () => cats.reduce((sum, c) => sum + (c.packages?.length ?? 0), 0),
    [cats]
  );

  return (
    <main style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" }}>
      <Navbar />
      <main className="pt-16">
      <HeroSection/>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Shop</h1>
        <div style={{ opacity: 0.75 }}>
          {cats.length ? `${cats.length} categories • ${packageCount} packages` : "Loading…"}
        </div>
        {err && <p style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{err}</p>}
        {cats.map((cat) => (
          <section key={cat.id} style={{ marginTop: 28 }}>
            <h2 style={{ marginBottom: 12 }}>{cat.name}</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}
            >
              {(cat.packages ?? []).map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #e7e7e7",
                    borderRadius: 14,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    background: "white",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ opacity: 0.85 }}>{Number(p.price).toFixed(2)}</div>

                  <button
                    style={{
                      marginTop: "auto",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      cursor: "pointer",
                      fontWeight: 900,
                      background: "white",
                    }}
                    onClick={() =>
                      addToCart({ package_id: p.id, name: p.name, price: Number(p.price) }, 1)
                    }
                  >
                    Add to cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      </main>
    <StatsSection />
    <WhyChooseUs />
    <Footer />
    </main>
  );
}