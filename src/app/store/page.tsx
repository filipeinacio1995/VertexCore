"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";
import ScriptCard, { Script } from "@/components/ScriptCard";
import { Button } from "@/components/ui/button";

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

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setErr(null);
        setLoading(true);

        // Tebex: include packages
        const res = await tebexGet(`/accounts/${TEBEX_TOKEN}/categories?includePackages=1`);
        const data = res?.data ?? res;

        const formatted: Script[] = (Array.isArray(data) ? data : []).flatMap((cat: any) => {
          const pkgs = getPackagesArray(cat);

          return pkgs.map((pkg: any) => {
            const desc = stripHtml(String(pkg?.description || ""));
            return {
              id: Number(pkg?.id),
              name: pkg?.name || "Unnamed",
              description: desc.slice(0, 110),
              longDescription: String(pkg?.description || ""),
              image: pkg?.image || "https://placehold.co/600x400",
              price: getPrice(pkg),
              category: cat?.name || "General",
            };
          });
        });

        setScripts(formatted);

        const uniqueCats = ["All", ...Array.from(new Set(formatted.map((s) => s.category)))];
        setCategories(uniqueCats);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Error loading store.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredScripts = useMemo(() => {
    return activeCategory === "All"
      ? scripts
      : scripts.filter((s) => s.category === activeCategory);
  }, [scripts, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase italic">
                OUR <span className="text-primary">Products</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto uppercase text-[10px] tracking-[0.2em] font-bold">
                Our most popular resources, trusted by hundreds of servers.
              </p>
            </motion.div>
          </header>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <Button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? "default" : "secondary"}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-bold tracking-tighter uppercase transition-all border",
                  activeCategory === cat
                    ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                    : "bg-secondary/50 border-white/5 hover:border-primary/50 text-muted-foreground"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>

          {err && (
            <div className="text-center pb-6 text-red-400">
              {err}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-display text-sm tracking-widest text-muted-foreground">
                FETCHING FROM TEBEX...
              </p>
            </div>
          ) : (
            <>
              {filteredScripts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredScripts.map((script, index) => (
                    <ScriptCard key={script.id} script={script} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  No products found in this category.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}