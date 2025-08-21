import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useForumPosts } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { MessageSquare, Users, Lock, Star, Zap, Clock, User } from "lucide-react";
import { toast } from "sonner";

const forumCategories = [
  { id: 1, title: "General Discussion", description: "Talk about anything related to Blitz Prison", icon: MessageSquare, color: "text-primary" },
  { id: 2, title: "Prison Guides & Tips", description: "Share strategies and guides for advancing in prison", icon: Star, color: "text-accent" },
  { id: 3, title: "Staff Applications", description: "Apply to become a staff member", icon: Lock, color: "text-gaming-orange" },
  { id: 4, title: "Player Reports", description: "Report players breaking the rules", icon: Zap, color: "text-destructive" },
  { id: 5, title: "Trading & Economy", description: "Trade items and discuss the server economy", icon: Users, color: "text-gaming-purple" },
];

const ForumCategory = () => {
  const { id } = useParams();
  const categoryId = Number(id);
  const category = useMemo(() => forumCategories.find(c => c.id === categoryId), [categoryId]);
  const { posts, loading, deletePost } = useForumPosts(categoryId);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const title = category ? `${category.title} | Blitz Prison Forums` : `Forums | Blitz Prison`;
    document.title = title;

    const descText = category ? `${category.title} - ${category.description}` : 'Browse Blitz Prison forum posts by category.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descText);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [category]);

  const Icon = category?.icon || MessageSquare;

  const handleDelete = async (postId: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this post?')) return;
    const { error } = await deletePost(postId);
    if (error) toast.error('Failed to delete post');
    else toast.success('Post deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-sm bg-card border-2 border-border ${category?.color || 'text-primary'}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">{category?.title || 'Forum Category'}</h1>
              <p className="text-muted-foreground">{category?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/forums">
              <MinecraftButton variant="outline" size="sm">Back to Forums</MinecraftButton>
            </Link>
            {user && (
              <MinecraftButton variant="outline" size="sm" onClick={() => setShowCreateModal(true)}>
                Create Post
              </MinecraftButton>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground mb-4">No posts in this category yet.</div>
            {user && (
              <MinecraftButton onClick={() => setShowCreateModal(true)}>Create First Post</MinecraftButton>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4 shadow-blocky hover:shadow-hover transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-sm bg-card border-2 border-border ${category?.color || 'text-primary'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><User className="h-3 w-3" /><span>{post.profiles?.username || 'Anonymous'}</span></div>
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        forumCategories={forumCategories}
      />
    </div>
  );
};

export default ForumCategory;
