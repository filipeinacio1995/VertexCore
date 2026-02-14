import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ShoppingCart, LogIn, User as UserIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "@/assets/core.png";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth"; // Added
import { getLoginUrl } from "@/lib/tebex"; // Added
import CartDrawer from "./CartDrawer";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/faq", label: "FAQ" },
];

const currencies = ["EUR", "USD", "GBP"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [cartOpen, setCartOpen] = useState(false);
  
  const { items } = useCart();
  const { user, isAuthenticated, logout } = useAuth(); // Access Auth state
  const location = useLocation();

  const actionBtnClass = "flex items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src={Logo} alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-foreground">
                Vertex
                <span style={{ color: "#00D0FF" }}>Core</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    location.pathname === link.to
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
              <div className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className={cn(actionBtnClass, "px-3 py-2 text-sm font-medium gap-2")}
                >
                  <span>{selectedCurrency}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", currencyOpen ? "rotate-180" : "")} />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 mt-2 w-24 bg-background border border-border/50 rounded-lg shadow-md overflow-hidden z-50">
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => { setSelectedCurrency(curr); setCurrencyOpen(false); }}
                        className={cn(
                          "block w-full text-left px-3 py-2 text-sm transition-colors",
                          selectedCurrency === curr ? "font-bold text-primary bg-primary/10" : "font-normal text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shopping Cart Button */}
              <button 
                onClick={() => setCartOpen(true)} 
                className={cn(actionBtnClass, "p-2 relative")}
              >
                <ShoppingCart className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold text-black rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>

              {/* Login / Profile Section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2 bg-secondary/50 p-1 pr-3 rounded-lg border border-border/50">
                  <img 
                    src={user?.avatar} 
                    alt="User" 
                    className="w-7 h-7 rounded-md border border-primary/30"
                  />
                  <span className="text-xs font-bold uppercase tracking-tight text-foreground truncate max-w-[80px]">
                    {user?.username}
                  </span>
                  <button 
                    onClick={logout}
                    className="ml-1 p-1 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => window.location.href = getLoginUrl()}
                  className={cn(actionBtnClass, "px-4 py-2 text-sm font-medium gap-2")}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-6 border-t border-border/50 mt-2 pt-4 space-y-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      location.pathname === link.to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="px-4 space-y-4">
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <span className="text-sm text-muted-foreground">Currency</span>
                  <div className="flex gap-1">
                    {currencies.map((curr) => (
                      <button 
                        key={curr}
                        onClick={() => setSelectedCurrency(curr)}
                        className={cn(
                          "text-xs px-3 py-1.5 rounded-md border transition-all",
                          selectedCurrency === curr ? "bg-primary/10 text-primary border-primary/50" : "border-border text-muted-foreground"
                        )}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      setCartOpen(true);
                    }}
                    className={cn(actionBtnClass, "w-full py-2.5 gap-2 text-sm font-medium relative")}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart ({items.length})</span>
                  </button>

                  {isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-3 px-4 py-2.5 bg-secondary/50 rounded-lg border border-border/50">
                        <img src={user?.avatar} className="w-6 h-6 rounded-md" />
                        <span className="text-sm font-bold uppercase">{user?.username}</span>
                      </div>
                      <button 
                        onClick={logout}
                        className={cn(actionBtnClass, "w-full py-2.5 gap-2 text-sm font-medium text-red-400 border-red-400/20 hover:bg-red-400/10")}
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => window.location.href = getLoginUrl()}
                      className={cn(actionBtnClass, "w-full py-2.5 gap-2 text-sm font-medium bg-primary/10 text-primary border-primary/50")}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login with Cfx</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;