import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type GameRoom = {
  id: string;
  game_type: string;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  created_by: string;
  player1_id: string;
  player2_id: string | null;
  current_state: any;
  winner_id: string | null;
};

export type OnlineStatus = {
  id: string;
  last_seen: string;
  status: 'online' | 'in_game' | 'offline';
  current_room: string | null;
};