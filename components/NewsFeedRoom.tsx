import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, PerspectiveCamera, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { getRealWorldNews } from '../services/geminiService';
import { NewsItem } from '../types';

// Updated Palette: Cyan -> Blue -> Purple
const COLORS = [
  '#00ffff', // Cyan
  '#06b6d4', // Darker Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#800080'  // Deep Purple
];

// Dot grid texture for the floor/void
const DOT_GRID_URL = `data:image/svg+xml;base64,${btoa(`
<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
  <circle cx="1" cy="1" r="0.5" fill="rgba(50, 100, 255, 0.4)"/>
</svg>
`)}`;

const Floor = () => {
  const texture = useMemo(() => new THREE.TextureLoader().load(DOT_GRID_URL), []);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(100, 100);

  return (
    <mesh position={[0, -8, -60]} rotation={[-Math.PI / 2, 0, 0]}>
       <planeGeometry args={[200, 300]} />
       <meshStandardMaterial 
          map={texture}
          color="#000000" 
          roughness={0.2} 
          metalness={0.8}
          transparent
          opacity={0.8}
       />
       {/* Secondary glow grid */}
       <gridHelper args={[200, 50, '#1e3a8a', '#000000']} position={[0, 0.1, 0]} rotation={[Math.PI/2, 0, 0]} />
    </mesh>
  );
}

const DigitalScreen = ({ 
  item, 
  position, 
  rotation,
  scale = 1,
  color,
  index,
  fontSize,
  pixelHeight,
  meshHeight
}: { 
  key?: any,
  item?: NewsItem, 
  position: [number, number, number], 
  rotation: [number, number, number],
  scale?: number,
  color: string,
  index: number,
  fontSize: number,
  pixelHeight: number,
  meshHeight: number
}) => {
  // Fallback content for loading state
  const displayTitle = item ? item.title : "INITIALIZING DATA STREAM...";
  const displaySource = item ? item.source : "SYSTEM_BOOT";
  const displayUrl = item ? (item.url !== '#' ? item.url : 'ENCRYPTED') : "WAITING FOR SIGNAL...";
  const isLoading = !item;

  // Screen Dimensions - Increased depth for Cube look
  const screenWidth = 4.2;
  const screenDepth = 4.0; 
  const borderThickness = 0.4; 

  // Calculate tinted text color
  // Goal: Same Hue, Less Saturation (but not white), High Lightness
  const textColor = useMemo(() => {
      const c = new THREE.Color(color);
      const hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      // Keep saturation around 60% (0.6) so it clearly looks colored, not white.
      // Lightness at 80% (0.8) so it's bright and readable text.
      c.setHSL(hsl.h, 0.6, 0.8); 
      return c.getStyle();
  }, [color]);
  
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
    <group position={position} rotation={rotation} scale={scale}>
      
      {/* 1. Main Chassis - Thick Cube */}
      <mesh position={[0, 0, -screenDepth / 2]}>
        <boxGeometry args={[screenWidth + borderThickness, meshHeight + borderThickness, screenDepth]} />
        <meshPhysicalMaterial 
            color="#050505" 
            roughness={0.3} 
            metalness={0.6} 
            clearcoat={0.2}
        />
      </mesh>

      {/* 2. Tech Wireframe Cage */}
      <mesh position={[0, 0, -screenDepth / 2]}>
        <boxGeometry args={[screenWidth + borderThickness + 0.1, meshHeight + borderThickness + 0.1, screenDepth + 0.1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
      </mesh>

      {/* 3. Rear Reactor/Glow Panel */}
      <mesh position={[0, 0, -screenDepth - 0.01]} rotation={[0, Math.PI, 0]}>
         <planeGeometry args={[screenWidth - 0.5, meshHeight - 0.5]} />
         <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      
      {/* 4. Rear Volumetric Glow */}
      <mesh position={[0, 0, -screenDepth - 0.5]}>
         <boxGeometry args={[screenWidth + 1, meshHeight + 1, 1]} />
         <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* 5. HTML Text Content (Front Face) */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.06]} 
        pointerEvents="none"
        style={{
          width: '800px',
          height: `${pixelHeight}px`,
          backgroundColor: '#000',
          userSelect: 'none',
          pointerEvents: 'none',
          perspective: '1000px',
          fontFamily: "'VT323', monospace" // Explicitly enforcing just in case
        }}
      >
        <div 
            className="w-full h-full flex flex-col border-4 transition-all duration-300 bg-black relative overflow-hidden group"
            style={{ 
                borderColor: `${color}`, 
                boxShadow: `inset 0 0 80px ${color}20` 
            }}
        >
            <style>{`
              @keyframes scroll-continuous {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
              .scrolling-wrapper {
                display: flex;
                width: max-content;
                animation: scroll-continuous ${40 + (index % 5) * 10}s linear infinite;
                pointer-events: none;
              }
              .lcd-grid {
                 background-image: radial-gradient(${color}40 1px, transparent 1px);
                 background-size: 4px 4px;
              }
            `}</style>
            
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-gray-900/80 pb-2 p-6 mb-2 bg-black/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${isLoading ? 'animate-pulse' : ''}`} style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
                    <span className="text-2xl tracking-[0.2em] uppercase font-bold" style={{ color: color, textShadow: `0 0 5px ${color}80` }}>{displaySource}</span>
                </div>
                <span className="text-xl tracking-widest" style={{ color: textColor }}>CH_{index.toString().padStart(2, '0')}</span>
            </div>

            {/* Main Title - Seamless Continuous Scrolling */}
            <div className="flex-grow flex items-center w-full overflow-hidden relative z-10">
                {isLoading ? (
                    <div className="w-full text-center animate-pulse">
                         <h1 
                            className="font-bold leading-none tracking-tight uppercase"
                            style={{ 
                                color: textColor,
                                fontSize: '36px', // Smaller, fixed size for loading state
                                letterSpacing: '0.1em'
                            }}
                        >
                            {displayTitle}
                        </h1>
                    </div>
                ) : (
                    <div className="scrolling-wrapper">
                        {[0, 1].map((key) => (
                           <h1 
                                key={key}
                                className="font-bold leading-none tracking-tighter uppercase px-8"
                                style={{ 
                                    color: textColor,
                                    fontSize: `${fontSize}px`,
                                    whiteSpace: 'nowrap',
                                    textShadow: `0 0 15px ${color}aa` 
                                }}
                            >
                                {Array(6).fill(displayTitle).join('  ///  ') + '  ///  '}
                            </h1>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Deco */}
            <div className="border-t-2 border-gray-900/80 pt-2 p-6 flex justify-between items-end z-10 bg-black/80">
                <div className="text-xl max-w-[70%] truncate uppercase tracking-widest" style={{ color: textColor }}>
                    {displayUrl}
                </div>
                <div className="flex gap-1">
                    {[0,1,2].map(k => <div key={k} className="w-1 h-1" style={{ backgroundColor: textColor }} />)}
                </div>
            </div>
            
            {/* LCD / Pixel Grid Texture Overlay */}
            <div className="absolute inset-0 lcd-grid pointer-events-none opacity-40 z-0" />
            
            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 z-20" 
                 style={{
                    background: 'linear-gradient(rgba(0,0,0,0) 50%, rgba(0, 0, 0, 0.5) 50%)',
                    backgroundSize: '100% 4px'
                 }} 
            />
            
            {/* Screen Glare */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent pointer-events-none z-30" />
        </div>
      </Html>
    </group>
    </Float>
  );
};

export const NewsFeedRoom: React.FC<{ setAttentionScore: (fn: (prev: number) => number) => void }> = ({ setAttentionScore }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const isDragging = useRef(false);
  const targetZ = useRef(15);
  const { gl } = useThree();

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging.current = true;
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !cameraRef.current) return;
      const sensitivity = 0.003;
      cameraRef.current.rotation.order = 'YXZ'; 
      cameraRef.current.rotation.y -= e.movementX * sensitivity;
      cameraRef.current.rotation.x -= e.movementY * sensitivity;
      const maxPolar = Math.PI / 2.2;
      cameraRef.current.rotation.x = Math.max(-maxPolar, Math.min(maxPolar, cameraRef.current.rotation.x));
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    if (cameraRef.current) {
        cameraRef.current.rotation.set(0, 0, 0);
    }
    
    return () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const sensitivity = 0.05;
      const newZ = targetZ.current + e.deltaY * sensitivity;
      targetZ.current = THREE.MathUtils.clamp(newZ, 2, 50);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const loadNews = async () => {
        const items = await getRealWorldNews();
        let filledItems = [...items];
        while (filledItems.length < 25) {
            filledItems = [...filledItems, ...items];
        }
        setNewsItems(filledItems.slice(0, 25));
    };

    loadNews();
  }, []);

  const screenLayouts = useMemo(() => {
    const layouts = [];
    const count = 25; 
    
    const createLayout = (i: number) => {
        const fontSize = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
        const pixelHeight = 130 + (fontSize * 1.3); 
        const meshHeight = pixelHeight * 0.00525;
        const type = i % 6;
        let pos: [number, number, number] = [0, 0, 0];
        let rot: [number, number, number] = [0, 0, 0];
        const baseZ = - (i * 4) + 10; 
        const zNoise = (Math.random() * 20) - 10;
        const z = baseZ + zNoise;

        if (type === 0 || type === 1) { 
            pos = [-14 - Math.random() * 14, (Math.random() * 14) - 4, z];
            rot = [0, Math.PI / 2 + (Math.random() * 0.3 - 0.15), 0]; 
        } else if (type === 2 || type === 3) {
            pos = [14 + Math.random() * 14, (Math.random() * 14) - 4, z];
            rot = [0, -Math.PI / 2 + (Math.random() * 0.3 - 0.15), 0];
        } else if (type === 4) {
            pos = [(Math.random() * 20) - 10, 14 + Math.random() * 4, z];
            rot = [Math.PI / 2, 0, (Math.random() * 0.4) - 0.2];
        } else {
            pos = [(Math.random() * 20) - 10, -5 - Math.random() * 3, z];
            rot = [-Math.PI / 2.5, 0, (Math.random() * 0.2) - 0.1];
        }

        return {
            pos,
            rot,
            scale: 0.8 + Math.random() * 0.7, 
            color: COLORS[i % COLORS.length],
            fontSize,
            pixelHeight,
            meshHeight
        };
    };

    for (let i = 0; i < count; i++) {
        layouts.push(createLayout(i));
    }
    return layouts;
  }, []);

  useFrame(() => {
     if (cameraRef.current) {
        cameraRef.current.position.z = THREE.MathUtils.lerp(
            cameraRef.current.position.z, 
            targetZ.current, 
            0.1
        );
     }
  });

  return (
    <>
      <color attach="background" args={['#000']} />
      {/* High Contrast Fog */}
      <fog attach="fog" args={['#020202', 5, 50]} />
      <ambientLight intensity={0.2} />
      
      {/* Cold Holographic Lights */}
      {Array.from({length: 4}).map((_, i) => (
          <pointLight 
            key={i} 
            position={[Math.sin(i)*20, 10, -i * 20]} 
            intensity={2} 
            distance={40} 
            color={COLORS[i % COLORS.length]} 
          />
      ))}
      
      <PerspectiveCamera 
        makeDefault 
        ref={cameraRef as any}
        position={[0, 4, 15]} 
        fov={65} 
      />

      {screenLayouts.map((layout, i) => {
         const item = newsItems[i]; 
         return (
            <DigitalScreen
              key={i}
              index={i}
              item={item}
              position={layout.pos as [number, number, number]}
              rotation={layout.rot as [number, number, number]}
              scale={layout.scale}
              color={layout.color}
              fontSize={layout.fontSize}
              pixelHeight={layout.pixelHeight}
              meshHeight={layout.meshHeight}
            />
         );
      })}

      <Floor />
      
      {/* Floating Data Dust */}
      <Sparkles 
        count={500} 
        scale={[40, 20, 60]} 
        size={3} 
        speed={0.2} 
        opacity={0.6} 
        color="#3b82f6" 
        position={[0, 0, -20]}
      />
    </>
  );
};