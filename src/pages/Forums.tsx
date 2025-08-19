import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import Navigation from "@/components/navigation";
import { MessageSquare, Users, Lock, Star, Zap } from "lucide-react";

const Forums = () => {
  const forumCategories = [
    {
      id: 1,
      title: "General Discussion",
      description: "Talk about anything related to Blitz Prison",
      icon: MessageSquare,
      topics: 1247,
      posts: 8934,
      lastPost: "2 minutes ago",
      color: "text-primary"
    },
    {
      id: 2,
      title: "Prison Guides & Tips",
      description: "Share strategies and guides for advancing in prison",
      icon: Star,
      topics: 342,
      posts: 2156,
      lastPost: "15 minutes ago",
      color: "text-accent"
    },
    {
      id: 3,
      title: "Staff Applications",
      description: "Apply to become a staff member",
      icon: Lock,
      topics: 89,
      posts: 234,
      lastPost: "1 hour ago",
      color: "text-gaming-orange"
    },
    {
      id: 4,
      title: "Player Reports",
      description: "Report players breaking the rules",
      icon: Zap,
      topics: 156,
      posts: 892,
      lastPost: "3 hours ago",
      color: "text-destructive"
    },
    {
      id: 5,
      title: "Trading & Economy",
      description: "Trade items and discuss the server economy",
      icon: Users,
      topics: 678,
      posts: 3421,
      lastPost: "5 minutes ago",
      color: "text-gaming-purple"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">PRISON FORUMS</h1>
          <p className="text-muted-foreground text-lg">
            Connect with other prisoners, share strategies, and stay updated with the community.
          </p>
        </div>

        <div className="grid gap-6">
          {forumCategories.map((category) => {
            const Icon = category.icon;
            
            return (
              <Card key={category.id} className="p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-sm bg-card border-2 border-border ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{category.title}</h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>{category.topics} Topics</span>
                        <span>{category.posts} Posts</span>
                        <span>Last post: {category.lastPost}</span>
                      </div>
                    </div>
                  </div>
                  
                  <MinecraftButton variant="outline" size="sm">
                    Enter Forum
                  </MinecraftButton>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <MinecraftButton variant="hero" size="xl">
            Create New Topic
          </MinecraftButton>
        </div>
      </main>
    </div>
  );
};

export default Forums;