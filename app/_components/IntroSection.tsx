"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";

export default function IntroSection() {
  const [isSkipped, setIsSkipped] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((err) => {
        console.log(
          "Audio autoplay failed. This is common in browsers until the user interacts with the page.",
          err
        );
      });
    }
  }, []);

  const handleSkip = () => {
    setIsSkipped(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-[#87CEEB] flex items-center justify-center">
      {/* Audio element for the Simpsons theme/choir */}
      <audio ref={audioRef} src="/sounds/intro.mp3" preload="auto" />

      {/* Skip Button */}
      {!isSkipped && (
        <Button
          onClick={handleSkip}
          variant="outline"
          className="absolute top-8 right-8 z-50 bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-md gap-2 font-black uppercase tracking-[0.2em] text-[10px] px-6 py-6 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          <SkipForward className="w-4 h-4" />
          Skip Intro
        </Button>
      )}

      {/* Animated Clouds Layer (Background) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-60"
            style={{
              top: `${10 + i * 12}%`,
              left: `${-20 + (i % 3) * 40}%`,
              animationName: isSkipped ? "none" : "cloud-drift",
              animationDuration: isSkipped ? "0s" : `${25 + i * 8}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDelay: isSkipped ? "0s" : `${i * -3}s`,
            }}
          >
            <svg width="240" height="140" viewBox="0 0 200 120" fill="white">
              <circle cx="50" cy="70" r="40" />
              <circle cx="90" cy="60" r="45" />
              <circle cx="130" cy="70" r="40" />
              <circle cx="90" cy="85" r="35" />
            </svg>
          </div>
        ))}
      </div>

      {/* Zooming Clouds (Foreground - The "Fly Through" effect) */}
      {!isSkipped && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="w-full h-full animate-[zoom-through_4s_ease-in-out_forwards] opacity-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="xMidYMid slice"
            >
              <filter id="blur-clouds">
                <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
              </filter>
              <g filter="url(#blur-clouds)" fill="white" opacity="1">
                <circle cx="200" cy="200" r="400" />
                <circle cx="800" cy="200" r="400" />
                <circle cx="500" cy="800" r="500" />
                <circle cx="100" cy="900" r="300" />
                <circle cx="900" cy="900" r="300" />
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* The Iconic Title */}
      <div
        className={`relative z-10 text-center px-4 ${
          isSkipped
            ? "opacity-100 scale-100"
            : "animate-[title-entrance_2s_ease-out_1s_both]"
        }`}
      >
        <div className="relative inline-block">
          {/* Sun in the corner */}
          <div className="absolute -top-20 -right-20 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />

          <h1
            className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-none"
            style={{
              color: "#FFD90F",
              WebkitTextStroke: "4px #0047AB",
              textShadow: `
                0 1px 0 #0047AB,
                0 2px 0 #0047AB,
                0 3px 0 #0047AB,
                0 4px 0 #0047AB,
                0 5px 0 #0047AB,
                0 6px 0 #0047AB,
                8px 8px 20px rgba(0,0,0,0.3)
              `,
              transform: "rotate(-3deg) skew(-5deg)",
            }}
          >
            Springfield <br />
            <span className="text-8xl md:text-[12rem] block mt-4">Life</span>
          </h1>
        </div>
        <div className={`mt-12 ${isSkipped ? "" : "animate-bounce"}`}>
          <Badge className="bg-yellow-500 text-black border-2 border-blue-800 px-8 py-3 text-xl rounded-full shadow-2xl font-bold">
            Welcome to the Neighborhood 🍩
          </Badge>
        </div>
      </div>
    </section>
  );
}
