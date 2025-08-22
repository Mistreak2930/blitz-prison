import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import Navigation from "@/components/navigation";
import { Calendar, User, ArrowRight, Trash2 } from "lucide-react";
import { CreateContentModal } from "@/components/CreateContentModal";
import { useNews } from "@/hooks/useNews";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

const News = () => {
  const { news, loading, createNews, deleteNews } = useNews();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();

  const canCreateNews = user && (isAdmin || false); // TODO: Add news_updater role check
  const canDeleteNews = user && isAdmin;

  const handleCreateNews = async (title: string, content: string) => {
    await createNews(title, content);
  };

  const handleDeleteNews = async (id: string) => {
    try {
      await deleteNews(id);
      toast({
        title: "News deleted",
        description: "The news article has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete news",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">PRISON NEWS & UPDATES</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Stay informed about the latest updates, features, and events on Blitz Prison.
          </p>
          
          {canCreateNews && (
            <CreateContentModal
              onCreateContent={handleCreateNews}
              buttonText="Create News Article"
              title="News Article"
            />
          )}
        </div>
        
        {!user && (
          <Card className="p-6 mb-8 border-primary bg-primary/5">
            <p className="text-center text-foreground">
              <strong>Want to contribute?</strong> <a href="/auth" className="text-primary hover:underline">Login</a> to access posting features if you have the right permissions.
            </p>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading news...</div>
        ) : (
          <div className="grid gap-8">
            {news.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No news articles yet. Check back later!</p>
              </Card>
            ) : (
              news.map((article, index) => (
                <Card 
                  key={article.id} 
                  className="p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px] cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-3">
                        {article.title}
                      </h2>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {article.content}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <MinecraftButton variant="outline" size="sm">
                        <span>Read More</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </MinecraftButton>
                      
                      {canDeleteNews && (
                        <MinecraftButton 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNews(article.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </MinecraftButton>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default News;