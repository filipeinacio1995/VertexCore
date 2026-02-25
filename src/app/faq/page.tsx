//app/faq/page.tsx

"use client";
import { motion } from "framer-motion";
import { MessageCircle, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {Accordion,AccordionContent,AccordionItem,AccordionTrigger,} from "@/components/ui/accordion";
import { SiDiscord } from "react-icons/si";

const faqItems = [
  {
    question: "How does the script purchase work?",
    answer:
      "All purchases are processed through our Tebex store. By clicking 'Buy', you will be redirected to the product page on Tebex where you can securely complete your payment using various payment methods.",
  },
  {
    question: "How do I install the scripts after purchase?",
    answer:
      "After purchase, you will receive access to the script download via Tebex. Each script includes detailed installation documentation. If you have any questions, our support team is available on Discord to help.",
  },
  {
    question: "Are the scripts compatible with ESX and QBCore?",
    answer:
      "Yes, most of our scripts are compatible with both frameworks. Check the compatibility section on each script's page for specific details. We use ox_lib to maximize compatibility.",
  },
  {
    question: "Are updates free?",
    answer:
      "Yes! All future script updates are included with your purchase. When we release improvements, bug fixes, or new features, you will have free access to all versions.",
  },
  {
    question: "Can I request a refund?",
    answer:
      "We offer refunds within 48 hours of purchase, provided the script has not been downloaded. To request a refund, please contact us via Discord.",
  },
  {
    question: "Do you offer technical support?",
    answer:
      "Yes, we offer technical support through our Discord server. Our team is available to assist with installation, configuration, and troubleshooting. We typically respond within 24 hours.",
  },
  {
    question: "Can I use the same script on multiple servers?",
    answer:
      "Each license is valid for one server. If you wish to use the script on multiple servers, you will need to purchase additional licenses. Contact us for special pricing on multiple licenses.",
  },
  {
    question: "Do the scripts cause server lag?",
    answer:
      "No. All our scripts are optimized for maximum performance. We use efficient coding practices and test extensively to ensure 0.00ms impact when idle. Each script includes resmon metrics.",
  },
];

export default function StorePage() {
  return (
    <div className="min-h-screen bg-background">
        <main className="pt-16">
          <section className="py-24">
            <div className="container mx-auto px-4 max-w-3xl">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4">
                  FREQUENTLY ASKED <span className="text-gradient">QUESTIONS</span>
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Find answers to the most common questions about our scripts and services.
                </p>
              </motion.div>

              {/* FAQ Accordion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="glass rounded-xl p-6 md:p-8"
              >
                <Accordion type="single" collapsible className="space-y-2">
                  {faqItems.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-border/50 px-4"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>

              {/* Support CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-16 text-center glass rounded-xl p-8 md:p-12 border-primary/20"
              >
                <h2 className="font-display text-2xl font-bold tracking-tight mb-3">
                  STILL HAVE <span className="text-gradient">QUESTIONS</span>?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Join our Discord and speak directly with our support team.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild size="lg" className="font-display text-sm tracking-wider glow-primary">
                    <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer">
                      <SiDiscord className="w-4 h-4 mr-2" />
                      JOIN OUR DISCORD
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
    </div>
  );
}
