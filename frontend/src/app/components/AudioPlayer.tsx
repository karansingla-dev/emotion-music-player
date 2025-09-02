"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title: string;
  artist: string;
}

export default function AudioPlayer({ src, title, artist }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Update progress
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const percent =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(percent || 0);
  };

  // Seek on progress bar click
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime =
      (parseFloat(e.target.value) / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  // Reset when track ends
  useEffect(() => {
    if (!audioRef.current) return;
    const handleEnded = () => setIsPlaying(false);
    audioRef.current.addEventListener("ended", handleEnded);
    return () =>
      audioRef.current?.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <div className="p-3 bg-white/20 backdrop-blur-lg rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-white font-semibold">{title}</p>
          <p className="text-sm text-gray-200">{artist}</p>
        </div>
        <button
          onClick={togglePlay}
          className="bg-yellow-400 text-black p-2 rounded-full hover:bg-yellow-300"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      {/* Progress bar */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleSeek}
        className="w-full accent-yellow-400 cursor-pointer"
      />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        preload="auto"
      />
    </div>
  );
}
