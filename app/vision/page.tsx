import VisionView from '@/components/vision/VisionView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vision | Akshon',
  description: 'Three.js and MediaPipe integration',
};

export default function VisionPage() {
  return (
    <main className="w-full h-dvh p-0 m-0 overflow-hidden">
      <VisionView />
    </main>
  );
}
