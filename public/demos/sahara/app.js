import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x1a0b00,
    colorFog: 0x2a1500,
    colorGround: 0xc2a67e,
    colorPanel: 0x111111,
    colorPanelEdge: 0xffaa00,
    worldSize: 300,
    panelCount: 1000,
    particleCount: 500
};

// State
let scene, camera, renderer, controls;
let time = 0;
let voiceLevel = 0;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (left.active) {
            const elL = document.getElementById('l-stat');
            if (elL) elL.innerText = `X:${left.x.toFixed(2)}`;
            // Control heat haze intensity with left hand height
            if (heatHaze) heatHaze.material.opacity = 0.1 + (1 - left.y) * 0.5;
        }
        if (right.active) {
            const elR = document.getElementById('r-stat');
            if (elR) elR.innerText = `Z:${right.y.toFixed(2)}`;
            // Move camera or zoom with right hand
        }
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
        const elVoice = document.getElementById('voice-lvl');
        if (elVoice) elVoice.innerText = level.toFixed(2);
    }
});

// Objects
let panels;
let terrain;
let heatHaze;

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorFog, 0.008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 60);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    createTerrain();
    createSolarArrays();
    createHeatParticles();

    window.addEventListener('resize', onWindowResize);

    // Initialize Multimodal
    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createTerrain() {
    const geometry = new THREE.PlaneGeometry(CONFIG.worldSize, CONFIG.worldSize, 128, 128);
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position.array;
    const noise = new ImprovedNoise();

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        const h1 = noise.noise(x * 0.01, 0, z * 0.01 + x * 0.005) * 15;
        const h2 = Math.sin(x * 0.5 + Math.sin(z * 0.2)) * 0.5;
        let y = (h1 + h2);
        if (y < -5) y = -5;
        positions[i + 1] = y;
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colorGround,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: false
    });

    terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    scene.add(terrain);
}

function createSolarArrays() {
    const geometry = new THREE.BoxGeometry(2, 0.2, 1.5);
    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.colorPanel,
        roughness: 0.1,
        metalness: 0.9,
    });

    panels = new THREE.InstancedMesh(geometry, material, CONFIG.panelCount);
    panels.castShadow = true;
    panels.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const noise = new ImprovedNoise();

    for (let i = 0; i < CONFIG.panelCount; i++) {
        const range = CONFIG.worldSize * 0.4;
        const x = (Math.random() - 0.5) * range * 2;
        const z = (Math.random() - 0.5) * range * 2;
        const h1 = noise.noise(x * 0.01, 0, z * 0.01 + x * 0.005) * 15;
        const h2 = Math.sin(x * 0.5 + Math.sin(z * 0.2)) * 0.5;
        const y = h1 + h2;
        dummy.position.set(x, y + 0.5, z);
        dummy.lookAt(50, 100, 50);
        dummy.updateMatrix();
        panels.setMatrixAt(i, dummy.matrix);
    }
    scene.add(panels);
}

function createHeatParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < CONFIG.particleCount; i++) {
        const x = (Math.random() - 0.5) * CONFIG.worldSize;
        const y = Math.random() * 20;
        const z = (Math.random() - 0.5) * CONFIG.worldSize;
        positions.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.5,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });

    heatHaze = new THREE.Points(geometry, material);
    scene.add(heatHaze);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    time += 0.01;

    const positions = heatHaze.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.05 + voiceLevel * 0.5;
        positions[i] += Math.sin(time + positions[i + 1]) * (0.02 + voiceLevel * 0.1);

        if (positions[i + 1] > 20) {
            positions[i + 1] = 0;
        }
    }
    heatHaze.geometry.attributes.position.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
}
