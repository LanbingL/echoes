import React from 'react';

export const WallRoom: React.FC = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>THE WALL - ROOM 04</title>
    <style>
        :root {
            --bg-color: #050505;
            --term-green: #0aff0a;
            --term-red: #ff3333;
            --term-blue: #4488ff;
            --term-gold: #ffd700;
            --term-amber: #ffaa00; /* New color for hints */
            --ui-font: 'Courier New', Courier, monospace;
        }

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: var(--bg-color);
            color: #ddd;
            font-family: var(--ui-font);
            overflow: hidden;
            user-select: none;
        }

        #canvas-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        /* HUD */
        #hud {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 20;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .hud-line {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            opacity: 0.7;
            text-shadow: 0 0 5px var(--term-blue);
        }

        /* Progress Bar (Subtle) */
        #scan-progress {
            position: absolute;
            left: 20px;
            top: 60px;
            width: 2px;
            height: 100px;
            background: rgba(255, 255, 255, 0.1);
            z-index: 20;
        }

        #scan-bar {
            width: 100%;
            height: 0%;
            background: var(--term-blue);
            box-shadow: 0 0 10px var(--term-blue);
            transition: height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Character Speech Bubble (Main) */
        #char-bubble {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 15;
            pointer-events: none;
            width: 160px; 
            
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(4px);
            border: 1px solid var(--term-blue);
            border-left: 4px solid var(--term-blue);
            color: #eee;
            
            padding: 8px; 
            font-size: 11px; 
            line-height: 1.3;
            font-family: var(--ui-font);
            
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
            opacity: 0; /* Hidden by default */
            transition: opacity 0.3s ease, border-color 0.3s ease;
            transform: translate(20px, -50%); 
        }

        #char-bubble.visible {
            opacity: 1;
        }

        #char-bubble h3 {
            margin: 0 0 6px 0; 
            font-size: 10px; 
            color: var(--term-blue);
            text-transform: uppercase;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 3px;
            transition: color 0.3s ease;
        }

        #char-bubble p {
            margin: 0;
            min-height: 30px; 
        }

        /* Hint Bubble (Left side) */
        #hint-bubble {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 15;
            pointer-events: none;
            width: 140px;
            
            background: rgba(20, 10, 0, 0.9);
            backdrop-filter: blur(4px);
            border: 1px solid var(--term-amber);
            border-right: 4px solid var(--term-amber); /* Right border for left positioning */
            color: #ffccaa;
            
            padding: 8px; 
            font-size: 11px; 
            line-height: 1.3;
            font-family: var(--ui-font);
            text-align: right; /* Text aligns to character */
            
            box-shadow: 0 0 15px rgba(255, 100, 0, 0.2);
            opacity: 0; 
            transition: opacity 0.3s ease;
            transform: translate(-180px, -50%); /* Shift left */
        }

        #hint-bubble.visible {
            opacity: 1;
        }

        #hint-bubble h3 {
            margin: 0 0 6px 0; 
            font-size: 10px; 
            color: var(--term-amber);
            text-transform: uppercase;
            border-bottom: 1px solid rgba(255, 170, 0, 0.3);
            padding-bottom: 3px;
        }

        #hint-bubble p {
            margin: 0;
            min-height: 30px;
        }

        /* Typewriter Cursor */
        .cursor::after {
            content: '█';
            animation: blink 1s infinite;
            margin-left: 2px;
            color: inherit; 
        }

        /* End Screen */
        #end-screen {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black; 
            z-index: 100;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0; 
            transition: opacity 2s ease-in; 
            pointer-events: none;
        }

        #end-screen.active {
            opacity: 1;
            pointer-events: auto;
        }

        .final-msg {
            font-size: 24px;
            letter-spacing: 4px;
            color: white;
            margin-bottom: 20px;
            text-align: center;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }

    </style>
</head>
<body>

    <div id="canvas-container"></div>

    <div id="hud">
        <div class="hud-line" id="status-line">SYSTEM: ONLINE</div>
        <div class="hud-line" id="seq-line">PROTOCOL: ACTIVE</div>
    </div>

    <div id="scan-progress">
        <div id="scan-bar"></div>
    </div>

    <!-- Main Character Bubble (Right) -->
    <div id="char-bubble">
        <h3 id="bubble-title">SYSTEM</h3>
        <p id="bubble-text"></p>
    </div>

    <!-- Hint Bubble (Left) -->
    <div id="hint-bubble">
        <h3 id="hint-title">CLUE</h3>
        <p id="hint-text"></p>
    </div>

    <div id="end-screen">
        <div class="final-msg"></div>
    </div>

    <script type="importmap">
        {
            "imports": {
                "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
            }
        }
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
        import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
        import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { Reflector } from 'three/addons/objects/Reflector.js';

        // --- GAME LOGIC CONFIG ---
        const SEQUENCE = ['AUTH', 'PAYWALL', 'CONSENT', 'MODERATION', 'FINALITY'];
        
        // GLOBAL COLOR DEFINITIONS
        const TYPE_COLORS = {
            'AUTH': '#ff44cc',      // Pink
            'CONSENT': '#0aff0a',   // Green
            'PAYWALL': '#ffd700',   // Yellow/Gold
            'MODERATION': '#ff3333',// Red
            'FINALITY': '#4488ff'   // Blue
        };

        let currentStep = 0;
        let activeCubes = []; 
        let isPhysicsActive = false; 
        let isFlying = false; 
        let tunnelRings = []; 
        let totalInteractions = 0; 
        let isWaving = false; 

        // --- HINT MESSAGES ---
        const HINTS = [
            "HINT: THE PATTERN MATCHES THE COLORS OF THE DOORS IN THE ENTERING PAGE",
            "HINT: RECALL THE ORDER OF THE COLORED DOORS",
            "HINT: SEQUENCE: PINK -> YELLOW -> GREEN -> RED -> BLUE",
            "HINT: MATCH THE CUBE COLORS TO THE PREVIOUS ROOM'S DOORS"
        ];

        // --- MESSAGE LIBRARY ---
        const MSG_LIB = {
            AUTH: [
                "ID REQUIRED", "AUTHENTICATE TO CONTINUE", "SESSION NOT VERIFIED", "LOGIN PENDING", 
                "CREDENTIAL CHECK RUNNING", "IDENTITY UNCONFIRMED", "TOKEN MISSING", "KEY NOT FOUND", 
                "TWO-STEP REQUIRED", "USER NOT RECOGNIZED", "SIGN-IN TIMEOUT", "VERIFICATION FAILED", 
                "DEVICE UNTRUSTED", "ACCESS TIED TO ACCOUNT", "PROOF OF USER NEEDED", "AUTH ROUTE CLOSED", 
                "INVALID CREDENTIALS", "REAUTHENTICATE NOW", "ID LOCK ENGAGED", "WHO ARE YOU, EXACTLY"
            ],
            PAYWALL: [
                "PAYMENT REQUIRED", "SUBSCRIPTION ONLY", "PREVIEW ENDS HERE", "UPGRADE TO UNLOCK", 
                "TRIAL EXPIRED", "BILLING NOT FOUND", "PLAN INSUFFICIENT", "MEMBER ACCESS ONLY", 
                "PRICE TIER MISMATCH", "TRANSACTION PENDING", "PURCHASE TO PROCEED", "VALUE CHECK FAILED", 
                "THIS CONTENT COSTS", "LIMIT: FREE USERS", "CREDIT REQUIRED", "PAYWALL ACTIVE", 
                "CHECKOUT INTERRUPTED", "RECEIPT NOT VALID", "ACCESS IS MONETIZED", "PAY OR TURN BACK"
            ],
            CONSENT: [
                "CONSENT REQUIRED", "ACCEPT TO CONTINUE", "TERMS NOT AGREED", "COOKIES REQUESTED", 
                "PREFERENCES NEEDED", "PRIVACY SETTINGS BLOCKING", "PERMISSION PROMPT ACTIVE", "ALLOW DATA COLLECTION", 
                "OPT-IN TO PROCEED", "POLICY ACKNOWLEDGEMENT NEEDED", "TRACKING DISABLED = LIMITED", "DECLINE REDUCES ACCESS", 
                "CONSENT LOG INCOMPLETE", "DATA SHARING REQUEST", "PERSONALIZATION REQUIRED", "CLICK “AGREE”", 
                "CONSENT TIMESTAMP MISSING", "PERMISSION WITHHELD", "YOUR CHOICE IS RECORDED", "CONSENT CREATES ENTRY"
            ],
            MODERATION: [
                "CONTENT UNDER REVIEW", "GUIDELINES ENFORCED", "THREAD LOCKED", "COMMENT REMOVED", 
                "POST HIDDEN", "POLICY VIOLATION", "VISIBILITY RESTRICTED", "COMMUNITY RULES APPLY", 
                "REPORT RECEIVED", "FLAGGED FOR CHECKING", "EDIT TO COMPLY", "REPEAT OFFENSE DETECTED", 
                "ACCOUNT ACTION TAKEN", "REACH LIMITED", "SAFE MODE ACTIVE", "THIS INPUT IS DISALLOWED", 
                "COMPLIANCE REQUIRED", "MODERATION OVERRIDE", "SILENCE IS PERMITTED", "YOU HAVE BEEN FILTERED"
            ],
            FINALITY: [
                "ACCESS DECISION FINAL", "ROUTE TERMINATED", "NO FURTHER OUTPUT", "REQUEST CLOSED", 
                "END OF PATH", "THE SYSTEM HAS SPOKEN", "NOTHING BEYOND THIS", "SESSION ENDED", 
                "CONNECTION SEALED", "YOU MAY LEAVE", "STATE LOCKED", "OUTPUT COMPLETE", 
                "OBSERVATION COMPLETE", "CLASSIFICATION COMPLETE", "THIS IS THE WALL", "PERMISSION WITHDRAWN", 
                "RETURN TO FEED", "EXIT AUTHORIZED", "FINAL NODE REACHED", "DO NOT ASK AGAIN"
            ]
        };

        // --- CUSTOM SHADER ---
        const RetroShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "time": { value: 0.0 },
                "amount": { value: 0.005 }
            },
            vertexShader: \`
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            \`,
            fragmentShader: \`
                uniform sampler2D tDiffuse;
                uniform float time;
                uniform float amount;
                varying vec2 vUv;

                float random(vec2 p) {
                    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
                }

                void main() {
                    vec2 uv = vUv;
                    float r = texture2D(tDiffuse, uv + vec2(amount * 0.5, 0.0)).r;
                    float g = texture2D(tDiffuse, uv).g;
                    float b = texture2D(tDiffuse, uv - vec2(amount * 0.5, 0.0)).b;
                    
                    vec3 col = vec3(r, g, b);
                    float saturation = 0.85;
                    vec3 gray = vec3(dot(col, vec3(0.299, 0.587, 0.114)));
                    col = mix(gray, col, saturation);

                    float noise = random(uv * time) * 0.05;
                    gl_FragColor = vec4(col + noise, 1.0);
                }
            \`
        };

        // --- SCENE CONFIG ---
        const WALL_WIDTH = 8; 
        const WALL_HEIGHT = 6; 
        const TILE_SIZE = 12;
        const GAP = 0.5;
        
        let scene, camera, renderer, composer, controls;
        let retroPass;
        let wallGroup, hiddenGroup, roomGroup, worldGroup; 
        let characterGroup; 
        let raycaster, mouse;
        let isGameActive = false;
        let time = 0;
        const clock = new THREE.Clock();
        let dragStartPos = new THREE.Vector2();
        let currentHover = null; 

        const hudStatus = document.getElementById('status-line');
        const charBubble = document.getElementById('char-bubble');
        const bubbleTitle = document.getElementById('bubble-title');
        const bubbleText = document.getElementById('bubble-text');
        
        // Hint Elements
        const hintBubble = document.getElementById('hint-bubble');
        const hintTitle = document.getElementById('hint-title');
        const hintText = document.getElementById('hint-text');

        const scanBar = document.getElementById('scan-bar');
        const endScreen = document.getElementById('end-screen');

        // --- ICON TEXTURE GENERATION ---
        function createIconTexture(type, colorHex, variant) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, 256, 256);

            ctx.strokeStyle = colorHex;
            ctx.lineWidth = 4;
            ctx.strokeRect(10, 10, 236, 236);

            ctx.shadowColor = colorHex;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = colorHex;
            ctx.fillStyle = colorHex;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.save();
            ctx.translate(128, 110); 

            if (type === 'AUTH') {
                if (variant === 0) { 
                    ctx.beginPath();
                    ctx.arc(0, -20, 30, 0, Math.PI * 2); 
                    ctx.moveTo(0, 10);
                    ctx.lineTo(0, 60); 
                    ctx.moveTo(0, 35);
                    ctx.lineTo(20, 35); 
                    ctx.moveTo(0, 50);
                    ctx.lineTo(20, 50);
                    ctx.stroke();
                } else if (variant === 1) { 
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, Math.PI, 0);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, 25, Math.PI, 0);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, 35, Math.PI, 0);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, 40);
                    ctx.stroke();
                } else { 
                    ctx.strokeRect(-40, -30, 80, 60);
                    ctx.beginPath();
                    ctx.rect(-30, -20, 20, 20); 
                    ctx.moveTo(0, -15); ctx.lineTo(30, -15);
                    ctx.moveTo(0, -5); ctx.lineTo(30, -5);
                    ctx.moveTo(-30, 15); ctx.lineTo(30, 15);
                    ctx.stroke();
                }
            }
            else if (type === 'CONSENT') {
                if (variant === 0) { 
                    ctx.lineWidth = 4;
                    ctx.strokeRect(-40, -40, 80, 80);
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.moveTo(-25, 5);
                    ctx.lineTo(-5, 25);
                    ctx.lineTo(35, -30);
                    ctx.stroke();
                } else if (variant === 1) { 
                    ctx.beginPath();
                    ctx.moveTo(-20, 40); ctx.lineTo(-20, -10);
                    ctx.moveTo(-10, 40); ctx.lineTo(-10, -20);
                    ctx.moveTo(0, 40); ctx.lineTo(0, -25);
                    ctx.moveTo(10, 40); ctx.lineTo(10, -20);
                    ctx.moveTo(20, 40); ctx.lineTo(20, -10);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(-40, 10); ctx.lineTo(40, 10); 
                    ctx.stroke();
                } else { 
                    ctx.strokeRect(-30, -40, 60, 80);
                    ctx.beginPath();
                    ctx.moveTo(-20, 20); ctx.lineTo(10, 20); 
                    ctx.moveTo(-20, 15); ctx.lineTo(-10, 10); ctx.lineTo(0, 15); ctx.lineTo(10, 5); 
                    ctx.stroke();
                }
            }
            else if (type === 'PAYWALL') {
                if (variant === 0) { 
                    ctx.beginPath();
                    ctx.roundRect(-30, -5, 60, 50, 5);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, -5, 22, Math.PI, 0);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 20, 5, 0, Math.PI*2);
                    ctx.fill();
                } else if (variant === 1) { 
                    ctx.beginPath();
                    ctx.moveTo(0, -35);
                    ctx.lineTo(35, 0);
                    ctx.lineTo(0, 35);
                    ctx.lineTo(-35, 0);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, -15); ctx.lineTo(15, 0); ctx.lineTo(0, 15); ctx.lineTo(-15, 0); ctx.closePath();
                    ctx.fill();
                } else { 
                    ctx.strokeRect(-45, -30, 90, 60);
                    ctx.fillRect(-45, -10, 90, 10); 
                    ctx.beginPath();
                    ctx.arc(25, 15, 8, 0, Math.PI*2); 
                    ctx.stroke();
                }
            }
            else if (type === 'MODERATION') {
                if (variant === 0) { 
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 50, 30, 0, 0, Math.PI*2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, 0, Math.PI*2);
                    ctx.fill();
                } else if (variant === 1) { 
                    ctx.fillRect(-30, -30, 60, 20); 
                    ctx.fillRect(-5, -10, 10, 60); 
                } else { 
                    ctx.beginPath();
                    ctx.arc(0, 0, 35, 0, Math.PI*2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(-25, 25); ctx.lineTo(25, -25);
                    ctx.stroke();
                }
            }
            else if (type === 'FINALITY') {
                if (variant === 0) { 
                    ctx.beginPath();
                    ctx.moveTo(-35, 25);
                    ctx.lineTo(0, -40);
                    ctx.lineTo(35, 25);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI*2);
                    ctx.fill();
                } else if (variant === 1) { 
                    ctx.beginPath();
                    ctx.arc(0, 0, 30, -Math.PI*0.3, Math.PI*1.3);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, -35); ctx.lineTo(0, 0);
                    ctx.stroke();
                } else { 
                    ctx.beginPath();
                    ctx.arc(0, -5, 30, 0.2, Math.PI - 0.2, true);
                    ctx.lineTo(-40, 25);
                    ctx.moveTo(29, 23); ctx.lineTo(40, 25);
                    ctx.stroke();
                }
            }

            ctx.restore();
            
            ctx.shadowBlur = 0;
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = colorHex;
            ctx.fillText(type, 128, 220);

            // --- CRT EFFECT OVERLAY ---
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            for (let y = 0; y < 256; y += 4) {
                ctx.fillRect(0, y, 256, 2);
            }

            const grad = ctx.createRadialGradient(128, 128, 90, 128, 128, 256);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.6)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);

            return new THREE.CanvasTexture(canvas);
        }

        // --- SIDE TEXTURE GENERATION ---
        function createSideTexture(colorHex) {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, 256, 256);

            ctx.strokeStyle = colorHex;
            ctx.lineWidth = 2;
            ctx.strokeRect(5, 5, 246, 246);

            ctx.fillStyle = '#111';
            for(let i=0; i<5; i++) {
                ctx.fillRect(20, 40 + i*40, 216, 4);
            }

            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            for (let y = 0; y < 256; y += 4) {
                ctx.fillRect(0, y, 256, 2);
            }

            const grad = ctx.createRadialGradient(128, 128, 90, 128, 128, 256);
            grad.addColorStop(0, "rgba(0,0,0,0)");
            grad.addColorStop(1, "rgba(0,0,0,0.7)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);

            return new THREE.CanvasTexture(canvas);
        }

        // --- ROOM TEXTURE GENERATION ---
        function createGridTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, 512, 512);

            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2;

            const step = 64;
            ctx.beginPath();
            for (let i = 0; i <= 512; i += step) {
                ctx.moveTo(i, 0); ctx.lineTo(i, 512);
                ctx.moveTo(0, i); ctx.lineTo(512, i);
            }
            ctx.stroke();

            ctx.strokeStyle = '#cc0000'; 
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000'; 
            
            ctx.beginPath();
            for (let i = 0; i <= 512; i += 256) {
                ctx.moveTo(i, 0); ctx.lineTo(i, 512);
                ctx.moveTo(0, i); ctx.lineTo(512, i);
            }
            ctx.stroke();

            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        function init() {
            const container = document.getElementById('canvas-container');
            
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x050505);
            scene.fog = new THREE.FogExp2(0x050505, 0.012); 

            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 130; // UPDATED: Zoomed out initial position (Was 60)

            renderer = new THREE.WebGLRenderer({ antialias: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.toneMapping = THREE.ReinhardToneMapping;
            container.appendChild(renderer.domElement);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableRotate = false;
            controls.enableZoom = true;
            controls.enablePan = true;
            controls.screenSpacePanning = true;
            controls.minDistance = 40;
            controls.maxDistance = 150;
            controls.dampingFactor = 0.05;
            
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 2.5);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(0, 0, 50);
            scene.add(dirLight);

            const pointLight = new THREE.PointLight(0xffffff, 2.0, 300);
            pointLight.position.set(-30, -10, 150);
            scene.add(pointLight);

            // Post Processing
            composer = new EffectComposer(renderer);
            const renderPass = new RenderPass(scene, camera);
            composer.addPass(renderPass);

            const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
            bloomPass.threshold = 0.2;
            bloomPass.strength = 1.0; 
            bloomPass.radius = 0.5;
            composer.addPass(bloomPass);

            retroPass = new ShaderPass(RetroShader);
            composer.addPass(retroPass);

            raycaster = new THREE.Raycaster();
            mouse = new THREE.Vector2();

            // --- SCENE STRUCTURE ---
            worldGroup = new THREE.Group();
            scene.add(worldGroup);

            createHiddenDimension(); 
            createRoom(); 
            createWall();
            createCharacter(); 
            
            window.addEventListener('resize', onWindowResize, false);
            window.addEventListener('mousemove', onMouseMove, false);
            renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
            renderer.domElement.addEventListener('pointerup', onPointerUp, false);
            
            // Auto Start
            initGame();
            animate();
        }

        function initGame() {
            isGameActive = true;
        }

        // --- CHARACTER (Bot) ---
        function createCharacter() {
            characterGroup = new THREE.Group();
            worldGroup.add(characterGroup);

            // Position: Center, slightly above floor, in front of wall
            characterGroup.position.set(0, -25, 40);

            // Materials
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xaa0000, 
                roughness: 0.3,
                metalness: 0.8,
                emissive: 0xff0000, 
                emissiveIntensity: 0.2
            });
            
            // High Intensity Red Glow for the Eye
            const eyeMat = new THREE.MeshStandardMaterial({ 
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 5.0, 
                roughness: 0.1,
                metalness: 0.5
            }); 

            // 1. Head (Sphere) - Smaller
            const headGeo = new THREE.SphereGeometry(2, 16, 16); 
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.y = 4.5; 
            characterGroup.add(head);

            // 2. Eye (Cyclops)
            const eyeGeo = new THREE.SphereGeometry(0.8, 16, 16); 
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(0, 4.5, 1.8); 
            eye.scale.z = 0.5; 
            characterGroup.add(eye);

            // 3. Body (Cube)
            const bodyGeo = new THREE.BoxGeometry(5, 6, 4);
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            characterGroup.add(body);

            // 4. Arms (Longer)
            const armGeo = new THREE.BoxGeometry(1, 5, 1); 
            armGeo.translate(0, -2.5, 0);

            const armL = new THREE.Mesh(armGeo, bodyMat);
            armL.position.set(-3.5, 3, 0); 
            characterGroup.add(armL);

            const armR = new THREE.Mesh(armGeo, bodyMat);
            armR.position.set(3.5, 3, 0); 
            characterGroup.add(armR);

            // Store arms for animation
            characterGroup.userData = { armL: armL, armR: armR };

            // 5. Legs
            const legGeo = new THREE.BoxGeometry(1.2, 5, 1.2);
            const legL = new THREE.Mesh(legGeo, bodyMat);
            legL.position.set(-1.5, -5.5, 0); 
            characterGroup.add(legL);

            const legR = new THREE.Mesh(legGeo, bodyMat);
            legR.position.set(1.5, -5.5, 0);
            characterGroup.add(legR);
        }

        // --- TYPEWRITER EFFECT ---
        let typeWriterTimeout;
        let hintTypeWriterTimeout;

        function characterSpeak(title, text, color) {
            const bubble = document.getElementById('char-bubble');
            const titleEl = document.getElementById('bubble-title');
            const textEl = document.getElementById('bubble-text');

            // Apply color
            bubble.style.borderColor = color;
            bubble.style.borderLeftColor = color;
            titleEl.style.color = color;
            
            // Reset
            clearTimeout(typeWriterTimeout);
            bubble.classList.add('visible');
            titleEl.innerText = title;
            textEl.innerHTML = '<span class="cursor" style="color:' + color + '"></span>';
            
            let i = 0;
            const speed = 20; // ms per char

            function type() {
                if (i < text.length) {
                    const currentHTML = textEl.innerHTML;
                    const char = text.charAt(i);
                    const cursorStr = '<span class="cursor" style="color:' + color + '"></span>';
                    const content = text.substring(0, i + 1);
                    textEl.innerHTML = content + cursorStr;
                    i++;
                    typeWriterTimeout = setTimeout(type, speed);
                }
            }
            type();
        }

        // --- NEW: HINT UI FUNCTION ---
        function characterHint(title, text) {
            const bubble = document.getElementById('hint-bubble');
            const titleEl = document.getElementById('hint-title');
            const textEl = document.getElementById('hint-text');

            clearTimeout(hintTypeWriterTimeout);
            bubble.classList.add('visible');
            titleEl.innerText = title;
            textEl.innerHTML = '<span class="cursor"></span>';
            
            let i = 0;
            const speed = 20;

            function type() {
                if (i < text.length) {
                    const content = text.substring(0, i + 1);
                    textEl.innerHTML = content + '<span class="cursor"></span>';
                    i++;
                    hintTypeWriterTimeout = setTimeout(type, speed);
                }
            }
            type();
        }

        function hideHint() {
            const bubble = document.getElementById('hint-bubble');
            bubble.classList.remove('visible');
        }

        function triggerWave() {
            if (isWaving) return;
            isWaving = true;
            
            // Stop waving after 2 seconds
            setTimeout(() => {
                isWaving = false;
            }, 2000);
        }

        // --- PHYSICAL ROOM ENCLOSURE ---
        function createRoom() {
            const roomGroup = new THREE.Group();
            worldGroup.add(roomGroup); 

            const wallTotalWidth = WALL_WIDTH * TILE_SIZE;  
            const wallTotalHeight = WALL_HEIGHT * TILE_SIZE; 
            
            const roomWidth = wallTotalWidth; 
            const roomHeight = wallTotalWidth; 
            const roomDepth = 400; 

            // 1. REFLECTIVE FLOOR
            const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
            const groundMirror = new Reflector(floorGeo, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x222222 
            });
            
            groundMirror.position.y = -wallTotalHeight / 2; 
            groundMirror.position.z = 50; 
            groundMirror.rotation.x = -Math.PI / 2;
            roomGroup.add(groundMirror);

            // --- TEXTURES ---
            const gridTexFC = createGridTexture();
            gridTexFC.repeat.set(4, 16);
            
            const gridTexSide = createGridTexture();
            gridTexSide.repeat.set(16, 4);

            // 2. FLOOR GRID OVERLAY
            const gridMatFloor = new THREE.MeshBasicMaterial({
                map: gridTexFC,
                transparent: true,
                opacity: 0.6, 
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });
            
            const floorGrid = new THREE.Mesh(floorGeo, gridMatFloor);
            floorGrid.position.y = groundMirror.position.y + 0.1; 
            floorGrid.position.z = 50;
            floorGrid.rotation.x = -Math.PI / 2;
            roomGroup.add(floorGrid);

            // 3. REFLECTIVE CEILING
            const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
            const ceilingMirror = new Reflector(ceilingGeo, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x222222
            });
            
            ceilingMirror.position.y = (roomHeight / 2) - TILE_SIZE; 
            ceilingMirror.position.z = 50;
            ceilingMirror.rotation.x = Math.PI / 2;
            roomGroup.add(ceilingMirror);

            // 4. CEILING GRID OVERLAY
            const gridMatCeiling = new THREE.MeshBasicMaterial({
                map: gridTexFC,
                transparent: true,
                opacity: 0.6, 
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            const ceilingGrid = new THREE.Mesh(ceilingGeo, gridMatCeiling);
            ceilingGrid.position.y = ceilingMirror.position.y - 0.1; 
            ceilingGrid.position.z = 50;
            ceilingGrid.rotation.x = Math.PI / 2;
            roomGroup.add(ceilingGrid);

            // 5. SIDE WALLS GEOMETRY
            const wallGeo = new THREE.PlaneGeometry(roomDepth, roomHeight);

            // LEFT WALL REFLECTOR
            const wallLeftMirror = new Reflector(wallGeo, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x222222
            });
            wallLeftMirror.position.x = (-roomWidth / 2) - (TILE_SIZE / 2); 
            wallLeftMirror.position.z = 50;
            wallLeftMirror.rotation.y = Math.PI / 2;
            roomGroup.add(wallLeftMirror);

            // LEFT WALL GRID
            const gridMatSide = new THREE.MeshBasicMaterial({
                map: gridTexSide,
                transparent: true,
                opacity: 0.6, 
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            const wallLeftGrid = new THREE.Mesh(wallGeo, gridMatSide);
            wallLeftGrid.position.x = wallLeftMirror.position.x + 0.1; 
            wallLeftGrid.position.z = 50;
            wallLeftGrid.rotation.y = Math.PI / 2;
            roomGroup.add(wallLeftGrid);

            // RIGHT WALL REFLECTOR
            const wallRightMirror = new Reflector(wallGeo, {
                clipBias: 0.003,
                textureWidth: window.innerWidth * window.devicePixelRatio,
                textureHeight: window.innerHeight * window.devicePixelRatio,
                color: 0x222222
            });
            wallRightMirror.position.x = roomWidth / 2; 
            wallRightMirror.position.z = 50;
            wallRightMirror.rotation.y = -Math.PI / 2;
            roomGroup.add(wallRightMirror);

            // RIGHT WALL GRID
            const wallRightGrid = new THREE.Mesh(wallGeo, gridMatSide);
            wallRightGrid.position.x = wallRightMirror.position.x - 0.1; 
            wallRightGrid.position.z = 50;
            wallRightGrid.rotation.y = -Math.PI / 2;
            roomGroup.add(wallRightGrid);
        }

        // --- NEW: Hidden Dimension Placeholder ---
        function createHiddenDimension() {
            hiddenGroup = new THREE.Group();
            hiddenGroup.position.z = -50; 
            worldGroup.add(hiddenGroup); 

            // Tunnel Rings
            for(let i=0; i<15; i++) {
                const ringGeo = new THREE.TorusGeometry(30, 0.2, 8, 50);
                
                // UPDATED: Red Color + Emissive Glow
                const ringMat = new THREE.MeshStandardMaterial({ 
                    color: 0xff0000, 
                    transparent: true, 
                    opacity: 0.5,
                    emissive: 0xff0000,
                    emissiveIntensity: 3.0 // Glowing rings
                });
                
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.position.z = -i * 40;
                hiddenGroup.add(ring);
                tunnelRings.push(ring);
            }
        }

        function createWall() {
            wallGroup = new THREE.Group();
            worldGroup.add(wallGroup); 

            // Cube Dimensions: Width/Height = TILE_SIZE - GAP, Depth = 2x Width
            const cubeSize = TILE_SIZE - GAP;
            const cubeDepth = cubeSize * 2;
            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeDepth);
            
            // Generate Assets Pool (3 variations per type)
            const materialPool = {};
            const sideMaterialPool = {}; 

            SEQUENCE.forEach(type => {
                const color = TYPE_COLORS[type];
                materialPool[type] = [];
                
                let initialGlow = 0.4;
                if (type === 'AUTH' || type === 'CONSENT' || type === 'PAYWALL') {
                    initialGlow = 0.2;
                }

                // Front Face Variations
                for (let i = 0; i < 3; i++) {
                    const tex = createIconTexture(type, color, i);
                    const mat = new THREE.MeshStandardMaterial({ 
                        map: tex,
                        color: 0xaaaaaa,
                        roughness: 0.3,
                        metalness: 0.7,
                        emissive: new THREE.Color(color),
                        emissiveMap: tex,
                        emissiveIntensity: initialGlow
                    });
                    mat.emissiveMap = tex;
                    materialPool[type].push(mat);
                }

                // Side Material
                const sideTex = createSideTexture(color);
                sideMaterialPool[type] = new THREE.MeshStandardMaterial({
                    map: sideTex,
                    color: 0xaaaaaa,
                    roughness: 0.4,
                    metalness: 0.6,
                    emissive: new THREE.Color(color),
                    emissiveIntensity: 0.0 // Sides start dark
                });
            });
            
            // Build Grid
            for (let y = -Math.floor(WALL_HEIGHT/2); y < Math.floor(WALL_HEIGHT/2); y++) {
                for (let x = -Math.floor(WALL_WIDTH/2); x < Math.floor(WALL_WIDTH/2); x++) {
                    
                    const type = SEQUENCE[Math.floor(Math.random() * SEQUENCE.length)];
                    const variation = Math.floor(Math.random() * 3);
                    
                    const frontMat = materialPool[type][variation].clone();
                    const sMat = sideMaterialPool[type].clone(); 

                    const mats = [sMat, sMat, sMat, sMat, frontMat, sMat];

                    const mesh = new THREE.Mesh(geometry, mats);
                    mesh.position.set((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE, 0);
                    
                    let initialGlow = 0.4;
                    if (type === 'AUTH' || type === 'CONSENT' || type === 'PAYWALL') {
                        initialGlow = 0.2;
                    }

                    mesh.userData = {
                        type: type,
                        id: \`\${x}:\${y}\`,
                        baseZ: 0,
                        targetZ: 0,
                        hoverZ: 0,
                        isLocked: false,
                        velocity: new THREE.Vector3(),
                        rotVelocity: new THREE.Vector3(),
                        basePos: mesh.position.clone(),
                        initialGlow: initialGlow
                    };
                    wallGroup.add(mesh);
                }
            }
        }

        function onPointerDown(event) {
            dragStartPos.set(event.clientX, event.clientY);
        }

        function onPointerUp(event) {
            const dragEndPos = new THREE.Vector2(event.clientX, event.clientY);
            const distance = dragStartPos.distanceTo(dragEndPos);
            if (distance < 5) onClick(event);
        }

        function onMouseMove(event) {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function onClick(event) {
            if (!isGameActive) return;
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            checkIntersection(true);
        }

        function checkIntersection(isClick = false) {
            if (isPhysicsActive) return; 

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(wallGroup.children);

            let foundHover = null;
            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (!object.userData.isLocked) {
                    foundHover = object;
                    document.body.style.cursor = 'pointer';
                }
                
                if (isClick) {
                    handleTileInteraction(object);
                }
            } else {
                document.body.style.cursor = 'grab';
            }
            currentHover = foundHover;
        }

        function handleTileInteraction(mesh) {
            if (mesh.userData.isLocked) return; 

            totalInteractions++;

            // VISUALS
            const cubeSize = TILE_SIZE - GAP;
            const cubeDepth = cubeSize * 2;
            
            mesh.userData.targetZ = Math.random() * cubeDepth; 
            mesh.userData.isLocked = true; 
            
            const typeColor = TYPE_COLORS[mesh.userData.type];

            let frontInt = 5.0; 
            let sideInt = 2.0;  
            
            if (mesh.userData.type === 'AUTH' || mesh.userData.type === 'CONSENT' || mesh.userData.type === 'PAYWALL') {
                frontInt = 3.0; 
                sideInt = 1.0;  
            }

            mesh.material.forEach((mat, index) => {
                 mat.emissive.set(typeColor);
                 if (index === 4) { 
                     mat.emissiveIntensity = frontInt; 
                 } else {
                     mat.emissiveIntensity = sideInt;
                 }
            });

            setTimeout(() => {
                mesh.material.forEach((mat, index) => {
                    if (index === 4) {
                        mat.emissiveIntensity = 0.8; 
                    } else {
                        mat.emissiveIntensity = 0.6; 
                    }
                });
            }, 800);

            const msgs = MSG_LIB[mesh.userData.type];
            let msg = msgs[Math.floor(Math.random() * msgs.length)];

            const expectedType = SEQUENCE[currentStep];
            const clickedType = mesh.userData.type;

            let isCorrect = false;
            let title = "SEQUENCE RESET";

            if (clickedType === expectedType) {
                currentStep++;
                activeCubes.push(mesh); 
                isCorrect = true;
                title = "SEQUENCE ACCEPTED";

                const percent = (currentStep / SEQUENCE.length) * 100;
                scanBar.style.height = \`\${percent}%\`;
                
                // Clear any lingering hint if they get it right
                hideHint();

                if (currentStep >= SEQUENCE.length) {
                    initiateOpeningSequence();
                }
            } else {
                resetSequence();
                if (totalInteractions > 5) {
                    // INCORRECT + STRUGGLING
                    triggerWave();
                    const hint = HINTS[Math.floor(Math.random() * HINTS.length)];
                    characterHint("CLUE", hint);
                }
            }

            // TRIGGER CHARACTER SPEECH
            characterSpeak(title, msg, typeColor);
        }

        function resetSequence() {
            currentStep = 0;
            scanBar.style.height = '0%';
            activeCubes = [];
        }

        function initiateOpeningSequence() {
            isGameActive = false;
            hudStatus.innerText = "SYSTEM: GRANTED";
            
            let pulseCount = 0;
            const pulseInt = setInterval(() => {
                activeCubes.forEach(mesh => {
                    mesh.material.forEach(mat => {
                         if(mat.map) mat.emissiveIntensity = (pulseCount % 2 === 0) ? 5.0 : 1.0;
                    });
                });
                pulseCount++;
                if (pulseCount > 6) {
                    clearInterval(pulseInt);
                    startWithdrawal();
                }
            }, 300);
        }

        function startWithdrawal() {
            isPhysicsActive = true;
            
            wallGroup.children.forEach(mesh => {
                const xForce = (Math.random() - 0.5) * 2;
                const zForce = (Math.random()) * 8; 
                const yForce = (Math.random()) * 2; 

                mesh.userData.velocity.set(xForce, yForce, zForce);
                
                mesh.userData.rotVelocity.set(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05
                );
            });

            wallGroup.children.forEach(mesh => {
                mesh.material.forEach(mat => {
                    mat.emissiveIntensity = 0.1;
                });
            });

            isFlying = true;

            setTimeout(() => {
                const endScreen = document.getElementById('end-screen');
                const finalMsg = endScreen.querySelector('.final-msg');
                finalMsg.innerText = "REDIRECTING...";
                endScreen.classList.add('active');
            }, 5000); 
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if(composer) composer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            time += delta;

            if (controls) {
                controls.update(); 

                if (!isFlying) {
                    const maxX = 36; 
                    const maxY = 24; 
                    const currentX = controls.target.x;
                    const currentY = controls.target.y;
                    const clampedX = Math.max(-maxX, Math.min(maxX, currentX));
                    const clampedY = Math.max(-maxY, Math.min(maxY, currentY));
                    if (currentX !== clampedX || currentY !== clampedY) {
                        controls.target.set(clampedX, clampedY, controls.target.z);
                        camera.position.x += (clampedX - currentX);
                        camera.position.y += (clampedY - currentY);
                    }
                }
            }

            if (retroPass) retroPass.uniforms["time"].value = time;

            if (isFlying) {
                camera.position.z -= 0.5; 
                if (scene.fog.density > 0.002) {
                    scene.fog.density -= 0.0001;
                }
                const ringSpacing = 40;
                const numRings = 15;
                const totalLength = ringSpacing * numRings;
                tunnelRings.forEach(ring => {
                    const worldZ = -50 + ring.position.z;
                    if (worldZ > camera.position.z + 10) {
                        ring.position.z -= totalLength;
                    }
                });
            }

            // Character Animation
            if (characterGroup) {
                // Float
                characterGroup.position.y = -25 + Math.sin(time * 1.5) * 2;
                
                // Arm Waving
                if (isWaving && characterGroup.userData.armL && characterGroup.userData.armR) {
                    const waveSpeed = 15;
                    // Arm L: Waving UP high (approx 2.5 radians base)
                    characterGroup.userData.armL.rotation.z = Math.sin(time * waveSpeed) * 0.4 + 2.5; 
                    
                    // Arm R: Idle/Balance
                    characterGroup.userData.armR.rotation.z = Math.cos(time * 5) * 0.1 - 0.2; 
                } else if (characterGroup.userData.armL) {
                    // Reset to idle (arms down)
                    characterGroup.userData.armL.rotation.z = THREE.MathUtils.lerp(characterGroup.userData.armL.rotation.z, 0, 0.1);
                    characterGroup.userData.armR.rotation.z = THREE.MathUtils.lerp(characterGroup.userData.armR.rotation.z, 0, 0.1);
                }

                // Update Speech Bubble Position (Right)
                const charPos = new THREE.Vector3(0, 8, 0); 
                charPos.applyMatrix4(characterGroup.matrixWorld);
                charPos.project(camera);

                const x = (charPos.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(charPos.y * 0.5) + 0.5) * window.innerHeight;

                const bubble = document.getElementById('char-bubble');
                if (bubble.classList.contains('visible')) {
                    bubble.style.left = \`\${x}px\`;
                    bubble.style.top = \`\${y}px\`;
                }

                // Update Hint Bubble Position (Left)
                const hintPos = new THREE.Vector3(-10, 2, 0); // Left of body
                hintPos.applyMatrix4(characterGroup.matrixWorld);
                hintPos.project(camera);

                const hx = (hintPos.x * 0.5 + 0.5) * window.innerWidth;
                const hy = (-(hintPos.y * 0.5) + 0.5) * window.innerHeight;

                const hBubble = document.getElementById('hint-bubble');
                if (hBubble.classList.contains('visible')) {
                    hBubble.style.left = \`\${hx}px\`;
                    hBubble.style.top = \`\${hy}px\`;
                }
            }

            if (wallGroup) {
                if (!isPhysicsActive) {
                    checkIntersection(false);

                    wallGroup.children.forEach(mesh => {
                        let targetZ = mesh.userData.targetZ;

                        if (mesh === currentHover && !mesh.userData.isLocked) {
                            mesh.position.x = mesh.userData.basePos.x + (Math.random() - 0.5) * 0.8;
                            mesh.position.y = mesh.userData.basePos.y + (Math.random() - 0.5) * 0.8;
                            
                            const s = 1.0 + (Math.random() - 0.5) * 0.05;
                            mesh.scale.set(s, s, s);

                            mesh.material[4].emissiveIntensity = 1.5 + Math.random() * 1.5;
                            targetZ += 5; 

                        } else if (!mesh.userData.isLocked) {
                            mesh.position.x = mesh.userData.basePos.x;
                            mesh.position.y = mesh.userData.basePos.y;
                            mesh.scale.set(1, 1, 1);
                            mesh.material[4].emissiveIntensity = mesh.userData.initialGlow;
                        }

                        mesh.position.z += (targetZ - mesh.position.z) * 0.1;
                    });

                    const targetRotY = (mouse.x * 0.1) + Math.sin(time * 0.5) * 0.01; 
                    const targetRotX = (-mouse.y * 0.1) + Math.cos(time * 0.4) * 0.01;

                    if (worldGroup) {
                        worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.05;
                        worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.05;
                    }
                } 
                else {
                    const GRAVITY = -0.15;
                    const FLOOR_Y = -60; 

                    wallGroup.children.forEach(mesh => {
                        mesh.userData.velocity.y += GRAVITY;
                        mesh.position.add(mesh.userData.velocity);
                        
                        mesh.rotation.x += mesh.userData.rotVelocity.x;
                        mesh.rotation.y += mesh.userData.rotVelocity.y;
                        mesh.rotation.z += mesh.userData.rotVelocity.z;

                        if (mesh.position.y < FLOOR_Y) {
                            mesh.position.y = FLOOR_Y;
                            mesh.userData.velocity.y *= -0.5; 
                            mesh.userData.velocity.x *= 0.9; 
                            mesh.userData.velocity.z *= 0.9; 
                            mesh.userData.rotVelocity.multiplyScalar(0.9); 
                        }
                    });
                }
            }

            composer.render();
        }

        init(); 

    </script>
</body>
</html>`;

  return (
    <iframe
      srcDoc={htmlContent}
      className="absolute inset-0 w-full h-full border-0 z-[100]"
      title="The Wall"
      style={{ pointerEvents: 'auto' }}
    />
  );
};
