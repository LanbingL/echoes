import React from 'react';

export const WatcherRoom: React.FC = () => {
  const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>ROOM 05 // THE WATCHER</title>

  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
    :root{ --g:#00ff6a; --bg:#000500; }
    html,body{height:100%; margin:0;}
    body{
      background:var(--bg);
      overflow:hidden;
      font-family:'Share Tech Mono', ui-monospace, monospace;
      user-select:none;
    }
    canvas{display:block;}

    .ui-layer{position:absolute; inset:0; pointer-events:none; z-index:10;}
    .hud-text{text-shadow:0 0 5px var(--g);}
    .scanline{
      position:absolute; inset:0; pointer-events:none; z-index:20;
      background:
        linear-gradient(rgba(0, 20, 0, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
        linear-gradient(90deg, rgba(0,255,0,0.06), rgba(0,255,0,0.02), rgba(0,255,0,0.06));
      background-size:100% 2px, 3px 100%;
    }
    .game-over{backdrop-filter: blur(10px); background: rgba(0,10,0,0.9);}
    .blink{animation: blinker 1s linear infinite;}
    @keyframes blinker{50%{opacity:0;}}
    .watcher-log{font-size:10px; color:var(--g); opacity:.85; letter-spacing:.12em;}
  </style>

  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "three": "https://esm.sh/three@0.160.0",
        "@react-three/fiber": "https://esm.sh/@react-three/fiber@8.15.14?external=react,react-dom,three",
        "@react-three/drei": "https://esm.sh/@react-three/drei@9.96.1?external=react,react-dom,three,@react-three/fiber",
        "@react-three/postprocessing": "https://esm.sh/@react-three/postprocessing@2.16.0?external=react,react-dom,three,@react-three/fiber"
      }
    }
  </script>
</head>

<body>
  <div id="root"></div>

  <script type="text/babel" data-type="module">
    import React, { useEffect, useMemo, useRef, useState } from "react";
    import { createRoot } from "react-dom/client";
    import * as THREE from "three";
    import { Canvas, useFrame } from "@react-three/fiber";
    import { PerspectiveCamera, Grid } from "@react-three/drei";
    import { EffectComposer, Bloom, Noise, Vignette, Scanline } from "@react-three/postprocessing";

    /***********************
     * CONSTANTS (Updated from reference)
     ***********************/
    const FLOOR_Y = 0;
    const CEILING_Y = 5.2;

    const CORRIDOR_HALF_WIDTH = 4.2;    // X range
    const SEGMENT_LENGTH = 24;

    const SPEED_BASE = 0.28;

    // Visibility
    const FOG_NEAR = 2;
    const FOG_FAR  = 230;

    // Cameras (endless field)
    const DESIRED_CAMERAS = 20;
    const SPAWN_MAX_Z = -30;   // closest camera spawn
    const SPAWN_MIN_Z = -190;  // guarantee cameras down corridor
    const PRUNE_Z     = 18;
    const SPACING_MIN = 10;
    const SPACING_MAX = 16;

    // Laser sweep
    const SWEEP_YAW_AMPL = 1.05;         // radians
    const SWEEP_SPEED_MIN = 1.0;
    const SWEEP_SPEED_MAX = 2.0;

    // Laser pitch (downward toward floor/road). Higher = steeper downward.
    const LASER_DOWN = 1.0;    // y component (down)
    const LASER_FWD  = 0.55;   // z component (forward)
    const LASER_SIDE = 0.9;    // x component (side) from yaw

    // Collision (player touches laser on the road)
    const HIT_RADIUS_XZ = 0.85; // Increased to match larger visual impact

    const rand = (a,b)=> a + Math.random()*(b-a);

    async function generateWatcherCommentary(){
      const pool = [
        "SUBJECT IN FRAME.",
        "GAZE LOCKED.",
        "TRAJECTORY PREDICTED.",
        "DODGE PATTERN LOGGED.",
        "YOU ARE MEASURABLE.",
        "THE ROAD REMEMBERS."
      ];
      return pool[(Math.random()*pool.length)|0];
    }

    function makeCamera(z){
      return {
        id: Math.random(),
        z,
        x: rand(-CORRIDOR_HALF_WIDTH*0.75, CORRIDOR_HALF_WIDTH*0.75),
        yawSeed: Math.random()*10,
        yawBias: rand(-0.45, 0.45),
        speed: rand(SWEEP_SPEED_MIN, SWEEP_SPEED_MAX)
      };
    }

    /***********************
     * VISUAL: corridor belt
     ***********************/
    const TunnelSegment = ({ z }) => {
      const particles = useMemo(() => {
        const count = 180; // Reduced density
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const palette = [
          new THREE.Color("#00ff6a"),
          new THREE.Color("#20cfff"),
          new THREE.Color("#4f7cff"),
          new THREE.Color("#8b5cff"),
          new THREE.Color("#ff4fd8"),
          new THREE.Color("#ffe94a")
        ];

        for(let i=0;i<count;i++){
          // Surround the main track like a corridor (Walls and Ceiling)
          const zone = Math.random();
          let x, y, zz;

          zz = rand(-SEGMENT_LENGTH/2, SEGMENT_LENGTH/2);

          if (zone < 0.4) {
             // Left Wall
             x = rand(-CORRIDOR_HALF_WIDTH * 3.0, -CORRIDOR_HALF_WIDTH * 1.1);
             y = rand(FLOOR_Y, CEILING_Y * 2.5);
          } else if (zone < 0.8) {
             // Right Wall
             x = rand(CORRIDOR_HALF_WIDTH * 1.1, CORRIDOR_HALF_WIDTH * 3.0);
             y = rand(FLOOR_Y, CEILING_Y * 2.5);
          } else {
             // Ceiling / Top
             x = rand(-CORRIDOR_HALF_WIDTH * 3.0, CORRIDOR_HALF_WIDTH * 3.0);
             y = rand(CEILING_Y * 0.9, CEILING_Y * 3.0);
          }

          positions[i*3] = x;
          positions[i*3+1] = y;
          positions[i*3+2] = zz;

          const c = palette[(Math.random()*palette.length)|0].clone();
          const bright = (Math.random()>0.82) ? 1.0 : (0.45 + Math.random()*0.45);
          c.multiplyScalar(bright);

          colors[i*3] = c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
        }

        return { positions, colors };
      }, []);

      return (
        <group position={[0,0,z]}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" array={particles.positions} itemSize={3} count={particles.positions.length/3} />
              <bufferAttribute attach="attributes-color" array={particles.colors} itemSize={3} count={particles.colors.length/3} />
            </bufferGeometry>
            <pointsMaterial size={0.10} vertexColors transparent opacity={0.90} sizeAttenuation />
          </points>

          {/* Road */}
          <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[CORRIDOR_HALF_WIDTH*2.2, SEGMENT_LENGTH]} />
            <meshStandardMaterial color="#020a02" roughness={0.25} metalness={0.7} />
          </mesh>

          {/* Grid on road */}
          <Grid
            position={[0, FLOOR_Y+0.01, 0]}
            args={[CORRIDOR_HALF_WIDTH*2.2, SEGMENT_LENGTH]}
            cellSize={1}
            cellThickness={1}
            cellColor="#003b2a"
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor="#00ff6a"
            fadeDistance={80}
            infiniteGrid
          />
        </group>
      );
    };

    /***********************
     * PLAYER
     ***********************/
    const Player = ({ xRef }) => {
      const groupRef = useRef();

      // Limb Refs for animation
      const leftArm = useRef();
      const rightArm = useRef();
      const leftLeg = useRef();
      const rightLeg = useRef();
      const head = useRef();

      useFrame((state) => {
        const t = state.clock.elapsedTime;
        const runFreq = 12; // Speed of limb oscillation

        // 1. Movement / Input Logic
        const targetX = state.pointer.x * CORRIDOR_HALF_WIDTH * 0.92;
        if(groupRef.current){
          // Smooth Lerp to mouse position
          groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.20);
          xRef.current = groupRef.current.position.x;

          // Vertical Bobbing (Bounce)
          groupRef.current.position.y = FLOOR_Y + 0.85 + Math.abs(Math.sin(t * runFreq)) * 0.1;

          // Tilt body slightly into turn
          const tilt = (groupRef.current.position.x - targetX) * 0.1;
          groupRef.current.rotation.z = tilt;
          groupRef.current.rotation.y = -tilt * 0.5; // Turn into movement
        }

        // 2. Running Animation (Simple Sine Waves)
        // Arms (Opposite phase)
        if(leftArm.current)  leftArm.current.rotation.x  = Math.sin(t * runFreq) * 0.6;
        if(rightArm.current) rightArm.current.rotation.x = Math.sin(t * runFreq + Math.PI) * 0.6;

        // Legs (Opposite to arms on same side for balance)
        if(leftLeg.current)  leftLeg.current.rotation.x  = Math.sin(t * runFreq + Math.PI) * 0.8;
        if(rightLeg.current) rightLeg.current.rotation.x = Math.sin(t * runFreq) * 0.8;

        // Head sway & Dynamic Bob
        if(head.current) {
          head.current.rotation.y = Math.sin(t * runFreq * 0.5) * 0.1;
          head.current.position.y = 0.55 + Math.cos(t * runFreq) * 0.04;
        }
      });

      // Material for the character
      const charMat = <meshStandardMaterial color="#00ff6a" roughness={0.3} metalness={0.8} emissive="#004400" />;

      return (
        <group ref={groupRef} position={[0, FLOOR_Y + 0.85, 0]}>
          {/* TORSO */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.35, 0.5, 0.2]} />
            {charMat}
          </mesh>

          {/* HEAD */}
          <group position={[0, 0.55, 0]} ref={head}>
            <mesh>
              <sphereGeometry args={[0.11, 16, 16]} />
              {/* Glowing Head Material */}
              <meshStandardMaterial
                color="#00ff6a"
                emissive="#00ff6a"
                emissiveIntensity={1.2}
                toneMapped={false}
              />
            </mesh>
            {/* Visor Removed */}
          </group>

          {/* ARMS (Pivot at shoulder height) */}
          <group position={[-0.25, 0.4, 0]} ref={leftArm}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.45, 0.1]} />
              {charMat}
            </mesh>
            <mesh position={[0, -0.45, 0.05]}> {/* Hand/Fist */}
               <sphereGeometry args={[0.07, 8, 8]} />
               {charMat}
            </mesh>
          </group>

          <group position={[0.25, 0.4, 0]} ref={rightArm}>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.1, 0.45, 0.1]} />
              {charMat}
            </mesh>
             <mesh position={[0, -0.45, 0.05]}> {/* Hand/Fist */}
               <sphereGeometry args={[0.07, 8, 8]} />
               {charMat}
            </mesh>
          </group>

          {/* LEGS (Pivot at hip height) */}
          <group position={[-0.12, -0.1, 0]} ref={leftLeg}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.12, 0.6, 0.12]} />
              {charMat}
            </mesh>
          </group>

          <group position={[0.12, -0.1, 0]} ref={rightLeg}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.12, 0.6, 0.12]} />
              {charMat}
            </mesh>
          </group>

          {/* Shadow/Grounding glow */}
          <pointLight color="#00ff6a" distance={3} intensity={1.5} decay={2} position={[0, -0.5, 0]} />
        </group>
      );
    };

    /***********************
     * CAMERA CUBE + LASER (from top to road)
     ***********************/
    const CameraCube = ({ cam, laserOut, globalSpeed }) => {
      // laserOut: a ref object where we write current impact point for collision
      const rigRef = useRef();
      const lineRef = useRef();
      const impactRef = useRef();

      // Reuse objects
      const ray = useMemo(() => new THREE.Ray(), []);
      const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0,1,0), -FLOOR_Y), []);
      const start = useMemo(() => new THREE.Vector3(), []);
      const dir   = useMemo(() => new THREE.Vector3(), []);
      const end   = useMemo(() => new THREE.Vector3(), []);
      const pivot = useMemo(() => new THREE.Vector3(), []);
      const target= useMemo(() => new THREE.Vector3(), []);

      // We use a ref for phase so we can accelerate rotation smoothly without jumps
      // (If we just multiplied time * speed, changing speed would cause the sine wave to jump)
      const phase = useRef(cam.yawSeed);

      useFrame((state, delta) => {
        // Calculate difficulty multiplier based on player speed
        // Starts around 1.0 and increases as player runs faster
        const difficulty = globalSpeed.current / SPEED_BASE;

        // Accumulate phase (rotation) based on current difficulty
        phase.current += delta * cam.speed * difficulty;

        // Sweep yaw (left-right) using accumulated phase
        const yaw = Math.sin(phase.current) * SWEEP_YAW_AMPL + cam.yawBias;

        // Laser direction (World Space)
        dir.set(
          Math.sin(yaw) * LASER_SIDE,
          -LASER_DOWN,
          LASER_FWD
        ).normalize();

        // Rotate Camera Rig to look at the laser target
        if (rigRef.current) {
          // Pivot is the camera mount point (parent group position)
          pivot.set(cam.x, CEILING_Y, cam.z);
          // Target is a point along the direction vector from the pivot
          target.copy(pivot).add(dir);

          rigRef.current.lookAt(target);

          // Force matrix update so we can calculate the exact world position of the "Eye"
          rigRef.current.updateMatrixWorld();

          // Set start point to the Lens/Eye position (Local -> World)
          // Eye is at local: 0, -0.05, 0.55
          start.set(0, -0.05, 0.55);
          rigRef.current.localToWorld(start);
        } else {
          // Fallback
          start.set(cam.x, CEILING_Y - 0.45, cam.z);
        }

        // Ray-plane intersection with road (y = FLOOR_Y)
        ray.origin.copy(start);
        ray.direction.copy(dir);
        ray.intersectPlane(plane, end);

        // If for any reason it doesn't intersect (shouldn't), fallback straight down
        if (!end || !isFinite(end.x) || !isFinite(end.y) || !isFinite(end.z)) {
          end.copy(start);
          end.y = FLOOR_Y;
        }

        // Clamp hit within corridor bounds (keeps it on the road visually)
        end.x = THREE.MathUtils.clamp(end.x, -CORRIDOR_HALF_WIDTH, CORRIDOR_HALF_WIDTH);

        // Write impact to collision output
        if (laserOut.current) {
          laserOut.current.x = end.x;
          laserOut.current.z = end.z;
        }

        // Update line geometry
        if (lineRef.current) {
          const arr = lineRef.current.geometry.attributes.position.array;
          arr[0]=start.x; arr[1]=start.y; arr[2]=start.z;
          arr[3]=end.x;   arr[4]=end.y;   arr[5]=end.z;
          lineRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // Impact glow
        if (impactRef.current) {
          impactRef.current.position.set(end.x, FLOOR_Y + 0.02, end.z);
          const p = 0.45 + 0.35 * Math.sin(phase.current * 1.5);
          impactRef.current.material.opacity = p;
          const s = 1.0 + 0.12 * Math.sin(phase.current * 2.0);
          impactRef.current.scale.set(s,s,s);
        }
      });

      return (
        <group>
          {/* Camera cube mounted on ceiling */}
          <group position={[cam.x, CEILING_Y, cam.z]}>
            <group ref={rigRef}>
              <mesh>
                <boxGeometry args={[1.0, 1.0, 1.0]} /> {/* Bigger Camera Body */}
                <meshStandardMaterial color="#006400" emissive="#002200" roughness={0.6} metalness={0.2} />
              </mesh>
              {/* Eye */}
              <mesh position={[0, -0.05, 0.55]}>
                <sphereGeometry args={[0.25, 16, 16]} /> {/* Bigger Lens */}
                <meshBasicMaterial color="#ff0033" />
              </mesh>
            </group>
          </group>

          {/* Laser ray (from cube eye to road) */}
          <line ref={lineRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array(6)}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#ff0033"
              transparent
              opacity={0.95}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>

          {/* Road impact ring */}
          <mesh ref={impactRef} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.2, 0.85, 28]} /> {/* Bigger Impact Zone */}
            <meshBasicMaterial
              color="#ff0033"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    };

    /***********************
     * GAME LOOP
     ***********************/
    const GameLoop = ({ onGameOver, onScoreUpdate, onLogUpdate, isIntro = false }) => {
      const playerX = useRef(0);
      const speed = useRef(SPEED_BASE);
      const score = useRef(0);
      const lastLog = useRef(0);

      // segments belt
      const [segments, setSegments] = useState(() => {
        const init = [];
        for(let i=0;i<8;i++) init.push({ id:i, z:-i*SEGMENT_LENGTH });
        return init;
      });

      // cameras list
      const [cams, setCams] = useState(() => {
        const init = [];
        let z = SPAWN_MAX_Z;
        for(let i=0;i<DESIRED_CAMERAS;i++){
          z -= rand(SPACING_MIN, SPACING_MAX);
          init.push(makeCamera(z));
        }
        while (Math.min(...init.map(c=>c.z)) > SPAWN_MIN_Z) {
          z -= rand(SPACING_MIN, SPACING_MAX);
          init.push(makeCamera(z));
        }
        return init;
      });

      // store per-camera laser impact points for collision
      const impactsRef = useRef(new Map()); // id -> {x,z}

      // Reset speed/score when entering play mode from intro
      useEffect(() => {
        if (!isIntro) {
          score.current = 0;
          speed.current = SPEED_BASE;
          onScoreUpdate(0);
        }
      }, [isIntro]);

      useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        const move = speed.current * (delta * 60) * 0.5;

        // Logic only for Active Gameplay
        if (!isIntro) {
          // score + speed
          score.current += move;
          onScoreUpdate(Math.floor(score.current));

          // Acceleration: Increased from 0.0001 to 0.0003 for faster progression
          speed.current += 0.0003;
        }

        // watcher log (runs in both, but maybe different text in intro?)
        if(t - lastLog.current > 8){
          generateWatcherCommentary().then(onLogUpdate);
          lastLog.current = t;
        }

        // move corridor segments
        setSegments(prev => prev.map(s => {
          let z = s.z + move;
          if(z > SEGMENT_LENGTH) z -= SEGMENT_LENGTH * 8;
          return { ...s, z };
        }));

        // move cameras, prune, refill
        setCams(prev => {
          // ASCENSION SEQUENCE: Clear cameras after score 200
          if (score.current >= 200) return [];

          let next = prev.map(c => ({ ...c, z: c.z + move }));
          next = next.filter(c => c.z < PRUNE_Z);

          // ensure coverage ahead
          let minZ = Infinity;
          for(const c of next) minZ = Math.min(minZ, c.z);
          if(!isFinite(minZ)) minZ = SPAWN_MAX_Z;

          while(minZ > SPAWN_MIN_Z || next.length < DESIRED_CAMERAS){
            minZ -= rand(SPACING_MIN, SPACING_MAX);
            next.push(makeCamera(minZ));
          }

          return next;
        });

        // collision check (ONLY IN GAME)
        if (!isIntro) {
          let collided = false;
          impactsRef.current.forEach((p, id) => {
            const dx = p.x - playerX.current;
            const dz = p.z - 0;
            if ((dx*dx + dz*dz) < (HIT_RADIUS_XZ*HIT_RADIUS_XZ)) collided = true;
          });

          if (collided) onGameOver();
        }
      });

      return (
        <group>
          {/* Only show player if playing */}
          {!isIntro && <Player xRef={playerX} />}

          {segments.map(s => <TunnelSegment key={s.id} z={s.z} />)}

          {cams.map(c => {
            if (!impactsRef.current.has(c.id)) impactsRef.current.set(c.id, { x: 0, z: c.z });
            const outRef = { current: impactsRef.current.get(c.id) };
            return (
              <CameraCube
                key={c.id}
                cam={c}
                laserOut={outRef}
                globalSpeed={speed}
              />
            );
          })}
        </group>
      );
    };

    /***********************
     * APP
     ***********************/
    const App = () => {
      // Start in INTRO mode instead of MENU
      const [gameState, setGameState] = useState("INTRO");
      const [score, setScore] = useState(0);
      const [watcherLog, setWatcherLog] = useState("AWAITING INPUT...");

      // Calculate whiteout opacity for ending sequence
      const whiteoutOpacity = useMemo(() => {
        if (score < 200) return 0;
        // Fade in over 60 meters
        return Math.min(1, (score - 200) / 60);
      }, [score]);

      useEffect(() => {
        const onKey = (e) => {
          if(e.key === "Escape") window.parent?.postMessage?.({ type:"ESC_PRESSED" }, "*");
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, []);

      return (
        <div className="w-full h-screen bg-black relative">
          <div className="scanline"></div>

          {/* WHITEOUT OVERLAY */}
          <div
            className="absolute inset-0 bg-white z-[60] pointer-events-none transition-opacity duration-75"
            style={{ opacity: whiteoutOpacity }}
          ></div>

          <Canvas dpr={[1,2]} gl={{ antialias:false }}>
            <PerspectiveCamera makeDefault position={[0, 2.2, 5.5]} fov={60} />
            <color attach="background" args={["#000500"]} />
            <fog attach="fog" args={["#000500", FOG_NEAR, FOG_FAR]} />

            <ambientLight intensity={0.55} color="#003300" />
            <pointLight position={[0, 7, 7]} intensity={1.2} color="white" />

            {/* Run GameLoop in both INTRO and PLAYING states */}
            {(gameState === "PLAYING" || gameState === "INTRO") && (
              <GameLoop
                isIntro={gameState === "INTRO"}
                onGameOver={() => setGameState("GAMEOVER")}
                onScoreUpdate={setScore}
                onLogUpdate={setWatcherLog}
              />
            )}

            <EffectComposer>
              <Bloom luminanceThreshold={0.12} intensity={2.1} radius={0.78} />
              <Noise opacity={0.12} />
              <Scanline density={2} opacity={0.2} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Canvas>

          {/* HUD (Only visible when playing) */}
          {gameState === "PLAYING" && (
            <div className="ui-layer flex flex-col justify-between p-8">
              <div className="flex justify-between items-start text-green-500">
                <div>
                  <h1 className="text-green-500 text-xl tracking-[0.5em] font-bold animate-pulse">THE WATCHER</h1>
                  <div className="text-green-900 text-xs mt-1">SECURE CONNECTION ESTABLISHED</div>
                  <div className="watcher-log mt-3 font-bold uppercase">
                    WATCHER: {watcherLog} <span className="animate-pulse">_</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-500 text-4xl font-bold hud-text">{score}</div>
                  <div className="text-green-900 text-xs tracking-widest">METERS RUN</div>
                  <div className="text-green-500 text-xs tracking-widest mt-4">PRESS ESC TO EXIT</div>
                </div>
              </div>
            </div>
          )}

          {/* INTRO OVERLAY (Replaces old Menu) */}
          {gameState === "INTRO" && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="text-center pointer-events-auto">
                {/* Title Removed */}
                <p className="text-green-900 tracking-[0.5em] text-sm mb-12 bg-black/50 inline-block px-4 py-1">THE WATCHER PROTOCOL</p>

                <div className="flex flex-col items-center gap-6">
                  <button
                    onClick={() => setGameState("INSTRUCTIONS")}
                    className="px-10 py-3 bg-green-900/20 border border-green-700 text-green-500 font-bold tracking-[0.2em] hover:bg-green-700 hover:text-black transition-all backdrop-blur-md"
                  >
                    // MISSION BRIEF
                  </button>

                  <button
                    onClick={() => { setWatcherLog("LINK ESTABLISHED."); setGameState("PLAYING"); }}
                    className="px-12 py-4 bg-green-600/10 border border-green-500 text-green-400 font-bold tracking-[0.2em] hover:bg-green-600 hover:text-black transition-all backdrop-blur-md"
                  >
                    INITIATE LINK
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INSTRUCTIONS */}
          {gameState === "INSTRUCTIONS" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50 p-8" style={{ pointerEvents:"auto" }}>
              <div className="max-w-2xl w-full border border-green-900/30 p-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
                <h2 className="text-2xl text-green-500 font-bold mb-6 tracking-[0.3em]">MISSION BRIEF</h2>
                <div className="space-y-6 text-sm text-green-300 leading-relaxed font-mono">
                  <div className="flex gap-4">
                    <div className="w-12 text-green-600 font-bold">OBJ:</div>
                    <div>RUN THE CORRIDOR. DO NOT TOUCH THE LASERS.</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 text-green-600 font-bold">CTRL:</div>
                    <div>MOUSE LEFT/RIGHT TO MOVE. STAY OFF THE IMPACT POINTS.</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 text-green-600 font-bold">FAIL:</div>
                    <div>IF YOUR BODY TOUCHES A LASER'S ROAD HIT, YOU ARE DETECTED.</div>
                  </div>
                </div>
                <div className="mt-12 text-center">
                  <button
                    onClick={() => { setScore(0); setWatcherLog("LINK ESTABLISHED."); setGameState("PLAYING"); }}
                    className="px-12 py-4 bg-green-600 text-black font-bold tracking-[0.2em] hover:bg-white hover:text-green-600 transition-all blink"
                    style={{ pointerEvents:"auto" }}
                  >
                    INITIATE LINK
                  </button>
                  <div className="mt-4">
                     <button onClick={() => setGameState("INTRO")} className="text-xs text-green-800 hover:text-green-500">BACK TO TITLE</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 flex items-center justify-center game-over z-50" style={{ pointerEvents:"auto" }}>
              <div className="text-center">
                <h2 className="text-8xl text-green-600 font-bold mb-4 tracking-widest">DETECTED</h2>
                <p className="text-green-300 mb-8 tracking-widest">SCORE: {score}</p>
                <button
                  onClick={() => { setScore(0); setWatcherLog("RESETTING TRACE..."); setGameState("PLAYING"); }}
                  className="px-8 py-3 bg-green-900/20 border border-green-600 text-green-500 hover:bg-green-600 hover:text-black transition-all tracking-[0.2em]"
                  style={{ pointerEvents:"auto" }}
                >
                  RETRY MISSION
                </button>
                <div className="mt-6">
                  <button onClick={() => setGameState("INTRO")} className="text-xs text-green-800 hover:text-green-500 tracking-widest">RETURN TO MENU</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    createRoot(document.getElementById("root")).render(<App />);
  </script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={htmlContent}
      className="absolute inset-0 w-full h-full border-0 z-[100]"
      title="The Watcher"
      style={{ pointerEvents: 'auto' }}
    />
  );
};
