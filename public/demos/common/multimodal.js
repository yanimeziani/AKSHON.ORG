export class MultiModalController {
    constructor(options = {}) {
        this.onHandUpdate = options.onHandUpdate || (() => { });
        this.onVoiceUpdate = options.onVoiceUpdate || (() => { });
        this.onKeyUpdate = options.onKeyUpdate || (() => { });
        this.onMouseUpdate = options.onMouseUpdate || (() => { });
        this.onHeadUpdate = options.onHeadUpdate || (() => { });

        this.state = {
            leftHand: { x: 0.5, y: 0.5, z: 0, spread: 0, velocity: 0, active: false, hue: 0 },
            rightHand: { x: 0.5, y: 0.5, z: 0, spread: 0, velocity: 0, active: false, hue: 0 },
            head: { x: 0.5, y: 0.5, active: false },
            voiceLevel: 0,
            keys: {},
            mouse: { x: 0, y: 0, down: false }
        };

        this.prevHandPos = {
            left: { x: 0.5, y: 0.5 },
            right: { x: 0.5, y: 0.5 }
        };

        this.smoothState = {
            left: { x: 0.5, y: 0.5, z: 0, spread: 0 },
            right: { x: 0.5, y: 0.5, z: 0, spread: 0 },
            head: { x: 0.5, y: 0.5 }
        };
        this.smoothingFactor = 0.1; // Maximum biomimetic fluidity

        this.initKeyboard();
        this.initMouse();
        this.initVoice();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => { this.state.keys[e.key] = true; this.onKeyUpdate(this.state.keys); });
        window.addEventListener('keyup', (e) => { this.state.keys[e.key] = false; this.onKeyUpdate(this.state.keys); });
    }

    initMouse() {
        window.addEventListener('mousemove', (e) => {
            this.state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.onMouseUpdate(this.state.mouse);
        });
        window.addEventListener('mousedown', () => { this.state.mouse.down = true; });
        window.addEventListener('mouseup', () => { this.state.mouse.down = false; });
    }

    async initVoice() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            console.warn("Voice inactive");
        }
    }

    calculateSpread(landmarks) {
        // Distance between thumb tip (4) and pinky tip (20)
        const thumbTip = landmarks[4];
        const pinkyTip = landmarks[20];
        const dist = Math.sqrt(
            Math.pow(thumbTip.x - pinkyTip.x, 2) +
            Math.pow(thumbTip.y - pinkyTip.y, 2)
        );
        // Normalize by distance between wrist and middle finger base for scale invariance
        const wrist = landmarks[0];
        const middleBase = landmarks[9];
        const scale = Math.sqrt(Math.pow(wrist.x - middleBase.x, 2) + Math.pow(wrist.y - middleBase.y, 2));
        return dist / (scale * 2); // 0 to 1 approximate
    }

    drawChakra(ctx, x, y, hue, label, intensity) {
        const color = `hsla(${hue}, 80%, 60%, 1)`;
        const r = 10 + intensity * 20 + Math.sin(Date.now() * 0.005) * 5;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        grad.addColorStop(0, color);
        grad.addColorStop(0.3, color.replace('1)', '0.4)'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.8)`;
        ctx.lineWidth = 1 + intensity * 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        // Wave Spectrum Coherence Lines
        if (intensity > 0.5) {
            ctx.beginPath();
            ctx.moveTo(x - r * 2, y);
            ctx.lineTo(x + r * 2, y);
            ctx.stroke();
        }
    }

    async initHands(videoElement, canvasElement) {
        if (typeof Hands === 'undefined') return;

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        const canvasCtx = canvasElement.getContext('2d');
        let isProcessing = false;

        hands.onResults((results) => {
            isProcessing = false;
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.globalAlpha = 0.2;
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
                    const prev = label === 'Left' ? this.prevHandPos.left : this.prevHandPos.right;

                    // Update Smooth State
                    smooth.x += (palm.x - smooth.x) * this.smoothingFactor;
                    smooth.y += (palm.y - smooth.y) * this.smoothingFactor;
                    smooth.z += (palm.z - smooth.z) * this.smoothingFactor;

                    const currentSpread = this.calculateSpread(landmarks);
                    smooth.spread += (currentSpread - smooth.spread) * this.smoothingFactor;

                    // Movement Velocity Coherence
                    const dx = smooth.x - prev.x;
                    const dy = smooth.y - prev.y;
                    target.velocity = Math.sqrt(dx * dx + dy * dy) * 50;
                    prev.x = smooth.x;
                    prev.y = smooth.y;

                    target.x = smooth.x;
                    target.y = smooth.y;
                    target.z = smooth.z;
                    target.spread = smooth.spread;
                    target.active = true;

                    // Color Spectrum Mapping (Biomimetic HSL)
                    // Map X/Y position to visible spectrum (0-360 hue)
                    target.hue = (smooth.x * 120) + (smooth.y * 120) + (this.state.voiceLevel * 120);

                    avgX += palm.x;
                    avgY += palm.y;

                    this.drawChakra(canvasCtx, palm.x * canvasElement.width, palm.y * canvasElement.height, target.hue, label, target.spread);
                }

                // Head Resonance (Crown)
                if (results.multiHandLandmarks.length > 0) {
                    this.state.head.x = avgX / results.multiHandLandmarks.length;
                    this.state.head.y = (avgY / results.multiHandLandmarks.length) - 0.2;
                    this.state.head.active = true;
                    this.drawChakra(canvasCtx, this.state.head.x * canvasElement.width, this.state.head.y * canvasElement.height, 280, 'CROWN', this.state.voiceLevel);
                }
            }
            canvasCtx.restore();
            this.onHandUpdate(this.state.leftHand, this.state.rightHand);
            if (this.state.head.active) this.onHeadUpdate(this.state.head);
        });

        const startCamera = () => {
            const processFrame = async () => {
                if (!isProcessing && videoElement.readyState === 4) {
                    isProcessing = true;
                    hands.send({ image: videoElement });
                }
                if (videoElement.requestVideoFrameCallback) videoElement.requestVideoFrameCallback(processFrame);
                else requestAnimationFrame(processFrame);
            };
            processFrame();
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, frameRate: 60 }
            });
            videoElement.srcObject = stream;
            videoElement.play();
            startCamera();
        } catch (e) {
            console.error("Camera fail");
        }
    }
}
