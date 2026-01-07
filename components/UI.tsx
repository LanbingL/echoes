import React, { useEffect, useState } from 'react';
import { GameState, MemoryLog } from '../types';

// Add keyframes for glitch animations in a style tag
const glitchStyles = `
  @keyframes glitch-anim {
    0% { clip-path: inset(40% 0 30% 0); transform: translate(-2px, -2px); }
    20% { clip-path: inset(92% 0 1% 0); transform: translate(2px, 2px); }
    40% { clip-path: inset(43% 0 1% 0); transform: translate(-2px, 2px); }
    60% { clip-path: inset(25% 0 58% 0); transform: translate(2px, -2px); }
    80% { clip-path: inset(54% 0 7% 0); transform: translate(-2px, 2px); }
    100% { clip-path: inset(58% 0 43% 0); transform: translate(2px, -2px); }
  }

  @keyframes glitch-skew {
    0% { transform: skew(0deg); }
    10% { transform: skew(-2deg); }
    20% { transform: skew(0deg); }
    30% { transform: skew(2deg); }
    40% { transform: skew(0deg); }
    50% { transform: skew(-1deg); }
    60% { transform: skew(0deg); }
    70% { transform: skew(1deg); }
    80% { transform: skew(0deg); }
    90% { transform: skew(-2deg); }
    100% { transform: skew(0deg); }
  }

  @keyframes title-glow {
    0%, 100% {
      filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.5));
    }
    50% {
      filter: drop-shadow(0 0 30px rgba(59, 130, 246, 1)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.7));
    }
  }

  @keyframes scanline-move {
    0% { background-position: 0 0; }
    100% { background-position: 0 100%; }
  }

  @keyframes crt-flicker {
    0% { opacity: 0.97; }
    5% { opacity: 0.95; }
    10% { opacity: 0.98; }
    15% { opacity: 0.96; }
    20% { opacity: 0.99; }
    25% { opacity: 0.94; }
    30% { opacity: 0.98; }
    35% { opacity: 0.97; }
    40% { opacity: 0.95; }
    45% { opacity: 0.99; }
    50% { opacity: 0.96; }
    55% { opacity: 0.98; }
    60% { opacity: 0.94; }
    65% { opacity: 0.97; }
    70% { opacity: 0.99; }
    75% { opacity: 0.95; }
    80% { opacity: 0.98; }
    85% { opacity: 0.96; }
    90% { opacity: 0.99; }
    95% { opacity: 0.94; }
    100% { opacity: 0.97; }
  }

  @keyframes button-glitch {
    0%, 100% { transform: translate(0, 0) skew(0deg); }
    20% { transform: translate(-2px, 1px) skew(-1deg); }
    40% { transform: translate(2px, -1px) skew(1deg); }
    60% { transform: translate(-1px, -2px) skew(-0.5deg); }
    80% { transform: translate(1px, 2px) skew(0.5deg); }
  }

  @keyframes button-intense-glitch {
    0% { transform: translate(0, 0) skew(0deg); clip-path: inset(0 0 0 0); }
    5% { transform: translate(-3px, 2px) skew(-2deg); clip-path: inset(10% 0 85% 0); }
    10% { transform: translate(3px, -1px) skew(3deg); clip-path: inset(80% 0 5% 0); }
    15% { transform: translate(-2px, -2px) skew(-1deg); clip-path: inset(40% 0 50% 0); }
    20% { transform: translate(2px, 1px) skew(2deg); clip-path: inset(0 0 0 0); }
    25% { transform: translate(-1px, 3px) skew(-3deg); clip-path: inset(25% 0 65% 0); }
    30% { transform: translate(3px, -2px) skew(1deg); clip-path: inset(70% 0 20% 0); }
    35% { transform: translate(-3px, 1px) skew(-2deg); clip-path: inset(0 0 0 0); }
    40% { transform: translate(1px, -3px) skew(3deg); clip-path: inset(55% 0 35% 0); }
    45% { transform: translate(-2px, 2px) skew(-1deg); clip-path: inset(15% 0 75% 0); }
    50% { transform: translate(2px, -1px) skew(2deg); clip-path: inset(0 0 0 0); }
    55% { transform: translate(-1px, -2px) skew(-3deg); clip-path: inset(90% 0 5% 0); }
    60% { transform: translate(3px, 1px) skew(1deg); clip-path: inset(30% 0 60% 0); }
    65% { transform: translate(-2px, 3px) skew(-2deg); clip-path: inset(0 0 0 0); }
    70% { transform: translate(1px, -1px) skew(3deg); clip-path: inset(60% 0 30% 0); }
    75% { transform: translate(-3px, 2px) skew(-1deg); clip-path: inset(5% 0 90% 0); }
    80% { transform: translate(2px, -3px) skew(2deg); clip-path: inset(0 0 0 0); }
    85% { transform: translate(-1px, 1px) skew(-3deg); clip-path: inset(45% 0 45% 0); }
    90% { transform: translate(3px, 2px) skew(1deg); clip-path: inset(75% 0 15% 0); }
    95% { transform: translate(-2px, -1px) skew(-2deg); clip-path: inset(20% 0 70% 0); }
    100% { transform: translate(0, 0) skew(0deg); clip-path: inset(0 0 0 0); }
  }

  @keyframes button-glow-pulse {
    0%, 100% {
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3);
    }
  }

  @keyframes color-shift {
    0%, 100% { filter: hue-rotate(0deg) brightness(1); }
    25% { filter: hue-rotate(10deg) brightness(1.2); }
    50% { filter: hue-rotate(-10deg) brightness(1.1); }
    75% { filter: hue-rotate(5deg) brightness(1.3); }
  }

  .glitch-text {
    position: relative;
    animation: glitch-skew 3s infinite linear, title-glow 2s infinite ease-in-out;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch-text::before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    animation: glitch-anim 2s infinite linear alternate-reverse;
  }

  .glitch-text::after {
    left: -2px;
    text-shadow: 2px 0 #00ffff;
    animation: glitch-anim 3s infinite linear alternate-reverse;
  }

  /* CRT Title Container */
  .crt-title-container {
    position: relative;
    padding: 20px 40px;
    border-radius: 10px;
    overflow: hidden;
  }

  /* CRT Screen Curvature Effect */
  .crt-title-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0, 0, 0, 0.4) 100%);
    pointer-events: none;
    border-radius: 10px;
  }

  /* CRT Scanlines Overlay */
  .crt-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 1px,
      rgba(0, 0, 0, 0.3) 1px,
      rgba(0, 0, 0, 0.3) 2px
    );
    pointer-events: none;
    animation: crt-flicker 0.1s infinite;
  }

  /* CRT Pixel Grid */
  .crt-pixels {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 3px 3px;
    pointer-events: none;
  }

  /* CRT Glow Effect */
  .crt-glow {
    position: absolute;
    inset: -10px;
    background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    pointer-events: none;
    filter: blur(10px);
  }

  /* CRT RGB Split on text */
  .crt-text {
    position: relative;
    text-shadow:
      -1px 0 rgba(255, 0, 0, 0.5),
      1px 0 rgba(0, 255, 255, 0.5),
      0 0 10px rgba(59, 130, 246, 0.8),
      0 0 20px rgba(59, 130, 246, 0.6),
      0 0 40px rgba(59, 130, 246, 0.4);
  }

  /* Enhanced Button Glitch on Hover */
  .glitch-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .glitch-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .glitch-button::after {
    content: 'START';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: transparent;
    pointer-events: none;
  }

  .glitch-button:hover {
    animation: button-intense-glitch 0.15s infinite, button-glow-pulse 0.5s infinite, color-shift 0.3s infinite;
    background: rgba(59, 130, 246, 0.3) !important;
    border-color: rgba(59, 130, 246, 0.9) !important;
    color: #fff !important;
    text-shadow:
      -2px 0 #ff00ff,
      2px 0 #00ffff,
      0 0 10px rgba(59, 130, 246, 1),
      0 0 20px rgba(59, 130, 246, 0.8);
  }

  .glitch-button:hover::before {
    transform: translateX(100%);
    transition: transform 0.5s ease;
  }

  .glitch-button:hover::after {
    content: 'START';
    color: rgba(255, 0, 255, 0.5);
    animation: glitch-anim 0.1s infinite;
    text-shadow: 2px 0 #00ffff;
  }
`;

interface UIProps {
  gameState: GameState;
  onStart: () => void;
  onCloseMemory: () => void;
  onExitRoom: () => void; // New direct callback
  currentMemory: MemoryLog | null;
  canInteract: boolean;
  interactId?: string | null;
  attentionScore?: number;
}

export const UI: React.FC<UIProps> = ({ 
  gameState, 
  onStart, 
  onCloseMemory, 
  onExitRoom,
  currentMemory, 
  canInteract,
  interactId,
  attentionScore = 0
}) => {
  const [typedContent, setTypedContent] = useState('');

  // Typewriter effect for memory content
  useEffect(() => {
    if (gameState === GameState.READING && currentMemory) {
      setTypedContent('');
      let i = 0;
      const text = currentMemory.content;
      const speed = 30; 

      const interval = setInterval(() => {
        if (i < text.length) {
          setTypedContent((prev) => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [gameState, currentMemory]);

  // MENU STATE
  if (gameState === GameState.MENU) {
    return (
      <>
        {/* Inject glitch styles */}
        <style dangerouslySetInnerHTML={{ __html: glitchStyles }} />

        <div className="absolute inset-0 z-50 bg-black/95 pointer-events-none">

          {/* Title - Upper position with CRT texture and glitch effects */}
          <div className="absolute top-32 left-0 right-0 flex justify-center pointer-events-none">
            <div className="relative">
              {/* Title text with CRT effects */}
              <h1
                className="glitch-text crt-text text-8xl font-bold tracking-wider text-center relative"
                data-text="THE SPY: ECHOES"
                style={{
                  color: '#3b82f6',
                  textShadow: '3px 0 0 rgba(255, 0, 255, 0.6), -3px 0 0 rgba(0, 255, 255, 0.6), 0 0 20px rgba(59, 130, 246, 0.8)',
                }}
              >
                THE SPY: ECHOES
              </h1>
            </div>
          </div>

          {/* How to Play - Lower Left */}
          <div className="absolute bottom-12 left-12 max-w-md pointer-events-auto">
            <div className="bg-black/80 border border-blue-500/30 p-6 backdrop-blur-sm relative overflow-hidden">
              {/* Dither overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59, 130, 246, 0.1) 1px, rgba(59, 130, 246, 0.1) 2px)'
                }}
              />
              <div className="relative z-10">
                <h3 className="text-blue-400 text-sm tracking-[0.3em] mb-4 border-b border-blue-500/30 pb-2 uppercase" style={{ fontFamily: "'Courier New', Courier, monospace" }}>How to Play</h3>
                <div className="space-y-2 text-blue-200/70 text-xs leading-relaxed" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  <p>Use your mouse or trackpad to look around.</p>
                  <p>Click on objects, screens, and spaces to interact.</p>
                  <p>Move through environments when prompted.</p>
                  <p>Read carefully. React slowly. Or don't.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes - Lower Right */}
          <div className="absolute bottom-12 right-12 max-w-md pointer-events-auto">
            <div className="bg-black/80 border border-blue-500/30 p-6 backdrop-blur-sm relative overflow-hidden">
              {/* Dither overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(59, 130, 246, 0.1) 1px, rgba(59, 130, 246, 0.1) 2px)'
                }}
              />
              <div className="relative z-10">
                <h3 className="text-blue-400 text-sm tracking-[0.3em] mb-4 border-b border-blue-500/30 pb-2 uppercase" style={{ fontFamily: "'Courier New', Courier, monospace" }}>Important Notes</h3>
                <div className="space-y-2 text-blue-200/70 text-xs leading-relaxed" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  <p>There is no timer.</p>
                  <p>There are no enemies.</p>
                  <p>There is no way to win.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Button - Positioned closer to title */}
          <div className="absolute top-80 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button
              onClick={onStart}
              className="glitch-button px-12 py-4 bg-blue-500/10 border-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/60 hover:text-blue-300 transition-colors tracking-[0.3em] font-bold text-sm uppercase relative"
              style={{
                textShadow: '1px 0 0 rgba(255, 0, 255, 0.4), -1px 0 0 rgba(0, 255, 255, 0.4)',
                fontFamily: "'Courier New', Courier, monospace"
              }}
            >
              START
            </button>
          </div>
        </div>

        {/* Persistent Controls Instructions */}
        <div className="absolute top-8 right-8 text-right opacity-60 pointer-events-none bg-black/60 p-4 border border-blue-500/20 backdrop-blur-sm z-[60]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
           <div className="text-[10px] text-blue-400/80 tracking-[0.2em] mb-2 border-b border-blue-500/20 pb-1">CONTROLS</div>
           <div className="text-[10px] text-blue-200/60 tracking-widest">WASD • MOVE</div>
           <div className="text-[10px] text-blue-200/60 tracking-widest">MOUSE • LOOK</div>
           <div className="text-[10px] text-blue-200/60 tracking-widest">E • INTERACT</div>
           <div className="text-[10px] text-blue-200/60 tracking-widest mt-1">ESC • CURSOR</div>
        </div>
      </>
    );
  }

  // Determine Prompt Text
  const getPromptText = () => {
      switch(interactId) {
          case 'PINK_DOOR': return 'ENTER THE FEED';           // 001 THE NEWS FEED
          case 'YELLOW_DOOR': return 'ENTER THE BUILDING';     // 002 THE WINDOWS
          case 'WATCHER_DOOR': return 'ACCEPT SURVEILLANCE';   // 003 THE WATCHER
          case 'PROFILE_DOOR': return 'ENTER THE WALL';        // 004 THE WALL
          case 'STORY_DOOR': return 'READ THE STORY';          // 005 THE STORY
          default: return 'INSPECT MEMORY';
      }
  };

  const getPromptColorClass = () => {
      switch(interactId) {
          case 'PINK_DOOR': return 'border-pink-500/30 text-pink-400';        // Pink
          case 'YELLOW_DOOR': return 'border-[#ffaa00]/30 text-[#ffaa00]';    // Yellow
          case 'WATCHER_DOOR': return 'border-green-500/30 text-green-400';   // Green
          case 'PROFILE_DOOR': return 'border-red-500/30 text-red-500';       // Red
          case 'STORY_DOOR': return 'border-blue-500/30 text-blue-400';       // Blue
          default: return 'border-cyan-500/30 text-cyan-400';
      }
  };

  // Logic to determine if we are in a room or reading a memory
  const isOverlayState = gameState !== GameState.PLAYING && gameState !== GameState.LOADING_MEMORY;

  // Resolve exit button color
  let exitColor = '#00f3ff'; // default cyan
  if (gameState === GameState.THE_BUILDING) exitColor = '#ffaa00';
  if (gameState === GameState.PROFILE_ROOM) exitColor = '#ff0000';
  if (gameState === GameState.WATCHER_ROOM) exitColor = '#00ff6a';
  if (gameState === GameState.STORY_ROOM) exitColor = '#00f3ff';

  return (
    <div className="absolute inset-0 pointer-events-none z-[9999]">
      
      {/* 1. GLOBAL EXIT BUTTON (For Rooms & Reading) */}
      {isOverlayState && (
         <div className="absolute top-8 right-8 pointer-events-auto">
            <div 
                className="text-xs font-bold font-mono tracking-widest uppercase border bg-black/80 px-6 py-3 backdrop-blur-md shadow-lg hover:bg-black/90 transition-all cursor-pointer select-none"
                style={{ 
                    color: exitColor, 
                    borderColor: `${exitColor}80`,
                    boxShadow: `0 0 15px ${exitColor}40`
                }}
                onClick={onExitRoom}
            >
             PRESS "ESC" TO EXIT
           </div>
         </div>
      )}

      {/* 2. NEWS ROOM SPECIFIC CONTROLS */}
      {gameState === GameState.NEWS_ROOM && (
        <>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_60%,black_100%)] opacity-60" />
            <div className="absolute bottom-8 left-8 flex flex-col gap-2 pointer-events-auto">
                <div className="flex items-center gap-4 text-xs text-cyan-400 font-mono tracking-widest uppercase bg-black/80 p-3 border-l-2 border-cyan-500 shadow-lg">
                    <span>[ DRAG ] LOOK AROUND</span>
                    <span className="text-cyan-800">•</span>
                    <span>[ SCROLL ] ZOOM IN/OUT</span>
                </div>
            </div>
        </>
      )}

      {/* 3. MAIN GAMEPLAY HUD */}
      
      {/* Crosshair - Only in PLAYING */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 
            ${canInteract ? 'scale-150 bg-white shadow-[0_0_10px_white]' : 'bg-white/20'}`} />
        </div>
      )}

      {/* Interact Prompt - Only in PLAYING when close to object */}
      {gameState === GameState.PLAYING && canInteract && (
        <div className="absolute bottom-20 w-full text-center animate-pulse z-50">
          <span className={`bg-black/90 px-6 py-3 border-2 ${getPromptColorClass()} font-bold text-sm tracking-widest backdrop-blur-md shadow-lg`}>
            [ E ] {getPromptText()}
          </span>
        </div>
      )}

      {/* Persistent Controls Instructions - Visible in PLAYING */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-8 right-8 text-right pointer-events-none bg-black/40 p-4 rounded backdrop-blur-sm z-[60]" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
           <div className="text-[10px] text-blue-200/80 tracking-[0.2em] mb-2 border-b border-white/10 pb-1">CONTROLS</div>
           <div className="text-[10px] text-white/70 tracking-widest">WASD • MOVE</div>
           <div className="text-[10px] text-white/70 tracking-widest">MOUSE • LOOK</div>
           <div className="text-[10px] text-white/70 tracking-widest">E • INTERACT</div>
           <div className="text-[10px] text-white/70 tracking-widest mt-1 text-red-400">ESC • CURSOR</div>
        </div>
      )}

      {/* 4. LOADING STATE */}
      {gameState === GameState.LOADING_MEMORY && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 text-xs tracking-widest animate-pulse" style={{ fontFamily: "'Courier New', Courier, monospace" }}>DECRYPTING DATA STREAM...</p>
          </div>
        </div>
      )}

      {/* 5. MEMORY MODAL */}
      {gameState === GameState.READING && currentMemory && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
          <div className="max-w-xl w-full mx-4 border border-blue-500/30 bg-black/90 p-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] relative overflow-hidden group" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

            {/* Decorative Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0,06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

            <div className="relative z-10">
              <div className="flex justify-between items-end mb-6 border-b border-blue-500/20 pb-2">
                <div>
                  <h2 className="text-2xl text-cyan-400 font-light tracking-widest uppercase">{currentMemory.title}</h2>
                  <p className="text-xs text-blue-600 mt-1">{currentMemory.id} // {currentMemory.timestamp}</p>
                </div>
              </div>

              <div className="min-h-[100px] mb-8">
                <p className="text-blue-100/90 text-lg leading-relaxed font-light">
                  {typedContent}
                  <span className="animate-pulse inline-block w-2 h-4 bg-blue-400 ml-1 align-middle"></span>
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-white/30">PRESS "ESC" TO CLOSE</div>
                <button
                  onClick={onCloseMemory}
                  className="px-6 py-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-white transition-colors text-xs tracking-[0.2em] uppercase"
                >
                  CLOSE CONNECTION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};