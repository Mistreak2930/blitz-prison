import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, UserProfile } from '@/hooks/useProfiles';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Globe, MessageCircle, Settings, Calendar, Trophy, Edit, Mail, Gamepad2, MessageSquareText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProfile, updateProfile } = useProfiles();
  const { sendMessage } = useMessages();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    website: '',
    minecraft_username: '',
    discord_username: ''
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const isOwnProfile = user && (userId === user.id || !userId);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const targetUserId = userId || user?.id;
        if (!targetUserId) {
          navigate('/auth');
          return;
        }

        const profileData = await getProfile(targetUserId);
        if (!profileData) {
          toast({
            title: "Profile not found",
            variant: "destructive"
          });
          navigate('/members');
          return;
        }

        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          minecraft_username: profileData.minecraft_username || '',
          discord_username: profileData.discord_username || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, user?.id]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
      toast({
        title: "Success!",
        description: "Profile updated successfully"
      });
      
      if (user) {
        const updatedProfile = await getProfile(user.id);
        setProfile(updatedProfile);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!profile || !messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await sendMessage(profile.user_id, messageSubject, messageContent);
      toast({
        title: "Message sent!",
        description: `Your message was sent to ${profile.username}`
      });
      setShowMessageModal(false);
      setMessageSubject('');
      setMessageContent('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <User className="h-16 w-16 text-muted-foreground opacity-50" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Profile not found</h2>
          <Button onClick={() => navigate('/members')}>Browse Members</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="overflow-hidden border-2">
        <div className="h-32 bg-gradient-to-r from-primary via-accent to-gaming-purple" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-12">
            {/* Avatar */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="p-6 rounded-lg bg-card border-4 border-background shadow-blocky">
                <User className="h-20 w-20 text-primary" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left mt-4">
              <h1 className="text-3xl font-black bg-gradient-to-r from-primary via-accent to-gaming-purple bg-clip-text text-transparent mb-2">
                {profile.username}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge variant="secondary" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  {profile.reputation} Rep
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <MessageSquareText className="h-3 w-3" />
                  {profile.post_count} Posts
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center md:justify-start">
                {isOwnProfile ? (
                  <Button onClick={() => setEditing(!editing)} className="gap-2">
                    {editing ? <Edit className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                    {editing ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                ) : (
                  <Button onClick={() => setShowMessageModal(true)} className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Profile Information</h2>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Your username"
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Your location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minecraft_username" className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Minecraft Username
                  </Label>
                  <Input
                    id="minecraft_username"
                    value={formData.minecraft_username}
                    onChange={(e) => setFormData({...formData, minecraft_username: e.target.value})}
                    placeholder="Your Minecraft username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="discord_username" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Discord Username
                  </Label>
                  <Input
                    id="discord_username"
                    value={formData.discord_username}
                    onChange={(e) => setFormData({...formData, discord_username: e.target.value})}
                    placeholder="Your Discord username"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleUpdateProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setFormData({
                    username: profile.username || '',
                    bio: profile.bio || '',
                    location: profile.location || '',
                    website: profile.website || '',
                    minecraft_username: profile.minecraft_username || '',
                    discord_username: profile.discord_username || ''
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {profile.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">ABOUT</h3>
                  <p className="text-foreground">{profile.bio}</p>
                </div>
              )}
              
              {(profile.location || profile.website || profile.minecraft_username || profile.discord_username) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">{profile.location}</span>
                      </div>
                    )}
                    
                    {profile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    
                    {profile.minecraft_username && (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-primary" />
                        <div>
                          <span className="text-sm text-muted-foreground">Minecraft: </span>
                          <span className="text-sm font-medium text-foreground">{profile.minecraft_username}</span>
                        </div>
                      </div>
                    )}
                    
                    {profile.discord_username && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <div>
                          <span className="text-sm text-muted-foreground">Discord: </span>
                          <span className="text-sm font-medium text-foreground">{profile.discord_username}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last seen {new Date(profile.last_seen).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {profile.username}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Message subject"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Your message..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSendMessage}>Send Message</Button>
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
