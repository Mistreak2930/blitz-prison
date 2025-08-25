import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, Heart, HelpCircle, Laugh, Eye, Pin, Trash2 } from "lucide-react";
import { useForumReactions, ReactionType } from "@/hooks/useForumReactions";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: number;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  pinned: boolean;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

interface ForumPostCardProps {
  post: ForumPost;
  categoryColor?: string;
  onDelete?: (postId: string) => void;
  onPin?: (postId: string, pinned: boolean) => void;
}

const reactionEmojis: Record<ReactionType, string> = {
  like: '👍',
  helpful: '💡',
  funny: '😂',
  love: '❤️'
};

const reactionIcons: Record<ReactionType, any> = {
  like: Heart,
  helpful: HelpCircle, 
  funny: Laugh,
  love: Heart
};

export const ForumPostCard = ({ post, categoryColor = 'text-primary', onDelete, onPin }: ForumPostCardProps) => {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { userReactions, toggleReaction, getReactionCounts } = useForumReactions(post.id);
  const reactionCounts = getReactionCounts();

  const handleReaction = async (reactionType: ReactionType) => {
    if (!user) return;
    await toggleReaction(reactionType);
  };

  return (
    <Card className={`p-4 shadow-blocky hover:shadow-hover transition-all ${post.pinned ? 'border-gaming-gold border-2' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-sm bg-card border-2 border-border ${categoryColor}`}>
          <User className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-foreground">{post.title}</h3>
            {post.pinned && (
              <Badge variant="secondary" className="text-xs">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{post.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{post.profiles?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{post.views} views</span>
              </div>
            </div>
            
            {/* Reaction buttons */}
            <div className="flex items-center gap-1">
              {Object.entries(reactionEmojis).map(([type, emoji]) => {
                const reactionType = type as ReactionType;
                const count = reactionCounts[reactionType];
                const hasReacted = userReactions.includes(reactionType);
                
                return (
                  <Button
                    key={type}
                    variant={hasReacted ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleReaction(reactionType)}
                    disabled={!user}
                  >
                    <span className="mr-1">{emoji}</span>
                    {count > 0 && <span>{count}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1">
            {onPin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onPin(post.id, post.pinned)}
                className="h-8 w-8 p-0"
              >
                <Pin className={`h-4 w-4 ${post.pinned ? 'text-gaming-gold' : 'text-muted-foreground'}`} />
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(post.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};