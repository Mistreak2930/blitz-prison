import { useState, useEffect } from 'react';

export interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  type: 'minecraft' | 'discord';
  online: boolean;
  players: number;
  maxPlayers: number;
  version?: string;
  motd?: string;
}

export const useServerStatus = () => {
  const [servers, setServers] = useState<Server[]>([
    {
      id: '1',
      name: 'Blitz Prison',
      ip: 'prison.blitznetwork.net',
      port: 25565,
      type: 'minecraft',
      online: true,
      players: 156,
      maxPlayers: 500,
      version: '1.20.4',
      motd: 'Welcome to Blitz Prison Server!'
    },
    {
      id: '2', 
      name: 'Blitz Skyblock',
      ip: 'skyblock.blitznetwork.net',
      port: 25565,
      type: 'minecraft',
      online: true,
      players: 89,
      maxPlayers: 300,
      version: '1.20.4',
      motd: 'Build your island empire!'
    },
    {
      id: '3',
      name: 'Blitz Creative',
      ip: 'creative.blitznetwork.net', 
      port: 25565,
      type: 'minecraft',
      online: false,
      players: 0,
      maxPlayers: 200,
      version: '1.20.4',
      motd: 'Currently under maintenance'
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Simulate server status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServers(prev => prev.map(server => ({
        ...server,
        players: server.online ? Math.floor(Math.random() * server.maxPlayers) : 0
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshServerStatus = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return {
    servers,
    loading,
    refreshServerStatus
  };
};