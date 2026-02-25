import { motion } from "framer-motion";
import { Shield, Zap, RefreshCw, Headphones } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Optimized Code",
    description: "Lightweight scripts optimized for maximum performance on your server, without lag or excessive resource consumption.",
  },
  {
    icon: Shield,
    title: "Safe & Tested",
    description: "All code is extensively tested and secure, protecting your server against vulnerabilities.",
  },
  {
    icon: RefreshCw,
    title: "Free Updates",
    description: "Receive continuous updates and improvements at no additional cost, keeping your scripts always up to date.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team available on Discord to help with any questions or issues.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 uppercase italic">
            WHY <span className="text-primary">CHOOSE US</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto uppercase text-[10px] tracking-[0.2em] font-bold">
            We deliver quality, performance, and support in every asset we create.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="glass rounded-xl p-6 text-center group hover:border-primary/40 transition-all duration-300 border border-white/5 bg-card/50"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:glow-primary transition-all duration-300">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-sm font-black uppercase tracking-widest mb-2 text-foreground italic">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;