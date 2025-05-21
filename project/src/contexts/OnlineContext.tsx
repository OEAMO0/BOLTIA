import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, GameRoom, OnlineStatus } from '../lib/supabase';

interface OnlineContextType {
  onlinePlayers: OnlineStatus[];
  availableRooms: GameRoom[];
  createRoom: (gameType: string) => Promise<GameRoom>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
}

const OnlineContext = createContext<OnlineContextType | undefined>(undefined);

export const OnlineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlinePlayers, setOnlinePlayers] = useState<OnlineStatus[]>([]);
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);

  useEffect(() => {
    // Subscribe to online players
    const onlineSubscription = supabase
      .channel('online_players')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'online_status'
      }, payload => {
        setOnlinePlayers(current => {
          const updated = [...current];
          const index = updated.findIndex(p => p.id === payload.new.id);
          if (index >= 0) {
            updated[index] = payload.new as OnlineStatus;
          } else {
            updated.push(payload.new as OnlineStatus);
          }
          return updated;
        });
      })
      .subscribe();

    // Subscribe to game rooms
    const roomsSubscription = supabase
      .channel('game_rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms'
      }, payload => {
        setAvailableRooms(current => {
          const updated = [...current];
          const index = updated.findIndex(r => r.id === payload.new.id);
          if (index >= 0) {
            updated[index] = payload.new as GameRoom;
          } else {
            updated.push(payload.new as GameRoom);
          }
          return updated.filter(room => room.status === 'waiting');
        });
      })
      .subscribe();

    // Initial fetch of online players and rooms
    const fetchInitialData = async () => {
      const [{ data: players }, { data: rooms }] = await Promise.all([
        supabase.from('online_status').select('*').eq('status', 'online'),
        supabase.from('game_rooms').select('*').eq('status', 'waiting')
      ]);

      if (players) setOnlinePlayers(players);
      if (rooms) setAvailableRooms(rooms);
    };

    fetchInitialData();

    // Update online status periodically
    const updateOnlineStatus = async () => {
      const user = supabase.auth.getUser();
      if (user) {
        await supabase.from('online_status').upsert({
          id: (await user).data.user?.id,
          last_seen: new Date().toISOString(),
          status: 'online'
        });
      }
    };

    const interval = setInterval(updateOnlineStatus, 30000);
    updateOnlineStatus();

    return () => {
      clearInterval(interval);
      onlineSubscription.unsubscribe();
      roomsSubscription.unsubscribe();
    };
  }, []);

  const createRoom = async (gameType: string): Promise<GameRoom> => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        game_type: gameType,
        created_by: user.data.user.id,
        player1_id: user.data.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const joinRoom = async (roomId: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('game_rooms')
      .update({
        player2_id: user.data.user.id,
        status: 'playing'
      })
      .eq('id', roomId)
      .eq('status', 'waiting');

    if (error) throw error;
  };

  const leaveRoom = async (roomId: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('game_rooms')
      .update({
        status: 'finished'
      })
      .eq('id', roomId)
      .or(`player1_id.eq.${user.data.user.id},player2_id.eq.${user.data.user.id}`);

    if (error) throw error;
  };

  return (
    <OnlineContext.Provider value={{
      onlinePlayers,
      availableRooms,
      createRoom,
      joinRoom,
      leaveRoom
    }}>
      {children}
    </OnlineContext.Provider>
  );
};

export const useOnline = () => {
  const context = useContext(OnlineContext);
  if (context === undefined) {
    throw new Error('useOnline must be used within an OnlineProvider');
  }
  return context;
};