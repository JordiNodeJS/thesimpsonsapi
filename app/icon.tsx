import { ImageResponse } from "next/og";

// Image generation
export const runtime = "edge";

// Image metadata
export const alt = "The Simpsons API";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFD90F", // Simpsons Yellow
          borderRadius: "8px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Donut Body */}
          <circle cx="12" cy="12" r="9" fill="#EA4C89" stroke="#000" strokeWidth="0.5" />
          
          {/* Hole */}
          <circle cx="12" cy="12" r="3.5" fill="#FFD90F" stroke="#000" strokeWidth="0.5" />
          
          {/* Sprinkles (Small rectangles) */}
          <rect x="9" y="7" width="2" height="0.8" rx="0.4" fill="#60A5FA" transform="rotate(20 9 7)" />
          <rect x="14" y="6" width="2" height="0.8" rx="0.4" fill="#FBBF24" transform="rotate(-15 14 6)" />
          <rect x="16" y="10" width="2" height="0.8" rx="0.4" fill="#34D399" transform="rotate(45 16 10)" />
          <rect x="7" y="11" width="2" height="0.8" rx="0.4" fill="#FFFFFF" transform="rotate(-30 7 11)" />
          <rect x="10" y="16" width="2" height="0.8" rx="0.4" fill="#F87171" transform="rotate(-60 10 16)" />
          <rect x="15" y="15" width="2" height="0.8" rx="0.4" fill="#A78BFA" transform="rotate(10 15 15)" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
