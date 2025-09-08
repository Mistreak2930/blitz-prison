import { useState } from "react";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Shield, UserPlus, UserMinus, Users, Settings, Crown, Activity, AlertTriangle, FileText, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { useModerationLogs } from '@/hooks/useModerationLogs';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { profiles, loading, assignRole, removeRole, hasRole } = useRoles();
  const { logs, logAction } = useModerationLogs();
  const { profiles: allProfiles } = useProfiles();
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [actionReason, setActionReason] = useState('');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [actionType, setActionType] = useState<'assign' | 'remove'>('assign');
  const { toast } = useToast();

  const handleRoleAction = async () => {
    if (!selectedUser || !selectedRole || !actionReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (actionType === 'assign') {
        await assignRole(selectedUser, selectedRole);
        await logAction(selectedUser, 'role_assigned', actionReason, { role: selectedRole });
      } else {
        await removeRole(selectedUser, selectedRole);
        await logAction(selectedUser, 'role_removed', actionReason, { role: selectedRole });
      }

      toast({
        title: `Role ${actionType === 'assign' ? 'assigned' : 'removed'}`,
        description: `Successfully ${actionType === 'assign' ? 'assigned' : 'removed'} ${selectedRole} role`
      });

      setShowRoleDialog(false);
      setSelectedUser('');
      setSelectedRole('user');
      setActionReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${actionType} role`,
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'moderator': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'news_updater': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'announcements_manager': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'dev': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'moderator': return <Shield className="h-3 w-3" />;
      case 'news_updater': return <FileText className="h-3 w-3" />;
      case 'announcements_manager': return <UserCheck className="h-3 w-3" />;
      case 'dev': return <Settings className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const recentLogs = logs.slice(0, 10);
  const adminCount = profiles.filter(p => hasRole(p.user_id, 'admin')).length;
  const moderatorCount = profiles.filter(p => hasRole(p.user_id, 'moderator')).length;
  const totalUsers = allProfiles.length;

  if (adminLoading || loading) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
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
            <h1 className="text-4xl font-black text-foreground mb-2">ADMIN DASHBOARD</h1>
            <p className="text-muted-foreground">Manage users, roles, and system settings</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Roles
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage User Roles</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={actionType === 'assign' ? 'default' : 'outline'}
                      onClick={() => setActionType('assign')}
                      className="flex-1"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Role
                    </Button>
                    <Button
                      variant={actionType === 'remove' ? 'default' : 'outline'}
                      onClick={() => setActionType('remove')}
                      className="flex-1"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Role
                    </Button>
                  </div>

                  <div>
                    <Label>Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {allProfiles.map((profile) => (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {profile.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Select Role</Label>
                    <Select value={selectedRole} onValueChange={(value: AppRole) => setSelectedRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="dev">Developer</SelectItem>
                        <SelectItem value="news_updater">News Updater</SelectItem>
                        <SelectItem value="announcements_manager">Announcements Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Explain why this action is necessary"
                    />
                  </div>

                  <Button onClick={handleRoleAction} className="w-full">
                    {actionType === 'assign' ? 'Assign Role' : 'Remove Role'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-3xl font-bold text-foreground">{adminCount}</p>
              </div>
              <Crown className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moderators</p>
                <p className="text-3xl font-bold text-foreground">{moderatorCount}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Actions</p>
                <p className="text-3xl font-bold text-foreground">{recentLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Roles */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">User Roles</h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {profiles.map((profile) => {
                const roles = profile.roles || [];
                return (
                  <div key={profile.user_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-sm">
                    <div>
                      <p className="font-medium text-foreground">{profile.username}</p>
                      <div className="flex gap-1 mt-1">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {getRoleIcon(role)}
                              <span className="ml-1 capitalize">{role.replace('_', ' ')}</span>
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(allProfiles.find(p => p.user_id === profile.user_id)?.post_count) || 0} posts
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity Logs */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-muted/50 rounded-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {log.action_type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.reason}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>By: {log.moderator_profile?.username}</span>
                          {log.target_profile?.username && (
                            <span>• Target: {log.target_profile.username}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(log.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
