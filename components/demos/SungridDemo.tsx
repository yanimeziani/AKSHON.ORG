"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MultiModalController, HandState, HeadState } from '@/lib/multimodal';
import Script from 'next/script';
import { trackEvent } from '@/lib/analytics';

const CONFIG = {
    colorBackground: 0x050505,
    colorGrid: 0xffaa00,
    colorParticle: 0x00ffff,
    sensitivity: 60,
    baseSpeed: 0.5,
    lerpFactor: 0.08,
    rotationLerp: 0.05
};

export default function SungridDemo() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [leftHandPos, setLeftHandPos] = useState("WAITING...");
    const [rightHandPos, setRightHandPos] = useState("WAITING...");
    const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);

    const stateRef = useRef({
        targetPos: new THREE.Vector3(0, 0, 100),
        targetRot: new THREE.Euler(0, 0, 0),
        forwardMomentum: 0,
        voiceLevel: 0,
        time: 0,
        currentSpeed: CONFIG.baseSpeed
    });

    useEffect(() => {
        trackEvent({ type: "page_view", path: "/demos/sungrid" });
    }, []);

    useEffect(() => {
        if (!isScriptsLoaded || !containerRef.current) return;

        // THREE.js Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colorBackground);
        scene.fog = new THREE.FogExp2(CONFIG.colorBackground, 0.005);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
        camera.position.set(0, 0, 100);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Grid
        const gridDiv = 50;
        const gridSize = 2000;
        const gridGeo = new THREE.PlaneGeometry(gridSize, gridSize, gridDiv, gridDiv);
        const gridMat = new THREE.MeshBasicMaterial({
            color: CONFIG.colorGrid,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = -60;
        scene.add(grid);

        // Particles
        const partGeo = new THREE.BufferGeometry();
        const count = 30000;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 2] = (Math.random() - 1.0) * 3000;
            sizes[i] = Math.random() * 2;
        }

        partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        partGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const partMat = new THREE.PointsMaterial({
            color: CONFIG.colorParticle,
            size: 0.8,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(partGeo, partMat);
        scene.add(particles);

        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambient);

        // Controller
        const controller = new MultiModalController({
            onHandUpdate: (left, right) => {
                if (right.active) {
                    stateRef.current.targetPos.x = (right.x - 0.5) * -CONFIG.sensitivity * 2;
                    stateRef.current.targetPos.y = (0.5 - right.y) * CONFIG.sensitivity * 2;
                    setRightHandPos(`${right.x.toFixed(2)}, ${right.y.toFixed(2)}`);
                } else {
                    setRightHandPos("WAITING...");
                }

                if (left.active) {
                    const throttleValue = Math.max(0, (0.5 - left.z) * 5);
                    stateRef.current.forwardMomentum = throttleValue;
                    setLeftHandPos(`${left.x.toFixed(2)}, ${left.y.toFixed(2)} [FLOW: ${throttleValue.toFixed(1)}]`);
                } else {
                    setLeftHandPos("WAITING...");
                }
            },
            onHeadUpdate: (head) => {
                stateRef.current.targetRot.y = (head.x - 0.5) * -0.5;
                stateRef.current.targetRot.x = (head.y - 0.5) * 0.5;
            },
            onVoiceUpdate: (level) => {
                stateRef.current.voiceLevel = level;
                setVoiceLevel(level);
            },
            onKeyUpdate: (keys) => {
                if (keys['w']) stateRef.current.targetPos.y += 2;
                if (keys['s']) stateRef.current.targetPos.y -= 2;
                if (keys['a']) stateRef.current.targetPos.x += 2;
                if (keys['d']) stateRef.current.targetPos.x -= 2;
                if (keys['Shift']) stateRef.current.forwardMomentum += 0.5;
            }
        });

        if (videoRef.current && canvasRef.current) {
            controller.initHands(videoRef.current, canvasRef.current).then(() => {
                setIsLoading(false);
            });
        }

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            stateRef.current.time += 0.01;

            camera.position.x += (stateRef.current.targetPos.x - camera.position.x) * CONFIG.lerpFactor;
            camera.position.y += (stateRef.current.targetPos.y - camera.position.y) * CONFIG.lerpFactor;

            camera.rotation.x += (stateRef.current.targetRot.x - camera.rotation.x) * CONFIG.rotationLerp;
            camera.rotation.y += (stateRef.current.targetRot.y - camera.rotation.y) * CONFIG.rotationLerp;

            const targetRoll = -camera.position.x * 0.01;
            camera.rotation.z += (targetRoll - camera.rotation.z) * 0.05;

            stateRef.current.currentSpeed = (CONFIG.baseSpeed + stateRef.current.forwardMomentum) * (1 + stateRef.current.voiceLevel * 5);

            const posAttr = particles.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;
            for (let i = 0; i < posArray.length; i += 3) {
                posArray[i + 2] += stateRef.current.currentSpeed * 10;

                if (posArray[i + 2] > 200) {
                    posArray[i + 2] = -2800;
                    posArray[i] = (Math.random() - 0.5) * 2000;
                    posArray[i + 1] = (Math.random() - 0.5) * 1000;
                }
            }
            posAttr.needsUpdate = true;

            grid.position.z = (camera.position.z + (stateRef.current.time * 1000) % 40) - 20;

            (particles.material as THREE.PointsMaterial).size = 0.8 + stateRef.current.voiceLevel * 10;
            (particles.material as THREE.PointsMaterial).color.setHSL(0.5 + Math.sin(stateRef.current.time) * 0.1, 1, 0.5 + stateRef.current.voiceLevel);

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [isScriptsLoaded]);

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"
                strategy="beforeInteractive"
            />
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
                strategy="afterInteractive"
                onLoad={() => setIsScriptsLoaded(true)}
            />

            <div className="fixed inset-0 bg-black overflow-hidden font-mono text-amber-500">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[100] bg-black text-center">
                        <div className="text-2xl tracking-[0.3em] mb-2 animate-pulse">INITIALIZING KYBER STREAM</div>
                        <div className="text-xs opacity-50 uppercase">Establishing Uplink...</div>
                    </div>
                )}

                <div ref={containerRef} className="absolute inset-0 z-1" />

                <div id="webcam-container" className="absolute bottom-5 left-5 w-60 h-44 border-2 border-amber-500/50 z-20 overflow-hidden bg-black/80 backdrop-blur-sm rounded-xl">
                    <video ref={videoRef} className="hidden" playsInline muted />
                    <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />
                </div>

                <div className="absolute top-5 left-5 z-10 pointer-events-none space-y-2">
                    <div className="bg-black/60 backdrop-blur-md border border-amber-500/20 p-5 rounded-2xl max-w-xs shadow-2xl">
                        <h1 className="text-lg font-black tracking-tighter border-b border-amber-500/20 pb-2 mb-3 italic">SUNGRID OS [v2.5]</h1>
                        <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between font-bold">
                                <span>PROTOCOL</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                                    KYBER_Active
                                </span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>LATENCY</span>
                                <span className="text-cyan-400">&lt; 5ms</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>INPUTS</span>
                                <span className="text-amber-400">HAND+VOICE+KB+MS</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span>VOICE_LVL</span>
                                <span className="text-cyan-400">{voiceLevel.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute top-5 right-5 z-10 pointer-events-none space-y-2">
                    <div className="bg-black/60 backdrop-blur-md border border-amber-500/20 p-5 rounded-2xl max-w-xs shadow-2xl">
                        <h1 className="text-sm font-black tracking-widest border-b border-amber-500/20 pb-2 mb-3">PARALLEL CONTROL</h1>
                        <div className="space-y-1 text-[10px] font-bold">
                            <div className="flex justify-between gap-4">
                                <span>L_HAND (NAV)</span>
                                <span className="text-cyan-400 text-right">{leftHandPos}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span>R_HAND (DEPTH)</span>
                                <span className="text-cyan-400 text-right">{rightHandPos}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-5 right-5 text-[8px] text-white/20 tracking-[0.5em] uppercase font-bold">
                    Secure Connection // Encrypted // 2048-Bit // Akshon Protocol
                </div>
            </div>
        </>
    );
}
