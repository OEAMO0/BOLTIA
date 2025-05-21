import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Hand, Scissors, FileInput } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import GameLayout from '../common/GameLayout';
import Confetti from 'react-confetti';

// Game Options
type Choice = 'rock' | 'paper' | 'scissors' | null;
type Result = 'win' | 'loss' | 'draw' | null;

// Component to render each choice
const ChoiceButton: React.FC<{
  choice: Choice;
  icon: React.ReactNode;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}> = ({ choice, icon, selected, disabled, onClick }) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
      selected
        ? 'bg-purple-600 text-white shadow-lg'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={onClick}
    disabled={disabled}
  >
    <div className="text-center">
      {icon}
      <span className="block mt-1 text-xs font-medium">
        {choice?.charAt(0).toUpperCase() + choice?.slice(1)}
      </span>
    </div>
  </motion.button>
);

const RockPaperScissors: React.FC = () => {
  const navigate = useNavigate();
  const { player, updateStats } = usePlayer();
  
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Set the document title
  useEffect(() => {
    document.title = 'Rock Paper Scissors - GameHub';
    return () => {
      document.title = 'GameHub - Multiple Games in One Place';
    };
  }, []);

  // Determine the winner
  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (!player || !computer) return null;
    if (player === computer) return 'draw';
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    
    return 'loss';
  };

  // Handle player's choice
  const handleChoice = (choice: Choice) => {
    setPlayerChoice(choice);
    setCountdown(3);
  };

  // Computer makes a random choice
  const makeComputerChoice = () => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
  };

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      const choice = makeComputerChoice();
      setComputerChoice(choice);
      
      const gameResult = determineWinner(playerChoice, choice);
      setResult(gameResult);
      
      if (gameResult === 'win') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else if (gameResult === 'loss') {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      }
      
      updateStats('rockPaperScissors', gameResult || 'draw');
      setShowResult(true);
    }
  }, [countdown, playerChoice]);

  // Play again button handler
  const handlePlayAgain = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setCountdown(null);
    setShowResult(false);
    setRound(round + 1);
  };

  return (
    <GameLayout>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-0 left-0 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Back to Game Hub"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        
        <div className="text-center mb-8 pt-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Rock Paper Scissors</h1>
          <p className="text-slate-600 dark:text-slate-300">Choose your move and try to beat the computer!</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">You</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{score.player}</p>
            </div>
            <div className="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-700">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Round {round}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Computer</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{score.computer}</p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 my-8">
            <AnimatePresence mode="wait">
              {!showResult ? (
                <div className="flex space-x-4">
                  <ChoiceButton
                    choice="rock"
                    icon={<Hand size={36} className="mx-auto" />}
                    selected={playerChoice === 'rock'}
                    disabled={playerChoice !== null}
                    onClick={() => handleChoice('rock')}
                  />
                  <ChoiceButton
                    choice="paper"
                    icon={<FileInput size={36} className="mx-auto" />}
                    selected={playerChoice === 'paper'}
                    disabled={playerChoice !== null}
                    onClick={() => handleChoice('paper')}
                  />
                  <ChoiceButton
                    choice="scissors"
                    icon={<Scissors size={36} className="mx-auto" />}
                    selected={playerChoice === 'scissors'}
                    disabled={playerChoice !== null}
                    onClick={() => handleChoice('scissors')}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex space-x-16 mb-8">
                    <div className="text-center">
                      <div className={`w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2`}>
                        {playerChoice === 'rock' && <Hand size={40} className="text-purple-600 dark:text-purple-400" />}
                        {playerChoice === 'paper' && <FileInput size={40} className="text-purple-600 dark:text-purple-400" />}
                        {playerChoice === 'scissors' && <Scissors size={40} className="text-purple-600 dark:text-purple-400" />}
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Your choice</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2`}>
                        {computerChoice === 'rock' && <Hand size={40} className="text-red-600 dark:text-red-400" />}
                        {computerChoice === 'paper' && <FileInput size={40} className="text-red-600 dark:text-red-400" />}
                        {computerChoice === 'scissors' && <Scissors size={40} className="text-red-600 dark:text-red-400" />}
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">Computer's choice</p>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    {result === 'win' && (
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        You Win!
                      </p>
                    )}
                    {result === 'loss' && (
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        You Lose!
                      </p>
                    )}
                    {result === 'draw' && (
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        It's a Draw!
                      </p>
                    )}
                    
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      {playerChoice} {result === 'win' ? 'beats' : result === 'loss' ? 'loses to' : 'draws with'} {computerChoice}
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayAgain}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition-colors"
                  >
                    Play Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {countdown !== null && !showResult && (
            <div className="text-center">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-4"
              >
                {countdown}
              </motion.div>
              <p className="text-slate-600 dark:text-slate-300">Computer is choosing...</p>
            </div>
          )}
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-4">
          <h2 className="font-bold text-slate-800 dark:text-white mb-2">Game Rules</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Rock crushes Scissors</li>
            <li>• Paper covers Rock</li>
            <li>• Scissors cuts Paper</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default RockPaperScissors;