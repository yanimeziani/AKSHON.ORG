import SungridDemo from "@/components/demos/SungridDemo";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sungrid // Akshon.org',
    description: 'Parallel Control Interface for Kyber Stream ingestion. Experience multimodal interaction with hand-tracking and voice reactivity.',
};

export default function SungridPage() {
    return <SungridDemo />;
}
