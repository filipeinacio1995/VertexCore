import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScriptCard from "@/components/ScriptCard";
import { cn } from "@/lib/utils";
import { getTebexCatalog } from "@/lib/tebex";
import type { Script } from "@/data/scripts";
import { Button } from "@/components/ui/button";

const Store = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTebexCatalog();
        
        const formattedScripts: Script[] = data.flatMap((cat: any) => 
          (cat.packages || []).map((pkg: any) => {
            const rawPrice = 
              pkg.amount ??           
              pkg.price ??            
              pkg.base_price ??       
              pkg.total_price ??      
              0;

            return {
              id: pkg.id,
              name: pkg.name || "Sem Nome",
              description: (pkg.description || "").replace(/<[^>]*>/g, '').slice(0, 100), 
              longDescription: pkg.description || "",
              image: pkg.image || "https://placehold.co/600x400",
              price: Number(rawPrice), 
              category: cat.name || "Geral"
            };
          })
        );

        setScripts(formattedScripts);
        // Create unique category list
        const uniqueCats = ["All", ...new Set(formattedScripts.map(s => s.category))];
        setCategories(uniqueCats);
      } catch (error) {
        console.error("Error loading store:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredScripts = activeCategory === "All"
    ? scripts
    : scripts.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                OUR <span className="text-primary text-gradient uppercase">Products</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto uppercase tracking-widest text-xs">
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
                )}>
                {cat} 
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-display text-sm tracking-widest text-muted-foreground">FETCHING FROM TEBEX...</p>
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
                  Nenhum produto encontrado nesta categoria.
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Store;