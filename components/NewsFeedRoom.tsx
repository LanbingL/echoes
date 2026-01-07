import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, PerspectiveCamera, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { getRealWorldNews } from '../services/geminiService';
import { NewsItem } from '../types';

// Video Card Component at the end of tunnel
const VideoCard = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/the eye.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video.play().catch(e => console.log('Video autoplay blocked:', e));

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    setVideoTexture(texture);

    return () => {
      video.pause();
      video.src = '';
      texture.dispose();
    };
  }, []);

  return (
    <group position={position}>
      {/* Main video card - larger size with screen blending */}
      <mesh ref={meshRef}>
        <planeGeometry args={[28, 17.5]} />
        {videoTexture ? (
          <meshBasicMaterial
            map={videoTexture}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
            transparent
          />
        ) : (
          <meshStandardMaterial color="#111111" />
        )}
      </mesh>
      {/* Light to illuminate surroundings */}
      <pointLight position={[0, 0, 2]} intensity={3} distance={35} color="#aaaaff" />
    </group>
  );
};

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
    </mesh>
  );
}

const DigitalScreen = ({
  item,
  position,
  rotation,
  scale = 1,
  color,
  index
}: {
  key?: any,
  item?: NewsItem,
  position: [number, number, number],
  rotation: [number, number, number],
  scale?: number,
  color: string,
  index: number
}) => {
  // Fallback content for loading state
  const displayTitle = item ? item.title : "INITIALIZING DATA STREAM...";
  const displaySource = item ? item.source : "SYSTEM_BOOT";
  const displayUrl = item ? (item.url !== '#' ? item.url : 'ENCRYPTED') : "WAITING FOR SIGNAL...";
  const isLoading = !item;

  // Click/Glitch state
  const [isGlitching, setIsGlitching] = useState(false);
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glitchIntensity = useRef(0);

  // Handle click - trigger glitch effect
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!isGlitching) {
      setIsGlitching(true);
      // Auto-reset after 1.5 seconds
      setTimeout(() => setIsGlitching(false), 1500);
    }
  };

  // Animate glitch effect
  useFrame(() => {
    const targetIntensity = isGlitching ? 1 : 0;
    glitchIntensity.current = THREE.MathUtils.lerp(glitchIntensity.current, targetIntensity, 0.1);

    // Animate light intensity
    if (lightRef.current) {
      const baseIntensity = 0.8;
      const glitchBoost = glitchIntensity.current * 15;
      const flicker = isGlitching ? Math.random() * 5 : 0;
      lightRef.current.intensity = baseIntensity + glitchBoost + flicker;
      lightRef.current.distance = 10 + glitchIntensity.current * 20;
    }

    // Animate glow opacity
    if (glowRef.current && glowRef.current.material) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + glitchIntensity.current * 0.6;
    }
  });

  // Screen Dimensions - 16:9 aspect ratio
  const screenWidth = 5.6;  // Width in 3D units
  const screenHeight = 3.15; // Height = width / (16/9) = 5.6 / 1.778 ≈ 3.15

  // HTML container dimensions matching 16:9
  const pixelWidth = 640;
  const pixelHeight = 360; // 640 / 16 * 9 = 360

  // Use the same color as the border for the title text
  const textColor = color;

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
    <group position={position} rotation={rotation} scale={scale}>

      {/* 1. Solid Screen Face - completely opaque & clickable */}
      <mesh position={[0, 0, 0.01]} onClick={handleClick}>
         <planeGeometry args={[screenWidth, screenHeight]} />
         <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>

      {/* 2. Subtle Glow behind screen */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
         <planeGeometry args={[screenWidth + 0.3, screenHeight + 0.3]} />
         <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>

      {/* 3. Point light for subtle screen glow */}
      <pointLight ref={lightRef} position={[0, 0, 1.5]} intensity={0.8} distance={10} color={color} />

      {/* 5. HTML Text Content (Front Face) */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.06]}
        pointerEvents="none"
        style={{
          width: `${pixelWidth}px`,
          height: `${pixelHeight}px`,
          backgroundColor: '#000',
          userSelect: 'none',
          pointerEvents: 'none',
          perspective: '1000px',
          fontFamily: "'VT323', monospace"
        }}
      >
        <div
            className={`w-full h-full flex flex-col border-4 transition-all duration-300 bg-black relative overflow-hidden group ${isGlitching ? 'screen-glitching' : ''}`}
            style={{
                borderColor: `${color}`,
                boxShadow: isGlitching
                  ? `inset 0 0 120px ${color}80, 0 0 40px ${color}60, 0 0 80px ${color}40`
                  : `inset 0 0 80px ${color}20`
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
              @keyframes glitch-skew {
                0% { transform: skew(0deg, 0deg); }
                10% { transform: skew(-2deg, -1deg); }
                20% { transform: skew(3deg, 0deg); }
                30% { transform: skew(0deg, 1deg); }
                40% { transform: skew(-1deg, -2deg); }
                50% { transform: skew(2deg, 1deg); }
                60% { transform: skew(-3deg, 0deg); }
                70% { transform: skew(1deg, -1deg); }
                80% { transform: skew(0deg, 2deg); }
                90% { transform: skew(-2deg, -1deg); }
                100% { transform: skew(0deg, 0deg); }
              }
              @keyframes glitch-color {
                0% { filter: hue-rotate(0deg) saturate(1) brightness(1); }
                20% { filter: hue-rotate(90deg) saturate(2) brightness(1.5); }
                40% { filter: hue-rotate(-90deg) saturate(1.5) brightness(2); }
                60% { filter: hue-rotate(180deg) saturate(2) brightness(1.2); }
                80% { filter: hue-rotate(-45deg) saturate(1.8) brightness(1.8); }
                100% { filter: hue-rotate(0deg) saturate(1) brightness(1); }
              }
              @keyframes glitch-clip {
                0% { clip-path: inset(0 0 0 0); }
                10% { clip-path: inset(40% 0 30% 0); }
                20% { clip-path: inset(92% 0 1% 0); }
                30% { clip-path: inset(20% 0 60% 0); }
                40% { clip-path: inset(70% 0 10% 0); }
                50% { clip-path: inset(10% 0 80% 0); }
                60% { clip-path: inset(50% 0 30% 0); }
                70% { clip-path: inset(5% 0 90% 0); }
                80% { clip-path: inset(80% 0 5% 0); }
                90% { clip-path: inset(30% 0 50% 0); }
                100% { clip-path: inset(0 0 0 0); }
              }
              @keyframes glitch-flash {
                0%, 100% { opacity: 1; }
                10% { opacity: 0.8; }
                20% { opacity: 1; }
                30% { opacity: 0.6; }
                40% { opacity: 1; }
                50% { opacity: 0.9; }
                60% { opacity: 0.7; }
                70% { opacity: 1; }
                80% { opacity: 0.85; }
                90% { opacity: 1; }
              }
              .screen-glitching {
                animation: glitch-skew 0.15s infinite, glitch-color 0.3s infinite, glitch-flash 0.1s infinite;
              }
              .screen-glitching::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(transparent 50%, rgba(255,255,255,0.1) 50%);
                background-size: 100% 4px;
                animation: glitch-clip 0.2s infinite;
                pointer-events: none;
                z-index: 100;
              }
            `}</style>

            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-gray-900/80 pb-3 p-5 mb-1 bg-black/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-sm ${isLoading ? 'animate-pulse' : ''}`} style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }} />
                    <span className="text-4xl tracking-[0.15em] uppercase font-bold" style={{ color: color, textShadow: `0 0 10px ${color}80` }}>{displaySource}</span>
                </div>
                <span className="text-3xl tracking-widest" style={{ color: textColor, textShadow: `0 0 8px ${color}60` }}>CH_{index.toString().padStart(2, '0')}</span>
            </div>

            {/* Main Title - Seamless Continuous Scrolling */}
            <div className="flex-grow flex items-center w-full overflow-hidden relative z-10">
                {isLoading ? (
                    <div className="w-full text-center animate-pulse">
                         <h1
                            className="font-bold leading-none tracking-tight uppercase"
                            style={{
                                color: textColor,
                                fontSize: '72px',
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
                                className="font-bold leading-none tracking-tighter uppercase px-4"
                                style={{
                                    color: textColor,
                                    fontSize: '110px',
                                    whiteSpace: 'nowrap',
                                    textShadow: `0 0 15px ${color}80`
                                }}
                            >
                                {Array(4).fill(displayTitle).join('  ///  ') + '  ///  '}
                            </h1>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer / Deco */}
            <div className="border-t-4 border-gray-900/80 pt-3 p-5 flex justify-between items-end z-10 bg-black/80">
                <div className="text-2xl max-w-[70%] truncate uppercase tracking-wider" style={{ color: textColor, textShadow: `0 0 8px ${color}60` }}>
                    {displayUrl}
                </div>
                <div className="flex gap-2">
                    {[0,1,2].map(k => <div key={k} className="w-3 h-3" style={{ backgroundColor: textColor }} />)}
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
      targetZ.current = THREE.MathUtils.clamp(newZ, -30, 40);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const loadNews = async () => {
        const items = await getRealWorldNews();
        let filledItems = [...items];
        while (filledItems.length < 24) {
            filledItems = [...filledItems, ...items];
        }
        setNewsItems(filledItems.slice(0, 24));
    };

    loadNews();
  }, []);

  const screenLayouts = useMemo(() => {
    const layouts = [];
    const count = 24; // 6 screens per side x 4 sides = 24 screens

    // 4 sides: left wall, right wall, ceiling, floor
    // 6 screens per side, distributed along the Z axis
    const screensPerSide = 6;
    const zSpacing = 15; // Distance between screens on same side
    const startZ = 5; // Starting Z position

    const createLayout = (i: number) => {
        // Determine which side (0-3) and which position along that side (0-5)
        const sideIndex = Math.floor(i / screensPerSide); // 0=left, 1=right, 2=ceiling, 3=floor
        const positionIndex = i % screensPerSide;

        let pos: [number, number, number] = [0, 0, 0];
        let rot: [number, number, number] = [0, 0, 0];

        // Z position based on position index (with small random offset)
        const z = startZ - (positionIndex * zSpacing) + (Math.random() * 3 - 1.5);

        // Small X variation for walls, small X/Z variation for ceiling/floor
        const xVariation = (Math.random() * 4) - 2;
        const yVariation = (Math.random() * 3) - 1.5;

        // Stagger Y position based on position index to reduce overlap
        const yOffset = (positionIndex % 3) * 4 - 4; // Creates -4, 0, 4 pattern

        switch (sideIndex) {
            case 0: // Left wall - facing right (90 degrees on Y)
                pos = [-18 - Math.random() * 2, 2 + yOffset + yVariation, z];
                rot = [0, Math.PI / 2, 0];
                break;
            case 1: // Right wall - facing left (-90 degrees on Y)
                pos = [18 + Math.random() * 2, 2 + yOffset + yVariation, z];
                rot = [0, -Math.PI / 2, 0];
                break;
            case 2: // Ceiling - facing down (90 degrees on X)
                pos = [xVariation, 14 + Math.random() * 2, z];
                rot = [Math.PI / 2, 0, 0];
                break;
            case 3: // Floor - facing up (-90 degrees on X)
                pos = [xVariation, -6 - Math.random() * 2, z];
                rot = [-Math.PI / 2, 0, 0];
                break;
        }

        return {
            pos,
            rot,
            scale: 0.85 + Math.random() * 0.4,
            color: COLORS[i % COLORS.length]
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
      {/* Extended fog for deeper tunnel */}
      <fog attach="fog" args={['#020202', 10, 120]} />
      <ambientLight intensity={0.3} />

      {/* Lights along the tunnel - extended range */}
      {Array.from({length: 8}).map((_, i) => (
          <pointLight
            key={i}
            position={[Math.sin(i) * 15, 8, 5 - i * 12]}
            intensity={2.5}
            distance={50}
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
            />
         );
      })}

      <Floor />

      {/* End Card - Video card at the far end of the tunnel */}
      <VideoCard position={[0, 4, -90]} />

      {/* Floating Data Dust - Reduced density and glow */}
      <Sparkles
        count={150}
        scale={[50, 30, 120]}
        size={2.5}
        speed={0.2}
        opacity={0.5}
        color="#00ffff"
        position={[0, 0, -40]}
      />
      <Sparkles
        count={120}
        scale={[50, 30, 120]}
        size={2}
        speed={0.15}
        opacity={0.45}
        color="#8b5cf6"
        position={[5, 2, -35]}
      />
      <Sparkles
        count={100}
        scale={[50, 30, 120]}
        size={2}
        speed={0.25}
        opacity={0.4}
        color="#d946ef"
        position={[-5, -2, -45]}
      />
      <Sparkles
        count={80}
        scale={[50, 30, 120]}
        size={2.5}
        speed={0.1}
        opacity={0.35}
        color="#3b82f6"
        position={[0, 5, -50]}
      />
      <Sparkles
        count={60}
        scale={[50, 30, 120]}
        size={2}
        speed={0.18}
        opacity={0.4}
        color="#f43f5e"
        position={[-8, 0, -30]}
      />
      <Sparkles
        count={60}
        scale={[50, 30, 120]}
        size={1.8}
        speed={0.22}
        opacity={0.35}
        color="#22c55e"
        position={[8, -3, -55]}
      />
    </>
  );
};