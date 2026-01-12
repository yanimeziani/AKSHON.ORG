export class MultiModalController {
    constructor(options = {}) {
        this.onHandUpdate = options.onHandUpdate || (() => { });
        this.onVoiceUpdate = options.onVoiceUpdate || (() => { });
        this.onKeyUpdate = options.onKeyUpdate || (() => { });
        this.onMouseUpdate = options.onMouseUpdate || (() => { });
        this.onHeadUpdate = options.onHeadUpdate || (() => { });

        this.state = {
            leftHand: { x: 0.5, y: 0.5, z: 0.5, active: false },
            rightHand: { x: 0.5, y: 0.5, z: 0.5, active: false },
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
        this.smoothingFactor = 0.12; // Ultra-smooth for flight protocol

        this.initKeyboard();
        this.initMouse();
        this.initVoice();
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.state.keys[e.key] = true;
            this.onKeyUpdate(this.state.keys);
        });
        window.addEventListener('keyup', (e) => {
            this.state.keys[e.key] = false;
            this.onKeyUpdate(this.state.keys);
        });
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
            console.warn("Voice input not available", e);
        }
    }

    drawChakra(ctx, x, y, color, label) {
        // Aesthetic Chakra Glow
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

    async initHands(videoElement, canvasElement) {
        if (typeof Hands === 'undefined') return;

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.4,
            minTrackingConfidence: 0.4
        });

        const canvasCtx = canvasElement.getContext('2d');
        let isProcessing = false;

        hands.onResults((results) => {
            isProcessing = false;

            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            // Subtle video background
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
                    const palm = landmarks[9]; // Middle finger MCP as palm/chakra center

                    const target = label === 'Left' ? this.state.leftHand : this.state.rightHand;
                    const smooth = label === 'Left' ? this.smoothState.left : this.smoothState.right;

                    smooth.x += (palm.x - smooth.x) * this.smoothingFactor;
                    smooth.y += (palm.y - smooth.y) * this.smoothingFactor;
                    smooth.z += (palm.z - smooth.z) * this.smoothingFactor;

                    target.x = smooth.x;
                    target.y = smooth.y;
                    target.z = smooth.z;
                    target.active = true;

                    avgX += palm.x;
                    avgY += palm.y;

                    // Draw Palm Chakras (2 of 5)
                    const color = label === 'Left' ? 'rgba(255, 170, 0, 1)' : 'rgba(0, 255, 255, 1)';
                    this.drawChakra(canvasCtx, palm.x * canvasElement.width, palm.y * canvasElement.height, color, `CHAKRA_${label.toUpperCase()}_PALM`);
                }

                // Head Chakra (3 of 5) - Crown/Sahasrara
                if (results.multiHandLandmarks.length > 0) {
                    this.state.head.x = avgX / results.multiHandLandmarks.length;
                    this.state.head.y = (avgY / results.multiHandLandmarks.length) - 0.2; // Offset for crown
                    this.state.head.active = true;

                    this.drawChakra(canvasCtx, this.state.head.x * canvasElement.width, this.state.head.y * canvasElement.height, 'rgba(255, 0, 255, 1)', 'CHAKRA_CROWN');

                    // Root/Base placeholders to complete 5 chakras (Ayurvedic extremities: Head, Hands, Feet)
                    // Visualized as projected resonance points at the bottom
                    this.drawChakra(canvasCtx, 0.2 * canvasElement.width, 0.9 * canvasElement.height, 'rgba(255, 50, 50, 0.5)', 'CHAKRA_FOOT_L (SYNC)');
                    this.drawChakra(canvasCtx, 0.8 * canvasElement.width, 0.9 * canvasElement.height, 'rgba(255, 50, 50, 0.5)', 'CHAKRA_FOOT_R (SYNC)');
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
                if (videoElement.requestVideoFrameCallback) {
                    videoElement.requestVideoFrameCallback(processFrame);
                } else {
                    requestAnimationFrame(processFrame);
                }
            };
            processFrame();
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 60 } }
            });
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                startCamera();
            };
        } catch (e) {
            console.error("Camera failed", e);
        }
    }
}
