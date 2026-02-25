"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Button } from "@/components/ui/button";

import Logo from "@/app/assets/core.png";
import City from "@/app/assets/city.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background City (fill) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={City}
          alt="Background City"
          fill
          priority
          className="object-cover opacity-20 blur-sm"
        />
      </div>

      {/* Background Logo */}
      <Image
        src={Logo}
        alt="Background Logo"
        priority
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] md:w-[760px] h-auto opacity-20 blur-sm pointer-events-none z-0"
      />

      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background z-[1]" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow z-[1]" />
        <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow z-[1]"
        style={{ animationDelay: "1.5s" }}
        />

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Team of Developers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-6"
          >
            <span className="text-foreground">VERTEX</span>
            <span className="text-gradient">CORE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            High-fidelity scripts, fully optimized with dedicated support. We offer complete solutions:
            from exclusive MLOs and 3D vehicle designs to realistic handlings. Peak performance for your server.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-display text-sm tracking-wider backdrop-blur-md hover:bg-primary/10 transition-all duration-300 group"
            >
              <a
                href="https://discord.gg/k4ZQ952HYb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <SiDiscord className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                Join Our Discord
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;