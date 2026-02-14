import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Trash2, CreditCard, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, getTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Soft Glass Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />
          
          {/* Elevated Side Panel */}
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-4 top-4 bottom-4 w-full max-w-md bg-[#0d0d0d]/95 border border-white/10 z-[101] flex flex-col shadow-[0_0_50px_-12px_rgba(0,208,255,0.2)] rounded-[2rem] overflow-hidden"
          >
            {/* Header with a Gradient Glow */}
            <div className="p-8 pb-6 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-white">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <ShoppingBag className="text-primary w-6 h-6" />
                  </div>
                  My <span className="text-primary">Stash</span>
                </h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1 ml-11">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'} Selected
                </p>
              </div>
              <button 
                onClick={onClose} 
                className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all p-3 rounded-2xl border border-white/5 hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <ShoppingCart size={64} strokeWidth={1} />
                  <p className="text-sm font-medium uppercase tracking-widest italic">Your stash is empty</p>
                </div>
              ) : (
                items.map((item, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={item.id} 
                    className="group flex gap-4 bg-white/[0.03] hover:bg-white/[0.06] p-4 rounded-[1.5rem] border border-white/5 transition-all duration-300"
                  >
                    <div className="relative">
                       <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                       <div className="absolute inset-0 bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-sm text-white/90 leading-tight mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-primary font-black text-lg">€{item.price.toFixed(2)}</span>
                         <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Digital</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="self-center p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-8 pt-4 space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground px-1">
                        <span>Subtotal</span>
                        <span>€{getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end px-1">
                        <span className="text-sm font-bold uppercase italic">Total Amount</span>
                        <span className="text-3xl font-black text-white italic tracking-tighter">
                            €{getTotal().toFixed(2)}
                        </span>
                    </div>
                </div>

                <Button 
                  className="w-full h-16 text-lg font-black uppercase italic tracking-[0.1em] rounded-2xl bg-primary text-black hover:bg-white transition-all duration-500 group relative overflow-hidden shadow-[0_0_30px_-5px_#00D0FF]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center justify-center gap-3">
                    <CreditCard className="w-6 h-6" />
                    Secure Checkout
                  </span>
                </Button>
                
                <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest">
                  Payments secured by <span className="text-white/50">Tebex</span>
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}