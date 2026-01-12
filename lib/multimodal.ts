"use client";

export type HandState = {
    x: number;
    y: number;
    z: number;
    active: boolean;
    hue: number;
    spread: number;
    velocity: number;
};

export type HeadState = {
    x: number;
    y: number;
    active: boolean;
};

export type MultiModalOptions = {
    onHandUpdate?: (left: HandState, right: HandState) => void;
    onVoiceUpdate?: (level: number) => void;
    onKeyUpdate?: (keys: Record<string, boolean>) => void;
    onMouseUpdate?: (mouse: { x: number; y: number; down: boolean }) => void;
    onHeadUpdate?: (head: HeadState) => void;
};

export class MultiModalController {
    onHandUpdate: (left: HandState, right: HandState) => void;
    onVoiceUpdate: (level: number) => void;
    onKeyUpdate: (keys: Record<string, boolean>) => void;
    onMouseUpdate: (mouse: { x: number; y: number; down: boolean }) => void;
    onHeadUpdate: (head: HeadState) => void;

    state: {
        leftHand: HandState;
        rightHand: HandState;
        head: HeadState;
        voiceLevel: number;
        keys: Record<string, boolean>;
        mouse: { x: number; y: number; down: boolean };
    };

    smoothState: {
        left: { x: number; y: number; z: number };
        right: { x: number; y: number; z: number };
        head: { x: number; y: number };
    };

    smoothingFactor: number = 0.12;

    constructor(options: MultiModalOptions = {}) {
        this.onHandUpdate = options.onHandUpdate || (() => { });
        this.onVoiceUpdate = options.onVoiceUpdate || (() => { });
        this.onKeyUpdate = options.onKeyUpdate || (() => { });
        this.onMouseUpdate = options.onMouseUpdate || (() => { });
        this.onHeadUpdate = options.onHeadUpdate || (() => { });

        this.state = {
            leftHand: { x: 0.5, y: 0.5, z: 0.5, active: false, hue: 140, spread: 0, velocity: 0 },
            rightHand: { x: 0.5, y: 0.5, z: 0.5, active: false, hue: 30, spread: 0, velocity: 0 },
            head: { x: 0.5, y: 0.5, active: false },
            voiceLevel: 0,
            keys: {},
            mouse: { x: 0, y: 0, down: false }
        };

        this.smoothState = {
            left: { x: 0.5, y: 0.5, z: 0.5 },
            right: { x: 0.5, y: 0.5, z: 0.5 },
            head: { x: 0.5, y: 0.5 }
        };

        if (typeof window !== "undefined") {
            this.initKeyboard();
            this.initMouse();
            this.initVoice();
        }
    }

    private initKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.state.keys[e.key] = true;
            this.onKeyUpdate(this.state.keys);
        });
        window.addEventListener('keyup', (e) => {
            this.state.keys[e.key] = false;
            this.onKeyUpdate(this.state.keys);
        });
    }

    private initMouse() {
        window.addEventListener('mousemove', (e) => {
            this.state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.onMouseUpdate(this.state.mouse);
        });
        window.addEventListener('mousedown', () => { this.state.mouse.down = true; });
        window.addEventListener('mouseup', () => { this.state.mouse.down = false; });
    }

    private async initVoice() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 128;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateVoice = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                this.state.voiceLevel = (sum / dataArray.length) / 255;
                this.onVoiceUpdate(this.state.voiceLevel);
                requestAnimationFrame(updateVoice);
            };
            updateVoice();
        } catch (e) {
            console.warn("Voice input not available", e);
        }
    }

    drawChakra(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string) {
        const r = 15 + Math.sin(Date.now() * 0.01) * 5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, color.replace('1)', '0.3)'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '8px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + r + 15);
    }

    async initHands(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
        const Hands = (window as any).Hands;
        if (typeof Hands === 'undefined') {
            console.error("MediaPipe Hands not loaded");
            return;
        }

        const hands = new Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.4,
            minTrackingConfidence: 0.4
        });

        const canvasCtx = canvasElement.getContext('2d');
        if (!canvasCtx) return;

        let isProcessing = false;

        hands.onResults((results: any) => {
            isProcessing = false;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            canvasCtx.globalAlpha = 0.3;
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalAlpha = 1.0;

            this.state.leftHand.active = false;
            this.state.rightHand.active = false;
            this.state.head.active = false;

            if (results.multiHandLandmarks && results.multiHandedness) {
                let avgX = 0, avgY = 0;

                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const label = results.multiHandedness[i].label;
                    const palm = landmarks[9];

                    const target = label === 'Left' ? this.state.leftHand : this.state.rightHand;
                    const smooth = label === 'Left' ? this.smoothState.left : this.smoothState.right;

                    // Calculate Velocity
                    const dx = palm.x - smooth.x;
                    const dy = palm.y - smooth.y;
                    target.velocity = Math.sqrt(dx * dx + dy * dy) * 10;

                    smooth.x += (palm.x - smooth.x) * this.smoothingFactor;
                    smooth.y += (palm.y - smooth.y) * this.smoothingFactor;
                    smooth.z += (palm.z - smooth.z) * this.smoothingFactor;

                    target.x = smooth.x;
                    target.y = smooth.y;
                    target.z = smooth.z;
                    target.active = true;

                    // Calculate Hue (based on X position)
                    target.hue = label === 'Left' ? 140 + (target.x * 40) : 30 + (target.x * 40);

                    // Calculate Spread (distance between thumb tip and pinky tip)
                    const thumb = landmarks[4];
                    const pinky = landmarks[20];
                    const dSx = thumb.x - pinky.x;
                    const dSy = thumb.y - pinky.y;
                    target.spread = Math.sqrt(dSx * dSx + dSy * dSy) * 2;

                    avgX += palm.x;
                    avgY += palm.y;

                    const color = label === 'Left' ? 'rgba(255, 170, 0, 1)' : 'rgba(0, 255, 255, 1)';
                    this.drawChakra(canvasCtx, palm.x * canvasElement.width, palm.y * canvasElement.height, color, `CHAKRA_${label.toUpperCase()}_PALM`);
                }

                if (results.multiHandLandmarks.length > 0) {
                    this.state.head.x = avgX / results.multiHandLandmarks.length;
                    this.state.head.y = (avgY / results.multiHandLandmarks.length) - 0.2;
                    this.state.head.active = true;

                    this.drawChakra(canvasCtx, this.state.head.x * canvasElement.width, this.state.head.y * canvasElement.height, 'rgba(255, 0, 255, 1)', 'CHAKRA_CROWN');
                    this.drawChakra(canvasCtx, 0.2 * canvasElement.width, 0.9 * canvasElement.height, 'rgba(255, 50, 50, 0.5)', 'CHAKRA_FOOT_L (SYNC)');
                    this.drawChakra(canvasCtx, 0.8 * canvasElement.width, 0.9 * canvasElement.height, 'rgba(255, 50, 50, 0.5)', 'CHAKRA_FOOT_R (SYNC)');
                }
            }
            canvasCtx.restore();

            this.onHandUpdate(this.state.leftHand, this.state.rightHand);
            if (this.state.head.active) this.onHeadUpdate(this.state.head);
        });

        const processFrame = async () => {
            if (!isProcessing && videoElement.readyState === 4) {
                isProcessing = true;
                await hands.send({ image: videoElement });
            }
            if ((videoElement as any).requestVideoFrameCallback) {
                (videoElement as any).requestVideoFrameCallback(processFrame);
            } else {
                requestAnimationFrame(processFrame);
            }
        };
        processFrame();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 60 } }
            });
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
            };
        } catch (e) {
            console.error("Camera failed", e);
        }
    }
}
