
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/assets/core.png";
import { SiDiscord } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              Vertex
              <span style={{ color: "#00D0FF" }}>Core</span>
            </span>
          </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
            High-fidelity scripts, fully optimized with dedicated support. We offer complete solutions: from exclusive MLOs and 3D vehicle designs to realistic handlings. 
            Peak performance for your server.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-foreground">
              NAVIGATION
            </h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/store" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Store
              </Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-foreground">
              COMMUNITY
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="https://discord.gg/hfT37777"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <SiDiscord className="w-4 h-4" />
                Discord
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} VertexCore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
