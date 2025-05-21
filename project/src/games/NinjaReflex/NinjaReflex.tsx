import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Clock, Trophy, Target, AlertCircle } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import GameLayout from '../common/GameLayout';
import Confetti from 'react-confetti';

const NinjaReflex: React.FC = () => {
  const navigate = useNavigate();
  const { updateStats } = usePlayer();
  
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update document title
  useEffect(() => {
    document.title = 'Ninja Reflex - GameHub';
    
    // Load best time from local storage
    const savedBestTime = localStorage.getItem('ninjaReflexBestTime');
    if (savedBestTime) {
      setBestTime(parseInt(savedBestTime));
    }
    
    return () => {
      document.title = 'GameHub - Multiple Games in One Place';
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Save best time to local storage when it changes
  useEffect(() => {
    if (bestTime !== null) {
      localStorage.setItem('ninjaReflexBestTime', bestTime.toString());
    }
  }, [bestTime]);
  
  // Start game function
  const startGame = () => {
    setGameState('waiting');
    setTooEarly(false);
    setReactionTime(null);
    setCountdown(3);
    
    // Countdown from 3 to 1
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // After countdown, wait a random time before showing the target
          const randomDelay = 1000 + Math.random() * 4000; // Between 1 and 5 seconds
          timerRef.current = setTimeout(() => {
            setStartTime(Date.now());
            setGameState('ready');
          }, randomDelay);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Handle click when target appears
  const handleTargetClick = () => {
    if (gameState === 'ready' && startTime) {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      
      // Update best time if this is faster
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      
      setGameState('result');
      
      // Update player stats (win if under 300ms, otherwise loss)
      if (time < 300) {
        updateStats('ninjaReflex', 'win');
      } else {
        updateStats('ninjaReflex', 'loss');
      }
    } else if (gameState === 'waiting') {
      // Clicked too early
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setTooEarly(true);
      setGameState('result');
      updateStats('ninjaReflex', 'loss');
    }
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
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Ninja Reflex</h1>
          <p className="text-slate-600 dark:text-slate-300">Test your reaction time - click when you see the target!</p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Clock size={20} className="text-slate-600 dark:text-slate-300 mr-2" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {bestTime ? `Best: ${bestTime} ms` : 'No record yet'}
              </span>
            </div>
            
            {gameState === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md transition-colors flex items-center"
              >
                <Play size={16} className="mr-1" /> Start Game
              </motion.button>
            )}
          </div>
          
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              {gameState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-56 h-56 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
                    <Target size={80} className="text-yellow-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Click the "Start Game" button to begin. <br />
                    When the target appears, click as fast as you can!
                  </p>
                </motion.div>
              )}
              
              {gameState === 'waiting' && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div
                    className="w-56 h-56 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-6 cursor-pointer"
                    onClick={handleTargetClick}
                  >
                    {countdown > 0 ? (
                      <motion.span
                        key={countdown}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="text-5xl font-bold text-white"
                      >
                        {countdown}
                      </motion.span>
                    ) : (
                      <span className="text-xl font-bold text-white">Wait for it...</span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Wait for the green target to appear!
                  </p>
                </motion.div>
              )}
              
              {gameState === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-56 h-56 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 cursor-pointer"
                    onClick={handleTargetClick}
                  >
                    <span className="text-2xl font-bold text-white">Click Now!</span>
                  </motion.div>
                </motion.div>
              )}
              
              {gameState === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <div className="w-56 h-56 rounded-full bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center mx-auto mb-6">
                    {tooEarly ? (
                      <>
                        <AlertCircle size={50} className="text-red-500 mb-3" />
                        <span className="text-xl font-bold text-red-500">Too Early!</span>
                      </>
                    ) : (
                      <>
                        <Clock size={50} className="text-blue-500 mb-3" />
                        <span className="text-3xl font-bold text-slate-800 dark:text-white">
                          {reactionTime} ms
                        </span>
                        {bestTime === reactionTime && (
                          <div className="mt-2 flex items-center">
                            <Trophy size={16} className="text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-yellow-500">New Record!</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {!tooEarly && reactionTime && (
                    <div className="mb-6">
                      <p className="text-slate-600 dark:text-slate-300 mb-2">
                        {reactionTime < 200
                          ? 'Incredible! Are you even human?'
                          : reactionTime < 300
                          ? 'Amazing reflexes! Ninja-level!'
                          : reactionTime < 400
                          ? 'Great job! Very quick!'
                          : reactionTime < 500
                          ? 'Good reflexes!'
                          : 'Keep practicing to improve your time!'}
                      </p>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden w-64 mx-auto">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (600 - Math.min(600, reactionTime)) / 4)}%` }}
                          className={`h-full ${
                            reactionTime < 250
                              ? 'bg-green-500'
                              : reactionTime < 350
                              ? 'bg-green-400'
                              : reactionTime < 450
                              ? 'bg-yellow-500'
                              : 'bg-orange-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                  
                  {tooEarly && (
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      You clicked too early! Wait for the green target to appear.
                    </p>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-md transition-colors"
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl p-4">
          <h2 className="font-bold text-slate-800 dark:text-white mb-2">Game Rules</h2>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <li>• Wait for the green target to appear</li>
            <li>• Click as fast as you can when it appears</li>
            <li>• Don't click too early or you'll fail</li>
            <li>• Try to beat your best time</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
};

export default NinjaReflex;