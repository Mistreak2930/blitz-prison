import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { User, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";

const Members = () => {
  const { profiles, loading } = useProfiles();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-4">MEMBERS</h1>
          <p className="text-muted-foreground text-lg">
            Connect with other members of the Blitz Prison community.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading members...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No members found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((member) => (
              <Card key={member.id} className="p-4 shadow-blocky hover:shadow-hover transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-sm bg-card border-2 border-border">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{member.username}</h3>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                   <div>Posts: {member.post_count || 0}</div>
                   <div>Rep: {member.reputation || 0}</div>
                 </div>
                
                 <div className="flex gap-2">
                   {user && user.id !== member.user_id && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => navigate(`/profile/${member.user_id}`)}
                     >
                       <User className="h-4 w-4 mr-2" />
                       View Profile
                     </Button>
                   )}
                   {user && user.id === member.user_id && (
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1"
                       onClick={() => navigate('/profile')}
                     >
                       <Settings className="h-4 w-4 mr-2" />
                       Edit Profile
                     </Button>
                   )}
                 </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Members;