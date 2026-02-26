"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Stat = { label: string; value: number; suffix: string };

const AnimatedCounter = ({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          let start = 0;
          const duration = 1200; // a bit snappier
          const step = target / (duration / 16);

          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} className="font-display text-4xl md:text-5xl font-black text-gradient">
      {count}
      {suffix}
    </div>
  );
};

export default function StatsSection({
  premiumScriptsCount,
}: {
  premiumScriptsCount: number;
}) {
  const stats: Stat[] = useMemo(
    () => [
      { label: "Happy Clients", value: 30, suffix: "+" },
      { label: "Premium Scripts", value: premiumScriptsCount, suffix: "+" },
      { label: "Suport 24/7", value: 100, suffix: "%" },
      { label: "Updates", value: 12, suffix: "/m" },
    ],
    [premiumScriptsCount]
  );

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-gaming" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}