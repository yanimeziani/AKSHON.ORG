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

        this.prevHandPos = { left: { x: 0.5, y: 0.5 }, right: { x: 0.5, y: 0.5 } };
        this.smoothState = {
            left: { x: 0.5, y: 0.5, z: 0, spread: 0 },
            right: { x: 0.5, y: 0.5, z: 0, spread: 0 },
            head: { x: 0.5, y: 0.5 }
        };
        this.smoothingFactor = 0.12;

        this.audioCtx = null;
        this.oscillator = null;
        this.gainNode = null;

        this.initKeyboard();
        this.initMouse();
        this.initVoice();
    }

    // BIOMIMETIC AUDIO COHERENCE
    initAudioSynth() {
        if (this.audioCtx) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(440, this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();
    }

    updateAudioCoherence(intensity, frequency) {
        if (!this.oscillator) return;
        // Map frequency to biomimetic scale (Harmonic Resonance)
        const targetFreq = 100 + frequency * 400;
        this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.1);
        // Intensity linked to spread and velocity
        const targetGain = Math.min(0.2, intensity * 0.1);
        this.gainNode.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
    }

    initKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.state.keys[e.key] = true;
            if (!this.audioCtx) this.initAudioSynth();
            this.onKeyUpdate(this.state.keys);
        });
        window.addEventListener('keyup', (e) => { this.state.keys[e.key] = false; this.onKeyUpdate(this.state.keys); });
    }

    initMouse() {
        window.addEventListener('mousedown', () => {
            if (!this.audioCtx) this.initAudioSynth();
            this.state.mouse.down = true;
        });
        window.addEventListener('mouseup', () => { this.state.mouse.down = false; });
    }

    async initVoice() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const vCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = vCtx.createAnalyser();
            const source = vCtx.createMediaStreamSource(stream);
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
        } catch (e) { console.warn("Mic off"); }
    }

    calculateSpread(landmarks) {
        const thumb = landmarks[4], pinky = landmarks[20], wrist = landmarks[0], mid = landmarks[9];
        const dist = Math.sqrt(Math.pow(thumb.x - pinky.x, 2) + Math.pow(thumb.y - pinky.y, 2));
        const scale = Math.sqrt(Math.pow(wrist.x - mid.x, 2) + Math.pow(wrist.y - mid.y, 2));
        return dist / (scale * 2);
    }

    drawChakra(ctx, x, y, hue, label, intensity) {
        const color = `hsla(${hue}, 80%, 60%, 1)`;
        const r = 10 + intensity * 25;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    async initHands(videoElement, canvasElement) {
        if (typeof Hands === 'undefined') return;
        const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 2, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
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

            if (results.multiHandLandmarks && results.multiHandedness) {
                let totalIntensity = 0;
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const label = results.multiHandedness[i].label;
                    const palm = landmarks[9];
                    const target = label === 'Left' ? this.state.leftHand : this.state.rightHand;
                    const smooth = label === 'Left' ? this.smoothState.left : this.smoothState.right;
                    const prev = label === 'Left' ? this.prevHandPos.left : this.prevHandPos.right;

                    smooth.x += (palm.x - smooth.x) * this.smoothingFactor;
                    smooth.y += (palm.y - smooth.y) * this.smoothingFactor;
                    smooth.z += (palm.z - smooth.z) * this.smoothingFactor;

                    const spr = this.calculateSpread(landmarks);
                    smooth.spread += (spr - smooth.spread) * this.smoothingFactor;

                    target.velocity = Math.sqrt(Math.pow(smooth.x - prev.x, 2) + Math.pow(smooth.y - prev.y, 2)) * 60;
                    prev.x = smooth.x; prev.y = smooth.y;
                    target.x = smooth.x; target.y = smooth.y; target.z = smooth.z; target.spread = smooth.spread;
                    target.active = true;
                    target.hue = (smooth.x * 150) + (smooth.y * 150) + (this.state.voiceLevel * 60);

                    totalIntensity += (target.velocity + target.spread);
                    this.drawChakra(canvasCtx, palm.x * canvasElement.width, palm.y * canvasElement.height, target.hue, label, target.spread);
                }

                // Update Global Audio Coherence
                if (results.multiHandLandmarks.length > 0) {
                    this.updateAudioCoherence(totalIntensity, this.state.rightHand.x);
                } else {
                    this.updateAudioCoherence(0, 0.5);
                }
            }
            canvasCtx.restore();
            this.onHandUpdate(this.state.leftHand, this.state.rightHand);
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
            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, frameRate: 60 } });
            videoElement.srcObject = stream; videoElement.play(); startCamera();
        } catch (e) { console.error("Cam fail"); }
    }
}
