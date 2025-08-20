import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { MinecraftButton } from "./ui/minecraft-button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    }
  };

  const navItems = [
    { path: "/", name: "Home" },
    { path: "/forums", name: "Forums" },
    { path: "/news", name: "News" },
    { path: "/announcements", name: "Announcements" },
  ];

  return (
    <nav className="bg-card border-b-2 border-border shadow-blocky sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black text-primary">⛏</span>
              <span className="text-xl font-black text-foreground">BLITZ PRISON</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-bold transition-colors ${
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome back!
                </span>
                <MinecraftButton
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </MinecraftButton>
              </div>
            ) : (
              <Link to="/auth">
                <MinecraftButton variant="outline" size="sm">
                  Join Prison
                </MinecraftButton>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3 pt-4 border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-lg font-bold transition-colors ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Welcome back!
                  </p>
                  <MinecraftButton
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </MinecraftButton>
                </div>
              ) : (
                <div className="pt-4 border-t border-border">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <MinecraftButton variant="outline" size="sm" className="w-full">
                      Join Prison
                    </MinecraftButton>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;