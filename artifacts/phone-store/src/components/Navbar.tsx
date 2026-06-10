import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X, Package, LogOut, LayoutDashboard, LogIn } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [location] = useLocation();
  const { data: cartItems } = useGetCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const navLinks = [
    { href: "/", label: "Нүүр" },
    { href: "/shop", label: "Дэлгүүр" },
    ...(user && user.role === "user" ? [{ href: "/orders", label: "Захиалгууд" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/annie-logo.jpg" alt="Annie Annie" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-bold text-xl tracking-wider text-primary">Annie Annie</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user?.role === "user" && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {!user && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Админ
                  </Button>
                </Link>
              )}
              {user.role === "user" && (
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
                    <Package className="w-4 h-4 mr-1" />
                    Захиалгууд
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Гарах
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="outline" size="sm" className="border-white/20 hover:border-primary text-sm">
                <LogIn className="w-4 h-4 mr-1" />
                Нэвтрэх
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-white/10 p-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors p-2 rounded-md ${
                location === link.href ? "bg-white/5 text-primary" : "text-muted-foreground"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-primary">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Админ панел
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" /> Гарах
              </Button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full border-white/20">
                <LogIn className="w-4 h-4 mr-2" /> Нэвтрэх
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
