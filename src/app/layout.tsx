import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice Kani - Voice-Enabled WaniKani Review System',
  description:
    'A voice-enabled review system for WaniKani that allows users to practice Japanese language learning through voice input and provides enhanced progress tracking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  try {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  } catch (error) {
    console.error('Error in root layout:', error);
    return (
      <html lang="en">
        <body>
          <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl text-red-600">Application failed to load</h1>
          </div>
        </body>
      </html>
    );
  }
}
