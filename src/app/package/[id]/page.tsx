"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  Zap,
  Sparkles,
  Play,
  Globe,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScriptCard from "@/components/ScriptCard";

import { tebexGet, TEBEX_TOKEN } from "@/lib/tebex";
import { addToCart, getCart } from "@/lib/cart";

// ---------------- helpers ----------------
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

type Script = {
  id: number;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  price: number;
  category: string;
};

export default function ScriptDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [script, setScript] = useState<Script | null>(null);
  const [related, setRelated] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [ytThumbnail, setYtThumbnail] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [inCart, setInCart] = useState(false);

  // keep "inCart" synced
  useEffect(() => {
    if (!id) return;

    const sync = () => {
      const cart = getCart();
      setInCart(cart.some((c) => String(c.package_id) === String(id)));
    };

    sync();
    window.addEventListener("cart:changed", sync);
    return () => window.removeEventListener("cart:changed", sync);
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadScriptData() {
      try {
        setLoading(true);

        const res = await tebexGet(`/accounts/${TEBEX_TOKEN}/categories?includePackages=1`);
        const categories = res?.data ?? res;

        const allScripts: Script[] = (Array.isArray(categories) ? categories : []).flatMap((cat: any) => {
          const pkgs = getPackagesArray(cat);

          return pkgs.map((pkg: any) => {
            const desc = stripHtml(String(pkg?.description || "")).replace(/\s+/g, " ").trim();

            return {
              id: Number(pkg?.id),
              name: String(pkg?.name || "Unnamed"),
              description: desc.slice(0, 140),
              longDescription: String(pkg?.description || "No description available."),
              image: String(pkg?.image || "https://placehold.co/800x600?text=No+Image"),
              price: getPrice(pkg),
              category: String(cat?.name || "General"),
            };
          });
        });

        const found = allScripts.find((s) => String(s.id) === String(id));
        if (!found) {
          if (!cancelled) {
            setScript(null);
            setRelated([]);
            setImages([]);
            setVideoUrl(null);
            setYtThumbnail(null);
          }
          return;
        }

        // Extract <img src="..."> from longDescription
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const extractedImages: string[] = [];
        let imgMatch: RegExpExecArray | null;
        while ((imgMatch = imgRegex.exec(found.longDescription)) !== null) {
          extractedImages.push(imgMatch[1]);
        }

        // Extract YouTube
        const videoIdRegex =
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

        const videoMatch = found.longDescription.match(videoIdRegex);
        let videoThumb: string | null = null;

        if (videoMatch) {
          const videoId = videoMatch[1];
          setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
          videoThumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          setYtThumbnail(videoThumb);
        } else {
          setVideoUrl(null);
          setYtThumbnail(null);
        }

        // Clean longDescription: remove images + youtube links
        const cleanedLong = found.longDescription
          .replace(/<img[^>]*>/g, "")
          .replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<]*/g, "")
          .trim();

        const finalMediaList = [found.image];
        if (videoThumb) finalMediaList.push(videoThumb);
        finalMediaList.push(...extractedImages);

        const uniqueMedia = Array.from(new Set(finalMediaList)).filter(Boolean);

        const rel = allScripts
          .filter((s) => s.id !== found.id && s.category === found.category)
          .slice(0, 3);

        if (!cancelled) {
          setScript({ ...found, longDescription: cleanedLong });
          setImages(uniqueMedia);
          setCurrentImageIndex(0);
          setShowVideo(false);
          setRelated(rel);
        }
      } catch (e) {
        console.error("Failed to load script details:", e);
        if (!cancelled) {
          setScript(null);
          setRelated([]);
          setImages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadScriptData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const mainImage = useMemo(() => {
    if (!script) return "https://placehold.co/800x600?text=No+Image";
    return images[currentImageIndex] || script.image;
  }, [images, currentImageIndex, script]);

  if (loading) {
    return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="honeycomb scale-150">
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

  if (!script) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white/80 font-bold">Product not found</h1>
          <p className="text-muted-foreground mt-2">Go back to the store and try again.</p>
          <div className="mt-6">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-28 pb-20 relative z-10 selection:bg-primary/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-10 transition-all group"
          >
            <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Back to Store
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* LEFT: MEDIA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="lg:col-span-7 space-y-6 relative"
          >
            <div className="absolute -inset-10 bg-primary/25 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="relative z-10">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-black shadow-xl">
                {showVideo && videoUrl ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Product Video"
                  />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={String(currentImageIndex) + String(showVideo)}
                      src={mainImage}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="w-full h-full object-cover"
                      alt={script.name}
                    />
                  </AnimatePresence>
                )}
              </div>

              {/* thumbs */}
              <div className="relative flex items-center group/nav mt-6">
                <button
                  onClick={() => {
                    if (scrollRef.current) scrollRef.current.scrollLeft -= 250;
                  }}
                  className="absolute -left-5 z-20 p-2 bg-background border border-border rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity hover:text-primary shadow-lg"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth p-1 w-full">
                  {images.map((img, idx) => {
                    const isVideoThumb = ytThumbnail && img === ytThumbnail;
                    const isActive = isVideoThumb ? showVideo : !showVideo && currentImageIndex === idx;

                    return (
                      <motion.button
                        key={`${img}-${idx}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (isVideoThumb) {
                            setShowVideo(true);
                          } else {
                            setShowVideo(false);
                            setCurrentImageIndex(idx);
                          }
                        }}
                        className={[
                          "relative w-[126px] h-[86px] rounded-xl overflow-hidden shrink-0 transition-all duration-200 border",
                          isActive
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100 z-10 border-border"
                            : "opacity-50 hover:opacity-100 border-border",
                        ].join(" ")}
                        aria-label={isVideoThumb ? "Play video" : "View image"}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        {isVideoThumb && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Play className="w-7 h-7 text-primary fill-primary" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    if (scrollRef.current) scrollRef.current.scrollLeft += 250;
                  }}
                  className="absolute -right-5 z-20 p-2 bg-background border border-border rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity hover:text-primary shadow-lg"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: INFO */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 uppercase text-[10px] font-bold tracking-widest">
                {script.category}
              </Badge>

              <h1 className="text-5xl font-black uppercase tracking-tight leading-none italic">
                {script.name}
              </h1>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Performance</p>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" /> 0.00ms
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Security</p>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-primary" /> Escrow
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Support</p>
                  <p className="text-xs font-bold text-white flex items-center gap-2">
                    <Globe className="w-3 h-3 text-primary" /> Global
                  </p>
                </div>
              </div>
            </div>

            {/* price box */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-primary/20 rounded-[35px] blur opacity-20 transition duration-700 group-hover:opacity-40" />
              <div className="relative glass p-8 rounded-[32px] border border-border">
                <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mb-2">
                  Lifetime Access
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black text-foreground tracking-tighter">
                    €{script.price.toFixed(2)}
                  </span>
                </div>

                <motion.div whileHover={{ scale: inCart ? 1 : 1.02, y: inCart ? 0 : -2 }} whileTap={{ scale: inCart ? 1 : 0.98 }}>
                  <Button
                    disabled={inCart}
                    onClick={() => {
                      if (inCart) return;
                      addToCart({
                        package_id: script.id,
                        name: script.name,
                        price: Number(script.price),
                        image: script.image,
                      });

                      window.dispatchEvent(new Event("cart:open"));
                    }}
                    className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest glow-primary shadow-xl disabled:opacity-60"
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    {inCart ? "In cart" : "Add to Stash"}
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Information
              </h3>

              <div
                className="text-muted-foreground text-sm leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: script.longDescription }}
              />
            </div>
          </motion.div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mt-32"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-8 uppercase text-center">
              FEATURED <span className="text-primary">PRODUCTS</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((s, i) => (
                <ScriptCard key={s.id} script={s as any} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}