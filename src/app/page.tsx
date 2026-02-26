"use client";

import { useEffect, useMemo, useState } from "react";
import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";

import HeroSection from "@/components/HeroSection";
import FeaturedScripts from "@/components/FeaturedScripts";
import StatsSection from "@/components/StatsSection";
import WhyChooseUs from "@/components/WhyChooseUs";

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
        const res = await tebexGet(
          `/accounts/${TEBEX_TOKEN}/categories?includePackages=1`
        );
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
    <main className="pt-16">
      <HeroSection />

      <section className="mt-24">
        <FeaturedScripts />
      </section>

      <section className="mt-24">
        <StatsSection premiumScriptsCount={packageCount} />
      </section>

      <section className="mt-24">
        <WhyChooseUs />
      </section>

      {err && (
        <p className="text-center text-red-500 mt-10">
          {err}
        </p>
      )}
    </main>
  );
}