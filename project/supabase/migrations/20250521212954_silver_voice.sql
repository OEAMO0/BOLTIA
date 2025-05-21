/*
  # Create game rooms and player sessions tables

  1. New Tables
    - `game_rooms`
      - `id` (uuid, primary key)
      - `game_type` (text) - Type of game (e.g., 'rockPaperScissors')
      - `status` (text) - Room status ('waiting', 'playing', 'finished')
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
      - `player1_id` (uuid, references auth.users)
      - `player2_id` (uuid, references auth.users)
      - `current_state` (jsonb) - Current game state
      - `winner_id` (uuid, references auth.users)
    
    - `online_status`
      - `id` (uuid, primary key, references auth.users)
      - `last_seen` (timestamp)
      - `status` (text) - Player status ('online', 'in_game', 'offline')
      - `current_room` (uuid, references game_rooms)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create game rooms table
CREATE TABLE IF NOT EXISTS game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  player1_id uuid REFERENCES auth.users NOT NULL,
  player2_id uuid REFERENCES auth.users,
  current_state jsonb DEFAULT '{}',
  winner_id uuid REFERENCES auth.users,
  
  CONSTRAINT valid_status CHECK (status IN ('waiting', 'playing', 'finished'))
);

-- Create online status table
CREATE TABLE IF NOT EXISTS online_status (
  id uuid PRIMARY KEY REFERENCES auth.users,
  last_seen timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'online',
  current_room uuid REFERENCES game_rooms,
  
  CONSTRAINT valid_status CHECK (status IN ('online', 'in_game', 'offline'))
);

-- Enable RLS
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_status ENABLE ROW LEVEL SECURITY;

-- Policies for game_rooms
CREATE POLICY "Users can view available game rooms"
  ON game_rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create game rooms"
  ON game_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Players can update their game rooms"
  ON game_rooms
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (created_by, player1_id, COALESCE(player2_id, '00000000-0000-0000-0000-000000000000'))
  );

-- Policies for online_status
CREATE POLICY "Users can view online status"
  ON online_status
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own status"
  ON online_status
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);