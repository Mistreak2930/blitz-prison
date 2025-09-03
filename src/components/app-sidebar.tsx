import { Home, Users, MessageSquare, Newspaper, Megaphone, Server, Shield, Settings, LogOut, LogIn } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useRoles } from "@/hooks/useRoles";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Forums", url: "/forums", icon: MessageSquare },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
  { title: "Members", url: "/members", icon: Users },
  { title: "Servers", url: "/servers", icon: Server },
];

const userItems = [
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { hasRole } = useRoles();
  const { toast } = useToast();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/50";

  const canModerate = isAdmin || (user && hasRole(user.id, 'moderator'));
  
  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
    }
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-60"} border-r border-border`}
      collapsible="icon"
    >
      <SidebarContent className="bg-background">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-primary font-black text-lg ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? "BN" : "BLITZ NETWORK"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'text-center' : ''}>
              {isCollapsed ? "U" : "User"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin/Moderation Section */}
        {(isAdmin || canModerate) && (
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? 'text-center' : ''}>
              {isCollapsed ? "A" : "Admin"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canModerate && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/moderation" className={getNavCls}>
                        <Shield className="h-4 w-4" />
                        {!isCollapsed && <span className="font-medium">Moderation</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin" className={getNavCls}>
                        <Settings className="h-4 w-4" />
                        {!isCollapsed && <span className="font-medium">Admin Panel</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Auth Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {user ? (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/auth" className={getNavCls}>
                      <LogIn className="h-4 w-4" />
                      {!isCollapsed && <span className="font-medium">Login</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}