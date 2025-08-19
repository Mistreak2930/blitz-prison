import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import Navigation from "@/components/navigation";
import { Calendar, User, ArrowRight } from "lucide-react";

const News = () => {
  const newsArticles = [
    {
      id: 1,
      title: "Prison Season 3 Now Live!",
      excerpt: "The biggest prison update yet has arrived with new mines, ranks, and rewards. Experience the ultimate prison server like never before.",
      author: "BlitzAdmin",
      date: "December 15, 2024",
      readTime: "3 min read",
      featured: true
    },
    {
      id: 2,
      title: "New Enchantment System Released",
      excerpt: "Discover powerful new enchantments exclusive to Blitz Prison. Upgrade your tools and become the ultimate miner.",
      author: "DevTeam",
      date: "December 12, 2024",
      readTime: "2 min read",
      featured: false
    },
    {
      id: 3,
      title: "Weekly Top Miners Rewards",
      excerpt: "Congratulations to this week's top miners! Check out the leaderboards and claim your rewards.",
      author: "BlitzAdmin",
      date: "December 10, 2024",
      readTime: "1 min read",
      featured: false
    },
    {
      id: 4,
      title: "Community Event: Prison Olympics",
      excerpt: "Join us for the monthly Prison Olympics featuring mining competitions, PvP tournaments, and amazing prizes.",
      author: "EventTeam",
      date: "December 8, 2024",
      readTime: "4 min read",
      featured: false
    },
    {
      id: 5,
      title: "Anti-Cheat System Update",
      excerpt: "We've enhanced our anti-cheat system to ensure fair gameplay for all prisoners. New detection methods now active.",
      author: "SecurityTeam",
      date: "December 5, 2024",
      readTime: "2 min read",
      featured: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">PRISON NEWS & UPDATES</h1>
          <p className="text-muted-foreground text-lg">
            Stay informed about the latest updates, features, and events on Blitz Prison.
          </p>
        </div>

        <div className="grid gap-8">
          {newsArticles.map((article, index) => (
            <Card 
              key={article.id} 
              className={`p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] cursor-pointer ${
                article.featured && index === 0 ? 'border-2 border-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {article.featured && index === 0 && (
                    <div className="inline-flex items-center px-3 py-1 rounded-sm bg-primary text-primary-foreground text-xs font-bold mb-3">
                      FEATURED
                    </div>
                  )}
                  
                  <h2 className={`font-bold text-foreground mb-3 ${
                    article.featured && index === 0 ? 'text-2xl' : 'text-xl'
                  }`}>
                    {article.title}
                  </h2>
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.date}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <MinecraftButton variant="outline" size="sm" className="ml-4">
                  <span>Read More</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </MinecraftButton>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <MinecraftButton variant="secondary" size="lg">
            Load More Articles
          </MinecraftButton>
        </div>
      </main>
    </div>
  );
};

export default News;