
import React, { useState, useEffect, useRef } from 'react';

// Dot Matrix / Sensor Texture
const DOT_PATTERN = `data:image/svg+xml;base64,${btoa(`
<svg width="4" height="4" viewBox="0 0 4 4" xmlns="http://www.w3.org/2000/svg">
  <rect width="4" height="4" fill="transparent"/>
  <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.6)"/>
</svg>
`)}`;

// Dithering Pattern for glitch effect
const DITHER_PATTERN = `data:image/svg+xml;base64,${btoa(`
<svg width="8" height="8" viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
  <rect width="8" height="8" fill="transparent"/>
  <rect x="0" y="0" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="2" y="1" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="4" y="2" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="6" y="3" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="1" y="4" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="3" y="5" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="5" y="6" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
  <rect x="7" y="7" width="1" height="1" fill="rgba(255,255,0,0.1)"/>
</svg>
`)}`;

// Unique text content for each window
// Grid is 6 columns x 4 rows, indexed 0-23 from top-left to bottom-right
// Rearranged so top row = Floor 4, bottom row = Floor 1
const WINDOW_MESSAGES = [
  // Row 1 (Top) - Floor 4 (indices 0-5)
  "Unit 401: Candles. Hundreds of them. Fire hazard? They don't care.",
  "Unit 402: The photographer. Takes pictures of the building across.",
  "Unit 403: Red light district aesthetic. But they live alone.",
  "Unit 404: Error 404: Resident not found. The door opens by itself.",
  "Unit 405: Birds everywhere. Cages stacked to the ceiling.",
  "Unit 406: The watcher. Binoculars pointed at you. Always.",

  // Row 2 - Floor 3 (indices 6-11)
  "Unit 301: The TV plays static. They watch it like it's a movie.",
  "Unit 302: Papers everywhere. Walls covered in equations.",
  "Unit 303: Two chairs. Dinner set for two. One person eats.",
  "Unit 304: The mirror faces the window. Infinite reflections.",
  "Unit 305: Packed boxes. Been there for years. Never leaving.",
  "Unit 306: They exercise at midnight. Every single night.",

  // Row 3 - Floor 2 (indices 12-17)
  "Unit 201: Music at 3 AM. Classical. Always the same piece.",
  "Unit 202: Six locks on the door. They check each one. Twice.",
  "Unit 203: The plants are dying. No one waters them anymore.",
  "Unit 204: Laughter. Always laughter. But nobody visits.",
  "Unit 205: Curtains drawn. Haven't opened in 847 days.",
  "Unit 206: Someone's counting. You can see their lips moving.",

  // Row 4 (Bottom) - Floor 1 (indices 18-23)
  "Unit 101: The light never goes off. Someone's always watching.",
  "Unit 102: Three screens glow in the dark. No one sleeps here.",
  "Unit 103: Empty. Has been for months. The bills still get paid.",
  "Unit 104: A child's drawing on the window. It changes every week.",
  "Unit 105: Flashing blue light. Police? Ambulance? Every night, same time.",
  "Unit 106: The couple never speaks. Just stare at separate screens."
];

export const WindowsRoom: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Auto-play video when component mounts
  useEffect(() => {
    console.log('BuildingScene mounted, video ref:', videoRef.current);
    if (videoRef.current) {
      console.log('Video element found, attempting to play...');
      videoRef.current.play()
        .then(() => console.log('Video playing successfully'))
        .catch(err => console.error('Video autoplay prevented:', err));
    } else {
      console.error('Video ref is null');
    }
  }, []);

  // Parallax tilt effect based on mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Calculate rotation based on mouse position
      // Range: -5deg to +5deg for both axes
      const rotateY = ((clientX / innerWidth) - 0.5) * 10; // Left-right tilt
      const rotateX = ((clientY / innerHeight) - 0.5) * -10; // Up-down tilt (inverted)

      setTilt({ rotateX, rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate scale to fit viewport while maintaining aspect ratio
  // Video dimensions: 864x448, aspect ratio = 1.929
  // Scale to fit 90% of viewport height for better viewing
  const scaleRef = useRef<HTMLDivElement>(null);

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden pointer-events-auto" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Dark Overlay - Creates the "dark scene" effect */}
      <div className="absolute inset-0 bg-black/80 z-10" />

      {/* 2. Global Blue Dot Matrix Grid */}
      <div className="absolute inset-0 pointer-events-none z-20 mix-blend-hard-light opacity-20"
           style={{ backgroundImage: `url("${DOT_PATTERN}")`, backgroundSize: '4px 4px' }}
      />

      {/* Main Building Container - Scaled to fit viewport */}
      <div
        ref={scaleRef}
        className="relative z-30"
        style={{
          width: '864px',
          height: '448px',
          transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.8)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease-out'
        }}
      >

        {/* Background Video - Exact size matching */}
        <video
          ref={videoRef}
          src="/building 6x4.mp4"
          className="absolute top-0 left-0"
          style={{
            width: '864px',
            height: '448px',
            filter: `brightness(${hoveredIndex !== null ? '0.7' : '0.15'}) contrast(${hoveredIndex !== null ? '1.2' : '1'})`,
            zIndex: 0,
            objectFit: 'cover',
            transition: 'filter 0.3s ease-out'
          }}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => console.log('Video loaded successfully')}
          onError={(e) => console.error('Video error:', e)}
        />


        {/* Window Grid with Video Reveal - Exact pixel alignment */}
        <div className="absolute top-0 left-0 grid grid-cols-6 grid-rows-4 gap-y-[12px] z-10" style={{ width: '864px', height: '448px' }}>
          {Array.from({ length: 24 }).map((_, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className="relative cursor-pointer overflow-hidden"
                style={{
                  width: '144px',
                  height: '100.8px' // 10% smaller than 112px
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setClickedIndex(index)}
              >
                {/* Dark overlay on each window - lightens on hover to reveal video */}
                <div
                  className={`
                    absolute inset-0 bg-black transition-all duration-500 ease-out
                    ${isHovered ? 'opacity-0' : 'opacity-90'}
                  `}
                />

                {/* The Window Frame / Grate Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.6)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.6)_1px,transparent_1px)] bg-[size:10%_20%] z-20 pointer-events-none" />

                {/* Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Click-to-reveal text message - Single line at bottom - Yellow theme */}
      {clickedIndex !== null && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-50 px-4">
          <div
            className="relative bg-black/95 border border-yellow-500/50 px-8 py-4 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 0, 0.3)',
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(255,255,0,0.03)_50%)] bg-[size:100%_4px] pointer-events-none" />

            {/* Text content */}
            <p className="relative z-10 text-sm md:text-base text-yellow-300 tracking-wide leading-relaxed">
              {WINDOW_MESSAGES[clickedIndex]}
            </p>

            {/* Close hint */}
            <div className="absolute -top-8 right-0 text-[10px] text-yellow-500/50 tracking-widest uppercase">
              [CLICK ANYWHERE TO CLOSE]
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {clickedIndex !== null && (
        <div
          className="absolute inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setClickedIndex(null);
          }}
        />
      )}

       {/* Overlay Vignette */}
       <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] z-40" />
    </div>
  );
};