import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x050505,
    colorGrid: 0xffaa00,
    colorParticle: 0x00ffff,
    sensitivity: 50,
    streamSpeed: 2.0
};

// State
let scene, camera, renderer;
let particles, grid;
let time = 0;
let voiceLevel = 0;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (left.active) {
            targetX = (left.x - 0.5) * -CONFIG.sensitivity * 2;
            targetY = (left.y - 0.5) * CONFIG.sensitivity * 2;
        }
        if (right.active) {
            targetZ = 10 + (right.y * 150);
        }
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
        const elVoice = document.getElementById('voice-lvl');
        if (elVoice) elVoice.innerText = level.toFixed(2);
    },
    onKeyUpdate: (keys) => {
        if (keys['ArrowUp']) targetZ -= 2;
        if (keys['ArrowDown']) targetZ += 2;
        if (keys['ArrowLeft']) targetX -= 2;
        if (keys['ArrowRight']) targetX += 2;
    }
});

let targetX = 0, targetY = 0, targetZ = 50;

// DOM Elements
const elLPos = document.getElementById('l-pos');
const elRPos = document.getElementById('r-pos');
const elStreamStatus = document.getElementById('stream-status');
const elDataCount = document.getElementById('data-count');

let downloadedBytes = 452030102;

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorBackground, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 50);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const gridHelper = new THREE.GridHelper(400, 100, CONFIG.colorGrid, 0x111111);
    gridHelper.position.y = -20;
    scene.add(gridHelper);
    grid = gridHelper;

    createCorpusParticles();

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
    camera.add(pointLight);
    scene.add(camera);

    window.addEventListener('resize', onWindowResize);

    // Initialize Multimodal
    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createCorpusParticles() {
    const geometry = new THREE.BufferGeometry();
    const count = 15000;
    const positions = [];
    const speeds = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 1000 - 200;

        positions.push(x, y, z);
        speeds.push(1 + Math.random() * 4);
        sizes.push(Math.random());
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('speed', new THREE.Float32BufferAttribute(speeds, 1));
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

    // Smooth lerp
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;

    camera.lookAt(0, 0, 0);

    // Voice reactivity: particles pulse with voice
    particles.material.size = 0.8 + voiceLevel * 5;
    particles.material.opacity = 0.6 + voiceLevel * 0.4;

    const positions = particles.geometry.attributes.position.array;
    const speeds = particles.geometry.attributes.speed.array;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] += speeds[i / 3] * CONFIG.streamSpeed * (1 + voiceLevel * 2);

        if (positions[i + 2] > 100) {
            positions[i + 2] = -500;
            positions[i] = (Math.random() - 0.5) * 400;
            positions[i + 1] = (Math.random() - 0.5) * 200;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    downloadedBytes += Math.floor(Math.random() * 10243);
    if (elDataCount) elDataCount.innerText = "GCP_INGEST: " + (downloadedBytes / 1024 / 1024).toFixed(2) + " MB";

    renderer.render(scene, camera);
}
