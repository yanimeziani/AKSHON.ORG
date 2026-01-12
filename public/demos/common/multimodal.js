export class MultiModalController {
    constructor(options = {}) {
        this.onHandUpdate = options.onHandUpdate || (() => { });
        this.onVoiceUpdate = options.onVoiceUpdate || (() => { });
        this.onKeyUpdate = options.onKeyUpdate || (() => { });
        this.onMouseUpdate = options.onMouseUpdate || (() => { });

        this.state = {
            leftHand: { x: 0.5, y: 0.5, z: 0.5, active: false },
            rightHand: { x: 0.5, y: 0.5, z: 0.5, active: false },
            voiceLevel: 0,
            keys: {},
            mouse: { x: 0, y: 0, down: false }
        };

        // Internal smoothing state (Exponential Moving Average)
        this.smoothState = {
            left: { x: 0.5, y: 0.5, z: 0.5 },
            right: { x: 0.5, y: 0.5, z: 0.5 }
        };
        this.smoothingFactor = 0.25; // Lower = smoother, higher = faster

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
            analyser.fftSize = 128; // Smaller for speed
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

    async initHands(videoElement, canvasElement) {
        if (typeof Hands === 'undefined') return;

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        // Optimization: modelComplexity 0 is key for speed
        // Low resolution (320x240) and high framerate
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
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

            this.state.leftHand.active = false;
            this.state.rightHand.active = false;

            if (results.multiHandLandmarks && results.multiHandedness) {
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const label = results.multiHandedness[i].label; // "Left" or "Right"

                    if (typeof drawConnectors !== 'undefined') {
                        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                        drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });
                    }

                    const point = landmarks[9];
                    const target = label === 'Left' ? this.state.leftHand : this.state.rightHand;
                    const smooth = label === 'Left' ? this.smoothState.left : this.smoothState.right;

                    // Apply EMA Smoothing to reduce jitter
                    smooth.x += (point.x - smooth.x) * this.smoothingFactor;
                    smooth.y += (point.y - smooth.y) * this.smoothingFactor;
                    smooth.z += (point.z - smooth.z) * this.smoothingFactor;

                    target.x = smooth.x;
                    target.y = smooth.y;
                    target.z = smooth.z;
                    target.active = true;
                }
            }
            canvasCtx.restore();
            this.onHandUpdate(this.state.leftHand, this.state.rightHand);
        });

        const startCamera = () => {
            const processFrame = async () => {
                if (!isProcessing && videoElement.readyState === 4) {
                    isProcessing = true;
                    // Zero-latency optimization: don't await if we want to keep UI responsive, 
                    // but MediaPipe needs the result. The 'isProcessing' flag prevents stacking.
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

        // Start stream with performance-tuned constraints
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    frameRate: { ideal: 60 }
                }
            });
            videoElement.srcObject = stream;
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                startCamera();
            };
        } catch (e) {
            console.error("Camera access failed", e);
        }
    }
}
