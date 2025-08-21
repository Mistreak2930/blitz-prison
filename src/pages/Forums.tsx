import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { MinecraftButton } from "@/components/ui/minecraft-button";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { MessageSquare, Users, Lock, Star, Zap, Plus, Clock, User, Trash2, Eye } from "lucide-react";
import { CreatePostModal } from "@/components/CreatePostModal";
import { useForumPosts } from "@/hooks/useForumPosts";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useIsAdmin } from "@/hooks/useUserRole";

const Forums = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { posts, loading, deletePost } = useForumPosts();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('Delete this post?')) return;
    const { error } = await deletePost(id);
    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success('Post deleted');
    }
  };

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
            const categoryPosts = posts.filter(post => post.category_id === category.id);
            
            return (
              <Card key={category.id} className="p-6 shadow-blocky hover:shadow-hover transition-all hover:translate-y-[-2px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-sm bg-card border-2 border-border ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2">{category.title}</h3>
                      <p className="text-muted-foreground mb-4">{category.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>{categoryPosts.length} Posts</span>
                        {categoryPosts.length > 0 && (
                          <span>Last post: {new Date(categoryPosts[0].created_at).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/forums/category/${category.id}`}>
                      <MinecraftButton variant="outline" size="sm">
                        View All
                      </MinecraftButton>
                    </Link>
                    <MinecraftButton 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCreateModal(true)}
                      disabled={!user}
                    >
                      {user ? 'Create Post' : 'Login Required'}
                    </MinecraftButton>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Posts Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground">RECENT POSTS</h2>
            {!user && (
              <Link to="/auth">
                <MinecraftButton variant="outline">
                  Login to Post
                </MinecraftButton>
              </Link>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading posts...</div>
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground mb-4">No posts yet. Be the first to start a discussion!</div>
              {user && (
                <MinecraftButton onClick={() => setShowCreateModal(true)}>
                  Create First Post
                </MinecraftButton>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.slice(0, 10).map((post) => {
                const category = forumCategories.find(cat => cat.id === post.category_id);
                const CategoryIcon = category?.icon || MessageSquare;
                
                return (
                  <Card key={post.id} className="p-4 shadow-blocky hover:shadow-hover transition-all">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-sm bg-card border-2 border-border ${category?.color || 'text-primary'}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-foreground truncate">{post.title}</h4>
                          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {category?.title || 'General'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{post.profiles?.username || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {user && (
          <div className="mt-12 text-center">
            <MinecraftButton 
              variant="hero" 
              size="xl"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Post
            </MinecraftButton>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        forumCategories={forumCategories}
      />
    </div>
  );
};

export default Forums;