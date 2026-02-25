"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addToCart, getCart } from "@/lib/cart";

export type Script = {
  id: number;
  name: string;
  description: string;
  longDescription?: string;
  image: string;
  price: number;
  category: string;
};

export default function ScriptCard({
  script,
  index,
}: {
  script: Script;
  index: number;
}) {
  const [inCart, setInCart] = useState(false);

  // ✅ keep in sync with cart changes
  useEffect(() => {
    const sync = () => {
      const cart = getCart();
      setInCart(cart.some((c) => c.package_id === script.id));
    };

    sync();
    window.addEventListener("cart:changed", sync);
    return () => window.removeEventListener("cart:changed", sync);
  }, [script.id]);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart) return;

    addToCart(
      {
        package_id: script.id,
        name: script.name,
        price: Number(script.price),
        image: script.image,
      },
      1
    );

    // setInCart(true) is optional now (event will sync), but keeping it feels instant
    setInCart(true);
    window.dispatchEvent(new Event("cart:open"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="group glass rounded-xl overflow-hidden border border-white/5 bg-card/50 hover:border-primary/40 transition-colors duration-200 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={script.image}
          alt={script.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/800x500?text=No+Image";
          }}
        />

        <Badge className="absolute top-3 left-3 bg-primary/20 text-primary border border-primary/30 backdrop-blur-sm">
          {script.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-[15px] font-bold text-foreground mb-1.5 line-clamp-1">
          {script.name}
        </h3>

        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground/90 line-clamp-2 flex-grow">
          {script.description}
        </p>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
          <span className="text-2xl font-black tracking-tight text-white/90">
            €{(Number(script.price) || 0).toFixed(2)}
          </span>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 px-3 border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
            >
              <Link href={`/package/${script.id}`}>
                <Eye className="w-4 h-4 mr-1.5" />
                View
              </Link>
            </Button>

            <button
              onClick={handleBuy}
              disabled={inCart}
              className={[
                "h-9 px-4 rounded-xl font-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                "transition-colors",
                inCart
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-white text-black hover:bg-primary cursor-pointer",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                {inCart ? "In cart" : "Buy"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}