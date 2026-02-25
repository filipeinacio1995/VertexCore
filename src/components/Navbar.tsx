"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, ShoppingCart, LogIn, LogOut, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import Logo from "@/app/assets/core.png";

import { getCart } from "@/lib/cart";
import { clearUser, getUser } from "@/lib/user";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/faq", label: "FAQ" },
];

const currencies = ["EUR", "USD", "GBP"] as const;

const actionBtnClass =
  "inline-flex items-center justify-center rounded-xl " +
  "border border-border/50 " +
  "bg-background text-muted-foreground " +
  "hover:bg-secondary hover:text-foreground " +
  "transition-all duration-200";
  

function getDisplayName() {
  const u = getUser();
  if (!u) return null;
  return u.username ?? (u.username_id ? `Filipe_${u.username_id}` : "User");
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<(typeof currencies)[number]>("EUR");

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const itemCount = useMemo(() => getCart().reduce((sum, it) => sum + it.quantity, 0), []);

  useEffect(() => {
    const refresh = () => setDisplayName(getDisplayName());
    refresh();

    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  function handleLogin() {
    setIsLoggingIn(true);
    router.push(`/login?returnTo=${encodeURIComponent(pathname || "/")}`);
    setTimeout(() => setIsLoggingIn(false), 800);
  }

  function handleLogout() {
    clearUser();
    setDisplayName(null);
    router.refresh();
  }

  const isAuthenticated = !!displayName;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-display text-lg font-bold tracking-wider text-foreground">
              Vertex<span style={{ color: "#00D0FF" }}>Core</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen((v) => !v)}
                className={cn(actionBtnClass, "px-3 py-2 text-sm font-medium gap-2")}
              >
                <span>{selectedCurrency}</span>
                <ChevronDown
                  className={cn("w-4 h-4 transition-transform", currencyOpen ? "rotate-180" : "")}
                />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-background border border-border/50 rounded-lg shadow-md overflow-hidden z-50">
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setCurrencyOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        selectedCurrency === curr
                          ? "font-bold text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className={cn(actionBtnClass, "p-2 relative")}>
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Area */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2">
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-foreground">{displayName}</div>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    <span>Online</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 hover:bg-secondary transition"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={cn(actionBtnClass, "px-4 py-2 text-sm font-medium gap-2 border-primary/20")}
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                <span>{isLoggingIn ? "Connecting..." : "Login"}</span>
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-foreground" onClick={() => setIsOpen((v) => !v)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 border-t border-border/50 mt-2 pt-4 space-y-4">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-4 space-y-3">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className={cn(actionBtnClass, "w-full py-2.5 gap-2 text-sm font-medium")}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({itemCount})</span>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background px-3 py-2">
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-foreground">{displayName}</div>
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                      <span>Online</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border/50 hover:bg-secondary transition"
                    aria-label="Logout"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogin();
                  }}
                  disabled={isLoggingIn}
                  className={cn(
                    actionBtnClass,
                    "w-full py-2.5 gap-2 text-sm font-medium bg-primary/10 text-primary border-primary/50"
                  )}
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                  <span>{isLoggingIn ? "Connecting..." : "Login with Cfx"}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}