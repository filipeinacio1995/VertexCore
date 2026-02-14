import { motion } from "framer-motion";
import { ExternalLink, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import type { Script } from "@/data/scripts";

interface ScriptCardProps {
  script: Script;
  index: number;
}

const ScriptCard = ({ script, index }: ScriptCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: script.id,
      name: script.name,
      price: script.price,
      image: script.image
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group glass rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 border border-white/5 bg-card/50 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden bg-black/20">
        <img
          src={script.image}
          alt={script.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image"; }}
        />
        <Badge className="absolute top-3 left-3 bg-primary/90 text-white border-none shadow-lg">
          {script.category}
        </Badge>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{script.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {script.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-primary">
              €{(Number(script.price) || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="h-9 px-3">
              <Link to={`/script/${script.id}`}>
                <Eye className="w-4 h-4 mr-1.5" /> View
              </Link>
            </Button>
            <Button onClick={handleAddToCart} size="sm" variant="secondary" className="h-9 px-3 font-bold">
              <ShoppingCart className="w-5 h-5 mr-3" /> Buy
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScriptCard;