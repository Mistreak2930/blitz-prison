import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServerStatus } from '@/hooks/useServerStatus';
import { Server, RefreshCw, Users, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Servers = () => {
  const { servers, loading, refreshServerStatus } = useServerStatus();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2">SERVERS</h1>
          <p className="text-muted-foreground">Connect to our game servers</p>
        </div>
        <Button onClick={refreshServerStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => (
          <Card key={server.id} className="p-6 hover:shadow-hover transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-sm bg-primary/10 border border-primary/20">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{server.name}</h3>
                  <Badge variant={server.online ? "default" : "destructive"}>
                    {server.online ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>

            {server.online && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span>{server.players}/{server.maxPlayers} players</span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(server.players / server.maxPlayers) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IP Address:</span>
                <div className="flex items-center gap-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {server.ip}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(server.ip)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {server.version && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Version:</span>
                  <span className="text-sm font-medium">{server.version}</span>
                </div>
              )}
            </div>

            {server.motd && (
              <p className="text-sm text-muted-foreground mb-4">{server.motd}</p>
            )}

            <Button 
              className="w-full" 
              disabled={!server.online}
              onClick={() => copyToClipboard(server.ip)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {server.online ? "Copy IP & Join" : "Server Offline"}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">How to Connect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Minecraft Java Edition</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open Minecraft Java Edition</li>
              <li>Click "Multiplayer"</li>
              <li>Click "Add Server"</li>
              <li>Copy and paste the server IP</li>
              <li>Click "Done" and connect!</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Minecraft Bedrock Edition</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open Minecraft Bedrock Edition</li>
              <li>Go to "Play" → "Servers"</li>
              <li>Scroll down and click "Add Server"</li>
              <li>Enter server name and IP address</li>
              <li>Click "Save" and join!</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Servers;