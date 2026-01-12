import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

const CONFIG = {
    colorBackground: 0x050505,
    sensitivity: 65,
    baseSpeed: 0.5,
    lerpFactor: 0.1,
    rotationLerp: 0.08
};

let scene, camera, renderer, particles, grid;
let time = 0;
let voiceLevel = 0;
let targetPos = new THREE.Vector3(0, 0, 100);
let targetRot = new THREE.Euler(0, 0, 0);
let forwardMomentum = 0;
let worldHue = 180; // Default Cyan
let kineticEnergy = 0;

const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (right.active) {
            targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 2.5;
            targetPos.y = (0.5 - right.y) * CONFIG.sensitivity * 2;
            worldHue = right.hue; // Spectral Shift
            kineticEnergy = right.velocity; // Movement Coherence
        }
        if (left.active) {
            // Z-Throttle + Spread Bloom
            forwardMomentum = Math.max(0, (0.5 - left.z) * 5) * (1 + left.spread);
        }
    },
    onHeadUpdate: (head) => {
        targetRot.y = (head.x - 0.5) * -0.6;
        targetRot.x = (head.y - 0.5) * 0.4;
    },
    onVoiceUpdate: (level) => { voiceLevel = level; }
});

init();
animate();

function init() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorBackground, 0.006);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const gridGeo = new THREE.PlaneGeometry(2000, 2000, 60, 60);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.2 });
    grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2;
    grid.position.y = -60;
    scene.add(grid);

    createSpaceParticles();
    window.addEventListener('resize', onWindowResize);
    controller.initHands(document.getElementById('input-video'), document.getElementById('output-canvas')).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createSpaceParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 30000;
    const pos = [], sizes = [];
    for (let i = 0; i < count; i++) {
        pos.push((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 1000, (Math.random() - 1.0) * 3000);
        sizes.push(Math.random() * 2);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ffff, size: 0.8, transparent: true, opacity: 0.7, additiveBlending: true }));
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

    camera.position.x += (targetPos.x - camera.position.x) * CONFIG.lerpFactor;
    camera.position.y += (targetPos.y - camera.position.y) * CONFIG.lerpFactor;
    camera.rotation.x += (targetRot.x - camera.rotation.x) * CONFIG.rotationLerp;
    camera.rotation.y += (targetRot.y - camera.rotation.y) * CONFIG.rotationLerp;

    const currentSpeed = (CONFIG.baseSpeed + forwardMomentum) * (1 + voiceLevel * 4);

    // BIOMIMETIC MOVEMENT COHERENCE
    // Grid warping based on kinetic energy
    const gridVertices = grid.geometry.attributes.position.array;
    for (let i = 0; i < gridVertices.length; i += 3) {
        const x = gridVertices[i];
        const y = gridVertices[i + 1];
        gridVertices[i + 2] = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time) * (5 + kineticEnergy * 2);
    }
    grid.geometry.attributes.position.needsUpdate = true;

    // SPECTRAL SHIFT
    const color = new THREE.Color().setHSL(worldHue / 360, 1.0, 0.5 + voiceLevel * 0.2);
    particles.material.color.copy(color);
    grid.material.color.copy(color);
    grid.material.opacity = 0.1 + kineticEnergy * 0.1;

    // Movement Loop
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] += currentSpeed * 15;
        if (pos[i + 2] > 200) pos[i + 2] = -2800;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
