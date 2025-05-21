import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './contexts/PlayerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OnlineProvider } from './contexts/OnlineContext';
import GameHub from './pages/GameHub';
import RockPaperScissors from './games/RockPaperScissors/RockPaperScissors';
import WordGuessing from './games/WordGuessing/WordGuessing';
import NinjaReflex from './games/NinjaReflex/NinjaReflex';
import MemoryMatch from './games/MemoryMatch/MemoryMatch';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <OnlineProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-300">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<GameHub />} />
                  <Route path="/rock-paper-scissors" element={<RockPaperScissors />} />
                  <Route path="/word-guessing" element={<WordGuessing />} />
                  <Route path="/ninja-reflex" element={<NinjaReflex />} />
                  <Route path="/memory-match" element={<MemoryMatch />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </OnlineProvider>
      </PlayerProvider>
    </ThemeProvider>
  );
}

export default App;