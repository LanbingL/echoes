import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameScene } from './components/Scene';
import { UI } from './components/UI';
import { WindowsRoom } from './components/WindowsRoom';
import { WatcherRoom } from './components/WatcherRoom';
import { WallRoom } from './components/WallRoom';
import { StoryRoom } from './components/StoryRoom';
import { GameState, MemoryLog } from './types';
import { generateMemoryLog } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [interactId, setInteractId] = useState<string | null>(null);
  const [currentMemory, setCurrentMemory] = useState<MemoryLog | null>(null);
  const [attentionScore, setAttentionScore] = useState(0.0);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
  };

  const handleCloseMemory = () => {
    setGameState(GameState.PLAYING);
    setCurrentMemory(null);
  };
  
  // Explicit exit handler to clean up state
  const handleExitRoom = () => {
    setGameState(GameState.PLAYING);
    // Note: interactId is NOT cleared here so the prompt persists when returning to main scene
  };

  const handleInteraction = useCallback(async () => {
    if (!interactId) return;

    // Room Routing
    if (interactId === 'PINK_DOOR') {
       setGameState(GameState.NEWS_ROOM);
       return;
    }

    if (interactId === 'YELLOW_DOOR') {
        setGameState(GameState.THE_BUILDING);
        return;
    }

    if (interactId === 'STORY_DOOR') {
        setGameState(GameState.STORY_ROOM);
        return;
    }

    if (interactId === 'PROFILE_DOOR') {
        setGameState(GameState.PROFILE_ROOM);
        return;
    }

    if (interactId === 'WATCHER_DOOR') {
        setGameState(GameState.WATCHER_ROOM);
        return;
    }

    // Default: Monolith Memory Interaction
    setGameState(GameState.LOADING_MEMORY);
    
    // Fetch data from Gemini
    const memory = await generateMemoryLog(interactId);
    
    setCurrentMemory(memory);
    setGameState(GameState.READING);
  }, [interactId]);

  // Keyboard interaction handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PLAYING state interactions
      if (gameState === GameState.PLAYING && e.code === 'KeyE' && interactId) {
        handleInteraction();
      }
      // Memory Close
      else if (gameState === GameState.READING && e.code === 'Escape') {
        handleCloseMemory();
      }
      // Room Exits
      else if ((
        gameState === GameState.NEWS_ROOM ||
        gameState === GameState.THE_BUILDING ||
        gameState === GameState.STORY_ROOM ||
        gameState === GameState.PROFILE_ROOM ||
        gameState === GameState.WATCHER_ROOM
      ) && e.code === 'Escape') {
        handleExitRoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, interactId, handleInteraction]);

  // Listen for postMessage from iframe rooms (ESC key handling)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ESC_PRESSED') {
        handleExitRoom();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.7, 0], fov: 75 }}
        gl={{ 
          antialias: false, 
          stencil: false, 
          depth: true,
          powerPreference: "high-performance"
        }}
        // Stop canvas from capturing pointer events when in overlays
        style={{ pointerEvents: (gameState === GameState.PLAYING || gameState === GameState.NEWS_ROOM || gameState === GameState.MENU) ? 'auto' : 'none' }}
      >
        {/* Pure black background for high contrast */}
        <color attach="background" args={['#000000']} />
        <GameScene
          gameState={gameState}
          setInteractId={setInteractId}
          triggerInteract={false}
          setAttentionScore={setAttentionScore}
        />
      </Canvas>
      
      {/* Room Overlays - Only 2D iframe-based rooms render here */}
      {/* NewsFeedRoom renders inside Canvas via Scene.tsx */}
      {gameState === GameState.THE_BUILDING && <WindowsRoom />}
      {gameState === GameState.WATCHER_ROOM && <WatcherRoom />}
      {gameState === GameState.PROFILE_ROOM && <WallRoom />}
      {gameState === GameState.STORY_ROOM && <StoryRoom />}

      {/* UI Overlay */}
      <UI 
        gameState={gameState} 
        onStart={handleStart}
        onCloseMemory={handleCloseMemory}
        onExitRoom={handleExitRoom}
        currentMemory={currentMemory}
        canInteract={!!interactId}
        interactId={interactId}
        attentionScore={attentionScore}
      />
    </div>
  );
};

export default App;