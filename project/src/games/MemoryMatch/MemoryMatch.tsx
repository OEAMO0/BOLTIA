import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Clock, Award } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import GameLayout from '../common/GameLayout';
import Confetti from 'react-confetti';

// Card types and data
interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = [
  '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', 
  '🚀', '🏆', '🎸', '🎁', '🌟', '🔮'
];

const createDeck = (): Card[] => {
  // Create pairs of cards with emojis
  const cards: Card[] = [];
  
  // Use only half of the emojis for a 4x4 grid (8 pairs)
  const gameEmojis = emojis.slice(0, 8);
  
  // Create pairs
  gameEmojis.forEach((emoji, index) => {
    cards.push({
      id: index * 2,
      emoji,
      isFlipped: false,
      isMatched: false
    });
    cards.push({
      id: index * 2 + 1,
      emoji,
      isFlipped: false,
      isMatched: false
    });
  });
  
  // Shuffle the cards
  return cards.sort(() => Math.random() - 0.5);
};

const MemoryMatch: React.FC = () => {
  const navigate = useNavigate();
  const { updateStats } = usePlayer();
  
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Update document title
  useEffect(() => {
    document.title = 'Memory Match - GameHub';
    
    // Load best score from local storage
    const savedBestScore = localStorage.getItem('memoryMatchBestScore');
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore));
    }
    
    return () => {
      document.title = 'GameHub - Multiple Games in One Place';
    };
  }, []);
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, gameCompleted]);
  
  // Check for completed game
  useEffect(() => {
    if (deck.every(card => card.isMatched) && deck.length > 0) {
      setGameCompleted(true);
      
      // Calculate score (lower is better - based on moves and time)
      const score = moves + (time / 2);
      
      // Update best score if this is better (lower)
      if (bestScore === null || score < bestScore) {
        setBestScore(score);
        localStorage.setItem('memoryMatchBestScore', score.toString());
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Update player stats (win if completed in under 20 moves, otherwise loss)
      if (moves <= 20) {
        updateStats('memoryMatch', 'win');
      } else {
        updateStats('memoryMatch', 'loss');
      }
    }
  }, [deck, moves, time, bestScore, updateStats]);
  
  // Handle card click
  const handleCardClick = (id: number) => {
    // Start the game on first card click
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Ignore clicks if already two cards are flipped or the clicked card is already matched/flipped
    if (flippedCards.length >= 2) return;
    
    const clickedCard = deck.find(card => card.id === id);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;
    
    // Flip the card
    const updatedDeck = deck.map(card => 
      card.id === id ? { ...card, isFlipped: true } : card
    );
    
    setDeck(updatedDeck);
    setFlippedCards([...flippedCards, id]);
    
    // If this is the second card flipped, check for a match
    if (flippedCards.length === 1) {
      setMoves(moves + 1);
      const firstCardId = flippedCards[0];
      const firstCard = deck.find(card => card.id === firstCardId);
      const secondCard = updatedDeck.find(card => card.id === id);
      
      // Check for a match
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Cards match - mark them as matched
        setTimeout(() => {
          setDeck(prevDeck => 
            prevDeck.map(card => 
              card.id === firstCardId || card.id === id 
                ? { ...card, isMatched: true } 
                : card
            )
          );
          setFlippedCards([]);
        }, 500);
      } else {
        // Cards don't match - flip them back over after a short delay
        setTimeout(() => {
          setDeck(prevDeck => 
            prevDeck.map(card => 
              card.id === firstCardId || card.id === id 
                ? { ...card, isFlipped: false } 
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setDeck(createDeck());
    setFlippedCards([]);
    setGameCompleted(false);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setShowConfetti(false);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Memory Match</h1>
          <p className="text-slate-600 dark:text-slate-300">Find matching pairs of cards to win!</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                <Clock size={16} className="text-slate-600 dark:text-slate-300 mr-2" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatTime(time)}
                </span>
              </div>
              
              <div className="flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Moves: {moves}
                </span>
              </div>
            </div>
            
            <button
              onClick={resetGame}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Reset Game"
            >
              <RefreshCw size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          {gameCompleted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Great Job!
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                You completed the game in {moves} moves and {formatTime(time)}.
              </p>
              
              {bestScore === (moves + (time / 2)) && (
                <div className="flex items-center justify-center mb-4">
                  <Award size={20} className="text-yellow-500 mr-2" />
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">New Best Score!</span>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-colors"
              >
                Play Again
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <AnimatePresence>
                {deck.map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    className={`relative h-20 cursor-pointer ${
                      card.isMatched ? 'opacity-70' : ''
                    }`}
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div
                      className={`absolute inset-0 w-full h-full rounded-lg backface-hidden transition-all duration-300 ${
                        card.isFlipped
                          ? 'bg-white dark:bg-slate-900 border-2 border-green-400 dark:border-green-600 rotate-y-180'
                          : 'bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800'
                      }`}
                    >
                      {!card.isFlipped && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">?</span>
                        </div>
                      )}
                      {card.isFlipped && (
                        <div className="absolute inset-0 flex items-center justify-center rotate-y-180">
                          <span className="text-3xl">{card.emoji}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
          <h2 className="font-bold text-slate-800 dark:text-white mb-2">Game Rules</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Click on cards to flip them</li>
            <li>• Find matching pairs of cards</li>
            <li>• Complete the game in as few moves as possible</li>
            <li>• The timer starts on your first move</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default MemoryMatch;