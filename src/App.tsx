/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Settings, 
  HelpCircle, 
  RefreshCcw, 
  Share2, 
  Lightbulb,
  Sun,
  Moon,
  X,
  CheckCircle2,
  Home,
  Shield,
  FileText
} from 'lucide-react';
import { 
  CATEGORIES, 
  WORD_LISTS, 
  Category, 
  MAX_ATTEMPTS_NORMAL, 
  MAX_ATTEMPTS_HARD,
  COLOR_CLASSES 
} from './constants.ts';

// --- Types ---
interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  winPercentage: number;
  guessDistribution: number[];
}

interface LocalStorageData {
  stats: GameStats;
  lastPlayedDate: string | null;
  settings: {
    hardMode: boolean;
    darkMode: boolean;
  };
}

// --- Utils ---
const getDailySeed = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getWordOfTheDay = (category: Category) => {
  const seed = getDailySeed();
  const list = WORD_LISTS[category];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return list[Math.abs(hash) % list.length];
};

const getRandomWord = (category: Category) => {
  const list = WORD_LISTS[category];
  return list[Math.floor(Math.random() * list.length)];
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  winPercentage: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

// --- Confetti Component ---
function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            top: -20, 
            left: `${Math.random() * 100}%`,
            rotate: 0,
            scale: 0.5
          }}
          animate={{ 
            top: '120%', 
            left: `${(Math.random() * 100) + (Math.random() * 20 - 10)}%`,
            rotate: 720,
            scale: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: Math.random() * 2 + 2, 
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ 
            backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#a855f7'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  // Game Configuration
  const [category, setCategory] = useState<Category | null>(null);
  const [isDaily, setIsDaily] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Game State
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [hintUsed, setHintUsed] = useState(false);
  const [message, setMessage] = useState('');

  // UI State
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('lexicue_data');
    if (saved) {
      const data: LocalStorageData = JSON.parse(saved);
      setStats(data.stats);
      setHardMode(data.settings.hardMode);
      setDarkMode(data.settings.darkMode ?? true);
    }
  }, []);

  useEffect(() => {
    const data: LocalStorageData = {
      stats,
      lastPlayedDate: isDaily ? getDailySeed() : null,
      settings: { hardMode, darkMode }
    };
    localStorage.setItem('lexicue_data', JSON.stringify(data));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [stats, hardMode, darkMode, isDaily]);

  const maxAttempts = hardMode ? MAX_ATTEMPTS_HARD : MAX_ATTEMPTS_NORMAL;

  const startNewGame = useCallback((cat: Category, daily: boolean = false) => {
    const word = daily ? getWordOfTheDay(cat) : getRandomWord(cat);
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setCategory(cat);
    setIsDaily(daily);
    setHintUsed(false);
    setMessage('');
  }, []);

  const onKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Not enough letters');
        setTimeout(() => setMessage(''), 2000);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === targetWord) {
        setGameState('won');
        updateStats(true, newGuesses.length);
        setMessage('GENIUS!');
      } else if (newGuesses.length >= maxAttempts) {
        setGameState('lost');
        updateStats(false, 0);
        setMessage(targetWord);
      }
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameState, guesses, targetWord, maxAttempts, hardMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        onKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const updateStats = (won: boolean, guessCount: number) => {
    setStats(prev => {
      const newPlayed = prev.gamesPlayed + 1;
      const newWon = prev.gamesWon + (won ? 1 : 0);
      const newStreak = won ? prev.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const newDist = [...prev.guessDistribution];
      if (won && guessCount > 0) newDist[guessCount - 1]++;

      return {
        gamesPlayed: newPlayed,
        gamesWon: newWon,
        currentStreak: newStreak,
        maxStreak: newMaxStreak,
        winPercentage: Math.round((newWon / newPlayed) * 100),
        guessDistribution: newDist,
      };
    });
    setTimeout(() => setShowStats(true), 1500);
  };

  const getLetterStatus = (word: string, index: number, target: string) => {
    const letter = word[index];
    if (letter === target[index]) return 'CORRECT';
    if (target.includes(letter)) return 'PRESENT';
    return 'ABSENT';
  };

  const getKeyStatuses = () => {
    const statuses: Record<string, 'CORRECT' | 'PRESENT' | 'ABSENT'> = {};
    guesses.forEach(guess => {
      guess.split('').forEach((letter, i) => {
        const currentStatus = getLetterStatus(guess, i, targetWord);
        if (!statuses[letter] || (currentStatus === 'CORRECT') || (currentStatus === 'PRESENT' && statuses[letter] === 'ABSENT')) {
          statuses[letter] = currentStatus;
        }
      });
    });
    return statuses;
  };

  const useHint = () => {
    if (hintUsed || gameState !== 'playing') return;
    const remainingLetters = targetWord.split('').filter((_, i) => !guesses.some(g => g[i] === targetWord[i]));
    if (remainingLetters.length > 0) {
      const randomHint = remainingLetters[Math.floor(Math.random() * remainingLetters.length)];
      setMessage(`Try using: ${randomHint}`);
      setHintUsed(true);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const shareResults = () => {
    const grid = guesses.map(guess => {
      return guess.split('').map((_, i) => {
        const s = getLetterStatus(guess, i, targetWord);
        return s === 'CORRECT' ? '🟩' : s === 'PRESENT' ? '🟨' : '⬛';
      }).join('');
    }).join('\n');
    
    const text = `LexiCue ${isDaily ? 'Daily ' : ''}${isDaily ? getDailySeed() : ''}\n${guesses.length}/${maxAttempts}\n\n${grid}`;
    
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        setMessage('Copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const Footer = () => (
    <footer className="w-full max-w-2xl mx-auto py-6 px-4 text-center">
      <div className="flex justify-center gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        <button onClick={() => setShowPrivacy(true)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</button>
        <span>•</span>
        <button onClick={() => setShowTerms(true)} className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</button>
      </div>
      <p className="mt-2 text-[10px] text-gray-300 dark:text-gray-600 uppercase tracking-tighter">© 2026 LexiCue Games</p>
    </footer>
  );

  if (!category) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950' : 'bg-gray-50'} flex flex-col`}>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">LexiCue</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Choose your challenge</p>
            
            <div className="grid gap-4">
              <button 
                onClick={() => startNewGame('General', true)}
                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group"
              >
                Daily Challenge
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
                  <RefreshCcw className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                </motion.div>
              </button>
              <div className="grid grid-cols-2 gap-4">
                {Object.values(CATEGORIES).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => startNewGame(cat)}
                    className="py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white transition-all capitalize"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
        <LegalModals 
          showPrivacy={showPrivacy} 
          showTerms={showTerms} 
          onClosePrivacy={() => setShowPrivacy(false)} 
          onCloseTerms={() => setShowTerms(false)} 
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950' : 'bg-white'} flex flex-col`}>
      {gameState === 'won' && <Confetti />}

      {/* --- Navbar --- */}
      <nav className="max-w-2xl mx-auto px-4 py-3 w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex gap-2">
          <button 
            onClick={() => setCategory(null)} 
            className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Home"
          >
            <Home className="w-6 h-6" />
          </button>
          <button onClick={() => setShowHelp(true)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
        
        <button onClick={() => setCategory(null)} className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">LEXICUE</button>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-yellow-400 transition-colors"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button 
            onClick={useHint} 
            disabled={hintUsed || gameState !== 'playing'}
            className={`p-2 transition-colors ${hintUsed || gameState !== 'playing' ? 'text-gray-200 dark:text-gray-800' : 'text-yellow-500 hover:text-yellow-600'}`}
          >
            <Lightbulb className="w-6 h-6" />
          </button>
          <button onClick={() => setShowStats(true)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <BarChart3 className="w-6 h-6" />
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 py-8 flex flex-col items-center flex-1 justify-between">
        {/* --- Category Info --- */}
        <div className="mb-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-full">
            {isDaily ? 'Daily' : category} {hardMode && '• Hard Mode'}
          </span>
        </div>

        {/* --- Message Toast --- */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Game Board --- */}
        <div className="grid gap-1.5 mb-8">
          {Array.from({ length: maxAttempts }).map((_, i) => {
            const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
            const isCompleted = i < guesses.length;
            
            return (
              <div key={i} className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, j) => {
                  const letter = guess[j] || '';
                  let status = 'EMPTY';
                  if (isCompleted) {
                    status = getLetterStatus(guess, j, targetWord);
                  } else if (i === guesses.length && letter) {
                    status = 'ACTIVE';
                  }

                  return (
                    <motion.div
                      key={j}
                      initial={false}
                      animate={isCompleted ? { rotateX: 180 } : {}}
                      transition={{ delay: j * 0.1, duration: 0.5 }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl font-bold border-2 rounded-lg 
                        ${COLOR_CLASSES[status as keyof typeof COLOR_CLASSES]}`}
                    >
                      <motion.span 
                        animate={isCompleted ? { rotateX: 180 } : {}} 
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* --- Keyboard --- */}
        <div className="w-full max-w-lg mx-auto">
          {[
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
          ].map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5 mb-2">
              {row.map(key => {
                const statuses = getKeyStatuses();
                const status = statuses[key];
                
                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`
                      ${key.length > 1 ? 'px-3 sm:px-4 text-xs' : 'flex-1 text-sm sm:text-base'}
                      h-14 rounded-lg font-bold transition-all active:scale-95 flex items-center justify-center
                      ${status === 'CORRECT' ? 'bg-green-500 text-white' : 
                        status === 'PRESENT' ? 'bg-yellow-500 text-white' : 
                        status === 'ABSENT' ? 'bg-gray-400 text-white dark:bg-gray-700 opacity-50' : 
                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}
                    `}
                  >
                    {key === 'BACKSPACE' ? <X className="w-5 h-5" /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* --- Modals --- */}
      <AnimatePresence>
        {showStats && (
          <Modal title="Statistics" onClose={() => setShowStats(false)}>
            <div className="grid grid-cols-4 gap-4 mb-8 text-center">
              <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.gamesPlayed}</div><div className="text-[10px] uppercase font-bold text-gray-400">Played</div></div>
              <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.winPercentage}</div><div className="text-[10px] uppercase font-bold text-gray-400">Win %</div></div>
              <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div><div className="text-[10px] uppercase font-bold text-gray-400">Streak</div></div>
              <div><div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.maxStreak}</div><div className="text-[10px] uppercase font-bold text-gray-400">Max</div></div>
            </div>
            
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-500 dark:text-gray-400 text-center">Guess Distribution</h3>
            <div className="space-y-2 mb-8">
              {stats.guessDistribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-xs font-bold w-4 text-gray-700 dark:text-gray-300">{i + 1}</div>
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / Math.max(...stats.guessDistribution, 1)) * 100}%` }}
                      className={`h-full flex items-center justify-end px-2 text-[10px] font-bold text-white
                        ${i + 1 === guesses.length && gameState === 'won' ? 'bg-green-500' : 'bg-gray-500'}`}
                    >
                      {count}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={shareResults}
                className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                Share <Share2 className="w-5 h-5" />
              </button>
              {gameState !== 'playing' && (
                <button 
                  onClick={() => startNewGame(category!)}
                  className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  Next Game <RefreshCcw className="w-5 h-5" />
                </button>
              )}
            </div>
          </Modal>
        )}

        {showSettings && (
          <Modal title="Settings" onClose={() => setShowSettings(false)}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Hard Mode</h4>
                  <p className="text-xs text-gray-500">Only 4 attempts allowed</p>
                </div>
                <button 
                  onClick={() => setHardMode(!hardMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${hardMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <motion.div 
                    animate={{ x: hardMode ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">Dark Theme</h4>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-yellow-400"
                >
                  {darkMode ? <Sun /> : <Moon />}
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">LexiCue v1.0</p>
              </div>
            </div>
          </Modal>
        )}

        {showHelp && (
          <Modal title="How to Play" onClose={() => setShowHelp(false)}>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>Guess the word in 6 tries (Normal) or 4 tries (Hard).</p>
              <p>Each guess must be a valid 5-letter word.</p>
              <p>The color of the tiles will change to show how close your guess was to the word.</p>
              
              <div className="space-y-2 pt-4">
                <div className="flex gap-1 items-center">
                  <div className="w-8 h-8 flex items-center justify-center font-bold bg-green-500 text-white rounded">W</div>
                  <p><b>W</b> is in the word and in the correct spot.</p>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="w-8 h-8 flex items-center justify-center font-bold bg-yellow-500 text-white rounded">I</div>
                  <p><b>I</b> is in the word but in the wrong spot.</p>
                </div>
                <div className="flex gap-1 items-center">
                  <div className="w-8 h-8 flex items-center justify-center font-bold bg-gray-500 text-white rounded">U</div>
                  <p><b>U</b> is not in the word in any spot.</p>
                </div>
              </div>
            </div>
          </Modal>
        )}

        <LegalModals 
          showPrivacy={showPrivacy} 
          showTerms={showTerms} 
          onClosePrivacy={() => setShowPrivacy(false)} 
          onCloseTerms={() => setShowTerms(false)} 
        />
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LegalModals({ showPrivacy, showTerms, onClosePrivacy, onCloseTerms }: { 
  showPrivacy: boolean, 
  showTerms: boolean, 
  onClosePrivacy: () => void, 
  onCloseTerms: () => void 
}) {
  return (
    <>
      <AnimatePresence>
        {showPrivacy && (
          <Modal title="Privacy Policy" onClose={onClosePrivacy}>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Your Privacy Matters</h3>
              </div>
              <p>LexiCue is committed to providing a transparent and secure gaming experience. This policy outlines how we handle your information.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">1. Data Storage</h4>
              <p>All game statistics (wins, streaks, distribution) and settings are stored locally on your device using <b>LocalStorage</b>. We do not transmit this data to any external servers.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">2. Tracking</h4>
              <p>We do not use cookies for tracking or serve targeted advertisements. Your gameplay remains private to your device.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">3. Third-Party Services</h4>
              <p>The "Share" feature uses your browser's native sharing API. No data is shared with third parties unless you explicitly choose to do so.</p>
            </div>
          </Modal>
        )}

        {showTerms && (
          <Modal title="Terms of Service" onClose={onCloseTerms}>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">Usage Agreement</h3>
              </div>
              <p>By accessing LexiCue, you agree to these simple terms of service.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">1. Fair Play</h4>
              <p>LexiCue is a casual word game. Users are encouraged to play fairly for the best experience. The use of automated bots to play the game is discouraged.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">2. Availability</h4>
              <p>We strive to keep LexiCue available 24/7, but we do not guarantee uninterrupted access. As a local-first app, performance depends on your browser compatibility.</p>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">3. Modifications</h4>
              <p>We reserve the right to update game word lists, mechanics, and UI at any time to improve the experience.</p>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
