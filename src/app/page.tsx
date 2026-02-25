"use client";

import { useEffect, useMemo, useState } from "react";
import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";
import { addToCart } from "@/lib/cart";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import WhyChooseUs from "@/components/WhyChooseUs";
import StatsSection from "@/components/StatsSection";
import FeaturedScripts from "@/components/FeaturedScripts";


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
      <main className="pt-16"/>
      <HeroSection/>
      <main className="pt-16"/>
      <FeaturedScripts/>
      <main className="pt-16"/>
      <StatsSection />
      <main className="pt-16"/>
      <WhyChooseUs />
      <main className="pt-16"/>
    </main>
  );
}