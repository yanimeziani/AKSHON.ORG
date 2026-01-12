import * as THREE from 'three';
import { MultiModalController } from '../common/multimodal.js';

// Configuration
const CONFIG = {
    colorBackground: 0x1a0b00,
    colorFog: 0x2a1500,
    colorGround: 0xc2a67e,
    sensitivity: 70,
    baseSpeed: 0.4,
    lerpFactor: 0.1
};

// State
let scene, camera, renderer;
let time = 0;
let voiceLevel = 0;

// Movement State
let targetPos = new THREE.Vector3(0, 30, 100);
let targetRot = new THREE.Euler(0, 0, 0);
let forwardMomentum = 0;

// Inputs
const controller = new MultiModalController({
    onHandUpdate: (left, right) => {
        if (right.active) {
            targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 3;
            targetPos.y = 15 + (0.5 - right.y) * CONFIG.sensitivity * 2;
        }
        if (left.active) {
            forwardMomentum = Math.max(0, (0.5 - left.z) * 5);
        }
    },
    onHeadUpdate: (head) => {
        targetRot.y = (head.x - 0.5) * -0.7;
        targetRot.x = (head.y - 0.5) * 0.4;
    },
    onVoiceUpdate: (level) => {
        voiceLevel = level;
    }
});

let heatHaze;
init();
animate();

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.colorBackground);
    scene.fog = new THREE.FogExp2(CONFIG.colorFog, 0.006);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 30, 150);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    createSahara();
    createHeatHaze();

    window.addEventListener('resize', onWindowResize);

    const video = document.getElementById('input-video');
    const canvas = document.getElementById('output-canvas');
    controller.initHands(video, canvas).then(() => {
        document.getElementById('loading').style.display = 'none';
    });
}

function createSahara() {
    const geo = new THREE.PlaneGeometry(5000, 5000, 64, 64);
    const mat = new THREE.MeshStandardMaterial({ color: CONFIG.colorGround, roughness: 1 });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const ambient = new THREE.AmbientLight(0xffaa00, 0.4);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(100, 200, 100);
    scene.add(sun);
}

function createHeatHaze() {
    const geo = new THREE.BufferGeometry();
    const count = 15000;
    const pos = [];
    for (let i = 0; i < count; i++) {
        pos.push((Math.random() - 0.5) * 2000, Math.random() * 150, (Math.random() - 0.5) * 2000);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 3, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    heatHaze = new THREE.Points(geo, mat);
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

    // Movement
    camera.position.x += (targetPos.x - camera.position.x) * CONFIG.lerpFactor;
    camera.position.y += (targetPos.y - camera.position.y) * CONFIG.lerpFactor;

    // Head POV
    camera.rotation.x += (targetRot.x - camera.rotation.x) * 0.05;
    camera.rotation.y += (targetRot.y - camera.rotation.y) * 0.05;

    // Forward speed
    const speed = (CONFIG.baseSpeed + forwardMomentum) * (1 + voiceLevel * 4);

    // Animate heat haze to simulate flight
    const posArr = heatHaze.geometry.attributes.position.array;
    for (let i = 0; i < posArr.length; i += 3) {
        posArr[i + 2] += speed * 25;
        posArr[i + 1] += Math.sin(time + posArr[i]) * 0.2; // Wiggle
        if (posArr[i + 2] > 1000) posArr[i + 2] = -1500;
    }
    heatHaze.geometry.attributes.position.needsUpdate = true;

    // Dynamic Haze
    heatHaze.material.opacity = 0.2 + voiceLevel * 0.5 + Math.sin(time) * 0.1;

    renderer.render(scene, camera);
}
