"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import ScriptCard from "@/components/ScriptCard";
import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";

export type Script = {
  id: number;
  name: string;
  description: string;
  longDescription?: string;
  image: string;
  price: number;
  category: string;
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");

const getPackagesArray = (cat: any): any[] => {
  if (Array.isArray(cat?.packages)) return cat.packages;
  if (Array.isArray(cat?.packages?.data)) return cat.packages.data;
  if (Array.isArray(cat?.packages?.items)) return cat.packages.items;
  return [];
};

const getPrice = (pkg: any): number => {
  const raw =
    pkg?.price ??
    pkg?.amount ??
    pkg?.total_price ??
    pkg?.base_price ??
    pkg?.price?.amount ??
    0;

  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export default function FeaturedScripts() {
  const [featured, setFeatured] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      try {
        setLoading(true);

        const res = await tebexGet(`/accounts/${TEBEX_TOKEN}/categories?includePackages=1`);
        const categories = res?.data ?? res;

        const allScripts: Script[] = (Array.isArray(categories) ? categories : []).flatMap((cat: any) => {
          const pkgs = getPackagesArray(cat);

          return pkgs.map((pkg: any) => {
            const desc = stripHtml(String(pkg?.description || ""))
              .replace(/\s+/g, " ")
              .trim();

            return {
              id: Number(pkg?.id),
              name: String(pkg?.name || "Unnamed"),
              description: desc.slice(0, 100),
              longDescription: String(pkg?.description || ""),
              image: String(pkg?.image || "https://placehold.co/600x400?text=No+Image"),
              price: getPrice(pkg),
              category: String(cat?.name || "General"),
            };
          });
        });

        if (!cancelled) {
          setFeatured(allScripts.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading featured scripts:", error);
        if (!cancelled) setFeatured([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="honeycomb">
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

  if (featured.length === 0) return null;

  return (
    <section className="pt-2 pb-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase italic">
            FEATURED <span className="text-primary">PRODUCTS</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto uppercase text-[10px] tracking-[0.2em] font-bold">
            Our most popular resources, trusted by our clients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((script, index) => (
            <ScriptCard key={script.id} script={script as any} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" size="lg" className="font-display text-xs tracking-wider">
            <Link href="/store">
              CHECK ALL PRODUCTS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}