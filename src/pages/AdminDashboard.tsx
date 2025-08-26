import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import { Shield, UserPlus, UserMinus, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useRoles, type AppRole } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { profiles, loading, assignRole, removeRole } = useRoles();
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const { toast } = useToast();

  const roleColors = {
    admin: "destructive",
    moderator: "secondary",
    dev: "default",
    news_updater: "outline",
    announcements_manager: "outline",
    user: "secondary"
  } as const;

  const availableRoles: AppRole[] = ['admin', 'moderator', 'dev', 'news_updater', 'announcements_manager', 'user'];

  const handleAssignRole = async (userId: string, role: AppRole) => {
    try {
      await assignRole(userId, role);
      toast({
        title: "Role assigned",
        description: `Successfully assigned ${role} role`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    try {
      await removeRole(userId, role);
      toast({
        title: "Role removed",
        description: `Successfully removed ${role} role`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove role",
        variant: "destructive"
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">ADMIN DASHBOARD</h1>
          <p className="text-muted-foreground text-lg">
          Manage the Blitz Community
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Role Management */}
          <Card className="shadow-blocky">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Role Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-foreground">{profile.username}</h3>
                        <p className="text-xs text-muted-foreground">
                          User ID: {profile.user_id.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {profile.roles.length > 0 ? (
                          profile.roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant={roleColors[role] || "secondary"}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">No roles</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={selectedRole} onValueChange={(value: AppRole) => setSelectedRole(value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAssignRole(profile.user_id, selectedRole)}
                        disabled={profile.roles.includes(selectedRole)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map((role) => (
                        <Button
                          key={role}
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveRole(profile.user_id, role)}
                          className="text-xs"
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Remove {role}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="shadow-blocky">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Blitz Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Database Stats</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Total Users: {profiles.length}</p>
                    <p>Admins: {profiles.filter(p => p.roles.includes('admin')).length}</p>
                    <p>Moderators: {profiles.filter(p => p.roles.includes('moderator')).length}</p>
                    <p>Developers: {profiles.filter(p => p.roles.includes('dev')).length}</p>
                    <p>News Updaters: {profiles.filter(p => p.roles.includes('news_updater')).length}</p>
                    <p>Announcement Managers: {profiles.filter(p => p.roles.includes('announcements_manager')).length}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Role Descriptions</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Admin:</strong> Full system access</p>
                    <p><strong>Moderator:</strong> Forum moderation</p>
                    <p><strong>Dev:</strong> Development access</p>
                    <p><strong>News Updater:</strong> Can create/edit news</p>
                    <p><strong>Announcements Manager:</strong> Can create/edit announcements</p>
                    <p><strong>User:</strong> Basic user access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
