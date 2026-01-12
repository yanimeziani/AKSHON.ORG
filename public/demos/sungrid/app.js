import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x050505,
    colorGrid: 0xffaa00,
    colorParticle: 0x00ffff,
    sensitivity: 50,
    baseSpeed: 1.0,
    lerpFactor: 0.1
};

// State
let scene, camera, renderer;
let particles, grid;
let time = 0;
let voiceLevel = 0;

// Ship Logic State
let targetX = 0, targetY = 0;
let currentSpeed = CONFIG.baseSpeed;
let zDepth = 50;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        // Right Hand -> X and Y Movement
        if (right.active) {
            targetX = (right.x - 0.5) * -CONFIG.sensitivity * 2;
            targetY = (right.y - 0.5) * CONFIG.sensitivity * 2;
        }

        // Left Hand Z -> Speed (Spaceship throttle)
        if (left.active) {
            // Mapping Z (distance) to speed
            // MediaPipe Hand Z is typically normalized but can be noisy
            // A common range is 0 to -1 or similar. 
            // Let's use left.y as a 'gauge' if Z is too unstable, 
            // but the user specifically said Z.
            // Mediapipe Hand Z is relative to the wrist depth.
            // We'll use the relative depth of the landmarks.

            // Actually, let's map Left Y to forward speed if Z is problematic, 
            // but I'll try Z first.
            const throttle = Math.max(0.1, (0.5 - left.z) * 10);
            currentSpeed = CONFIG.baseSpeed * throttle;
        }
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
        const elVoice = document.getElementById('voice-lvl');
        if (elVoice) elVoice.innerText = level.toFixed(2);
    },
    onKeyUpdate: (keys) => {
        // Keyboard Fallback
        if (keys['w'] || keys['ArrowUp']) targetY += 1;
        if (keys['s'] || keys['ArrowDown']) targetY -= 1;
        if (keys['a'] || keys['ArrowLeft']) targetX += 1;
        if (keys['d'] || keys['ArrowRight']) targetX -= 1;
        if (keys['q']) currentSpeed += 0.1;
        if (keys['e']) currentSpeed -= 0.1;
    },
    onMouseUpdate: (mouse) => {
        if (!controller.state.rightHand.active) {
            targetX = mouse.x * CONFIG.sensitivity;
            targetY = mouse.y * CONFIG.sensitivity;
        }
    }
});

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorBackground, 0.01);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const gridHelper = new THREE.GridHelper(1000, 50, CONFIG.colorGrid, 0x111111);
    gridHelper.position.y = -50;
    scene.add(gridHelper);
    grid = gridHelper;

    createCorpusParticles();

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffaa00, 2, 200);
    camera.add(pointLight);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize);

    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createCorpusParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 20000;
    const positions = [];
    const speeds = [];

    for (let i = 0; i < count; i++) {
        positions.push(
            (Math.random() - 0.5) * 800,
            (Math.random() - 0.5) * 400,
            (Math.random() - 0.5) * 2000
        );
        speeds.push(1 + Math.random() * 5);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1));

    const material = new THREE.PointsMaterial({
        color: CONFIG.colorParticle,
        size: 1.0,
        transparent: true,
        opacity: 0.4,
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

    // Smoothing equations for movement
    camera.position.x += (targetX - camera.position.x) * CONFIG.lerpFactor;
    camera.position.y += (targetY - camera.position.y) * CONFIG.lerpFactor;

    // Spaceship like forward motion
    // We move the global "time" or offset the particles to simulate flight
    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.geometry.attributes.speed.array;

    for (let i = 0; i < positions.length; i += 3) {
        // Move Z towards camera based on speed
        positions[i + 2] += speeds[i / 3] * currentSpeed * (1 + voiceLevel * 3);

        if (positions[i + 2] > 200) {
            positions[i + 2] = -1800;
            positions[i] = (Math.random() - 0.5) * 800;
            positions[i + 1] = (Math.random() - 0.5) * 400;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Tilt the camera slightly based on X movement for that "pilot" feel
    camera.rotation.z = -camera.position.x * 0.01;
    camera.lookAt(0, 0, -500);

    // Voice reactivity
    particles.material.size = 1.0 + voiceLevel * 8;
    particles.material.opacity = 0.4 + voiceLevel * 0.6;

    renderer.render(scene, camera);
}
