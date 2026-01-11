'use client';

import { useState, useRef, useEffect } from 'react';
import { CameraFeed } from './CameraFeed';
import { ThreeOverlay } from './ThreeOverlay';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export default function VisionView() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });
        setLandmarker(faceLandmarker);
        setLoaded(true);
        console.log("MediaPipe FaceLandmarker loaded");
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
      }
    }
    initMediaPipe();
  }, []);

  // Process video frames
  useEffect(() => {
    if (!landmarker || !videoElement) return;

    let requestAnimationFrameId: number;
    let lastVideoTime = -1;

    function renderLoop() {
      if (videoElement && videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        // Perform detection
        const result = landmarker?.detectForVideo(videoElement, performance.now());
        // Here you would typically update the Three.js scene state (e.g. via a store or context)
        // For now, we just log occasionally or simply run it to prove it works.
        // console.log(result.faceLandmarks);
      }
      requestAnimationFrameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return () => {
      cancelAnimationFrame(requestAnimationFrameId);
    };
  }, [landmarker, videoElement]);

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-black">
      {/* Camera Layer */}
      <CameraFeed ref={videoRef} onVideoReady={setVideoElement} />

      {/* 3D Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          {/* pointer-events-none allows interaction with underlying elements if needed,
              but usually we want to interact with the 3D scene.
              If 3D controls are needed, remove pointer-events-none or put it on the canvas container specifically
              and ensure the canvas captures events.
           */}
          <div className="w-full h-full pointer-events-auto">
             <ThreeOverlay />
          </div>
      </div>

      {/* Loading Indicator */}
      {!loaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-white">
          <p>Loading Vision Models...</p>
        </div>
      )}
    </div>
  );
}
