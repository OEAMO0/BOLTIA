import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { motion } from 'framer-motion';

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { player, updatePlayerName, resetStats } = usePlayer();
  const [newName, setNewName] = useState(player.name);
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('profile');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      updatePlayerName(newName.trim());
    }
  };

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all game statistics?')) {
      resetStats();
    }
  };

  const getTotalStats = () => {
    const stats = player.stats;
    return {
      gamesPlayed: Object.values(stats).reduce((sum, game) => sum + game.gamesPlayed, 0),
      wins: Object.values(stats).reduce((sum, game) => sum + game.wins, 0),
      losses: Object.values(stats).reduce((sum, game) => sum + game.losses, 0),
      draws: Object.values(stats).reduce((sum, game) => sum + game.draws, 0),
    };
  };

  const totalStats = getTotalStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Player Profile</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
            <button
              className={`py-2 px-4 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'stats'
                  ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </div>

          {activeTab === 'profile' ? (
            <div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="playerName"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Player Name
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    maxLength={15}
                    autoComplete="off"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Player ID
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={player.id}
                      readOnly
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    This is your unique player identifier
                  </p>
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleResetStats}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors text-sm font-medium"
                  >
                    Reset Stats
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Games Played</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStats.gamesPlayed}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium">Wins</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStats.wins}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">Losses</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStats.losses}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Draws</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStats.draws}</p>
                </div>
              </div>
              
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Game Statistics</h3>
              
              <div className="space-y-3">
                {Object.entries(player.stats).map(([game, stats]) => {
                  const formattedGame = game.replace(/([A-Z])/g, ' $1').trim();
                  const winRate = stats.gamesPlayed > 0 
                    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
                    : 0;
                    
                  return (
                    <div key={game} className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-slate-700 dark:text-slate-300">
                          {formattedGame}
                        </h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {stats.gamesPlayed} games
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">{stats.wins} W</span>
                        <span className="text-blue-600 dark:text-blue-400">{stats.draws} D</span>
                        <span className="text-red-600 dark:text-red-400">{stats.losses} L</span>
                        <span className="font-medium">{winRate}% win rate</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;