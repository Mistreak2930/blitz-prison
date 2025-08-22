import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import Navigation from "@/components/navigation";
import { Megaphone, AlertTriangle, Info, Star, Zap, Trash2 } from "lucide-react";
import { CreateContentModal } from "@/components/CreateContentModal";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

const Announcements = () => {
  const { announcements, loading, createAnnouncement, deleteAnnouncement } = useAnnouncements();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();

  const canCreateAnnouncements = user && (isAdmin || false); // TODO: Add announcements_manager role check
  const canDeleteAnnouncements = user && isAdmin;

  const handleCreateAnnouncement = async (title: string, content: string) => {
    await createAnnouncement(title, content);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteAnnouncement(id);
      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete announcement",
        variant: "destructive"
      });
    }
  };

  const getAnnouncementIcon = (type: string = "general") => {
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

  const getAnnouncementColor = (type: string = "general") => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">PRISON ANNOUNCEMENTS</h1>
          <p className="text-muted-foreground text-lg mb-6">
            Important updates, maintenance notices, and official announcements from the Blitz Prison team.
          </p>
          
          {canCreateAnnouncements && (
            <CreateContentModal
              onCreateContent={handleCreateAnnouncement}
              buttonText="Create Announcement"
              title="Announcement"
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
          <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
        ) : (
          <div className="grid gap-6">
            {announcements.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No announcements yet. Check back later!</p>
              </Card>
            ) : (
              announcements.map((announcement) => {
                const Icon = getAnnouncementIcon();
                const iconColor = getAnnouncementColor();
                
                return (
                  <Card 
                    key={announcement.id} 
                    className="p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-sm bg-card border-2 border-border ${iconColor}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-3">
                            {announcement.title}
                          </h3>
                        </div>
                      </div>
                      
                      {canDeleteAnnouncements && (
                        <MinecraftButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </MinecraftButton>
                      )}
                    </div>
                    
                    <div className="ml-16">
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <MinecraftButton variant="ghost" size="sm">
                          View Details
                        </MinecraftButton>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Announcements;