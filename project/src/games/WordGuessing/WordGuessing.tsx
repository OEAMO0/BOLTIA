import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Heart, X } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import GameLayout from '../common/GameLayout';
import Confetti from 'react-confetti';
import { wordList } from './words';

const WordGuessing: React.FC = () => {
  const navigate = useNavigate();
  const { updateStats } = usePlayer();
  
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const maxIncorrectGuesses = 6;
  
  // Set up the keyboard layout
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];
  
  // Update document title
  useEffect(() => {
    document.title = 'Word Guessing - GameHub';
    return () => {
      document.title = 'GameHub - Multiple Games in One Place';
    };
  }, []);
  
  // Initialize the game with a random word
  const initializeGame = useCallback(() => {
    // Select a random word from the word list
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const randomWord = wordList[randomIndex].toUpperCase();
    
    setWord(randomWord);
    setGuessedLetters([]);
    setIncorrectGuesses(0);
    setGameStatus('playing');
  }, []);
  
  // Initialize the game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);
  
  // Handle key press for guessing letters
  const handleGuess = useCallback((letter: string) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter)) return;
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!word.includes(letter)) {
      const newIncorrectGuesses = incorrectGuesses + 1;
      setIncorrectGuesses(newIncorrectGuesses);
      
      if (newIncorrectGuesses >= maxIncorrectGuesses) {
        setGameStatus('lost');
        updateStats('wordGuessing', 'loss');
      }
    } else {
      // Check if all letters in the word have been guessed
      const allLettersGuessed = [...word].every(char => 
        newGuessedLetters.includes(char) || char === ' '
      );
      
      if (allLettersGuessed) {
        setGameStatus('won');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        updateStats('wordGuessing', 'win');
      }
    }
  }, [gameStatus, guessedLetters, word, incorrectGuesses, updateStats]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGuess]);
  
  // Display the word with correctly guessed letters shown and others hidden
  const displayWord = word.split('').map((letter, index) => {
    if (letter === ' ') {
      return <span key={index} className="w-2"></span>;
    }
    
    return (
      <motion.div
        key={index}
        initial={{ scale: guessedLetters.includes(letter) ? 0.8 : 1 }}
        animate={{ scale: 1 }}
        className="inline-block mx-1 mb-2"
      >
        <div className="w-10 h-12 flex items-center justify-center border-b-2 border-slate-600 dark:border-slate-400">
          <span className="text-2xl font-bold text-slate-800 dark:text-white">
            {guessedLetters.includes(letter) || gameStatus === 'lost' ? letter : ''}
          </span>
        </div>
      </motion.div>
    );
  });
  
  // Handle restart game
  const handleRestart = () => {
    initializeGame();
  };
  
  // Render the hangman figure based on incorrect guesses
  const renderLives = () => {
    const lives = maxIncorrectGuesses - incorrectGuesses;
    return (
      <div className="flex space-x-1">
        {Array.from({ length: maxIncorrectGuesses }).map((_, index) => (
          <Heart
            key={index}
            size={20}
            className={`${
              index < lives
                ? 'text-red-500 dark:text-red-400 fill-red-500 dark:fill-red-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Word Guessing</h1>
          <p className="text-slate-600 dark:text-slate-300">Guess the hidden word before you run out of lives</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              {renderLives()}
            </div>
            <button
              onClick={handleRestart}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Restart Game"
            >
              <RefreshCw size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="flex justify-center my-6">
            {displayWord}
          </div>
          
          <AnimatePresence mode="wait">
            {gameStatus !== 'playing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-6"
              >
                {gameStatus === 'won' ? (
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    Congratulations! You guessed the word!
                  </p>
                ) : (
                  <div>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                      Game Over! You ran out of lives.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      The word was: <span className="font-bold">{word}</span>
                    </p>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors"
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-6">
            {keyboardRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center mb-2">
                {rowIndex === 1 && <div className="w-2"></div>}
                
                {row.map((letter) => {
                  const isGuessed = guessedLetters.includes(letter);
                  const isCorrect = word.includes(letter) && isGuessed;
                  const isIncorrect = !word.includes(letter) && isGuessed;
                  
                  return (
                    <motion.button
                      key={letter}
                      whileHover={!isGuessed && gameStatus === 'playing' ? { scale: 1.1 } : {}}
                      whileTap={!isGuessed && gameStatus === 'playing' ? { scale: 0.9 } : {}}
                      onClick={() => handleGuess(letter)}
                      disabled={isGuessed || gameStatus !== 'playing'}
                      className={`w-9 h-10 mx-1 rounded-md flex items-center justify-center font-medium shadow-sm transition-colors ${
                        isCorrect
                          ? 'bg-green-500 text-white cursor-default'
                          : isIncorrect
                          ? 'bg-red-500 text-white cursor-default'
                          : gameStatus !== 'playing'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer'
                      }`}
                    >
                      {letter}
                    </motion.button>
                  );
                })}
                
                {rowIndex === 1 && <div className="w-2"></div>}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
          <h2 className="font-bold text-slate-800 dark:text-white mb-2">Game Rules</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Guess one letter at a time to reveal the hidden word</li>
            <li>• Each incorrect guess costs you one life</li>
            <li>• You lose when you run out of lives (6 mistakes)</li>
            <li>• You win when you guess all letters in the word</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default WordGuessing;