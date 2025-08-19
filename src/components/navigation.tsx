import { Link, useLocation } from "react-router-dom";
import { MinecraftButton } from "./ui/minecraft-button";
import { Pickaxe, MessageSquare, Newspaper, Megaphone, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Pickaxe },
    { path: "/forums", label: "Forums", icon: MessageSquare },
    { path: "/news", label: "News", icon: Newspaper },
    { path: "/announcements", label: "Announcements", icon: Megaphone },
  ];

  return (
    <nav className="bg-card border-b-2 border-border shadow-blocky">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Pickaxe className="h-8 w-8 text-primary" />
              <span className="text-xl font-black text-foreground">BLITZ PRISON</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <MinecraftButton
                    variant={isActive ? "accent" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </MinecraftButton>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;