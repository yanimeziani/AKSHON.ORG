import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x000502,
    colorFog: 0x000f05,
    colorGround: 0x001a05,
    colorTree: 0x00ff88,
    colorData: 0x00ffff,
    worldSize: 200,
    treeCount: 500,
    particleCount: 2000
};

// State
let scene, camera, renderer, controls;
let time = 0;
let voiceLevel = 0;

// Variables for hand control
let targetRotationX = 0, targetRotationY = 0;
let targetZoom = 40;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (left.active) {
            targetRotationY = (left.x - 0.5) * Math.PI * 2;
            targetRotationX = (left.y - 0.5) * Math.PI;
        }
        if (right.active) {
            targetZoom = 10 + (right.y * 100);
        }
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
        const elVoice = document.getElementById('voice-lvl');
        if (elVoice) elVoice.innerText = level.toFixed(2);
    }
});

// Objects
let particles;
let trees;
let terrain;

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorFog, 0.015);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(100, 100, 50);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(CONFIG.colorTree, 2, 100);
    pointLight.position.set(0, 20, 0);
    scene.add(pointLight);

    createTerrain();
    createTrees();
    createParticles();

    const gridHelper = new THREE.GridHelper(CONFIG.worldSize, 50, 0x004411, 0x002208);
    gridHelper.position.y = 0.1;
    scene.add(gridHelper);

    window.addEventListener('resize', onWindowResize);

    // Initialize Multimodal
    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createTerrain() {
    const geometry = new THREE.PlaneGeometry(CONFIG.worldSize, CONFIG.worldSize, 64, 64);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position.array;
    const noise = new ImprovedNoise();

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const h = noise.noise(x * 0.02, 0, z * 0.02) * 10;
        const d = noise.noise(x * 0.1, 0, z * 0.1) * 2;
        let y = h + d;
        if (y < 0) y = 0;
        positions[i + 1] = y;
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colorGround,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });

    terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);
}

function createTrees() {
    const geometry = new THREE.ConeGeometry(0.5, 4, 4);
    geometry.translate(0, 2, 0);

    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colorTree,
        emissive: 0x003311,
        roughness: 0.2,
        metalness: 0.8,
        flatShading: true
    });

    trees = new THREE.InstancedMesh(geometry, material, CONFIG.treeCount);

    const dummy = new THREE.Object3D();
    const noise = new ImprovedNoise();

    for (let i = 0; i < CONFIG.treeCount; i++) {
        const x = (Math.random() - 0.5) * CONFIG.worldSize * 0.8;
        const z = (Math.random() - 0.5) * CONFIG.worldSize * 0.8;
        const h = noise.noise(x * 0.02, 0, z * 0.02) * 10 + noise.noise(x * 0.1, 0, z * 0.1) * 2;
        let y = Math.max(0, h);
        if (y < 2) continue;
        dummy.position.set(x, y, z);
        const s = 1 + Math.random() * 2;
        dummy.scale.set(s, s * (0.8 + Math.random() * 0.4), s);
        dummy.updateMatrix();
        trees.setMatrixAt(i, dummy.matrix);
    }
    scene.add(trees);
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const x = (Math.random() - 0.5) * CONFIG.worldSize;
        const y = Math.random() * 30;
        const z = (Math.random() - 0.5) * CONFIG.worldSize;
        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: CONFIG.colorData,
        size: 0.2,
        transparent: true,
        opacity: 0.6,
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

    time += 0.005;

    // Slow auto-rotation or hand rotation
    // if hand is active, it overrides
    if (controller.state.leftHand.active) {
        // Hand control logic
    }

    // Animate particles (rising data)
    const positions = particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.05 + voiceLevel * 0.5; // Rise faster with voice
        if (positions[i] > 30) {
            positions[i] = 0;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Pulse tree emissive with voice
    trees.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3 + voiceLevel * 2;

    controls.update();
    renderer.render(scene, camera);
}
