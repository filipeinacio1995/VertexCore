import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Zap, Sparkles, Play, Globe,ShoppingCart} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTebexCatalog } from "@/lib/tebex";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "@/components/CartDrawer";
import type { Script } from "@/data/scripts";
import ScriptCard from "@/components/ScriptCard";

const ScriptDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Script[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [ytThumbnail, setYtThumbnail] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  
  const { addItem } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadScriptData() {
      try {
        setLoading(true);
        const data = await getTebexCatalog();
        
        const allScripts: Script[] = data?.flatMap((cat: any) =>
          (cat.packages || []).map((pkg: any) => {
            const rawPrice = pkg.amount ?? pkg.price ?? pkg.base_price ?? pkg.total_price ?? 0;
            return {
              id: pkg.id,
              name: pkg.name || "Sem Nome",
              description: (pkg.description || "").replace(/<[^>]*>/g, '').slice(0, 100),
              longDescription: pkg.description || "Sem descrição disponível.",
              image: pkg.image || "https://placehold.co/800x600?text=No+Image",
              price: Number(rawPrice),
              category: cat.name || "Geral",
            };
          })
        ) || [];

        const found = allScripts.find((s) => s.id.toString() === id);
        
        if (found) {
          const imgRegex = /<img[^>]+src="([^">]+)"/g;
          const videoIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
          
          const extractedImages: string[] = [];
          let imgMatch;
          while ((imgMatch = imgRegex.exec(found.longDescription)) !== null) {
            extractedImages.push(imgMatch[1]);
          }

          const videoMatch = found.longDescription.match(videoIdRegex);
          let videoThumb: string | null = null;

          if (videoMatch) {
            const videoId = videoMatch[1];
            setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
            videoThumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            setYtThumbnail(videoThumb);
          }

          setScript({ ...found, longDescription: found.longDescription.replace(/<img[^>]*>/g, "").replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<]*/g, "").trim() });

          const finalMediaList = [found.image];
          if (videoThumb) finalMediaList.push(videoThumb);
          finalMediaList.push(...extractedImages);
          setImages(Array.from(new Set(finalMediaList)));

          setRelated(allScripts.filter((s) => s.id !== found.id && s.category === found.category).slice(0, 3));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadScriptData();
    setShowVideo(false);
    setCurrentImageIndex(0);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (!script) return <div className="min-h-screen bg-background text-center pt-32"><h1>Script not found</h1></div>;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      <main className="pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          {/* FADE IN TOP LINK */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/store" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-10 transition-all group">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Store
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* LEFT COLUMN: MEDIA SLIDE IN */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-7 space-y-6 relative"
            >
              <div className="absolute -inset-10 bg-primary/25 blur-[120px] rounded-full pointer-events-none z-0" />
              <div className="relative z-10">
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-black shadow-xl">
                  {showVideo && videoUrl ? (
                    <iframe src={videoUrl} className="w-full h-full border-0" allow="autoplay; encrypted-media" allowFullScreen />
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  )}
                </div>

                <div className="relative flex items-center group/nav mt-6">
                  <button onClick={() => { if (scrollRef.current) scrollRef.current.scrollLeft -= 250; }} className="absolute -left-5 z-20 p-2 bg-background border border-border rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity hover:text-primary shadow-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth p-1 w-full">
                    {images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { if (img === ytThumbnail) { setShowVideo(true); } else { setShowVideo(false); setCurrentImageIndex(idx); } }}
                        className={`relative w-[126px] h-[86px] rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                          (img === ytThumbnail ? showVideo : (!showVideo && currentImageIndex === idx)) 
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100 z-10" 
                          : "opacity-40 hover:opacity-100 border border-border"
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                        {img === ytThumbnail && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-7 h-7 text-primary fill-primary" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <button onClick={() => { if (scrollRef.current) scrollRef.current.scrollLeft += 250; }} className="absolute -right-5 z-20 p-2 bg-background border border-border rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity hover:text-primary shadow-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: INFO SLIDE IN */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 uppercase text-[10px] font-bold tracking-widest">{script.category}</Badge>
                <h1 className="text-5xl font-black uppercase tracking-tight leading-none italic">{script.name}</h1>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                   <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Performance</p>
                    <p className="text-xs font-bold text-white flex items-center gap-2"><Zap className="w-3 h-3 text-primary" /> 0.00ms</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Security</p>
                    <p className="text-xs font-bold text-white flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-primary" /> Escrow</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Support</p>
                    <p className="text-xs font-bold text-white flex items-center gap-2"><Globe className="w-3 h-3 text-primary" /> Global</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-primary/20 rounded-[35px] blur opacity-20 transition duration-1000 group-hover:opacity-40" />
                <div className="relative glass p-8 rounded-[32px] border border-border">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-2">Lifetime Access</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black text-foreground tracking-tighter">€{script.price.toFixed(2)}</span>
                  </div>
                  
                  {/* BUTTON MOTION */}
                  <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => { addItem({ id: script.id, name: script.name, price: script.price, image: script.image }); setIsCartOpen(true); }} 
                      className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest glow-primary shadow-xl"
                    >
                      <ShoppingCart className="w-5 h-5 mr-3" /> Add to Stash
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Information</h3>
                <div 
                  className="text-muted-foreground text-sm leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: script.longDescription }}
                />
              </div>
            </motion.div>
          </div>
          
          {/* RELATED SECTION MOTION */}
          {related.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-32"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8 uppercase text-center">
                FEATURED <span className="text-primary">PRODUCTS</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map((s, i) => (
                  <ScriptCard key={s.id} script={s} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default ScriptDetails;