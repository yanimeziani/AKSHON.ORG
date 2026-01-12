import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x050505,
    colorGrid: 0xffaa00,
    colorParticle: 0x00ffff,
    sensitivity: 60,
    baseSpeed: 0.5,
    lerpFactor: 0.08,    // Smooth movement
    rotationLerp: 0.05   // Smooth rotation
};

// State
let scene, camera, renderer;
let particles, grid;
let time = 0;
let voiceLevel = 0;

// Movement State
let targetPos = new THREE.Vector3(0, 0, 100);
let targetRot = new THREE.Euler(0, 0, 0);
let currentSpeed = CONFIG.baseSpeed;
let forwardMomentum = 0;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        // RIGHT HAND (X, Y) -> Steering
        if (right.active) {
            targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 2;
            targetPos.y = (0.5 - right.y) * CONFIG.sensitivity * 2;
        }

        // LEFT HAND (Z) -> Throttle / Gauge
        if (left.active) {
            // Mapping Z (depth) to speed. MediaPipe Z is normalized but around 0.
            // When hand is closer to camera, Z decreases.
            // SpaceShip throttle: Closer = Faster
            const throttleValue = Math.max(0, (0.5 - left.z) * 5);
            forwardMomentum = throttleValue;
        }
    },
    onHeadUpdate: (head) => {
        // HEAD -> POV Tracking (Look around the cockpit)
        // Map small head movements to camera rotation
        targetRot.y = (head.x - 0.5) * -0.5;
        targetRot.x = (head.y - 0.5) * 0.5;
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
    },
    onKeyUpdate: (keys) => {
        // Keyboard Fallback (Game-like)
        if (keys['w']) targetPos.y += 2;
        if (keys['s']) targetPos.y -= 2;
        if (keys['a']) targetPos.x += 2;
        if (keys['d']) targetPos.x -= 2;
        if (keys['Shift']) forwardMomentum += 0.5;
    }
});

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorBackground, 0.005);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Dynamic Grid for resonance feel
    const gridDiv = 50;
    const gridSize = 2000;
    const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, gridDiv, gridDiv);
    const gridMat = new THREE.MeshBasicMaterial({
        color: CONFIG.colorGrid,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -60;
    scene.add(grid);

    createSpaceParticles();

    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    window.addEventListener('resize', onWindowResize);

    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createSpaceParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 30000;
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
        positions.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 1000,
            (Math.random() - 1.0) * 3000
        );
        sizes.push(Math.random() * 2);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: CONFIG.colorParticle,
        size: 0.8,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    time += 0.01;

    // SMOOTH MOVEMENT EQUATIONS (Resonance Protocol)
    // 1. Position Interpolation
    camera.position.x += (targetPos.x - camera.position.x) * CONFIG.lerpFactor;
    camera.position.y += (targetPos.y - camera.position.y) * CONFIG.lerpFactor;

    // 2. Head-driven POV Rotation
    camera.rotation.x += (targetRot.x - camera.rotation.x) * CONFIG.rotationLerp;
    camera.rotation.y += (targetRot.y - camera.rotation.y) * CONFIG.rotationLerp;

    // 3. Banking / Roll Tilt (Flight Feel)
    const targetRoll = -camera.position.x * 0.01;
    camera.rotation.z += (targetRoll - camera.rotation.z) * 0.05;

    // 4. Forward SpaceShip Motion
    currentSpeed = (CONFIG.baseSpeed + forwardMomentum) * (1 + voiceLevel * 5);

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += currentSpeed * 10; // Speed up based on throttle

        // Recycle particles
        if (positions[i + 2] > 200) {
            positions[i + 2] = -2800;
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 1000;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Grid Warp Resonance
    grid.position.z = (camera.position.z + (time * 1000) % 40) - 20;

    // Particle Glow
    particles.material.size = 0.8 + voiceLevel * 10;
    particles.material.color.setHSL(0.5 + Math.sin(time) * 0.1, 1, 0.5 + voiceLevel);

    renderer.render(scene, camera);
}
