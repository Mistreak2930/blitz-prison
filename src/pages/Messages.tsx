import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Inbox, Mail, User, Clock, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const Messages = () => {
  const { messages, loading, sendMessage, markAsRead, getUnreadCount } = useMessages();
  const { profiles } = useProfiles();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    content: ''
  });

  const handleSendMessage = async () => {
    if (!composeData.recipientId || !composeData.subject.trim() || !composeData.content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendMessage(composeData.recipientId, composeData.subject, composeData.content);
      toast({
        title: "Message sent",
        description: "Your message has been delivered"
      });
      setShowCompose(false);
      setComposeData({ recipientId: '', subject: '', content: '' });
    } catch (error) {
      toast({
        title: "Error sending message",
        variant: "destructive"
      });
    }
  };

  const handleMessageClick = async (messageId: string) => {
    setSelectedMessage(messageId);
    const message = messages.find(m => m.id === messageId);
    if (message && message.recipient_id === user?.id && !message.read) {
      await markAsRead(messageId);
    }
  };

  const selectedMessageData = messages.find(m => m.id === selectedMessage);
  const unreadCount = getUnreadCount();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-4">MESSAGES</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Inbox className="h-3 w-3 mr-1" />
                {messages.length} Total
              </Badge>
              {unreadCount > 0 && (
                <Badge className="bg-destructive">
                  <Mail className="h-3 w-3 mr-1" />
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
          </div>
          
          <Dialog open={showCompose} onOpenChange={setShowCompose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Compose New Message</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select value={composeData.recipientId} onValueChange={(value) => 
                    setComposeData({...composeData, recipientId: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles
                        .filter(p => p.user_id !== user?.id)
                        .map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                    placeholder="Message subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={composeData.content}
                    onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                    placeholder="Your message..."
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-bold text-foreground mb-4">Inbox</h2>
              
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isFromCurrentUser = message.sender_id === user?.id;
                    const otherProfile = isFromCurrentUser 
                      ? message.recipient_profile 
                      : message.sender_profile;
                    const isUnread = message.recipient_id === user?.id && !message.read;
                    
                    return (
                      <Card
                        key={message.id}
                        className={`p-3 cursor-pointer transition-all hover:shadow-hover ${
                          selectedMessage === message.id 
                            ? 'border-primary' 
                            : isUnread 
                              ? 'border-accent' 
                              : ''
                        }`}
                        onClick={() => handleMessageClick(message.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1 rounded-sm bg-card border border-border">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm font-medium truncate ${
                                isUnread ? 'font-bold' : ''
                              }`}>
                                {isFromCurrentUser ? 'To: ' : 'From: '}
                                {otherProfile?.username || 'Unknown'}
                              </p>
                              {isUnread && (
                                <div className="h-2 w-2 bg-accent rounded-full flex-shrink-0" />
                              )}
                            </div>
                            
                            <p className={`text-xs mb-1 line-clamp-1 ${
                              isUnread ? 'font-semibold' : 'text-muted-foreground'
                            }`}>
                              {message.subject}
                            </p>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(message.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
          
          {/* Message Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {selectedMessageData ? (
                <div>
                  <div className="border-b border-border pb-4 mb-4">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      {selectedMessageData.subject}
                    </h2>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          From: {selectedMessageData.sender_profile?.username || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(selectedMessageData.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-foreground whitespace-pre-wrap">
                      {selectedMessageData.content}
                    </p>
                  </div>
                  
                  {selectedMessageData.sender_id !== user?.id && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <Button
                        onClick={() => {
                          setComposeData({
                            recipientId: selectedMessageData.sender_id,
                            subject: `Re: ${selectedMessageData.subject}`,
                            content: ''
                          });
                          setShowCompose(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a message</h3>
                  <p>Choose a message from the inbox to read it</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;