"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import Logo from "@/app/assets/core.png";

import { getCart } from "@/lib/cart";
import { clearUser, getUser } from "@/lib/user";

import CartDrawer from "@/components/cart/CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/faq", label: "FAQ" },
];

const actionBtnClass =
  "inline-flex items-center justify-center rounded-xl " +
  "border border-border/50 bg-background text-muted-foreground " +
  "hover:bg-secondary hover:text-foreground transition-all";

function getDisplayName() {
  const u = getUser();
  if (!u) return null;
  return u.username ?? (u.username_id ? `Filipe_${u.username_id}` : "User");
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const isAuthenticated = !!displayName;

  // 🛒 CART COUNT
  useEffect(() => {
    const compute = () => {
      try {
        const count = getCart().reduce((s, i) => s + i.quantity, 0);
        setItemCount(count);
      } catch {
        setItemCount(0);
      }
    };

    compute();
    window.addEventListener("cart:changed", compute);
    window.addEventListener("focus", compute);

    return () => {
      window.removeEventListener("cart:changed", compute);
      window.removeEventListener("focus", compute);
    };
  }, []);

  // 🔐 AUTH
  useEffect(() => {
    const refresh = () => setDisplayName(getDisplayName());
    refresh();

    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  function handleLogin() {
    setIsLoggingIn(true);
    router.push(`/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    setTimeout(() => setIsLoggingIn(false), 800);
  }

  function handleLogout() {
    clearUser();
    setDisplayName(null);
    setIsOpen(false);
    router.refresh();
  }

  function closeMobile() {
    setIsOpen(false);
  }

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2">
              <Image src={Logo} alt="Logo" className="w-8 h-8" />
              <span className="font-display text-lg font-bold tracking-wider">
                Vertex<span className="text-primary">Core</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* DESKTOP ACTIONS */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setCartOpen(true)}
                className={cn(actionBtnClass, "p-2 relative")}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background pl-3">
                  <span className="text-sm font-semibold">{displayName}</span>
                  <button onClick={handleLogout} className="w-9 h-9">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={cn(actionBtnClass, "px-4 py-2 gap-2")}
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  <span>{isLoggingIn ? "Connecting..." : "Login"}</span>
                </button>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen((v) => !v)}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setCartOpen(true);
                    closeMobile();
                  }}
                  className={cn(actionBtnClass, "p-2 relative")}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className={cn(actionBtnClass, "px-4 py-2 gap-2")}
                  ><span>{displayName}</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className={cn(actionBtnClass, "px-4 py-2 gap-2")}
                  >
                    <LogIn className="w-4 h-4" />
                     Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* CART */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}