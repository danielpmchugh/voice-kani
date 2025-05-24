import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Voice-Enabled WaniKani Review System</h1>
      <p className="text-xl mb-8">
        A voice-enabled review system for WaniKani that allows users to practice Japanese language
        learning through voice input and provides enhanced progress tracking.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Voice Input</h2>
          <p>
            Practice your Japanese pronunciation while completing reviews using our voice
            recognition system.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Enhanced Dashboard</h2>
          <p>
            Track your progress with detailed analytics and visualizations to improve your learning
            experience.
          </p>
        </div>
      </div>
    </main>
  );
}
