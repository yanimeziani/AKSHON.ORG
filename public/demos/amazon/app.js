import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

const CONFIG = {
    colorBackground: 0x000500,
    sensitivity: 85,
    baseSpeed: 0.3,
    lerpFactor: 0.1
};

let scene, camera, renderer, particles;
let time = 0;
let voiceLevel = 0;
let targetPos = new THREE.Vector3(0, 50, 100);
let targetRot = new THREE.Euler(0, 0, 0);
let forwardMomentum = 0;
let worldHue = 140; // Greenish
let forestVitality = 0; // Linked to spread

const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (right.active) {
            targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 3;
            targetPos.y = 25 + (0.5 - right.y) * CONFIG.sensitivity * 2;
            worldHue = right.hue;
        }
        if (left.active) {
            forwardMomentum = Math.max(0, (0.5 - left.z) * 4);
            forestVitality = left.spread; // Expansion affects "growth"
        }
    },
    onHeadUpdate: (head) => {
        targetRot.y = (head.x - 0.5) * -0.7;
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
    scene.fog = new THREE.FogExp2(0x001000, 0.005);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(0, 50, 200);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    createEnvironment();
    createDataStream();

    window.addEventListener('resize', onWindowResize);
    controller.initHands(document.getElementById('input-video'), document.getElementById('output-canvas')).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createEnvironment() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshStandardMaterial({ color: 0x001100 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const treeGeo = new THREE.ConeGeometry(8, 60, 4);
    for (let i = 0; i < 300; i++) {
        const tree = new THREE.Mesh(treeGeo, new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.2 }));
        tree.position.set((Math.random() - 0.5) * 2000, 30, (Math.random() - 0.5) * 2000);
        tree.userData.baseScale = 1 + Math.random();
        scene.add(tree);
    }
    scene.add(new THREE.AmbientLight(0x004400, 0.5));
}

function createDataStream() {
    const geo = new THREE.BufferGeometry();
    const count = 10000;
    const pos = [];
    for (let i = 0; i < count; i++) pos.push((Math.random() - 0.5) * 2000, Math.random() * 200, (Math.random() - 0.5) * 2000);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x00ff00, size: 2, transparent: true, opacity: 0.5 }));
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
    camera.rotation.x += (targetRot.x - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRot.y - camera.rotation.y) * 0.05;

    // Movement Coherence
    const speed = (CONFIG.baseSpeed + forwardMomentum) * (1 + voiceLevel * 3);
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
        pos[i + 2] += speed * 20;
        if (pos[i + 2] > 1000) pos[i + 2] = -1000;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // WAVE SPECTRUM & BIOMIMETIC VITALITY
    const color = new THREE.Color().setHSL(worldHue / 360, 0.8, 0.5);
    scene.fog.color.copy(color).lerp(new THREE.Color(0x000000), 0.8);

    scene.children.forEach(child => {
        if (child.material && child.material.emissive) {
            // Pulse based on voice and vital expansion
            child.material.emissive.copy(color);
            child.material.emissiveIntensity = 0.1 + voiceLevel * 2 + Math.sin(time * 2) * 0.1;
            // Tree scaling based on Vitality (Biomimetic growth)
            const scale = child.userData.baseScale * (1 + forestVitality * 0.5);
            child.scale.set(scale, scale, scale);
        }
    });

    renderer.render(scene, camera);
}
