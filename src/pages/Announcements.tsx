import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import Navigation from "@/components/navigation";
import { Megaphone, AlertTriangle, Info, Star, Zap } from "lucide-react";

const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: "Server Maintenance - December 20th",
      content: "The server will undergo scheduled maintenance on December 20th from 3:00 AM to 6:00 AM EST. We'll be implementing performance improvements and bug fixes.",
      type: "maintenance",
      priority: "high",
      date: "December 18, 2024",
      author: "BlitzAdmin",
      pinned: true
    },
    {
      id: 2,
      title: "New Player Protection Extended",
      content: "We've extended new player protection from 24 hours to 48 hours to give fresh prisoners more time to learn the ropes and establish themselves.",
      type: "update",
      priority: "medium",
      date: "December 16, 2024",
      author: "ModTeam",
      pinned: true
    },
    {
      id: 3,
      title: "Holiday Event Starting Soon!",
      content: "Get ready for our Winter Holiday Event! Special holiday mines, exclusive rewards, and festive decorations throughout the prison. Event starts December 22nd!",
      type: "event",
      priority: "high",
      date: "December 15, 2024",
      author: "EventTeam",
      pinned: false
    },
    {
      id: 4,
      title: "Rule Update: Chat Guidelines",
      content: "We've updated our chat guidelines to be more clear about what constitutes spam and inappropriate behavior. Please review the updated rules in /rules.",
      type: "rules",
      priority: "medium",
      date: "December 13, 2024",
      author: "AdminTeam",
      pinned: false
    },
    {
      id: 5,
      title: "Performance Improvements Deployed",
      content: "We've deployed several performance improvements that should reduce lag during peak hours. Let us know if you notice any improvements!",
      type: "update",
      priority: "low",
      date: "December 11, 2024",
      author: "DevTeam",
      pinned: false
    }
  ];

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return AlertTriangle;
      case "event":
        return Star;
      case "update":
        return Zap;
      case "rules":
        return Info;
      default:
        return Megaphone;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "text-gaming-orange";
      case "event":
        return "text-accent";
      case "update":
        return "text-primary";
      case "rules":
        return "text-gaming-purple";
      default:
        return "text-foreground";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-gaming-orange text-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">PRISON ANNOUNCEMENTS</h1>
          <p className="text-muted-foreground text-lg">
            Important updates, maintenance notices, and official announcements from the Blitz Prison team.
          </p>
        </div>

        <div className="grid gap-6">
          {announcements.map((announcement) => {
            const Icon = getAnnouncementIcon(announcement.type);
            const iconColor = getAnnouncementColor(announcement.type);
            
            return (
              <Card 
                key={announcement.id} 
                className={`p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] ${
                  announcement.pinned ? 'border-2 border-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-sm bg-card border-2 border-border ${iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {announcement.pinned && (
                          <div className="inline-flex items-center px-2 py-1 rounded-sm bg-accent text-accent-foreground text-xs font-bold">
                            PINNED
                          </div>
                        )}
                        <div className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-bold ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority.toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
                          {announcement.type}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {announcement.title}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="ml-16">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.date}</span>
                    </div>
                    
                    <MinecraftButton variant="ghost" size="sm">
                      View Details
                    </MinecraftButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <MinecraftButton variant="secondary" size="lg">
            View Archive
          </MinecraftButton>
        </div>
      </main>
    </div>
  );
};

export default Announcements;