import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { CreatePostModal } from "@/components/CreatePostModal";
import { ForumPostCard } from "@/components/ForumPostCard";
import { useForumPosts } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Users, Lock, Star, Zap } from "lucide-react";
import { toast } from "sonner";

const forumCategories = [
  { id: 1, title: "General Discussion", description: "Talk about anything related to FluxMc", icon: MessageSquare, color: "text-primary" },
  { id: 2, title: "Prison Guides & Tips", description: "Share strategies and guides for advancing", icon: Star, color: "text-accent" },
  { id: 3, title: "Staff Applications", description: "Apply to become a staff member", icon: Lock, color: "text-gaming-orange" },
  { id: 4, title: "Player Reports", description: "Report players breaking the rules", icon: Zap, color: "text-destructive" },
  { id: 5, title: "Trading & Economy", description: "Trade items and discuss the server economy", icon: Users, color: "text-gaming-purple" },
];

const ForumCategory = () => {
  const { id } = useParams();
  const categoryId = Number(id);
  const category = useMemo(() => forumCategories.find(c => c.id === categoryId), [categoryId]);
  const { posts, loading, deletePost, togglePin } = useForumPosts(categoryId);
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const title = category ? `${category.title} | FluxMc Forums` : `Forums | FluxMc`;
    document.title = title;

    const descText = category ? `${category.title} - ${category.description}` : 'Browse FluxMc forum posts by category.';
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
    if (!confirm('Delete this post?')) return;
    try {
      await deletePost(postId);
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handlePin = async (postId: string, pinned: boolean) => {
    try {
      await togglePin(postId, pinned);
      toast.success(pinned ? 'Post unpinned' : 'Post pinned');
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
              <ForumPostCard
                key={post.id}
                post={post}
                categoryColor={category?.color}
                onDelete={handleDelete}
                onPin={handlePin}
              />
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
