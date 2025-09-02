import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, UserProfile } from '@/hooks/useProfiles';
import { useMessages } from '@/hooks/useMessages';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Globe, MessageCircle, Settings, Calendar, Trophy, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
          navigate('/profile');
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
        // Only update form data if not currently editing
        if (!editing) {
          setFormData({
            username: profileData.username || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            website: profileData.website || '',
            minecraft_username: profileData.minecraft_username || '',
            discord_username: profileData.discord_username || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, user?.id]); // Removed dependencies that cause unnecessary re-renders

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved"
      });
      
      // Reload profile data
      if (user) {
        const updatedProfile = await getProfile(user.id);
        setProfile(updatedProfile);
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!profile || !messageSubject.trim() || !messageContent.trim()) return;
    
    try {
      await sendMessage(profile.user_id, messageSubject, messageContent);
      toast({
        title: "Message sent",
        description: `Your message was sent to ${profile.username}`
      });
      setShowMessageModal(false);
      setMessageSubject('');
      setMessageContent('');
    } catch (error) {
      toast({
        title: "Error sending message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-8 text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-8 text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6 shadow-blocky">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="p-4 rounded-sm bg-card border-2 border-border">
                <User className="h-16 w-16 text-primary" />
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-black text-foreground">{profile.username}</h1>
                <p className="text-muted-foreground">
                  Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
                
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="secondary">
                    <Trophy className="h-3 w-3 mr-1" />
                    {profile.reputation} Rep
                  </Badge>
                  <Badge variant="secondary">
                    {profile.post_count} Posts
                  </Badge>
                </div>
              </div>
              
              {!isOwnProfile ? (
                <Button onClick={() => setShowMessageModal(true)} className="w-full md:w-auto">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              ) : (
                <Button onClick={() => setEditing(!editing)} className="w-full md:w-auto">
                  {editing ? <Edit3 className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  {editing ? 'Cancel' : 'Edit Profile'}
                </Button>
              )}
            </div>
            
            {/* Profile Details */}
            <div className="flex-1 space-y-6">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Your location"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="minecraft_username">Minecraft Username</Label>
                      <Input
                        id="minecraft_username"
                        value={formData.minecraft_username}
                        onChange={(e) => setFormData({...formData, minecraft_username: e.target.value})}
                        placeholder="Your Minecraft username"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discord_username">Discord Username</Label>
                      <Input
                        id="discord_username"
                        value={formData.discord_username}
                        onChange={(e) => setFormData({...formData, discord_username: e.target.value})}
                        placeholder="Your Discord username"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.bio && (
                    <div>
                      <h3 className="font-bold text-foreground mb-2">About</h3>
                      <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{profile.location}</span>
                      </div>
                    )}
                    
                    {profile.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                    
                    {profile.minecraft_username && (
                      <div>
                        <span className="text-muted-foreground">Minecraft: </span>
                        <span className="font-medium">{profile.minecraft_username}</span>
                      </div>
                    )}
                    
                    {profile.discord_username && (
                      <div>
                        <span className="text-muted-foreground">Discord: </span>
                        <span className="font-medium">{profile.discord_username}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Last seen {new Date(profile.last_seen).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Send Message to {profile.username}
              </h2>
              
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
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
