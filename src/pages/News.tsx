import { useState } from "react";
import { useNews } from "@/hooks/useNews";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useRoles } from "@/hooks/useRoles";
import { Card } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateContentModal } from "@/components/CreateContentModal";
import { Clock, User, Plus, Trash2, Pin } from "lucide-react";
import { toast } from "sonner";

const News = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { news, loading, createNews, deleteNews, togglePin } = useNews();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { hasRole } = useRoles();

  const canManageNews = isAdmin || (user && hasRole(user.id, 'news_updater'));

  const handlePin = async (id: string, pinned: boolean) => {
    try {
      await togglePin(id, pinned);
      toast.success(pinned ? 'News unpinned' : 'News pinned');
    } catch (error) {
      toast.error('Failed to update news');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this news article?')) return;
    try {
      await deleteNews(id);
      toast.success('News deleted');
    } catch (error) {
      toast.error('Failed to delete news');
    }
  };

  const handleCreate = async (title: string, content: string) => {
    try {
      await createNews(title, content);
      setShowCreateModal(false);
      toast.success('News created');
    } catch (error) {
      toast.error('Failed to create news');
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-foreground mb-4">Blitz Network News</h1>
        <p className="text-muted-foreground text-lg">
          Get News and Updates on the latest Blitz Network Info!
        </p>
      </div>

      {canManageNews && (
        <CreateContentModal
          onCreateContent={handleCreate}
          buttonText="Create News Article"
          title="News Article"
        />
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading news...</div>
      ) : news.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No news articles yet. Check back later!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <Card key={item.id} className={`p-6 shadow-blocky hover:shadow-hover transition-all ${item.pinned ? 'border-gaming-gold border-2' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-foreground">{item.title}</h2>
                  {item.pinned && (
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                </div>
                {canManageNews && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePin(item.id, item.pinned)}
                    >
                      <Pin className={`h-4 w-4 ${item.pinned ? 'text-gaming-gold' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {item.content}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Staff</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
