import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, extend, Object3DNode } from '@react-three/fiber';
import { 
  PointerLockControls, 
  Environment, 
  MeshReflectorMaterial, 
  Float,
  Stars,
  Sparkles,
  shaderMaterial,
  useGLTF,
  useVideoTexture,
  Image,
  Gltf
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, SMAA, Scanline, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { MonolithData, GameState } from '../types';
import { NewsFeedRoom } from './NewsFeedRoom';

// -- Custom Shader Material for Glitch Portal --
const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 1.0, 1.0),
    uHover: 0, // 0.0 to 1.0
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uHover;
    varying vec2 vUv;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = vUv;
      
      // Glitch Intensity based on hover
      float glitch = uHover * 0.8; // Max glitch strength
      
      // Time variable for noise
      float t = uTime * 20.0;
      
      // 1. Horizontal Slice Glitch (Tearing)
      float noiseVal = random(vec2(uv.y, floor(t)));
      if (glitch > 0.0 && noiseVal < glitch * 0.3) {
         float shift = (random(vec2(t, uv.y)) - 0.5) * 0.2 * glitch;
         uv.x += shift;
      }
      
      // 2. RGB Shift (Chromatic Aberration) on edges during glitch
      float r = 0.0; 
      float g = 0.0; 
      float b = 0.0;
      
      // Base glow (brighter in center)
      float centerDist = distance(uv, vec2(0.5, 0.5));
      float glow = 1.0 - smoothstep(0.0, 0.9, centerDist);
      
      // Scanlines (Moving up)
      float scanline = sin(uv.y * 100.0 - uTime * 3.0) * 0.5 + 0.5;
      
      // Combine for base brightness
      vec3 finalColor = uColor * (glow + 0.2);
      finalColor += uColor * scanline * 0.1;

      // 3. Hover Brightness Boost (The "Light up entirely" effect)
      // When hovered, boost brightness significantly
      float brightness = 2.0 + uHover * 6.0;
      
      // 4. White Noise / Flash
      if (glitch > 0.0 && random(vec2(uv.x, t)) > 0.95) {
        finalColor += vec3(0.5 * glitch); // Add white static
      }

      gl_FragColor = vec4(finalColor * brightness, 1.0);
    }
  `
);

extend({ PortalMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    portalMaterial: Object3DNode<THREE.ShaderMaterial, typeof PortalMaterial>;
  }
}

// -- Custom Art Loader Component --
// Place your .glb, .mp4, .jpg files in the 'public' folder
interface CustomArtProps {
  type: 'model' | 'video' | 'image';
  url: string; // e.g., "/my-model.glb"
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const VideoMesh = ({ url }: { url: string }) => {
  // Automatically loads video and handles texture mapping
  const texture = useVideoTexture(url);
  return (
    <mesh>
      <planeGeometry args={[16/4, 9/4]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
};

export const CustomArt: React.FC<CustomArtProps> = ({ type, url, position = [0,0,0], rotation = [0,0,0], scale = 1 }) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <Suspense fallback={<mesh><boxGeometry /><meshBasicMaterial color="red" wireframe /></mesh>}>
        {type === 'model' && <Gltf src={url} />}
        {type === 'image' && <Image url={url} transparent />}
        {type === 'video' && <VideoMesh url={url} />}
      </Suspense>
    </group>
  );
};

// -- Sub-components --

const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={50} // Strong reflections
        roughness={0.1} // Glossy wet/glass look
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505" // Slightly lighter black for better reflection visibility
        metalness={0.9}
        mirror={0.8}
      />
      {/* Subtle digital grid overlay on floor */}
      <gridHelper args={[100, 50, 0x333333, 0x111111]} position={[0, 0.01, 0]} rotation={[Math.PI/2, 0, 0]} />
    </mesh>
  );
};

interface SilhouetteFigureProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

const SilhouetteFigure: React.FC<SilhouetteFigureProps> = ({ position, rotation }) => {
  const { scene } = useGLTF('/body.glb');

  // Clone the scene to allow multiple instances
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    // Apply dark material to all meshes immediately during cloning
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Apply dark glossy material
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: "#0a0a0a",
          roughness: 0.1,
          metalness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
        });
      }
    });

    return cloned;
  }, [scene]);

  return (
    <primitive
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={0.147}
    />
  );
};

// Preload the body model
useGLTF.preload('/body.glb');

interface MonolithProps {
  data: MonolithData;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  color: string;
}

const Monolith: React.FC<MonolithProps> = ({ 
  data, 
  isHovered, 
  onHover,
  color
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Shader Updates
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      // Lerp hover value for smooth transition
      const currentHover = materialRef.current.uniforms.uHover.value;
      const targetHover = isHovered ? 1.0 : 0.0;
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(currentHover, targetHover, 0.1);
    }

    // Light Updates
    // Pulse effect
    const pulse = Math.sin(t * 3) * 0.5 + 0.5;
    
    // Target intensities based on hover
    const targetLightIntensity = isHovered ? 25.0 : 3.0;
    const targetLightDistance = isHovered ? 15 : 6;

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetLightIntensity, 0.1);
      lightRef.current.distance = THREE.MathUtils.lerp(lightRef.current.distance, targetLightDistance, 0.05);
    }
  });

  return (
    <group position={data.position} rotation={data.rotation} scale={data.scale}>
      {/* Dynamic Light attached to the door */}
      <pointLight 
        ref={lightRef}
        position={[0, 0, 1.0]} 
        color={color}
        decay={2}
        castShadow
      />

      {/* Frame - Made thinner to maximize glow area */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 3.1, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* The Portal Screen (Double Sided for depth) */}
      <mesh 
        position={[0, 0, 0.06]}
        onPointerOver={(e) => { e.stopPropagation(); onHover(data.id); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
      >
        <planeGeometry args={[1.4, 3.0]} />
        <portalMaterial 
          ref={materialRef} 
          uColor={new THREE.Color(color)} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Back side panel to ensure it looks solid from behind */}
      <mesh position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
         <planeGeometry args={[1.4, 3.0]} />
         <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// -- Monolith Field Scene (Original Game Scene) --

const MonolithField: React.FC<{
  setInteractId: (id: string | null) => void;
  gameState: GameState;
}> = ({ setInteractId, gameState }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cameraRef = useThree(state => state.camera);
  const isDragging = useRef(false);
  const initialRotationSet = useRef(false);
  const savedCameraRotation = useRef<{ x: number; y: number } | null>(null);
  const previousGameState = useRef<GameState>(gameState);

  // Generate Monoliths
  const monoliths = useMemo(() => {
    const items: MonolithData[] = [];
    const count = 5;
    const radius = 5.5;

    // Explicit ID mapping for the 5 rooms (left to right in arc)
    const ROOM_IDS = [
        'STORY_DOOR',   // Index 0 - 005 THE STORY
        'PROFILE_DOOR', // Index 1 - 004 THE WALL
        'WATCHER_DOOR', // Index 2 - 003 THE WATCHER
        'YELLOW_DOOR',  // Index 3 - 002 THE WINDOWS
        'PINK_DOOR'     // Index 4 - 001 THE NEWS FEED
    ];

    for (let i = 0; i < count; i++) {
      // Arrange doors in an arc instead of full circle
      const arcAngle = Math.PI; // 180 degree arc
      const startAngle = -arcAngle / 2; // Center the arc
      const angle = startAngle + (i / (count - 1)) * arcAngle;
      const r = radius + (Math.random() * 2 - 1);
      const x = Math.sin(angle) * r;
      const z = Math.cos(angle) * r;
      // Point towards center
      const rotY = Math.atan2(x, z) + Math.PI;

      items.push({
        id: ROOM_IDS[i],
        position: [x, 1.6, z],
        rotation: [0, rotY, 0],
        scale: [1, 1, 1]
      });
    }
    return items;
  }, []);

  // Set initial camera rotation to point at middle door (WATCHER_DOOR, index 2)
  useEffect(() => {
    if (!initialRotationSet.current) {
      // Middle door (WATCHER_DOOR, index 2) is at angle 0 in the arc
      // When angle = 0: x = sin(0) = 0, z = cos(0) = 1 (positive Z)
      // In Three.js, positive Z is behind the camera, so rotate 180 degrees
      cameraRef.rotation.y = Math.PI;
      cameraRef.rotation.x = 0;
      cameraRef.rotation.order = 'YXZ';
      initialRotationSet.current = true;
    }
  }, [cameraRef]);

  // Save and restore camera rotation when entering/exiting rooms
  useEffect(() => {
    // Detect when leaving PLAYING state (entering a room)
    if (previousGameState.current === GameState.PLAYING && gameState !== GameState.PLAYING && gameState !== GameState.MENU) {
      // Save current camera rotation before entering room
      savedCameraRotation.current = {
        x: cameraRef.rotation.x,
        y: cameraRef.rotation.y
      };
    }

    // Detect when returning to PLAYING state (exiting a room)
    if (previousGameState.current !== GameState.PLAYING && gameState === GameState.PLAYING) {
      // Restore saved camera rotation
      if (savedCameraRotation.current) {
        cameraRef.rotation.x = savedCameraRotation.current.x;
        cameraRef.rotation.y = savedCameraRotation.current.y;
        cameraRef.rotation.order = 'YXZ';
      }
    }

    // Update previous state
    previousGameState.current = gameState;
  }, [gameState, cameraRef]);

  // Figures - Position them in front of each door
  const figures = useMemo(() => {
    return monoliths.map((m) => {
      // Position figures closer to the doors
      const offset = 1.5; // Reduced to 1.5 units to stand closer to doors

      // Calculate position in front of the door (facing towards center)
      const x = m.position[0] + Math.sin(m.rotation[1]) * offset;
      const z = m.position[2] + Math.cos(m.rotation[1]) * offset;

      return {
        position: [x, 0.01, z] as [number, number, number], // Slightly above ground to prevent z-fighting
        rotation: [0, m.rotation[1] + Math.PI, 0] as [number, number, number]
      };
    });
  }, [monoliths]);

  // Handle Drag to Look (Only in MENU)
  useEffect(() => {
    if (gameState !== GameState.MENU) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const sensitivity = 0.002;

      // Rotate camera
      cameraRef.rotation.y -= e.movementX * sensitivity;
      cameraRef.rotation.x -= e.movementY * sensitivity;

      // Clamp pitch (vertical look)
      const maxPolar = Math.PI / 2.2;
      cameraRef.rotation.x = Math.max(-maxPolar, Math.min(maxPolar, cameraRef.rotation.x));

      // Ensure rotation order helps with consistent behavior
      cameraRef.rotation.order = 'YXZ';
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameState, cameraRef]);

  // Interaction Logic
  useFrame((state) => {
    // Only run intersection logic if in a playable state
    if (gameState === GameState.MENU) return;

    const camera = state.camera;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(state.scene.children, true);
    
    let foundId: string | null = null;
    for (const hit of intersects) {
       if (hit.distance > 8) continue; 
       const hitPos = hit.object.parent?.position;
       if (hitPos) {
          const match = monoliths.find(m => 
            Math.abs(m.position[0] - hitPos.x) < 0.1 && 
            Math.abs(m.position[2] - hitPos.z) < 0.1
          );
          if (match) {
            foundId = match.id;
            break;
          }
       }
    }
    
    // Explicitly update parent if changed
    if (foundId !== hoveredId) {
      setHoveredId(foundId);
      setInteractId(foundId);
    }
  });

  const getDoorColor = (id: string) => {
      switch(id) {
          case 'PINK_DOOR': return '#ff00ff';    // 001 THE NEWS FEED - Pink
          case 'YELLOW_DOOR': return '#ffaa00';  // 002 THE WINDOWS - Yellow
          case 'WATCHER_DOOR': return '#00ff00'; // 003 THE WATCHER - Green
          case 'PROFILE_DOOR': return '#ff0000'; // 004 THE WALL - Red
          case 'STORY_DOOR': return '#0088ff';   // 005 THE STORY - Blue
          default: return '#00f3ff';
      }
  }

  return (
    <>
      {/* Pointer Lock Controls should only be active in PLAYING mode to avoid conflict with overlay UI */}
      {gameState === GameState.PLAYING && <PointerLockControls />}
      
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#202020', '#000000', 0.5]} />
      <fog attach="fog" args={['#050810', 0, 50]} />

      <Stars radius={40} depth={40} count={3000} factor={3} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#4444ff" />

      <Floor />

      {monoliths.map((data) => {
         return (
          <Monolith 
            key={data.id} 
            data={data} 
            isHovered={hoveredId === data.id} 
            onHover={() => {}} 
            color={getDoorColor(data.id)}
          />
         );
      })}

      {figures.map((fig, i) => (
        <Suspense key={`fig-${i}`} fallback={null}>
          <SilhouetteFigure position={fig.position} rotation={fig.rotation} />
        </Suspense>
      ))}

      {/* --- USER CONTENT EXAMPLES (Uncomment to use) --- */}
      {/* 
        <CustomArt type="model" url="/my-character.glb" position={[3, 0, 3]} scale={1} />
        <CustomArt type="image" url="/my-poster.jpg" position={[-3, 1.5, 3]} scale={[2, 3, 1]} />
        <CustomArt type="video" url="/my-video.mp4" position={[0, 3, 5]} scale={[4, 2.25, 1]} />
      */}
    </>
  );
};

// -- Main Game Scene Wrapper --

interface SceneProps {
  gameState: GameState;
  setInteractId: (id: string | null) => void;
  triggerInteract: boolean;
  setAttentionScore: (fn: (prev: number) => number) => void;
}

export const GameScene: React.FC<SceneProps> = ({ gameState, setInteractId, setAttentionScore }) => {
  return (
    <>
      {/* Conditionally Render Scenes */}
      {gameState === GameState.NEWS_ROOM ? (
        <NewsFeedRoom setAttentionScore={setAttentionScore} />
      ) : (gameState === GameState.THE_BUILDING || gameState === GameState.STORY_ROOM || gameState === GameState.PROFILE_ROOM || gameState === GameState.WATCHER_ROOM) ? (
        // Render nothing in 3D canvas when in these 2D overlay modes
        null
      ) : (
        <MonolithField setInteractId={setInteractId} gameState={gameState} />
      )}

      {/* Global Post Processing - Only active when not in 2D only rooms to save perf */}
      {(gameState !== GameState.STORY_ROOM && gameState !== GameState.PROFILE_ROOM && gameState !== GameState.WATCHER_ROOM) && (
        <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.6}
            />
            <Scanline 
            density={1.5} 
            opacity={0.12} 
            />
            <Noise opacity={0.05} />
            <SMAA />
            <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      )}
    </>
  );
};