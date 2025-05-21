import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, BookOpen, Zap, Grid3X3 } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  delay: number;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, path, color, delay }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 * delay, duration: 0.4 }}
      whileHover={{ y: -5, transition: { delay: 0 } }}
    >
      <Link to={path} className="block h-full">
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden h-full border-t-4 ${color} transition-all duration-300 hover:shadow-xl`}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full ${color.replace('border-', 'bg-')} bg-opacity-20 dark:bg-opacity-30 flex items-center justify-center mr-3`}>
                {icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Play Now</span>
                <span className="text-sm text-purple-600 dark:text-purple-400">→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const GameHub: React.FC = () => {
  const { player } = usePlayer();
  
  useEffect(() => {
    document.title = 'GameHub - Multiple Games in One Place';
  }, []);

  const games = [
    {
      id: 'rock-paper-scissors',
      title: 'Rock Paper Scissors',
      description: 'Play the classic hand game against an AI opponent. Can you outsmart the computer?',
      icon: <Scissors className="text-purple-600 dark:text-purple-400" size={22} />,
      path: '/rock-paper-scissors',
      color: 'border-purple-500',
    },
    {
      id: 'word-guessing',
      title: 'Word Guessing',
      description: 'Guess the hidden word before you run out of tries. Test your vocabulary!',
      icon: <BookOpen className="text-blue-600 dark:text-blue-400" size={22} />,
      path: '/word-guessing',
      color: 'border-blue-500',
    },
    {
      id: 'ninja-reflex',
      title: 'Ninja Reflex',
      description: 'Test your reaction time and reflexes in this fast-paced timing game.',
      icon: <Zap className="text-yellow-600 dark:text-yellow-400" size={22} />,
      path: '/ninja-reflex',
      color: 'border-yellow-500',
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Find matching pairs of cards in this classic memory game. Train your brain!',
      icon: <Grid3X3 className="text-green-600 dark:text-green-400" size={22} />,
      path: '/memory-match',
      color: 'border-green-500',
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
          Welcome to GameHub, <span className="text-purple-600 dark:text-purple-400">{player.name}</span>!
        </h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose a game from our collection of fun mini-games. Challenge yourself, improve your skills,
          and compete for the highest scores!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game, index) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            icon={game.icon}
            path={game.path}
            color={game.color}
            delay={index}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Your Gaming Stats</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          You've played a total of {Object.values(player.stats).reduce((sum, game) => sum + game.gamesPlayed, 0)} games 
          and won {Object.values(player.stats).reduce((sum, game) => sum + game.wins, 0)} times!
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(player.stats).map(([gameKey, stats]) => {
            const game = games.find(g => g.id === gameKey.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (!game) return null;
            
            return (
              <div key={gameKey} className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-1">
                  <div className={`w-6 h-6 rounded-full ${game.color.replace('border-', 'bg-')} bg-opacity-20 dark:bg-opacity-30 flex items-center justify-center mr-2`}>
                    {game.icon}
                  </div>
                  <h3 className="text-sm font-medium text-slate-800 dark:text-white">{game.title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stats.gamesPlayed} games played</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default GameHub;