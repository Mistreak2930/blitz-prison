import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/navigation';
import { useModerationLogs } from '@/hooks/useModerationLogs';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Eye, Ban, MessageSquareX, Trash2, Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsAdmin } from '@/hooks/useUserRole';

const ModerationDashboard = () => {
  const { logs, loading, logAction } = useModerationLogs();
  const { profiles } = useProfiles();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useIsAdmin();
  const { hasRole } = useRoles();
  
  const [showLogModal, setShowLogModal] = useState(false);
  const [logData, setLogData] = useState({
    targetUserId: '',
    actionType: '',
    reason: '',
    details: ''
  });

  const canModerate = isAdmin || (user && hasRole(user.id, 'moderator'));

  const handleLogAction = async () => {
    if (!logData.actionType || !logData.reason.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in action type and reason",
        variant: "destructive"
      });
      return;
    }

    try {
      await logAction(
        logData.targetUserId || null,
        logData.actionType,
        logData.reason,
        logData.details ? JSON.parse(logData.details) : null
      );
      
      toast({
        title: "Action logged",
        description: "Moderation action has been recorded"
      });
      
      setShowLogModal(false);
      setLogData({ targetUserId: '', actionType: '', reason: '', details: '' });
    } catch (error) {
      toast({
        title: "Error logging action",
        variant: "destructive"
      });
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'warn': return <AlertTriangle className="h-4 w-4" />;
      case 'mute': return <MessageSquareX className="h-4 w-4" />;
      case 'ban': return <Ban className="h-4 w-4" />;
      case 'delete_post': return <Trash2 className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'warn': return 'bg-gaming-orange';
      case 'mute': return 'bg-gaming-purple';
      case 'ban': return 'bg-destructive';
      case 'delete_post': return 'bg-muted';
      default: return 'bg-primary';
    }
  };

  if (!canModerate) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-8 text-muted-foreground">Loading moderation data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-4">MODERATION DASHBOARD</h1>
            <p className="text-muted-foreground text-lg">
              Manage community moderation and track moderation actions.
            </p>
          </div>
          
          <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Log Action
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Moderation Action</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="actionType">Action Type</Label>
                  <Select value={logData.actionType} onValueChange={(value) => 
                    setLogData({...logData, actionType: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="mute">Mute User</SelectItem>
                      <SelectItem value="ban">Ban User</SelectItem>
                      <SelectItem value="delete_post">Delete Post</SelectItem>
                      <SelectItem value="edit_content">Edit Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="targetUser">Target User (Optional)</Label>
                  <Select value={logData.targetUserId} onValueChange={(value) => 
                    setLogData({...logData, targetUserId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user (optional)" />
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
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={logData.reason}
                    onChange={(e) => setLogData({...logData, reason: e.target.value})}
                    placeholder="Reason for this action..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="details">Additional Details (JSON)</Label>
                  <Textarea
                    id="details"
                    value={logData.details}
                    onChange={(e) => setLogData({...logData, details: e.target.value})}
                    placeholder='{"post_id": "123", "duration": "24h"}'
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLogModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLogAction}>
                    <Shield className="h-4 w-4 mr-2" />
                    Log Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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