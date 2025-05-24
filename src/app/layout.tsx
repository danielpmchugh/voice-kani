import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice Kani - Voice-Enabled WaniKani Review System',
  description:
    'A voice-enabled review system for WaniKani that allows users to practice Japanese language learning through voice input and provides enhanced progress tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
