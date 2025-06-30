import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Leaf } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
    { name: "FAQ", href: "/faq" },
  ];

  const NavLink = ({ href, children, mobile = false }: { href: string; children: React.ReactNode; mobile?: boolean }) => {
    const isActive = location === href;
    const baseClasses = mobile 
      ? "block px-3 py-2 text-base font-medium transition-colors" 
      : "text-dark-text hover:text-fresh-green transition-colors";
    const activeClasses = isActive ? "text-fresh-green" : "";
    
    return (
      <Link href={href}>
        <a className={`${baseClasses} ${activeClasses}`} onClick={() => mobile && setIsOpen(false)}>
          {children}
        </a>
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-green-yellow rounded-lg flex items-center justify-center">
                <Leaf className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold fresh-green">FreshBox</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <NavLink key={item.name} href={item.href}>
                {item.name}
              </NavLink>
            ))}
            <Link href="/products">
              <Button className="bg-fresh-green text-white hover:bg-fresh-green/90">
                Order Now
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <NavLink key={item.name} href={item.href} mobile>
                      {item.name}
                    </NavLink>
                  ))}
                  <Link href="/products">
                    <Button className="w-full bg-fresh-green text-white hover:bg-fresh-green/90" onClick={() => setIsOpen(false)}>
                      Order Now
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
