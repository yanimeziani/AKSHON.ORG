'use client';

import { useEffect, useRef, forwardRef } from 'react';

interface CameraFeedProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
}

export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(({ onVideoReady }, ref) => {
  const innerRef = useRef<HTMLVideoElement>(null);

  // Combine refs if needed, or just use innerRef for logic
  // For simplicity, we'll use innerRef for internal logic and expose it via the forwarded ref if needed.
  // Actually, let's just use the forwarded ref if provided, or fallback to inner.
  // But forwardRef is tricky with internal logic. Let's just use a callback for "ready".

  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || innerRef;

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Browser does not support getUserMedia");
        return;
      }

      try {
        // Mobile-first: prefer back camera for "world view" or user for "selfie"?
        // Usually AR/MediaPipe implies user facing for face mesh, or environment for tracking.
        // Let's default to 'user' for face mesh interaction, but make it configurable if needed later.
        // 'facingMode: user' is standard for selfies.
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            // these are ideal constraints, mobile will adapt
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for metadata to load to ensure dimensions are known
          videoRef.current.onloadedmetadata = () => {
             videoRef.current?.play();
             onVideoReady?.(videoRef.current!);
          };
        }
      } catch (e) {
        console.error("Error accessing camera:", e);
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoReady, videoRef]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror for selfie mode
      playsInline
      muted
      autoPlay
    />
  );
});

CameraFeed.displayName = 'CameraFeed';
