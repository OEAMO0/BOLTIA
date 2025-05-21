import React, { createContext, useState, useEffect, useContext } from 'react';

// Types for player data
interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

interface GameStats {
  rockPaperScissors: PlayerStats;
  wordGuessing: PlayerStats;
  ninjaReflex: PlayerStats;
  memoryMatch: PlayerStats;
}

interface PlayerData {
  id: string;
  name: string;
  createdAt: number;
  stats: GameStats;
}

interface PlayerContextType {
  player: PlayerData;
  updatePlayerName: (name: string) => void;
  updateStats: (game: keyof GameStats, result: 'win' | 'loss' | 'draw') => void;
  resetStats: () => void;
}

// Default player stats
const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

// Create a new player ID
const createPlayerId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Create default player data
const createDefaultPlayer = (): PlayerData => {
  return {
    id: createPlayerId(),
    name: `Player${Math.floor(Math.random() * 10000)}`,
    createdAt: Date.now(),
    stats: {
      rockPaperScissors: { ...defaultStats },
      wordGuessing: { ...defaultStats },
      ninjaReflex: { ...defaultStats },
      memoryMatch: { ...defaultStats },
    },
  };
};

// Create context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<PlayerData>(() => {
    // Try to load player data from localStorage
    const savedPlayer = localStorage.getItem('gameHubPlayer');
    if (savedPlayer) {
      try {
        return JSON.parse(savedPlayer);
      } catch (error) {
        console.error('Failed to parse player data', error);
        return createDefaultPlayer();
      }
    }
    return createDefaultPlayer();
  });

  // Save player data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gameHubPlayer', JSON.stringify(player));
  }, [player]);

  // Update player name
  const updatePlayerName = (name: string) => {
    setPlayer(prev => ({ ...prev, name }));
  };

  // Update game stats
  const updateStats = (game: keyof GameStats, result: 'win' | 'loss' | 'draw') => {
    setPlayer(prev => {
      const gameStats = { ...prev.stats[game] };
      gameStats.gamesPlayed += 1;
      
      if (result === 'win') {
        gameStats.wins += 1;
      } else if (result === 'loss') {
        gameStats.losses += 1;
      } else {
        gameStats.draws += 1;
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          [game]: gameStats,
        },
      };
    });
  };

  // Reset all stats
  const resetStats = () => {
    setPlayer(prev => ({
      ...prev,
      stats: {
        rockPaperScissors: { ...defaultStats },
        wordGuessing: { ...defaultStats },
        ninjaReflex: { ...defaultStats },
        memoryMatch: { ...defaultStats },
      },
    }));
  };

  return (
    <PlayerContext.Provider value={{ player, updatePlayerName, updateStats, resetStats }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Hook for using player context
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};