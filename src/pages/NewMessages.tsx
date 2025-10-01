import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChats, useChatMessages, useChatRequests } from '@/hooks/useChats';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Users, 
  User, 
  Clock, 
  Smile,
  Trash2,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const NewMessages = () => {
  const { conversations, loading: conversationsLoading, createDirectChat, createGroupChat } = useChats();
  const { requests, sendChatRequest, respondToRequest } = useChatRequests();
  const { profiles } = useProfiles();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [groupChatData, setGroupChatData] = useState({
    name: '',
    participants: [] as string[]
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, deleteMessage, addReaction, removeReaction } = useChatMessages(selectedConversation || undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error sending message",
        variant: "destructive"
      });
    }
  };

  const handleStartDirectChat = async (recipientId: string) => {
    try {
      await sendChatRequest(recipientId, 'Would like to start a chat with you');
      toast({
        title: "Chat request sent",
        description: "The user will receive your request"
      });
      setShowNewChat(false);
    } catch (error: any) {
      toast({
        title: "Error sending request",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateGroupChat = async () => {
    if (!groupChatData.name.trim() || groupChatData.participants.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide a name and select participants",
        variant: "destructive"
      });
      return;
    }

    try {
      const conversation = await createGroupChat(groupChatData.name, groupChatData.participants);
      if (conversation) {
        setSelectedConversation(conversation.id);
      }
      setShowGroupChat(false);
      setGroupChatData({ name: '', participants: [] });
      toast({
        title: "Group chat created",
        description: "Your group chat is ready"
      });
    } catch (error) {
      toast({
        title: "Error creating group chat",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    try {
      await respondToRequest(requestId, 'accepted');
      // Create the chat after accepting the request
      setTimeout(async () => {
        try {
          const conversation = await createDirectChat(senderId);
          if (conversation) {
            setSelectedConversation(conversation.id);
          }
        } catch (error) {
          console.error('Error creating chat:', error);
        }
      }, 500);
      
      toast({
        title: "Chat request accepted",
        description: "Chat has been started"
      });
    } catch (error) {
      toast({
        title: "Error accepting request",
        variant: "destructive"
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await respondToRequest(requestId, 'declined');
      toast({
        title: "Chat request declined"
      });
    } catch (error) {
      toast({
        title: "Error declining request",
        variant: "destructive"
      });
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const otherParticipants = selectedConversationData?.participants?.filter(p => p.user_id !== user?.id) || [];

  const getConversationName = (conversation: any) => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    } else {
      const otherParticipant = conversation.participants?.find((p: any) => p.user_id !== user?.id);
      return otherParticipant?.profile?.username || 'Unknown User';
    }
  };

  const reactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡'];

  if (conversationsLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8 text-muted-foreground">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">MESSAGES</h1>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <MessageCircle className="h-3 w-3 mr-1" />
              {conversations.length} Chats
            </Badge>
            {requests.length > 0 && (
              <Badge className="bg-primary">
                {requests.length} Requests
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Label>Select user to chat with:</Label>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {profiles
                    .filter(p => p.user_id !== user?.id)
                    .map((profile) => (
                    <Button
                      key={profile.user_id}
                      variant="outline"
                      className="justify-start p-3 h-auto"
                      onClick={() => handleStartDirectChat(profile.user_id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{profile.username}</div>
                        <div className="text-xs text-muted-foreground">
                          Send chat request
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showGroupChat} onOpenChange={setShowGroupChat}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Group Chat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group Chat</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={groupChatData.name}
                    onChange={(e) => setGroupChatData({...groupChatData, name: e.target.value})}
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <Label>Select Participants</Label>
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (!groupChatData.participants.includes(value)) {
                        setGroupChatData({
                          ...groupChatData, 
                          participants: [...groupChatData.participants, value]
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add participants" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles
                        .filter(p => p.user_id !== user?.id && !groupChatData.participants.includes(p.user_id))
                        .map((profile) => (
                        <SelectItem key={profile.user_id} value={profile.user_id}>
                          {profile.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {groupChatData.participants.map(participantId => {
                      const profile = profiles.find(p => p.user_id === participantId);
                      return (
                        <Badge key={participantId} variant="secondary">
                          {profile?.username}
                          <button
                            onClick={() => setGroupChatData({
                              ...groupChatData,
                              participants: groupChatData.participants.filter(id => id !== participantId)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <Button onClick={handleCreateGroupChat} className="w-full">
                  Create Group Chat
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Chat Requests */}
      {requests.length > 0 && (
        <Card className="p-4">
          <h3 className="font-bold text-foreground mb-4">Chat Requests</h3>
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      {request.sender_profile?.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.message || 'Wants to start a chat'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptRequest(request.id, request.sender_id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeclineRequest(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-bold text-foreground mb-4">Chats</h2>
            
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No chats yet</p>
                    <p className="text-xs">Start a new chat to get going</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <Card
                      key={conversation.id}
                      className={`p-3 cursor-pointer transition-all hover:shadow-hover ${
                        selectedConversation === conversation.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-sm bg-card border border-border">
                          {conversation.is_group ? (
                            <Users className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {getConversationName(conversation)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {conversation.is_group
                              ? `${conversation.participants?.length} members`
                              : 'Direct message'
                            }
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(conversation.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
        
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-96">
            {selectedConversationData ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">
                        {getConversationName(selectedConversationData)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversationData.is_group
                          ? `${otherParticipants.length + 1} members`
                          : otherParticipants[0]?.profile?.username || 'Direct message'
                        }
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${
                          message.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        } rounded-lg p-3 group`}>
                          {message.sender_id !== user?.id && (
                            <p className="text-xs font-medium mb-1">
                              {message.sender_profile?.username}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(
                                message.reactions.reduce((acc, reaction) => {
                                  acc[reaction.reaction] = (acc[reaction.reaction] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([reaction, count]) => (
                                <button
                                  key={reaction}
                                  className="text-xs bg-background/50 rounded px-1"
                                  onClick={() => {
                                    const userReaction = message.reactions?.find(
                                      r => r.reaction === reaction && r.user_id === user?.id
                                    );
                                    if (userReaction) {
                                      removeReaction(message.id, reaction);
                                    } else {
                                      addReaction(message.id, reaction);
                                    }
                                  }}
                                >
                                  {reaction} {count}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              {reactions.map(reaction => (
                                <button
                                  key={reaction}
                                  className="text-xs hover:bg-background/50 rounded px-1"
                                  onClick={() => addReaction(message.id, reaction)}
                                >
                                  {reaction}
                                </button>
                              ))}
                            </div>
                            {message.sender_id === user?.id && (
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="text-xs text-destructive hover:bg-destructive/10 rounded px-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-12 text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a chat</h3>
                  <p>Choose a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewMessages;