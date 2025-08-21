import Navigation from "@/components/navigation";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/blitz-prison-hero.jpg";
import { 
  Users, 
  Zap, 
  Shield, 
  Trophy, 
  MessageSquare, 
  Newspaper,
  Megaphone,
  Server,
  Crown,
  Pickaxe
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: Pickaxe,
      title: "Advanced Mining",
      description: "Unique mining system with custom enchants and progression"
    },
    {
      icon: Shield,
      title: "Prison Ranks",
      description: "Work your way up through 26 prison ranks with exclusive perks"
    },
    {
      icon: Trophy,
      title: "Competitions",
      description: "Daily and weekly competitions with amazing rewards"
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of players in our thriving prison community"
    }
  ];

  const stats = [
    { label: "Players Online", value: "1,247", icon: Users },
    { label: "Total Registered", value: "45,892", icon: Crown },
    { label: "Mines Available", value: "26", icon: Pickaxe },
    { label: "Server Uptime", value: "99.9%", icon: Server }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-dark opacity-80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 leading-tight">
            BLITZ
            <span className="block text-primary">PRISON</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience the ultimate Minecraft prison server with custom features, 
            competitive gameplay, and an amazing community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MinecraftButton variant="hero" size="xl">
              JOIN NOW: blitzprison.minefort.com
            </MinecraftButton>
            <MinecraftButton variant="outline" size="xl">
              View Server Info
            </MinecraftButton>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-sm shadow-blocky mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-3xl font-black text-foreground mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground mb-4">WHY CHOOSE BLITZ PRISON?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the most advanced prison server with unique features you won't find anywhere else.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px]">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent text-accent-foreground rounded-sm shadow-accent mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground mb-4">EXPLORE THE COMMUNITY</h2>
            <p className="text-lg text-muted-foreground">
              Stay connected with the latest updates, discuss strategies, and connect with other players.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/forums" className="group">
              <Card className="p-8 text-center shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] group-hover:border-primary">
                <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-3">Forums</h3>
                <p className="text-muted-foreground mb-4">
                  Join discussions, share strategies, and connect with the community.
                </p>
                <MinecraftButton variant="outline" size="sm">
                  Visit Forums
                </MinecraftButton>
              </Card>
            </Link>
            
            <Link to="/news" className="group">
              <Card className="p-8 text-center shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] group-hover:border-accent">
                <Newspaper className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-3">News & Updates</h3>
                <p className="text-muted-foreground mb-4">
                  Stay informed about the latest features, events, and improvements.
                </p>
                <MinecraftButton variant="accent" size="sm">
                  Read News
                </MinecraftButton>
              </Card>
            </Link>
            
            <Link to="/announcements" className="group">
              <Card className="p-8 text-center shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] group-hover:border-gaming-orange">
                <Megaphone className="h-12 w-12 text-gaming-orange mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-3">Announcements</h3>
                <p className="text-muted-foreground mb-4">
                  Important server announcements and official notices.
                </p>
                <MinecraftButton variant="outline" size="sm">
                  View Announcements
                </MinecraftButton>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t-2 border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Pickaxe className="h-8 w-8 text-primary" />
            <span className="text-2xl font-black text-foreground">BLITZ PRISON</span>
          </div>
          <p className="text-muted-foreground mb-6">
            The ultimate Minecraft prison experience • Server IP: play.blitzprison.net
          </p>
          <div className="flex justify-center space-x-4">
            <MinecraftButton variant="ghost" size="sm">Discord</MinecraftButton>
            <MinecraftButton variant="ghost" size="sm">Rules</MinecraftButton>
            <MinecraftButton variant="ghost" size="sm">Store</MinecraftButton>
            <MinecraftButton variant="ghost" size="sm">Support</MinecraftButton>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
