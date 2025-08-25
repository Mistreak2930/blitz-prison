import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useRoles } from "@/hooks/useRoles";
import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateContentModal } from "@/components/CreateContentModal";
import { Clock, User, Plus, Trash2, AlertCircle, Pin } from "lucide-react";
import { toast } from "sonner";

const Announcements = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { announcements, loading, createAnnouncement, deleteAnnouncement, togglePin } = useAnnouncements();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { hasRole } = useRoles();

  const canManageAnnouncements = isAdmin || (user && hasRole(user.id, 'announcements_manager'));

  const handlePin = async (id: string, pinned: boolean) => {
    try {
      await togglePin(id, pinned);
      toast.success(pinned ? 'Announcement unpinned' : 'Announcement pinned');
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handleCreate = async (title: string, content: string) => {
    try {
      await createAnnouncement(title, content);
      setShowCreateModal(false);
      toast.success('Announcement created');
    } catch (error) {
      toast.error('Failed to create announcement');
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

        {canManageAnnouncements && (
          <CreateContentModal
            onCreateContent={handleCreate}
            buttonText="Create Announcement"
            title="Announcement"
          />
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No announcements yet. Check back later!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className={`p-6 shadow-blocky hover:shadow-hover transition-all border-l-4 border-l-gaming-orange ${announcement.pinned ? 'border-gaming-gold border-2' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-sm bg-gaming-orange/10 border-2 border-gaming-orange/20">
                      <AlertCircle className="h-5 w-5 text-gaming-orange" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-foreground">{announcement.title}</h2>
                      {announcement.pinned && (
                        <Badge variant="secondary" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                  </div>
                  {canManageAnnouncements && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePin(announcement.id, announcement.pinned)}
                      >
                        <Pin className={`h-4 w-4 ${announcement.pinned ? 'text-gaming-gold' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {announcement.content}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Staff</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Announcements;