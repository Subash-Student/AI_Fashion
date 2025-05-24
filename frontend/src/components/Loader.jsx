import React, { useEffect, useRef } from 'react';

const Loader = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio instance
    const audio = new Audio('/loading-sound.wav'); // Place your sound file in the public folder
    audio.loop = true;
    audio.volume = 0.7; // Adjust volume as needed
    audioRef.current = audio;

    // Play the sound
    audio
      .play()
      .catch((error) => {
        console.error("Autoplay failed:", error);
      });

    return () => {
      // Stop the sound when component unmounts
      audio.pause();
      audio.currentTime = 0; // Reset to start
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-300 rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
