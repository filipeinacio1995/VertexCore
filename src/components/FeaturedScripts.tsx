import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTebexCatalog } from "@/lib/tebex";
import type { Script } from "@/data/scripts";
import ScriptCard from "./ScriptCard";

const FeaturedScripts = () => {
  const [featured, setFeatured] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await getTebexCatalog();
        
        // APPLYING THE PRICE HUNTER FIX HERE:
        const allScripts: Script[] = data.flatMap((cat: any) => 
          (cat.packages || []).map((pkg: any) => {
            // This ensures we find the 15.00 regardless of where Tebex hides it
            const rawPrice = pkg.amount ?? pkg.price ?? pkg.base_price ?? pkg.total_price ?? 0;

            return {
              id: pkg.id,
              name: pkg.name || "Sem Nome",
              description: (pkg.description || "").replace(/<[^>]*>/g, '').slice(0, 100),
              longDescription: pkg.description || "",
              image: pkg.image || "https://placehold.co/600x400",
              price: Number(rawPrice), // Force it to be a number
              category: cat.name || "Geral"
            };
          })
        );

        // Take the first 4 for the homepage
        setFeatured(allScripts.slice(0, 4));
      } catch (error) {
        console.error("Error loading featured scripts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
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
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            FEATURED  <span className="text-primary text-gradient">PRODUCTS</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Our most popular resources, trusted by hundreds of servers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((script, index) => (
            <ScriptCard key={script.id} script={script} index={index} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="font-display text-xs tracking-wider">
            <Link to="/store">
              CHECK ALL PRODUCTS
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedScripts;