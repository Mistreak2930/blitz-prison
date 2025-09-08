import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useModerationLogs } from '@/hooks/useModerationLogs';
import { useProfiles } from '@/hooks/useProfiles';
import { useForumPosts } from '@/hooks/useForumPosts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { useIsAdmin } from '@/hooks/useUserRole';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  UserX, 
  MessageSquare,
  Activity,
  Flag,
  Clock,
  User,
  FileText,
  Ban
} from 'lucide-react';

const ModerationDashboard = () => {
  const { logs, logAction } = useModerationLogs();
  const { profiles } = useProfiles();
  const { posts } = useForumPosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionType, setActionType] = useState<string>('');
  const [actionReason, setActionReason] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canModerate = isAdmin;

  const handleModerationAction = async () => {
    if (!selectedUser || !actionType || !actionReason.trim()) {
      toast({
        title: "Missing information", 
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await logAction(selectedUser, actionType, actionReason);
      
      toast({
        title: "Action logged",
        description: `Moderation action has been recorded`
      });

      setShowActionDialog(false);
      setSelectedUser('');
      setActionType('');
      setActionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log moderation action",
        variant: "destructive"
      });
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ban': return <UserX className="h-4 w-4 text-red-500" />;
      case 'post_removed': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'role_assigned':
      case 'role_removed': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-primary" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'ban': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'post_removed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'timeout': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'role_assigned':
      case 'role_removed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.moderator_profile?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target_profile?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentActions = logs.slice(0, 5);
  const totalPosts = posts.length;
  const totalUsers = profiles.length;

  if (!canModerate) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need moderator or admin privileges to access this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2">MODERATION DASHBOARD</h1>
            <p className="text-muted-foreground">Monitor and manage community content</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Log Action
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Moderation Action</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label>Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {profile.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Action Type</Label>
                    <Select value={actionType} onValueChange={setActionType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="timeout">Timeout</SelectItem>
                        <SelectItem value="ban">Ban</SelectItem>
                        <SelectItem value="post_removed">Post Removed</SelectItem>
                        <SelectItem value="content_warning">Content Warning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Explain the reason for this action"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleModerationAction} className="w-full">
                    Log Action
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Moderation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-primary/10 border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-xl font-bold text-foreground">{logs.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-gaming-orange/10 border border-gaming-orange/20">
                <AlertTriangle className="h-5 w-5 text-gaming-orange" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-xl font-bold text-foreground">
                  {logs.filter(log => log.action_type === 'warn').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-destructive/10 border border-destructive/20">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bans</p>
                <p className="text-xl font-bold text-foreground">
                  {logs.filter(log => log.action_type === 'ban').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-sm bg-gaming-purple/10 border border-gaming-purple/20">
                <Trash2 className="h-5 w-5 text-gaming-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Removed</p>
                <p className="text-xl font-bold text-foreground">
                  {logs.filter(log => log.action_type === 'delete_post').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Moderation Log */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Moderation Actions</h2>
          
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No moderation actions recorded yet</p>
              </div>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-sm text-white ${getActionColor(log.action_type)}`}>
                      {getActionIcon(log.action_type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {log.action_type.replace('_', ' ')}
                        </Badge>
                        {log.target_profile && (
                          <Badge variant="secondary">
                            <User className="h-3 w-3 mr-1" />
                            {log.target_profile.username}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-foreground mb-2">{log.reason}</p>
                      
                      {log.details && (
                        <details className="mb-2">
                          <summary className="text-sm text-muted-foreground cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>By: {log.moderator_profile?.username || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ModerationDashboard;