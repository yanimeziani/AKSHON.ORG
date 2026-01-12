import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x000500,
    colorFog: 0x001000,
    colorTree: 0x00ff88,
    sensitivity: 80,
    baseSpeed: 0.3,
    lerpFactor: 0.1
};

// State
let scene, camera, renderer;
let time = 0;
let voiceLevel = 0;

// Movement State
let targetPos = new THREE.Vector3(0, 50, 100);
let targetRot = new THREE.Euler(0, 0, 0);
let forwardMomentum = 0;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (right.active) {
            targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 3;
            targetPos.y = 20 + (0.5 - right.y) * CONFIG.sensitivity * 2;
        }
        if (left.active) {
            forwardMomentum = Math.max(0, (0.5 - left.z) * 4);
        }
    },
    onHeadUpdate: (head) => {
        targetRot.y = (head.x - 0.5) * -0.6;
        targetRot.x = (head.y - 0.5) * 0.4;
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
    }
});

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorFog, 0.005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 50, 200);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    createEnvironment();
    createDataParticles();

    window.addEventListener('resize', onWindowResize);

    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createEnvironment() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(5000, 5000, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x001100, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Forest / Tech Trees
    const treeGeo = new THREE.ConeGeometry(5, 50, 4);
    const treeMat = new THREE.MeshStandardMaterial({ color: CONFIG.colorTree, emissive: CONFIG.colorTree, emissiveIntensity: 0.2 });

    for (let i = 0; i < 400; i++) {
        const tree = new THREE.Mesh(treeGeo, treeMat);
        tree.position.set((Math.random() - 0.5) * 2000, 25, (Math.random() - 0.5) * 2000);
        tree.rotation.y = Math.random() * Math.PI;
        scene.add(tree);
    }

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 100, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x004400, 0.5));
}

let particles;
function createDataParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 10000;
    const pos = [];
    for (let i = 0; i < count; i++) {
        pos.push((Math.random() - 0.5) * 2000, Math.random() * 200, (Math.random() - 0.5) * 2000);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00ff00, size: 2, transparent: true, opacity: 0.5 });
    particles = new THREE.Points(geo, mat);
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

    // Movement
    camera.position.x += (targetPos.x - camera.position.x) * CONFIG.lerpFactor;
    camera.position.y += (targetPos.y - camera.position.y) * CONFIG.lerpFactor;

    // Head POV
    camera.rotation.x += (targetRot.x - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRot.y - camera.rotation.y) * 0.05;

    // Forward speed
    const speed = (CONFIG.baseSpeed + forwardMomentum) * (1 + voiceLevel * 3);

    // Animate particles to simulate flight
    const posArr = particles.geometry.attributes.position.array;
    for (let i = 0; i < posArr.length; i += 3) {
        posArr[i + 2] += speed * 20;
        if (posArr[i + 2] > 1000) posArr[i + 2] = -1000;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Pulse trees
    scene.children.forEach(child => {
        if (child.material && child.material.emissive) {
            child.material.emissiveIntensity = 0.2 + voiceLevel * 2 + Math.sin(time * 2) * 0.1;
        }
    });

    renderer.render(scene, camera);
}
