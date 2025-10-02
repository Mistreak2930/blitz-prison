import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { useNews } from "@/hooks/useNews";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useProfiles } from "@/hooks/useProfiles";
import { useServerStatus } from "@/hooks/useServerStatus";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/blitz-prison-hero.jpg";
import { 
  Server, 
  Users, 
  Newspaper, 
  Megaphone, 
  Clock, 
  User,
  Trophy,
  MessageSquare,
  TrendingUp,
  Activity
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { news } = useNews();
  const { announcements } = useAnnouncements();
  const { profiles } = useProfiles();
  const { servers } = useServerStatus();
  const { user } = useAuth();

  const latestNews = news.slice(0, 3);
  const latestAnnouncements = announcements.slice(0, 2);
  const newestMembers = profiles
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  const onlineServers = servers.filter(s => s.online);
  const totalPlayers = servers.reduce((sum, server) => sum + (server.online ? server.players : 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-96 rounded-lg overflow-hidden">
        <img 
          src={heroImage} 
          alt="FluxMc Network Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8">
          <h1 className="text-6xl font-black bg-gradient-to-r from-primary via-accent to-gaming-purple bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            FLUXMC NETWORK
          </h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl drop-shadow-md">
            Experience the next generation of Minecraft servers with Prison, Skyblock, and more! 
            Join thousands of players in our thriving community.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate('/forums')}>
              <MessageSquare className="h-5 w-5 mr-2" />
              Join Forums
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => navigate('/servers')}>
              <Server className="h-5 w-5 mr-2" />
              View Servers
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-primary/10 border border-primary/20">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Online Servers</p>
              <p className="text-2xl font-bold text-foreground">{onlineServers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-gaming-green/10 border border-gaming-green/20">
              <Users className="h-5 w-5 text-gaming-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Players Online</p>
              <p className="text-2xl font-bold text-foreground">{totalPlayers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-gaming-blue/10 border border-gaming-blue/20">
              <MessageSquare className="h-5 w-5 text-gaming-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-sm bg-gaming-purple/10 border border-gaming-purple/20">
              <Activity className="h-5 w-5 text-gaming-purple" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network Status</p>
              <p className="text-2xl font-bold text-gaming-green">ONLINE</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status Widget */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Server Status</h2>
          </div>
          
          <div className="space-y-3">
            {servers.slice(0, 3).map((server) => (
              <div key={server.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-sm">
                <div>
                  <p className="font-medium text-foreground">{server.name}</p>
                  <p className="text-sm text-muted-foreground">{server.ip}</p>
                </div>
                <div className="text-right">
                  <Badge variant={server.online ? "default" : "destructive"}>
                    {server.online ? "Online" : "Offline"}
                  </Badge>
                  {server.online && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {server.players}/{server.maxPlayers}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/servers')}>
            View All Servers
          </Button>
        </Card>

        {/* Latest News Widget */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Latest News</h2>
          </div>
          
          <div className="space-y-4">
            {latestNews.map((item) => (
              <div key={item.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  {item.pinned && (
                    <Badge variant="secondary" className="text-xs">Pinned</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/news')}>
            View All News
          </Button>
        </Card>

        {/* Newest Members Widget */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Newest Members</h2>
          </div>
          
          <div className="space-y-3">
            {newestMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-card border border-border">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{member.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Trophy className="h-3 w-3 mr-1" />
                  {member.reputation}
                </Badge>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/members')}>
            View All Members
          </Button>
        </Card>
      </div>

      {/* Announcements Section */}
      {latestAnnouncements.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Important Announcements</h2>
          </div>
          
          <div className="space-y-4">
            {latestAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-muted/50 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-foreground">{announcement.title}</h3>
                  {announcement.pinned && (
                    <Badge variant="secondary">Pinned</Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-2 line-clamp-2">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/announcements')}>
            View All Announcements
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Index;
